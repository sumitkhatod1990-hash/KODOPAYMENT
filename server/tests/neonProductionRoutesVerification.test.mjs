import assert from 'assert';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.VERCEL = '1';
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { default: app } = await import('../index.js');

console.log('Neon Production Routes & Payment Link Creation Verification Test');
console.log('===============================================================');

function makeRequest(server, options, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: address.port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json || data
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runProductionRoutesVerification() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

  try {
    // 1. Create unique test user and login to get auth session cookie
    const testEmail = `neon.verify.${Date.now()}@example.com`;
    const signupRes = await makeRequest(server, { path: '/api/v1/auth/signup', method: 'POST' }, {
      email: testEmail,
      name: 'Neon Tester',
      company: 'QivroPay Verification Inc',
      password: 'SecureTestPassword123!'
    });

    assert.ok(signupRes.statusCode === 200 || signupRes.statusCode === 201, `Signup failed with status ${signupRes.statusCode}: ${JSON.stringify(signupRes.body)}`);
    const setCookie = signupRes.headers['set-cookie']?.[0];
    assert.ok(setCookie, 'Signup did not set authentication cookie');
    const authCookie = setCookie.split(';')[0];

    console.log('  ok - 1. Authenticated user session established on database store');

    // 2. GET /api/v1/merchant/profile
    const profileRes = await makeRequest(server, { path: '/api/v1/merchant/profile' }, null, authCookie);
    assert.strictEqual(profileRes.statusCode, 200, `GET /merchant/profile returned ${profileRes.statusCode}: ${JSON.stringify(profileRes.body)}`);
    console.log('  ok - 2. GET /api/v1/merchant/profile succeeded (200 OK)');

    // 3. GET /api/v1/products
    const productsRes = await makeRequest(server, { path: '/api/v1/products' }, null, authCookie);
    assert.strictEqual(productsRes.statusCode, 200, `GET /products returned ${productsRes.statusCode}: ${JSON.stringify(productsRes.body)}`);
    console.log('  ok - 3. GET /api/v1/products succeeded (200 OK)');

    // 4. GET /api/v1/customers
    const customersRes = await makeRequest(server, { path: '/api/v1/customers' }, null, authCookie);
    assert.strictEqual(customersRes.statusCode, 200, `GET /customers returned ${customersRes.statusCode}: ${JSON.stringify(customersRes.body)}`);
    console.log('  ok - 4. GET /api/v1/customers succeeded (200 OK)');

    // 5. GET /api/v1/transactions
    const transactionsRes = await makeRequest(server, { path: '/api/v1/transactions' }, null, authCookie);
    assert.strictEqual(transactionsRes.statusCode, 200, `GET /transactions returned ${transactionsRes.statusCode}: ${JSON.stringify(transactionsRes.body)}`);
    console.log('  ok - 5. GET /api/v1/transactions succeeded (200 OK)');

    // 6. GET /api/v1/analytics
    const analyticsRes = await makeRequest(server, { path: '/api/v1/analytics' }, null, authCookie);
    assert.strictEqual(analyticsRes.statusCode, 200, `GET /analytics returned ${analyticsRes.statusCode}: ${JSON.stringify(analyticsRes.body)}`);
    console.log('  ok - 6. GET /api/v1/analytics succeeded (200 OK)');

    // 7. POST /api/v1/payments/create-session (Payment Link creation)
    const sessionRes = await makeRequest(server, { path: '/api/v1/payments/create-session', method: 'POST' }, {
      title: 'test',
      amount: 499,
      currency: 'INR'
    }, authCookie);

    assert.ok(sessionRes.statusCode === 200 || sessionRes.statusCode === 201, `POST /payments/create-session returned ${sessionRes.statusCode}: ${JSON.stringify(sessionRes.body)}`);
    assert.ok(sessionRes.body.sessionId || sessionRes.body.url || sessionRes.body.id, 'Session creation returned invalid response body');
    console.log('  ok - 7. POST /api/v1/payments/create-session (Payment Link title: test, amount: 499, currency: INR) succeeded (200 OK)');

  } finally {
    server.close();
  }
}

runProductionRoutesVerification()
  .then(() => {
    console.log('\nAll Neon production route and Payment Link creation tests PASSED.\n');
  })
  .catch((err) => {
    console.error('\nTest failed:', err);
    process.exit(1);
  });
