import crypto from 'crypto';
import { getResource, saveResource, listResources, claimOrderCredited } from './neonStore.js';

const newCustomerId = () => `cus_${crypto.randomBytes(10).toString('hex')}`;

// Records a Cashfree order's outcome exactly once per order. Both the
// customer-facing status-poll endpoint and the webhook observe the same
// order independently — in either order, any number of times, and
// (verified against a real Cashfree sandbox payment with overlapping
// webhook retries) not always serialized — so this is the single place
// that decides what to do with each observation.
//
// The transaction write is always an idempotent upsert keyed by orderId —
// safe to repeat from any number of callers. The customer.totalSpent
// aggregate must only be bumped the first time a given order is seen as
// succeeded. That decision is delegated entirely to claimOrderCredited(),
// a genuinely atomic claim (backed by a database unique constraint in
// production, an in-process mutex locally) — not a "read the transaction's
// prior status, then decide" check, which has a real TOCTOU race window
// under true concurrency: two callers can both read "not yet counted"
// before either has written back. See neonStore.js for why the claim is
// safe where that check was not.
export async function recordCashfreeOrderOutcome(merchantId, orderId, { amount, currency, customerEmail, customerName, productName, succeeded }) {
  const existing = await getResource(merchantId, 'transaction', String(orderId));
  const hasExistingRefund = existing && (
    existing.status === 'refunded' ||
    existing.status === 'partially_refunded' ||
    existing.refundStatus === 'SUCCESS' ||
    Number(existing.refundedAmount || existing.refundAmount || 0) > 0
  );

  const status = hasExistingRefund
    ? existing.status
    : (succeeded ? 'succeeded' : 'failed');

  const now = new Date().toISOString();
  const txAmount = (typeof amount === 'number' && !Number.isNaN(amount)) ? amount : (existing?.amount || 0);

  const transaction = {
    ...existing,
    id: String(orderId),
    provider: existing?.provider || 'cashfree',
    amount: txAmount,
    currency: currency || existing?.currency || 'INR',
    status,
    customerEmail: customerEmail || existing?.customerEmail || '',
    customerName: customerName || existing?.customerName || 'Customer',
    productName: productName || existing?.productName || 'QivroPay payment',
    paymentMethod: existing?.paymentMethod || 'cashfree',
    fee: existing?.fee ?? 0,
    net: succeeded ? txAmount : (existing?.net ?? 0),
    country: existing?.country || 'IN',
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  await saveResource(merchantId, 'transaction', transaction);

  if (!succeeded || !customerEmail) return;

  const won = await claimOrderCredited(merchantId, orderId);
  if (!won) return;

  const existingCustomer = (await listResources(merchantId, 'customer'))
    .find(c => String(c.email).toLowerCase() === String(customerEmail).toLowerCase());
  const customer = existingCustomer
    ? { ...existingCustomer, totalSpent: Number(existingCustomer.totalSpent || 0) + Number(amount), lastActive: new Date().toISOString() }
    : { id: newCustomerId(), name: 'Customer', email: customerEmail, country: 'IN', totalSpent: Number(amount), subscriptions: 0, lastActive: new Date().toISOString() };
  await saveResource(merchantId, 'customer', customer);
}
