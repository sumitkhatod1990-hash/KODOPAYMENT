// HTTP-level regression test for the Phase 10.8F settlement/reconciliation
// routes (GET /api/v1/merchant/settlements, GET /api/v1/merchant/reconciliation,
// POST /api/v1/merchant/reconciliation/refresh). Boots the real Express app
// on its own port and stubs global.fetch for Cashfree calls only, same
// pattern as cashfreePartnerOnboardRoute.test.mjs.
//
// Run with: node server/tests/settlementRoutes.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 5319 + (crypto.randomInt(0, 400));

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';
process.env.CASHFREE_APP_ID = '';
process.env.CASHFREE_SECRET_KEY = '';
process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_settlement_route_suite';

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
  const raw = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie()[0] : res.headers.get('set-cookie');
  if (!raw) throw new Error('Response did not set a session cookie');
  return raw.split(';')[0];
}

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try { const res = await REAL_FETCH(`${BASE}/api/v1/health`); if (res.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Server did not become healthy in time');
}

async function signUp(email) {
  const res = await REAL_FETCH(`${BASE}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'correct horse battery staple 1', name: 'Test Merchant', company: 'Settlement Route Test Co' })
  });
  assert.equal(res.status, 201);
  return { cookie: cookieFrom(res), merchantId: (await res.json()).user.id };
}

function withCashfreeStub(cashfreeHandler, fn) {
  return async () => {
    globalThis.fetch = async (url, opts) => {
      if (String(url).startsWith(BASE)) return REAL_FETCH(url, opts);
      return cashfreeHandler(url, opts);
    };
    try { await fn(); } finally { globalThis.fetch = REAL_FETCH; }
  };
}

async function run() {
  console.log('Settlement / reconciliation routes — HTTP-level regression test');
  console.log('');

  await waitForServer();
  const { saveResource, createPartnerMerchantMapping } = await import('../neonStore.js');

  await test('1: GET /api/v1/merchant/settlements returns an empty (never fabricated) list for a merchant with no settlement history', async () => {
    const { cookie } = await signUp(`settleroute.a.${RUN_ID}@example.com`);
    const res = await REAL_FETCH(`${BASE}/api/v1/merchant/settlements`, { headers: { Cookie: cookie } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.deepEqual(body.settlements, []);
  });

  await test('2: GET /api/v1/merchant/reconciliation returns an empty list for a merchant with nothing reconciled yet', async () => {
    const { cookie } = await signUp(`settleroute.b.${RUN_ID}@example.com`);
    const res = await REAL_FETCH(`${BASE}/api/v1/merchant/reconciliation`, { headers: { Cookie: cookie } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body.reconciliations, []);
  });

  await test('3: POST reconciliation/refresh for an order that does not belong to the caller reports payment_not_found, not another merchant\'s data', async () => {
    const { cookie: cookieA, merchantId: merchantIdA } = await signUp(`settleroute.c.${RUN_ID}@example.com`);
    const { merchantId: merchantIdB } = await signUp(`settleroute.d.${RUN_ID}@example.com`);
    const orderIdB = `qv_order_route_isoB_${RUN_ID}`;
    await saveResource(merchantIdB, 'transaction', { id: orderIdB, status: 'succeeded', amount: 250, currency: 'INR' });

    const res = await REAL_FETCH(`${BASE}/api/v1/merchant/reconciliation/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieA },
      body: JSON.stringify({ orderId: orderIdB })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.errorCode, 'payment_not_found', 'merchant A supplying merchant B\'s order id must not reach merchant B\'s payment/settlement data');
    assert.ok(!JSON.stringify(body).includes(String(250)), 'merchant B\'s amount must never leak into merchant A\'s response');
    void merchantIdA;
  });

  await test(
    '4: a full reconcile-refresh round trip returns only the calling merchant\'s own settlement, isolated from a second merchant',
    withCashfreeStub(
      async (url) => {
        if (String(url).includes('/orders/')) {
          return new Response(JSON.stringify({
            order_details: {},
            payment_details: { payment_amount: 777 },
            settlement_details: { cf_settlement_id: `cfset_route_${RUN_ID}`, status: 'SUCCESS', settlement_utr: `UTR_ROUTE_${RUN_ID}` }
          }), { status: 200 });
        }
        return new Response(JSON.stringify({ message: 'unexpected call' }), { status: 500 });
      },
      async () => {
        const { cookie, merchantId } = await signUp(`settleroute.e.${RUN_ID}@example.com`);
        const orderId = `qv_order_route_e_${RUN_ID}`;
        await saveResource(merchantId, 'transaction', { id: orderId, status: 'succeeded', amount: 777, currency: 'INR' });
        await createPartnerMerchantMapping({ merchantId, cfMerchantId: merchantId });

        const refreshRes = await REAL_FETCH(`${BASE}/api/v1/merchant/reconciliation/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ orderId })
        });
        assert.equal(refreshRes.status, 200);
        const refreshBody = await refreshRes.json();
        assert.equal(refreshBody.reconciliations[0].state, 'MATCHED');
        assert.equal(refreshBody.reconciliations[0].cfSettlementId, `cfset_route_${RUN_ID}`);

        const settlementsRes = await REAL_FETCH(`${BASE}/api/v1/merchant/settlements`, { headers: { Cookie: cookie } });
        const settlementsBody = await settlementsRes.json();
        assert.ok(settlementsBody.settlements.some((s) => s.cfSettlementId === `cfset_route_${RUN_ID}`));
        assert.ok(settlementsBody.settlements.every((s) => s.settlementUtr !== null && typeof s.settlementUtr === 'string' || s.settlementUtr === undefined));

        // A second, unrelated merchant must see none of this.
        const { cookie: otherCookie } = await signUp(`settleroute.f.${RUN_ID}@example.com`);
        const otherSettlementsRes = await REAL_FETCH(`${BASE}/api/v1/merchant/settlements`, { headers: { Cookie: otherCookie } });
        const otherSettlementsBody = await otherSettlementsRes.json();
        assert.deepEqual(otherSettlementsBody.settlements, []);
      }
    )
  );

  // Consistent with every other Partner-surface route in this project
  // (e.g. the 10.8D/E onboarding-link route): sanitizeErrorMessage()
  // (cashfreePartner.js) redacts the literal secret from any Cashfree
  // message before it is thrown, and only that redacted, secret-free text
  // is ever forwarded to the client — not the secret itself.
  await test('5: the Partner API key itself never appears in a settlement/reconciliation route response, even if Cashfree echoes it back', async () => {
    const { cookie, merchantId } = await signUp(`settleroute.g.${RUN_ID}@example.com`);
    const orderId = `qv_order_route_g_${RUN_ID}`;
    await saveResource(merchantId, 'transaction', { id: orderId, status: 'succeeded', amount: 100, currency: 'INR' });
    await createPartnerMerchantMapping({ merchantId, cfMerchantId: merchantId });
    const secret = process.env.CASHFREE_PARTNER_API_KEY;
    globalThis.fetch = async (url, opts) => {
      if (String(url).startsWith(BASE)) return REAL_FETCH(url, opts);
      return new Response(JSON.stringify({ message: `Request rejected for key ${secret}` }), { status: 500 });
    };
    try {
      const res = await REAL_FETCH(`${BASE}/api/v1/merchant/reconciliation/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ orderId })
      });
      const text = await res.text();
      assert.ok(!text.includes(secret));
    } finally {
      globalThis.fetch = REAL_FETCH;
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
