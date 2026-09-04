// Operator tool — activates a merchant for live (production) Cashfree
// payments. This is deliberately a CLI script run directly against the
// database, not an HTTP endpoint: QivroPay has no real KYC/Cashfree
// onboarding review yet, so there is no automated criteria that could decide
// this for itself, and exposing it as an API would just be a second fake
// approval flow. See the "LIVE PAYMENT APPROVAL GATE" comment in
// server/index.js and PRODUCTION_READINESS.md.
//
// Usage:
//   DATABASE_URL=postgres://... node server/scripts/activate-merchant-live.js merchant@example.com
//
// Run this only after you have manually confirmed the merchant outside of
// this codebase (e.g. reviewed their business details directly). It sets
// merchant_profile.liveActivatedAt, which is the only thing
// requireLiveActivationIfProduction() in server/index.js checks before
// letting a merchant create a live checkout session or Cashfree order.
import 'dotenv/config';
import { findUserByEmail, getResource, saveResource } from '../neonStore.js';

async function main() {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: node server/scripts/activate-merchant-live.js <merchant-email>');
    process.exit(1);
  }
  if (!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
    console.error('DATABASE_URL (or POSTGRES_URL) is required — this must be run against the real production database, not the local dev store.');
    process.exit(1);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    console.error(`No merchant account found for ${email}`);
    process.exit(1);
  }

  const existing = await getResource(user.id, 'merchant_profile', 'default');
  const profile = {
    id: 'default',
    businessName: existing?.businessName || user.company || '',
    supportEmail: existing?.supportEmail || '',
    onboardingCompletedAt: existing?.onboardingCompletedAt || null,
    liveActivatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await saveResource(user.id, 'merchant_profile', profile);
  console.log(`Activated ${email} (merchant ${user.id}) for live payments at ${profile.liveActivatedAt}`);
}

main().catch((err) => {
  console.error('Activation failed:', err);
  process.exit(1);
});
