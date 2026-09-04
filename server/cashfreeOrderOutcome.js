import crypto from 'crypto';
import { saveResource, listResources, claimOrderCredited } from './neonStore.js';

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
  const transaction = {
    id: String(orderId),
    provider: 'cashfree',
    amount,
    currency: currency || 'INR',
    status: succeeded ? 'succeeded' : 'failed',
    customerEmail: customerEmail || '',
    customerName: customerName || 'Customer',
    productName: productName || 'QivroPay payment',
    paymentMethod: 'cashfree',
    fee: 0,
    net: succeeded ? amount : 0,
    country: 'IN',
    createdAt: new Date().toISOString()
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
