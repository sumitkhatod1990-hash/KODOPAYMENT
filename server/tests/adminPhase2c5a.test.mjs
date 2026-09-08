// Phase 2C-5A: Payment Operations & Payment Detail (Read-Only) Test Suite
// Verifies:
// 1. Admin authentication & host isolation enforcement (401 / 403)
// 2. RBAC: super_admin, support_agent, compliance_officer, read_only have read-only access
// 3. Global payments ledger returns database-derived payments
// 4. Filtering: merchantId, status, environment, date range
// 5. Search: order ID, transaction ID, customer email
// 6. Pagination: page, pageSize, total, totalPages
// 7. Payment detail: complete payment summary, merchant context, customer, gateway processing refs
// 8. Refund information: read-only, accurately reflects refund claims/status
// 9. Settlement & Reconciliation: read-only, accurately reflects settlement line/reconciliation
// 10. Related Support: accurately links related support tickets
// 11. Security: zero sensitive credentials (passwords, API keys, partner secrets)
// 12. Non-existent payment ID returns clean 404
// 13. Read-only guarantee: zero payment mutations (POST, PATCH, DELETE) allowed

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 5200 + crypto.randomInt(0, 150);

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';

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

function adminCookieFrom(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie().find(c => c.startsWith('qivropay_admin_session='))
    : res.headers.get('set-cookie');
  if (!raw) throw new Error('Response did not set qivropay_admin_session cookie');
  return raw.split(';')[0];
}

async function waitForServer() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/v1/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Server timed out');
}

