// Regression test for the customer.totalSpent double-counting bug, plus its
// follow-up concurrency-race fix.
//
// Bug 1 (fixed earlier): both the customer-facing status-poll endpoint
// (GET /api/v1/india/cashfree/orders/:orderId/status) and the Cashfree
// webhook (POST /api/v1/webhooks/cashfree) independently added the paid
// order's amount to customer.totalSpent every time they observed the order
// as PAID — so a single ₹349 payment could be recorded as ₹698, ₹1047, etc.
// depending on how many times either path observed it.
//
// Bug 2 (fixed now): the original fix closed that by reading the existing
// transaction's prior status, then deciding whether to credit — a
// check-then-act sequence. That is not safe under true concurrency: two
// calls for the same order can both read "not yet counted" before either
// has written back. A real Cashfree sandbox payment produced exactly this
// shape of overlap (three webhook deliveries for one order, arriving close
// together) — see server/cashfreeOrderOutcome.js and the claimOrderCredited
// atomic claim in server/neonStore.js for the fix: crediting is now gated
// by a real atomic claim (a unique-constraint INSERT in production, an
// in-process mutex locally), not a JS-level check.
//
// Both endpoints delegate to the single shared recordCashfreeOrderOutcome()
// function, so this test exercises that function directly — the exact code
// both real endpoints call — using the project's real local file-store
// persistence (server/.data/dev-store.json), the same one the dev server
// uses. All test data is clearly namespaced and deleted again at the end so
// a run leaves no trace behind.
//
// Run with: npm test  (or: node server/tests/cashfreeOrderOutcome.test.mjs)
// (no test framework dependency — uses Node's built-in assert/strict)
//
// Caution: when no DATABASE_URL is configured, this writes to the same
// local file store the dev server uses (server/.data/dev-store.json). Test
// data is namespaced and cleaned up afterward, but for a fully clean run,
// stop `npm run server` first rather than running this alongside it.

import assert from 'node:assert/strict';
import crypto from 'crypto';
import { recordCashfreeOrderOutcome } from '../cashfreeOrderOutcome.js';
import { getResource, listResources, deleteResource } from '../neonStore.js';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const merchantA = `test_regression_merchant_a_${RUN_ID}`;
const merchantB = `test_regression_merchant_b_${RUN_ID}`;

const createdOrders = []; // { merchant, orderId }
const touchedMerchants = new Set([merchantA, merchantB]);

function newOrderId() {
  return `qv_cf_test_${crypto.randomBytes(5).toString('hex')}`;
}

function freshEmail(label) {
  return `regression-${label}-${crypto.randomBytes(4).toString('hex')}@example.com`;
}

async function totalSpentFor(merchantId, email) {
  const customers = await listResources(merchantId, 'customer');
  const customer = customers.find(c => c.email === email);
  return customer ? customer.totalSpent : 0;
}

