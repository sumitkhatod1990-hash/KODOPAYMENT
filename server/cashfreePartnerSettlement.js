// Cashfree Partner SETTLEMENT / RECONCILIATION service — Phase 10.8F.
//
// Wraps the two documented, Partner-usable Cashfree PG endpoints this phase
// confirmed against Cashfree's own API reference before writing any code:
//
//   GET  /orders/{order_id}/settlements   getOrderSettlement()
//   POST /settlement/recon                getSettlementRecon()
//
// Both go through partnerPgRequest() (cashfreePartner.js), so Partner
// credential loading, timeout handling and error sanitization are only ever
// implemented once, exactly like every other Partner-surface file in this
// project.
//
// Read-only, by design (Phase 10.8F Part 5): nothing in this file, or
// anywhere this file is called from, ever creates a payout, moves money,
// modifies a settlement, triggers a refund, or changes a merchant's bank
// account. It only retrieves and normalizes what Cashfree already reports.
//
// -------------------------------------------------------------
// WHAT WAS CONFIRMED, DOCUMENTED, VS INFERRED (see the Phase 10.8F report for
// the full research trail) — every field this file reads off a Cashfree
// response is one the cited reference page actually documents. Fields
// Cashfree did not send are left undefined, never fabricated:
//
//   settlement_details.status: documented enum SUCCESS | PENDING |
//     PENDING_WITH_CASHFREE | PENDING_WITH_BANK | FAILED
//     (get-settlements-by-order-id.md). Any other string is preserved
//     verbatim and treated as unrecognized — never guessed into one of the
//     known values.
//   settlement_details.{cf_settlement_id, settlement_utr,
//     settlement_initiated_on, settlement_processed_on, settlement_currency,
//     settlement_type}: documented, same page.
//   payment_details.{payment_amount, settlement_amount, cf_payment_id,
//     vendor_commission}: documented, same page. payment_amount is the
//     gross amount Cashfree recorded for the payment; settlement_amount is
//     net of Cashfree's own (currently unconfirmed to this project) fees —
//     see reconcilePayment() below for why only payment_amount is used to
//     decide MATCHED vs DISCREPANCY, never settlement_amount.
//   /settlement/recon's event_details / settlement_details /
//     payment_details / order_details / refund_details / dispute_details
//     fields: documented on settlement-reconciliation.md.
//
// NOT implemented in this phase, and why:
//   - Cashfree's "Vendor Reconciliation" API (/recon/vendor) — confirmed to
//     be scoped to Easy Split / vendor-marketplace settlements
//     (merchant_vendor_id, "wait 15 minutes after VENDOR_SETTLEMENT_SUCCESS
//     webhook"), not the Embedded Payments / Partner sub-merchant model this
//     project uses. Explicitly out of scope per the Phase 10.8F brief.
//   - Settlement webhooks (SETTLEMENT_INITIATED/SUCCESS/FAILED/REVERSED) —
//     documented for a merchant's own account, but this project could not
//     confirm that a Partner account can configure or receive these
//     webhooks on behalf of a sub-merchant it does not directly hold
//     dashboard credentials for. Per the Phase 10.8F brief ("if there is no
//     documented Partner settlement webhook, do not invent one"), this phase
//     implements on-demand/periodic reconciliation via the two APIs above
//     instead of a webhook.
import { partnerPgRequest } from './cashfreePartner.js';
import { CashfreePartnerError } from './cashfreePartner.js';

export { CashfreePartnerError };

const KNOWN_SETTLEMENT_STATUSES = ['SUCCESS', 'PENDING', 'PENDING_WITH_CASHFREE', 'PENDING_WITH_BANK', 'FAILED'];

// Fetches the latest settlement linked to a single Cashfree order, on
// behalf of cfMerchantId (a Partner sub-merchant). Never throws for the
// case Cashfree documents as a normal "not found" — the caller decides what
// that means (see reconcilePayment()); throws CashfreePartnerError,
// unmodified, for any other Cashfree failure.
//
// Returns:
//   { found: false, settlement: null, error: null }               — Cashfree 404s the order under this merchant
//   { found: true, settlement: <normalized>, error: null }         — order recognized (settlement may or may not exist yet within it)
export async function getOrderSettlement(cfMerchantId, orderId) {
  if (!cfMerchantId) throw new Error('getOrderSettlement requires cfMerchantId');
  if (!orderId) throw new Error('getOrderSettlement requires orderId');
  try {
    const { data } = await partnerPgRequest(cfMerchantId, `/orders/${encodeURIComponent(orderId)}/settlements`);
    return { found: true, settlement: normalizeOrderSettlement(data), error: null };
  } catch (err) {
    if (err instanceof CashfreePartnerError && err.status === 404) {
      return { found: false, settlement: null, error: null };
    }
    throw err;
  }
}

