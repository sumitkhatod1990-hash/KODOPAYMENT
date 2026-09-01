# QivroPay client integration (India)

This is the live integration contract for India-only payments. The client never receives Cashfree credentials and never handles card numbers or CVV.

## 1. Create a checkout session

Call QivroPay from the client's server, not from browser JavaScript:

```bash
curl -X POST https://qivropay.com/api/v1/payments/create-session \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <QIVROPAY_SECRET_KEY>' \
  -d '{
    "amount": 4999,
    "currency": "INR",
    "title": "Pro AI Credits",
    "credits": 5000000,
    "customerEmail": "buyer@example.com"
  }'
```

Response:

```json
{
  "success": true,
  "sessionId": "signed_qivropay_session_token",
  "url": "https://qivropay.com/checkout/<signed_qivropay_session_token>"
}
```

Redirect the customer to the returned `url`. Keep the `sessionId` with the client's order record.

## 2. Customer checkout

The hosted QivroPay page collects name, email, mobile number and billing address. It then offers:

- UPI QR (India)
- Credit / Debit / RuPay card (Cashfree secure PCI fields)

All amounts are INR. QivroPay creates the Cashfree order server-side; Cashfree identifiers and secrets are never exposed to the customer or client browser.

## 3. Confirm payment server-to-server

Do not mark an order paid from the browser redirect. Use the signed webhook as the source of truth, or poll the status endpoint from the client's server after the customer returns:

```bash
curl https://qivropay.com/api/v1/india/cashfree/orders/<qv_cf_order_id>/status \
  -H 'authorization: Bearer <QIVROPAY_SECRET_KEY>'
```

Only `PAID` or `SUCCESS` should deliver credits or digital goods. `PENDING`, `FAILED`, `CANCELLED` and `EXPIRED` must not deliver anything.

## 4. Webhook

Configure Cashfree production webhook URL:

```text
https://qivropay.com/api/v1/webhooks/cashfree
```

QivroPay verifies `x-webhook-timestamp` and `x-webhook-signature` against the raw request body before recording the event. The same event ID is idempotent, so Cashfree retries are safe. A webhook is acknowledged only after durable storage succeeds.

## 5. Delivery and reconciliation

After a verified `PAID` event, the client should:

1. Mark its own order paid using the stored session/order ID.
2. Deliver the purchased credits or product once (idempotently).
3. Show the QivroPay receipt/invoice link to the customer.
4. Reconcile Cashfree payment, refund and settlement records daily.

Never accept an amount, currency, payment status or credit quantity from the browser as authoritative.
