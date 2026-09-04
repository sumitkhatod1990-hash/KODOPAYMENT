// Regression/coverage test for "Continue with Google" (Phase 11).
//
// Two layers, matching the split between neonStore.js and server/index.js:
//
//   1. upsertGoogleUser() (server/neonStore.js) — the account-resolution
//      logic: a brand-new Google identity creates a user, a repeat login
//      with the same googleId returns the same user (no duplicate), and an
//      existing email/password account signing in with a matching verified
//      Google email gets linked in place rather than duplicated.
//   2. POST /api/v1/auth/google (server/index.js) — the HTTP route's own
//      guards: missing GOOGLE_CLIENT_ID (not configured) => 503, missing
//      credential => 400, and an unverifiable credential => 401. This
//      deliberately does not attempt to forge a real Google-signed JWT (that
//      would require Google's private signing key) — verifyGoogleIdToken()
//      itself is a thin wrapper around google-auth-library, which is
//      Google's own tested implementation, not something this project reimplements.
//
// Uses the project's local file-store persistence (no DATABASE_URL), same as
// the other suites in this directory.
//
// Run with: npm test  (or: node server/tests/googleAuth.test.mjs)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');
const PORT = 4919 + (crypto.randomInt(0, 400));

process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';
process.env.CASHFREE_APP_ID = '';
process.env.CASHFREE_SECRET_KEY = '';
process.env.CASHFREE_PARTNER_API_KEY = '';

const results = { passed: 0, failed: 0 };

async function test(name, fn) {
  try {
    await fn();
    results.passed += 1;
    console.log(`  ok - ${name}`);
  } catch (error) {
    results.failed += 1;
    console.error(`  FAIL - ${name}`);
    console.error(`    ${error.message}`);
  }
}

function freshEmail(label) {
  return `google-${label}-${crypto.randomBytes(4).toString('hex')}@example.com`;
}

function freshGoogleId() {
  return `test_google_sub_${crypto.randomBytes(8).toString('hex')}`;
}

async function run() {
  console.log('--- upsertGoogleUser (neonStore.js) ---');

  const { upsertGoogleUser, createUser, findUserByEmail } = await import('../neonStore.js');

  await test('a brand-new Google identity creates a user with no password', async () => {
    const email = freshEmail('new-user');
    const googleId = freshGoogleId();
    const user = await upsertGoogleUser({ googleId, email, name: 'Aarav Sharma' });
    assert.ok(user.id, 'created user should have an id');
    assert.equal(user.email, email);
    assert.equal(user.google_id, googleId);
  });

  await test('signing in again with the same googleId returns the same user, not a duplicate', async () => {
    const email = freshEmail('repeat-login');
    const googleId = freshGoogleId();
    const first = await upsertGoogleUser({ googleId, email, name: 'Repeat User' });
    const second = await upsertGoogleUser({ googleId, email, name: 'Repeat User' });
    assert.equal(second.id, first.id, 'repeat Google login must resolve to the same user id');
  });

  await test('an existing email/password account gets linked, not duplicated, on first Google login', async () => {
    const email = freshEmail('existing-password-account');
    const existing = await createUser({ email, password: 'a-real-password-123', name: 'Existing User', company: 'Existing Co' });
    const googleId = freshGoogleId();

    const linked = await upsertGoogleUser({ googleId, email, name: 'Existing User' });
    assert.equal(linked.id, existing.id, 'Google login for a matching email must reuse the existing account id');

    const reloaded = await findUserByEmail(email);
    assert.equal(reloaded.google_id, googleId, 'the existing account should now carry the linked google_id');

    // A second Google login for that same identity must still resolve to the
    // one linked account — never create a second row for the same email.
    const again = await upsertGoogleUser({ googleId, email, name: 'Existing User' });
    assert.equal(again.id, existing.id, 'a second Google login after linking must not create a duplicate account');
  });

  await test('company is left blank (not fabricated) for a brand-new Google user', async () => {
    const email = freshEmail('blank-company');
    const user = await upsertGoogleUser({ googleId: freshGoogleId(), email, name: 'No Company User' });
    assert.equal(user.company, '', 'a Google-created account must not invent a company name — onboarding collects it');
  });

  console.log('');
  console.log('--- POST /api/v1/auth/google (server/index.js) ---');

  // Set (not deleted!) to '' — server/index.js loads `dotenv/config` on
  // import, which only fills in variables not already present in
  // process.env, so a real GOOGLE_CLIENT_ID configured in this machine's own
  // .env would otherwise silently reappear here. See the same trick/comment
  // for CASHFREE_APP_ID in apiSecurity.test.mjs.
  process.env.GOOGLE_CLIENT_ID = '';
  process.env.VITE_GOOGLE_CLIENT_ID = '';
  const { default: app } = await import('../index.js');
  await new Promise((resolve) => setTimeout(resolve, 150));
  const BASE = `http://127.0.0.1:${PORT}`;

  await test('returns 503 when GOOGLE_CLIENT_ID is not configured', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: 'whatever' })
    });
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // From here on, pretend a Client ID is configured so the route reaches the
  // token-verification step instead of short-circuiting on the config check.
  process.env.GOOGLE_CLIENT_ID = `${RUN_ID}.apps.googleusercontent.com`;

  await test('returns 400 when the credential is missing', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
    });
    assert.equal(res.status, 400);
  });

  await test('returns 401 for a credential that is not a validly-signed Google token', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: 'not-a-real-jwt' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    // Never leak internals (e.g. library error text) in the response body.
    assert.ok(!/googleapis|OAuth2Client|node_modules/i.test(JSON.stringify(data)), 'error response should not leak implementation details');
  });

  await test('does not set a session cookie on a failed Google sign-in', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: 'not-a-real-jwt' })
    });
    assert.equal(res.headers.get('set-cookie'), null);
  });

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exitCode = results.failed > 0 ? 1 : 0;
  process.exit(process.exitCode);
}

run().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
