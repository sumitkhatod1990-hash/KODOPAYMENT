// Regression test for the Phase 8 refund-status fix.
//
// Bug found in the Phase 7B real-refund audit: POST /api/v1/payments/refund
// set the transaction to 'refunded'/'partially_refunded' the instant
// Cashfree's refund POST returned HTTP 2xx, without ever looking at the
// response body's own refund_status field. A 2xx response can carry
// refund_status: PENDING (Cashfree accepted the request but hasn't settled
// it yet) just as easily as SUCCESS — so a transaction could be shown as
// definitively "Refunded" while Cashfree itself still considers it pending
// (and it could still end up FAILED/CANCELLED later).
//
// Fix: applyRefundStatus() in server/cashfreeRefundOutcome.js is now the
// single place that decides what SUCCESS / PENDING / FAILED|CANCELLED
// means for a transaction, called identically from three places that can
// each independently learn a refund's status — the initial POST response,
// the (currently unsubscribed) Cashfree webhook, and the new on-demand
// reconciliation endpoint (GET /api/v1/payments/refund-status/:id). See the
// extensive comment above applyRefundStatus() for the exact state model:
//   SUCCESS            -> transaction 'refunded'/'partially_refunded' (terminal);
//                          claim permanently locked (completeRefundClaim).
//   PENDING / ONHOLD   -> transaction 'refund_pending' (never shown as
//                          refunded); claim ALSO locked immediately, because
//                          Cashfree already accepted one refund request and a
//                          second POST must never be allowed to create a
//                          second, independent Cashfree refund.
//   FAILED / CANCELLED -> transaction reverts to 'succeeded' (refundable
//                          again); claim reopened via
//                          reopenRefundClaimAfterFailure() so a legitimate
//                          retry is possible.
//
// This suite tests applyRefundStatus() and the claim primitives directly —
// the exact functions the real POST/webhook/reconciliation code paths in
// server/index.js call — using the project's real local file-store
// persistence, matching this project's existing testing convention.
//
// Run with: node server/tests/refundStatusReconciliation.test.mjs
//
// Caution: same as the other test files in this directory — when no
// DATABASE_URL is configured this writes to the local dev store
// (server/.data/dev-store.json). Test data (transactions) is namespaced and
// cleaned up afterward. Refund claim events created by this test are left in
// place (no deleteEvent primitive exists) — harmless, uniquely keyed to this
// run's randomly generated merchant/order ids, same as the existing
// refundConcurrency.test.mjs residue.

import assert from 'node:assert/strict';
import crypto from 'crypto';
import { applyRefundStatus } from '../cashfreeRefundOutcome.js';
import { beginRefundClaim, saveResource, getResource, listResources, deleteResource } from '../neonStore.js';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const merchantA = `test_regression_refundstatus_a_${RUN_ID}`;
const merchantB = `test_regression_refundstatus_b_${RUN_ID}`;

const createdTransactions = []; // { merchant, orderId }

function newOrderId() {
  return `qv_cf_test_refundstatus_${crypto.randomBytes(5).toString('hex')}`;
}

function newRefundId() {
  return `refund_${crypto.randomBytes(10).toString('hex')}`;
}

async function seedSucceededTransaction(merchant, amount = 10) {
  const orderId = newOrderId();
  createdTransactions.push({ merchant, orderId });
  await saveResource(merchant, 'transaction', {
    id: orderId, provider: 'cashfree', amount, currency: 'INR', status: 'succeeded',
    customerEmail: 'refund-status-test@example.com', customerName: 'Test Customer',
    productName: 'Refund Status Regression Test', paymentMethod: 'cashfree',
    fee: 0, net: amount, country: 'IN', createdAt: new Date().toISOString()
  });
  return orderId;
}

// Mirrors the real endpoint: win the claim, then apply whatever Cashfree's
// (simulated) response says.
async function initiateRefund(merchant, orderId, refundAmount, cashfreeStatus) {
  const claim = await beginRefundClaim(merchant, orderId);
  if (!claim.won) return { initiated: false, reason: claim.reason };
  const refundId = newRefundId();
  const tx = await applyRefundStatus(merchant, orderId, { refundId, refundAmount, refundStatus: cashfreeStatus });
  return { initiated: true, refundId, tx };
}

