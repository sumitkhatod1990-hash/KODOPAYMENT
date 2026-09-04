import assert from 'assert';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { ensurePaymentStore, ensureAuthStore, ensurePartnerMerchantStore } from '../neonStore.js';

console.log('Neon Schema Initialization Regression Test');
console.log('==========================================');

async function testNeonSchemaInit() {
  // Test 1: Verify schema functions resolve without prepared statement errors
  try {
    await ensurePaymentStore();
    console.log('  ok - 1. ensurePaymentStore executed without prepared statement errors');
  } catch (error) {
    assert.fail(`ensurePaymentStore failed: ${error.message}`);
  }

  try {
    await ensureAuthStore();
    console.log('  ok - 2. ensureAuthStore executed without prepared statement errors');
  } catch (error) {
    assert.fail(`ensureAuthStore failed: ${error.message}`);
  }

  try {
    await ensurePartnerMerchantStore();
    console.log('  ok - 3. ensurePartnerMerchantStore executed without prepared statement errors');
  } catch (error) {
    assert.fail(`ensurePartnerMerchantStore failed: ${error.message}`);
  }

  // Test 2: Idempotency check — second invocation must resolve cleanly
  try {
    await ensurePaymentStore();
    await ensureAuthStore();
    await ensurePartnerMerchantStore();
    console.log('  ok - 4. Schema initializers are idempotent on repeated invocations');
  } catch (error) {
    assert.fail(`Idempotent schema init failed: ${error.message}`);
  }

  // Test 3: Verify multi-command prepared statement error detection
  // Simulating Neon behavior when given multiple commands in a single query:
  const mockPreparedSql = (strings, ...values) => {
    const rawSql = strings.join('?');
    const statements = rawSql.split(';').map(s => s.trim()).filter(Boolean);
    if (statements.length > 1) {
      return Promise.reject(new Error('cannot insert multiple commands into a prepared statement'));
    }
    return Promise.resolve([]);
  };

  try {
    await mockPreparedSql`
      CREATE TABLE test1 (id text);
      CREATE TABLE test2 (id text);
    `;
    assert.fail('Multi-statement query should have been rejected');
  } catch (err) {
    assert.strictEqual(
      err.message,
      'cannot insert multiple commands into a prepared statement',
      'Multi-statement query correctly reproduced prepared statement error'
    );
    console.log('  ok - 5. Successfully reproduced previous multi-command prepared statement failure condition');
  }
}

testNeonSchemaInit()
  .then(() => {
    console.log('\nAll Neon schema initialization regression tests PASSED.\n');
  })
  .catch((err) => {
    console.error('\nTest failed:', err);
    process.exit(1);
  });
