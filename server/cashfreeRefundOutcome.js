import { getResource, saveResource, completeRefundClaim, reopenRefundClaimAfterFailure } from './neonStore.js';

// Applies an observed Cashfree refund_status to a transaction. This is the
// single place that decides what a SUCCESS / PENDING / FAILED|CANCELLED
// refund observation should do to transaction + claim state — called from
// three places that can each independently learn a refund's status: the
// initial refund POST's own response, the (currently unsubscribed) Cashfree
// webhook, and the on-demand reconciliation lookup. However QivroPay learns
// a refund's status, it is applied through this one function, exactly the
// same way, exactly once per observation. Mirrors the design of
// recordCashfreeOrderOutcome() (cashfreeOrderOutcome.js), which unifies the
// two ways an order's payment status is learned.
//
// Never assumes HTTP 2xx means the refund is complete — the caller passes
// Cashfree's own refund_status field, which is authoritative:
//   SUCCESS            -> transaction becomes 'refunded' / 'partially_refunded'
//                          (terminal); the claim is completed (permanent).
//   FAILED / CANCELLED -> transaction reverts to 'succeeded' (refundable
//                          again); the claim is reopened so a legitimate
//                          retry is possible.
//   anything else (PENDING, ONHOLD, unrecognized) -> transaction becomes
//                          'refund_pending' (never presented as refunded);
//                          the claim is completed (permanent) because
//                          Cashfree has already accepted this refund
//                          request and a second POST attempt must not be
//                          allowed to create a second, independent refund.
//
// Idempotent by construction: SUCCESS/FAILED/CANCELLED are terminal writes
// that simply overwrite the same fields with the same values on repeat; a
// repeat PENDING observation is a same-state refresh. Never touches
// customer.totalSpent or any accumulator, so repeated calls cannot
// double-count anything.
export async function applyRefundStatus(merchantId, orderId, { refundId, refundAmount, refundStatus }) {
  const tx = await getResource(merchantId, 'transaction', String(orderId));
  if (!tx) return null;
  const status = String(refundStatus || '').toUpperCase();
  const amount = Number(refundAmount ?? tx.refundedAmount ?? 0);

  if (status === 'SUCCESS') {
    const fullyRefunded = amount >= Number(tx.amount);
    const updated = {
      ...tx,
      status: fullyRefunded ? 'refunded' : 'partially_refunded',
      refundedAmount: amount,
      refundId: refundId || tx.refundId,
      refundStatus: 'SUCCESS',
      refundConfirmedAt: new Date().toISOString()
    };
    await saveResource(merchantId, 'transaction', updated);
    await completeRefundClaim(merchantId, orderId);
    return updated;
  }

  if (status === 'FAILED' || status === 'CANCELLED') {
    // Defensive guard: never downgrade a transaction that a separate,
    // later SUCCESS observation had already confirmed refunded.
    if (tx.status !== 'refunded' && tx.status !== 'partially_refunded') {
      const updated = { ...tx, status: 'succeeded', refundStatus: status, refundFailedAt: new Date().toISOString() };
      await saveResource(merchantId, 'transaction', updated);
    }
    await reopenRefundClaimAfterFailure(merchantId, orderId);
    return getResource(merchantId, 'transaction', String(orderId));
  }

  // PENDING / ONHOLD / unrecognized: accepted by Cashfree, not yet final.
  const updated = {
    ...tx,
    status: tx.status === 'succeeded' ? 'refund_pending' : tx.status,
    refundedAmount: amount || tx.refundedAmount,
    refundId: refundId || tx.refundId,
    refundStatus: status || 'PENDING',
    refundRequestedAt: tx.refundRequestedAt || new Date().toISOString()
  };
  await saveResource(merchantId, 'transaction', updated);
  await completeRefundClaim(merchantId, orderId);
  return updated;
}
