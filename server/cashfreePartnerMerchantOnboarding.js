// QivroPay merchant -> Cashfree Partner merchant CREATION service —
// Phase 10.8D.
//
// This is the write-side counterpart to cashfreePartnerMerchantStatus.js
// (Phase 10.8C, read-only status refresh). It owns exactly two operations:
// creating (at most once) the Cashfree Partner merchant behind a QivroPay
// merchant, and generating a Cashfree-hosted onboarding/KYC link for an
// already-created one. It does not implement Partner API authentication
// itself (createMerchant/getMerchantStatus/createEmbeddableOnboardingLink,
// all from cashfreePartnerMerchants.js, go through the same partnerRequest()
// as everywhere else), and it never fabricates a Cashfree merchant_id or
// status.
//
// -------------------------------------------------------------
// IDEMPOTENCY / DUPLICATE-CREATION SAFETY (Phase 10.8D Part 3)
// -------------------------------------------------------------
// Cashfree's own POST /merchants reference does not document any
// Idempotency-Key style mechanism — confirmed by reading the live API
// reference before writing this file, not assumed. What it DOES document is
// that merchant_id must be unique, and that creating a merchant with an
// already-used merchant_id (or email) fails with 409 ("Merchant with same id
// or email already exists"). This function turns that single documented
// fact into the actual safety mechanism, rather than inventing a header
// Cashfree doesn't support:
//
//   cfMerchantId is ALWAYS the calling QivroPay merchant's own merchant_id
//   (usr_..., already globally unique in this system, already within
//   Cashfree's documented 40-char alphanumeric/hyphen/underscore limit) —
//   never a freshly generated id per attempt.
//
// That single design choice is what makes every scenario Part 3 asks for
// safe:
//   - normal duplicate clicks / browser retries: the mapping-existence check
//     at the top returns the existing mapping immediately, no Cashfree call.
//   - concurrent requests: beginPartnerMerchantCreationClaim() (neonStore.js)
//     lets only one request per merchant_id actually call Cashfree at a
//     time; the loser gets a 'creation_in_progress' conflict to retry, it
//     never calls Cashfree at all. This is a same-process/same-database
//     claim, not a distributed lock — see the caveat below.
//   - network timeout AFTER Cashfree accepted creation, or a crash after
//     Cashfree accepted creation but before the local mapping was
//     persisted: the retry sends the exact same merchant_id again, Cashfree
//     returns 409, and — because that id is only ever used for THIS
//     QivroPay merchant — that 409 is safe to interpret as "already created
//     by an earlier attempt of mine" rather than a genuine conflict. This
//     function confirms that by calling GET /merchants/{merchant_id}
//     immediately afterward: if Cashfree actually has a merchant under that
//     exact id, recovery proceeds (persist the mapping, refresh status). If
//     it does not (404), the 409 must instead have come from Cashfree's
//     *other* documented trigger — an email collision under a different,
//     unrelated merchant_id this system has no way to identify — and this
//     function deliberately gives up rather than guessing: it surfaces an
//     'unresolved_conflict' rather than fabricating a mapping to a Cashfree
//     merchant it cannot confirm belongs to this QivroPay account.
//
// UNAVOIDABLE AMBIGUITY (documented, not hidden): beginPartnerMerchantCreationClaim
// is a claim recorded in this project's own store (Postgres row / local-file
// mutex), not a Cashfree-side lock. Two requests arriving at the exact same
// instant on two different, uncoordinated server processes without a shared
// Postgres backend (i.e. two local-dev-store processes) could theoretically
// both win a claim and both call Cashfree — Cashfree's own merchant_id
// uniqueness is what prevents that from ever producing two Cashfree
// merchants (one call wins, the other gets the 409-recovery path above), but
// it does mean both processes briefly do real (wasted, harmless) network
// work in that specific multi-process-without-Postgres scenario. On a real
// Postgres-backed deployment (the qivropay_cashfree_partner_merchants
// PRIMARY KEY / UNIQUE constraints plus the claim row) this is fully safe
// across any number of server instances.
import { createMerchant, getMerchantStatus, createEmbeddableOnboardingLink } from './cashfreePartnerMerchants.js';
import { CashfreePartnerError } from './cashfreePartner.js';
import {
  createPartnerMerchantMapping,
  beginPartnerMerchantCreationClaim,
  completePartnerMerchantCreationClaim,
  releasePartnerMerchantCreationClaim,
  PartnerMappingError
} from './neonStore.js';
import { getStoredMapping, refreshMerchantStatus } from './cashfreePartnerMerchantStatus.js';

export class PartnerOnboardingConflictError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'PartnerOnboardingConflictError';
    this.code = code; // 'creation_in_progress' | 'unresolved_conflict'
  }
}

