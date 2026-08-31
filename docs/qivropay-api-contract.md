# QivroPay API contract

This contract describes the server-to-server boundary between the QivroPay checkout and the QivroPay payment engine. It is intentionally provider-neutral at the public boundary; Cashfree credentials and provider payloads stay on the backend.

## Rules

- The server calculates the final amount and currency. Never trust an amount sent by the browser.
- `orderId` and provider event IDs are idempotency keys. Replays must not create a second charge, split, invoice, or entitlement.
- A payment becomes `PAID` only after a verified provider webhook or a server-side provider status lookup.
- Store only provider tokens/IDs and masked payment details. Never store PAN, CVV, or full bank credentials.
- All production endpoints require HTTPS and authenticated merchant access.

## Endpoints

### `POST /api/v1/orders`

Creates a pending order and freezes its amount on the server.

Request:

```json
{
  "merchantId": "mrc_123",
  "productId": "prod_123",
  "customer": { "name": "Asha Singh", "email": "asha@example.com", "phone": "9999999999" },
  "currency": "INR",
  "amount": 4999.00,
  "returnUrl": "https://pay.example.com/result"
}
```

Response (`201`):

```json
{
  "orderId": "ord_qv_01J...",
  "status": "PENDING",
  "amount": 4999.00,
  "currency": "INR",
  "expiresAt": "2026-09-01T12:00:00.000Z"
}
```

### `POST /api/v1/orders/:orderId/payment-session`

Creates the provider order/session from the server. Returns only the browser-safe session token.

Response (`201`):

```json
{
  "orderId": "ord_qv_01J...",
  "provider": "cashfree",
  "paymentSessionId": "provider_session_token",
  "status": "PENDING"
}
```

### `GET /api/v1/orders/:orderId`

Returns the server-side order, payment and settlement state. The browser must poll this endpoint after checkout return.

### `POST /api/v1/webhooks/cashfree`

Receives the raw provider body. Verify the provider signature before parsing or changing state. Return `200` only after the event is durably recorded; return `2xx` for an already-recorded event so provider retries stop.

Supported internal transitions:

```text
PENDING → PROCESSING → PAID
PENDING → FAILED
PROCESSING → FAILED
PAID → REFUNDED | PARTIALLY_REFUNDED | DISPUTED
```

### `POST /api/v1/orders/:orderId/refunds`

Creates a refund request only for a `PAID` order. Refund state is completed only after the provider confirms it by webhook/status lookup.

### `GET /api/v1/orders/:orderId/settlement`

Returns the EasySplit allocation and provider settlement status. Settlement is asynchronous; never assume that a successful payment means the merchant has received funds.

## Error format

```json
{
  "error": { "code": "ORDER_NOT_FOUND", "message": "Order was not found", "requestId": "req_01J..." }
}
```

## Required production controls

- Cashfree live credentials only in hosting-provider secrets.
- Webhook signature verification with the raw request body.
- Database-backed order/payment/event/ledger records; `server/db.json` is not a production database.
- Merchant KYC and EasySplit vendor mapping before accepting live payments.
- Reconciliation job comparing provider payments, splits, refunds and settlements.
- Audit logs for amount changes, status changes, refunds and manual actions.
