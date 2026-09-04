// API key test/live enforcement — production-mode half (Phase 10.7A).
//
// See apiKeyEnvSandbox.test.mjs for why this is split across two processes.
// This half runs with CASHFREE_ENV=production explicitly (NODE_ENV stays
// 'test' so the local file-store/dev-secret fallbacks still apply — only
// CASHFREE_ENVIRONMENT itself needs to be 'production' here). It verifies:
//   2. a 'live' API key is allowed while the server runs in production mode
//   3. a 'test' API key is rejected while the server runs in production mode
//
// Run with: node server/tests/apiKeyEnvProduction.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 5319 + (crypto.randomInt(0, 400));

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
process.env.CASHFREE_ENV = 'production';
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
  console.log('API key test/live enforcement — production mode');
  console.log('');

  await waitForServer();

  const cookie = await signUp(`envtest.production.${RUN_ID}@example.com`);
  const testKey = await generateKey(cookie, 'test');
  const liveKey = await generateKey(cookie, 'live');

  await test('2: live key + production server = allowed', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${liveKey}` } });
    assert.equal(res.status, 200);
  });

  await test('3: test key + production server = rejected (403, not silently allowed)', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${testKey}` } });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // Live payment approval gate (item 5): a brand-new merchant, even holding
  // a valid 'live' key, must not be able to create a real checkout session
  // in production without being explicitly activated first.
  await test('live payment gate: an unactivated merchant cannot create a live checkout session', async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ amount: 100, title: 'Test product' })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.errorCode, 'LIVE_PAYMENTS_NOT_ACTIVATED');
    assert.match(body.error, /aren't activated/i);
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
