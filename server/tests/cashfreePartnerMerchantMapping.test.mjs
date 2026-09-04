// Deterministic tests for the Phase 10.8C QivroPay merchant <-> Cashfree
// Partner merchant mapping: the qivropay_cashfree_partner_merchants store
// functions in neonStore.js and the merchant status service in
// cashfreePartnerMerchantStatus.js.
//
// Entirely offline: global.fetch is stubbed for every test that would
// otherwise reach the Cashfree Partner API, so this suite never makes a
// real network call — same convention as cashfreePartnerClient.test.mjs.
// The real sandbox call against merchant SS002190 is a separate, manual
// verification (documented in the Phase 10.8C report), deliberately kept
// out of `npm test`.
//
// Uses the project's real local file-store persistence (no DATABASE_URL) —
// consistent with cashfreeOrderOutcome.test.mjs / refundConcurrency.test.mjs.
// Test rows are namespaced by a random RUN_ID so repeated runs never
// collide; left in place afterward (small, harmless growth), matching the
// existing convention for the append-only qivropay_payment_events rows
// those suites create.
//
// Run with: node server/tests/cashfreePartnerMerchantMapping.test.mjs
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
function stubFetch(handler) {
  globalThis.fetch = handler;
}
function restoreFetch() {
  globalThis.fetch = REAL_FETCH;
}

function cashfreeResponse(body, status = 200) {
  return async () => new Response(JSON.stringify(body), { status });
}

