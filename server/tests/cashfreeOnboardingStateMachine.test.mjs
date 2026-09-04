// Deterministic tests for the Phase 10.8E frontend-safe onboarding state
// machine (src/lib/cashfreeOnboardingState.js). Pure function, no network,
// no store — every scenario is a plain input/output check against the
// CashfreePartnerStatus shape the real GET /api/v1/merchant/cashfree-partner-status
// route returns (see server/index.js sanitizedPartnerMappingStatus).
//
// Run with: node server/tests/cashfreeOnboardingStateMachine.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';
import { deriveOnboardingState, describeOnboardingState, ONBOARDING_STATES } from '../../src/lib/cashfreeOnboardingState.js';

const results = { passed: 0, failed: 0 };

function test(name, fn) {
  try {
    fn();
    results.passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    results.failed += 1;
    console.error(`  FAIL - ${name}`);
    console.error(`    ${err.stack || err.message}`);
  }
}

function notStarted() {
  return { started: false };
}

function status(overrides) {
  return {
    started: true,
    stale: false,
    cfMerchantId: 'usr_test',
    onboardingStatus: null,
    kycStatus: null,
    fullKycStatus: null,
    activationStatus: null,
    transactionAccess: null,
    updatedAt: '2026-09-03T00:00:00Z',
    errorMessage: null,
    ...overrides
  };
}

console.log('Cashfree onboarding state machine (Phase 10.8E) — deterministic tests');
console.log('');

test('1: not started', () => {
  const result = deriveOnboardingState(notStarted());
  assert.equal(result.state, 'NOT_STARTED');
  assert.equal(result.reason, null);
});

test('1b: null/undefined status is treated identically to not-started', () => {
  assert.equal(deriveOnboardingState(null).state, 'NOT_STARTED');
  assert.equal(deriveOnboardingState(undefined).state, 'NOT_STARTED');
});

test('2: merchant creation pending — started, but Cashfree has not returned onboarding_status yet', () => {
  const result = deriveOnboardingState(status({}));
  assert.equal(result.state, 'MERCHANT_CREATION_PENDING');
});

test('3: email verification pending — onboarding_status "Created"', () => {
  const result = deriveOnboardingState(status({ onboardingStatus: 'Created' }));
  assert.equal(result.state, 'EMAIL_VERIFICATION');
});

test('4: email verified, KYC not yet started — collapses into MIN_KYC_PENDING', () => {
  const result = deriveOnboardingState(status({ onboardingStatus: 'Email Verified' }));
  assert.equal(result.state, 'MIN_KYC_PENDING');
});

test('5: MIN_KYC_PENDING via kyc_status directly', () => {
  const result = deriveOnboardingState(status({ onboardingStatus: 'Email Verified', kycStatus: 'MIN_KYC_PENDING' }));
  assert.equal(result.state, 'MIN_KYC_PENDING');
});

test('6: MIN_KYC_SUBMITTED', () => {
  const result = deriveOnboardingState(status({ onboardingStatus: 'Email Verified', kycStatus: 'MIN_KYC_SUBMITTED' }));
  assert.equal(result.state, 'MIN_KYC_SUBMITTED');
});

test('7: MIN_KYC_REJECTED', () => {
  const result = deriveOnboardingState(status({ onboardingStatus: 'Email Verified', kycStatus: 'MIN_KYC_REJECTED' }));
  assert.equal(result.state, 'MIN_KYC_REJECTED');
});

test('8: MIN_KYC_APPROVED with no activation/transaction/full-kyc signal yet', () => {
  const result = deriveOnboardingState(status({ onboardingStatus: 'Email Verified', kycStatus: 'MIN_KYC_APPROVED' }));
  assert.equal(result.state, 'MIN_KYC_APPROVED');
});

test('9: FULL_KYC_PENDING — approved min KYC, no activation/transaction signal, full_kyc_status pending', () => {
  const result = deriveOnboardingState(status({ kycStatus: 'MIN_KYC_APPROVED', fullKycStatus: 'FULL_KYC_PENDING' }));
  assert.equal(result.state, 'FULL_KYC_PENDING');
});

