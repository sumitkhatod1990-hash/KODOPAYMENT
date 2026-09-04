// API key test/live enforcement — sandbox-mode half (Phase 10.7A).
//
// CASHFREE_ENVIRONMENT is resolved once, at module import time, from
// CASHFREE_ENV/NODE_ENV — it cannot change within a running process. So the
// two required environments are tested from two separate processes (this
// file and apiKeyEnvProduction.test.mjs), each importing server/index.js
// fresh with different env vars set beforehand, matching the pattern used by
// apiSecurity.test.mjs.
//
// This half runs with CASHFREE_ENV unset and NODE_ENV=test, so
// resolveCashfreeEnvironment() resolves to 'sandbox' (see server/index.js).
// It verifies:
//   1. a 'test' API key is allowed while the server runs in sandbox mode
//   4. a 'live' API key is rejected while the server runs in sandbox mode
//   5. the rejection cannot be bypassed via request body/header/query params
//
// Run with: node server/tests/apiKeyEnvSandbox.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4919 + (crypto.randomInt(0, 400));

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.CASHFREE_ENV;
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';
process.env.CASHFREE_APP_ID = '';
process.env.CASHFREE_SECRET_KEY = '';

const BASE = `http://127.0.0.1:${PORT}`;
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

function cookieFrom(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()[0]
    : res.headers.get('set-cookie');
  if (!raw) throw new Error('Response did not set a session cookie');
  return raw.split(';')[0];
}

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/v1/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Server did not become healthy in time');
}

async function signUp(email) {
  const res = await fetch(`${BASE}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'correct horse battery staple 1', name: 'Test Merchant', company: 'Test Co' })
  });
  assert.equal(res.status, 201, `signup should succeed for ${email}`);
  return cookieFrom(res);
}

async function generateKey(cookie, environment) {
  const res = await fetch(`${BASE}/api/v1/keys/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ name: `${environment} key`, environment })
  });
  assert.equal(res.status, 201);
  const { apiKey } = await res.json();
  return apiKey.key;
}

async function run() {
  console.log('API key test/live enforcement — sandbox mode');
  console.log('');

  await waitForServer();

  const healthBody = await (await fetch(`${BASE}/api/v1/health`)).json();
  console.log(`  (server environment check: NODE_ENV=${healthBody.environment})`);

  const cookie = await signUp(`envtest.sandbox.${RUN_ID}@example.com`);
  const testKey = await generateKey(cookie, 'test');
  const liveKey = await generateKey(cookie, 'live');

  await test('1: test key + sandbox server = allowed', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${testKey}` } });
    assert.equal(res.status, 200);
  });

  await test('4: live key + sandbox server = rejected (403, not silently downgraded)', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${liveKey}` } });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await test('5a: no bypass via query parameter', async () => {
    const res = await fetch(`${BASE}/api/v1/products?environment=sandbox&cashfreeEnvironment=sandbox`, { headers: { Authorization: `Bearer ${liveKey}` } });
    assert.equal(res.status, 403, 'a query parameter must not override the key\'s stored environment');
  });

  await test('5b: no bypass via custom header', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${liveKey}`, 'X-Cashfree-Environment': 'sandbox', 'X-Environment': 'test' } });
    assert.equal(res.status, 403, 'a request header must not override the key\'s stored environment');
  });

  await test('5c: no bypass via request body on a POST route', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${liveKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bypass attempt', price: 1, environment: 'sandbox', cashfreeEnvironment: 'sandbox' })
    });
    assert.equal(res.status, 403, 'a request body field must not override the key\'s stored environment');
  });

  // Live payment approval gate (item 5) is only meant to block *production*
  // Cashfree traffic — sandbox testing must never be restricted, or local
  // development and pre-launch QA would break.
  await test('live payment gate does not restrict sandbox: an unactivated new merchant can still create a sandbox checkout session', async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ amount: 100, title: 'Sandbox test product' })
    });
    assert.equal(res.status, 201, 'sandbox checkout-session creation must never require live activation');
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