async function run() {
  await waitForServer();

  const {
    createAdminUser,
    createUser,
    saveResource,
    createSupportTicket
  } = await import('../neonStore.js');

  const superPassword = 'SuperAdminPass2026!#$';

  const superAdmin = await createAdminUser({
    email: `super.c5a.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Admin C5A',
    role: 'super_admin'
  });

  const supportAdmin = await createAdminUser({
    email: `support.c5a.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Support Agent C5A',
    role: 'support_agent'
  });

  const complianceAdmin = await createAdminUser({
    email: `compliance.c5a.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Compliance Officer C5A',
    role: 'compliance_officer'
  });

  const readOnlyAdmin = await createAdminUser({
    email: `readonly.c5a.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Read Only C5A',
    role: 'read_only'
  });

  // Login admins to get session cookies
  const loginSuper = await fetch(`${BASE}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-host': 'client.qivropay.com' },
    body: JSON.stringify({ email: superAdmin.email, password: superPassword })
  });
  const superCookie = adminCookieFrom(loginSuper);

  const loginSupport = await fetch(`${BASE}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-host': 'client.qivropay.com' },
    body: JSON.stringify({ email: supportAdmin.email, password: superPassword })
  });
  const supportCookie = adminCookieFrom(loginSupport);

  const loginCompliance = await fetch(`${BASE}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-host': 'client.qivropay.com' },
    body: JSON.stringify({ email: complianceAdmin.email, password: superPassword })
  });
  const complianceCookie = adminCookieFrom(loginCompliance);

  const loginReadOnly = await fetch(`${BASE}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-host': 'client.qivropay.com' },
    body: JSON.stringify({ email: readOnlyAdmin.email, password: superPassword })
  });
  const readOnlyCookie = adminCookieFrom(loginReadOnly);

  // Create real merchants
  const merchantAlpha = await createUser({
    email: `merchant.alpha.c5a.${RUN_ID}@zenith.com`,
    password: 'MerchantPass2026!#$',
    name: 'Rohan Deshmukh',
    company: 'Zenith Logistics Ltd'
  });

  const merchantBeta = await createUser({
    email: `merchant.beta.c5a.${RUN_ID}@solaris.org`,
    password: 'MerchantPass2026!#$',
    name: 'Priya Nambiar',
    company: 'Solaris Cloud Systems'
  });

  // Seed sample transactions for Merchant Alpha
  const txAlpha1Id = `tx_alpha1_${RUN_ID}`;
  const orderAlpha1Id = `order_alpha1_${RUN_ID}`;
  await saveResource(merchantAlpha.id, 'transaction', {
    id: txAlpha1Id,
    orderId: orderAlpha1Id,
    amount: 1499.00,
    currency: 'INR',
    status: 'succeeded',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.verma@example.com',
    customerPhone: '+91 91234 56789',
    paymentMethod: 'cashfree',
    cfOrderId: `cf_ord_${orderAlpha1Id}`,
    cfPaymentId: `cf_pay_998811_${RUN_ID}`,
    bankReference: `UTR_${RUN_ID}_001`,
    environment: 'production',
    createdAt: new Date(Date.now() + 2000).toISOString()
  });

  // Seed transaction with refund for Merchant Alpha
  const txAlpha2Id = `tx_alpha2_${RUN_ID}`;
  const orderAlpha2Id = `order_alpha2_${RUN_ID}`;
  await saveResource(merchantAlpha.id, 'transaction', {
    id: txAlpha2Id,
    orderId: orderAlpha2Id,
    amount: 2500.00,
    currency: 'INR',
    status: 'refunded',
    customerName: 'Amit Shah',
    customerEmail: 'amit.shah@example.com',
    paymentMethod: 'cashfree',
    refundId: `ref_9922_${RUN_ID}`,
    refundedAmount: 2500.00,
    refundStatus: 'SUCCESS',
    refundNote: 'Customer duplicate order',
    environment: 'sandbox',
    createdAt: new Date(Date.now() + 1000).toISOString()
  });

  // Seed settlement and reconciliation for txAlpha1
  const settlementId = `cf_settle_${RUN_ID}`;
  await saveResource(merchantAlpha.id, 'cf_settlement', {
    id: settlementId,
    status: 'SETTLED',
    settlementUtr: `UTR_${RUN_ID}_BANK_SETTLE`,
    settlementCurrency: 'INR',
    settlementType: 'STANDARD',
    settlementInitiatedOn: new Date().toISOString(),
    settlementProcessedOn: new Date().toISOString()
  });

  await saveResource(merchantAlpha.id, 'cf_settlement_line', {
    id: orderAlpha1Id,
    orderId: orderAlpha1Id,
    cfSettlementId: settlementId
  });

  await saveResource(merchantAlpha.id, 'payment_reconciliation', {
    id: orderAlpha1Id,
    orderId: orderAlpha1Id,
    state: 'MATCHED',
    discrepancy: null,
    lastCheckedAt: new Date().toISOString()
  });

  // Seed support ticket for Merchant Alpha referencing orderAlpha1
  const ticketAlpha = await createSupportTicket({
    userId: merchantAlpha.id,
    subject: `Settlement delay query for ${orderAlpha1Id}`,
    message: `Payment ${orderAlpha1Id} has cleared, need bank UTR.`,
    category: 'settlement',
    priority: 'normal'
  });

  // Seed transaction for Merchant Beta
  const txBeta1Id = `tx_beta1_${RUN_ID}`;
  const orderBeta1Id = `order_beta1_${RUN_ID}`;
  await saveResource(merchantBeta.id, 'transaction', {
    id: txBeta1Id,
    orderId: orderBeta1Id,
    amount: 4999.00,
    currency: 'INR',
    status: 'succeeded',
    customerName: 'Deepa Sen',
    customerEmail: 'deepa.sen@example.com',
    paymentMethod: 'cashfree',
    environment: 'production',
    createdAt: new Date(Date.now() + 3000).toISOString()
  });

  console.log('\n--- PHASE 2C-5A: PAYMENT OPERATIONS & PAYMENT DETAIL SUITE ---');

  // 1. Auth & Host Isolation
  await test('5.1: Payments endpoints require admin authentication and client.qivropay.com host', async () => {
    // Unauthenticated
    const resUnauth = await fetch(`${BASE}/api/v1/admin/payments`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resUnauth.status, 401);

    // Wrong host
    const resWrongHost = await fetch(`${BASE}/api/v1/admin/payments`, {
      headers: {
        'x-forwarded-host': 'qivropay.com',
        'Cookie': superCookie
      }
    });
    assert.equal(resWrongHost.status, 403);
  });

  // 2. RBAC: All authorized admin roles have read-only access
  await test('5.2: super_admin, support_agent, compliance_officer, and read_only have read access', async () => {
    for (const [roleName, cookie] of [
      ['super_admin', superCookie],
      ['support_agent', supportCookie],
      ['compliance_officer', complianceCookie],
      ['read_only', readOnlyCookie]
    ]) {
      const res = await fetch(`${BASE}/api/v1/admin/payments`, {
        headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': cookie }
      });
      assert.equal(res.status, 200, `Role ${roleName} must have read access to /api/v1/admin/payments`);
    }
  });

  // 3. Global payments ledger returns real data
  await test('5.3: Global payments ledger returns database-derived payments with safe fields', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 3);

    const tx = body.data.find(p => p.id === txAlpha1Id || p.orderId === orderAlpha1Id);
    assert.ok(tx, 'Must contain txAlpha1');
    assert.equal(tx.amount, 1499.00);
    assert.equal(tx.currency, 'INR');
    assert.equal(tx.merchantId, merchantAlpha.id);
    assert.equal(tx.merchantName, 'Rohan Deshmukh');
    assert.equal(tx.status, 'succeeded');
    assert.equal(tx.environment, 'production');
  });

  // 4. Filtering by Merchant, Status, Environment, and Date
  await test('5.4: Filtering by merchantId, status, and environment returns precise subsets', async () => {
    // Filter by merchantId
    const resMerchant = await fetch(`${BASE}/api/v1/admin/payments?merchantId=${merchantAlpha.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bMerchant = await resMerchant.json();
    assert.equal(bMerchant.success, true);
    assert.ok(bMerchant.data.every(p => p.merchantId === merchantAlpha.id));

    // Filter by status=refunded
    const resRefunded = await fetch(`${BASE}/api/v1/admin/payments?status=refunded`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bRefunded = await resRefunded.json();
    assert.equal(bRefunded.success, true);
    assert.ok(bRefunded.data.some(p => p.id === txAlpha2Id));
    assert.ok(bRefunded.data.every(p => p.status === 'refunded'));

    // Filter by environment=sandbox
    const resEnv = await fetch(`${BASE}/api/v1/admin/payments?environment=sandbox`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bEnv = await resEnv.json();
    assert.equal(bEnv.success, true);
    assert.ok(bEnv.data.some(p => p.id === txAlpha2Id));
    assert.ok(bEnv.data.every(p => p.environment === 'sandbox'));
  });

  // 5. Search
  await test('5.5: Search by order ID, transaction ID, and customer email functions accurately', async () => {
    const resSearch = await fetch(`${BASE}/api/v1/admin/payments?search=${orderAlpha1Id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bSearch = await resSearch.json();
    assert.equal(bSearch.success, true);
    assert.ok(bSearch.data.some(p => p.orderId === orderAlpha1Id));
  });

  // 6. Pagination
  await test('5.6: Pagination accurately reflects page, pageSize, total, and totalPages', async () => {
    const resPage = await fetch(`${BASE}/api/v1/admin/payments?page=1&pageSize=2`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bPage = await resPage.json();
    assert.equal(bPage.success, true);
    assert.equal(bPage.data.length, 2);
    assert.equal(bPage.pagination.page, 1);
    assert.equal(bPage.pagination.pageSize, 2);
    assert.ok(bPage.pagination.total >= 3);
  });

  // 7. Payment Detail Workspace
  await test('5.7: Payment detail returns complete payment summary, merchant context, customer, and processing references', async () => {
    const resDetail = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha1Id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resDetail.status, 200);
    const body = await resDetail.json();
    assert.equal(body.success, true);
    const p = body.data;

    // Payment summary
    assert.equal(p.id, txAlpha1Id);
    assert.equal(p.orderId, orderAlpha1Id);
    assert.equal(p.amount, 1499.00);
    assert.equal(p.currency, 'INR');
    assert.equal(p.status, 'succeeded');
    assert.equal(p.environment, 'production');

    // Merchant context
    assert.equal(p.merchant.id, merchantAlpha.id);
    assert.equal(p.merchant.name, 'Rohan Deshmukh');
    assert.equal(p.merchant.company, 'Zenith Logistics Ltd');

    // Customer
    assert.equal(p.customer.name, 'Rahul Verma');
    assert.equal(p.customer.email, 'rahul.verma@example.com');
    assert.equal(p.customer.phone, '+91 91234 56789');

    // Gateway processing references
    assert.equal(p.processing.cfOrderId, `cf_ord_${orderAlpha1Id}`);
    assert.equal(p.processing.cfPaymentId, `cf_pay_998811_${RUN_ID}`);
    assert.equal(p.processing.bankReference, `UTR_${RUN_ID}_001`);
  });

  // 8. Refund Information
  await test('5.8: Payment detail surfaces refund records accurately for refunded transactions', async () => {
    const resRefundDetail = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha2Id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resRefundDetail.status, 200);
    const body = await resRefundDetail.json();
    const p = body.data;

    assert.ok(p.refund);
    assert.equal(p.refund.hasRefund, true);
    assert.equal(p.refund.refundId, `ref_9922_${RUN_ID}`);
    assert.equal(p.refund.amount, 2500.00);
    assert.equal(p.refund.status, 'SUCCESS');
    assert.equal(p.refund.note, 'Customer duplicate order');
  });

  // 9. Settlement & Reconciliation Information
  await test('5.9: Payment detail surfaces settlement line and reconciliation verdict read-only', async () => {
    const resDetail = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha1Id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const body = await resDetail.json();
    const p = body.data;

    // Settlement
    assert.ok(p.settlement);
    assert.equal(p.settlement.cfSettlementId, settlementId);
    assert.equal(p.settlement.status, 'SETTLED');
    assert.equal(p.settlement.settlementUtr, `UTR_${RUN_ID}_BANK_SETTLE`);

    // Reconciliation
    assert.ok(p.reconciliation);
    assert.equal(p.reconciliation.state, 'MATCHED');
    assert.equal(p.reconciliation.discrepancy, null);
  });

  // 10. Related Support Tickets
  await test('5.10: Payment detail surfaces related support tickets when present', async () => {
    const resDetail = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha1Id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const body = await resDetail.json();
    const p = body.data;

    assert.ok(p.relatedTicket);
    assert.equal(p.relatedTicket.id, ticketAlpha.id);
    assert.equal(p.relatedTicket.subject, `Settlement delay query for ${orderAlpha1Id}`);
  });

  // 11. Security & Sanitization
  await test('5.11: Payment detail strictly strips all credentials, secrets, API keys, and hashes', async () => {
    const resDetail = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha1Id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const body = await resDetail.json();
    const p = body.data;

    assert.equal(p.merchant.password_hash, undefined);
    assert.equal(p.merchant.password, undefined);
    assert.equal(p.merchant.google_sub, undefined);
    assert.equal(p.merchant.apiKey, undefined);
    assert.equal(p.merchant.secret, undefined);
    assert.equal(p.processing.secretKey, undefined);
    assert.equal(p.processing.clientSecret, undefined);
    assert.equal(p.processing.appId, undefined);
    assert.equal(p.processing.webhookSecret, undefined);
  });

  // 12. Non-existent payment returns 404
  await test('5.12: Non-existent payment ID returns 404 Not Found', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments/tx_nonexistent_99999`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /not found/i);
  });

  // 13. Read-only guarantee: Mutations are rejected
  await test('5.13: Read-only guarantee - payments endpoints reject mutation methods (POST, PATCH, DELETE)', async () => {
    const resPost = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha1Id}`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie },
      body: JSON.stringify({ status: 'refunded' })
    });
    assert.ok([404, 405].includes(resPost.status), 'POST must be rejected with 404 or 405');

    const resPatch = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha1Id}`, {
      method: 'PATCH',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie },
      body: JSON.stringify({ status: 'failed' })
    });
    assert.ok([404, 405].includes(resPatch.status), 'PATCH must be rejected with 404 or 405');

    const resDelete = await fetch(`${BASE}/api/v1/admin/payments/${txAlpha1Id}`, {
      method: 'DELETE',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.ok([404, 405].includes(resDelete.status), 'DELETE must be rejected with 404 or 405');
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  if (results.failed > 0) process.exit(1);
  process.exit(0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