async function cleanup() {
  for (const { merchant, orderId } of createdTransactions) {
    await deleteResource(merchant, 'transaction', orderId).catch(() => {});
  }
}

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

async function run() {
  console.log('Refund status truthfulness / reconciliation regression test');
  console.log('');

  // 1. Cashfree refund response = SUCCESS
  await test('1: Cashfree SUCCESS -> transaction becomes refunded, claim permanently locked', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    const { initiated, tx } = await initiateRefund(merchantA, orderId, 10, 'SUCCESS');
    assert.equal(initiated, true);
    assert.equal(tx.status, 'refunded');
    assert.equal(tx.refundedAmount, 10);
    assert.equal(tx.refundStatus, 'SUCCESS');
    assert.ok(tx.refundConfirmedAt, 'expected refundConfirmedAt to be set');

    const second = await beginRefundClaim(merchantA, orderId);
    assert.equal(second.won, false, 'a second claim attempt after SUCCESS must not win');
  });

  // 2. Cashfree refund response = PENDING
  await test('2: Cashfree PENDING -> transaction becomes refund_pending, never shown as refunded', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    const { initiated, tx } = await initiateRefund(merchantA, orderId, 10, 'PENDING');
    assert.equal(initiated, true);
    assert.equal(tx.status, 'refund_pending', 'a PENDING Cashfree response must never be presented as fully refunded');
    assert.equal(tx.refundStatus, 'PENDING');
    assert.notEqual(tx.status, 'refunded');
    assert.notEqual(tx.status, 'partially_refunded');
  });

  // 3. Cashfree refund response = FAILED/CANCELLED
  await test('3: Cashfree FAILED -> transaction reverts to succeeded and stays refundable', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    const { initiated } = await initiateRefund(merchantA, orderId, 10, 'FAILED');
    assert.equal(initiated, true);
    const tx = await getResource(merchantA, 'transaction', orderId);
    assert.equal(tx.status, 'succeeded', 'a FAILED refund must leave the transaction refundable again');
    assert.equal(tx.refundStatus, 'FAILED');
    assert.ok(tx.refundFailedAt);

    const retryClaim = await beginRefundClaim(merchantA, orderId);
    assert.equal(retryClaim.won, true, 'after a FAILED refund, a legitimate retry must be able to claim again');
  });

  await test('3b: Cashfree CANCELLED -> transaction reverts to succeeded and stays refundable', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    await initiateRefund(merchantA, orderId, 10, 'CANCELLED');
    const tx = await getResource(merchantA, 'transaction', orderId);
    assert.equal(tx.status, 'succeeded');
    assert.equal(tx.refundStatus, 'CANCELLED');
    const retryClaim = await beginRefundClaim(merchantA, orderId);
    assert.equal(retryClaim.won, true);
  });

  // 4. Reconciliation PENDING -> SUCCESS
  await test('4: reconciliation PENDING -> SUCCESS resolves the transaction correctly', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    const { refundId } = await initiateRefund(merchantA, orderId, 10, 'PENDING');
    let tx = await getResource(merchantA, 'transaction', orderId);
    assert.equal(tx.status, 'refund_pending');

    // Simulates the reconciliation endpoint's later GET refund-status lookup.
    tx = await applyRefundStatus(merchantA, orderId, { refundId, refundAmount: 10, refundStatus: 'SUCCESS' });
    assert.equal(tx.status, 'refunded');
    assert.equal(tx.refundStatus, 'SUCCESS');
    assert.equal(tx.refundedAmount, 10);
  });

  // 5. Reconciliation PENDING -> FAILED
  await test('5: reconciliation PENDING -> FAILED reverts the transaction and reopens the claim', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    await initiateRefund(merchantA, orderId, 10, 'PENDING');
    let tx = await getResource(merchantA, 'transaction', orderId);
    assert.equal(tx.status, 'refund_pending');

    tx = await applyRefundStatus(merchantA, orderId, { refundId: tx.refundId, refundAmount: 10, refundStatus: 'CANCELLED' });
    assert.equal(tx.status, 'succeeded');
    assert.equal(tx.refundStatus, 'CANCELLED');

    const retryClaim = await beginRefundClaim(merchantA, orderId);
    assert.equal(retryClaim.won, true, 'once reconciliation confirms failure, a retry must be possible');
  });

  // 6. Repeated reconciliation is idempotent
  await test('6: repeated reconciliation calls are idempotent, no duplicate accounting', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    const { refundId } = await initiateRefund(merchantA, orderId, 10, 'PENDING');

    // Reconcile to SUCCESS three times in a row (simulating repeated polls
    // or a webhook + a manual check landing close together).
    await applyRefundStatus(merchantA, orderId, { refundId, refundAmount: 10, refundStatus: 'SUCCESS' });
    await applyRefundStatus(merchantA, orderId, { refundId, refundAmount: 10, refundStatus: 'SUCCESS' });
    const tx = await applyRefundStatus(merchantA, orderId, { refundId, refundAmount: 10, refundStatus: 'SUCCESS' });

    assert.equal(tx.status, 'refunded');
    assert.equal(tx.refundedAmount, 10, 'repeated SUCCESS observations must not accumulate the refunded amount');

    const allTx = await listResources(merchantA, 'transaction');
    assert.equal(allTx.filter(t => t.id === orderId).length, 1, 'expected exactly one transaction row, not duplicated by repeated reconciliation');
  });

  // 7. Pending refund blocks duplicate refund attempts
  await test('7: a refund_pending transaction blocks a duplicate refund attempt', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);
    await initiateRefund(merchantA, orderId, 10, 'PENDING');

    const attempts = await Promise.all(Array.from({ length: 5 }, () => beginRefundClaim(merchantA, orderId)));
    assert.ok(attempts.every(a => a.won === false), 'no further claim attempt should win while a refund is pending');
  });

  // 8. Failed refund permits retry, and that retry can itself succeed
  await test('8: after a failed refund, a retry is permitted and can itself succeed', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 20);
    await initiateRefund(merchantA, orderId, 20, 'FAILED');
    let tx = await getResource(merchantA, 'transaction', orderId);
    assert.equal(tx.status, 'succeeded');

    const { initiated, tx: retryTx } = await initiateRefund(merchantA, orderId, 20, 'SUCCESS');
    assert.equal(initiated, true, 'retry after a failed refund must be able to claim and proceed');
    assert.equal(retryTx.status, 'refunded');
    assert.equal(retryTx.refundedAmount, 20);
  });

  // 9. Merchant isolation
  await test('9: merchant isolation — independent PENDING/SUCCESS outcomes for the same order id string', async () => {
    const sharedOrderId = newOrderId();
    createdTransactions.push({ merchant: merchantA, orderId: sharedOrderId });
    createdTransactions.push({ merchant: merchantB, orderId: sharedOrderId });
    await saveResource(merchantA, 'transaction', { id: sharedOrderId, amount: 15, status: 'succeeded', customerEmail: 'a@example.com', customerName: 'A', productName: 'X', paymentMethod: 'cashfree', fee: 0, net: 15, country: 'IN', currency: 'INR', createdAt: new Date().toISOString() });
    await saveResource(merchantB, 'transaction', { id: sharedOrderId, amount: 15, status: 'succeeded', customerEmail: 'b@example.com', customerName: 'B', productName: 'X', paymentMethod: 'cashfree', fee: 0, net: 15, country: 'IN', currency: 'INR', createdAt: new Date().toISOString() });

    await initiateRefund(merchantA, sharedOrderId, 15, 'PENDING');
    await initiateRefund(merchantB, sharedOrderId, 15, 'SUCCESS');

    const txA = await getResource(merchantA, 'transaction', sharedOrderId);
    const txB = await getResource(merchantB, 'transaction', sharedOrderId);
    assert.equal(txA.status, 'refund_pending', "merchant A's transaction must independently reflect PENDING");
    assert.equal(txB.status, 'refunded', "merchant B's transaction must independently reflect SUCCESS, unaffected by merchant A's PENDING state");
  });

  await cleanup();

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  if (results.failed > 0) process.exitCode = 1;
}

run().catch(async (err) => {
  console.error('Test run crashed:', err);
  await cleanup().catch(() => {});
  process.exitCode = 1;
});
