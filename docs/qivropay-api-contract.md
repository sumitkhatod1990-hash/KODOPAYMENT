# QivroPay API contract — V1

QivroPay is the merchant-facing checkout and payment-infrastructure layer. Cashfree remains the payment processor. Provider secrets stay server-side.

## Authentication

Merchant dashboard requests use the HttpOnly merchant session cookie. Server-to-server API requests use:

```http
Authorization: Bearer qivro_live_...
```

API keys are hashed at rest and the full secret is returned only once when the key is created.

## Create a checkout session

`POST /api/v1/payments/create-session`

Authenticated merchant request:

```json
{
  "productId": "prod_abc123"
}
```

A custom amount can be used for a one-off link:

```json
{
  "title": "Consulting session",
  "amount": 4999,
  "currency": "INR"
}
```

The server freezes the amount in the checkout session. The browser cannot change the amount later.

Response:

```json
{
  "success": true,
  "sessionId": "signed_checkout_token",
  "url": "https://pay.example.com/checkout/signed_checkout_token"
}
```

Checkout sessions expire after 30 minutes.

## Create the Cashfree order

`POST /api/v1/india/cashfree/create-order`

The hosted checkout sends the signed checkout session token plus customer contact information. The server resolves the session and uses its stored amount/currency.

```json
{
  "sessionToken": "signed_checkout_token",
  "customerEmail": "customer@example.com",
  "customerPhone": "9876543210"
}
```

The server creates the Cashfree order and returns the browser-safe payment session ID.

## Verify payment

`GET /api/v1/india/cashfree/orders/:orderId/status`

QivroPay queries Cashfree server-to-server. A browser redirect is never treated as proof of payment.

A `PAID` response creates/updates the merchant transaction and customer record idempotently.

## Cashfree webhook

`POST /api/v1/webhooks/cashfree`

The endpoint:

1. Receives the exact raw request body.
2. Validates `x-webhook-timestamp` and `x-webhook-signature`.
3. Deduplicates the provider event.
4. Stores the event durably in Neon when configured.
5. Updates the merchant transaction for successful payment events.
6. Returns `2xx` for already-recorded duplicate deliveries.

## Refunds

`POST /api/v1/payments/refund`

Authenticated merchant request:

```json
{
  "transactionId": "qv_cf_...",
  "amount": 4999,
  "note": "Customer requested refund"
}
```

The refund is sent to Cashfree. QivroPay changes the transaction state only after the provider accepts the refund request.

## Products

- `GET /api/v1/products`
- `POST /api/v1/products`
- `DELETE /api/v1/products/:id`

Products are merchant-scoped and persisted in Neon when `DATABASE_URL` is configured.

## Customers and transactions

- `GET /api/v1/customers`
- `GET /api/v1/transactions`
- `GET /api/v1/subscriptions`
- `GET /api/v1/analytics`

All core records are merchant-scoped.

## API keys

- `GET /api/v1/keys`
- `POST /api/v1/keys/generate`
- `DELETE /api/v1/keys/:id`

Never put a live key in frontend JavaScript, mobile client code, Git, or public documentation.

## Production requirements

- HTTPS only.
- Neon/Postgres configured through `DATABASE_URL`.
- Cashfree live credentials stored in hosting-provider secrets.
- `CASHFREE_WEBHOOK_SECRET` configured.
- `PUBLIC_URL` points to the production HTTPS origin.
- `CASHFREE_ENV=production` for live checkout. There is no separate frontend/`VITE_*` environment variable — the checkout page reads the active environment from the backend, so it can never disagree with the server making the actual Cashfree API calls.
- Test the complete flow in Cashfree sandbox before enabling production credentials.
- Never represent QivroPay as a regulated payment aggregator or Merchant of Record unless the client's legal/regulatory setup supports that role.
