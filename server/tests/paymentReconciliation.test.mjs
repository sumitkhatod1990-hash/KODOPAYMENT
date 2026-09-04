// Deterministic tests for the Phase 10.8F payment <-> settlement
// reconciliation logic (server/paymentReconciliation.js): both the pure
// deriveReconciliationState() state machine and the reconcilePayment()
// orchestration (storage + Cashfree call, with Cashfree stubbed).
//
// Run with: node server/tests/paymentReconciliation.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
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

async function run() {
  console.log('Payment <-> settlement reconciliation — deterministic tests');
  console.log('');

  const { deriveReconciliationState, reconcilePayment, reconcileMerchantPayments, getStoredReconciliation, listStoredReconciliations, listStoredSettlements, ReconciliationError } =
    await import('../paymentReconciliation.js');
  const { CashfreePartnerError } = await import('../cashfreePartner.js');
  const { saveResource, createPartnerMerchantMapping } = await import('../neonStore.js');

  process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_recon_suite';

  // ---------------------------------------------------------------
  // Pure state machine
  // ---------------------------------------------------------------

  await test('1: MATCHED — settlement SUCCESS and gross payment_amount agrees with our own recorded amount', () => {
    const result = deriveReconciliationState({ found: true, settlement: { status: 'SUCCESS', paymentAmount: 499 } }, 499);
    assert.equal(result.state, 'MATCHED');
    assert.equal(result.discrepancy, null);
  });

  await test('2: PENDING_SETTLEMENT — order found, no settlement_details reported yet', () => {
    const result = deriveReconciliationState({ found: true, settlement: {} }, 499);
    assert.equal(result.state, 'PENDING_SETTLEMENT');
  });

  await test('3: PENDING_SETTLEMENT — settlement status is one of the documented pending values', () => {
    for (const status of ['PENDING', 'PENDING_WITH_CASHFREE', 'PENDING_WITH_BANK']) {
      const result = deriveReconciliationState({ found: true, settlement: { status, statusRecognized: true } }, 499);
      assert.equal(result.state, 'PENDING_SETTLEMENT', `status ${status}`);
    }
  });

  await test('4: UNMATCHED — Cashfree has no record of this order under this merchant at all', () => {
    const result = deriveReconciliationState({ found: false, settlement: null }, 499);
    assert.equal(result.state, 'UNMATCHED');
  });

  await test('5: DISCREPANCY — settlement explicitly FAILED', () => {
    const result = deriveReconciliationState({ found: true, settlement: { status: 'FAILED', statusRecognized: true } }, 499);
    assert.equal(result.state, 'DISCREPANCY');
    assert.match(result.discrepancy, /FAILED/);
  });

  await test('6: DISCREPANCY — settlement SUCCESS but the gross amount does not match QivroPay\'s own record', () => {
    const result = deriveReconciliationState({ found: true, settlement: { status: 'SUCCESS', paymentAmount: 450, statusRecognized: true } }, 499);
    assert.equal(result.state, 'DISCREPANCY');
    assert.match(result.discrepancy, /450/);
    assert.match(result.discrepancy, /499/);
  });

  await test('6b: settlement_amount (net of fees) differing from our gross amount is NOT a discrepancy — only payment_amount is compared', () => {
    const result = deriveReconciliationState({ found: true, settlement: { status: 'SUCCESS', paymentAmount: 499, settlementAmount: 480.5, statusRecognized: true } }, 499);
    assert.equal(result.state, 'MATCHED', 'a lower settlement_amount than payment_amount is Cashfree\'s fee, not a discrepancy');
  });

  await test('7: UNKNOWN — an unrecognized/future settlement status is never guessed into a known state', () => {
    const result = deriveReconciliationState({ found: true, settlement: { status: 'SOME_FUTURE_STATUS', statusRecognized: false } }, 499);
    assert.equal(result.state, 'UNKNOWN');
  });

  await test('8: UNKNOWN — settlement says SUCCESS but Cashfree did not report a payment_amount to verify against', () => {
    const result = deriveReconciliationState({ found: true, settlement: { status: 'SUCCESS', statusRecognized: true } }, 499);
    assert.equal(result.state, 'UNKNOWN', 'must never be optimistically marked MATCHED without a verifiable amount');
  });

  // ---------------------------------------------------------------
  // Orchestration (reconcilePayment) — storage + stubbed Cashfree
  // ---------------------------------------------------------------

  async function seedMerchantWithMapping(merchantId, cfMerchantId) {
    await createPartnerMerchantMapping({ merchantId, cfMerchantId });
  }

  await test('9: payment_not_found — reconciling an order with no QivroPay transaction record is a clean ReconciliationError, no Cashfree call', async () => {
    const merchantId = `test_recon_notfound_${RUN_ID}`;
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; };
    try {
      await assert.rejects(
        () => reconcilePayment(merchantId, 'qv_order_never_existed'),
        (err) => err instanceof ReconciliationError && err.code === 'payment_not_found'
      );
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
    }
  });

  await test('10: payment_not_succeeded — a pending/failed QivroPay payment is never reconciled against settlement, no Cashfree call', async () => {
    const merchantId = `test_recon_pending_${RUN_ID}`;
    const orderId = `qv_order_pending_${RUN_ID}`;
    await saveResource(merchantId, 'transaction', { id: orderId, status: 'failed', amount: 499, currency: 'INR' });
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; };
    try {
      await assert.rejects(
        () => reconcilePayment(merchantId, orderId),
        (err) => err instanceof ReconciliationError && err.code === 'payment_not_succeeded'
      );
      assert.equal(fetchCalled, false, 'a payment that never succeeded must never be reported as an unmatched/discrepant settlement');
    } finally {
      restoreFetch();
    }
  });

  await test('11: merchant_not_onboarded — a succeeded payment for a merchant with no Cashfree Partner mapping yet is UNKNOWN, no Cashfree call', async () => {
    const merchantId = `test_recon_noonboard_${RUN_ID}`;
    const orderId = `qv_order_noonboard_${RUN_ID}`;
    await saveResource(merchantId, 'transaction', { id: orderId, status: 'succeeded', amount: 499, currency: 'INR' });
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; };
    try {
      const result = await reconcilePayment(merchantId, orderId);
      assert.equal(result.state, 'UNKNOWN');
      assert.equal(result.reason, 'merchant_not_onboarded');
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
    }
  });

  await test('12: a real MATCHED reconciliation is persisted and independently retrievable', async () => {
    const merchantId = `test_recon_matched_${RUN_ID}`;
    const cfMerchantId = merchantId;
    const orderId = `qv_order_matched_${RUN_ID}`;
    await seedMerchantWithMapping(merchantId, cfMerchantId);
    await saveResource(merchantId, 'transaction', { id: orderId, status: 'succeeded', amount: 499, currency: 'INR' });
    globalThis.fetch = json({
      order_details: { order_id: orderId },
      payment_details: { cf_payment_id: 'cfpay_x', payment_amount: 499, settlement_amount: 480 },
      settlement_details: { cf_settlement_id: 'cfset_x', status: 'SUCCESS', settlement_utr: 'UTRXYZ' }
    });
    try {
      const result = await reconcilePayment(merchantId, orderId);
      assert.equal(result.state, 'MATCHED');
      assert.equal(result.cfSettlementId, 'cfset_x');
    } finally {
      restoreFetch();
    }
    const stored = await getStoredReconciliation(merchantId, orderId);
    assert.equal(stored.state, 'MATCHED');
    const settlements = await listStoredSettlements(merchantId);
    assert.ok(settlements.find((s) => s.id === 'cfset_x'));
  });

  await test('13: Cashfree API failure preserves the last-known reconciliation state rather than overwriting it', async () => {
    const merchantId = `test_recon_stale_${RUN_ID}`;
    const cfMerchantId = merchantId;
    const orderId = `qv_order_stale_${RUN_ID}`;
    await seedMerchantWithMapping(merchantId, cfMerchantId);
    await saveResource(merchantId, 'transaction', { id: orderId, status: 'succeeded', amount: 499, currency: 'INR' });

    // First: a real successful reconciliation to establish a "last known" state.
    globalThis.fetch = json({
      order_details: { order_id: orderId },
      payment_details: { cf_payment_id: 'cfpay_y', payment_amount: 499 },
      settlement_details: { cf_settlement_id: 'cfset_y', status: 'SUCCESS' }
    });
    try {
      const first = await reconcilePayment(merchantId, orderId);
      assert.equal(first.state, 'MATCHED');
    } finally {
      restoreFetch();
    }

    // Then: Cashfree fails on the next attempt.
    globalThis.fetch = json({ message: 'Internal error' }, 500);
    try {
      const second = await reconcilePayment(merchantId, orderId);
      assert.equal(second.state, 'MATCHED', 'must keep the last-known MATCHED state, not regress to UNKNOWN on a transient Cashfree failure');
      assert.equal(second.stale, true);
      assert.ok(second.error);
    } finally {
      restoreFetch();
    }
  });

  await test('14: no prior state + Cashfree API failure reports UNKNOWN with the error attached, not thrown to the caller', async () => {
    const merchantId = `test_recon_firstfail_${RUN_ID}`;
    const cfMerchantId = merchantId;
    const orderId = `qv_order_firstfail_${RUN_ID}`;
    await seedMerchantWithMapping(merchantId, cfMerchantId);
    await saveResource(merchantId, 'transaction', { id: orderId, status: 'succeeded', amount: 499, currency: 'INR' });
    globalThis.fetch = json({ message: 'Internal error' }, 500);
    try {
      const result = await reconcilePayment(merchantId, orderId);
      assert.equal(result.state, 'UNKNOWN');
      assert.ok(result.error);
      assert.equal(result.stale, true);
    } finally {
      restoreFetch();
    }
  });

  await test('15: merchant isolation — reconciling merchant B never reads or writes merchant A\'s reconciliation/settlement records', async () => {
    const merchantA = `test_recon_isoA_${RUN_ID}`;
    const merchantB = `test_recon_isoB_${RUN_ID}`;
    const orderIdA = `qv_order_isoA_${RUN_ID}`;
    const orderIdB = `qv_order_isoB_${RUN_ID}`;
    await seedMerchantWithMapping(merchantA, merchantA);
    await seedMerchantWithMapping(merchantB, merchantB);
    await saveResource(merchantA, 'transaction', { id: orderIdA, status: 'succeeded', amount: 100, currency: 'INR' });
    await saveResource(merchantB, 'transaction', { id: orderIdB, status: 'succeeded', amount: 200, currency: 'INR' });

    globalThis.fetch = json({
      order_details: {}, payment_details: { payment_amount: 100 },
      settlement_details: { cf_settlement_id: 'cfset_isoA', status: 'SUCCESS', settlement_utr: 'UTR_A' }
    });
    try { await reconcilePayment(merchantA, orderIdA); } finally { restoreFetch(); }

    globalThis.fetch = json({
      order_details: {}, payment_details: { payment_amount: 200 },
      settlement_details: { cf_settlement_id: 'cfset_isoB', status: 'SUCCESS', settlement_utr: 'UTR_B' }
    });
    try { await reconcilePayment(merchantB, orderIdB); } finally { restoreFetch(); }

    const reconA = await listStoredReconciliations(merchantA);
    const reconB = await listStoredReconciliations(merchantB);
    assert.equal(reconA.length, 1);
    assert.equal(reconB.length, 1);
    assert.equal(reconA[0].id, orderIdA);
    assert.equal(reconB[0].id, orderIdB);
    assert.ok(!reconA.some((r) => r.id === orderIdB), 'merchant A must never see merchant B\'s reconciliation record');

    const settleA = await listStoredSettlements(merchantA);
    const settleB = await listStoredSettlements(merchantB);
    assert.ok(settleA.every((s) => s.id !== 'cfset_isoB'), 'merchant A must never see merchant B\'s settlement UTR/identifier');
    assert.ok(settleB.every((s) => s.id !== 'cfset_isoA'), 'merchant B must never see merchant A\'s settlement UTR/identifier');
  });

  await test('16: reconcileMerchantPayments only ever reconciles succeeded payments, bounded, sequentially', async () => {
    const merchantId = `test_recon_batch_${RUN_ID}`;
    await seedMerchantWithMapping(merchantId, merchantId);
    const succeededIds = [];
    for (let i = 0; i < 3; i += 1) {
      const orderId = `qv_order_batch_${RUN_ID}_${i}`;
      succeededIds.push(orderId);
      await saveResource(merchantId, 'transaction', { id: orderId, status: 'succeeded', amount: 100 + i, currency: 'INR' });
    }
    await saveResource(merchantId, 'transaction', { id: `qv_order_batch_failed_${RUN_ID}`, status: 'failed', amount: 999, currency: 'INR' });

    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response(JSON.stringify({ order_details: {}, payment_details: {}, settlement_details: {} }), { status: 200 });
    };
    try {
      const results = await reconcileMerchantPayments(merchantId);
      assert.equal(results.length, 3, 'only the 3 succeeded payments are reconciled, not the failed one');
      assert.equal(calls, 3);
      assert.ok(results.every((r) => succeededIds.includes(r.id)));
    } finally {
      restoreFetch();
    }
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
