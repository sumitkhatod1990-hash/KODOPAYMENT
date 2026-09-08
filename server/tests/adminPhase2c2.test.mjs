// Phase 2C-2: Client 360 Workspace Verification Test Suite
// Verifies:
// 1. Client 360 API data consumption for real merchant (account, onboarding, payments, products, links, customers, support, chat, activity)
// 2. Data masking & sanitization (zero password_hash, zero google_sub, zero partner secrets)
// 3. Strict tenant isolation (Merchant A's 360 contains 0 records from Merchant B)
// 4. Invalid merchant ID yields clean 404
// 5. Onboarding KYC sync integration and RBAC permissions
// 6. Products integration in Client 360

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4960 + crypto.randomInt(0, 30);

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
  const deadline = Date.now() + 15000;
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
    createPartnerMerchantMapping,
    updatePartnerMerchantStatus,
    createCheckoutSession,
    createSupportTicket,
    saveSupportChatSession
  } = await import('../neonStore.js');

  const superPassword = 'SuperAdminPass2026!#$';
  const superAdmin = await createAdminUser({
    email: `super.c2.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Admin C2',
    role: 'super_admin'
  });

  const supportAdmin = await createAdminUser({
    email: `support.c2.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Support Agent C2',
    role: 'support_agent'
  });

  // Login admins to obtain cookies
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

  // Seed Merchant Alpha
  const merchantAlpha = await createUser({
    email: `alpha.${RUN_ID}@business.example.com`,
    name: `Alpha Founder ${RUN_ID}`,
    company: `Alpha Logistics ${RUN_ID} Pvt Ltd`,
    password: 'MerchantPass2026!#$'
  });

  // Seed Merchant Profile for Alpha
  await saveResource(merchantAlpha.id, 'merchant_profile', {
    id: 'profile',
    phone: '+91 9876543210',
    website: 'https://alpha-logistics.example.com',
    businessCategory: 'Logistics & Supply Chain'
  });

  // Seed Products for Alpha
  await saveResource(merchantAlpha.id, 'product', {
    id: `prod_a1_${RUN_ID}`,
    name: 'Standard Freight Handling',
    price: 4500,
    currency: 'INR',
    status: 'active',
    createdAt: new Date().toISOString()
  });

  // Seed Partner Mapping for Alpha
  await createPartnerMerchantMapping({
    merchantId: merchantAlpha.id,
    cfMerchantId: `CF_ALPHA_${RUN_ID}`
  });
  await updatePartnerMerchantStatus(merchantAlpha.id, {
    onboardingStatus: 'COMPLETED',
    kycStatus: 'APPROVED',
    fullKycStatus: 'APPROVED',
    activationStatus: 'ACTIVE',
    transactionAccess: 'ALLOWED'
  });

  // Seed Transactions for Alpha
  await saveResource(merchantAlpha.id, 'transaction', {
    id: `tx_alpha_${RUN_ID}`,
    orderId: `ord_alpha_${RUN_ID}`,
    amount: 4500,
    currency: 'INR',
    status: 'succeeded',
    customerEmail: 'customer@alpha.example.com',
    customerName: 'Customer One',
    paymentMethod: 'cashfree',
    createdAt: new Date().toISOString()
  });

  // Seed Checkout Session for Alpha
  await createCheckoutSession({
    sessionId: `cs_alpha_${RUN_ID}`,
    merchantId: merchantAlpha.id,
    totalAmount: 4500,
    currency: 'INR',
    status: 'completed',
    createdAt: new Date().toISOString()
  });

  // Seed Customer for Alpha
  await saveResource(merchantAlpha.id, 'customer', {
    id: `cust_alpha_${RUN_ID}`,
    name: 'Customer One',
    email: 'customer@alpha.example.com',
    totalSpent: 4500,
    lastActive: new Date().toISOString()
  });

  // Seed Support Ticket for Alpha
  await createSupportTicket({
    userId: merchantAlpha.id,
    name: merchantAlpha.name,
    email: merchantAlpha.email,
    subject: 'Webhook signature verification question',
    category: 'API & Webhooks',
    message: 'Can we configure multiple endpoints?',
    priority: 'normal'
  });

  // Seed Support Chat for Alpha
  await saveSupportChatSession({
    sessionId: `chat_alpha_${RUN_ID}`,
    merchantId: merchantAlpha.id,
    mode: 'authenticated',
    messages: [
      { role: 'user', content: 'What is the payout schedule?', timestamp: new Date().toISOString() },
      { role: 'assistant', content: 'Payouts are processed T+1.', timestamp: new Date().toISOString() }
    ]
  });

  // Seed Merchant Beta (to verify isolation)
  const merchantBeta = await createUser({
    email: `beta.${RUN_ID}@business.example.com`,
    name: `Beta Founder ${RUN_ID}`,
    company: `Beta Freight ${RUN_ID} Ltd`,
    password: 'MerchantPass2026!#$'
  });
  await saveResource(merchantBeta.id, 'transaction', {
    id: `tx_beta_${RUN_ID}`,
    orderId: `ord_beta_${RUN_ID}`,
    amount: 9999,
    currency: 'INR',
    status: 'succeeded',
    customerEmail: 'cust.beta@example.com',
    createdAt: new Date().toISOString()
  });

  console.log('\nClient 360 Workspace (Phase 2c-2) Test Suite\n');

  // 1. Client 360 API Payload Verification
  await test('1.1: GET /admin/clients/:id/360 aggregates all required sections with truthful data', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/clients/${merchantAlpha.id}/360`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': superCookie
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const d = body.data;

    // Account
    assert.equal(d.account.merchantId, merchantAlpha.id);
    assert.equal(d.account.name, merchantAlpha.name);
    assert.equal(d.account.email, merchantAlpha.email);
    assert.equal(d.account.company, merchantAlpha.company);
    assert.equal(d.account.phone, '+91 9876543210');
    assert.equal(d.account.website, 'https://alpha-logistics.example.com');
    assert.equal(d.account.authProvider, 'email');

    // Onboarding
    assert.equal(d.onboarding.hasMapping, true);
    assert.equal(d.onboarding.cfMerchantId, `CF_ALPHA_${RUN_ID}`);
    assert.equal(d.onboarding.onboardingStatus, 'COMPLETED');
    assert.equal(d.onboarding.kycStatus, 'APPROVED');
    assert.equal(d.onboarding.activationStatus, 'ACTIVE');

    // Payments
    assert.equal(d.payments.summary.totalCount, 1);
    assert.equal(d.payments.summary.successfulCount, 1);
    assert.equal(d.payments.summary.totalVolume, 4500);
    assert.equal(d.payments.recentTransactions.length, 1);
    assert.equal(d.payments.recentTransactions[0].orderId, `ord_alpha_${RUN_ID}`);

    // Products
    assert.ok(Array.isArray(d.products));
    assert.equal(d.products.length, 1);
    assert.equal(d.products[0].name, 'Standard Freight Handling');
    assert.equal(d.products[0].amount, 4500);

    // Payment links
    assert.equal(d.paymentLinks.length, 1);
    assert.equal(d.paymentLinks[0].sessionId, `cs_alpha_${RUN_ID}`);

    // Customers
    assert.equal(d.customers.totalCustomers, 1);
    assert.equal(d.customers.recentCustomers[0].email, 'customer@alpha.example.com');

    // Support
    assert.equal(d.support.totalTickets, 1);
    assert.equal(d.support.recentTickets[0].subject, 'Webhook signature verification question');

    // Chat
    assert.equal(d.chat.totalSessions, 1);
    assert.equal(d.chat.recentSessions[0].id, `chat_alpha_${RUN_ID}`);

    // Activity
    assert.ok(Array.isArray(d.activity));
    assert.ok(d.activity.length >= 3);
  });

  // 2. Data Sanitization & Security
  await test('1.2: Client 360 strictly strips sensitive credentials, hashes, and internal secrets', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/clients/${merchantAlpha.id}/360`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': superCookie
      }
    });
    const body = await res.json();
    const d = body.data;

    assert.equal(d.account.password_hash, undefined);
    assert.equal(d.account.password, undefined);
    assert.equal(d.account.google_id, undefined);
    assert.equal(d.account.google_sub, undefined);
    assert.equal(d.account.apiKey, undefined);
    assert.equal(d.account.secret, undefined);
    assert.equal(d.onboarding.clientSecret, undefined);
    assert.equal(d.onboarding.cfSecretKey, undefined);
  });

  // 3. Strict Tenant Isolation
  await test('1.3: Client 360 strictly isolates tenant data (Zero cross-merchant leakage)', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/clients/${merchantAlpha.id}/360`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': superCookie
      }
    });
    const body = await res.json();
    const d = body.data;

    // Verify Merchant Beta's transaction is NEVER in Alpha's view
    assert.ok(!d.payments.recentTransactions.some(t => t.id.includes(merchantBeta.id) || t.orderId === `ord_beta_${RUN_ID}`));
    assert.equal(d.payments.summary.totalVolume, 4500, 'Volume must not include merchant Beta');
  });

  // 4. Invalid Merchant ID 404
  await test('1.4: Non-existent merchant ID returns 404 Not Found', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/clients/usr_nonexistent_999999/360`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': superCookie
      }
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /not found/i);
  });

  // 5. Onboarding KYC Sync Integration & RBAC
  await test('1.5: Super Admin can trigger partner KYC sync (200/502); Support Agent is rejected with 403', async () => {
    // Super Admin syncs successfully (200 or 502 in test mode without live partner credentials)
    const resSuper = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantAlpha.id}/sync`, {
      method: 'POST',
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': superCookie
      }
    });
    assert.ok([200, 502].includes(resSuper.status), `Sync status must be 200 or 502, got ${resSuper.status}`);

    // Support Agent sync is rejected with 403 Forbidden
    const resSupport = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantAlpha.id}/sync`, {
      method: 'POST',
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      }
    });
    assert.equal(resSupport.status, 403);
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
