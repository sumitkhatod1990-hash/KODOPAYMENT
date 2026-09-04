// Regression test for the refund concurrency/idempotency fix (Phase 7A).
//
// Bug found in the Phase 7 read-only refund audit: POST /api/v1/payments/refund
// read tx.status === 'succeeded', then later wrote back the refunded status —
// a check-then-act sequence identical in shape to the totalSpent race fixed
// earlier (see cashfreeOrderOutcome.test.mjs). Two concurrent refund requests
// for the same transaction could both pass that read before either had
// written back, each generating its own random refund_id and both reaching
// Cashfree — risking two real refunds for one payment.
//
// Fix: beginRefundClaim()/completeRefundClaim()/releaseRefundClaim() in
// neonStore.js. Unlike claimOrderCredited() (a permanent once-ever claim),
// a refund claim has three states — 'in_flight', 'succeeded' (permanent),
// 'failed' (releasable) — so a Cashfree error or network failure does not
// permanently lock a merchant out of a legitimate retry. See the extensive
// comment above beginRefundClaim() in neonStore.js for the exact atomicity
// argument.
//
// This suite tests the claim primitives directly (the exact functions the
// real POST /api/v1/payments/refund route in server/index.js calls) using
// the project's real local file-store persistence, the same one the dev
// server uses — matching this project's existing testing convention. It does
// not call the live Cashfree API and does not start the HTTP server; a
// "successful Cashfree call" is simulated by calling completeRefundClaim()
// directly, exactly as the route does after a real 2xx response.
//
// Frontend error-surfacing (AppContext.tsx processRefund / PaymentsTab.tsx)
// is NOT covered by an automated test here: this project has no frontend
// test harness (no Jest/RTL/jsdom configured), and processRefund is a
// closure inside the AppProvider component, not an independently importable
// function. It was instead verified by `npx tsc --noEmit` (passes) and by
// direct code review of the response-shape contract shared with the
// already-tested processPayment() function it mirrors. Adding a frontend
// test harness is a separate, larger scope decision.
//
// Run with: node server/tests/refundConcurrency.test.mjs
//
// Caution: same as cashfreeOrderOutcome.test.mjs — when no DATABASE_URL is
// configured this writes to the local dev store (server/.data/dev-store.json).
// Test data (transactions/customers) is namespaced and cleaned up afterward.
// The refund claim rows this test creates in the events store are left in
// place (there is no deleteEvent primitive, and — like the equivalent
// claimOrderCredited residue from the concurrency tests in
// cashfreeOrderOutcome.test.mjs — they are harmless: uniquely keyed to this
// run's randomly generated merchant/order ids, which can never recur).

import assert from 'node:assert/strict';
import crypto from 'crypto';
import { beginRefundClaim, completeRefundClaim, releaseRefundClaim, saveResource, getResource, deleteResource, listResources } from '../neonStore.js';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const merchantA = `test_regression_refund_a_${RUN_ID}`;
const merchantB = `test_regression_refund_b_${RUN_ID}`;

const createdTransactions = []; // { merchant, orderId }

function newOrderId() {
  return `qv_cf_test_refund_${crypto.randomBytes(5).toString('hex')}`;
}

async function seedSucceededTransaction(merchant, amount = 10) {
  const orderId = newOrderId();
  createdTransactions.push({ merchant, orderId });
  const tx = {
    id: orderId,
    provider: 'cashfree',
    amount,
    currency: 'INR',
    status: 'succeeded',
    customerEmail: 'refund-test@example.com',
    customerName: 'Test Customer',
    productName: 'Refund Regression Test',
    paymentMethod: 'cashfree',
    fee: 0,
    net: amount,
    country: 'IN',
    createdAt: new Date().toISOString()
  };
  await saveResource(merchant, 'transaction', tx);
  return orderId;
}

