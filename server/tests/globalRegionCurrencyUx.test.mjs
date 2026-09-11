// QivroPay Global Region + Currency UX Acceptance Test Suite
// Verifies:
// 1. Default display currency is USD ($) and default region is US (🌎).
// 2. Region-to-currency mappings for all 9 supported regions:
//    US -> USD, IN -> INR, GB -> GBP, EU -> EUR, AE -> AED,
//    AU -> AUD, CA -> CAD, SG -> SGD, JP -> JPY.
// 3. Fallback safety on unrecognized region/currency codes.
// 4. Currency decimals: JPY has 0 decimals; all other 8 currencies have 2 decimals.
// 5. Currency formatting and symbol resolution for all 9 currencies.
// 6. Validation of amounts across currencies (rejects fractional JPY, accepts whole JPY; accepts 2 decimals for fiat).
// 7. Unsupported currency rejection (rejects DOGE, BTC, XYZ).
// 8. Server-side session creation with USD and INR; invariant intrinsic currency.
// 9. Analytics fallback primary currency is USD.
// 10. Copy invariants: "Indian Payments" banner eliminated, global positioning preserved.

import assert from 'node:assert/strict';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  SUPPORTED_CURRENCIES,
  CURRENCY_METADATA,
  SUPPORTED_REGIONS,
  DEFAULT_REGION_CODE,
  DEFAULT_CURRENCY,
  isSupportedCurrency,
  getRegionByCode,
  getDefaultCurrencyForRegion,
  getCurrencySymbol,
  getCurrencyDecimals,
  formatCurrency,
  formatCurrencyWithCode,
  validateAmount
} from '../../src/lib/currency.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const PORT = 5930 + crypto.randomInt(0, 300);
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'test';
process.env.CASHFREE_ENV = 'production';
process.env.CASHFREE_APP_ID = 'cf_test_mock_app_id';
process.env.CASHFREE_SECRET_KEY = 'cf_test_mock_secret_key';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
process.env.VERCEL = '';

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

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/v1/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Server did not become healthy in time');
}

console.log('=== QivroPay Global Region & Currency UX Test Suite ===\n');

// -------------------------------------------------------------
// SECTION 1: Defaults & Region Mappings
// -------------------------------------------------------------
await test('1. Default display currency is USD and default region is US', () => {
  assert.equal(DEFAULT_CURRENCY, 'USD');
  assert.equal(DEFAULT_REGION_CODE, 'US');
  assert.equal(getCurrencySymbol(), '$');
  assert.equal(getCurrencyDecimals(), 2);
  assert.equal(formatCurrency(149), '$149.00');
  assert.equal(formatCurrencyWithCode(149), '$149.00 USD');
});

await test('2. All 9 supported regions exist with correct country-to-currency mappings', () => {
  const expectedMappings = [
    { code: 'US', defaultCurrency: 'USD', flag: '🌎', symbol: '$' },
    { code: 'IN', defaultCurrency: 'INR', flag: '🇮🇳', symbol: '₹' },
    { code: 'GB', defaultCurrency: 'GBP', flag: '🇬🇧', symbol: '£' },
    { code: 'EU', defaultCurrency: 'EUR', flag: '🇪🇺', symbol: '€' },
    { code: 'AE', defaultCurrency: 'AED', flag: '🇦🇪', symbol: 'AED ' },
    { code: 'AU', defaultCurrency: 'AUD', flag: '🇦🇺', symbol: 'A$' },
    { code: 'CA', defaultCurrency: 'CAD', flag: '🇨🇦', symbol: 'C$' },
    { code: 'SG', defaultCurrency: 'SGD', flag: '🇸🇬', symbol: 'S$' },
    { code: 'JP', defaultCurrency: 'JPY', flag: '🇯🇵', symbol: '¥' },
  ];

  assert.equal(SUPPORTED_REGIONS.length, 9);

  for (const exp of expectedMappings) {
    const region = getRegionByCode(exp.code);
    assert.ok(region, `Region ${exp.code} must exist`);
    assert.equal(region.defaultCurrency, exp.defaultCurrency);
    assert.equal(region.flag, exp.flag);
    assert.equal(getDefaultCurrencyForRegion(exp.code), exp.defaultCurrency);
    assert.equal(getCurrencySymbol(exp.defaultCurrency), exp.symbol);
  }
});

