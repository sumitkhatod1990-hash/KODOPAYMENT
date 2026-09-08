// Phase 2C-5B: Payment Lifecycle & Reconciliation Operations Integration Test Suite
// Verifies all 18 requirements:
// 1. Admin authentication required (401 without cookie)
// 2. client.qivropay.com host required (403 for merchant or evil hosts)
// 3. super_admin can refresh payment status
// 4. compliance_officer can refresh payment status
// 5. support_agent cannot refresh payment status (403)
// 6. read_only cannot refresh payment status (403)
// 7. super_admin can refresh reconciliation
// 8. compliance_officer can refresh reconciliation, support/readonly rejected (403)
// 9. refresh uses authoritative Cashfree status
// 10. refresh cannot manually set an arbitrary status
// 11. repeated refresh does not duplicate accounting
// 12. concurrent refreshes do not duplicate accounting
// 13. failed Cashfree request does not mutate payment incorrectly
// 14. reconciliation refresh does not fabricate settlement data
// 15. audit log is created for refresh operations
// 16. audit log contains no secrets
// 17. existing refund state remains unchanged by payment refresh
// 18. tenant/payment isolation remains intact (404 on missing payment)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 5300 + crypto.randomInt(0, 150);

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';

process.env.CASHFREE_APP_ID = 'test_cf_app_id';
process.env.CASHFREE_SECRET_KEY = 'test_cf_secret_key_very_secret_12345';
process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_api_key_67890';

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
    console.error(`    ${err.stack || err.message}`);
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
  throw new Error('Server timed out waiting to start');
}

// Cashfree Gateway Mock Interceptor
const REAL_FETCH = globalThis.fetch;
let mockCashfreeOrderResponses = new Map(); // orderId -> { status, body }
let mockCashfreeSettlementResponses = new Map(); // orderId -> { status, body }
let cashfreeOrderCalls = [];

globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input?.url || '');
  if (url.includes('cashfree.com')) {
    if (url.includes('/settlements')) {
      const parts = url.split('/orders/')[1]?.split('/settlements')[0];
      const orderId = decodeURIComponent(parts || '');
      if (mockCashfreeSettlementResponses.has(orderId)) {
        const { status, body } = mockCashfreeSettlementResponses.get(orderId);
        return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ message: 'Settlement not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.includes('/orders/')) {
      const orderId = decodeURIComponent(url.split('/orders/')[1]?.split('/')[0]?.split('?')[0] || '');
      cashfreeOrderCalls.push({ url, orderId, method: init?.method || 'GET' });
      if (mockCashfreeOrderResponses.has(orderId)) {
        const { status, body } = mockCashfreeOrderResponses.get(orderId);
        return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ message: 'Order not found on Cashfree' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
  }
  return REAL_FETCH(input, init);
};

async function run() {
  await waitForServer();

  const {
    createAdminUser,
    createUser,
    saveResource,
    getResource,
    listResources,
    listAdminAuditLogs,
    createPartnerMerchantMapping
  } = await import('../neonStore.js');

  const superPassword = 'SuperAdminPass2026!#$';

  const superAdmin = await createAdminUser({
    email: `super.c5b.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Admin C5B',
    role: 'super_admin'
  });

  const supportAdmin = await createAdminUser({
    email: `support.c5b.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Support Agent C5B',
    role: 'support_agent'
  });

  const complianceAdmin = await createAdminUser({
    email: `compliance.c5b.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Compliance Officer C5B',
    role: 'compliance_officer'
  });

  const readOnlyAdmin = await createAdminUser({
    email: `readonly.c5b.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Read Only C5B',
    role: 'read_only'
  });

  // Log in admins to get session cookies
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

  // Setup test merchant
  const testMerchant = await createUser({
    email: `merchant.c5b.${RUN_ID}@business.in`,
    password: 'MerchantPass2026!#$',
    name: 'Aarav Patel',
    company: 'Patel Enterprise'
  });

  await createPartnerMerchantMapping({
    merchantId: testMerchant.id,
    cfMerchantId: `cf_sub_${RUN_ID}`,
    onboardingStatus: 'COMPLETED',
    kycStatus: 'VERIFIED',
    activationStatus: 'ACTIVE'
  });

  // Create standard test transactions
  const orderPendingId = `qv_order_pending_${RUN_ID}`;
  await saveResource(testMerchant.id, 'transaction', {
    id: orderPendingId,
    orderId: orderPendingId,
    amount: 1499,
    currency: 'INR',
    status: 'pending',
    customerEmail: `customer.c5b.${RUN_ID}@example.com`,
    customerName: 'Pooja Sharma',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString() // 40m ago, should be stale
  });

  const orderSucceededId = `qv_order_succ_${RUN_ID}`;
  await saveResource(testMerchant.id, 'transaction', {
    id: orderSucceededId,
    orderId: orderSucceededId,
    amount: 2999,
    currency: 'INR',
    status: 'succeeded',
    customerEmail: `customer.c5b.${RUN_ID}@example.com`,
    customerName: 'Pooja Sharma',
    createdAt: new Date().toISOString()
  });

  const orderRefundedId = `qv_order_ref_${RUN_ID}`;
  await saveResource(testMerchant.id, 'transaction', {
    id: orderRefundedId,
    orderId: orderRefundedId,
    amount: 999,
    currency: 'INR',
    status: 'refunded',
    refundStatus: 'SUCCESS',
    refundId: `rfnd_${RUN_ID}`,
    refundedAmount: 999,
    customerEmail: `customer.c5b.${RUN_ID}@example.com`,
    customerName: 'Pooja Sharma',
    createdAt: new Date().toISOString()
  });

  // Setup mock gateway responses
  mockCashfreeOrderResponses.set(orderPendingId, {
    status: 200,
    body: {
      order_id: orderPendingId,
      cf_order_id: `cf_order_num_${RUN_ID}_1`,
      order_amount: 1499,
      order_currency: 'INR',
      order_status: 'PAID',
      customer_details: {
        customer_email: `customer.c5b.${RUN_ID}@example.com`,
        customer_name: 'Pooja Sharma'
      }
    }
  });

  mockCashfreeOrderResponses.set(orderRefundedId, {
    status: 200,
    body: {
      order_id: orderRefundedId,
      cf_order_id: `cf_order_num_${RUN_ID}_ref`,
      order_amount: 999,
      order_currency: 'INR',
      order_status: 'PAID',
      customer_details: {
        customer_email: `customer.c5b.${RUN_ID}@example.com`,
        customer_name: 'Pooja Sharma'
      }
    }
  });

  mockCashfreeSettlementResponses.set(orderSucceededId, {
    status: 200,
    body: {
      settlement_details: {
        cf_settlement_id: `cf_settle_${RUN_ID}`,
        status: 'SUCCESS',
        settlement_utr: 'UTR2026090812345678',
        settlement_currency: 'INR'
      },
      payment_details: {
        cf_payment_id: `cf_pay_${RUN_ID}`,
        payment_amount: 2999,
        settlement_amount: 2940.50
      }
    }
  });

  console.log('QivroPay Admin Panel — Phase 2C-5B Test Suite');
  console.log('----------------------------------------------------');

  // 1. Admin Authentication Required
  await test('5B.1: Refresh endpoints require admin authentication (401 without cookie)', async () => {
    const resStatus = await fetch(`${BASE}/api/v1/admin/payments/${orderPendingId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resStatus.status, 401, 'Status refresh must return 401 unauthenticated');

    const resRecon = await fetch(`${BASE}/api/v1/admin/payments/${orderSucceededId}/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resRecon.status, 401, 'Recon refresh must return 401 unauthenticated');
  });

  // 2. Host Isolation Enforced
  await test('5B.2: Refresh endpoints reject non-admin and malicious lookalike hosts (403)', async () => {
    const resMerchantHost = await fetch(`${BASE}/api/v1/admin/payments/${orderPendingId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resMerchantHost.status, 403, 'Merchant domain qivropay.com must be rejected');

    const resEvilHost = await fetch(`${BASE}/api/v1/admin/payments/${orderPendingId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com.attacker.test', 'Cookie': superCookie }
    });
    assert.equal(resEvilHost.status, 403, 'Lookalike host must be rejected');
  });

  // 3. super_admin can refresh payment status
  await test('5B.3: super_admin can refresh payment status and derives authoritative PAID status', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderPendingId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200, 'super_admin must be allowed to refresh payment status');
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'succeeded', 'Status must be updated to succeeded following gateway PAID');
    assert.equal(body.data.processing.gatewayStatus, 'PAID');
    assert.ok(body.data.updatedAt, 'updatedAt timestamp must be populated');
  });

  // 4. compliance_officer can refresh payment status
  await test('5B.4: compliance_officer can refresh payment status', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderPendingId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': complianceCookie }
    });
    assert.equal(res.status, 200, 'compliance_officer must be allowed to refresh payment status');
    const body = await res.json();
    assert.equal(body.success, true);
  });

  // 5. support_agent cannot refresh payment status
  await test('5B.5: support_agent cannot refresh payment status (403 Forbidden)', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderPendingId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(res.status, 403, 'support_agent must receive 403 Forbidden');
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.includes('Insufficient administrative privileges'));
  });

  // 6. read_only cannot refresh payment status
  await test('5B.6: read_only cannot refresh payment status (403 Forbidden)', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderPendingId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': readOnlyCookie }
    });
    assert.equal(res.status, 403, 'read_only must receive 403 Forbidden');
  });

  // 7. super_admin can refresh reconciliation
  await test('5B.7: super_admin can refresh reconciliation and gets MATCHED verdict', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderSucceededId}/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200, 'super_admin must be allowed to refresh reconciliation');
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.reconciliation.state, 'MATCHED');
    assert.equal(body.data.reconciliation.state, 'MATCHED');
  });

  // 8. compliance_officer can refresh reconciliation, support and read_only rejected
  await test('5B.8: compliance_officer can refresh reconciliation; support_agent and read_only are 403', async () => {
    const resCompliance = await fetch(`${BASE}/api/v1/admin/payments/${orderSucceededId}/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': complianceCookie }
    });
    assert.equal(resCompliance.status, 200, 'compliance_officer must be allowed to refresh reconciliation');

    const resSupport = await fetch(`${BASE}/api/v1/admin/payments/${orderSucceededId}/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(resSupport.status, 403, 'support_agent must receive 403 on reconciliation refresh');

    const resReadOnly = await fetch(`${BASE}/api/v1/admin/payments/${orderSucceededId}/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': readOnlyCookie }
    });
    assert.equal(resReadOnly.status, 403, 'read_only must receive 403 on reconciliation refresh');
  });

  // 9. Reconciliation cannot be run on non-succeeded payment
  await test('5B.9: Reconciliation refresh rejects non-succeeded payment (400)', async () => {
    const orderFailedId = `qv_order_fail_${RUN_ID}`;
    await saveResource(testMerchant.id, 'transaction', {
      id: orderFailedId,
      orderId: orderFailedId,
      amount: 500,
      status: 'failed',
      createdAt: new Date().toISOString()
    });

    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderFailedId}/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 400, 'Reconciliation of failed payment must return 400');
    const body = await res.json();
    assert.ok(body.error.includes('Only a succeeded payment'));
  });

  // 10. Refresh cannot manually set arbitrary status
  await test('5B.10: Status refresh cannot manually override status from request body', async () => {
    const orderTerminalFailedId = `qv_order_termfail_${RUN_ID}`;
    await saveResource(testMerchant.id, 'transaction', {
      id: orderTerminalFailedId,
      orderId: orderTerminalFailedId,
      amount: 799,
      status: 'pending',
      customerEmail: `customer.c5b.${RUN_ID}@example.com`,
      createdAt: new Date().toISOString()
    });

    mockCashfreeOrderResponses.set(orderTerminalFailedId, {
      status: 200,
      body: {
        order_id: orderTerminalFailedId,
        order_amount: 799,
        order_status: 'FAILED'
      }
    });

    // Admin attempts to send { status: 'succeeded' } in body
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderTerminalFailedId}/refresh-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie },
      body: JSON.stringify({ status: 'succeeded' })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.status, 'failed', 'Status must follow gateway FAILED, completely ignoring manual body override');
  });

  // 11. Repeated refresh does not duplicate accounting
  await test('5B.11: Repeated status refreshes do not duplicate customer spend accounting', async () => {
    const orderRepeatId = `qv_order_repeat_${RUN_ID}`;
    const email = `repeat.spend.${RUN_ID}@example.com`;
    await saveResource(testMerchant.id, 'transaction', {
      id: orderRepeatId,
      orderId: orderRepeatId,
      amount: 1200,
      status: 'pending',
      customerEmail: email,
      createdAt: new Date().toISOString()
    });

    mockCashfreeOrderResponses.set(orderRepeatId, {
      status: 200,
      body: {
        order_id: orderRepeatId,
        order_amount: 1200,
        order_status: 'PAID',
        customer_details: { customer_email: email }
      }
    });

    // Invoke refresh 3 times consecutively
    await fetch(`${BASE}/api/v1/admin/payments/${orderRepeatId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    await fetch(`${BASE}/api/v1/admin/payments/${orderRepeatId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    await fetch(`${BASE}/api/v1/admin/payments/${orderRepeatId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });

    const customers = await listResources(testMerchant.id, 'customer');
    const customer = customers.find(c => c.email === email);
    assert.equal(customer?.totalSpent, 1200, 'Customer spend must be exactly 1200 after 3 repeated refreshes');
  });

  // 12. Concurrent refreshes do not duplicate accounting
  await test('5B.12: Concurrent status refreshes do not duplicate accounting', async () => {
    const orderConcurrentId = `qv_order_conc_${RUN_ID}`;
    const email = `conc.spend.${RUN_ID}@example.com`;
    await saveResource(testMerchant.id, 'transaction', {
      id: orderConcurrentId,
      orderId: orderConcurrentId,
      amount: 800,
      status: 'pending',
      customerEmail: email,
      createdAt: new Date().toISOString()
    });

    mockCashfreeOrderResponses.set(orderConcurrentId, {
      status: 200,
      body: {
        order_id: orderConcurrentId,
        order_amount: 800,
        order_status: 'PAID',
        customer_details: { customer_email: email }
      }
    });

    // Fire 5 concurrent requests simultaneously
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        fetch(`${BASE}/api/v1/admin/payments/${orderConcurrentId}/refresh-status`, {
          method: 'POST',
          headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
        })
      )
    );

    for (const r of responses) {
      assert.equal(r.status, 200);
    }

    const customers = await listResources(testMerchant.id, 'customer');
    const customer = customers.find(c => c.email === email);
    assert.equal(customer?.totalSpent, 800, 'Customer spend must remain exactly 800 despite 5 concurrent refreshes');
  });

  // 13. Failed Cashfree request does not mutate payment incorrectly
  await test('5B.13: Cashfree gateway failure returns 502 and does not corrupt payment state', async () => {
    const orderFailReqId = `qv_order_gw_fail_${RUN_ID}`;
    await saveResource(testMerchant.id, 'transaction', {
      id: orderFailReqId,
      orderId: orderFailReqId,
      amount: 450,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    mockCashfreeOrderResponses.set(orderFailReqId, {
      status: 500,
      body: { message: 'Cashfree internal server error' }
    });

    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderFailReqId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 502, 'Expected 502 Bad Gateway on Cashfree error');

    // Confirm state was not altered
    const tx = await getResource(testMerchant.id, 'transaction', orderFailReqId);
    assert.equal(tx.status, 'pending', 'Payment status must remain pending');
  });

  // 14. Reconciliation refresh does not fabricate settlement data
  await test('5B.14: Reconciliation refresh does not fabricate settlement when not found', async () => {
    const orderNoSettleId = `qv_order_no_settle_${RUN_ID}`;
    await saveResource(testMerchant.id, 'transaction', {
      id: orderNoSettleId,
      orderId: orderNoSettleId,
      amount: 1500,
      status: 'succeeded',
      createdAt: new Date().toISOString()
    });

    // Mock returns 404 for settlement
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderNoSettleId}/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.reconciliation.state, 'UNMATCHED', 'Reconciliation state must be UNMATCHED, never fake MATCHED');
  });

  // 15. Audit log is created for refresh operations
  await test('5B.15: Audit logs are recorded for status and reconciliation refresh', async () => {
    const logs = await listAdminAuditLogs(100);
    const statusLog = logs.find(l => l.action === 'PAYMENT_STATUS_REFRESH');
    assert.ok(statusLog, 'Audit log for PAYMENT_STATUS_REFRESH must exist');
    assert.equal(statusLog.admin_id, superAdmin.id);
    assert.equal(statusLog.target_merchant_id, testMerchant.id);

    const reconLog = logs.find(l => l.action === 'RECONCILIATION_REFRESH');
    assert.ok(reconLog, 'Audit log for RECONCILIATION_REFRESH must exist');
  });

  // 16. Audit log contains no secrets
  await test('5B.16: Audit log records strictly contain no credentials, keys, or secrets', async () => {
    const logs = await listAdminAuditLogs(100);
    for (const log of logs) {
      const serialized = JSON.stringify(log);
      assert.ok(!serialized.includes(process.env.CASHFREE_SECRET_KEY), 'Audit log must not contain CASHFREE_SECRET_KEY');
      assert.ok(!serialized.includes(process.env.CASHFREE_PARTNER_API_KEY), 'Audit log must not contain CASHFREE_PARTNER_API_KEY');
      assert.ok(!serialized.includes(superPassword), 'Audit log must not contain passwords');
    }
  });

  // 17. Existing refund state remains unchanged by payment refresh
  await test('5B.17: Existing refund state and amounts remain intact after payment refresh', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments/${orderRefundedId}/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.status, 'refunded', 'Status must remain refunded');
    assert.equal(body.data.refund.hasRefund, true);
    assert.equal(body.data.refund.refundId, `rfnd_${RUN_ID}`);
    assert.equal(body.data.refund.amount, 999);
  });

  // 18. Tenant / payment isolation intact (404 on missing payment)
  await test('5B.18: Refreshing nonexistent payment ID returns 404', async () => {
    const resStatus = await fetch(`${BASE}/api/v1/admin/payments/tx_nonexistent_999/refresh-status`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resStatus.status, 404, 'Status refresh on unknown payment must return 404');

    const resRecon = await fetch(`${BASE}/api/v1/admin/payments/tx_nonexistent_999/refresh-reconciliation`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resRecon.status, 404, 'Recon refresh on unknown payment must return 404');
  });

  console.log('----------------------------------------------------');
  console.log(`Phase 2C-5B Test Results: ${results.passed} passed, ${results.failed} failed`);
  if (results.failed > 0) process.exit(1);
  process.exit(0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
