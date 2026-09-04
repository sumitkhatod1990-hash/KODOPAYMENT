// Thin wrapper around the two Cashfree Partner merchant-onboarding
// operations this phase has confirmed against Cashfree's own API reference:
//
//   POST {partnerBaseUrl}/merchants                  createMerchant()
//   GET  {partnerBaseUrl}/merchants/{merchant_id}     getMerchantStatus()
//
// Source: https://www.cashfree.com/docs/api-reference/platforms/latest/merchant-onboarding/create-merchant.md
// and .../get-merchant-status.md (field names, required vs optional fields,
// and onboarding_status / product_min_kyc_status values below are taken
// directly from those pages' OpenAPI definitions).
//
// PHASE 10.8A: this module is deliberately NOT called from any QivroPay
// route yet (not the signup flow, not merchant/onboarding/complete, nothing
// customer-facing). It exists so the raw Partner API contract can be tested
// directly (a manual script, or a future dedicated test route) before any
// product decision is made about how QivroPay's own onboarding UI should
// drive it. See the Phase 10.8A report for what remains unconfirmed
// (rate limits, sync-vs-async activation timing, whether sandbox test keys
// work identically before Partner KYC completes).
import { partnerRequest } from './cashfreePartner.js';

// onboarding_status values documented for the created/fetched merchant:
export const MERCHANT_ONBOARDING_STATUS = Object.freeze({
  CREATED: 'Created',
  EMAIL_VERIFIED: 'Email Verified'
});

// product_status[].product_min_kyc_status values documented for each
// product (e.g. "PG") attached to a sub-merchant:
export const MERCHANT_KYC_STATUS = Object.freeze({
  PENDING: 'MIN_KYC_PENDING',
  SUBMITTED: 'MIN_KYC_SUBMITTED',
  APPROVED: 'MIN_KYC_APPROVED',
  REJECTED: 'MIN_KYC_REJECTED'
});

// Confirmed against a real Cashfree TEST Partner merchant (Phase 10.8B):
// each entry in product_status[] also carries product_full_kyc_status
// (seen: "FULL_KYC_PENDING"), activation_status (seen: "ACTIVE"), and a
// meta_data object (seen: { transaction_access: "full" }). None of these
// were documented ahead of time and this wrapper does not currently expose
// enums for them — getMerchantStatus() still passes the full object through
// untouched, so no caller is blocked, but a future caller reading these
// fields should not assume the value sets above are exhaustive.

// Creates a new sub-merchant under this Partner account. Only the fields
// documented as required are validated here — everything else
// (business_details, website_details, bank_account_details,
// signatory_details, additional_details) is passed through untouched, as-is,
// so this wrapper never has to guess at nested-object shapes it hasn't
// independently confirmed.
export async function createMerchant({ merchantId, merchantEmail, merchantName, pocPhone, merchantSiteUrl, ...optionalFields }) {
  if (!merchantId || !merchantEmail || !merchantName || !pocPhone || !merchantSiteUrl) {
    throw new Error('createMerchant requires merchantId, merchantEmail, merchantName, pocPhone and merchantSiteUrl');
  }
  return partnerRequest('/merchants', {
    method: 'POST',
    body: {
      merchant_id: merchantId,
      merchant_email: merchantEmail,
      merchant_name: merchantName,
      poc_phone: pocPhone,
      merchant_site_url: merchantSiteUrl,
      ...optionalFields
    }
  });
}

// Fetches onboarding/KYC status for an existing sub-merchant. Read-only —
// safe to call as often as needed, including as the "first real documented
// operation" connectivity check once a real sandbox merchant_id exists (see
// the Phase 10.8A report for why this could not be turned into a
// zero-argument health check).
export async function getMerchantStatus(merchantId) {
  if (!merchantId) throw new Error('getMerchantStatus requires a merchantId');
  return partnerRequest(`/merchants/${encodeURIComponent(merchantId)}`);
}

// Phase 10.8D: creates a Cashfree-hosted, embeddable merchant onboarding/KYC
// link — confirmed against Cashfree's own API reference
// (.../merchant-onboarding/create-embeddable-onboarding-link-does-not-require-login):
//
//   POST {partnerBaseUrl}/merchants/{merchant_id}/onboarding_link
//   body: { "type": "account_onboarding", "return_url": <string> }
//   200 response: { created_at, expires_at, onboarding_link }
//
// Documented as "The link remains active for 1 hour only" and intended to be
// "embed[ded] within your platform" — i.e. no separate Cashfree login step
// for the merchant, unlike the sibling "standard" onboarding link endpoint
// (.../onboarding_link/standard, requires the merchant to log in with a
// Cashfree password or email OTP), which this phase deliberately does not
// wrap: QivroPay's desired UX keeps the merchant inside the QivroPay product
// throughout, which only the embeddable variant supports.
//
// Cashfree documents a 409 ("product already active for merchant") for this
// endpoint — i.e. requesting a new link for a merchant whose product is
// already active is a real, expected error, not a bug in this wrapper.
export async function createEmbeddableOnboardingLink(merchantId, returnUrl) {
  if (!merchantId) throw new Error('createEmbeddableOnboardingLink requires a merchantId');
  if (!returnUrl) throw new Error('createEmbeddableOnboardingLink requires a returnUrl');
  return partnerRequest(`/merchants/${encodeURIComponent(merchantId)}/onboarding_link`, {
    method: 'POST',
    body: { type: 'account_onboarding', return_url: returnUrl }
  });
}