// Mirrors the real POST /api/v1/payments/refund route: claim, and only the
// winner "calls Cashfree" (simulated as always-succeeding here) and writes
// the transaction's refunded state.
async function simulateRefundAttempt(merchant, orderId) {
  const claim = await beginRefundClaim(merchant, orderId);
  if (!claim.won) return { attempted: false, reason: claim.reason };
  const tx = await getResource(merchant, 'transaction', orderId);
  await completeRefundClaim(merchant, orderId);
  await saveResource(merchant, 'transaction', { ...tx, status: 'refunded', refundedAmount: tx.amount, refundedAt: new Date().toISOString() });
  return { attempted: true };
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
  console.log('Refund concurrency/idempotency regression test');
  console.log('');

  const CONCURRENCY = 10;

  // A. Ten simultaneous refund attempts for the same transaction: prove only
  // one can claim/initiate the refund, and the transaction transitions
  // exactly once (not corrupted or double-written by the losers).
  await test('A: 10 concurrent refund attempts for the same transaction — exactly one claims it, transaction transitions exactly once', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 10);

    const outcomes = await Promise.all(Array.from({ length: CONCURRENCY }, () => simulateRefundAttempt(merchantA, orderId)));
    const won = outcomes.filter(o => o.attempted);
    const lost = outcomes.filter(o => !o.attempted);
    assert.equal(won.length, 1, `expected exactly 1 of ${CONCURRENCY} concurrent attempts to win the claim, got ${won.length}`);
    assert.equal(lost.length, CONCURRENCY - 1, `expected the remaining ${CONCURRENCY - 1} attempts to be rejected`);
    assert.ok(lost.every(o => o.reason === 'in_progress' || o.reason === 'already_refunded'), 'every losing attempt must carry a reason');

    const tx = await getResource(merchantA, 'transaction', orderId);
    assert.equal(tx.status, 'refunded');
    assert.equal(tx.refundedAmount, 10, 'transaction must be refunded for exactly its original amount, not a multiple of it');
  });

  // A (raw primitive form): confirm beginRefundClaim() itself — not just the
  // simulated wrapper above — gives exactly one winner under real concurrency.
  await test('A2: beginRefundClaim() alone — 10 concurrent calls for the same claim, exactly one winner', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 25);
    const claims = await Promise.all(Array.from({ length: CONCURRENCY }, () => beginRefundClaim(merchantA, orderId)));
    const winners = claims.filter(c => c.won);
    assert.equal(winners.length, 1, `expected exactly 1 winner among ${CONCURRENCY} concurrent beginRefundClaim() calls, got ${winners.length}`);
    // release it so it doesn't leak into other assertions in this run
    await releaseRefundClaim(merchantA, orderId);
  });

  // B. Sequential: first refund succeeds and completes its claim; a second,
  // later request for the same transaction must be safely rejected.
  await test('B: sequential refund after a successful one is rejected as already_refunded', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 15);

    const first = await simulateRefundAttempt(merchantA, orderId);
    assert.equal(first.attempted, true, 'first refund attempt should win and complete');

    const second = await beginRefundClaim(merchantA, orderId);
    assert.equal(second.won, false, 'a second claim attempt after a completed refund must not win');
    assert.equal(second.reason, 'already_refunded', `expected reason 'already_refunded', got '${second.reason}'`);
  });

  // C. A failed Cashfree call (simulated via releaseRefundClaim, exactly what
  // the real route does in its catch block / non-2xx branch) must not
  // permanently lock the transaction out of a legitimate retry.
  await test('C: a released (failed) claim allows a legitimate retry, and that retry can still succeed', async () => {
    const orderId = await seedSucceededTransaction(merchantA, 30);

    const firstAttempt = await beginRefundClaim(merchantA, orderId);
    assert.equal(firstAttempt.won, true, 'first attempt should win the claim');
    // Simulate Cashfree returning an error / the request throwing.
    await releaseRefundClaim(merchantA, orderId);

    const retry = await beginRefundClaim(merchantA, orderId);
    assert.equal(retry.won, true, 'after release, a retry must be able to claim the refund again');

    // And that retry, once it actually succeeds, permanently completes —
    // proving the full failed -> retried -> succeeded -> locked lifecycle.
    await completeRefundClaim(merchantA, orderId);
    const afterSuccess = await beginRefundClaim(merchantA, orderId);
    assert.equal(afterSuccess.won, false, 'once a retry succeeds, no further claim should be possible');
    assert.equal(afterSuccess.reason, 'already_refunded');
  });

  // D. Merchant isolation: merchant A and merchant B claiming refunds using
  // the SAME order id string must not interfere with each other at all.
  await test('D: merchant isolation — merchant A and merchant B can independently claim refunds for the same order id string', async () => {
    const sharedOrderId = newOrderId();
    createdTransactions.push({ merchant: merchantA, orderId: sharedOrderId });
    createdTransactions.push({ merchant: merchantB, orderId: sharedOrderId });
    await saveResource(merchantA, 'transaction', { id: sharedOrderId, amount: 40, status: 'succeeded', customerEmail: 'a@example.com', customerName: 'A', productName: 'X', paymentMethod: 'cashfree', fee: 0, net: 40, country: 'IN', currency: 'INR', createdAt: new Date().toISOString() });
    await saveResource(merchantB, 'transaction', { id: sharedOrderId, amount: 40, status: 'succeeded', customerEmail: 'b@example.com', customerName: 'B', productName: 'X', paymentMethod: 'cashfree', fee: 0, net: 40, country: 'IN', currency: 'INR', createdAt: new Date().toISOString() });

    const [claimA, claimB] = await Promise.all([
      beginRefundClaim(merchantA, sharedOrderId),
      beginRefundClaim(merchantB, sharedOrderId)
    ]);
    assert.equal(claimA.won, true, "merchant A's claim must succeed independently of merchant B's");
    assert.equal(claimB.won, true, "merchant B's claim must succeed independently of merchant A's");

    // A further claim attempt on merchant A's order must not be affected by
    // (or able to affect) merchant B's, and vice versa.
    const crossCheckA = await beginRefundClaim(merchantA, sharedOrderId);
    const crossCheckB = await beginRefundClaim(merchantB, sharedOrderId);
    assert.equal(crossCheckA.won, false, "merchant A's already-in-flight claim must reject a second attempt");
    assert.equal(crossCheckB.won, false, "merchant B's already-in-flight claim must reject a second attempt");

    await releaseRefundClaim(merchantA, sharedOrderId);
    await releaseRefundClaim(merchantB, sharedOrderId);
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
