// HTTP-level regression test for POST /api/v1/merchant/cashfree-partner/onboard
// (Phase 10.8E). Boots the real Express app (server/index.js) on its own
// port, same pattern as apiSecurity.test.mjs, but — unlike that suite —
// keeps a (fake) CASHFREE_PARTNER_API_KEY configured and stubs global.fetch
// so a request that reaches this route actually proceeds through to a
// simulated Cashfree Partner API call, letting these tests assert on what
// this route sends Cashfree and what it sends back to the browser.
//
// This suite exists because two real bugs were found by manually running
// this exact route against the live api-sandbox.cashfree.com Partner API
// during Phase 10.8E, neither of which the existing unit tests (which drive
// createOrLinkCashfreeMerchant() directly, bypassing this HTTP route's own
// logic) could have caught:
//
//   1. A phone number typed in any natural format ("+91 98765 43210") was
//      sent to Cashfree byte-for-byte and rejected with Cashfree's own
//      "Validation failed for phone number on 'MerchantPhone'" — Cashfree's
//      poc_phone only accepts a plain 10-digit string. This route now
//      normalizes before sending.
//   2. A successful creation's HTTP response never included `started: true`
//      — the frontend's normalizeCashfreePartnerStatus() (AppContext.tsx)
//      treats a response with no `started` key as not-started, so a
//      genuinely successful Cashfree merchant creation rendered as "not
//      started" until the next unrelated status refresh.
//
// Run with: node server/tests/cashfreePartnerOnboardRoute.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4919 + (crypto.randomInt(0, 400));

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';
process.env.CASHFREE_APP_ID = '';
process.env.CASHFREE_SECRET_KEY = '';
process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_onboard_route_suite';

const BASE = `http://127.0.0.1:${PORT}`;
const REAL_FETCH = globalThis.fetch;

const results = { passed: 0, failed: 0 };

async function test(name, fn) {
  try {
    await fn();
    results.passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    results.failed += 1;
    console.error(`  FAIL - ${name}`);
    console.error(`    ${err.stack || err.message}`);
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
      const res = await REAL_FETCH(`${BASE}/api/v1/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Server did not become healthy in time');
}

async function signUp(email, company) {
  const res = await REAL_FETCH(`${BASE}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'correct horse battery staple 1', name: 'Test Merchant', company })
  });
  assert.equal(res.status, 201, `signup should succeed for ${email}`);
  const cookie = cookieFrom(res);
  const body = await res.json();
  return { cookie, merchantId: body.user.id };
}

// Routes exactly two kinds of traffic while active: calls to this suite's
// own Express server pass straight through to the real fetch; everything
// else (the Cashfree Partner API) is served by `cashfreeHandler`, so a test
// can inspect exactly what this route sent Cashfree.
function withCashfreeStub(cashfreeHandler, fn) {
  return async () => {
    const calls = [];
    globalThis.fetch = async (url, opts) => {
      if (String(url).startsWith(BASE)) return REAL_FETCH(url, opts);
      calls.push({ url: String(url), method: (opts?.method || 'GET').toUpperCase(), body: opts?.body ? JSON.parse(opts.body) : null });
      return cashfreeHandler(url, opts);
    };
    try {
      await fn(calls);
    } finally {
      globalThis.fetch = REAL_FETCH;
    }
  };
}

function cfJson(body, status = 200) {
  return async () => new Response(JSON.stringify(body), { status });
}

