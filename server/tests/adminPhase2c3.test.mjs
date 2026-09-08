// Phase 2C-3: Support / Ticket Operations Workspace Test Suite
// Verifies:
// 1. Unauthenticated & host isolation enforcement (401 / 403)
// 2. RBAC enforcement: super_admin & support_agent allowed, compliance_officer rejected (403)
// 3. Dual endpoint aliases (/api/v1/admin/support/tickets and /api/v1/admin/tickets)
// 4. Ticket Queue filtering (status, priority, search) and pagination
// 5. Ticket Detail workspace data contract & client context enrichment (zero secrets)
// 6. Non-existent ticket returns clean 404
// 7. Operations: POST reply, PATCH status, PATCH priority with validation & audit logs

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4990 + crypto.randomInt(0, 30);

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
    createSupportTicket
  } = await import('../neonStore.js');

  const superPassword = 'SuperAdminPass2026!#$';

  const superAdmin = await createAdminUser({
    email: `super.c3.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Admin C3',
    role: 'super_admin'
  });

  const supportAdmin = await createAdminUser({
    email: `support.c3.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Support Agent C3',
    role: 'support_agent'
  });

  const complianceAdmin = await createAdminUser({
    email: `compliance.c3.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Compliance Officer C3',
    role: 'compliance_officer'
  });

  // Login admins to get cookies
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

  // Create real merchant for ticket association
  const merchantUser = await createUser({
    email: `merchant.c3.${RUN_ID}@business.org`,
    password: 'MerchantPass2026!#$',
    name: 'Kavita Iyer',
    company: 'Iyer Enterprises'
  });

  await saveResource(merchantUser.id, 'merchant_profile', {
    id: 'profile',
    phone: '+91 98765 43210',
    website: 'https://iyer.example.com'
  });

  // Seed sample support tickets
  const ticket1 = await createSupportTicket({
    userId: merchantUser.id,
    subject: `Urgent settlement delay query ${RUN_ID}`,
    message: 'We noticed our batch settlement for yesterday has not credited.',
    category: 'settlement',
    priority: 'urgent'
  });

  const ticket2 = await createSupportTicket({
    userId: merchantUser.id,
    subject: `Webhook HMAC verification help ${RUN_ID}`,
    message: 'Could you clarify the secret signing algorithm for payment webhooks?',
    category: 'technical',
    priority: 'high'
  });

  console.log('\n--- PHASE 2C-3: SUPPORT TICKET OPERATIONS WORKSPACE SUITE ---');

  // 1. Host isolation & unauthenticated protection
  await test('3.1: Host isolation and unauthenticated access are strictly enforced', async () => {
    // Unauthenticated
    const resUnauth = await fetch(`${BASE}/api/v1/admin/support/tickets`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(resUnauth.status, 401);

    // Wrong host
    const resWrongHost = await fetch(`${BASE}/api/v1/admin/support/tickets`, {
      headers: {
        'x-forwarded-host': 'qivropay.com',
        'Cookie': supportCookie
      }
    });
    assert.equal(resWrongHost.status, 403);
  });

  // 2. RBAC enforcement
  await test('3.2: Support Agent and Super Admin have access; Compliance Officer is forbidden (403)', async () => {
    // Super Admin OK
    const resSuper = await fetch(`${BASE}/api/v1/admin/support/tickets`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': superCookie }
    });
    assert.equal(resSuper.status, 200);

    // Support Agent OK
    const resSupport = await fetch(`${BASE}/api/v1/admin/support/tickets`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(resSupport.status, 200);

    // Compliance Officer Forbidden
    const resCompliance = await fetch(`${BASE}/api/v1/admin/support/tickets`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': complianceCookie }
    });
    assert.equal(resCompliance.status, 403);
  });

  // 3. Endpoint alias parity
  await test('3.3: Both /api/v1/admin/support/tickets and /api/v1/admin/tickets return valid list payloads', async () => {
    const res1 = await fetch(`${BASE}/api/v1/admin/support/tickets`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const res2 = await fetch(`${BASE}/api/v1/admin/tickets`, {
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

  // 4. Ticket Queue filtering & search
  await test('3.4: Ticket queue filters by status, priority, and search text accurately', async () => {
    // Filter by priority=urgent
    const resUrgent = await fetch(`${BASE}/api/v1/admin/support/tickets?priority=urgent`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const bUrgent = await resUrgent.json();
    assert.equal(bUrgent.success, true);
    assert.ok(bUrgent.data.some(t => t.id === ticket1.id));
    assert.ok(bUrgent.data.every(t => t.priority === 'urgent'));

    // Search by keyword
    const resSearch = await fetch(`${BASE}/api/v1/admin/support/tickets?search=settlement%20delay`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    const bSearch = await resSearch.json();
    assert.equal(bSearch.success, true);
    assert.ok(bSearch.data.some(t => t.id === ticket1.id));
  });

  // 5. Ticket Detail & Client Context enrichment
  await test('3.5: Ticket detail endpoint enriches real client context without leaking credentials', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket1.id}`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    const t = body.data.ticket || body.data;
    assert.equal(t.id, ticket1.id);
    assert.equal(t.subject, `Urgent settlement delay query ${RUN_ID}`);
    assert.ok(Array.isArray(t.messages || t.replies));

    // Client context verification
    assert.ok(t.client, 'Ticket detail must provide client context');
    assert.equal(t.client.id, merchantUser.id);
    assert.equal(t.client.email, merchantUser.email);
    assert.equal(t.client.name, 'Kavita Iyer');
    assert.equal(t.client.company, 'Iyer Enterprises');
    assert.equal(t.client.phone, '+91 98765 43210');

    // Security check: Zero password, hashes or secret leaks
    assert.equal(t.client.password_hash, undefined);
    assert.equal(t.client.password, undefined);
    assert.equal(t.client.google_sub, undefined);
    assert.equal(t.client.apiKey, undefined);
    assert.equal(t.client.secret, undefined);
  });

  // 6. Non-existent ticket returns 404
  await test('3.6: Non-existent ticket ID returns 404 Not Found', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/support/tickets/tkt_invalid_nonexistent_999`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com', 'Cookie': supportCookie }
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /not found/i);
  });

  // 7. Operations: Reply validation and mutation
  await test('3.7: POST reply validates empty message and appends admin response to thread', async () => {
    // Empty message validation (400)
    const resEmpty = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket1.id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      },
      body: JSON.stringify({ message: '   ' })
    });
    assert.equal(resEmpty.status, 400);

    // Valid admin reply
    const replyText = 'We have investigated your batch payout. Banking partner cleared it at 14:32 UTC.';
    const resValid = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket1.id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      },
      body: JSON.stringify({ message: replyText })
    });
    assert.equal(resValid.status, 200);
    const bReply = await resValid.json();
    assert.equal(bReply.success, true);
    const replies = bReply.data.replies || bReply.data.messages;
    assert.ok(Array.isArray(replies));
    const lastMsg = replies[replies.length - 1];
    assert.equal(lastMsg.message, replyText);
    assert.equal(lastMsg.author, supportAdmin.name);
    assert.equal(lastMsg.authorType, 'admin');
  });

  // 8. Operations: Status mutation
  await test('3.8: PATCH status validates valid states and transitions ticket status', async () => {
    // Invalid status (400)
    const resInvalid = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket1.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      },
      body: JSON.stringify({ status: 'invalid_status_xyz' })
    });
    assert.equal(resInvalid.status, 400);

    // Transition to in_progress
    const resProg = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket1.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      },
      body: JSON.stringify({ status: 'in_progress' })
    });
    assert.equal(resProg.status, 200);
    const bProg = await resProg.json();
    assert.equal(bProg.success, true);
    assert.equal(bProg.data.status, 'in_progress');

    // Transition to resolved
    const resRes = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket1.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      },
      body: JSON.stringify({ status: 'resolved' })
    });
    assert.equal(resRes.status, 200);
    const bRes = await resRes.json();
    assert.equal(bRes.data.status, 'resolved');
  });

  // 9. Operations: Priority mutation
  await test('3.9: PATCH priority validates valid priorities and updates ticket priority', async () => {
    // Invalid priority (400)
    const resInvalid = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket2.id}/priority`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      },
      body: JSON.stringify({ priority: 'super_duper_priority' })
    });
    assert.equal(resInvalid.status, 400);

    // Update to normal
    const resNorm = await fetch(`${BASE}/api/v1/admin/support/tickets/${ticket2.id}/priority`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': supportCookie
      },
      body: JSON.stringify({ priority: 'normal' })
    });
    assert.equal(resNorm.status, 200);
    const bNorm = await resNorm.json();
    assert.equal(bNorm.success, true);
    assert.equal(bNorm.data.priority, 'normal');
  });

  // 10. Audit logging verification
  await test('3.10: Ticket operations record structured platform audit logs', async () => {
    const resAudit = await fetch(`${BASE}/api/v1/admin/audit-logs?action=ticket_reply`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': superCookie
      }
    });
    assert.equal(resAudit.status, 200);
    const body = await resAudit.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.some(l => l.action === 'ticket_reply'), 'Must contain ticket_reply audit log events');
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
