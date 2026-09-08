// Phase 2a: Admin Authentication & RBAC Isolation Security Test Suite.
// Comprehensive verification of all Phase 2A security hardening controls:
// 1. Zero hardcoded admin credentials in source code
// 2. Explicit admin bootstrap verification
// 3. Absence of silent auto-provisioning
// 4. Exact host validation (client.qivropay.com vs lookalikes & ports)
// 5. Merchant domain rejection on admin APIs
// 6. Admin host rejection on merchant APIs
// 7. Cookie security (HttpOnly, SameSite=Strict, Secure in production)
// 8. Cookie-only authentication (no Bearer token support)
// 9. Rate limiting: 10 failed login attempts per IP per 15 min
// 10. Zero-exposure of credentials, password hashes, or session tokens in responses & logs
// 11. Support tickets & chat persistence primitives

import assert from 'node:assert/strict';
import crypto from 'crypto';
import fs from 'fs';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4720 + crypto.randomInt(0, 150);

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
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/v1/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Server did not start in time');
}

async function run() {
  console.log('Admin Security & Isolation Hardening Test Suite (Phase 2a)');
  console.log('');

  await waitForServer();

  const {
    bootstrapAdminUser,
    createAdminUser,
    findAdminUserByEmail,
    findAdminUserById,
    listAdminAuditLogs,
    createSupportTicket,
    listSupportTickets,
    addSupportTicketReply,
    updateSupportTicketStatus,
    saveSupportChatSession,
    getSupportChatSession,
    listSupportChatSessions
  } = await import('../neonStore.js');

  // -------------------------------------------------------------
  // 1. Audit: Zero Hardcoded Credentials in Source Code
  // -------------------------------------------------------------
  await test('1: Hardcoded bootstrap credentials are completely absent from codebase', async () => {
    const filesToCheck = [
      'server/neonStore.js',
      'server/index.js',
      'server/bootstrapAdmin.js'
    ];
    for (const file of filesToCheck) {
      const text = fs.readFileSync(file, 'utf-8');
      assert.ok(!text.includes('admin@qivropay.com'), `${file} must not contain hardcoded admin email`);
      assert.ok(!text.includes('Admin@Qivro2026!'), `${file} must not contain hardcoded admin password`);
    }
  });

  // -------------------------------------------------------------
  // 2. Explicit Admin Bootstrap
  // -------------------------------------------------------------
  const superAdminEmail = `superadmin.${RUN_ID}@qivrocorp.internal`;
  const superAdminPassword = 'SecureSuperAdminPass2026!#$';

  await test('2: Explicit admin bootstrap validates inputs and hashes password', async () => {
    // Fails on missing email
    await assert.rejects(
      async () => bootstrapAdminUser({ email: '', password: superAdminPassword }),
      /email is required/i
    );

    // Fails on short password (< 12 chars)
    await assert.rejects(
      async () => bootstrapAdminUser({ email: superAdminEmail, password: 'short' }),
      /at least 12 characters/i
    );

    // Successful bootstrap
    const admin = await bootstrapAdminUser({
      email: superAdminEmail,
      password: superAdminPassword,
      name: 'Lead Administrator',
      role: 'super_admin'
    });

    assert.equal(admin.email, superAdminEmail);
    assert.equal(admin.role, 'super_admin');
    assert.equal(admin.status, 'active');
    assert.equal(admin.password_hash, undefined, 'password_hash must never be in return value');
    assert.equal(admin.mfa_secret, undefined, 'mfa_secret must never be in return value');

    // Duplicate bootstrap must reject
    await assert.rejects(
      async () => bootstrapAdminUser({ email: superAdminEmail, password: superAdminPassword }),
      /already exists/i
    );

    // Verify stored password is scrypt hashed with salt
    const found = await findAdminUserByEmail(superAdminEmail);
    assert.ok(found.password_hash.includes(':'), 'Stored password must be salt:derived format');
    assert.notEqual(found.password_hash, superAdminPassword);
  });

  // Seed secondary admin accounts
  const complianceEmail = `compliance.${RUN_ID}@qivrocorp.internal`;
  const suspendedEmail = `suspended.${RUN_ID}@qivrocorp.internal`;
  await createAdminUser({ email: complianceEmail, name: 'Compliance Officer', password: superAdminPassword, role: 'compliance_officer' });
  await createAdminUser({ email: suspendedEmail, name: 'Suspended Admin', password: superAdminPassword, role: 'read_only', status: 'suspended' });

  // -------------------------------------------------------------
  // 3. No Silent Auto-Provisioning in Production
  // -------------------------------------------------------------
  await test('3: Non-existent admin login does not silently create admin', async () => {
    const unknownEmail = `nonexistent.${RUN_ID}@qivrocorp.internal`;
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: unknownEmail, password: 'SomeRandomPassword123!' })
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, 'Invalid admin credentials');

    // Confirm no account was created
    const record = await findAdminUserByEmail(unknownEmail);
    assert.equal(record, null, 'Server must never auto-create admin accounts on login failure');
  });

  // -------------------------------------------------------------
  // 4. Host Validation (Exact client.qivropay.com vs lookalikes)
  // -------------------------------------------------------------
  await test('4: Exact client.qivropay.com is accepted (including with port)', async () => {
    // Exact hostname
    const resExact = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com'
      },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    assert.equal(resExact.status, 200, 'Exact client.qivropay.com host must succeed');

    // Exact hostname with port
    const resPort = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com:443'
      },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    assert.equal(resPort.status, 200, 'client.qivropay.com with port must succeed');
  });

  await test('5: Lookalike host client.qivropay.com.evil.com is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com.evil.com'
      },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /client\.qivropay\.com/i);
  });

  await test('6: Lookalike host evilclient.qivropay.com is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'evilclient.qivropay.com'
      },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    assert.equal(res.status, 403);
  });

  await test('7: Merchant host qivropay.com is rejected on admin APIs', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'qivropay.com'
      },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /merchant domain/i);
  });

  await test('8: Admin host client.qivropay.com blocks merchant routes with 403 Forbidden', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/me`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com'
      }
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /not accessible from client\.qivropay\.com/i);
  });

  // -------------------------------------------------------------
  // 5. Cookie Security & Zero Exposure of Tokens/Hashes
  // -------------------------------------------------------------
  let adminSessionCookie = '';

  await test('9: Admin login sets HttpOnly, SameSite=Strict cookie and never returns token or password hash', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.admin.email, superAdminEmail);

    // Zero credential exposure
    assert.equal(body.token, undefined, 'session token must NOT be in response body');
    assert.equal(body.admin.password_hash, undefined, 'password_hash must NOT be in response');
    assert.equal(body.admin.mfa_secret, undefined, 'mfa_secret must NOT be in response');

    // Cookie security flags
    const setCookie = res.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('qivropay_admin_session='), 'must set qivropay_admin_session cookie');
    assert.ok(setCookie.includes('HttpOnly'), 'must include HttpOnly');
    assert.ok(setCookie.includes('SameSite=Strict'), 'must include SameSite=Strict');
    assert.ok(setCookie.includes('Path=/'), 'must include Path=/');
    assert.ok(setCookie.includes('Max-Age=1209600'), 'must include 14-day Max-Age');
    adminSessionCookie = adminCookieFrom(res);

    // Audit log check: verify credentials/secrets are excluded from log details
    const logs = await listAdminAuditLogs({ adminId: body.admin.id });
    const loginLog = logs.find(l => l.action === 'admin_login');
    assert.ok(loginLog);
    assert.equal(loginLog.details.password, undefined);
    assert.equal(loginLog.details.token, undefined);
    assert.equal(loginLog.details.token_hash, undefined);
  });

  await test('10: Production cookie security includes Secure flag when NODE_ENV=production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEV_STORE = 'true';
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com'
      },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    process.env.NODE_ENV = originalEnv;
    delete process.env.ALLOW_DEV_STORE;

    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('Secure'), 'Cookie in production must have Secure flag');
  });

  // -------------------------------------------------------------
  // 6. Cookie-Only Authentication (Bearer Token Rejected)
  // -------------------------------------------------------------
  await test('11: Cookie is accepted on /admin/auth/me but Bearer header is rejected', async () => {
    // Valid cookie
    const resCookie = await fetch(`${BASE}/api/v1/admin/auth/me`, {
      headers: { Cookie: adminSessionCookie }
    });
    assert.equal(resCookie.status, 200);
    const body = await resCookie.json();
    assert.equal(body.admin.email, superAdminEmail);

    // Bearer token (no cookie) must be rejected with 401
    const resBearer = await fetch(`${BASE}/api/v1/admin/auth/me`, {
      headers: { Authorization: 'Bearer adm_tok_some_bearer_token' }
    });
    assert.equal(resBearer.status, 401, 'Bearer authorization must not be accepted for admin portal');
  });

  // -------------------------------------------------------------
  // 7. Suspended Users Rejected
  // -------------------------------------------------------------
  await test('12: Suspended admin account login is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: suspendedEmail, password: superAdminPassword })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /suspended/i);
  });

  // -------------------------------------------------------------
  // 8. Rate Limiting (10 failed attempts per IP per 15 min)
  // -------------------------------------------------------------
  await test('13: 10 failed login attempts triggers 429 Too Many Requests rate limit', async () => {
    const uniqueIp = `198.51.100.${crypto.randomInt(1, 250)}`;

    // Make 10 failed attempts from this IP
    for (let i = 0; i < 10; i++) {
      const resFail = await fetch(`${BASE}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': uniqueIp
        },
        body: JSON.stringify({ email: superAdminEmail, password: 'wrong-password' })
      });
      assert.equal(resFail.status, 401, `Attempt ${i + 1} should be 401`);
    }

    // 11th attempt must be blocked by rate limiter with 429
    const resBlocked = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': uniqueIp
      },
      body: JSON.stringify({ email: superAdminEmail, password: superAdminPassword })
    });
    assert.equal(resBlocked.status, 429, '11th attempt must return 429 Too Many Requests');
    const body = await resBlocked.json();
    assert.match(body.error, /too many failed login attempts/i);
  });

  // -------------------------------------------------------------
  // 9. Admin Logout
  // -------------------------------------------------------------
  await test('14: Admin logout invalidates session and clears cookie', async () => {
    const resLogout = await fetch(`${BASE}/api/v1/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: adminSessionCookie }
    });
    assert.equal(resLogout.status, 200);
    const setCookie = resLogout.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('Max-Age=0'));

    // Subsequent /me request with that cookie must fail with 401
    const resMeAfter = await fetch(`${BASE}/api/v1/admin/auth/me`, {
      headers: { Cookie: adminSessionCookie }
    });
    assert.equal(resMeAfter.status, 401);
  });

  // -------------------------------------------------------------
  // 10. Support Tickets & Chat Persistence
  // -------------------------------------------------------------
  await test('15: Support tickets and chat persistence primitives function correctly', async () => {
    const ticket = await createSupportTicket({
      userId: `usr_${RUN_ID}`,
      name: 'Acme Store',
      email: `acme.${RUN_ID}@example.com`,
      subject: 'Integration SLA query',
      category: 'Technical Support',
      message: 'How do we configure webhook signatures?',
      priority: 'normal'
    });
    assert.ok(ticket.id.startsWith('TICK-'));

    const reply = await addSupportTicketReply(ticket.id, {
      sender: 'QivroPay Desk',
      message: 'Refer to documentation at docs/client-integration.md',
      timestamp: new Date().toISOString()
    });
    assert.equal(reply.replies.length, 1);

    const updated = await updateSupportTicketStatus(ticket.id, 'resolved');
    assert.equal(updated.status, 'resolved');

    const chat = await saveSupportChatSession({
      sessionId: `chat_${RUN_ID}`,
      merchantId: `usr_${RUN_ID}`,
      mode: 'authenticated',
      messages: [{ role: 'user', content: 'Hello admin' }]
    });
    assert.ok(chat.id);
    const retrievedChat = await getSupportChatSession(chat.id);
    assert.equal(retrievedChat.messages[0].content, 'Hello admin');
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
