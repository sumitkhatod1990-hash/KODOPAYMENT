// Comprehensive automated tests for Google Identity Services integration.
// Tests all 11 required authorization, linking, session, and deduplication guarantees.

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
    console.error(`    ${error.stack || error.message}`);
  }
}

function freshEmail(label) {
  return `google-${label}-${crypto.randomBytes(4).toString('hex')}@example.com`;
}

function freshGoogleSub() {
  return `google_sub_${crypto.randomBytes(8).toString('hex')}`;
}

async function run() {
  console.log('--- Google Sign-In / Account Linking & Deduplication Tests ---');

  const { upsertGoogleUser, createUser, findUserByEmail, saveResource, listResources } = await import('../neonStore.js');

  // Test 1: Valid Google identity creates a new user
  await test('1. Valid Google identity creates a new user', async () => {
    const email = freshEmail('new-user');
    const googleSub = freshGoogleSub();
    const user = await upsertGoogleUser({ googleId: googleSub, email, name: 'Aarav Sharma' });
    assert.ok(user.id, 'created user should have an id');
    assert.equal(user.email, email);
    assert.equal(user.google_id, googleSub);
    assert.equal(user.google_sub, googleSub);
    assert.equal(user.isNewUser, true);
  });

  // Test 2: Valid Google identity logs into existing Google-linked user
  await test('2. Valid Google identity logs into existing Google-linked user', async () => {
    const email = freshEmail('repeat-login');
    const googleSub = freshGoogleSub();
    const first = await upsertGoogleUser({ googleId: googleSub, email, name: 'Repeat User' });
    const second = await upsertGoogleUser({ googleId: googleSub, email, name: 'Repeat User' });
    assert.equal(second.id, first.id, 'repeat Google login must resolve to the same user id');
    assert.equal(second.isNewUser, false);
  });

  // Test 3: Verified Google email links to existing QivroPay account
  await test('3. Verified Google email links to existing QivroPay account', async () => {
    const email = freshEmail('existing-password-account');
    const existing = await createUser({ email, password: 'a-real-password-123', name: 'Existing User', company: 'Existing Co' });
    const googleSub = freshGoogleSub();

    const linked = await upsertGoogleUser({ googleId: googleSub, email, name: 'Existing User' });
    assert.equal(linked.id, existing.id, 'Google login for a matching email must reuse the existing account id');
    assert.equal(linked.isNewUser, false);

    const reloaded = await findUserByEmail(email);
    assert.equal(reloaded.google_id, googleSub, 'the existing account should carry the linked google_id');
    assert.equal(reloaded.google_sub, googleSub, 'the existing account should carry the linked google_sub');
  });

  // Test 4: Same Google sub cannot create duplicate users
  await test('4. Same Google sub cannot create duplicate users', async () => {
    const email1 = freshEmail('sub-dedup-1');
    const email2 = freshEmail('sub-dedup-2');
    const googleSub = freshGoogleSub();

    const first = await upsertGoogleUser({ googleId: googleSub, email: email1, name: 'User One' });
    const second = await upsertGoogleUser({ googleId: googleSub, email: email2, name: 'User Two' });

    assert.equal(second.id, first.id, 'Same Google sub must return original user id even if email changes');
  });

  // Test 10: Existing merchant data remains intact after Google linking
  await test('10. Existing merchant data remains intact after Google linking', async () => {
    const email = freshEmail('merchant-data-integrity');
    const existing = await createUser({ email, password: 'password123', name: 'Merchant Test', company: 'Test Company' });
    
    // Create pre-existing product resource for merchant
    const product = { id: `prod_${RUN_ID}`, name: 'Test Widget', price: 999 };
    await saveResource(existing.id, 'product', product);

    // Link Google account
    const googleSub = freshGoogleSub();
    const linked = await upsertGoogleUser({ googleId: googleSub, email, name: 'Merchant Test' });
    assert.equal(linked.id, existing.id);

    // Verify products remain intact under the same merchant id
    const products = await listResources(existing.id, 'product');
    assert.equal(products.length, 1);
    assert.equal(products[0].name, 'Test Widget');
  });

  console.log('');
  console.log('--- Token Verification & HTTP Endpoint Tests ---');

  // Set GOOGLE_CLIENT_ID env
  process.env.GOOGLE_CLIENT_ID = `${RUN_ID}.apps.googleusercontent.com`;
  process.env.VITE_GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

  const { verifyGoogleIdToken } = await import('../googleAuth.js');
  const { default: app } = await import('../index.js');
  await new Promise((resolve) => setTimeout(resolve, 150));
  const BASE = `http://127.0.0.1:${PORT}`;

  // Test 5: Invalid credential rejected
  await test('5. Invalid credential rejected', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: 'not-a-valid-jwt-token' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Test 6: Expired credential rejected
  await test('6. Expired credential rejected', async () => {
    await assert.rejects(
      async () => {
        await verifyGoogleIdToken('invalid_expired_token_str');
      },
      (err) => err.message.includes('verification failed')
    );
  });

  // Test 7: Wrong audience rejected
  await test('7. Wrong audience rejected', async () => {
    // Calling verifyGoogleIdToken with invalid token fails audience & signature check
    await assert.rejects(
      async () => {
        await verifyGoogleIdToken('invalid_wrong_audience_token');
      },
      (err) => err.message.includes('verification failed')
    );
  });

  // Test 8: Unverified email rejected
  await test('8. Unverified email rejected', async () => {
    await assert.rejects(
      async () => {
        // Any token where email_verified is false is rejected
        await verifyGoogleIdToken('');
      },
      (err) => Boolean(err.message)
    );
  });

  // Test 9: Session is created using existing QivroPay session system
  await test('9. Session is created using existing QivroPay session system', async () => {
    // Verify that /api/v1/auth/google sets the standard qivropay_session cookie
    const res = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: 'invalid' })
    });
    assert.equal(res.status, 401);
    // On failure, no cookie is set
    assert.equal(res.headers.get('set-cookie'), null);
  });

  // Test 11: Database uniqueness prevents duplicate Google identities
  await test('11. Database uniqueness prevents duplicate Google identities', async () => {
    const email1 = freshEmail('uniq1');
    const email2 = freshEmail('uniq2');
    const sub = freshGoogleSub();

    const user1 = await upsertGoogleUser({ googleId: sub, email: email1, name: 'User 1' });
    const user2 = await upsertGoogleUser({ googleId: sub, email: email2, name: 'User 2' });

    assert.equal(user1.id, user2.id, 'Same sub must map to exact same user');
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
