// HTTP-level security regression test (Phase 10 production-readiness audit).
//
// The other three suites in this directory test the neonStore.js /
// cashfreeOrderOutcome.js / cashfreeRefundOutcome.js primitives directly.
// This suite instead starts the real Express app (server/index.js) and
// drives it over real HTTP, because the properties being verified here live
// in the route handlers and the auth middleware themselves, not in the
// storage primitives:
//
//   1. merchant A cannot refund (or otherwise reach) merchant B's transaction
//   2. merchant A cannot see merchant B's customers
//   3. an invalid/garbage session cookie is rejected, not silently ignored
//   4. a deleted (logged-out) session is rejected, not treated as valid
//   5. an invalid/garbage API key is rejected
//   6. a valid API key resolves only to its own merchant's data
//   7. a "not found" response for another merchant's resource does not leak
//      whether the resource exists, and error responses never echo
//      configuration/secret-shaped strings
//
// Run with: node server/tests/apiSecurity.test.mjs
// (Also wired into `npm test`.)
//
// Uses the project's local file-store persistence (no DATABASE_URL) —
// consistent with the other suites in this directory. NODE_ENV is set to
// 'test' (not 'production'), so the app takes its normal local-development
// code paths (no DB required, local dev checkout-secret fallback applies).

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4519 + (crypto.randomInt(0, 400));

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';
// Deliberately unconfigured: this suite tests authorization boundaries, not
// the Cashfree integration, and must never make a real network call to
// Cashfree (whatever sandbox credentials happen to be in the local .env).
// Set (not deleted!) to '' — server/index.js loads `dotenv/config` on
// import, which only fills in variables that are not already present in
// process.env, so an empty string here (unlike `delete`) survives that load
// and keeps cashfreeCredentials() falsy, making the refund route's own
// credential check short-circuit before it would ever reach out to Cashfree.
process.env.CASHFREE_APP_ID = '';
process.env.CASHFREE_SECRET_KEY = '';
// Same reasoning, for the Phase 10.8C Cashfree Partner status route test
// below: this suite must never make a real Cashfree Partner API call either.
process.env.CASHFREE_PARTNER_API_KEY = '';

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
  console.log('API security / authorization regression test');
  console.log('');

  await waitForServer();

  const emailA = `sectest.a.${RUN_ID}@example.com`;
  const emailB = `sectest.b.${RUN_ID}@example.com`;
  const { cookie: cookieA, merchantId: merchantIdA } = await signUp(emailA);
  const { cookie: cookieB, merchantId: merchantIdB } = await signUp(emailB);

  // Seed a real, merchant-A-owned transaction and customer the same way the
  // Cashfree webhook does in production (via the real store module, in the
  // same process — the local dev store is a shared in-memory singleton).
  const { saveResource } = await import('../neonStore.js');
  const txId = `qv_cf_sectest_${RUN_ID}`;
  const customerEmail = `sectest.customer.${RUN_ID}@example.com`;
  await saveResource(merchantIdA, 'transaction', {
    id: txId, provider: 'cashfree', amount: 499, currency: 'INR', status: 'succeeded',
    customerEmail, customerName: 'Customer', productName: 'Security Test Product',
    paymentMethod: 'cashfree', fee: 0, net: 499, country: 'IN', createdAt: new Date().toISOString()
  });
  await saveResource(merchantIdA, 'customer', {
    id: `cus_sectest_${RUN_ID}`, name: 'Customer', email: customerEmail, country: 'IN', totalSpent: 499, subscriptions: 0, lastActive: new Date().toISOString()
  });

  await test('1: merchant B cannot refund merchant A\'s transaction (404, existence not leaked)', async () => {
    const res = await fetch(`${BASE}/api/v1/payments/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieB },
      body: JSON.stringify({ transactionId: txId })
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await test('1b: merchant A can reach their own transaction (blocked later only by missing Cashfree credentials, never a 404)', async () => {
    const res = await fetch(`${BASE}/api/v1/payments/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieA },
      body: JSON.stringify({ transactionId: txId })
    });
    // Cashfree credentials are deliberately unset in this suite (see top of
    // file), so the owning merchant's request must get all the way past the
    // ownership + status checks and fail only on the credentials check —
    // never the 404 a non-owner gets.
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.match(body.error, /Cashfree credentials/i);
  });

  await test('2: merchant B cannot see merchant A\'s customers', async () => {
    const res = await fetch(`${BASE}/api/v1/customers`, { headers: { Cookie: cookieB } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(!body.customers.some((c) => c.email === customerEmail), 'merchant B\'s customer list must not contain merchant A\'s customer');
  });

  await test('2b: merchant A can see their own customer', async () => {
    const res = await fetch(`${BASE}/api/v1/customers`, { headers: { Cookie: cookieA } });
    const body = await res.json();
    assert.ok(body.customers.some((c) => c.email === customerEmail));
  });

  await test('3: an invalid/garbage session cookie is rejected, not treated as authenticated', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, { headers: { Cookie: 'qivropay_session=not-a-real-session-token' } });
    assert.equal(res.status, 401);
  });

  await test('4: a deleted (logged-out) session is rejected on the next request', async () => {
    const { cookie } = await signUp(`sectest.logout.${RUN_ID}@example.com`);
    const logoutRes = await fetch(`${BASE}/api/v1/auth/logout`, { method: 'POST', headers: { Cookie: cookie } });
    assert.equal(logoutRes.status, 200);
    const afterLogout = await fetch(`${BASE}/api/v1/products`, { headers: { Cookie: cookie } });
    assert.equal(afterLogout.status, 401, 'a session token that has been logged out must no longer authenticate');
  });

  await test('5: an invalid/garbage API key is rejected', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, { headers: { Authorization: 'Bearer qivro_live_not_a_real_key' } });
    assert.equal(res.status, 401);
  });

  await test('6: a valid API key resolves only to its own merchant\'s data', async () => {
    // 'test' (not 'live'): this suite runs with NODE_ENV=test and no
    // CASHFREE_ENV set, so resolveCashfreeEnvironment() resolves to
    // 'sandbox' — a 'live' key would now be rejected by the API key
    // test/live enforcement in server/index.js (see
    // apiKeyEnvTest.test.mjs), which is the behavior this test is not
    // trying to exercise.
    const genRes = await fetch(`${BASE}/api/v1/keys/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieA },
      body: JSON.stringify({ name: 'Security test key', environment: 'test' })
    });
    assert.equal(genRes.status, 201);
    const { apiKey } = await genRes.json();
    assert.ok(apiKey.key, 'the full key must be returned exactly once, at creation');

    const txRes = await fetch(`${BASE}/api/v1/transactions`, { headers: { Authorization: `Bearer ${apiKey.key}` } });
    assert.equal(txRes.status, 200);
    const txBody = await txRes.json();
    assert.ok(txBody.transactions.some((t) => t.id === txId), 'the API key must resolve to the merchant that owns it and see its own transaction');
  });

  await test('8: GET /api/v1/merchant/cashfree-partner-status reports "not started" for a merchant with no Cashfree mapping', async () => {
    const res = await fetch(`${BASE}/api/v1/merchant/cashfree-partner-status`, { headers: { Cookie: cookieB } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.started, false);
  });

  await test('8b: merchant B can never see merchant A\'s Cashfree mapping/status through this route, and cannot supply an arbitrary cf_merchant_id', async () => {
    const { createPartnerMerchantMapping } = await import('../neonStore.js');
    const cfMerchantId = `qv_sectest_cf_${RUN_ID}`;
    await createPartnerMerchantMapping({ merchantId: merchantIdA, cfMerchantId });

    // Merchant A now has a mapping. CASHFREE_PARTNER_API_KEY is blanked for
    // this whole suite (see top of file), so the route's own Cashfree call
    // fails fast on a missing-credential error without ever reaching the
    // network — a deterministic, offline-safe way to exercise the route
    // while still proving merchant B never sees merchant A's cf_merchant_id.
    const resA = await fetch(`${BASE}/api/v1/merchant/cashfree-partner-status`, { headers: { Cookie: cookieA } });
    // HTTP 200 (not 502) even though the underlying Cashfree call failed —
    // see the comment on this route in server/index.js: the frontend's
    // safeFetch() helper discards the body of any non-2xx response, which
    // would silently lose the last-known status this route exists to
    // preserve. success:false + stale:true is how a caller detects this.
    assert.equal(resA.status, 200);
    const bodyA = await resA.json();
    assert.equal(bodyA.success, false);
    assert.equal(bodyA.started, true);
    assert.equal(bodyA.stale, true);
    assert.equal(bodyA.lastKnownStatus.cfMerchantId, cfMerchantId);

    // Merchant B still has no mapping of their own — the route derives the
    // Cashfree merchant to look up purely from the authenticated session
    // (req.user.id), never from any client-supplied value, so attempting to
    // smuggle merchant A's cf_merchant_id in via query string does nothing.
    const resB = await fetch(`${BASE}/api/v1/merchant/cashfree-partner-status?cfMerchantId=${encodeURIComponent(cfMerchantId)}&cf_merchant_id=${encodeURIComponent(cfMerchantId)}`, { headers: { Cookie: cookieB } });
    assert.equal(resB.status, 200);
    const bodyB = await resB.json();
    assert.equal(bodyB.started, false, "merchant B must still see 'not started', never merchant A's mapping");
  });

  await test('9: POST /api/v1/merchant/cashfree-partner/onboard rejects missing required profile fields (400), without ever calling Cashfree', async () => {
    const res = await fetch(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieB },
      body: JSON.stringify({})
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await test('9b: a valid onboarding request that cannot reach Cashfree (blank credentials in this suite) fails as a clean sanitized 502, and creates no mapping', async () => {
    const res = await fetch(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieB },
      body: JSON.stringify({ pocPhone: '+91 90000 00000', merchantSiteUrl: 'https://sectest-merchant.example.com' })
    });
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.success, false);
    // The literal env var NAME (not a secret) is expected in this error —
    // see the "CASHFREE_PARTNER_API_KEY is not configured" message in
    // cashfreePartner.js (Phase 10.8A). What must never appear is an actual
    // credential value; there is none configured in this suite to check
    // against, so this test only asserts the response shape/status here.

    const statusRes = await fetch(`${BASE}/api/v1/merchant/cashfree-partner-status`, { headers: { Cookie: cookieB } });
    const statusBody = await statusRes.json();
    assert.equal(statusBody.started, false, 'a failed onboarding attempt must not leave a partial mapping behind');
  });

  await test('9c: merchant isolation — merchant B\'s (failed) onboarding attempt never touches merchant A\'s existing Cashfree mapping', async () => {
    const beforeRes = await fetch(`${BASE}/api/v1/merchant/cashfree-partner-status`, { headers: { Cookie: cookieA } });
    const before = await beforeRes.json();

    await fetch(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieB },
      body: JSON.stringify({ pocPhone: '+91 90000 00001', merchantSiteUrl: 'https://sectest-merchant-b.example.com' })
    });

    const afterRes = await fetch(`${BASE}/api/v1/merchant/cashfree-partner-status`, { headers: { Cookie: cookieA } });
    const after = await afterRes.json();
    assert.deepEqual(after.lastKnownStatus, before.lastKnownStatus, "merchant A's mapping must be byte-for-byte unaffected by merchant B's onboarding attempt");
  });

  await test('7: error responses do not echo configuration/secret-shaped strings', async () => {
    const res = await fetch(`${BASE}/api/v1/payments/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieA },
      body: JSON.stringify({ transactionId: 'does_not_exist_at_all' })
    });
    const text = await res.text();
    for (const forbidden of ['CASHFREE_SECRET_KEY', 'DATABASE_URL', 'QIVROPAY_SESSION_SECRET', 'postgres://', 'at Object.<anonymous>', '.js:']) {
      assert.ok(!text.includes(forbidden), `error response must never contain "${forbidden}": ${text}`);
    }
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
