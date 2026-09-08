// Phase 2C-4: Chat Logs / Transcripts Workspace Test Suite
// Verifies:
// 1. Chat logs endpoints require admin authentication (401) and host isolation (403)
// 2. RBAC matrix: super_admin & support_agent allowed (200); compliance_officer & read_only forbidden (403)
// 3. Dual endpoint aliases (/api/v1/admin/support/chat-logs and /api/v1/admin/chat-logs)
// 4. Session list returns valid real data with enriched client fields and pagination
// 5. Filtering by mode (authenticated vs public) and debounced search
// 6. Chat session detail returns valid sanitized transcript data with timestamps
// 7. Sensitive data sanitization: Zero system prompts, password hashes, or API secrets
// 8. Tenant/client isolation: Alpha cannot view Beta's merchant context
// 9. Non-existent session ID returns clean 404
// 10. Read-only guarantee: Mutations (POST, PATCH, DELETE) to chat logs are rejected

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 5020 + crypto.randomInt(0, 30);

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
    createSupportTicket,
    saveSupportChatSession
  } = await import('../neonStore.js');

  const superPassword = 'SuperAdminPass2026!#$';

  const superAdmin = await createAdminUser({
    email: `super.c4.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Admin C4',
    role: 'super_admin'
  });

  const supportAdmin = await createAdminUser({
    email: `support.c4.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Support Agent C4',
    role: 'support_agent'
  });

  const complianceAdmin = await createAdminUser({
    email: `compliance.c4.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Compliance Officer C4',
    role: 'compliance_officer'
  });

  const readOnlyAdmin = await createAdminUser({
    email: `readonly.c4.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Read Only Admin C4',
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
    email: `merchant.alpha.${RUN_ID}@acme.inc`,
    password: 'MerchantPass2026!#$',
    name: 'Ananya Sharma',
    company: 'Acme Technologies'
  });
  await saveResource(merchantAlpha.id, 'merchant_profile', {
    id: 'profile',
    phone: '+91 99887 76655',
    website: 'https://acme.inc'
  });

  const merchantBeta = await createUser({
    email: `merchant.beta.${RUN_ID}@beta.org`,
    password: 'MerchantPass2026!#$',
    name: 'Vikram Joshi',
    company: 'Beta Logistics'
  });

  // Create support ticket linked to Alpha
  const ticketAlpha = await createSupportTicket({
    userId: merchantAlpha.id,
    subject: `Settlement reconciliation help ${RUN_ID}`,
    message: 'Need help clarifying webhook format for settlements.',
    category: 'settlement',
    priority: 'high'
  });

  // Create chat sessions:
  // Session 1: Authenticated merchant Alpha with linked ticket & system prompt
  const sessionAlphaId = `cs_alpha_${RUN_ID}`;
  await saveSupportChatSession({
    sessionId: sessionAlphaId,
    merchantId: merchantAlpha.id,
    mode: 'authenticated',
    messages: [
      { role: 'system', content: 'You are QivroPay Support AI with secret instructions.' },
      { role: 'user', content: 'Hello, what is the webhook retry policy?', timestamp: new Date().toISOString() },
      { role: 'assistant', content: 'QivroPay retries webhooks up to 5 times with exponential backoff.', timestamp: new Date().toISOString() }
    ]
  });

  // Session 2: Public visitor (unauthenticated)
  const sessionPublicId = `cs_public_${RUN_ID}`;
  await saveSupportChatSession({
    sessionId: sessionPublicId,
    merchantId: null,
    mode: 'public',
    messages: [
      { role: 'user', content: 'What are your transaction pricing tiers?', timestamp: new Date().toISOString() },
      { role: 'assistant', content: 'Standard pricing starts at 1.95% per transaction with instant setup.', timestamp: new Date().toISOString() }
    ]
  });

  console.log('\n--- PHASE 2C-4: CHAT LOGS / TRANSCRIPTS WORKSPACE SUITE ---');

  // 1. Auth & host isolation
  await test('4.1: Chat logs endpoints require admin authentication and client.qivropay.com host', async () => {
    // Unauthenticated
    const resUnauth = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resUnauth.status, 401);

    // Wrong host
    const resWrongHost = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: {
        'x-forwarded-host': 'qivropay.com',
        'Cookie': supportCookie
      }
    });
    assert.equal(resWrongHost.status, 403);
  });

  // 2. RBAC matrix
  await test('4.2: Support Agent and Super Admin have access; Compliance Officer and Read-Only are forbidden (403)', async () => {
    const resSuper = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resSuper.status, 200);

    const resSupport = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(resSupport.status, 200);

    const resCompliance = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': complianceCookie }
    });
    assert.equal(resCompliance.status, 403);

    const resReadOnly = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': readOnlyCookie }
    });
    assert.equal(resReadOnly.status, 403);
  });

  // 3. Endpoint aliases parity
  await test('4.3: Both /api/v1/admin/support/chat-logs and /api/v1/admin/chat-logs return valid list payloads', async () => {
    const res1 = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const res2 = await fetch(`${BASE}/api/v1/admin/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(res1.status, 200);
    assert.equal(res2.status, 200);

    const b1 = await res1.json();
    const b2 = await res2.json();
    assert.equal(b1.success, true);
    assert.equal(b2.success, true);
    assert.ok(Array.isArray(b1.data));
    assert.ok(Array.isArray(b2.data));
  });

  // 4. Session list returns real data with enriched client fields
  await test('4.4: Session list returns truthful session metadata and enriched client fields', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/support/chat-logs`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));

    const alphaItem = body.data.find(c => c.id === sessionAlphaId);
    assert.ok(alphaItem, 'Must contain sessionAlpha');
    assert.equal(alphaItem.merchantId, merchantAlpha.id);
    assert.equal(alphaItem.mode, 'authenticated');
    assert.equal(alphaItem.clientName, 'Ananya Sharma');
    assert.equal(alphaItem.clientCompany, 'Acme Technologies');

    const publicItem = body.data.find(c => c.id === sessionPublicId);
    assert.ok(publicItem, 'Must contain sessionPublic');
    assert.equal(publicItem.merchantId, null);
    assert.equal(publicItem.mode, 'public');
  });

  // 5. Filtering and Search
  await test('4.5: Filtering by mode (authenticated vs public) and search returns accurate subsets', async () => {
    // Mode: authenticated
    const resAuth = await fetch(`${BASE}/api/v1/admin/support/chat-logs?mode=authenticated`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const bAuth = await resAuth.json();
    assert.equal(bAuth.success, true);
    assert.ok(bAuth.data.some(c => c.id === sessionAlphaId));
    assert.ok(bAuth.data.every(c => c.mode === 'authenticated'));

    // Mode: public
    const resPublic = await fetch(`${BASE}/api/v1/admin/support/chat-logs?mode=public`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const bPublic = await resPublic.json();
    assert.equal(bPublic.success, true);
    assert.ok(bPublic.data.some(c => c.id === sessionPublicId));
    assert.ok(bPublic.data.every(c => c.mode === 'public'));

    // Search by keyword
    const resSearch = await fetch(`${BASE}/api/v1/admin/support/chat-logs?search=${sessionAlphaId}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const bSearch = await resSearch.json();
    assert.equal(bSearch.success, true);
    assert.ok(bSearch.data.some(c => c.id === sessionAlphaId));
  });

  // 6. Session detail and transcript
  await test('4.6: Session detail returns sanitized transcript messages and client context', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/support/chat-logs/${sessionAlphaId}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const d = body.data;

    assert.equal(d.id, sessionAlphaId);
    assert.equal(d.merchantId, merchantAlpha.id);
    assert.equal(d.mode, 'authenticated');
    assert.ok(Array.isArray(d.transcript));

    // Client context
    assert.ok(d.client);
    assert.equal(d.client.id, merchantAlpha.id);
    assert.equal(d.client.name, 'Ananya Sharma');
    assert.equal(d.client.company, 'Acme Technologies');
    assert.equal(d.client.phone, '+91 99887 76655');
    assert.equal(d.client.website, 'https://acme.inc');
  });

  // 7. Sensitive data sanitization
  await test('4.7: System prompts and sensitive secrets are strictly stripped from transcript payload', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/support/chat-logs/${sessionAlphaId}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const body = await res.json();
    const d = body.data;

    // Zero system messages in transcript
    for (const msg of d.transcript) {
      assert.notEqual(msg.role, 'system', 'System prompt must not exist in sanitized transcript');
      assert.ok(!msg.content.includes('secret instructions'), 'System prompt content must not leak');
    }

    // Zero credential leakage in client object
    assert.equal(d.client.password_hash, undefined);
    assert.equal(d.client.password, undefined);
    assert.equal(d.client.google_sub, undefined);
    assert.equal(d.client.google_id, undefined);
    assert.equal(d.client.apiKey, undefined);
    assert.equal(d.client.secret, undefined);
  });

  // 8. Tenant / client isolation
  await test('4.8: Tenant isolation is preserved (Merchant Beta data never appears in Alpha session)', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/support/chat-logs/${sessionAlphaId}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const body = await res.json();
    const d = body.data;

    assert.notEqual(d.client.id, merchantBeta.id);
    assert.notEqual(d.client.email, merchantBeta.email);
    assert.notEqual(d.client.name, merchantBeta.name);
  });

  // 9. Non-existent session returns 404
  await test('4.9: Non-existent chat session returns 404 Not Found', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/support/chat-logs/cs_nonexistent_99999`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /not found/i);
  });

  // 10. Read-only guarantee: Mutations are rejected
  await test('4.10: Read-only guarantee - chat logs endpoints reject mutation methods (POST, PATCH, DELETE)', async () => {
    const resPost = await fetch(`${BASE}/api/v1/admin/support/chat-logs/${sessionAlphaId}`, {
      method: 'POST',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie },
      body: JSON.stringify({ message: 'Illegal mutation attempt' })
    });
    assert.ok([404, 405].includes(resPost.status), 'POST must be rejected with 404 or 405');

    const resPatch = await fetch(`${BASE}/api/v1/admin/support/chat-logs/${sessionAlphaId}`, {
      method: 'PATCH',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie },
      body: JSON.stringify({ mode: 'public' })
    });
    assert.ok([404, 405].includes(resPatch.status), 'PATCH must be rejected with 404 or 405');

    const resDelete = await fetch(`${BASE}/api/v1/admin/support/chat-logs/${sessionAlphaId}`, {
      method: 'DELETE',
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
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
