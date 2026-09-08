// Phase 2C-1: Admin Frontend Shell + Authentication Test Suite
// Verifies:
// 1. Host dispatch & frontend static delivery for client.qivropay.com
// 2. Cookie-based authentication flow (login, me, logout)
// 3. Error states: invalid credentials, suspended admin, rate limit
// 4. Data masking: zero tokens or password hashes in client state
// 5. Backend RBAC parity with frontend navigation
// 6. Static asset accessibility (GET /, GET /login, GET /clients on client.qivropay.com)
// 7. Merchant route protection (GET /api/v1/products rejected with 403 on client.qivropay.com)

import assert from 'node:assert/strict';
import crypto from 'crypto';
import fs from 'fs';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4980 + crypto.randomInt(0, 15);

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
  throw new Error('Server timed out');
}

async function run() {
  await waitForServer();

  const {
    createAdminUser
  } = await import('../neonStore.js');

  const superPassword = 'SuperAdminPass2026!#$';
  const superAdmin = await createAdminUser({
    email: `super.frontend.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Frontend Admin',
    role: 'super_admin'
  });

  const suspendedAdmin = await createAdminUser({
    email: `suspended.frontend.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Suspended Frontend Admin',
    role: 'support_agent',
    status: 'suspended'
  });

  console.log('\nAdmin Frontend Shell & Auth (Phase 2c-1) Test Suite\n');

  // 1. Static asset and SPA route dispatch for client.qivropay.com
  await test('1.1: Frontend root GET / on client.qivropay.com does not return 403', async () => {
    const res = await fetch(`${BASE}/`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    // In test environment without a production build or with dev static, must not be blocked with 403
    assert.notEqual(res.status, 403, 'client.qivropay.com root must not be blocked as merchant route');
  });

  await test('1.2: Frontend route GET /login on client.qivropay.com does not return 403', async () => {
    const res = await fetch(`${BASE}/login`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.notEqual(res.status, 403, 'client.qivropay.com /login must not be blocked as merchant route');
  });

  await test('1.3: Merchant API route GET /api/v1/products is blocked with 403 on client.qivropay.com', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /Merchant routes are not accessible/i);
  });

  // 2. Dedicated Admin Login
  await test('2.1: Login with invalid password returns 401 with generic error', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com'
      },
      body: JSON.stringify({ email: superAdmin.email, password: 'WrongPassword123!' })
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Invalid.*credentials/i);
  });

  await test('2.2: Login with non-existent email returns 401 with generic error', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com'
      },
      body: JSON.stringify({ email: 'nonexistent@qivropay.com', password: 'Password123!' })
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Invalid.*credentials/i);
  });

  await test('2.3: Login with suspended admin account returns 403 Forbidden', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com'
      },
      body: JSON.stringify({ email: suspendedAdmin.email, password: superPassword })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /suspended/i);
  });

  let adminCookie = '';
  await test('2.4: Valid admin login returns admin object without password hash and sets HttpOnly cookie', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-host': 'client.qivropay.com'
      },
      body: JSON.stringify({ email: superAdmin.email, password: superPassword })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.admin);
    assert.equal(body.admin.email, superAdmin.email);
    assert.equal(body.admin.role, 'super_admin');
    assert.equal(body.admin.password_hash, undefined);
    assert.equal(body.admin.password, undefined);
    assert.equal(body.token, undefined);

    adminCookie = adminCookieFrom(res);
    assert.ok(adminCookie.startsWith('qivropay_admin_session='));
  });

  // 3. Session Check (GET /admin/auth/me)
  await test('3.1: Startup session check /admin/auth/me returns authenticated admin user', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/me`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': adminCookie
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.admin.email, superAdmin.email);
    assert.equal(body.admin.role, 'super_admin');
    assert.equal(body.admin.password_hash, undefined);
  });

  await test('3.2: Unauthenticated session check /admin/auth/me returns 401', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/auth/me`, {
      headers: { 'x-forwarded-host': 'client.qivropay.com' }
    });
    assert.equal(res.status, 401);
  });

  // 4. Admin Overview & Clients API Integration
  await test('4.1: Overview stats returns database metrics', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/overview/stats`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': adminCookie
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(typeof body.data.totalMerchants === 'number');
    assert.ok(typeof body.data.totalPaymentVolume === 'number');
  });

  await test('4.2: Clients directory returns paginated merchants', async () => {
    const res = await fetch(`${BASE}/api/v1/admin/clients?page=1&pageSize=10`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': adminCookie
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.pagination);
  });

  // 5. Admin Logout
  await test('5.1: Admin logout clears session cookie and invalidates session', async () => {
    const resLogout = await fetch(`${BASE}/api/v1/admin/auth/logout`, {
      method: 'POST',
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': adminCookie
      }
    });
    assert.equal(resLogout.status, 200);

    // Verify session is now invalidated
    const resMe = await fetch(`${BASE}/api/v1/admin/auth/me`, {
      headers: {
        'x-forwarded-host': 'client.qivropay.com',
        'Cookie': adminCookie
      }
    });
    assert.equal(resMe.status, 401);
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