await test('3. Fallback to US / USD on unknown region code', () => {
  const fallbackRegion = getRegionByCode('ZZ');
  assert.equal(fallbackRegion.code, 'US');
  assert.equal(fallbackRegion.defaultCurrency, 'USD');
  assert.equal(getDefaultCurrencyForRegion('ZZ'), 'USD');
});

// -------------------------------------------------------------
// SECTION 2: Currency Whitelist & Unsupported Rejection
// -------------------------------------------------------------
await test('4. Currency whitelist accepts all 9 currencies and rejects unsupported ones', () => {
  const supported = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD', 'JPY'];
  for (const cur of supported) {
    assert.ok(isSupportedCurrency(cur), `Currency ${cur} should be supported`);
    assert.ok(isSupportedCurrency(cur.toLowerCase()), `Lowercase ${cur} should be supported`);
  }

  const unsupported = ['BTC', 'ETH', 'DOGE', 'XYZ', 'USDT', '', null, undefined, 123];
  for (const cur of unsupported) {
    assert.equal(isSupportedCurrency(cur), false, `Currency ${cur} should NOT be supported`);
  }
});

// -------------------------------------------------------------
// SECTION 3: Decimal Precision & Currency Formatting
// -------------------------------------------------------------
await test('5. JPY has 0 decimal places; all other 8 currencies have 2 decimal places', () => {
  assert.equal(getCurrencyDecimals('JPY'), 0);

  const twoDecimalCurrencies = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD'];
  for (const cur of twoDecimalCurrencies) {
    assert.equal(getCurrencyDecimals(cur), 2, `${cur} must have 2 decimal places`);
  }
});

await test('6. Deterministic formatting across currencies without fake FX', () => {
  assert.equal(formatCurrency(149, 'USD'), '$149.00');
  assert.equal(formatCurrency(149, 'INR'), '₹149.00');
  assert.equal(formatCurrency(149, 'GBP'), '£149.00');
  assert.equal(formatCurrency(149, 'EUR'), '€149.00');
  assert.equal(formatCurrency(149, 'JPY'), '¥149');
  assert.equal(formatCurrency(149.8, 'JPY'), '¥150');
  assert.equal(formatCurrency(149, 'AED').replace(/\u00a0/g, ' '), 'AED 149.00');
  assert.equal(formatCurrency(149, 'AUD'), 'A$149.00');
  assert.equal(formatCurrency(149, 'CAD'), 'CA$149.00');
  assert.equal(formatCurrency(149, 'SGD').replace(/\u00a0/g, ' '), 'SGD 149.00');

  assert.equal(formatCurrencyWithCode(149, 'USD'), '$149.00 USD');
  assert.equal(formatCurrencyWithCode(149, 'JPY'), '¥149 JPY');
  assert.equal(formatCurrencyWithCode(149, 'INR'), '₹149.00 INR');
});

await test('7. Amount validation respects decimal rules and minimum bounds', () => {
  // USD (2 decimals)
  assert.equal(validateAmount(49.99, 'USD').valid, true);
  assert.equal(validateAmount(49, 'USD').valid, true);
  assert.equal(validateAmount(49.999, 'USD').valid, false); // too many decimals

  // JPY (0 decimals)
  assert.equal(validateAmount(100, 'JPY').valid, true);
  assert.equal(validateAmount(100.5, 'JPY').valid, false); // JPY cannot have fraction

  // Edge cases
  assert.equal(validateAmount(0, 'USD').valid, false);
  assert.equal(validateAmount(-15, 'USD').valid, false);
  assert.equal(validateAmount(50, 'FAKE').valid, false);
});

// -------------------------------------------------------------
// SECTION 4: Copy & Positioning Invariants in Source Files
// -------------------------------------------------------------
await test('8. Landing page hero & logo do not position as "Indian Payments" or "India-first"', () => {
  const heroPath = path.join(rootDir, 'src/components/landing/Hero.tsx');
  const heroContent = fs.readFileSync(heroPath, 'utf8');
  assert.ok(
    heroContent.includes('GLOBAL PAYMENT INFRASTRUCTURE'),
    'Hero pill must contain GLOBAL PAYMENT INFRASTRUCTURE'
  );
  assert.ok(
    !heroContent.includes('INDIAN PAYMENTS'),
    'Hero pill must NOT contain INDIAN PAYMENTS'
  );

  const logoPath = path.join(rootDir, 'src/components/common/Logo.tsx');
  const logoContent = fs.readFileSync(logoPath, 'utf8');
  assert.ok(
    !logoContent.includes('India-first payment infrastructure'),
    'Logo must not say India-first payment infrastructure'
  );
  assert.ok(
    logoContent.includes('Global payment infrastructure'),
    'Logo should say Global payment infrastructure'
  );

  const indexHtmlPath = path.join(rootDir, 'index.html');
  const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
  assert.ok(
    !indexContent.includes('India-first'),
    'index.html should not contain India-first'
  );
});

