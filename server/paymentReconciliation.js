// QivroPay payment <-> Cashfree settlement RECONCILIATION — Phase 10.8F.
//
// Combines three things that already exist separately: QivroPay's own
// payment record (the 'transaction' resource — recordCashfreeOrderOutcome()
// in cashfreeOrderOutcome.js), the QivroPay<->Cashfree merchant mapping
// (cashfreePartnerMerchantStatus.js, Phase 10.8C), and the settlement lookup
// this phase adds (cashfreePartnerSettlement.js). Nothing here duplicates
// any of those — it only orchestrates and derives a reconciliation verdict
// from what they already report.
//
// Storage: reuses the existing generic, already merchant-isolated
// qivropay_resources store (saveResource/getResource/listResources —
// neonStore.js) with three new resource types. No new SQL table — the
// existing table's (merchant_id, resource_type, resource_id) primary key
// already gives every one of these the same per-merchant isolation every
// other resource type in this project has, with zero schema changes:
//
//   cf_settlement          — one row per Cashfree cf_settlement_id observed
//                             for this merchant (resource_id = cf_settlement_id)
//   cf_settlement_line     — one row per QivroPay order, linking it to the
//                             settlement (if any) Cashfree reported for it
//                             (resource_id = orderId)
//   payment_reconciliation — one row per QivroPay order: the current
//                             reconciliation verdict (resource_id = orderId)
//
// READ-ONLY with respect to Cashfree (Phase 10.8F Part 5): every Cashfree
// call this file makes, transitively, is a GET or a read-style POST
// (/settlement/recon takes filters, not a mutation). Nothing here can
// create a payout, change a settlement, or move money.
import { getResource, saveResource, listResources } from './neonStore.js';
import { getStoredMapping } from './cashfreePartnerMerchantStatus.js';
import { getOrderSettlement, CashfreePartnerError } from './cashfreePartnerSettlement.js';

export { CashfreePartnerError };

export const RECONCILIATION_STATES = Object.freeze(['MATCHED', 'PENDING_SETTLEMENT', 'UNMATCHED', 'DISCREPANCY', 'UNKNOWN']);

const KNOWN_SETTLED_STATUSES = ['PENDING', 'PENDING_WITH_CASHFREE', 'PENDING_WITH_BANK'];

// Pure — no I/O, trivially unit-testable. Turns a getOrderSettlement()
// result plus QivroPay's own recorded amount into one of the five
// documented-by-this-project states. Never returns MATCHED unless Cashfree
// actually confirmed success AND the gross amount agrees — an amount that
// cannot be verified is UNKNOWN, not an optimistic MATCHED.
//
// Deliberately compares against `paymentAmount` (Cashfree's *gross*
// payment_amount for the order), never `settlementAmount` (net of
// Cashfree's own fee, which this project has not confirmed the schedule
// for — Phase 10.8F explicitly does not implement commission/fee math).
// A real difference between payment_amount and settlement_amount is
// Cashfree's fee, not a discrepancy.
export function deriveReconciliationState({ found, settlement }, ourAmount) {
  if (!found) return { state: 'UNMATCHED', discrepancy: null };

  const s = settlement || {};
  if (!s.status) return { state: 'PENDING_SETTLEMENT', discrepancy: null };
  if (s.statusRecognized === false) return { state: 'UNKNOWN', discrepancy: null };

  if (s.status === 'FAILED') {
    return { state: 'DISCREPANCY', discrepancy: 'Cashfree reports this order\'s settlement as FAILED.' };
  }
  if (KNOWN_SETTLED_STATUSES.includes(s.status)) {
    return { state: 'PENDING_SETTLEMENT', discrepancy: null };
  }
  // s.status === 'SUCCESS' from here.
  if (typeof s.paymentAmount === 'number' && typeof ourAmount === 'number') {
    const diff = Math.abs(s.paymentAmount - ourAmount);
    if (diff > 0.01) {
      return {
        state: 'DISCREPANCY',
        discrepancy: `Cashfree reports a gross payment amount of ${s.paymentAmount}, which does not match QivroPay's recorded amount of ${ourAmount}.`
      };
    }
    return { state: 'MATCHED', discrepancy: null };
  }
  // Cashfree says SUCCESS but did not report a payment_amount to verify
  // against — cannot confirm a match, so this is not silently marked MATCHED.
  return { state: 'UNKNOWN', discrepancy: null };
}

export class ReconciliationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ReconciliationError';
    this.code = code; // 'payment_not_found' | 'payment_not_succeeded' | 'merchant_not_onboarded'
  }
}

function reconciliationResourceId(orderId) { return String(orderId); }

