// Cashfree PARTNER / EMBEDDED PAYMENTS API client — Phase 10.8A sandbox
// foundation.
//
// This is a completely separate product from the existing Cashfree Payment
// Gateway integration (cashfreeCredentials()/cashfreeBaseUrl() in
// server/index.js):
//
//                    PG (existing)                  Partner (this file)
//   Base URL         sandbox.cashfree.com/pg        api-sandbox.cashfree.com/partners
//   Auth headers      x-client-id + x-client-secret   x-partner-apikey
//   Credentials       CASHFREE_APP_ID/SECRET_KEY      CASHFREE_PARTNER_API_KEY
//   Purpose           create/refund orders for THIS   onboard/manage OTHER
//                     merchant's own account           merchants under a
//                                                       Partner account
//
// Source: https://www.cashfree.com/docs/api-reference/authentication and
// https://www.cashfree.com/docs/partners/embedded/integration/gateway-sandbox-environment
// ("x-partner-apikey" / "x-partner-merchantid" headers; sandbox/production
// server URLs confirmed against the OpenAPI `servers` block embedded in
// https://www.cashfree.com/docs/api-reference/platforms/latest/merchant-onboarding/create-merchant.md).
//
// x-partner-merchantid is NOT sent by this client — every operation
// currently wrapped here (create-merchant, get-merchant-status) authenticates
// with x-partner-apikey alone per that same reference; it is only relevant
// for calls made *on behalf of* an already-onboarded sub-merchant, which
// this phase does not implement.
//
// Never mix Partner credentials into cashfreeCredentials()/cashfreeBaseUrl()
// in server/index.js, and never let the Partner API key reach the browser —
// every export here is server-only.

function normalizePartnerEnv(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'sandbox') return 'sandbox';
  if (value === 'production' || value === 'prod') return 'production';
  return null;
}

// Deliberately independent of CASHFREE_ENV (the existing PG environment
// switch) — Partner KYC is still under review, so this defaults to
// "sandbox" unconditionally and only ever becomes "production" if someone
// explicitly sets CASHFREE_PARTNER_ENV=production later, once that is
// actually appropriate. There is no NODE_ENV-based auto-promotion here, on
// purpose: this phase is sandbox-only by design, not just by default.
export function resolvePartnerEnvironment() {
  const raw = process.env.CASHFREE_PARTNER_ENV;
  if (!raw) return 'sandbox';
  const normalized = normalizePartnerEnv(raw);
  if (normalized) return normalized;
  console.warn(`Invalid CASHFREE_PARTNER_ENV "${raw}" — defaulting to "sandbox".`);
  return 'sandbox';
}

const PARTNER_BASE_URLS = {
  sandbox: 'https://api-sandbox.cashfree.com/partners',
  production: 'https://api.cashfree.com/partners'
};

export function partnerBaseUrl(environment = resolvePartnerEnvironment()) {
  return PARTNER_BASE_URLS[environment] || PARTNER_BASE_URLS.sandbox;
}

// Exported (Phase 10.8F): the Partner settlement service needs the same raw
// credential this file already loads for the /partners onboarding surface —
// exporting the getter avoids a second module reading
// CASHFREE_PARTNER_API_KEY from process.env itself, which is exactly the
// "do not duplicate Partner authentication" this file's callers are asked to
// respect.
export function partnerApiKey() {
  return process.env.CASHFREE_PARTNER_API_KEY || '';
}

// Default per the OpenAPI reference for the merchant-onboarding endpoints
// ("x-api-version ... defaults to 2023-01-01"). Overridable in case a future
// endpoint documented under this same client needs a newer version.
const DEFAULT_PARTNER_API_VERSION = '2023-01-01';
function partnerApiVersion() {
  return process.env.CASHFREE_PARTNER_API_VERSION || DEFAULT_PARTNER_API_VERSION;
}

const DEFAULT_TIMEOUT_MS = 15000;

// Removes the raw API key from any string before it is logged or returned to
// a caller — belt-and-suspenders in addition to never interpolating the key
// into a message in the first place.
function sanitizeErrorMessage(message, secret) {
  let text = String(message || 'Cashfree Partner API request failed');
  if (secret) text = text.split(secret).join('[redacted]');
  return text;
}

export class CashfreePartnerError extends Error {
  constructor(message, { status = null, code = 'partner_request_failed', cause } = {}) {
    super(message);
    this.name = 'CashfreePartnerError';
    this.status = status;
    this.code = code;
    if (cause) this.cause = cause;
  }
}

// Shared low-level fetch/timeout/error-normalization core. Every request
// this module makes — the existing /partners onboarding surface
// (partnerRequest) and the Phase 10.8F /pg settlement surface
// (partnerPgRequest) below — goes through here, so credential loading,
// timeout handling, and error normalization only need to be correct once,
// regardless of which Cashfree product surface a given endpoint lives under.
// Never called directly outside this file; always throws
// CashfreePartnerError on any non-2xx response, network failure, or timeout.
// The partner API key is never present in a thrown message.
async function doPartnerFetch(url, apiKey, { method, body, timeoutMs, headers }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'x-partner-apikey': apiKey,
        ...headers,
        'Content-Type': 'application/json'
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    throw new CashfreePartnerError(
      sanitizeErrorMessage(
        timedOut ? 'Cashfree Partner API request timed out' : `Failed to reach Cashfree Partner API: ${err.message}`,
        apiKey
      ),
      { code: timedOut ? 'timeout' : 'network_error', cause: err }
    );
  } finally {
    clearTimeout(timeout);
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!response.ok) {
    const message = sanitizeErrorMessage(data?.message || `Cashfree Partner API returned HTTP ${response.status}`, apiKey);
    throw new CashfreePartnerError(message, { status: response.status, code: data?.code || 'partner_api_error' });
  }

  return { status: response.status, data };
}

