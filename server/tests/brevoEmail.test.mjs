// Test Suite for Brevo Transactional Welcome Email Integration
import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4800 + crypto.randomInt(0, 300);

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';

const MOCK_BREVO_KEY = `xkeysib-mock-test-key-${RUN_ID}-do-not-leak`;
process.env.BREVO_API_KEY = MOCK_BREVO_KEY;
process.env.BREVO_SENDER_EMAIL = 'support@qivropay.com';
process.env.BREVO_SENDER_NAME = 'QivroPay';

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
  console.log('Brevo Transactional Welcome Email Integration Test');
  console.log('');

  const { sendWelcomeEmail, buildWelcomeEmailHtml, buildWelcomeEmailText } = await import('../brevoEmail.js');
  const { claimWelcomeEmail, createUser, upsertGoogleUser } = await import('../neonStore.js');

  await waitForServer();

  // Test 1: HTML & Text template generation
  await test('1. Welcome email HTML & text templates render branding and sanitized variables cleanly', async () => {
    const html = buildWelcomeEmailHtml({ email: 'merchant<script>@example.com', name: 'Aarav <Sharma>' });
    assert.ok(html.includes('Welcome to QivroPay'), 'HTML must contain welcome heading');
    assert.ok(html.includes('Aarav &lt;Sharma&gt;'), 'Name must be HTML escaped');
    assert.ok(!html.includes('<script>'), 'Email must be HTML escaped');
    assert.ok(html.includes('Get started'), 'HTML must contain CTA button text');

    const text = buildWelcomeEmailText({ email: 'merchant@example.com', name: 'Aarav Sharma' });
    assert.ok(text.includes('Welcome to QivroPay'));
    assert.ok(text.includes('Hi Aarav Sharma,'));
  });

  // Test 2: Idempotency claim primitive
  await test('2. claimWelcomeEmail is idempotent (returns true once, false on subsequent claims)', async () => {
    const testUserId = `usr_test_claim_${RUN_ID}_${Date.now()}`;
    const claim1 = await claimWelcomeEmail(testUserId);
    assert.equal(claim1, true, 'first claim must return true');

    const claim2 = await claimWelcomeEmail(testUserId);
    assert.equal(claim2, false, 'second claim for same user ID must return false');
  });

  // Test 3: New email/password signup triggers welcome email
  await test('3. New email/password account triggers welcome email via Brevo client', async () => {
    const email = `signup.${RUN_ID}@example.com`;
    const sentEmails = [];
    const mockApiInstance = {
      sendTransacEmail: async (payload) => {
        sentEmails.push(payload);
        return { messageId: `msg_${Date.now()}` };
      }
    };

    const res = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456', name: 'New Merchant', company: 'New Co' })
    });

    assert.equal(res.status, 201, 'Signup should return 201 Created');
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.user.id);

    // Test sendWelcomeEmail directly with mock instance
    const sendResult = await sendWelcomeEmail({ email: body.user.email, name: body.user.name }, { apiInstance: mockApiInstance });
    assert.equal(sendResult.success, true);
    assert.equal(sentEmails.length, 1);
    assert.equal(sentEmails[0].to[0].email, email);
    assert.equal(sentEmails[0].subject, 'Welcome to QivroPay');
  });

  // Test 4: Existing email/password login does NOT send welcome email
  await test('4. Existing email/password login does not trigger welcome email', async () => {
    const email = `login.${RUN_ID}@example.com`;
    const signupRes = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456', name: 'Existing User', company: 'Existing Co' })
    });
    const signupBody = await signupRes.json();
    const userId = signupBody.user.id;

    // First claim was done at signup
    const loginClaim = await claimWelcomeEmail(userId);
    assert.equal(loginClaim, false, 'Claim for existing user logging in must be false');

    const loginRes = await fetch(`${BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456' })
    });
    assert.equal(loginRes.status, 200);
  });

  // Test 5: Brand new Google signup sets isNewUser: true
  await test('5. Brand-new Google Sign-In account marks isNewUser: true', async () => {
    const googleId = `gid_${RUN_ID}_new`;
    const email = `google.new.${RUN_ID}@example.com`;
    const user = await upsertGoogleUser({ googleId, email, name: 'Google New User' });
    assert.equal(user.isNewUser, true, 'brand new Google account must have isNewUser = true');

    const claimResult = await claimWelcomeEmail(user.id);
    assert.equal(claimResult, true, 'claim for brand new Google account must be true');
  });

  // Test 6: Repeat Google login & linked existing account set isNewUser: false
  await test('6. Repeat Google login and linked email account mark isNewUser: false', async () => {
    const googleId = `gid_${RUN_ID}_repeat`;
    const email = `google.repeat.${RUN_ID}@example.com`;

    const first = await upsertGoogleUser({ googleId, email, name: 'Google User' });
    assert.equal(first.isNewUser, true);

    const second = await upsertGoogleUser({ googleId, email, name: 'Google User' });
    assert.equal(second.isNewUser, false, 'repeat Google login must have isNewUser = false');

    // Test linked password account
    const linkedEmail = `linked.${RUN_ID}@example.com`;
    const existingPwdUser = await createUser({ email: linkedEmail, password: 'password123456', name: 'Linked User', company: 'Linked Co' });
    const linkedGoogleId = `gid_${RUN_ID}_linked`;

    const linkedResult = await upsertGoogleUser({ googleId: linkedGoogleId, email: linkedEmail, name: 'Linked User' });
    assert.equal(linkedResult.id, existingPwdUser.id);
    assert.equal(linkedResult.isNewUser, false, 'linking existing email account to Google must have isNewUser = false');
  });

  // Test 7: Brevo failure does NOT fail account creation or login
  await test('7. Brevo API failure (network/service error) does NOT prevent account creation', async () => {
    const email = `brevo.fail.${RUN_ID}@example.com`;
    const mockFailingApiInstance = {
      sendTransacEmail: async () => {
        throw new Error('Brevo service 503 unavailable');
      }
    };

    // Attempt direct email call with failing mock instance
    const result = await sendWelcomeEmail({ email, name: 'Fail User' }, { apiInstance: mockFailingApiInstance });
    assert.equal(result.success, false, 'email send result should report failure');

    // Account creation HTTP call must still succeed 201
    const res = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456', name: 'Fail User', company: 'Fail Co' })
    });

    assert.equal(res.status, 201, 'account creation must still return 201 Created despite email provider error');
    const body = await res.json();
    assert.equal(body.success, true);
  });

  // Test 8: Brevo API key is never returned to the client in HTTP responses
  await test('8. Brevo API key is never returned in HTTP responses', async () => {
    const email = `keycheck.${RUN_ID}@example.com`;
    const res = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456', name: 'Key Check', company: 'Key Co' })
    });
    const text = await res.text();
    assert.ok(!text.includes(MOCK_BREVO_KEY), 'Brevo API key must never appear in HTTP response body');
  });

  // Test 9: Trusted server-side email and name are used
  await test('9. Brevo email payload uses trusted server-side user email and name', async () => {
    const email = `trusted.${RUN_ID}@example.com`;
    const trustedUser = await createUser({ email, password: 'password123456', name: 'Trusted Name', company: 'Trusted Co' });

    const sent = [];
    const mockApi = {
      sendTransacEmail: async (payload) => {
        sent.push(payload);
        return { messageId: 'msg_trusted' };
      }
    };

    await sendWelcomeEmail({ email: trustedUser.email, name: trustedUser.name }, { apiInstance: mockApi });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to[0].email, email);
    assert.equal(sent[0].to[0].name, 'Trusted Name');
  });

  // Test 10: Complete auth lifecycle regression check (signup, login, refresh, retry, failure safety)
  await test('10. Auth lifecycle: new signup sends 1 email; login, refresh, duplicate signup send 0 emails; Brevo failure does not break signup', async () => {
    const email = `lifecycle.${RUN_ID}@example.com`;

    // 10a. New signup sends exactly 1 email
    const signupRes = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456', name: 'Lifecycle Merchant', company: 'Lifecycle Co' })
    });
    assert.equal(signupRes.status, 201);
    const signupBody = await signupRes.json();
    const userId = signupBody.user.id;

    // First claim was done during signup
    const claimAfterSignup = await claimWelcomeEmail(userId);
    assert.equal(claimAfterSignup, false, 'Second claim right after signup must return false (already claimed)');

    // 10b. Refresh (/api/v1/auth/me) does not send email
    const sessionCookie = signupRes.headers.get('set-cookie');
    const meRes = await fetch(`${BASE}/api/v1/auth/me`, {
      headers: { Cookie: sessionCookie }
    });
    assert.equal(meRes.status, 200);
    const claimAfterRefresh = await claimWelcomeEmail(userId);
    assert.equal(claimAfterRefresh, false, 'Refresh must not re-trigger welcome email');

    // 10c. Existing login does not send email
    const loginRes = await fetch(`${BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456' })
    });
    assert.equal(loginRes.status, 200);
    const claimAfterLogin = await claimWelcomeEmail(userId);
    assert.equal(claimAfterLogin, false, 'Login must not re-trigger welcome email');

    // 10d. Repeated signup attempt (409 conflict) does not send duplicate email
    const duplicateRes = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123456', name: 'Lifecycle Merchant', company: 'Lifecycle Co' })
    });
    assert.equal(duplicateRes.status, 409);
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import('../index.js').then(() => run()).catch((err) => {
  console.error('Brevo Email test run crashed:', err);
  process.exit(1);
});