async function run() {
  console.log('Cashfree Partner merchant mapping — deterministic tests');
  console.log('');

  const { createPartnerMerchantMapping, getPartnerMerchantMapping, PartnerMappingError } =
    await import('../neonStore.js');
  const { mapMerchantToCashfreePartner, getStoredMapping, normalizeCashfreeMerchantStatus, refreshMerchantStatus } =
    await import('../cashfreePartnerMerchantStatus.js');

  const ORIGINAL_KEY = process.env.CASHFREE_PARTNER_API_KEY;
  process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_mapping_suite';

  const merchantA = `test_partner_mapping_a_${RUN_ID}`;
  const merchantB = `test_partner_mapping_b_${RUN_ID}`;
  const merchantUnmapped = `test_partner_mapping_unmapped_${RUN_ID}`;
  const cfMerchantA = `CF_TEST_${RUN_ID}_A`;
  const cfMerchantB = `CF_TEST_${RUN_ID}_B`;

  await test('creating a mapping stores both ids with null status fields', async () => {
    const mapping = await mapMerchantToCashfreePartner(merchantA, cfMerchantA);
    assert.equal(mapping.merchant_id, merchantA);
    assert.equal(mapping.cf_merchant_id, cfMerchantA);
    assert.equal(mapping.onboarding_status, null);
    assert.equal(mapping.kyc_status, null);
    assert.equal(mapping.full_kyc_status, null);
    assert.equal(mapping.activation_status, null);
    assert.equal(mapping.transaction_access, null);
    assert.ok(mapping.created_at);
    assert.ok(mapping.updated_at);
  });

  await test('duplicate QivroPay merchant mapping is rejected', async () => {
    await assert.rejects(
      () => createPartnerMerchantMapping({ merchantId: merchantA, cfMerchantId: `CF_TEST_${RUN_ID}_A_ALT` }),
      (err) => err instanceof PartnerMappingError && err.code === 'duplicate_merchant'
    );
  });

  await test('duplicate Cashfree merchant mapping is rejected', async () => {
    await assert.rejects(
      () => createPartnerMerchantMapping({ merchantId: `test_partner_mapping_a_alt_${RUN_ID}`, cfMerchantId: cfMerchantA }),
      (err) => err instanceof PartnerMappingError && err.code === 'duplicate_cf_merchant'
    );
  });

  await test('retrieving an existing mapping returns the stored row', async () => {
    const mapping = await getStoredMapping(merchantA);
    assert.equal(mapping.merchant_id, merchantA);
    assert.equal(mapping.cf_merchant_id, cfMerchantA);
  });

  await test('missing mapping: retrieval returns null, and the status service reports "not started" without calling Cashfree', async () => {
    assert.equal(await getPartnerMerchantMapping(merchantUnmapped), null);
    let fetchCalled = false;
    stubFetch(async () => { fetchCalled = true; throw new Error('fetch must not be called when there is no mapping'); });
    try {
      const result = await refreshMerchantStatus(merchantUnmapped);
      assert.equal(result.started, false);
      assert.equal(result.mapping, null);
      assert.equal(result.error, null);
      assert.equal(fetchCalled, false);
    } finally {
      restoreFetch();
    }
  });

  await test('status update: a successful Cashfree response is normalized and persisted, preserving distinct status fields (not a single boolean)', async () => {
    stubFetch(cashfreeResponse({
      merchant_id: cfMerchantA,
      onboarding_status: 'Email Verified',
      product_status: [{
        product_name: 'PG',
        product_min_kyc_status: 'MIN_KYC_APPROVED',
        product_full_kyc_status: 'FULL_KYC_PENDING',
        activation_status: 'ACTIVE',
        meta_data: { transaction_access: 'full' }
      }]
    }));
    try {
      const result = await refreshMerchantStatus(merchantA);
      assert.equal(result.started, true);
      assert.equal(result.error, null);
      assert.equal(result.mapping.onboarding_status, 'Email Verified');
      assert.equal(result.mapping.kyc_status, 'MIN_KYC_APPROVED');
      assert.equal(result.mapping.full_kyc_status, 'FULL_KYC_PENDING');
      assert.equal(result.mapping.activation_status, 'ACTIVE');
      assert.equal(result.mapping.transaction_access, 'full');

      const persisted = await getStoredMapping(merchantA);
      assert.equal(persisted.kyc_status, 'MIN_KYC_APPROVED');
      assert.equal(persisted.activation_status, 'ACTIVE');
    } finally {
      restoreFetch();
    }
  });

  await test('unknown/future Cashfree status values are preserved as-is, never crashed on or silently mapped to "approved"', async () => {
    stubFetch(cashfreeResponse({
      merchant_id: cfMerchantA,
      onboarding_status: 'Some Future Onboarding State',
      product_status: [{
        product_name: 'PG',
        product_min_kyc_status: 'MIN_KYC_SOME_NEW_STATE',
        product_full_kyc_status: 'FULL_KYC_SOME_NEW_STATE',
        activation_status: 'SUSPENDED_PENDING_REVIEW',
        meta_data: { transaction_access: 'partial' }
      }]
    }));
    try {
      const result = await refreshMerchantStatus(merchantA);
      assert.equal(result.error, null);
      assert.equal(result.mapping.onboarding_status, 'Some Future Onboarding State');
      assert.equal(result.mapping.kyc_status, 'MIN_KYC_SOME_NEW_STATE');
      assert.equal(result.mapping.activation_status, 'SUSPENDED_PENDING_REVIEW');
      assert.equal(result.mapping.transaction_access, 'partial');
      assert.notEqual(result.mapping.kyc_status, 'MIN_KYC_APPROVED', 'an unrecognized status must never be silently coerced to approved');
    } finally {
      restoreFetch();
    }
  });

  await test('normalizeCashfreeMerchantStatus never fabricates fields Cashfree did not send', async () => {
    assert.deepEqual(normalizeCashfreeMerchantStatus({}), {});
    assert.deepEqual(normalizeCashfreeMerchantStatus(null), {});
    const partial = normalizeCashfreeMerchantStatus({ onboarding_status: 'Created' });
    assert.deepEqual(partial, { onboardingStatus: 'Created' });
  });

  await test('merchant isolation: mapping and refreshing merchant B never reads or overwrites merchant A\'s row', async () => {
    await mapMerchantToCashfreePartner(merchantB, cfMerchantB);
    stubFetch(cashfreeResponse({
      merchant_id: cfMerchantB,
      onboarding_status: 'Created',
      product_status: [{ product_name: 'PG', product_min_kyc_status: 'MIN_KYC_PENDING', product_full_kyc_status: 'FULL_KYC_PENDING', activation_status: 'INACTIVE', meta_data: { transaction_access: 'none' } }]
    }));
    try {
      const resultB = await refreshMerchantStatus(merchantB);
      assert.equal(resultB.mapping.cf_merchant_id, cfMerchantB);
      assert.equal(resultB.mapping.kyc_status, 'MIN_KYC_PENDING');
    } finally {
      restoreFetch();
    }

    const mappingA = await getStoredMapping(merchantA);
    const mappingB = await getStoredMapping(merchantB);
    assert.notEqual(mappingA.cf_merchant_id, mappingB.cf_merchant_id);
    assert.equal(mappingA.kyc_status, 'MIN_KYC_SOME_NEW_STATE', "merchant A's row must be unaffected by merchant B's refresh");
    assert.equal(mappingB.kyc_status, 'MIN_KYC_PENDING');
  });

  await test('Cashfree API failure handling: a Cashfree error is surfaced, and the previously stored status is left untouched (never fabricated as approved)', async () => {
    const beforeFailure = await getStoredMapping(merchantA);
    stubFetch(async () => new Response(JSON.stringify({ message: 'Invalid partner api key' }), { status: 401 }));
    try {
      const result = await refreshMerchantStatus(merchantA);
      assert.equal(result.started, true);
      assert.ok(result.error);
      assert.equal(result.error.status, 401);
      assert.equal(result.mapping.kyc_status, beforeFailure.kyc_status, 'a failed Cashfree call must not change the stored status');
    } finally {
      restoreFetch();
    }
    const afterFailure = await getStoredMapping(merchantA);
    assert.deepEqual(afterFailure, beforeFailure, 'stored mapping must be byte-for-byte unchanged after a failed Cashfree call');
  });

  await test('Cashfree credentials are never exposed, even when Cashfree echoes the key back in an error', async () => {
    const secret = 'super_secret_mapping_suite_key_789';
    process.env.CASHFREE_PARTNER_API_KEY = secret;
    stubFetch(async () => new Response(JSON.stringify({ message: `Request rejected for key ${secret}` }), { status: 403 }));
    try {
      const result = await refreshMerchantStatus(merchantA);
      const serialized = JSON.stringify(result);
      assert.ok(!serialized.includes(secret), 'refreshMerchantStatus result must never contain the raw partner API key');
      assert.ok(!String(result.error?.message || '').includes(secret));
    } finally {
      restoreFetch();
      process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_mapping_suite';
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