// Request wrapper for the existing Cashfree Partner /partners surface
// (merchant onboarding — Phase 10.8A/C/D). Unchanged behavior from before
// the Phase 10.8F refactor above; only the internal fetch/timeout/error
// plumbing moved into doPartnerFetch().
export async function partnerRequest(pathname, { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS, environment } = {}) {
  const apiKey = partnerApiKey();
  if (!apiKey) {
    throw new CashfreePartnerError('CASHFREE_PARTNER_API_KEY is not configured', { code: 'missing_credential' });
  }
  const env = environment || resolvePartnerEnvironment();
  const url = `${partnerBaseUrl(env)}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  return doPartnerFetch(url, apiKey, { method, body, timeoutMs, headers: { 'x-api-version': partnerApiVersion() } });
}

// -------------------------------------------------------------
// Phase 10.8F: Partner calls into Cashfree's *PG* surface (settlement/
// reconciliation), authenticated as a Partner acting on behalf of a
// sub-merchant rather than as the sub-merchant itself.
//
// Confirmed against Cashfree's own API reference for both
// .../settlements/settlement-reconciliation.md and
// .../settlements/get-settlements-by-order-id.md: these endpoints live on
// the *PG* base URL (sandbox.cashfree.com/pg / api.cashfree.com/pg — the
// same host cashfreeBaseUrl() in server/index.js already uses for order
// creation), not the /partners base URL above, and both documented pages
// explicitly list `x-partner-merchantid` + `x-partner-apikey` as one of
// their supported authentication combinations for "a partner account making
// requests on behalf of a merchant."
//
// Deliberately governed by CASHFREE_PARTNER_ENV / resolvePartnerEnvironment()
// — the same independent Partner environment switch partnerBaseUrl() above
// uses — NOT by the platform's own CASHFREE_ENV/CASHFREE_ENVIRONMENT. This
// keeps every Partner-surface call (onboarding AND settlement) on one
// sandbox/production switch, independent of whatever environment the
// platform's own direct PG integration happens to be running in.
const PARTNER_PG_BASE_URLS = {
  sandbox: 'https://sandbox.cashfree.com/pg',
  production: 'https://api.cashfree.com/pg'
};

export function partnerPgBaseUrl(environment = resolvePartnerEnvironment()) {
  return PARTNER_PG_BASE_URLS[environment] || PARTNER_PG_BASE_URLS.sandbox;
}

// Both settlement endpoints' reference pages list `x-api-version` as
// required. This was originally written to reuse the same
// CASHFREE_API_VERSION env var server/index.js's own PG order/refund calls
// use (default '2025-01-01') — but manually querying a real, genuinely paid
// sandbox order's settlement (Phase 10.8F, order qv_cf_1788358052954_9530bdebe8,
// against the live account behind CASHFREE_APP_ID/SECRET_KEY) proved that
// assumption wrong: at x-api-version 2025-01-01 this endpoint returns a
// FLAT, differently-named response (`transfer_utr`, `cf_settlement_id` at
// the top level, no nested settlement_details/payment_details objects) —
// not the nested shape settlement-reconciliation.md /
// get-settlements-by-order-id.md document and normalizeOrderSettlement()
// below actually parses. That nested, documented shape was only observed at
// x-api-version 2026-01-01 (confirmed against the same real order). So this
// is deliberately its own, separate, hardcoded version — reusing
// CASHFREE_API_VERSION here would silently return a schema this file cannot
// read, not just an unrelated future version.
const SETTLEMENT_API_VERSION = '2026-01-01';
function partnerPgApiVersion() {
  return process.env.CASHFREE_SETTLEMENT_API_VERSION || SETTLEMENT_API_VERSION;
}

// cfMerchantId is always the Cashfree merchant_id this call is acting on
// behalf of (this project's qivropay_cashfree_partner_merchants.cf_merchant_id
// — see cashfreePartnerMerchantStatus.js) — required, and always sent as
// x-partner-merchantid, exactly like partnerRequest() above always sends
// the shared Partner API key.
export async function partnerPgRequest(cfMerchantId, pathname, { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS, environment } = {}) {
  const apiKey = partnerApiKey();
  if (!apiKey) {
    throw new CashfreePartnerError('CASHFREE_PARTNER_API_KEY is not configured', { code: 'missing_credential' });
  }
  if (!cfMerchantId) {
    throw new Error('partnerPgRequest requires cfMerchantId');
  }
  const env = environment || resolvePartnerEnvironment();
  const url = `${partnerPgBaseUrl(env)}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  return doPartnerFetch(url, apiKey, {
    method,
    body,
    timeoutMs,
    headers: { 'x-partner-merchantid': cfMerchantId, 'x-api-version': partnerPgApiVersion() }
  });
}
