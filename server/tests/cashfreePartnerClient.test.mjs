// Deterministic tests for server/cashfreePartner.js — Phase 10.8A.
//
// Entirely offline: global.fetch is replaced with an in-process fake for
// every test, so this suite never makes a real network call and never
// depends on a live Cashfree sandbox being reachable. A separate, manual
// sandbox verification (documented in the Phase 10.8A report) is how actual
// Cashfree connectivity gets checked — deliberately kept out of `npm test`.
//
// Run with: node server/tests/cashfreePartnerClient.test.mjs
// (Also wired into `npm test`.)

import assert from 'node:assert/strict';

const results = { passed: 0, failed: 0 };

async function test(name, fn) {
  try {
    await fn();
    results.passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    results.failed += 1;
    console.error(`  FAIL - ${name}`);
    console.error(`    ${err.stack || err.message}`);
  }
}

const REAL_FETCH = globalThis.fetch;
function stubFetch(handler) {
  globalThis.fetch = handler;
}
function restoreFetch() {
  globalThis.fetch = REAL_FETCH;
}

async function run() {
  console.log('Cashfree Partner client — deterministic tests');
  console.log('');

  // Imported after env vars are set per-test via delete/assign, but the
  // module itself reads process.env lazily on every call (not at import
  // time), so a single top-level import is fine here.
  const { partnerRequest, resolvePartnerEnvironment, partnerBaseUrl, CashfreePartnerError } =
    await import('../cashfreePartner.js');

  const ORIGINAL_KEY = process.env.CASHFREE_PARTNER_API_KEY;
  const ORIGINAL_ENV = process.env.CASHFREE_PARTNER_ENV;

  await test('resolvePartnerEnvironment defaults to sandbox when unset', async () => {
    delete process.env.CASHFREE_PARTNER_ENV;
    assert.equal(resolvePartnerEnvironment(), 'sandbox');
  });

  await test('resolvePartnerEnvironment never silently promotes to production', async () => {
    process.env.CASHFREE_PARTNER_ENV = 'not-a-real-value';
    assert.equal(resolvePartnerEnvironment(), 'sandbox');
    delete process.env.CASHFREE_PARTNER_ENV;
  });

  await test('partnerBaseUrl points at the documented sandbox host, distinct from the PG host', async () => {
    const url = partnerBaseUrl('sandbox');
    assert.equal(url, 'https://api-sandbox.cashfree.com/partners');
    assert.ok(!url.includes('/pg'), 'must not reuse the Payment Gateway base URL');
  });

  await test('missing CASHFREE_PARTNER_API_KEY throws without ever calling fetch', async () => {
    delete process.env.CASHFREE_PARTNER_API_KEY;
    let fetchCalled = false;
    stubFetch(async () => { fetchCalled = true; throw new Error('fetch must not be called'); });
    try {
      await assert.rejects(
        () => partnerRequest('/merchants/does-not-matter'),
        (err) => err instanceof CashfreePartnerError && err.code === 'missing_credential'
      );
      assert.equal(fetchCalled, false, 'partnerRequest must fail fast before touching the network');
    } finally {
      restoreFetch();
    }
  });

  await test('successful authenticated request returns normalized {status, data} using mocked response', async () => {
    process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_abc123';
    let seenUrl, seenHeaders;
    stubFetch(async (url, opts) => {
      seenUrl = url;
      seenHeaders = opts.headers;
      return new Response(JSON.stringify({ merchant_id: 'merchant_1', onboarding_status: 'Created' }), { status: 200 });
    });
    try {
      const result = await partnerRequest('/merchants/merchant_1');
      assert.equal(result.status, 200);
      assert.deepEqual(result.data, { merchant_id: 'merchant_1', onboarding_status: 'Created' });
      assert.equal(seenUrl, 'https://api-sandbox.cashfree.com/partners/merchants/merchant_1');
      assert.equal(seenHeaders['x-partner-apikey'], 'test_partner_key_abc123');
      assert.ok(seenHeaders['x-api-version'], 'x-api-version header must be sent');
    } finally {
      restoreFetch();
    }
  });

  await test('Cashfree authentication failure (401) is normalized, not swallowed as success', async () => {
    process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_abc123';
    stubFetch(async () => new Response(JSON.stringify({ message: 'Invalid partner api key' }), { status: 401 }));
    try {
      await assert.rejects(
        () => partnerRequest('/merchants/merchant_1'),
        (err) => err instanceof CashfreePartnerError && err.status === 401 && /Invalid partner api key/.test(err.message)
      );
    } finally {
      restoreFetch();
    }
  });

  await test('network failure is normalized to a CashfreePartnerError, never thrown raw', async () => {
    process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_abc123';
    stubFetch(async () => { throw new TypeError('fetch failed: getaddrinfo ENOTFOUND'); });
    try {
      await assert.rejects(
        () => partnerRequest('/merchants/merchant_1'),
        (err) => err instanceof CashfreePartnerError && err.code === 'network_error'
      );
    } finally {
      restoreFetch();
    }
  });

  await test('timeout is normalized to a CashfreePartnerError with code "timeout"', async () => {
    process.env.CASHFREE_PARTNER_API_KEY = 'test_partner_key_abc123';
    stubFetch(async (url, opts) => new Promise((resolve, reject) => {
      opts.signal.addEventListener('abort', () => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        reject(err);
      });
    }));
    try {
      await assert.rejects(
        () => partnerRequest('/merchants/merchant_1', { timeoutMs: 20 }),
        (err) => err instanceof CashfreePartnerError && err.code === 'timeout'
      );
    } finally {
      restoreFetch();
    }
  });

  await test('the partner API key never appears in a thrown error, even if Cashfree echoes it back', async () => {
    const secret = 'super_secret_partner_key_xyz';
    process.env.CASHFREE_PARTNER_API_KEY = secret;
    stubFetch(async () => new Response(JSON.stringify({ message: `Request rejected for key ${secret}` }), { status: 403 }));
    try {
      await assert.rejects(
        () => partnerRequest('/merchants/merchant_1'),
        (err) => {
          assert.ok(!String(err.message).includes(secret), 'error message must not contain the raw partner API key');
          assert.ok(!String(err.stack || '').includes(secret), 'error stack must not contain the raw partner API key');
          return true;
        }
      );
    } finally {
      restoreFetch();
    }
  });

  await test('a request/network error thrown by fetch() itself never leaks the key via its own message', async () => {
    const secret = 'another_super_secret_key_456';
    process.env.CASHFREE_PARTNER_API_KEY = secret;
    stubFetch(async () => { throw new TypeError(`connect ECONNREFUSED for key ${secret}`); });
    try {
      await assert.rejects(
        () => partnerRequest('/merchants/merchant_1'),
        (err) => {
          assert.ok(!String(err.message).includes(secret));
          return true;
        }
      );
    } finally {
      restoreFetch();
    }
  });

  if (ORIGINAL_KEY === undefined) delete process.env.CASHFREE_PARTNER_API_KEY; else process.env.CASHFREE_PARTNER_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_ENV === undefined) delete process.env.CASHFREE_PARTNER_ENV; else process.env.CASHFREE_PARTNER_ENV = ORIGINAL_ENV;

  console.log('');
  console.log(`${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
