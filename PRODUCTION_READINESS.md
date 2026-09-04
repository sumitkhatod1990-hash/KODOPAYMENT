# QivroPay V1 production-readiness notes

## What was fixed in this pass

- Removed the demo login shortcut and demo-dashboard bypass.
- Replaced production dashboard data paths for products, customers, transactions, subscriptions and API keys with merchant-scoped persistent resources.
- Added Neon-backed checkout sessions and merchant resources.
- Added server-side API-key authentication with SHA-256 hashed secrets.
- The full API key is returned once at creation; subsequent reads return only a prefix.
- Checkout sessions are signed and expire after 30 minutes.
- The checkout server freezes product amount/currency; browser-supplied amounts are not trusted after session creation.
- V1 checkout is explicitly INR-only.
- Cashfree order creation uses the stored checkout session amount instead of trusting the browser.
- Cashfree order status is verified server-to-server.
- Cashfree webhook signatures are verified against the raw request body and events are idempotent.
- Successful/failed Cashfree payments are persisted into merchant-scoped transactions.
- Refunds now call Cashfree instead of changing a local transaction to `refunded`.
- Removed the fake legacy payment processor; the old endpoint returns `410 Gone`.
- Removed fake post-purchase upsell, launch coupon and other checkout price manipulation from the live checkout flow.
- Reworked the dashboard into a smaller V1 surface: Overview, Payments, Products, Payment Links, Customers, Developers and Settings.
- Removed unsupported recurring/subscription creation from the V1 product flow.
- Removed the fake SDK playground behavior from the public integration section; examples now show the actual server API contract.
- Updated deployment guidance to require Neon/Postgres for production payment state.
- Updated Docker health checks and removed the assumption that `db.json` is persistent production storage.
- Removed active-facing Merchant-of-Record claims from the main V1 customer experience. QivroPay should only use regulated MoR/PA language if the client's legal structure supports it.

## Phase 10.7A — safety/compliance cleanup

- Removed the fake KYC flow: `POST /api/v1/verification/submit` and `POST
  /api/v1/verification/penny-drop` used to accept PAN/GSTIN/bank details and
  unconditionally return a fabricated "approved" verification (including a
  fake NPCI UTR). They now return `410 Gone` and collect nothing. Deleted the
  orphaned frontend components that built toward this
  (`VerificationTab.tsx`, `PennyDropKYCTab.tsx`, `AccountVerificationModal.tsx`,
  `SetupGuideWidget.tsx`) — none were reachable from the mounted V1 dashboard.
- Removed the fake settlement/Easy Split surface: `CashfreeEasySplitTab.tsx`
  was an orphaned component (not reachable from the dashboard) rendering
  fabricated settlement/payout data; deleted rather than left as dead weight.
- Disabled `POST /api/v1/support/chat` (`410 Gone`). It was not reachable from
  any mounted UI, accepted a client-supplied `customApiKey` and used it
  unvalidated to call Google's Gemini API on the server's behalf (a generic
  outbound LLM proxy funded by whatever key a caller supplied), and both its
  system prompt and canned fallback replies asserted QivroPay is a Merchant of
  Record that automatically handles GST, Section 194-O TDS, and T+0 instant
  payouts — none of which this product implements. Deleted the orphaned
  `MerchantSupportModal.tsx` that called it. Fixed the (still-active)
  `POST /api/v1/support/tickets` auto-reply, which claimed "an India-based MoR
  specialist has been assigned."
- **API key test/live enforcement**: Cashfree connectivity
  (`CASHFREE_ENVIRONMENT`) is a single global setting for the whole server
  process — it cannot talk to sandbox and production Cashfree at the same
  time. A `test` API key now only authenticates while the server is running
  with `CASHFREE_ENV=sandbox`; a `live` key only while running with
  `CASHFREE_ENV=production`. A mismatched key gets `403` from the central
  auth middleware (`apiKeyEnvironmentMatchesServer()` in `server/index.js`),
  derived only from the hashed key record looked up server-side — never from
  anything in the request body/header/query. If you need true simultaneous
  sandbox and live traffic, that requires running two separate server
  processes/deployments (one per `CASHFREE_ENV`), which this codebase does not
  attempt to fake.
- **Live payment approval gate**: a newly-registered merchant could
  previously create a real checkout session (and therefore a real Cashfree
  order) immediately after the two-step onboarding wizard, with zero review,
  any time this server is configured with `CASHFREE_ENV=production`. There is
  no real KYC/Cashfree-onboarding review yet, so rather than pretend one
  exists, every merchant is now blocked from live checkout-session/order
  creation (`POST /api/v1/payments/create-session`,
  `POST /api/v1/india/cashfree/verify-credentials`) by default —
  `requireLiveActivationIfProduction()` in `server/index.js` requires
  `merchant_profile.liveActivatedAt` to be set. **Sandbox is never
  restricted** — local development and pre-launch testing are unaffected.
  There is deliberately no API route that lets a merchant set this flag
  themselves. Activate a reviewed merchant with:
  `DATABASE_URL=... node server/scripts/activate-merchant-live.js merchant@example.com`

## Required before live launch

1. Configure `DATABASE_URL` with Neon/Postgres.
2. Configure Cashfree sandbox credentials and run the complete payment flow.
3. Configure `CASHFREE_WEBHOOK_SECRET` and verify webhook delivery.
4. Set `PUBLIC_URL` to the HTTPS production origin.
5. Set `QIVROPAY_SESSION_SECRET` to a strong random secret. The Cashfree secret can be used as a fallback, but a dedicated session secret is preferred.
6. There is no `VITE_CASHFREE_ENV` or other frontend-side environment variable — the checkout page always reads the active Cashfree environment from the backend (`GET /api/v1/payments/session/:id`), which is driven entirely by the backend's own `CASHFREE_ENV`.
7. Run the sandbox flow end-to-end before switching `CASHFREE_ENV=production`.
8. Test refunds against the Cashfree sandbox.
9. Configure domain, HTTPS, rate limiting and monitoring at the hosting layer.
10. Confirm the client's legal/regulatory position before using payment-aggregator, Merchant-of-Record, tax-remittance or settlement-liability claims.
11. Before switching `CASHFREE_ENV=production`, generate `live` API keys only for merchants you intend to actually activate — `test` keys stop authenticating once the server is running in production (see "API key test/live enforcement" above).
12. After manually reviewing a merchant (outside this codebase — there is no automated KYC yet), activate them for live payments with `node server/scripts/activate-merchant-live.js merchant@example.com`. Without this, every merchant is blocked from creating a live checkout session or Cashfree order once `CASHFREE_ENV=production` (see "Live payment approval gate" above).

## Validation performed here

- `node --check` passes for all server/API JavaScript files.
- A TypeScript compiler was available, but the repository dependencies were not installable in this environment because the package cache was incomplete. Therefore a full `vite build` could not be completed here. The source should be installed with `npm ci` in a normal networked build environment and then validated with `npm run build` before deployment.
