// Deterministic tests for the Phase 10.8F Cashfree Partner settlement
// wrapper (server/cashfreePartnerSettlement.js) and the underlying
// partnerPgRequest() addition to cashfreePartner.js. Entirely offline —
// global.fetch is stubbed for every Cashfree call, same convention as
// cashfreePartnerClient.test.mjs.
//
// Run with: node server/tests/cashfreePartnerSettlement.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';

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

const REAL_FETCH = globalThis.fetch;
function restoreFetch() { globalThis.fetch = REAL_FETCH; }
function json(body, status = 200) { return async () => new Response(JSON.stringify(body), { status }); }

// A documented get-settlements-by-order-id 200 response shape (fields per
// settlements/get-settlements-by-order-id.md).
const orderSettlementBody = (overrides = {}) => ({
  order_details: { order_id: 'qv_order_1', order_amount: 499, order_currency: 'INR' },
  payment_details: { cf_payment_id: 'cfpay_1', payment_amount: 499, settlement_amount: 480.5, vendor_commission: 0 },
  settlement_details: {
    cf_settlement_id: 'cfset_1',
    status: 'SUCCESS',
    settlement_utr: 'UTR123456',
    settlement_initiated_on: '2026-09-01T00:00:00Z',
    settlement_processed_on: '2026-09-03T00:00:00Z',
    settlement_currency: 'INR',
    settlement_type: 'STANDARD'
  },
  ...overrides
});