// -------------------------------------------------------------
// SECTION 5: Server-side Invariants & Session Authoritativeness
// -------------------------------------------------------------
function cookieFrom(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()[0]
    : res.headers.get('set-cookie');
  if (!raw) throw new Error('Response did not set a session cookie');
  return raw.split(';')[0];
}

let serverProcess;
try {
  const serverModule = await import('../index.js');
  await waitForServer();

  await test('9. Create payment session defaults and accepts USD, preserves currency strictly', async () => {
    // 1. Sign up a test merchant
    const email = `global_test_${Date.now()}_${crypto.randomBytes(3).toString('hex')}@example.com`;
    const signupRes = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!', name: 'Global Merchant', company: 'Global Corp' })
    });
    assert.equal(signupRes.status, 201, 'Signup status should be 201');
    const cookie = cookieFrom(signupRes);

    // 2. Create USD session
    const sessionRes = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie
      },
      body: JSON.stringify({
        title: 'Global Plan',
        amount: 49.00,
        currency: 'USD',
        customerEmail: 'buyer@global.com',
        environment: 'sandbox'
      })
    });
    const sessionData = await sessionRes.json();
    assert.equal(sessionRes.status, 201, `USD session creation failed: ${JSON.stringify(sessionData)}`);
    assert.ok(sessionData.success, 'USD session should be created');
    assert.ok(sessionData.sessionId, 'Session ID must be returned');

    // 3. Inspect public session endpoint
    const inspectRes = await fetch(`${BASE}/api/v1/payments/session/${sessionData.sessionId}`);
    const inspectData = await inspectRes.json();
    assert.ok(inspectData.success);
    assert.equal(inspectData.session.currency, 'USD', 'Session currency must be strictly USD');
    assert.equal(inspectData.session.amount, 49.00, 'Session amount must be 49.00');

    // 4. Create INR session to verify domestic flows still work
    const inrRes = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie
      },
      body: JSON.stringify({
        title: 'India Domestic Plan',
        amount: 1499.00,
        currency: 'INR',
        customerEmail: 'domestic@example.in',
        environment: 'sandbox'
      })
    });
    const inrData = await inrRes.json();
    assert.equal(inrRes.status, 201);
    assert.ok(inrData.success);
    const inrInspect = await fetch(`${BASE}/api/v1/payments/session/${inrData.sessionId}`);
    const inrInspectData = await inrInspect.json();
    assert.equal(inrInspectData.session.currency, 'INR');

    // 5. Verify unsupported currency is rejected with 400
    const badRes = await fetch(`${BASE}/api/v1/payments/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie
      },
      body: JSON.stringify({
        title: 'Invalid Plan',
        amount: 100.00,
        currency: 'DOGE',
        environment: 'sandbox'
      })
    });
    assert.equal(badRes.status, 400, 'Unsupported currency must return 400 Bad Request');
  });

  await test('10. Analytics endpoint falls back to USD when no prior transactions exist', async () => {
    const email = `analytics_fresh_${Date.now()}_${crypto.randomBytes(3).toString('hex')}@example.com`;
    const signupRes = await fetch(`${BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!', name: 'Fresh Merchant', company: 'Fresh Corp' })
    });
    assert.equal(signupRes.status, 201);
    const cookie = cookieFrom(signupRes);

    const analyticsRes = await fetch(`${BASE}/api/v1/analytics`, {
      headers: { Cookie: cookie }
    });
    const data = await analyticsRes.json();
    assert.ok(data.success);
    assert.equal(data.analytics.currency, 'USD', 'Empty analytics must default to USD');
  });

} catch (err) {
  console.error('Server startup or testing failed:', err);
  results.failed += 1;
}

console.log('\n======================================================');
console.log(`Results: ${results.passed} passed, ${results.failed} failed`);
console.log('======================================================\n');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