async function cleanup() {
  for (const { merchant, orderId } of createdOrders) {
    await deleteResource(merchant, 'transaction', orderId).catch(() => {});
  }
  for (const merchant of touchedMerchants) {
    const customers = await listResources(merchant, 'customer').catch(() => []);
    for (const c of customers) await deleteResource(merchant, 'customer', c.id).catch(() => {});
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
  console.log('Cashfree order outcome — totalSpent idempotency regression test');
  console.log('');

  // Requirement 8: call the PAID status path at least twice; totalSpent must
  // increase only once.
  await test('repeated PAID observation of the same order counts totalSpent only once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('repeat');
    const params = { amount: 349, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Regression Test Product', succeeded: true };

    await recordCashfreeOrderOutcome(merchantA, orderId, params);
    await recordCashfreeOrderOutcome(merchantA, orderId, params);
    await recordCashfreeOrderOutcome(merchantA, orderId, params);

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 349, `expected totalSpent=349 after 3 repeated observations, got ${total}`);

    const tx = await getResource(merchantA, 'transaction', orderId);
    assert.equal(tx.status, 'succeeded');
    assert.equal(tx.amount, 349);
  });

  // Requirement 9, sequence 1: status endpoint -> webhook. Both endpoints now
  // call the identical shared function, so simulating each as a separate
  // call to it is a faithful test of that real sequence.
  await test('sequence status-poll -> webhook: same order counts exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('poll-then-webhook');
    const params = { amount: 500, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Regression Test Product', succeeded: true };

    await recordCashfreeOrderOutcome(merchantA, orderId, params); // status-poll observation
    await recordCashfreeOrderOutcome(merchantA, orderId, params); // webhook observation, same order

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 500, `expected totalSpent=500, got ${total}`);
  });

  // Requirement 9, sequence 2: webhook -> status endpoint (reverse order).
  await test('sequence webhook -> status-poll: same order counts exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('webhook-then-poll');
    const params = { amount: 250, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Regression Test Product', succeeded: true };

    await recordCashfreeOrderOutcome(merchantA, orderId, params); // webhook observation
    await recordCashfreeOrderOutcome(merchantA, orderId, params); // status-poll observation, same order

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 250, `expected totalSpent=250, got ${total}`);
  });

  // Requirement 9, sequence 3: webhook -> duplicate webhook delivery.
  await test('sequence webhook -> duplicate webhook: same order counts exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('dup-webhook');
    const params = { amount: 100, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Regression Test Product', succeeded: true };

    await recordCashfreeOrderOutcome(merchantA, orderId, params); // first webhook delivery
    await recordCashfreeOrderOutcome(merchantA, orderId, params); // Cashfree re-delivers the same event

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 100, `expected totalSpent=100, got ${total}`);
  });

  // Phase 6: genuine concurrency, not just sequential repeat calls. Fired
  // via Promise.all so the calls are actually in flight at the same time
  // and can interleave at their internal await points — this is what
  // exposes a check-then-act race that sequential awaited calls (above)
  // cannot. Mirrors the real ₹10 sandbox payment where 3 webhook deliveries
  // for the same order overlapped.
  const CONCURRENCY = 10;

  await test('concurrent webhook <-> webhook overlap: N simultaneous deliveries for the same order count exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('concurrent-webhook-webhook');
    const params = { amount: 10, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Concurrent Webhook Test', succeeded: true };

    await Promise.all(Array.from({ length: CONCURRENCY }, () => recordCashfreeOrderOutcome(merchantA, orderId, params)));

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 10, `expected totalSpent=10 after ${CONCURRENCY} simultaneous webhook-shaped calls, got ${total}`);
    const allTx = await listResources(merchantA, 'transaction');
    assert.equal(allTx.filter(t => t.id === orderId).length, 1, 'expected exactly one transaction row');
  });

  await test('concurrent webhook <-> status-poll overlap: simultaneous calls from both paths count exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('concurrent-webhook-poll');
    const params = { amount: 10, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Concurrent Webhook+Poll Test', succeeded: true };

    // Half simulate webhook deliveries, half simulate status-poll calls —
    // both are literally the same function call from QivroPay's point of
    // view, fired together so they can genuinely race.
    const calls = Array.from({ length: CONCURRENCY }, () => recordCashfreeOrderOutcome(merchantA, orderId, params));
    await Promise.all(calls);

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 10, `expected totalSpent=10 after ${CONCURRENCY} simultaneous webhook+poll-shaped calls, got ${total}`);
    const allTx = await listResources(merchantA, 'transaction');
    assert.equal(allTx.filter(t => t.id === orderId).length, 1, 'expected exactly one transaction row');
  });

  await test('concurrent status-poll <-> webhook overlap (reverse framing): still counts exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('concurrent-poll-webhook');
    const params = { amount: 10, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Concurrent Poll+Webhook Test', succeeded: true };

    // Same mechanics as above; kept as a separate named case because the
    // task explicitly calls out "status -> webhook" as its own scenario to
    // verify, even though — correctly — the implementation can't tell them
    // apart, which is exactly the point of routing both through one gate.
    await Promise.all(Array.from({ length: CONCURRENCY }, () => recordCashfreeOrderOutcome(merchantA, orderId, params)));

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 10, `expected totalSpent=10, got ${total}`);
  });

  await test('concurrent duplicate-webhook overlap: many simultaneous identical deliveries count exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('concurrent-dup-webhook');
    const params = { amount: 25, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Concurrent Duplicate Webhook Test', succeeded: true };

    await Promise.all(Array.from({ length: CONCURRENCY }, () => recordCashfreeOrderOutcome(merchantA, orderId, params)));

    const total = await totalSpentFor(merchantA, email);
    assert.equal(total, 25, `expected totalSpent=25, got ${total}`);
    const allTx = await listResources(merchantA, 'transaction');
    assert.equal(allTx.filter(t => t.id === orderId).length, 1, 'expected exactly one transaction row despite concurrent duplicates');
  });

  // Requirement 5: the transaction itself stays a single upserted row per
  // order id, never duplicated, across many repeat observations.
  await test('transaction record stays a single upserted row per order id', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('upsert');
    const params = { amount: 42, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Regression Test Product', succeeded: true };

    for (let i = 0; i < 5; i += 1) await recordCashfreeOrderOutcome(merchantA, orderId, params);

    const allTx = await listResources(merchantA, 'transaction');
    const matching = allTx.filter(t => t.id === orderId);
    assert.equal(matching.length, 1, `expected exactly 1 transaction row for this order, found ${matching.length}`);
    assert.equal(matching[0].status, 'succeeded');
  });

  // Requirement 6: a failed observation never counts, and the same order
  // later succeeding counts exactly once (not blocked, not double-counted).
  await test('a failed observation does not count; the same order succeeding later counts exactly once', async () => {
    const orderId = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId });
    const email = freshEmail('fail-then-succeed');
    const failedParams = { amount: 77, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Regression Test Product', succeeded: false };
    const succeededParams = { ...failedParams, succeeded: true };

    await recordCashfreeOrderOutcome(merchantA, orderId, failedParams);
    const afterFailed = await totalSpentFor(merchantA, email);
    assert.equal(afterFailed, 0, `a failed observation must not contribute to totalSpent, got ${afterFailed}`);

    await recordCashfreeOrderOutcome(merchantA, orderId, succeededParams);
    await recordCashfreeOrderOutcome(merchantA, orderId, succeededParams); // repeat success observation

    const afterSucceeded = await totalSpentFor(merchantA, email);
    assert.equal(afterSucceeded, 77, `expected exactly one count of 77 once the order succeeded, got ${afterSucceeded}`);
  });

  // Requirement 7: merchant isolation is preserved by the fix.
  await test('merchant isolation: totalSpent never leaks across merchants, even for the same customer email', async () => {
    const email = freshEmail('cross-merchant');
    const orderIdA = newOrderId();
    const orderIdB = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId: orderIdA });
    createdOrders.push({ merchant: merchantB, orderId: orderIdB });

    await recordCashfreeOrderOutcome(merchantA, orderIdA, { amount: 300, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'A', succeeded: true });
    await recordCashfreeOrderOutcome(merchantB, orderIdB, { amount: 200, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'B', succeeded: true });
    // repeat both, to also confirm idempotency holds per-merchant
    await recordCashfreeOrderOutcome(merchantA, orderIdA, { amount: 300, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'A', succeeded: true });
    await recordCashfreeOrderOutcome(merchantB, orderIdB, { amount: 200, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'B', succeeded: true });

    const totalA = await totalSpentFor(merchantA, email);
    const totalB = await totalSpentFor(merchantB, email);
    assert.equal(totalA, 300, `merchant A's totalSpent should be 300, got ${totalA}`);
    assert.equal(totalB, 200, `merchant B's totalSpent should be 200 (isolated from merchant A), got ${totalB}`);
  });

  // Requirement 6 (explicit): the fix must not simply block all future
  // updates for a customer — a genuinely different, new order must still
  // increment totalSpent normally.
  await test('a different, new order for the same customer still increments totalSpent normally', async () => {
    const email = freshEmail('new-order-after-existing');
    const order1 = newOrderId();
    const order2 = newOrderId();
    createdOrders.push({ merchant: merchantA, orderId: order1 });
    createdOrders.push({ merchant: merchantA, orderId: order2 });

    await recordCashfreeOrderOutcome(merchantA, order1, { amount: 150, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'First', succeeded: true });
    const afterFirst = await totalSpentFor(merchantA, email);
    assert.equal(afterFirst, 150, `expected 150 after first order, got ${afterFirst}`);

    await recordCashfreeOrderOutcome(merchantA, order2, { amount: 999, currency: 'INR', customerEmail: email, customerName: 'Test Customer', productName: 'Second', succeeded: true });
    const afterSecond = await totalSpentFor(merchantA, email);
    assert.equal(afterSecond, 150 + 999, `expected 1149 after a second, distinct order, got ${afterSecond}`);
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
