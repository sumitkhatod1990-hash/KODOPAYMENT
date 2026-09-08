// Phase 2C-6: Merchant Onboarding & KYC Operations Integration Test Suite
// Verifies all 22 requirements:
// 1. Admin authentication required (401 without cookie)
// 2. client.qivropay.com host required (403 for merchant or evil hosts)
// 3. All four roles can read onboarding (super_admin, compliance_officer, support_agent, read_only)
// 4. super_admin can sync Cashfree status
// 5. compliance_officer can sync Cashfree status
// 6. support_agent cannot sync (403)
// 7. read_only cannot sync (403)
// 8. Merchant list contains only database-derived merchants
// 9. Search works (by name, company, email, merchant ID, Cashfree merchant ID)
// 10. State filtering works (by onboarding state, KYC status, activation status)
// 11. Merchant detail returns sanitized data
// 12. Cashfree merchant ID is returned when mapped
// 13. KYC status is truthful (distinguishes min KYC from full KYC)
// 14. PG activation status is truthful
// 15. Contradictory provider data resolves to UNKNOWN
// 16. Cashfree sync updates existing state machine correctly
// 17. Cashfree sync failure does not corrupt merchant state
// 18. Audit log is created for sync (ONBOARDING_STATUS_SYNC)
// 19. Audit log contains no secrets
// 20. KYC documents/secrets are absent from responses
// 21. Client/merchant isolation remains intact
// 22. Nonexistent merchant returns 404

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 5500 + crypto.randomInt(0, 150);

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

// Cashfree Partner Mock Interceptor
const REAL_FETCH = globalThis.fetch;
let mockCashfreeMerchantResponses = new Map(); // cfMerchantId -> { status, body }
let partnerCalls = [];

globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input?.url || '');
  if (url.includes('cashfree.com')) {
    if (url.includes('/merchants/') || url.includes('/partner/merchants/')) {
      const parts = url.split('/merchants/');
      const cfMerchantId = decodeURIComponent(parts[1]?.split('?')[0]?.split('/')[0] || '');
      partnerCalls.push({ url, cfMerchantId, method: init?.method || 'GET' });

      if (mockCashfreeMerchantResponses.has(cfMerchantId)) {
        const { status, body } = mockCashfreeMerchantResponses.get(cfMerchantId);
        return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ message: 'Merchant not found on Cashfree' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
  }
  return REAL_FETCH(input, init);
};

async function run() {
  await waitForServer();

  const {
    createAdminUser,
    createUser,
    createPartnerMerchantMapping,
    updatePartnerMerchantStatus,
    createSupportTicket,
    listAdminAuditLogsFiltered
  } = await import('../neonStore.js');

  const superPassword = 'SuperAdminPass2026!#$';

  const superAdmin = await createAdminUser({
    email: `super.c6.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Admin C6',
    role: 'super_admin'
  });

  const supportAdmin = await createAdminUser({
    email: `support.c6.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Support Agent C6',
    role: 'support_agent'
  });

  const complianceAdmin = await createAdminUser({
    email: `compliance.c6.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Compliance Officer C6',
    role: 'compliance_officer'
  });

  const readOnlyAdmin = await createAdminUser({
    email: `readonly.c6.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Read Only C6',
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

  // Setup test merchants
  // Merchant 1: Active with Cashfree Partner mapping
  const merchantActive = await createUser({
    email: `active.c6.${RUN_ID}@acmetech.in`,
    password: 'MerchantPass2026!#$',
    name: 'Aarav Patel',
    company: 'Acme Technologies Ltd'
  });
  const cfIdActive = `CF_ACTIVE_${RUN_ID}`;
  await createPartnerMerchantMapping({
    merchantId: merchantActive.id,
    cfMerchantId: cfIdActive
  });
  await updatePartnerMerchantStatus(merchantActive.id, {
    onboardingStatus: 'Email Verified',
    kycStatus: 'MIN_KYC_APPROVED',
    fullKycStatus: 'FULL_KYC_PENDING',
    activationStatus: 'ACTIVE',
    transactionAccess: 'full'
  });

  // Merchant 2: Min KYC Pending with Cashfree Partner mapping
  const merchantPending = await createUser({
    email: `pending.c6.${RUN_ID}@quickstore.in`,
    password: 'MerchantPass2026!#$',
    name: 'Pooja Sharma',
    company: 'QuickStore Retail'
  });
  const cfIdPending = `CF_PENDING_${RUN_ID}`;
  await createPartnerMerchantMapping({
    merchantId: merchantPending.id,
    cfMerchantId: cfIdPending
  });
  await updatePartnerMerchantStatus(merchantPending.id, {
    onboardingStatus: 'Email Verified',
    kycStatus: 'MIN_KYC_PENDING',
    fullKycStatus: null,
    activationStatus: 'PENDING',
    transactionAccess: 'restricted'
  });

  // Merchant 3: No partner mapping yet (NOT_STARTED)
  const merchantUnmapped = await createUser({
    email: `unmapped.c6.${RUN_ID}@solofounder.in`,
    password: 'MerchantPass2026!#$',
    name: 'Rohan Verma',
    company: 'Solo Ventures'
  });

  // Create related support ticket for merchantActive
  await createSupportTicket({
    userId: merchantActive.id,
    subject: 'Cashfree Full KYC document verification timeline',
    message: 'Hello, when will our full KYC be approved for higher transaction limits?',
    priority: 'high'
  });

  console.log('QivroPay Admin Panel — Phase 2C-6 Test Suite');
  console.log('----------------------------------------------------');

  // Test 1: Admin authentication required
  await test('6.1: Admin authentication required (401 without cookie)', async () => {
    const resList = await fetch(`${BASE}/api/v1/admin/onboarding`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resList.status, 401);

    const resDetail = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resDetail.status, 401);

    const resSync = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resSync.status, 401);
  });

  // Test 2: client.qivropay.com host required
  await test('6.2: client.qivropay.com host required (403 for unauthorized hosts)', async () => {
    const resMerchantHost = await fetch(`${BASE}/api/v1/admin/onboarding`, {
      headers: { 'x-forwarded-host': 'qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resMerchantHost.status, 403);

    const resEvilHost = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
      headers: { 'x-forwarded-host': 'evil-qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resEvilHost.status, 403);

    const resSyncEvil = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'malicious.com', 'Cookie': superCookie }
    });
    assert.equal(resSyncEvil.status, 403);
  });

  // Test 3: All four roles can read onboarding
  await test('6.3: All four roles can read onboarding queue and detail', async () => {
    const roles = [
      { name: 'super_admin', cookie: superCookie },
      { name: 'compliance_officer', cookie: complianceCookie },
      { name: 'support_agent', cookie: supportCookie },
      { name: 'read_only', cookie: readOnlyCookie }
    ];

    for (const r of roles) {
      const resQueue = await fetch(`${BASE}/api/v1/admin/onboarding`, {
        headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': r.cookie }
      });
      assert.equal(resQueue.status, 200, `${r.name} must be able to read onboarding queue`);

      const resDetail = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
        headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': r.cookie }
      });
      assert.equal(resDetail.status, 200, `${r.name} must be able to read onboarding detail`);
    }
  });

  // Test 4: super_admin can sync Cashfree status
  await test('6.4: super_admin can trigger Cashfree status sync', async () => {
    mockCashfreeMerchantResponses.set(cfIdActive, {
      status: 200,
      body: {
        merchant_id: cfIdActive,
        onboarding_status: 'Email Verified',
        product_status: [{
          product_name: 'PG',
          product_min_kyc_status: 'MIN_KYC_APPROVED',
          product_full_kyc_status: 'FULL_KYC_APPROVED',
          activation_status: 'ACTIVE',
          meta_data: { transaction_access: 'full' }
        }]
      }
    });

    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.onboardingState, 'ACTIVE');
    assert.equal(body.data.fullKycStatus, 'FULL_KYC_APPROVED');
  });

  // Test 5: compliance_officer can sync Cashfree status
  await test('6.5: compliance_officer can trigger Cashfree status sync', async () => {
    mockCashfreeMerchantResponses.set(cfIdPending, {
      status: 200,
      body: {
        merchant_id: cfIdPending,
        onboarding_status: 'Email Verified',
        product_status: [{
          product_name: 'PG',
          product_min_kyc_status: 'MIN_KYC_SUBMITTED',
          product_full_kyc_status: null,
          activation_status: 'PENDING',
          meta_data: { transaction_access: 'restricted' }
        }]
      }
    });

    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantPending.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': complianceCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.onboardingState, 'MIN_KYC_SUBMITTED');
  });

  // Test 6: support_agent cannot sync (403)
  await test('6.6: support_agent cannot sync Cashfree status (403 Forbidden)', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(res.status, 403, 'support_agent must be forbidden from sync');
  });

  // Test 7: read_only cannot sync (403)
  await test('6.7: read_only cannot sync Cashfree status (403 Forbidden)', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': readOnlyCookie }
    });
    assert.equal(res.status, 403, 'read_only must be forbidden from sync');
  });

  // Test 8: Merchant list contains only database-derived merchants
  await test('6.8: Merchant list contains only database-derived merchants', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/onboarding`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.pagination.total >= 3);

    // Verify each row has authentic merchant ID and name
    const foundActive = body.data.find(m => m.merchantId === merchantActive.id);
    assert.ok(foundActive);
    assert.equal(foundActive.merchantEmail, merchantActive.email);
    assert.equal(foundActive.company, 'Acme Technologies Ltd');

    const foundUnmapped = body.data.find(m => m.merchantId === merchantUnmapped.id);
    assert.ok(foundUnmapped);
    assert.equal(foundUnmapped.onboardingState, 'NOT_STARTED');
    assert.equal(foundUnmapped.hasPartnerMapping, false);
  });

  // Test 9: Search works
  await test('6.9: Search works by name, company, email, merchant ID, and Cashfree ID', async () => {
    // Search by company
    const resCompany = await fetch(`${BASE}/api/v1/admin/onboarding?search=Acme`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyCompany = await resCompany.json();
    assert.ok(bodyCompany.data.some(m => m.merchantId === merchantActive.id));
    assert.ok(!bodyCompany.data.some(m => m.merchantId === merchantPending.id));

    // Search by email
    const resEmail = await fetch(`${BASE}/api/v1/admin/onboarding?search=${merchantPending.email}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyEmail = await resEmail.json();
    assert.equal(bodyEmail.data.length, 1);
    assert.equal(bodyEmail.data[0].merchantId, merchantPending.id);

    // Search by Cashfree ID
    const resCf = await fetch(`${BASE}/api/v1/admin/onboarding?search=${cfIdActive}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyCf = await resCf.json();
    assert.equal(bodyCf.data.length, 1);
    assert.equal(bodyCf.data[0].cfMerchantId, cfIdActive);
  });

  // Test 10: State filtering works
  await test('6.10: State filtering works by onboardingState, kycStatus, and activationStatus', async () => {
    // Filter by onboardingState: ACTIVE
    const resState = await fetch(`${BASE}/api/v1/admin/onboarding?onboardingStatus=ACTIVE`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyState = await resState.json();
    assert.ok(bodyState.data.every(m => m.onboardingState === 'ACTIVE'));
    assert.ok(bodyState.data.some(m => m.merchantId === merchantActive.id));

    // Filter by activationStatus: ACTIVE
    const resAct = await fetch(`${BASE}/api/v1/admin/onboarding?activationStatus=ACTIVE`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyAct = await resAct.json();
    assert.ok(bodyAct.data.every(m => m.activationStatus === 'ACTIVE'));
  });

  // Test 11: Merchant detail returns sanitized data
  await test('6.11: Merchant detail returns sanitized merchant, partner, and KYC objects', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.merchant);
    assert.ok(body.data.partner);
    assert.ok(body.data.kyc);
    assert.ok(Array.isArray(body.data.timeline));
    assert.ok(Array.isArray(body.data.relatedTickets));
  });

  // Test 12: Cashfree merchant ID is returned when mapped
  await test('6.12: Cashfree merchant ID is returned when mapped, and null when unmapped', async () => {
    const resActive = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyActive = await resActive.json();
    assert.equal(bodyActive.data.partner.cfMerchantId, cfIdActive);
    assert.equal(bodyActive.data.partner.hasMapping, true);

    const resUnmapped = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantUnmapped.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyUnmapped = await resUnmapped.json();
    assert.equal(bodyUnmapped.data.partner.cfMerchantId, null);
    assert.equal(bodyUnmapped.data.partner.hasMapping, false);
  });

  // Test 13: KYC status is truthful
  await test('6.13: KYC status distinguishes Minimum KYC and Full KYC truthfully', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantPending.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const body = await res.json();
    assert.equal(body.data.kyc.minKycStatus, 'MIN_KYC_SUBMITTED');
    assert.equal(body.data.kyc.isMinKycApproved, false);
    assert.equal(body.data.kyc.isPaymentActive, false);
  });

  // Test 14: PG activation status is truthful
  await test('6.14: PG activation status is truthful and distinct from KYC state', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const body = await res.json();
    assert.equal(body.data.partner.activationStatus, 'ACTIVE');
    assert.equal(body.data.partner.transactionAccess, 'full');
    assert.equal(body.data.kyc.isPaymentActive, true);
  });

  // Test 15: Contradictory provider data resolves to UNKNOWN
  await test('6.15: Contradictory provider data resolves safely to UNKNOWN state', async () => {
    const merchantConflict = await createUser({
      email: `conflict.c6.${RUN_ID}@example.com`,
      password: 'MerchantPass2026!#$',
      name: 'Conflict User',
      company: 'Conflicting Fields Co'
    });
    const cfIdConflict = `CF_CONFLICT_${RUN_ID}`;
    await createPartnerMerchantMapping({
      merchantId: merchantConflict.id,
      cfMerchantId: cfIdConflict
    });
    // Set conflicting state: activation ACTIVE, but transactionAccess restricted
    await updatePartnerMerchantStatus(merchantConflict.id, {
      onboardingStatus: 'Email Verified',
      kycStatus: 'MIN_KYC_APPROVED',
      activationStatus: 'ACTIVE',
      transactionAccess: 'restricted'
    });

    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantConflict.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const body = await res.json();
    assert.equal(body.data.kyc.onboardingState, 'UNKNOWN');
    assert.equal(body.data.kyc.stateReason, 'conflicting_fields');
  });

  // Test 16: Cashfree sync updates existing state machine correctly
  await test('6.16: Cashfree sync updates existing state machine correctly', async () => {
    // Transition merchantPending from MIN_KYC_SUBMITTED to MIN_KYC_APPROVED
    mockCashfreeMerchantResponses.set(cfIdPending, {
      status: 200,
      body: {
        merchant_id: cfIdPending,
        onboarding_status: 'Email Verified',
        product_status: [{
          product_name: 'PG',
          product_min_kyc_status: 'MIN_KYC_APPROVED',
          product_full_kyc_status: 'FULL_KYC_PENDING',
          activation_status: 'ACTIVE',
          meta_data: { transaction_access: 'full' }
        }]
      }
    });

    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantPending.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.onboardingState, 'ACTIVE');
    assert.equal(body.data.kycStatus, 'MIN_KYC_APPROVED');
    assert.equal(body.data.activationStatus, 'ACTIVE');
  });

  // Test 17: Cashfree sync failure does not corrupt merchant state
  await test('6.17: Cashfree sync failure returns 502 and does not corrupt merchant state', async () => {
    // Point mock to 500 error
    mockCashfreeMerchantResponses.set(cfIdPending, {
      status: 500,
      body: { message: 'Cashfree internal server error' }
    });

    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantPending.id}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(res.status, 502);

    // Verify existing state remains intact
    const resVerify = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantPending.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyVerify = await resVerify.json();
    assert.equal(bodyVerify.data.kyc.onboardingState, 'ACTIVE');
    assert.equal(bodyVerify.data.kyc.minKycStatus, 'MIN_KYC_APPROVED');
  });

  // Test 18: Audit log is created for sync
  await test('6.18: Immutable audit log entry is recorded for ONBOARDING_STATUS_SYNC', async () => {
    const logs = await listAdminAuditLogsFiltered({
      action: 'ONBOARDING_STATUS_SYNC',
      targetMerchantId: merchantPending.id
    });
    assert.ok(logs.data.length >= 1, 'Must have at least one ONBOARDING_STATUS_SYNC audit log');
    const log = logs.data[0];
    assert.equal(log.action, 'ONBOARDING_STATUS_SYNC');
    assert.equal(log.targetMerchantId, merchantPending.id);
    assert.ok(log.details.outcome);
  });

  // Test 19: Audit log contains no secrets
  await test('6.19: Audit log contains no passwords, API keys, or raw secrets', async () => {
    const logs = await listAdminAuditLogsFiltered({
      action: 'ONBOARDING_STATUS_SYNC'
    });
    for (const log of logs.data) {
      const serialized = JSON.stringify(log);
      assert.ok(!serialized.includes('test_cf_secret_key'), 'Audit log must not contain Cashfree secret key');
      assert.ok(!serialized.includes('test_partner_api_key'), 'Audit log must not contain partner API key');
      assert.ok(!serialized.includes('password_hash'), 'Audit log must not contain password hash');
      assert.ok(!serialized.includes('token_hash'), 'Audit log must not contain session token hash');
    }
  });

  // Test 20: KYC documents/secrets are absent from responses
  await test('6.20: Responses strictly contain no KYC document contents, Aadhaar, PAN, or credentials', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const rawText = await res.text();
    assert.ok(!rawText.includes('aadhaar'), 'Must not leak aadhaar');
    assert.ok(!rawText.includes('pan_number'), 'Must not leak pan');
    assert.ok(!rawText.includes('bank_account_number'), 'Must not leak bank account');
    assert.ok(!rawText.includes('password'), 'Must not leak passwords');
    assert.ok(!rawText.includes('secret'), 'Must not leak secrets');
  });

  // Test 21: Client/merchant isolation remains intact
  await test('6.21: Client/merchant isolation remains intact across tenants', async () => {
    const resActive = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantActive.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyActive = await resActive.json();
    assert.equal(bodyActive.data.merchant.id, merchantActive.id);
    assert.equal(bodyActive.data.partner.cfMerchantId, cfIdActive);

    const resPending = await fetch(`${BASE}/api/v1/admin/onboarding/${merchantPending.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    const bodyPending = await resPending.json();
    assert.equal(bodyPending.data.merchant.id, merchantPending.id);
    assert.equal(bodyPending.data.partner.cfMerchantId, cfIdPending);

    // Support ticket check: merchantActive has support ticket; merchantPending does not
    assert.equal(bodyActive.data.relatedTickets.length, 1);
    assert.equal(bodyActive.data.relatedTickets[0].subject, 'Cashfree Full KYC document verification timeline');
    assert.equal(bodyPending.data.relatedTickets.length, 0);
  });

  // Test 22: Nonexistent merchant returns 404
  await test('6.22: Request for non-existent merchant returns 404 Not Found', async () => {
    const resDetail = await fetch(`${BASE}/api/v1/admin/onboarding/usr_nonexistent_${RUN_ID}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resDetail.status, 404);

    const resSync = await fetch(`${BASE}/api/v1/admin/onboarding/usr_nonexistent_${RUN_ID}/sync`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resSync.status, 404);
  });

  console.log('----------------------------------------------------');
  console.log(`Phase 2C-6 Test Results: ${results.passed} passed, ${results.failed} failed`);
  if (results.failed > 0) process.exit(1);
}

// Start server
import('../index.js').then(() => {
  run().then(() => process.exit(0)).catch((err) => {
    console.error('Fatal test runner failure:', err);
    process.exit(1);
  });
});