async function run() {
  console.log('Cashfree Partner settlement wrapper — deterministic tests');
  console.log('');

  const { partnerPgRequest, partnerPgBaseUrl, CashfreePartnerError } = await import('../cashfreePartner.js');
  const { getOrderSettlement, getSettlementRecon, normalizeOrderSettlement, normalizeReconEvent } = await import('../cashfreePartnerSettlement.js');

  const ORIGINAL_KEY = process.env.CASHFREE_PARTNER_API_KEY;
  const ORIGINAL_ENV = process.env.CASHFREE_PARTNER_ENV;
  process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_settlement_suite';
  delete process.env.CASHFREE_PARTNER_ENV;

  await test('1: partnerPgBaseUrl points at the PG host, distinct from the /partners onboarding host', () => {
    assert.equal(partnerPgBaseUrl('sandbox'), 'https://sandbox.cashfree.com/pg');
    assert.equal(partnerPgBaseUrl('production'), 'https://api.cashfree.com/pg');
  });

  await test('2: missing CASHFREE_PARTNER_API_KEY throws without ever calling fetch', async () => {
    const saved = process.env.CASHFREE_PARTNER_API_KEY;
    delete process.env.CASHFREE_PARTNER_API_KEY;
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; };
    try {
      await assert.rejects(
        () => partnerPgRequest('cf_merchant_1', '/orders/x/settlements'),
        (err) => err instanceof CashfreePartnerError && err.code === 'missing_credential'
      );
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
      process.env.CASHFREE_PARTNER_API_KEY = saved;
    }
  });

  await test('3: partnerPgRequest requires a cfMerchantId (never calls Cashfree without one)', async () => {
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; };
    try {
      await assert.rejects(() => partnerPgRequest(null, '/orders/x/settlements'));
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
    }
  });

  await test('4: partnerPgRequest sends x-partner-apikey AND x-partner-merchantid, and hits the PG host', async () => {
    let seenUrl = null;
    let seenHeaders = null;
    globalThis.fetch = async (url, opts) => {
      seenUrl = url;
      seenHeaders = opts.headers;
      return new Response(JSON.stringify(orderSettlementBody()), { status: 200 });
    };
    try {
      await partnerPgRequest('cf_merchant_42', '/orders/qv_order_1/settlements');
      assert.ok(String(seenUrl).startsWith('https://sandbox.cashfree.com/pg/orders/'), `expected PG host, got ${seenUrl}`);
      assert.equal(seenHeaders['x-partner-apikey'], 'test_partner_key_settlement_suite');
      assert.equal(seenHeaders['x-partner-merchantid'], 'cf_merchant_42');
      // Regression guard for a real finding from manual sandbox testing
      // (Phase 10.8F report section C): this endpoint returns an
      // incompatible flat, differently-named response shape at the
      // codebase's general CASHFREE_API_VERSION default (2025-01-01) — only
      // 2026-01-01 returns the nested settlement_details/payment_details
      // shape this file's normalizers parse. This must never silently
      // follow CASHFREE_API_VERSION.
      assert.equal(seenHeaders['x-api-version'], '2026-01-01');
    } finally {
      restoreFetch();
    }
  });

  await test('4b: the settlement x-api-version is decoupled from CASHFREE_API_VERSION (changing the latter must not change it)', async () => {
    const savedGeneralVersion = process.env.CASHFREE_API_VERSION;
    process.env.CASHFREE_API_VERSION = '2025-01-01';
    let seenHeaders = null;
    globalThis.fetch = async (url, opts) => { seenHeaders = opts.headers; return new Response(JSON.stringify(orderSettlementBody()), { status: 200 }); };
    try {
      await partnerPgRequest('cf_merchant_42', '/orders/qv_order_1/settlements');
      assert.equal(seenHeaders['x-api-version'], '2026-01-01', 'the settlement surface must ignore CASHFREE_API_VERSION entirely');
    } finally {
      restoreFetch();
      if (savedGeneralVersion === undefined) delete process.env.CASHFREE_API_VERSION; else process.env.CASHFREE_API_VERSION = savedGeneralVersion;
    }
  });

  await test('5: getOrderSettlement parses a documented success response into distinct, non-fabricated fields', async () => {
    globalThis.fetch = json(orderSettlementBody());
    try {
      const result = await getOrderSettlement('cf_merchant_1', 'qv_order_1');
      assert.equal(result.found, true);
      assert.equal(result.settlement.status, 'SUCCESS');
      assert.equal(result.settlement.cfSettlementId, 'cfset_1');
      assert.equal(result.settlement.settlementUtr, 'UTR123456');
      assert.equal(result.settlement.paymentAmount, 499);
      assert.equal(result.settlement.settlementAmount, 480.5);
      assert.equal(result.settlement.statusRecognized, true);
    } finally {
      restoreFetch();
    }
  });

  await test('6: getOrderSettlement — Cashfree 404 (order not found under this merchant) is reported as found:false, not thrown', async () => {
    globalThis.fetch = json({ message: 'Order not found' }, 404);
    try {
      const result = await getOrderSettlement('cf_merchant_1', 'qv_order_missing');
      assert.equal(result.found, false);
      assert.equal(result.settlement, null);
      assert.equal(result.error, null);
    } finally {
      restoreFetch();
    }
  });

  await test('7: getOrderSettlement — an unrecognized/future settlement status is preserved verbatim, never mapped to a known one', async () => {
    globalThis.fetch = json(orderSettlementBody({ settlement_details: { ...orderSettlementBody().settlement_details, status: 'SOME_FUTURE_STATUS' } }));
    try {
      const result = await getOrderSettlement('cf_merchant_1', 'qv_order_1');
      assert.equal(result.settlement.status, 'SOME_FUTURE_STATUS');
      assert.equal(result.settlement.statusRecognized, false);
    } finally {
      restoreFetch();
    }
  });

  await test('8: getOrderSettlement — a non-404 Cashfree failure (e.g. 500) is thrown as CashfreePartnerError, not swallowed', async () => {
    globalThis.fetch = json({ message: 'Internal error' }, 500);
    try {
      await assert.rejects(
        () => getOrderSettlement('cf_merchant_1', 'qv_order_1'),
        (err) => err instanceof CashfreePartnerError && err.status === 500
      );
    } finally {
      restoreFetch();
    }
  });

  await test('9: normalizeOrderSettlement never fabricates a field Cashfree did not send', () => {
    const result = normalizeOrderSettlement({ order_details: { order_id: 'x' }, payment_details: {}, settlement_details: {} });
    assert.equal(result.status, undefined);
    assert.equal(result.cfSettlementId, undefined);
    assert.equal(result.settlementUtr, undefined);
    assert.equal(result.statusRecognized, null);
  });

  await test('10: getSettlementRecon parses documented event rows (event_details/settlement_details/payment_details)', async () => {
    globalThis.fetch = json({
      cursor: 'next_page_token',
      limit: 50,
      data: [
        {
          event_details: { event_type: 'PAYMENT', event_status: 'SUCCESS', event_settlement_amount: 480.5, event_amount: 499, sale_type: 'CREDIT', event_time: '2026-09-01T00:00:00Z' },
          order_details: { order_id: 'qv_order_1', order_amount: 499 },
          payment_details: { cf_payment_id: 'cfpay_1', payment_amount: 499 },
          settlement_details: { cf_settlement_id: 'cfset_1', settlement_utr: 'UTR123456', settlement_date: '2026-09-03T00:00:00Z' }
        }
      ]
    });
    try {
      const result = await getSettlementRecon('cf_merchant_1', { filters: { settlement_utrs: ['UTR123456'] } });
      assert.equal(result.cursor, 'next_page_token');
      assert.equal(result.events.length, 1);
      assert.equal(result.events[0].orderId, 'qv_order_1');
      assert.equal(result.events[0].cfSettlementId, 'cfset_1');
      assert.equal(result.events[0].eventType, 'PAYMENT');
    } finally {
      restoreFetch();
    }
  });

  await test('11: normalizeReconEvent handles an entry with no settlement_details yet (order recognized, not settled)', () => {
    const result = normalizeReconEvent({ event_details: { event_type: 'PAYMENT', event_status: 'PENDING' }, order_details: { order_id: 'qv_order_2' } });
    assert.equal(result.orderId, 'qv_order_2');
    assert.equal(result.cfSettlementId, undefined);
  });

  await test('12: the partner API key never appears in a thrown settlement error, even if Cashfree echoes it back', async () => {
    const secret = process.env.CASHFREE_PARTNER_API_KEY;
    globalThis.fetch = json({ message: `Request rejected for key ${secret}` }, 403);
    try {
      let caught = null;
      try { await getOrderSettlement('cf_merchant_1', 'qv_order_1'); } catch (err) { caught = err; }
      assert.ok(caught);
      assert.ok(!String(caught.message).includes(secret));
    } finally {
      restoreFetch();
    }
  });

  if (ORIGINAL_KEY === undefined) delete process.env.CASHFREE_PARTNER_API_KEY; else process.env.CASHFREE_PARTNER_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_ENV === undefined) delete process.env.CASHFREE_PARTNER_ENV; else process.env.CASHFREE_PARTNER_ENV = ORIGINAL_ENV;

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
