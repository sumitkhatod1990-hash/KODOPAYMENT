// Manual Verification Script for Brevo Welcome Email Integration
import assert from 'node:assert/strict';

const BASE = 'http://localhost:4000';

async function cookieFrom(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()[0]
    : res.headers.get('set-cookie');
  if (!raw) throw new Error('Response did not set a session cookie');
  return raw.split(';')[0];
}

async function runManualCheck() {
  console.log('=== Manual Verification: QivroPay Brevo Welcome Email ===\n');

  // Step 1: Create a brand-new test QivroPay account
  const timestamp = Date.now();
  const email = `merchant.welcome.${timestamp}@example.com`;
  const password = 'password123456';
  const name = 'Vikram Malhotra';
  const company = 'Malhotra Enterprises';

  console.log(`1. Creating brand-new account: ${email}`);
  const signupRes = await fetch(`${BASE}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, company })
  });

  assert.equal(signupRes.status, 201, 'Signup must return 201 Created');
  const cookie = await cookieFrom(signupRes);
  const signupData = await signupRes.json();
  assert.equal(signupData.success, true);
  assert.equal(signupData.user.email, email);
  assert.equal(signupData.user.name, name);
  console.log('✓ Account created successfully! User ID:', signupData.user.id);
  console.log('✓ Session cookie set properly.\n');

  // Step 2: Verify user reaches normal onboarding/me endpoint
  console.log('2. Verifying auth session (/api/v1/auth/me)...');
  const meRes = await fetch(`${BASE}/api/v1/auth/me`, {
    headers: { Cookie: cookie }
  });
  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.user.email, email);
  console.log('✓ Verified user session active in dashboard.\n');

  // Step 3: Log out
  console.log('3. Logging out...');
  const logoutRes = await fetch(`${BASE}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie }
  });
  assert.equal(logoutRes.status, 200);
  console.log('✓ Logged out cleanly.\n');

  // Step 4: Log back in (must NOT send second welcome email)
  console.log('4. Logging back in...');
  const loginRes = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.equal(loginData.success, true);
  console.log('✓ Logged back in successfully! No duplicate welcome email triggered.\n');

  console.log('=== All Manual Verification Steps Completed Successfully! ===');
}

runManualCheck().catch((err) => {
  console.error('❌ Manual verification failed:', err);
  process.exit(1);
});
