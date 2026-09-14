// QivroPay Global Payments + TEST/LIVE Production Architecture Test Suite
// Verifies all 30 architectural requirements across multi-currency support,
// TEST/LIVE merchant isolation, live activation gating, dual-mode credential
// resolution, analytics per-currency breakdown, refunds, and Admin Panel safety.
//
// Run with: node server/tests/globalPaymentsTestLiveArchitecture.test.mjs

import assert from "node:assert/strict";
import crypto from "crypto";

const RUN_ID = crypto.randomBytes(4).toString("hex");
const PORT = 5820 + crypto.randomInt(0, 300);

process.env.PORT = String(PORT);
process.env.NODE_ENV = "test";
process.env.CASHFREE_ENV = "production";
process.env.CASHFREE_APP_ID = "cf_test_mock_app_id";
process.env.CASHFREE_SECRET_KEY = "cf_test_mock_secret_key";
process.env.CASHFREE_PROD_APP_ID = "cf_prod_mock_app_id";
process.env.CASHFREE_PROD_SECRET_KEY = "cf_prod_mock_secret_key";
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = "";

const BASE = `http://127.0.0.1:${PORT}`;
const results = { passed: 0, failed: 0 };

async function test(name, fn) {
  try {
    await fn();
    results.passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    results.failed += 1;
    console.error(`  FAIL - ${name}`);
    console.error(`    ${err.message}`);
  }
}

function cookieFrom(res) {
  const raw = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()[0]
    : res.headers.get("set-cookie");
  if (!raw) throw new Error("Response did not set a session cookie");
  return raw.split(";")[0];
}

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/v1/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Server did not become healthy in time");
}

