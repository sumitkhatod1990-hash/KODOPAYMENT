// Frontend-safe QivroPay <-> Cashfree Partner onboarding STATE MACHINE —
// Phase 10.8E.
//
// This is the one place that turns the raw Cashfree status fields QivroPay's
// backend already exposes (GET /api/v1/merchant/cashfree-partner-status —
// see server/cashfreePartnerMerchantStatus.js's sanitizedPartnerMappingStatus
// and src/types/index.ts's CashfreePartnerStatus for the exact shape this
// consumes) into one of a small, fixed set of UI states. Pure and
// framework-free on purpose: no React, no fetch, no DOM — trivially unit
// testable from plain Node (see server/tests/cashfreeOnboardingStateMachine.test.mjs)
// and safe to import from any browser bundle.
//
// Deliberately conservative, matching the same posture as
// PaymentSetupTab.tsx before this phase:
//   - onboarding_status ("Created" / "Email Verified") and kyc_status
//     (MIN_KYC_PENDING/SUBMITTED/APPROVED/REJECTED) are the two fields
//     Cashfree's own public API reference documents and enumerates (mirrored
//     here as the same string literals server/cashfreePartnerMerchants.js
//     exports as MERCHANT_ONBOARDING_STATUS/MERCHANT_KYC_STATUS — not
//     imported from that file, since it pulls in process.env-based Cashfree
//     client code that must never end up in a browser bundle).
//   - full_kyc_status / activation_status / transaction_access are real
//     fields this system has observed from live Cashfree responses, but
//     Cashfree's reference does not document or enumerate them anywhere.
//     This module only ever reads them literally — "is the string exactly
//     'ACTIVE'?", "is it exactly 'full'?" — it never invents a meaning
//     Cashfree hasn't itself spelled out in the value.
//   - Any status combination this function cannot confidently place —
//     an unrecognized value, or documented and undocumented fields pointing
//     in different directions — is reported as UNKNOWN with a `reason`,
//     never guessed into an optimistic state. The raw fields are always
//     returned alongside `state` so a caller can still show them verbatim.

export const ONBOARDING_STATES = Object.freeze([
  'NOT_STARTED',
  'MERCHANT_CREATION_PENDING',
  'EMAIL_VERIFICATION',
  'MIN_KYC_PENDING',
  'MIN_KYC_SUBMITTED',
  'MIN_KYC_REJECTED',
  'MIN_KYC_APPROVED',
  'FULL_KYC_PENDING',
  'ACTIVE',
  'ACCESS_RESTRICTED',
  'UNKNOWN',
  'ERROR_STALE'
]);

const KNOWN_KYC_STATUSES = ['MIN_KYC_PENDING', 'MIN_KYC_SUBMITTED', 'MIN_KYC_REJECTED', 'MIN_KYC_APPROVED'];

function normalizeRaw(status) {
  return {
    started: Boolean(status?.started),
    stale: Boolean(status?.stale),
    cfMerchantId: status?.cfMerchantId ?? null,
    onboardingStatus: status?.onboardingStatus ?? null,
    kycStatus: status?.kycStatus ?? null,
    fullKycStatus: status?.fullKycStatus ?? null,
    activationStatus: status?.activationStatus ?? null,
    transactionAccess: status?.transactionAccess ?? null,
    updatedAt: status?.updatedAt ?? null,
    errorMessage: status?.errorMessage ?? null
  };
}

function conflict(raw, reason) {
  return { state: 'UNKNOWN', reason, raw };
}

function ok(state, raw) {
  return { state, reason: null, raw };
}

// Returns { state, reason, raw }. `raw` is always the full normalized set of
// fields this function looked at — never trimmed, so a caller can still
// render "additional details reported by Cashfree" even when `state` is a
// simplified/collapsed presentation of them.
export function deriveOnboardingState(status) {
  const raw = normalizeRaw(status);

  if (!raw.started) return ok('NOT_STARTED', raw);
  if (raw.stale) return { state: 'ERROR_STALE', reason: 'stale_status', raw };

  const { onboardingStatus, kycStatus, fullKycStatus, activationStatus, transactionAccess } = raw;

  // These two undocumented fields are only ever read literally — presence of
  // a value other than the one observed meaning "full access" is treated as
  // a plain, non-inventive "not full access" signal, not a specific reason.
  const activationActive = activationStatus === 'ACTIVE';
  const activationRestricted = activationStatus != null && activationStatus !== 'ACTIVE';
  const transactionFull = transactionAccess === 'full';
  const transactionRestricted = transactionAccess != null && transactionAccess !== 'full';

  const positiveAccessSignal = activationActive || transactionFull;
  const negativeAccessSignal = activationRestricted || transactionRestricted;

  // The two undocumented fields disagreeing with each other (one says full
  // access, the other says restricted) is exactly the kind of conflict this
  // module refuses to resolve by guessing.
  if (positiveAccessSignal && negativeAccessSignal) return conflict(raw, 'conflicting_fields');

  if (kycStatus != null && !KNOWN_KYC_STATUSES.includes(kycStatus)) {
    return conflict(raw, 'unrecognized_kyc_status');
  }

  if (kycStatus == null) {
    // A positive access signal before minimum KYC has even been recorded as
    // approved is a documented-vs-undocumented-field contradiction.
    if (positiveAccessSignal) return conflict(raw, 'conflicting_fields');

    if (onboardingStatus == null) return ok('MERCHANT_CREATION_PENDING', raw);
    if (onboardingStatus === 'Created') return ok('EMAIL_VERIFICATION', raw);
    if (onboardingStatus === 'Email Verified') return ok('MIN_KYC_PENDING', raw);
    return conflict(raw, 'unrecognized_onboarding_status');
  }

  if (kycStatus === 'MIN_KYC_PENDING' || kycStatus === 'MIN_KYC_SUBMITTED' || kycStatus === 'MIN_KYC_REJECTED') {
    if (positiveAccessSignal) return conflict(raw, 'conflicting_fields');
    return ok(kycStatus, raw);
  }

  // kycStatus === 'MIN_KYC_APPROVED' from here on.
  if (negativeAccessSignal) return ok('ACCESS_RESTRICTED', raw);
  if (positiveAccessSignal) return ok('ACTIVE', raw);
  if (fullKycStatus === 'FULL_KYC_PENDING') return ok('FULL_KYC_PENDING', raw);
  return ok('MIN_KYC_APPROVED', raw);
}

