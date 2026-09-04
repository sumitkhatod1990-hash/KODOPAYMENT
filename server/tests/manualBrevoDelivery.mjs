import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendWelcomeEmail, isBrevoConfigured } from '../brevoEmail.js';

// Robustly resolve project root .env file regardless of process.cwd()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: rootEnvPath });

async function runSingleBrevoDeliveryTest() {
  console.log('====================================================');
  console.log('  QivroPay Brevo Transactional Email Delivery Test');
  console.log('====================================================\n');

  const configured = isBrevoConfigured();
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'info@qivropay.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'QivroPay';

  // Recipient resolution: environment variable BREVO_TEST_RECIPIENT or command line argument or fallback
  const targetEmail = (process.env.BREVO_TEST_RECIPIENT || process.argv[2] || 'test.recipient@qivropay.com').trim();
  const recipientName = 'Test Merchant';

  console.log(`- BREVO_API_KEY Configured : ${configured ? 'YES (Key present)' : 'NO (Key missing)'}`);
  console.log(`- Sender Email             : ${senderEmail}`);
  console.log(`- Sender Name              : ${senderName}`);
  console.log(`- Recipient Email          : ${targetEmail}`);
  console.log(`- Recipient Name           : ${recipientName}\n`);

  const isCheckOnly = process.argv.includes('--check-only');

  if (!configured) {
    console.log('❌ BREVO_API_KEY is not set in process.env / .env.');
    console.log('   Please ensure BREVO_API_KEY=your_key is present in .env before running live delivery.\n');
    return { success: false, reason: 'unconfigured' };
  }

  if (isCheckOnly) {
    console.log('✓ BREVO_API_KEY detected successfully. --check-only flag specified, email send skipped.');
    return { success: true, checkOnly: true };
  }

  console.log(`Sending exactly ONE welcome email to ${targetEmail}...\n`);

  // Call existing server/brevoEmail.js module
  const result = await sendWelcomeEmail({ email: targetEmail, name: recipientName });

  console.log('---------------- Result Summary ----------------');
  console.log(`- Delivery Status : ${result.success ? 'SUCCESS (Accepted by Brevo)' : 'FAILED'}`);
  if (result.messageId) {
    console.log(`- Brevo Message ID: ${result.messageId}`);
  }
  if (result.error) {
    console.log(`- Provider Error  : ${result.error}`);
  }
  console.log('------------------------------------------------\n');

  return result;
}

runSingleBrevoDeliveryTest().catch((err) => {
  console.error('\n❌ Unexpected test execution error:', err.message || err);
  process.exit(1);
});
