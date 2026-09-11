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
export async function createMerchant({ merchantId, merchantEmail, merchantName, pocPhone, merchantSiteUrl, environment, ...optionalFields }) {
  if (!merchantId || !merchantEmail || !merchantName || !pocPhone || !merchantSiteUrl) {
    throw new Error('createMerchant requires merchantId, merchantEmail, merchantName, pocPhone and merchantSiteUrl');
  }
  return partnerRequest('/merchants', {
    method: 'POST',
    environment,
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
// safe to call as often as needed. Supports explicit environment selection.
export async function getMerchantStatus(merchantId, environment) {
  if (!merchantId) throw new Error('getMerchantStatus requires a merchantId');
  return partnerRequest(`/merchants/${encodeURIComponent(merchantId)}`, { environment });
}

// Phase 10.8D: creates a Cashfree-hosted, embeddable merchant onboarding/KYC link.
export async function createEmbeddableOnboardingLink(merchantId, returnUrl, environment) {
  if (!merchantId) throw new Error('createEmbeddableOnboardingLink requires a merchantId');
  if (!returnUrl) throw new Error('createEmbeddableOnboardingLink requires a returnUrl');
  return partnerRequest(`/merchants/${encodeURIComponent(merchantId)}/onboarding_link`, {
    method: 'POST',
    environment,
    body: { type: 'account_onboarding', return_url: returnUrl }
  });
}