test('10: ACTIVE — the real SS002190 sandbox shape (min KYC approved, full KYC pending, activation ACTIVE, transaction_access full)', () => {
  const result = deriveOnboardingState(status({
    onboardingStatus: 'Email Verified',
    kycStatus: 'MIN_KYC_APPROVED',
    fullKycStatus: 'FULL_KYC_PENDING',
    activationStatus: 'ACTIVE',
    transactionAccess: 'full'
  }));
  assert.equal(result.state, 'ACTIVE', 'transaction_access:full / activation_status:ACTIVE must win over an in-progress full_kyc_status');
});

test('10b: ACCESS_RESTRICTED — approved min KYC but an explicit non-active/non-full signal', () => {
  const result = deriveOnboardingState(status({ kycStatus: 'MIN_KYC_APPROVED', activationStatus: 'SUSPENDED' }));
  assert.equal(result.state, 'ACCESS_RESTRICTED');
});

test('11: unknown future kyc_status is never fabricated as approved or any other known state', () => {
  const result = deriveOnboardingState(status({ kycStatus: 'SOME_FUTURE_KYC_STATE' }));
  assert.equal(result.state, 'UNKNOWN');
  assert.equal(result.reason, 'unrecognized_kyc_status');
  assert.equal(result.raw.kycStatus, 'SOME_FUTURE_KYC_STATE', 'the raw unrecognized value must still be exposed, never hidden');
});

test('11b: unknown future onboarding_status (no kyc_status yet) is UNKNOWN, not silently mapped to a known stage', () => {
  const result = deriveOnboardingState(status({ onboardingStatus: 'Some Future Onboarding State' }));
  assert.equal(result.state, 'UNKNOWN');
  assert.equal(result.reason, 'unrecognized_onboarding_status');
});

test('12: conflicting statuses — activation ACTIVE while min KYC is still only pending must not be optimistically shown as active', () => {
  const result = deriveOnboardingState(status({ kycStatus: 'MIN_KYC_PENDING', activationStatus: 'ACTIVE' }));
  assert.equal(result.state, 'UNKNOWN');
  assert.equal(result.reason, 'conflicting_fields');
  const copy = describeOnboardingState(result);
  assert.match(copy.title, /action required/i);
});

test('12b: conflicting statuses — activation ACTIVE but transaction_access explicitly not full, both after approval', () => {
  const result = deriveOnboardingState(status({ kycStatus: 'MIN_KYC_APPROVED', activationStatus: 'ACTIVE', transactionAccess: 'restricted' }));
  assert.equal(result.state, 'UNKNOWN');
  assert.equal(result.reason, 'conflicting_fields');
});

test('12c: conflicting statuses — rejected KYC but an active access signal', () => {
  const result = deriveOnboardingState(status({ kycStatus: 'MIN_KYC_REJECTED', transactionAccess: 'full' }));
  assert.equal(result.state, 'UNKNOWN');
  assert.equal(result.reason, 'conflicting_fields');
});

test('13: Cashfree API failure with stale state — last known status is preserved as ERROR_STALE, not discarded', () => {
  const result = deriveOnboardingState(status({ stale: true, kycStatus: 'MIN_KYC_SUBMITTED', errorMessage: 'Cashfree Partner API request timed out' }));
  assert.equal(result.state, 'ERROR_STALE');
  assert.equal(result.reason, 'stale_status');
  assert.equal(result.raw.kycStatus, 'MIN_KYC_SUBMITTED', 'the last known kyc_status must still be exposed while stale');
  assert.equal(result.raw.errorMessage, 'Cashfree Partner API request timed out');
});

test('14: describeOnboardingState always returns non-empty title/detail for every declared state', () => {
  for (const state of ONBOARDING_STATES) {
    const copy = describeOnboardingState({ state, reason: null });
    assert.ok(copy.title, `${state} must have a title`);
    assert.ok(copy.detail, `${state} must have a detail`);
    assert.ok(['neutral', 'amber', 'emerald', 'rose'].includes(copy.tone), `${state} must have a known tone`);
  }
});

test('15: deriveOnboardingState never throws on a malformed/empty object', () => {
  assert.doesNotThrow(() => deriveOnboardingState({}));
  assert.doesNotThrow(() => deriveOnboardingState({ started: true }));
});

console.log('');
console.log(`${results.passed} passed, ${results.failed} failed`);
process.exit(results.failed > 0 ? 1 : 0);
