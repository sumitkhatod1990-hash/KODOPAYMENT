// Live payment approval gate (Phase 10.7A safety cleanup).
//
// QivroPay has no real KYC/Cashfree-onboarding review yet. Before this
// change, a brand-new merchant could complete the two-step onboarding
// wizard and immediately create a real Cashfree checkout session the moment
// this server is configured with CASHFREE_ENV=production — with zero
// review. requireLiveActivationIfProduction() in server/index.js now blocks
// that by default; only a merchant with merchant_profile.liveActivatedAt set
// (via server/scripts/activate-merchant-live.js, run manually by an
// operator — there is no API route for this) may create a live checkout
// session or Cashfree order. Sandbox must remain completely unrestricted so
// local development and pre-launch testing keep working.
//
// Runs a single process with CASHFREE_ENV=production (NODE_ENV stays 'test'
// so the local file-store fallback applies — see apiKeyEnvProduction.test.mjs
// for why this combination is safe to use in a test).
//
// Run with: node server/tests/liveApprovalGate.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 5719 + (crypto.randomInt(0, 400));

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
  const cookie = cookieFrom(res);
  const body = await res.json();
  return { cookie, merchantId: body.user.id };
}

async function run() {
  console.log('Live payment approval gate');
  console.log('');

  await waitForServer();

  const { cookie, merchantId } = await signUp(`livegate.${RUN_ID}@example.com`);

  await test('an unactivated new merchant cannot create a live checkout session', async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ amount: 250, title: 'Widget' })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.errorCode, 'LIVE_PAYMENTS_NOT_ACTIVATED');
    assert.match(body.error, /aren't activated/i);
    assert.doesNotMatch(body.error, /KYC approved|Cashfree approved/i);
  });

  await test('an unactivated new merchant cannot check payment infrastructure (would create a real live order)', async () => {
    const res = await fetch(`${BASE}/api/v1/india/cashfree/verify-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({})
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.errorCode, 'LIVE_PAYMENTS_NOT_ACTIVATED');
  });

  await test('after activation (server/scripts/activate-merchant-live.js path), the same merchant can create a live checkout session', async () => {
    // Exercises the exact same write the CLI script performs, without
    // shelling out to it — saveResource() is the same call the script makes.
    const { saveResource } = await import('../neonStore.js');
    await saveResource(merchantId, 'merchant_profile', {
      id: 'default', businessName: 'Test Co', supportEmail: '', onboardingCompletedAt: new Date().toISOString(),
      liveActivatedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });

    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ amount: 250, title: 'Widget' })
    });
    assert.equal(res.status, 201, 'an explicitly activated merchant must be able to create a live checkout session');
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