// Merchant-facing copy for each state. Kept in this module (rather than in
// the React component) so the same wording is used everywhere a state is
// shown — the full Payment Setup screen and the compact dashboard card
// alike. `action` is the label for the "launch Cashfree verification" button
// specifically (see PaymentSetupTab's canLaunchVerification, which shows
// that button for every state except ACTIVE/ERROR_STALE and lets Cashfree
// itself be the final word on whether a link can actually be issued — it
// documents a 409 for a merchant whose product is already active, which is
// handled as a graceful message, not a crash). null means that button is not
// offered for this state. The "Refresh status" button is always offered
// separately by the caller, so it is never repeated here.
export const STATE_COPY = Object.freeze({
  NOT_STARTED: {
    title: 'Payment setup not started',
    detail: 'Start payment setup to create your Cashfree merchant account and begin verification.',
    tone: 'neutral',
    action: 'Start payment setup'
  },
  MERCHANT_CREATION_PENDING: {
    title: 'Setting up your payment account',
    detail: 'Your Cashfree merchant account is being created. This should only take a moment.',
    tone: 'amber',
    action: 'Continue verification'
  },
  EMAIL_VERIFICATION: {
    title: 'Email verification pending',
    detail: 'Check the email on your QivroPay account for a message from Cashfree and follow the verification link.',
    tone: 'amber',
    action: 'Continue verification'
  },
  MIN_KYC_PENDING: {
    title: 'Minimum KYC pending',
    detail: 'Complete verification with Cashfree to continue payment setup.',
    tone: 'amber',
    action: 'Complete verification'
  },
  MIN_KYC_SUBMITTED: {
    title: 'Minimum KYC submitted',
    detail: 'Cashfree is reviewing the information you submitted. No action is needed right now.',
    tone: 'amber',
    action: 'Continue verification'
  },
  MIN_KYC_REJECTED: {
    title: 'Verification needs attention',
    detail: 'Cashfree was unable to approve your verification submission. Continue verification to review and resubmit.',
    tone: 'rose',
    action: 'Review verification'
  },
  MIN_KYC_APPROVED: {
    title: 'Minimum KYC approved',
    detail: 'Cashfree has approved your minimum KYC. Payment access is tracked separately — see the details below.',
    tone: 'emerald',
    action: 'Continue verification'
  },
  FULL_KYC_PENDING: {
    title: 'Full KYC pending',
    detail: 'Minimum KYC is approved. Cashfree has additional full KYC verification pending on this account.',
    tone: 'amber',
    action: 'Continue verification'
  },
  ACTIVE: {
    title: 'Payment setup complete',
    detail: 'Cashfree reports full transaction access for your account.',
    tone: 'emerald',
    action: null
  },
  ACCESS_RESTRICTED: {
    title: 'Payment access restricted',
    detail: 'Cashfree has restricted payment access on this account. Refresh status, or continue verification if further action is required there.',
    tone: 'rose',
    action: 'Continue verification'
  },
  UNKNOWN: {
    title: 'Status reported by Cashfree',
    detail: 'Cashfree returned a status this dashboard does not yet have specific guidance for. Raw values are shown below.',
    tone: 'neutral',
    action: 'Continue verification'
  },
  ERROR_STALE: {
    title: 'Verification status unavailable',
    detail: 'Could not reach Cashfree just now — showing the last known status below.',
    tone: 'amber',
    action: null
  }
});

// Overrides STATE_COPY for the UNKNOWN state depending on *why* it is
// UNKNOWN. `conflicting_fields` gets its own honest copy per the Phase 10.8E
// requirement to never silently pick an optimistic state when Cashfree's
// documented and undocumented fields disagree.
export const REASON_COPY = Object.freeze({
  conflicting_fields: {
    title: 'Action required — verification status unavailable',
    detail: 'Cashfree returned information for this account that this dashboard cannot safely interpret. This has been left unresolved rather than guessed at — refresh status, or continue verification if prompted there.',
    tone: 'rose'
  }
});

// Combines STATE_COPY + any REASON_COPY override into the single copy object
// a component should render for a given deriveOnboardingState() result.
export function describeOnboardingState({ state, reason }) {
  const base = STATE_COPY[state] || STATE_COPY.UNKNOWN;
  if (reason && REASON_COPY[reason]) return { ...base, ...REASON_COPY[reason] };
  return base;
}