// Reconciles exactly one QivroPay merchant's one payment (order) against
// Cashfree's settlement record for it, persists the result, and returns it.
//
// Deliberately scoped to payments already recorded as 'succeeded' — Phase
// 10.8F Part 7's "payment success ≠ settlement" applies to *why* a lack of
// settlement data is not itself an error, not to whether a failed/pending
// payment should be reconciled at all (it should not: nothing was ever
// expected to settle for it).
export async function reconcilePayment(merchantId, orderId) {
  if (!merchantId) throw new Error('reconcilePayment requires merchantId');
  if (!orderId) throw new Error('reconcilePayment requires orderId');

  const transaction = await getResource(merchantId, 'transaction', orderId);
  if (!transaction) throw new ReconciliationError('No QivroPay payment record found for this order.', 'payment_not_found');
  if (transaction.status !== 'succeeded') {
    throw new ReconciliationError('Only a succeeded payment can be reconciled against a Cashfree settlement.', 'payment_not_succeeded');
  }

  const mapping = await getStoredMapping(merchantId);
  const rid = reconciliationResourceId(orderId);
  const previous = await getResource(merchantId, 'payment_reconciliation', rid);

  if (!mapping) {
    // This merchant has no Cashfree Partner sub-merchant mapping at all yet
    // (Phase 10.8C/D onboarding not completed) — there is no cf_merchant_id
    // to authenticate a Partner-on-behalf-of-merchant lookup with, so this
    // is not a transient failure to retry; it is a real "cannot reconcile
    // yet" state, recorded as such rather than silently skipped.
    const result = {
      id: rid,
      state: 'UNKNOWN',
      discrepancy: null,
      reason: 'merchant_not_onboarded',
      cfSettlementId: null,
      lastCheckedAt: new Date().toISOString(),
      error: null
    };
    await saveResource(merchantId, 'payment_reconciliation', result);
    return result;
  }

  let lookup;
  try {
    lookup = await getOrderSettlement(mapping.cf_merchant_id, orderId);
  } catch (err) {
    if (err instanceof CashfreePartnerError) {
      // A failed Cashfree call must never overwrite the last real
      // reconciliation verdict with a fabricated one — same discipline as
      // refreshMerchantStatus() (cashfreePartnerMerchantStatus.js) for
      // onboarding status.
      if (previous) {
        return { ...previous, stale: true, error: { status: err.status, code: err.code, message: err.message } };
      }
      const result = {
        id: rid,
        state: 'UNKNOWN',
        discrepancy: null,
        reason: 'cashfree_unreachable',
        cfSettlementId: null,
        lastCheckedAt: new Date().toISOString(),
        error: { status: err.status, code: err.code, message: err.message }
      };
      await saveResource(merchantId, 'payment_reconciliation', result);
      return { ...result, stale: true };
    }
    throw err;
  }

  const { state, discrepancy } = deriveReconciliationState(lookup, transaction.amount);

  if (lookup.found && lookup.settlement?.cfSettlementId) {
    await saveResource(merchantId, 'cf_settlement', {
      id: lookup.settlement.cfSettlementId,
      status: lookup.settlement.status || null,
      settlementUtr: lookup.settlement.settlementUtr || null,
      settlementCurrency: lookup.settlement.settlementCurrency || null,
      settlementType: lookup.settlement.settlementType || null,
      settlementInitiatedOn: lookup.settlement.settlementInitiatedOn || null,
      settlementProcessedOn: lookup.settlement.settlementProcessedOn || null,
      fetchedAt: new Date().toISOString()
    });
  }

  await saveResource(merchantId, 'cf_settlement_line', {
    id: rid,
    orderId: String(orderId),
    cfSettlementId: lookup.settlement?.cfSettlementId || null,
    cfPaymentId: lookup.settlement?.cfPaymentId || null,
    paymentAmount: typeof lookup.settlement?.paymentAmount === 'number' ? lookup.settlement.paymentAmount : null,
    settlementAmount: typeof lookup.settlement?.settlementAmount === 'number' ? lookup.settlement.settlementAmount : null,
    fetchedAt: new Date().toISOString()
  });

  const result = {
    id: rid,
    state,
    discrepancy,
    reason: null,
    cfSettlementId: lookup.settlement?.cfSettlementId || null,
    lastCheckedAt: new Date().toISOString(),
    error: null
  };
  await saveResource(merchantId, 'payment_reconciliation', result);
  return result;
}

// Reconciles every succeeded payment for a merchant that does not already
// have a MATCHED verdict — a bounded batch operation for the dashboard/route
// layer, not a background job (Phase 10.8F Part 8 explicitly rules out an
// uncontrolled polling job in this phase). Callers decide when to invoke
// this (a manual "Refresh settlements" action, e.g.), never on a timer.
export async function reconcileMerchantPayments(merchantId, { limit = 50 } = {}) {
  if (!merchantId) throw new Error('reconcileMerchantPayments requires merchantId');
  const transactions = (await listResources(merchantId, 'transaction'))
    .filter((t) => t.status === 'succeeded')
    .slice(0, limit);

  const results = [];
  for (const t of transactions) {
    // Sequential, not Promise.all: this hits the real Cashfree Partner API
    // once per payment, and Phase 10.8F Part 8 explicitly rules out
    // uncontrolled concurrency against Cashfree in this phase.
    // eslint-disable-next-line no-await-in-loop
    const result = await reconcilePayment(merchantId, t.id);
    results.push(result);
  }
  return results;
}

export async function getStoredReconciliation(merchantId, orderId) {
  if (!merchantId) throw new Error('getStoredReconciliation requires merchantId');
  if (!orderId) throw new Error('getStoredReconciliation requires orderId');
  return getResource(merchantId, 'payment_reconciliation', reconciliationResourceId(orderId));
}

export async function listStoredReconciliations(merchantId) {
  if (!merchantId) throw new Error('listStoredReconciliations requires merchantId');
  return listResources(merchantId, 'payment_reconciliation');
}

export async function listStoredSettlements(merchantId) {
  if (!merchantId) throw new Error('listStoredSettlements requires merchantId');
  return listResources(merchantId, 'cf_settlement');
}