// Creates the Cashfree Partner merchant for merchantId if (and only if) no
// mapping exists yet, then immediately fetches authoritative status.
// NEVER creates a second Cashfree merchant for a QivroPay merchant that
// already has one — the existence check is the very first thing this
// function does, on every call.
//
// profile must contain merchantEmail, merchantName, pocPhone,
// merchantSiteUrl — the exact required fields for Cashfree's POST
// /merchants (Phase 10.8A contract). This function does not validate or
// default them; the caller (the HTTP route) is responsible for sourcing
// merchantEmail/merchantName from the authenticated QivroPay account and
// validating the client-supplied pocPhone/merchantSiteUrl before calling.
//
// Returns { created, mapping, error }. Throws PartnerOnboardingConflictError
// for a conflict this function cannot safely resolve automatically (see the
// file-level comment). Throws CashfreePartnerError, unmodified, for any
// other Cashfree failure — the caller sanitizes/maps that to a 502.
export async function createOrLinkCashfreeMerchant(merchantId, profile) {
  if (!merchantId) throw new Error('createOrLinkCashfreeMerchant requires merchantId');
  const { merchantEmail, merchantName, pocPhone, merchantSiteUrl } = profile || {};

  const existing = await getStoredMapping(merchantId);
  if (existing) return { created: false, mapping: existing, error: null };

  const claim = await beginPartnerMerchantCreationClaim(merchantId);
  if (!claim.won) {
    throw new PartnerOnboardingConflictError(
      'A Cashfree merchant creation attempt for this account is already in progress. Try again shortly.',
      'creation_in_progress'
    );
  }

  const cfMerchantId = merchantId;
  let recoveredFromConflict = false;

  try {
    // Re-check after winning the claim: another request could have created
    // and persisted the mapping between the check above and the claim being
    // granted.
    const recheck = await getStoredMapping(merchantId);
    if (recheck) {
      await completePartnerMerchantCreationClaim(merchantId);
      return { created: false, mapping: recheck, error: null };
    }

    try {
      await createMerchant({ merchantId: cfMerchantId, merchantEmail, merchantName, pocPhone, merchantSiteUrl });
    } catch (err) {
      if (!(err instanceof CashfreePartnerError) || err.status !== 409) throw err;

      let statusResponse;
      try {
        statusResponse = await getMerchantStatus(cfMerchantId);
      } catch (statusErr) {
        if (statusErr instanceof CashfreePartnerError && statusErr.status === 404) {
          throw new PartnerOnboardingConflictError(
            'Cashfree reported a conflict that could not be safely resolved automatically.',
            'unresolved_conflict'
          );
        }
        throw statusErr;
      }
      if (statusResponse?.data?.merchant_id !== cfMerchantId) {
        throw new PartnerOnboardingConflictError(
          'Cashfree reported a conflict that could not be safely resolved automatically.',
          'unresolved_conflict'
        );
      }
      recoveredFromConflict = true;
    }

    let mapping;
    try {
      mapping = await createPartnerMerchantMapping({ merchantId, cfMerchantId });
    } catch (e) {
      if (!(e instanceof PartnerMappingError)) throw e;
      // Lost a race to another request that persisted the mapping between
      // our recheck above and this insert — converge on what is stored,
      // this is not an error.
      mapping = await getStoredMapping(merchantId);
    }

    const refreshed = await refreshMerchantStatus(merchantId);
    await completePartnerMerchantCreationClaim(merchantId);
    return { created: !recoveredFromConflict, mapping: refreshed.mapping || mapping, error: refreshed.error };
  } catch (err) {
    await releasePartnerMerchantCreationClaim(merchantId).catch(() => {});
    throw err;
  }
}

// Generates a Cashfree-hosted, embeddable onboarding/KYC link for a
// merchant that already has a mapping (see createEmbeddableOnboardingLink in
// cashfreePartnerMerchants.js for the confirmed API contract this wraps).
// Requires an existing mapping — never creates one, and never accepts a
// caller-supplied cf_merchant_id; the Cashfree merchant looked up is always
// the one merchantId is already mapped to.
//
// Returns { started: false } if there is no mapping yet (caller must call
// createOrLinkCashfreeMerchant first). Returns { started: true, link, error:
// null } on success, or { started: true, link: null, error } if Cashfree
// itself rejects the request (e.g. its documented 409 "product already
// active for merchant" once KYC/activation no longer needs a new link) —
// this is a real, expected Cashfree response, not this wrapper failing.
export async function getCashfreePartnerOnboardingLink(merchantId, returnUrl) {
  if (!merchantId) throw new Error('getCashfreePartnerOnboardingLink requires merchantId');
  if (!returnUrl) throw new Error('getCashfreePartnerOnboardingLink requires returnUrl');

  const mapping = await getStoredMapping(merchantId);
  if (!mapping) return { started: false, link: null, error: null };

  try {
    const { data } = await createEmbeddableOnboardingLink(mapping.cf_merchant_id, returnUrl);
    return {
      started: true,
      link: {
        onboardingLink: data?.onboarding_link || null,
        createdAt: data?.created_at || null,
        expiresAt: data?.expires_at || null
      },
      error: null
    };
  } catch (err) {
    if (err instanceof CashfreePartnerError) {
      return { started: true, link: null, error: { status: err.status, code: err.code, message: err.message } };
    }
    throw err;
  }
}
