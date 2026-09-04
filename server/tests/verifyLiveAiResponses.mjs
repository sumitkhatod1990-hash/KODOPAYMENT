// Live API Verification for QivroPay AI Support Assistant (Groq API)
import assert from 'node:assert/strict';

const BASE = 'http://localhost:4000';

async function cookieFrom(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()[0]
    : res.headers.get('set-cookie');
  if (!raw) throw new Error('Response did not set a session cookie');
  return raw.split(';')[0];
}

async function verifyLive() {
  console.log('=== Live Groq AI Support Assistant Verification ===\n');

  // 1. Test Public Mode: "How do I test in Sandbox mode?"
  console.log('Test 1: Public Mode - "How do I test in Sandbox mode?"');
  const res1 = await fetch(`${BASE}/api/v1/support/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'How do I test in Sandbox mode?' }]
    })
  });

  assert.equal(res1.status, 200, 'Public chat request should return HTTP 200');
  const data1 = await res1.json();
  assert.equal(data1.success, true);
  assert.equal(data1.mode, 'public', 'Unauthenticated request must resolve to public mode');

  console.log('\n--- AI Response 1 ---');
  console.log(data1.reply);
  console.log('---------------------\n');

  assert.ok(!data1.reply.includes('sandbox.qivropay.com'), 'AI response MUST NOT contain sandbox.qivropay.com');
  assert.ok(!data1.reply.includes('Settings -> Sandbox toggle'), 'AI response MUST NOT contain fake Settings toggle');
  assert.ok(!data1.reply.includes('##') || data1.reply.includes('## '), 'Formatting check passed');
  console.log('✓ Public mode Sandbox answer verified clean!\n');

  // 2. Test Public Mode: "What are your transaction prices?"
  console.log('Test 2: Public Mode - "What are your transaction prices?"');
  const res2 = await fetch(`${BASE}/api/v1/support/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'What are your transaction prices?' }]
    })
  });

  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.success, true);
  assert.equal(data2.mode, 'public');

  console.log('\n--- AI Response 2 ---');
  console.log(data2.reply);
  console.log('---------------------\n');

  assert.ok(data2.reply.includes('pricing is currently being finalized') || data2.reply.includes('finalized'), 'AI response must mention pricing is being finalized');
  assert.ok(!data2.reply.includes('2%') && !data2.reply.includes('3%'), 'AI response MUST NOT invent 2% or 3% fee');
  console.log('✓ Public mode Pricing answer verified clean!\n');

  // 3. Test Authenticated Merchant Mode
  console.log('Test 3: Authenticated Merchant Mode');
  // Create a new merchant account
  const email = `test.live.${Date.now()}@qivropay.test`;
  const signupRes = await fetch(`${BASE}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123456', name: 'Apex Merchant', company: 'Apex Global Logistics' })
  });

  assert.equal(signupRes.status, 201, 'Signup should succeed');
  const cookie = await cookieFrom(signupRes);

  const res3 = await fetch(`${BASE}/api/v1/support/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'What is my merchant business name and transaction summary?' }]
    })
  });

  assert.equal(res3.status, 200);
  const data3 = await res3.json();
  assert.equal(data3.success, true);
  assert.equal(data3.mode, 'authenticated', 'Authenticated request must resolve to authenticated mode');

  console.log('\n--- AI Response 3 (Authenticated Account Mode) ---');
  console.log(data3.reply);
  console.log('--------------------------------------------------\n');

  assert.ok(data3.reply.includes('Apex Global Logistics') || data3.reply.includes('Apex Merchant'), 'AI must recognize the authenticated merchant name');
  assert.ok(!data3.reply.includes('$'), 'AI response MUST NOT contain dollar symbol $');
  assert.ok(data3.reply.includes('₹') || data3.reply.includes('INR'), 'AI response MUST format money in ₹ or INR');
  console.log('✓ Authenticated mode currency formatting (₹ / INR) verified clean!\n');

  console.log('=== All Live Groq AI Assistant Checks Passed Successfully! ===');
}

verifyLive().catch(err => {
  console.error('\n❌ Live Verification Failed:', err);
  process.exit(1);
});