async function run() {
  console.log('Cashfree Partner onboard route — HTTP-level regression test');
  console.log('');

  await waitForServer();

  await test(
    '1: a naturally-formatted phone number ("+91 98765 43210") is normalized to a plain 10-digit string before reaching Cashfree',
    withCashfreeStub(
      async (url, opts) => {
        const method = (opts?.method || 'GET').toUpperCase();
        if (method === 'POST' && String(url).endsWith('/merchants')) return new Response(JSON.stringify({ merchant_id: 'placeholder' }), { status: 200 });
        return new Response(JSON.stringify({ onboarding_status: 'Created', product_status: [] }), { status: 200 });
      },
      async (calls) => {
        const { cookie } = await signUp(`onboardroute.a.${RUN_ID}@example.com`, 'Route Test Co');
        const res = await REAL_FETCH(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ pocPhone: '+91 98765 43210', merchantSiteUrl: 'https://route-test.example.com' })
        });
        assert.equal(res.status, 201);
        const created = calls.find((c) => c.method === 'POST' && c.url.endsWith('/merchants'));
        assert.ok(created, 'must have called POST /merchants');
        assert.equal(created.body.poc_phone, '9876543210', 'a "+91 98765 43210" input must reach Cashfree as a plain 10-digit string');
      }
    )
  );

  await test('2: a phone number that cannot be normalized to 10 digits is rejected with 400 and never reaches Cashfree', async () => {
    let fetchCalled = false;
    globalThis.fetch = async (url, opts) => {
      if (String(url).startsWith(BASE)) return REAL_FETCH(url, opts);
      if (String(url).includes('cashfree')) fetchCalled = true;
      throw new Error('must not call Cashfree for an invalid phone number');
    };
    try {
      const { cookie } = await signUp(`onboardroute.b.${RUN_ID}@example.com`, 'Route Test Co');
      const res = await REAL_FETCH(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ pocPhone: 'abc', merchantSiteUrl: 'https://route-test.example.com' })
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(fetchCalled, false);
    } finally {
      globalThis.fetch = REAL_FETCH;
    }
  });

  await test(
    '3: a successful creation\'s response always reports started:true (the bug found via manual end-to-end sandbox testing)',
    withCashfreeStub(
      async (url, opts) => {
        const method = (opts?.method || 'GET').toUpperCase();
        if (method === 'POST' && String(url).endsWith('/merchants')) return new Response(JSON.stringify({ merchant_id: 'placeholder' }), { status: 200 });
        return new Response(JSON.stringify({ onboarding_status: 'Email Verified', product_status: [{ product_name: 'PG', product_min_kyc_status: 'MIN_KYC_PENDING' }] }), { status: 200 });
      },
      async () => {
        const { cookie } = await signUp(`onboardroute.c.${RUN_ID}@example.com`, 'Route Test Co');
        const res = await REAL_FETCH(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ pocPhone: '9876543210', merchantSiteUrl: 'https://route-test.example.com' })
        });
        assert.equal(res.status, 201);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.started, true, '`started` must be present and true on a successful creation response');
        assert.equal(body.onboardingStatus, 'Email Verified');
      }
    )
  );

  await test(
    '4: the stale/partial-failure branch (created, but the immediate status refresh failed) also reports started:true',
    withCashfreeStub(
      async (url, opts) => {
        const method = (opts?.method || 'GET').toUpperCase();
        if (method === 'POST' && String(url).endsWith('/merchants')) return new Response(JSON.stringify({ merchant_id: 'placeholder' }), { status: 200 });
        return new Response(JSON.stringify({ message: 'Internal error' }), { status: 500 });
      },
      async () => {
        const { cookie } = await signUp(`onboardroute.d.${RUN_ID}@example.com`, 'Route Test Co');
        const res = await REAL_FETCH(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ pocPhone: '9876543211', merchantSiteUrl: 'https://route-test.example.com' })
        });
        assert.equal(res.status, 201);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.started, true);
        assert.equal(body.stale, true);
      }
    )
  );

  await test(
    '5: an edited business profile name (Settings) is what Cashfree is told, not the original signup company name',
    withCashfreeStub(
      async (url, opts) => {
        const method = (opts?.method || 'GET').toUpperCase();
        if (method === 'POST' && String(url).endsWith('/merchants')) return new Response(JSON.stringify({ merchant_id: 'placeholder' }), { status: 200 });
        return new Response(JSON.stringify({ onboarding_status: 'Created', product_status: [] }), { status: 200 });
      },
      async (calls) => {
        const { cookie } = await signUp(`onboardroute.e.${RUN_ID}@example.com`, 'Original Signup Name');
        const profileRes = await REAL_FETCH(`${BASE}/api/v1/merchant/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ businessName: 'Edited Business Name', supportEmail: '' })
        });
        assert.equal(profileRes.status, 200);

        const res = await REAL_FETCH(`${BASE}/api/v1/merchant/cashfree-partner/onboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ pocPhone: '9876543212', merchantSiteUrl: 'https://route-test.example.com' })
        });
        assert.equal(res.status, 201);
        const created = calls.find((c) => c.method === 'POST' && c.url.endsWith('/merchants'));
        assert.equal(created.body.merchant_name, 'Edited Business Name');
      }
    )
  );

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
