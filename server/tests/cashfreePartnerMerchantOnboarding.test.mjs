// Deterministic tests for the Phase 10.8D Cashfree Partner merchant
// CREATION service (server/cashfreePartnerMerchantOnboarding.js): merchant
// creation, the 409/duplicate-safety recovery logic, the creation claim,
// and the embeddable onboarding-link wrapper.
//
// Entirely offline: global.fetch is stubbed for every Cashfree call, same
// convention as cashfreePartnerClient.test.mjs / cashfreePartnerMerchantMapping.test.mjs.
// The live sandbox exercise of the onboarding-link endpoint against the
// real SS002190 merchant is a separate, manual, non-destructive verification
// documented in the Phase 10.8D report — deliberately kept out of `npm test`.
//
// Run with: node server/tests/cashfreePartnerMerchantOnboarding.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import crypto from 'crypto';

const RUN_ID = crypto.randomBytes(4).toString('hex');

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

const REAL_FETCH = globalThis.fetch;
function restoreFetch() {
  globalThis.fetch = REAL_FETCH;
}

// Dispatches on METHOD + pathname suffix so a single stub can serve the
// multi-call sequences createOrLinkCashfreeMerchant() makes (POST
// /merchants, then GET /merchants/{id} for either 409-recovery or the
// post-creation status refresh).
function stubFetchRouter(handlers) {
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    const method = (opts?.method || 'GET').toUpperCase();
    calls.push({ method, url });
    const handler = handlers.find((h) => h.method === method && h.test(url));
    if (!handler) throw new Error(`Unexpected fetch call in test stub: ${method} ${url}`);
    return handler.respond();
  };
  return calls;
}

function json(body, status = 200) {
  return async () => new Response(JSON.stringify(body), { status });
}

const statusBody = (cfMerchantId, overrides = {}) => ({
  merchant_id: cfMerchantId,
  onboarding_status: 'Email Verified',
  product_status: [{
    product_name: 'PG',
    product_min_kyc_status: 'MIN_KYC_APPROVED',
    product_full_kyc_status: 'FULL_KYC_PENDING',
    activation_status: 'ACTIVE',
    meta_data: { transaction_access: 'full' }
  }],
  ...overrides
});