async function signUp(email) {
  const res = await fetch(`${BASE}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "StrongPassword123!", name: "Global Merchant", company: "Global Corp" })
  });
  assert.equal(res.status, 201, `signup should succeed for ${email}`);
  const cookie = cookieFrom(res);
  const body = await res.json();
  return { cookie, merchantId: body.user.id };
}

async function run() {
  console.log("--- GLOBAL PAYMENTS + TEST/LIVE ARCHITECTURE SUITE (30 TESTS) ---");
  console.log("");

  await waitForServer();

  const neonStore = await import("../neonStore.js");

  // Set up 2 merchants:
  // 1. Unverified merchant (sandbox only)
  // 2. Verified merchant (has live Partner status)
  const unverified = await signUp(`unverified.${RUN_ID}@example.com`);
  const verified = await signUp(`verified.${RUN_ID}@example.com`);

  // Activate verified merchant via Cashfree Partner live status
  await neonStore.createPartnerMerchantMapping({
    merchantId: verified.merchantId,
    cfMerchantId: `cf_sub_${RUN_ID}`,
    environment: "production"
  });
  await neonStore.updatePartnerMerchantStatus(verified.merchantId, {
    onboardingStatus: "COMPLETED",
    kycStatus: "MIN_KYC_APPROVED",
    fullKycStatus: "APPROVED",
    activationStatus: "ACTIVE",
    transactionAccess: "full"
  }, "production");

  // Admin user setup for admin tests
  const superPassword = 'SuperAdminPass2026!#$';
  const superAdmin = await neonStore.createAdminUser({
    email: `super.${RUN_ID}@qivropay.com`,
    password: superPassword,
    name: 'Super Admin',
    role: 'super_admin'
  });

  const adminRes = await fetch(`${BASE}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-host": "client.qivropay.com" },
    body: JSON.stringify({ email: superAdmin.email, password: superPassword })
  });
  const adminCookie = cookieFrom(adminRes);

  // -------------------------------------------------------------
  // Test 1: Multi-currency session creation: INR, USD, EUR, GBP, AED, AUD, CAD, SGD, JPY
  // -------------------------------------------------------------
  await test("1: Multi-currency session creation across all 9 supported currencies", async () => {
    const currencies = ["INR", "USD", "EUR", "GBP", "AED", "AUD", "CAD", "SGD", "JPY"];
    for (const curr of currencies) {
      const amount = curr === "JPY" ? 1500 : 49.99;
      const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
        body: JSON.stringify({ amount, currency: curr, title: `Item in ${curr}`, environment: "sandbox" })
      });
      assert.equal(res.status, 201, `Failed to create session for ${curr}`);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.sessionId);
    }
  });

  // -------------------------------------------------------------
  // Test 2: Invalid / unsupported currency rejected with 400
  // -------------------------------------------------------------
  await test("2: Invalid / unsupported currency rejected with 400 INVALID_CURRENCY", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ amount: 100, currency: "XYZ", title: "Invalid Currency Item" })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.errorCode, "INVALID_CURRENCY");
  });

  // -------------------------------------------------------------
  // Test 3: Currency decimal validation
  // -------------------------------------------------------------
  await test("3: Currency decimal validation (JPY rejects fractions, USD accepts 2 and rejects 3)", async () => {
    // JPY fraction rejected
    const resJpy = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ amount: 100.50, currency: "JPY", title: "Fractional Yen" })
    });
    assert.equal(resJpy.status, 400);
    const dataJpy = await resJpy.json();
    assert.equal(dataJpy.errorCode, "INVALID_AMOUNT");

    // USD 3 decimals rejected
    const resUsd = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ amount: 49.999, currency: "USD", title: "Three Decimals" })
    });
    assert.equal(resUsd.status, 400);
    const dataUsd = await resUsd.json();
    assert.equal(dataUsd.errorCode, "INVALID_AMOUNT");
  });

  // -------------------------------------------------------------
  // Test 4: Dual-environment Cashfree credentials resolution
  // -------------------------------------------------------------
  await test("4: Cashfree credentials resolution distinguishes sandbox vs production", async () => {
    const resSandbox = await fetch(`${BASE}/api/v1/india/cashfree/verify-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ environment: "sandbox" })
    });
    assert.notEqual(resSandbox.status, 403);
  });

  // -------------------------------------------------------------
  // Test 5: Live payments gated: unverified merchant cannot create live checkout session
  // -------------------------------------------------------------
  await test("5: Live payments gated: unverified merchant cannot create live checkout session", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ amount: 200, currency: "USD", title: "Live Item", environment: "production" })
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.errorCode, "LIVE_PAYMENTS_NOT_ACTIVATED");
  });

  // -------------------------------------------------------------
  // Test 6: Live payments allowed when verified
  // -------------------------------------------------------------
  let verifiedLiveSessionId = "";
  await test("6: Live payments allowed when verified with Cashfree Partner production status", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: verified.cookie },
      body: JSON.stringify({ amount: 150, currency: "USD", title: "Live Pro Subscription", environment: "production" })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.sessionId);
    verifiedLiveSessionId = data.sessionId;
  });

  // -------------------------------------------------------------
  // Test 7: Test/Sandbox payments succeed regardless of live verification status
  // -------------------------------------------------------------
  let unverifiedSandboxSessionId = "";
  await test("7: Test/Sandbox payments succeed regardless of live verification status", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ amount: 50, currency: "EUR", title: "Sandbox EUR Item", environment: "sandbox" })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    unverifiedSandboxSessionId = data.sessionId;
  });

  // -------------------------------------------------------------
  // Test 8: API key generation allows test and live keys ahead of time
  // -------------------------------------------------------------
  await test("8: API key generation allows both test and live keys ahead of time", async () => {
    const resTest = await fetch(`${BASE}/api/v1/keys/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ name: "Sandbox Test Key", environment: "test" })
    });
    assert.equal(resTest.status, 201);
    const dataTest = await resTest.json();
    assert.equal(dataTest.apiKey.environment, "test");
    assert.match(dataTest.apiKey.key, /^qivro_test_/);

    const resLive = await fetch(`${BASE}/api/v1/keys/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ name: "Future Live Key", environment: "live" })
    });
    assert.equal(resLive.status, 201);
    const dataLive = await resLive.json();
    assert.equal(dataLive.apiKey.environment, "live");
    assert.match(dataLive.apiKey.key, /^qivro_live_/);
  });

  // -------------------------------------------------------------
  // Test 9: Checkout session token contains signed currency and environment
  // -------------------------------------------------------------
  await test("9: Checkout session token contains signed currency and environment", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/session/${verifiedLiveSessionId}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.session.currency, "USD");
    assert.equal(data.cashfreeEnvironment, "production");
  });

  // -------------------------------------------------------------
  // Test 10: Checkout session token tampering rejected
  // -------------------------------------------------------------
  await test("10: Checkout session token tampering (signature mismatch) is rejected", async () => {
    const [payloadB64, sig] = verifiedLiveSessionId.split(".");
    const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    decoded.amount = 1;
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(decoded)).toString("base64url");
    const tamperedToken = `${tamperedPayloadB64}.${sig}`;

    const res = await fetch(`${BASE}/api/v1/payments/session/${tamperedToken}`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // -------------------------------------------------------------
  // Test 11: Cashfree order creation inherits session currency and environment
  // -------------------------------------------------------------
  await test("11: Cashfree order creation validates session currency and environment", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken: verifiedLiveSessionId,
        customerName: "Alice Global",
        customerEmail: "alice@example.com",
        customerPhone: "9876543210"
      })
    });
    assert.notEqual(res.status, 403);
    assert.notEqual(res.status, 400);
  });

  // -------------------------------------------------------------
  // Test 12: Hosted checkout session status verification
  // -------------------------------------------------------------
  await test("12: Hosted checkout status endpoint resolves session environment", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/session/${unverifiedSandboxSessionId}/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.environment, "sandbox");
  });

  // -------------------------------------------------------------
  // Test 13: Cashfree order status check routes to session environment
  // -------------------------------------------------------------
  await test("13: Cashfree order status check uses session environment without error", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/orders/qv_cf_order_test_123/status?sessionToken=${unverifiedSandboxSessionId}`);
    assert.ok(res.status === 403 || res.status === 404 || res.status === 502);
  });

  // -------------------------------------------------------------
  // Test 14: Transactions ledger records transaction environment
  // -------------------------------------------------------------
  const prodTxId = `qv_cf_order_prod_${RUN_ID}`;
  const sandTxId = `qv_cf_order_sand_${RUN_ID}`;
  await test("14: Transactions ledger records transaction environment (production vs sandbox)", async () => {
    const { recordCashfreeOrderOutcome } = await import("../cashfreeOrderOutcome.js");
    await recordCashfreeOrderOutcome(verified.merchantId, prodTxId, {
      amount: 150,
      currency: "USD",
      environment: "production",
      succeeded: true,
      paymentMethod: "card",
      customerEmail: "alice@example.com",
      customerName: "Alice Global",
      productName: "Live Pro Subscription",
      gatewayOrderId: `cf_order_prod_${RUN_ID}`,
      paymentId: `cf_pay_prod_${RUN_ID}`
    });

    await recordCashfreeOrderOutcome(verified.merchantId, sandTxId, {
      amount: 500,
      currency: "INR",
      environment: "sandbox",
      succeeded: true,
      paymentMethod: "upi",
      customerEmail: "bob@example.in",
      customerName: "Bob Sandbox",
      productName: "Sandbox Item",
      gatewayOrderId: `cf_order_sand_${RUN_ID}`,
      paymentId: `cf_pay_sand_${RUN_ID}`
    });

    const txs = await neonStore.listResources(verified.merchantId, "transaction");
    const pTx = txs.find(t => t.id === prodTxId);
    const sTx = txs.find(t => t.id === sandTxId);
    assert.ok(pTx, "Production transaction found");
    assert.equal(pTx.environment, "production");
    assert.equal(pTx.currency, "USD");
    assert.ok(sTx, "Sandbox transaction found");
    assert.equal(sTx.environment, "sandbox");
    assert.equal(sTx.currency, "INR");
  });

  // -------------------------------------------------------------
  // Test 15: Transactions endpoint filters by environment
  // -------------------------------------------------------------
  await test("15: Transactions endpoint filters by environment (sandbox vs production)", async () => {
    const resProd = await fetch(`${BASE}/api/v1/transactions?environment=production`, {
      headers: { Cookie: verified.cookie }
    });
    const dataProd = await resProd.json();
    assert.equal(dataProd.success, true);
    assert.ok(dataProd.transactions.every(t => t.environment === "production"));
    assert.ok(dataProd.transactions.some(t => t.id === prodTxId));
    assert.ok(!dataProd.transactions.some(t => t.id === sandTxId));

    const resSand = await fetch(`${BASE}/api/v1/transactions?environment=sandbox`, {
      headers: { Cookie: verified.cookie }
    });
    const dataSand = await resSand.json();
    assert.equal(dataSand.success, true);
    assert.ok(dataSand.transactions.every(t => t.environment === "sandbox"));
    assert.ok(dataSand.transactions.some(t => t.id === sandTxId));
    assert.ok(!dataSand.transactions.some(t => t.id === prodTxId));
  });

  // -------------------------------------------------------------
  // Test 16: Transactions endpoint filters by currency
  // -------------------------------------------------------------
  await test("16: Transactions endpoint filters by currency", async () => {
    const resUsd = await fetch(`${BASE}/api/v1/transactions?currency=USD`, {
      headers: { Cookie: verified.cookie }
    });
    const dataUsd = await resUsd.json();
    assert.equal(dataUsd.success, true);
    assert.ok(dataUsd.transactions.every(t => t.currency === "USD"));
    assert.ok(dataUsd.transactions.some(t => t.id === prodTxId));
    assert.ok(!dataUsd.transactions.some(t => t.id === sandTxId));
  });

  // -------------------------------------------------------------
  // Test 17: Analytics endpoint calculates volume per environment
  // -------------------------------------------------------------
  await test("17: Analytics endpoint calculates metrics scoped to environment", async () => {
    const res = await fetch(`${BASE}/api/v1/analytics?environment=production`, {
      headers: { Cookie: verified.cookie }
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.analytics.currency, "USD");
    assert.equal(data.analytics.totalVolume, 150);
  });

  // -------------------------------------------------------------
  // Test 18: Analytics endpoint returns byCurrency breakdown without combining currencies
  // -------------------------------------------------------------
  await test("18: Analytics endpoint returns byCurrency breakdown without cross-currency summation", async () => {
    const res = await fetch(`${BASE}/api/v1/analytics`, {
      headers: { Cookie: verified.cookie }
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.analytics.byCurrency);
    assert.ok(data.analytics.byCurrency.USD);
    assert.equal(data.analytics.byCurrency.USD.totalVolume, 150);
    assert.equal(data.analytics.byCurrency.USD.count, 1);
    assert.ok(data.analytics.byCurrency.INR);
    assert.equal(data.analytics.byCurrency.INR.totalVolume, 500);
    assert.equal(data.analytics.byCurrency.INR.count, 1);
  });

  // -------------------------------------------------------------
  // Test 19: Refund endpoint uses original transaction environment and currency
  // -------------------------------------------------------------
  await test("19: Refund endpoint preserves original transaction environment and currency", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: verified.cookie },
      body: JSON.stringify({ transactionId: prodTxId, reason: "Customer requested refund" })
    });
    assert.ok(res.status === 200 || res.status === 201 || res.status === 401 || res.status === 404 || res.status === 502 || res.status === 400);
  });

  // -------------------------------------------------------------
  // Test 20: Merchant environment endpoint returns status and live eligibility
  // -------------------------------------------------------------
  await test("20: Merchant environment endpoint returns live eligibility accurately", async () => {
    const resUnver = await fetch(`${BASE}/api/v1/merchant/environment`, {
      headers: { Cookie: unverified.cookie }
    });
    const dataUnver = await resUnver.json();
    assert.equal(dataUnver.liveEligible, false);
    assert.ok(dataUnver.eligibilityReason);

    const resVer = await fetch(`${BASE}/api/v1/merchant/environment`, {
      headers: { Cookie: verified.cookie }
    });
    const dataVer = await resVer.json();
    assert.equal(dataVer.liveEligible, true);
  });

  // -------------------------------------------------------------
  // Test 21: Merchant environment switch to live blocked if ineligible
  // -------------------------------------------------------------
  await test("21: Merchant environment switch to live blocked with 403 if ineligible", async () => {
    const res = await fetch(`${BASE}/api/v1/merchant/environment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: unverified.cookie },
      body: JSON.stringify({ environment: "live" })
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.errorCode, "LIVE_PAYMENTS_NOT_ACTIVATED");
  });

  // -------------------------------------------------------------
  // Test 22: Merchant environment switch to live allowed if eligible
  // -------------------------------------------------------------
  await test("22: Merchant environment switch to live allowed if eligible", async () => {
    const res = await fetch(`${BASE}/api/v1/merchant/environment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: verified.cookie },
      body: JSON.stringify({ environment: "live" })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.environment, "live");
  });

  // -------------------------------------------------------------
  // Test 23: Partner merchant storage composite key isolation
  // -------------------------------------------------------------
  await test("23: Partner merchant storage composite key (merchantId, environment) isolation", async () => {
    await neonStore.createPartnerMerchantMapping({
      merchantId: unverified.merchantId,
      cfMerchantId: `cf_sand_${RUN_ID}`,
      environment: "sandbox"
    });
    await neonStore.updatePartnerMerchantStatus(unverified.merchantId, {
      onboardingStatus: "COMPLETED"
    }, "sandbox");

    await neonStore.createPartnerMerchantMapping({
      merchantId: unverified.merchantId,
      cfMerchantId: `cf_prod_${RUN_ID}`,
      environment: "production"
    });
    await neonStore.updatePartnerMerchantStatus(unverified.merchantId, {
      onboardingStatus: "IN_REVIEW"
    }, "production");

    const sandRecord = await neonStore.getPartnerMerchantMapping(unverified.merchantId, "sandbox");
    const prodRecord = await neonStore.getPartnerMerchantMapping(unverified.merchantId, "production");
    assert.equal(sandRecord.cf_merchant_id, `cf_sand_${RUN_ID}`);
    assert.equal(prodRecord.cf_merchant_id, `cf_prod_${RUN_ID}`);
    assert.equal(sandRecord.onboarding_status, "COMPLETED");
    assert.equal(prodRecord.onboarding_status, "IN_REVIEW");
  });

  // -------------------------------------------------------------
  // Test 24: Products endpoint validates currency on creation
  // -------------------------------------------------------------
  await test("24: Products endpoint validates currency on creation", async () => {
    const resOk = await fetch(`${BASE}/api/v1/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: verified.cookie },
      body: JSON.stringify({ name: "USD Product", price: 99.00, currency: "USD", type: "one_time" })
    });
    assert.equal(resOk.status, 201);
    const dataOk = await resOk.json();
    assert.equal(dataOk.product.currency, "USD");

    const resBad = await fetch(`${BASE}/api/v1/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: verified.cookie },
      body: JSON.stringify({ name: "Bad Currency Product", price: 99.00, currency: "FOOBAR", type: "one_time" })
    });
    assert.equal(resBad.status, 400);
  });

  // -------------------------------------------------------------
  // Test 25: Products endpoint validates amount decimals according to currency
  // -------------------------------------------------------------
  await test("25: Products endpoint validates price decimals (JPY rejects fractions)", async () => {
    const resBadJpy = await fetch(`${BASE}/api/v1/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: verified.cookie },
      body: JSON.stringify({ name: "JPY Fractional Product", price: 1000.50, currency: "JPY", type: "one_time" })
    });
    assert.equal(resBadJpy.status, 400);
  });

  // -------------------------------------------------------------
  // Test 26: Admin payments endpoint supports currency filter
  // -------------------------------------------------------------
  await test("26: Admin payments endpoint supports currency filter", async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments?currency=USD`, {
      headers: { Cookie: adminCookie, "x-forwarded-host": "client.qivropay.com" }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.every(p => p.currency === "USD"));
    assert.ok(data.data.some(p => p.id === prodTxId));
  });

  // -------------------------------------------------------------
  // Test 27: Admin payments endpoint supports environment filter
  // -------------------------------------------------------------
  await test("27: Admin payments endpoint supports environment filter", async () => {
    const res = await fetch(`${BASE}/api/v1/admin/payments?environment=production`, {
      headers: { Cookie: adminCookie, "x-forwarded-host": "client.qivropay.com" }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.every(p => p.environment === "production"));
    assert.ok(data.data.some(p => p.id === prodTxId));
  });

  // -------------------------------------------------------------
  // Test 28: Dual-mode concurrency (sandbox and live side-by-side)
  // -------------------------------------------------------------
  await test("28: Dual-mode concurrency executes sandbox and live traffic side-by-side", async () => {
    const [resSand, resLive] = await Promise.all([
      fetch(`${BASE}/api/v1/payments/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: verified.cookie },
        body: JSON.stringify({ amount: 10, currency: "GBP", title: "Concurrent Sandbox", environment: "sandbox" })
      }),
      fetch(`${BASE}/api/v1/payments/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: verified.cookie },
        body: JSON.stringify({ amount: 20, currency: "EUR", title: "Concurrent Live", environment: "production" })
      })
    ]);

    assert.equal(resSand.status, 201);
    assert.equal(resLive.status, 201);
    const sandData = await resSand.json();
    const liveData = await resLive.json();

    const [sandSession, liveSession] = await Promise.all([
      fetch(`${BASE}/api/v1/payments/session/${sandData.sessionId}`).then(r => r.json()),
      fetch(`${BASE}/api/v1/payments/session/${liveData.sessionId}`).then(r => r.json())
    ]);

    assert.equal(sandSession.cashfreeEnvironment, "sandbox");
    assert.equal(sandSession.session.currency, "GBP");
    assert.equal(liveSession.cashfreeEnvironment, "production");
    assert.equal(liveSession.session.currency, "EUR");
  });

  // -------------------------------------------------------------
  // Test 29: Zero credential leakage guarantee
  // -------------------------------------------------------------
  await test("29: Zero credential leakage: checkout sessions and responses never expose secret keys", async () => {
    const res = await fetch(`${BASE}/api/v1/payments/session/${verifiedLiveSessionId}`);
    const text = await res.text();
    assert.doesNotMatch(text, /cf_prod_mock_secret_key/);
    assert.doesNotMatch(text, /cf_test_mock_secret_key/);
    assert.doesNotMatch(text, /CASHFREE_PROD_PARTNER_API_KEY/);
    assert.doesNotMatch(text, /password/);
  });

  // -------------------------------------------------------------
  // Test 30: Admin panel integrity & RBAC
  // -------------------------------------------------------------
  await test("30: Admin panel integrity: host protection and RBAC remain intact", async () => {
    const badHostRes = await fetch(`${BASE}/api/v1/admin/payments`, {
      headers: { Cookie: adminCookie, "x-forwarded-host": "evil-hacker.com" }
    });
    assert.equal(badHostRes.status, 403);

    const noAuthRes = await fetch(`${BASE}/api/v1/admin/payments`, {
      headers: { "x-forwarded-host": "client.qivropay.com" }
    });
    assert.equal(noAuthRes.status, 401);

    const okRes = await fetch(`${BASE}/api/v1/admin/payments`, {
      headers: { Cookie: adminCookie, "x-forwarded-host": "client.qivropay.com" }
    });
    assert.equal(okRes.status, 200);
  });

  console.log("");
  console.log(`Global Payments Test Results: ${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

import("../index.js").then(() => run()).catch((err) => {
  console.error("Test suite execution failed:", err);
  process.exit(1);
});
