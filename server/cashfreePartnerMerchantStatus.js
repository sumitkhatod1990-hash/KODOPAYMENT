// QivroPay merchant <-> Cashfree Partner merchant status service —
// Phase 10.8C.
//
// This is the one place that combines the two things Phase 10.8A/10.8B
// built separately: the read-only Cashfree Partner client
// (cashfreePartner.js / cashfreePartnerMerchants.js) and the mapping store
// (neonStore.js's qivropay_cashfree_partner_merchants functions). It does
// not implement Partner API authentication itself — every Cashfree call
// goes through getMerchantStatus(), which goes through partnerRequest(), so
// credential handling, timeouts and error sanitization are only ever
// implemented once (in cashfreePartner.js).
//
// Phase 10.8C scope: mapping + status retrieval only. No commission, no
// settlement, no signup wiring, no automatic merchant creation — see the
// Phase 10.8C report for what remains deliberately unimplemented.
import { getMerchantStatus } from './cashfreePartnerMerchants.js';
import { CashfreePartnerError } from './cashfreePartner.js';
import {
  createPartnerMerchantMapping,
  getPartnerMerchantMapping,
  updatePartnerMerchantStatus,
  PartnerMappingError
} from './neonStore.js';

export { PartnerMappingError, CashfreePartnerError };

// Creates the QivroPay merchant <-> Cashfree merchant mapping. Deliberately
// thin — just validates presence of both ids and delegates to the store,
// which owns the actual uniqueness guarantees.
export async function mapMerchantToCashfreePartner(merchantId, cfMerchantId) {
  if (!merchantId) throw new Error('mapMerchantToCashfreePartner requires merchantId');
  if (!cfMerchantId) throw new Error('mapMerchantToCashfreePartner requires cfMerchantId');
  return createPartnerMerchantMapping({ merchantId, cfMerchantId });
}

export async function getStoredMapping(merchantId) {
  if (!merchantId) throw new Error('getStoredMapping requires merchantId');
  return getPartnerMerchantMapping(merchantId);
}

// Extracts the status fields this phase tracks from a raw Cashfree
// GET /merchants/{id} response, without reducing them to a single
// approved/not-approved boolean. Any field Cashfree did not return is left
// undefined (so updatePartnerMerchantStatus leaves the previously stored
// value alone rather than clearing it) — this function never invents a
// status Cashfree didn't actually send.
//
// product_status is an array (one entry per Cashfree product, e.g. "PG").
// This phase only tracks a single QivroPay<->Cashfree merchant relationship
// with one relevant product, so it takes the "PG" entry if present, or the
// first entry otherwise, rather than guessing which product QivroPay cares
// about for a merchant that has more than one attached.
export function normalizeCashfreeMerchantStatus(data) {
  const result = {};
  if (!data || typeof data !== 'object') return result;
  if (typeof data.onboarding_status === 'string') result.onboardingStatus = data.onboarding_status;

  const productStatuses = Array.isArray(data.product_status) ? data.product_status : [];
  const product = productStatuses.find((p) => p?.product_name === 'PG') || productStatuses[0] || null;
  if (product) {
    if (typeof product.product_min_kyc_status === 'string') result.kycStatus = product.product_min_kyc_status;
    if (typeof product.product_full_kyc_status === 'string') result.fullKycStatus = product.product_full_kyc_status;
    if (typeof product.activation_status === 'string') result.activationStatus = product.activation_status;
    if (typeof product.meta_data?.transaction_access === 'string') result.transactionAccess = product.meta_data.transaction_access;
  }
  return result;
}

// Fetches the current Cashfree status for a QivroPay merchant's mapped
// Cashfree merchant, updates the stored status, and returns the combined
// result. Never fabricates a status:
//   - no mapping yet            -> { started: false, mapping: null, error: null }
//   - Cashfree call fails       -> { started: true, mapping: <last known row>, error: {...} }
//                                   (stored status is left untouched — a
//                                   failed lookup must never be recorded as
//                                   any particular status, approved or
//                                   otherwise)
//   - Cashfree call succeeds    -> { started: true, mapping: <freshly updated row>, error: null }
export async function refreshMerchantStatus(merchantId) {
  if (!merchantId) throw new Error('refreshMerchantStatus requires merchantId');
  const mapping = await getStoredMapping(merchantId);
  if (!mapping) return { started: false, mapping: null, error: null };

  let response;
  try {
    response = await getMerchantStatus(mapping.cf_merchant_id);
  } catch (err) {
    if (err instanceof CashfreePartnerError) {
      return { started: true, mapping, error: { status: err.status, code: err.code, message: err.message } };
    }
    throw err;
  }

  const normalized = normalizeCashfreeMerchantStatus(response.data);
  const updated = await updatePartnerMerchantStatus(merchantId, normalized);
  return { started: true, mapping: updated, error: null };
}
