// Regression test for a Phase 10 production-readiness finding: several real
// V1 routes in server/index.js were `async (req, res) => { await ...; }`
// handlers with no try/catch. Express 4 does not catch a rejected promise
// returned by an async route handler — it becomes an unhandled promise
// rejection on the process itself, and modern Node (15+, this project
// targets Node 20 per the Dockerfile) terminates the whole process on an
// unhandled rejection by default. A single transient database/network error
// on any of those routes — including two public, customer-facing checkout
// routes (GET /api/v1/payments/session/:id and POST
// /api/v1/india/cashfree/create-order) — would have crashed the entire
// server for every merchant, not just failed the one request.
//
// Fix: server/index.js now wraps every previously-unguarded async route in
// an `ah()` helper that forwards a rejection to Express's error-handling
// middleware (also added), which logs the real error server-side and
// responds with a generic message. There's also a top-level
// `process.on('unhandledRejection', ...)` as defense in depth.
//
// This test proves the fix at the level that actually matters: it spawns a
// real child Node process running the exact `ah()` + error-middleware
// pattern now used in server/index.js, drives a request that rejects inside
// the handler, and asserts (a) the response is a clean generic 500 and (b)
// the process is still alive and serving traffic afterward — i.e. the exact
// failure mode reproduced (and confirmed) against the pre-fix code during
// the audit does not happen anymore.
//
// Deliberately does not import server/index.js itself: this suite isolates
// the crash-safety *mechanism*, independent of the database/Cashfree
// configuration server/index.js needs to boot in a given environment.
//
// Run with: node server/tests/asyncCrashSafety.test.mjs

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const results = { passed: 0, failed: 0 };

async function test(name, fn) {
  try {
    await fn();
    results.passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    results.failed += 1;
    console.error(`  FAIL - ${name}`);
    console.error(`    ${err.message}`);
  }
}

const PORT = 4870 + Math.floor(Math.random() * 300);

// Verbatim copy of the pattern added to server/index.js: the ah() wrapper,
// the top-level unhandledRejection log, and the final 4-arg error middleware.
const serverScript = `
import express from ${JSON.stringify(path.join(process.cwd(), 'node_modules', 'express', 'index.js'))};
const app = express();
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
process.on('unhandledRejection', (reason) => { console.error('Unhandled promise rejection', reason); });
app.get('/api/v1/health', (req, res) => res.json({ success: true }));
app.get('/boom', ah(async (req, res) => {
  // Mirrors a real route: an unguarded await on something that rejects
  // (e.g. a transient Neon/Postgres error).
  await Promise.reject(new Error('simulated database connection error — must never reach the client'));
  res.json({ success: true });
}));
app.use((err, req, res, next) => {
  console.error('caught:', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: 'An unexpected error occurred. Please try again.' });
});
app.listen(${PORT}, () => console.log('READY'));
`;

const dir = mkdtempSync(path.join(tmpdir(), 'qivropay-crash-safety-'));
const scriptPath = path.join(dir, 'server.mjs');
writeFileSync(scriptPath, serverScript, 'utf8');

async function waitForReady(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server did not become ready in time')), 5000);
    child.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('READY')) { clearTimeout(timeout); resolve(); }
    });
    child.on('exit', (code) => { clearTimeout(timeout); reject(new Error(`server exited early with code ${code}`)); });
  });
}

async function run() {
  console.log('Async route crash-safety regression test');
  console.log('');

  const child = spawn(process.execPath, [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });
  let exited = false;
  child.on('exit', () => { exited = true; });

  try {
    await waitForReady(child);
    const BASE = `http://127.0.0.1:${PORT}`;

    await test('a rejected promise inside an ah()-wrapped route returns a clean generic 500, not a hang or a leaked error', async () => {
      const res = await fetch(`${BASE}/boom`);
      assert.equal(res.status, 500);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(!body.error.includes('simulated database connection error'), 'the real error message must never reach the client');
    });

    await test('the process is still alive after the rejection (this is the actual regression: it used to crash here)', async () => {
      assert.equal(exited, false, 'the child process must not have exited');
      const res = await fetch(`${BASE}/api/v1/health`);
      assert.equal(res.status, 200, 'the server must still be serving other traffic after the rejection');
    });
  } finally {
    child.kill();
  }

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