async function run() {
  console.log('Cashfree Partner merchant onboarding (creation) — deterministic tests');
  console.log('');

  const { createOrLinkCashfreeMerchant, getCashfreePartnerOnboardingLink, PartnerOnboardingConflictError } =
    await import('../cashfreePartnerMerchantOnboarding.js');
  const { getStoredMapping } = await import('../cashfreePartnerMerchantStatus.js');
  const { beginPartnerMerchantCreationClaim, releasePartnerMerchantCreationClaim } = await import('../neonStore.js');
  const { CashfreePartnerError } = await import('../cashfreePartner.js');

  const ORIGINAL_KEY = process.env.CASHFREE_PARTNER_API_KEY;
  process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_onboarding_suite';

  const profile = { merchantEmail: 'onboard.test@example.com', merchantName: 'Onboard Test Co', pocPhone: '+91 98765 43210', merchantSiteUrl: 'https://onboard-test.example.com' };

  await test('1/8: successful creation calls POST /merchants then refreshes authoritative status, storing distinct status fields', async () => {
    const merchantId = `test_onboard_create_${RUN_ID}`;
    const calls = stubFetchRouter([
      { method: 'POST', test: (u) => u.endsWith('/merchants'), respond: json({ merchant_id: merchantId }) },
      { method: 'GET', test: (u) => u.includes(`/merchants/${merchantId}`), respond: json(statusBody(merchantId)) }
    ]);
    try {
      const result = await createOrLinkCashfreeMerchant(merchantId, profile);
      assert.equal(result.created, true);
      assert.equal(result.error, null);
      assert.equal(result.mapping.cf_merchant_id, merchantId, 'the Cashfree merchant_id must be exactly this QivroPay merchant_id');
      assert.equal(result.mapping.kyc_status, 'MIN_KYC_APPROVED');
      assert.equal(result.mapping.activation_status, 'ACTIVE');
      assert.equal(calls.length, 2, 'exactly one create call and one status-refresh call');
    } finally {
      restoreFetch();
    }
  });

  await test('2: mapping is persisted and retrievable independently of the creation call', async () => {
    const merchantId = `test_onboard_persist_${RUN_ID}`;
    stubFetchRouter([
      { method: 'POST', test: (u) => u.endsWith('/merchants'), respond: json({ merchant_id: merchantId }) },
      { method: 'GET', test: (u) => u.includes(`/merchants/${merchantId}`), respond: json(statusBody(merchantId)) }
    ]);
    try {
      await createOrLinkCashfreeMerchant(merchantId, profile);
    } finally {
      restoreFetch();
    }
    const stored = await getStoredMapping(merchantId);
    assert.equal(stored.cf_merchant_id, merchantId);
    assert.equal(stored.onboarding_status, 'Email Verified');
  });

  await test('3: an existing mapping prevents any duplicate Cashfree merchant creation call', async () => {
    const merchantId = `test_onboard_persist_${RUN_ID}`; // reuse the merchant mapped in test 2
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; throw new Error('must not call Cashfree when a mapping already exists'); };
    try {
      const result = await createOrLinkCashfreeMerchant(merchantId, profile);
      assert.equal(result.created, false);
      assert.equal(result.mapping.cf_merchant_id, merchantId);
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
    }
  });

  await test('5: the client-influenced profile object can never override which Cashfree merchant_id is used', async () => {
    const merchantId = `test_onboard_no_override_${RUN_ID}`;
    stubFetchRouter([
      { method: 'POST', test: (u) => u.endsWith('/merchants'), respond: json({ merchant_id: merchantId }) },
      { method: 'GET', test: (u) => u.includes(`/merchants/${merchantId}`), respond: json(statusBody(merchantId)) }
    ]);
    try {
      // An attacker-controlled profile object stuffing in cfMerchantId/merchant_id
      // fields must have no effect — only merchantId (the function's own
      // first argument, always req.user.id at the route layer) determines it.
      const result = await createOrLinkCashfreeMerchant(merchantId, { ...profile, cfMerchantId: 'attacker_supplied', merchant_id: 'attacker_supplied' });
      assert.equal(result.mapping.cf_merchant_id, merchantId);
    } finally {
      restoreFetch();
    }
  });

  await test('6/7: a non-recoverable Cashfree failure is thrown, never partially persisted, and does not permanently lock the claim', async () => {
    const merchantId = `test_onboard_failure_${RUN_ID}`;
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Internal error' }), { status: 500 });
    try {
      await assert.rejects(
        () => createOrLinkCashfreeMerchant(merchantId, profile),
        (err) => err instanceof CashfreePartnerError && err.status === 500
      );
    } finally {
      restoreFetch();
    }
    assert.equal(await getStoredMapping(merchantId), null, 'a failed creation must never leave a partial mapping behind');

    // The claim released by the failure above must allow an immediate retry
    // to succeed — a transient failure must not permanently lock the merchant.
    stubFetchRouter([
      { method: 'POST', test: (u) => u.endsWith('/merchants'), respond: json({ merchant_id: merchantId }) },
      { method: 'GET', test: (u) => u.includes(`/merchants/${merchantId}`), respond: json(statusBody(merchantId)) }
    ]);
    try {
      const retry = await createOrLinkCashfreeMerchant(merchantId, profile);
      assert.equal(retry.created, true);
    } finally {
      restoreFetch();
    }
  });

  await test('9: an unknown/future status returned by the post-creation refresh is preserved, not fabricated as approved', async () => {
    const merchantId = `test_onboard_unknown_status_${RUN_ID}`;
    globalThis.fetch = async (url, opts) => {
      const method = (opts?.method || 'GET').toUpperCase();
      if (method === 'POST' && url.endsWith('/merchants')) return new Response(JSON.stringify({ merchant_id: merchantId }), { status: 200 });
      if (method === 'GET' && url.includes(`/merchants/${merchantId}`)) {
        return new Response(JSON.stringify(statusBody(merchantId, { onboarding_status: 'Some Future State' })), { status: 200 });
      }
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    };
    try {
      const result = await createOrLinkCashfreeMerchant(merchantId, profile);
      assert.equal(result.mapping.onboarding_status, 'Some Future State');
    } finally {
      restoreFetch();
    }
  });

  await test('409 recovery: a documented "already exists" conflict for OUR OWN merchant_id is safely recovered, not treated as a hard failure', async () => {
    const merchantId = `test_onboard_recover_${RUN_ID}`;
    stubFetchRouter([
      { method: 'POST', test: (u) => u.endsWith('/merchants'), respond: json({ message: 'Merchant with same id or email already exists' }, 409) },
      { method: 'GET', test: (u) => u.includes(`/merchants/${merchantId}`), respond: json(statusBody(merchantId)) }
    ]);
    try {
      const result = await createOrLinkCashfreeMerchant(merchantId, profile);
      assert.equal(result.created, false, 'recovered creation is reported as not newly created (Cashfree already had it)');
      assert.equal(result.mapping.cf_merchant_id, merchantId);
      assert.equal(result.mapping.kyc_status, 'MIN_KYC_APPROVED');
    } finally {
      restoreFetch();
    }
  });

  await test('409 unresolved: a conflict where GET confirms no merchant exists under our id is surfaced as an unresolved conflict, never guessed at', async () => {
    const merchantId = `test_onboard_unresolved_${RUN_ID}`;
    stubFetchRouter([
      { method: 'POST', test: (u) => u.endsWith('/merchants'), respond: json({ message: 'Merchant with same id or email already exists' }, 409) },
      { method: 'GET', test: (u) => u.includes(`/merchants/${merchantId}`), respond: json({ message: 'not found' }, 404) }
    ]);
    try {
      await assert.rejects(
        () => createOrLinkCashfreeMerchant(merchantId, profile),
        (err) => err instanceof PartnerOnboardingConflictError && err.code === 'unresolved_conflict'
      );
    } finally {
      restoreFetch();
    }
    assert.equal(await getStoredMapping(merchantId), null, 'an unresolved conflict must never fabricate a mapping');
  });

  await test('creation_in_progress: a merchant with a claim already held rejects a second concurrent attempt without calling Cashfree', async () => {
    const merchantId = `test_onboard_claim_${RUN_ID}`;
    const claim = await beginPartnerMerchantCreationClaim(merchantId);
    assert.equal(claim.won, true);
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; throw new Error('must not call Cashfree while another creation is in flight'); };
    try {
      await assert.rejects(
        () => createOrLinkCashfreeMerchant(merchantId, profile),
        (err) => err instanceof PartnerOnboardingConflictError && err.code === 'creation_in_progress'
      );
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
      await releasePartnerMerchantCreationClaim(merchantId);
    }
  });

  await test('10: concurrent onboarding requests for the same merchant result in exactly one Cashfree merchant', async () => {
    const merchantId = `test_onboard_concurrent_${RUN_ID}`;
    let createCalls = 0;
    globalThis.fetch = async (url, opts) => {
      const method = (opts?.method || 'GET').toUpperCase();
      if (method === 'POST' && url.endsWith('/merchants')) {
        createCalls += 1;
        return new Response(JSON.stringify({ merchant_id: merchantId }), { status: 200 });
      }
      if (method === 'GET' && url.includes(`/merchants/${merchantId}`)) {
        return new Response(JSON.stringify(statusBody(merchantId)), { status: 200 });
      }
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    };
    try {
      const [a, b] = await Promise.allSettled([
        createOrLinkCashfreeMerchant(merchantId, profile),
        createOrLinkCashfreeMerchant(merchantId, profile)
      ]);
      assert.equal(createCalls, 1, 'exactly one POST /merchants call must have reached Cashfree, regardless of which request "won"');
      const winner = [a, b].find((r) => r.status === 'fulfilled');
      assert.ok(winner, 'at least one of the two concurrent requests must succeed');
    } finally {
      restoreFetch();
    }
    const stored = await getStoredMapping(merchantId);
    assert.equal(stored.cf_merchant_id, merchantId);

    // A third call after both have settled must see the existing mapping,
    // not attempt to create again.
    let fetchCalledAgain = false;
    globalThis.fetch = async () => { fetchCalledAgain = true; throw new Error('must not call Cashfree again'); };
    try {
      const third = await createOrLinkCashfreeMerchant(merchantId, profile);
      assert.equal(third.created, false);
      assert.equal(fetchCalledAgain, false);
    } finally {
      restoreFetch();
    }
  });

  await test('12: onboarding link — no mapping yet reports started:false without calling Cashfree', async () => {
    const merchantId = `test_link_no_mapping_${RUN_ID}`;
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; throw new Error('must not call Cashfree'); };
    try {
      const result = await getCashfreePartnerOnboardingLink(merchantId, 'https://app.example.com/return');
      assert.equal(result.started, false);
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
    }
  });

  await test('12: onboarding link — a mapped merchant gets the real Cashfree-returned link and expiry, untouched', async () => {
    const merchantId = `test_link_success_${RUN_ID}`;
    stubFetchRouter([
      { method: 'POST', test: (u) => u.endsWith('/merchants'), respond: json({ merchant_id: merchantId }) },
      { method: 'GET', test: (u) => u.includes(`/merchants/${merchantId}`), respond: json(statusBody(merchantId)) }
    ]);
    try {
      await createOrLinkCashfreeMerchant(merchantId, profile);
    } finally {
      restoreFetch();
    }
    globalThis.fetch = async (url, opts) => {
      assert.equal((opts?.method || 'GET').toUpperCase(), 'POST');
      assert.ok(url.includes(`/merchants/${merchantId}/onboarding_link`));
      const body = JSON.parse(opts.body);
      assert.equal(body.type, 'account_onboarding');
      assert.equal(body.return_url, 'https://app.example.com/return');
      return new Response(JSON.stringify({ created_at: '2026-09-03T00:00:00Z', expires_at: '2026-09-03T01:00:00Z', onboarding_link: 'https://cashfree.example/onboard/abc123' }), { status: 200 });
    };
    try {
      const result = await getCashfreePartnerOnboardingLink(merchantId, 'https://app.example.com/return');
      assert.equal(result.started, true);
      assert.equal(result.error, null);
      assert.equal(result.link.onboardingLink, 'https://cashfree.example/onboard/abc123');
      assert.equal(result.link.expiresAt, '2026-09-03T01:00:00Z');
    } finally {
      restoreFetch();
    }
  });

  await test('13: onboarding link — Cashfree\'s documented 409 ("product already active") is surfaced as a sanitized error, not a crash', async () => {
    const merchantId = `test_link_success_${RUN_ID}`; // already mapped from the previous test
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Product already active for merchant' }), { status: 409 });
    try {
      const result = await getCashfreePartnerOnboardingLink(merchantId, 'https://app.example.com/return');
      assert.equal(result.started, true);
      assert.equal(result.link, null);
      assert.equal(result.error.status, 409);
    } finally {
      restoreFetch();
    }
  });

  await test('14: Cashfree credentials never appear in a creation or link error, even when Cashfree echoes them back', async () => {
    const secret = 'super_secret_onboarding_suite_key_321';
    process.env.CASHFREE_PARTNER_API_KEY = secret;
    const merchantId = `test_onboard_secret_${RUN_ID}`;
    globalThis.fetch = async () => new Response(JSON.stringify({ message: `Request rejected for key ${secret}` }), { status: 403 });
    try {
      let caught = null;
      try {
        await createOrLinkCashfreeMerchant(merchantId, profile);
      } catch (err) {
        caught = err;
      }
      assert.ok(caught, 'a 403 must be thrown, not silently succeed');
      assert.ok(!String(caught.message).includes(secret));
    } finally {
      restoreFetch();
      process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_onboarding_suite';
    }
  });

  if (ORIGINAL_KEY === undefined) delete process.env.CASHFREE_PARTNER_API_KEY; else process.env.CASHFREE_PARTNER_API_KEY = ORIGINAL_KEY;

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