// Fetches settlement reconciliation events for cfMerchantId within the
// given filters — a thin pass-through to POST /settlement/recon. Used for
// bulk/period reconciliation (e.g. "everything settled this week") rather
// than the single-order lookup above. filters/pagination are forwarded
// as-is; see settlement-reconciliation.md for the accepted shape
// (cf_settlement_ids, settlement_utrs, start/end_date_initiated_on,
// start/end_date_processed_on).
export async function getSettlementRecon(cfMerchantId, { filters, cursor, limit } = {}) {
  if (!cfMerchantId) throw new Error('getSettlementRecon requires cfMerchantId');
  const body = {
    pagination: { limit: limit || 50, cursor: cursor || null },
    filters: filters || {}
  };
  const { data } = await partnerPgRequest(cfMerchantId, '/settlement/recon', { method: 'POST', body });
  return {
    cursor: data?.cursor ?? null,
    events: Array.isArray(data?.data) ? data.data.map(normalizeReconEvent) : []
  };
}

// Extracts exactly the documented get-settlements-by-order-id fields this
// project tracks, leaving anything Cashfree did not send as undefined
// rather than null/0/"" — a caller can distinguish "Cashfree didn't report
// this field" from "Cashfree reported a real zero/empty value".
export function normalizeOrderSettlement(data) {
  const settlement = data?.settlement_details || {};
  const payment = data?.payment_details || {};
  const result = {};
  if (typeof settlement.cf_settlement_id === 'string') result.cfSettlementId = settlement.cf_settlement_id;
  if (typeof settlement.status === 'string') result.status = settlement.status;
  if (typeof settlement.status_description === 'string') result.statusDescription = settlement.status_description;
  if (typeof settlement.settlement_utr === 'string') result.settlementUtr = settlement.settlement_utr;
  if (typeof settlement.settlement_initiated_on === 'string') result.settlementInitiatedOn = settlement.settlement_initiated_on;
  if (typeof settlement.settlement_processed_on === 'string') result.settlementProcessedOn = settlement.settlement_processed_on;
  if (typeof settlement.settlement_currency === 'string') result.settlementCurrency = settlement.settlement_currency;
  if (typeof settlement.settlement_type === 'string') result.settlementType = settlement.settlement_type;
  if (typeof payment.cf_payment_id === 'string') result.cfPaymentId = payment.cf_payment_id;
  if (typeof payment.payment_amount === 'number') result.paymentAmount = payment.payment_amount;
  if (typeof payment.settlement_amount === 'number') result.settlementAmount = payment.settlement_amount;
  if (typeof payment.vendor_commission === 'number') result.vendorCommission = payment.vendor_commission;
  if (typeof data?.order_details?.order_id === 'string') result.orderId = data.order_details.order_id;
  result.statusRecognized = result.status ? KNOWN_SETTLEMENT_STATUSES.includes(result.status) : null;
  return result;
}

// Extracts the documented settlement/recon event fields this project
// tracks, same "never invent a missing field" discipline as above.
export function normalizeReconEvent(entry) {
  const event = entry?.event_details || {};
  const order = entry?.order_details || {};
  const payment = entry?.payment_details || {};
  const settlement = entry?.settlement_details || {};
  const result = {};
  if (typeof event.event_type === 'string') result.eventType = event.event_type;
  if (typeof event.event_status === 'string') result.eventStatus = event.event_status;
  if (typeof event.event_settlement_amount === 'number') result.eventSettlementAmount = event.event_settlement_amount;
  if (typeof event.event_amount === 'number') result.eventAmount = event.event_amount;
  if (typeof event.sale_type === 'string') result.saleType = event.sale_type;
  if (typeof event.event_time === 'string') result.eventTime = event.event_time;
  if (typeof order.order_id === 'string') result.orderId = order.order_id;
  if (typeof order.order_amount === 'number') result.orderAmount = order.order_amount;
  if (typeof payment.cf_payment_id === 'string') result.cfPaymentId = payment.cf_payment_id;
  if (typeof payment.payment_amount === 'number') result.paymentAmount = payment.payment_amount;
  if (typeof settlement.cf_settlement_id === 'string') result.cfSettlementId = settlement.cf_settlement_id;
  if (typeof settlement.settlement_utr === 'string') result.settlementUtr = settlement.settlement_utr;
  if (typeof settlement.settlement_date === 'string') result.settlementDate = settlement.settlement_date;
  return result;
}
