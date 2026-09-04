// Server-side verification of Google Identity Services ID tokens for
// "Continue with Google" (Phase 11). This is NOT an auth provider — it does
// not manage sessions or users, it only proves a client-supplied credential
// really was issued by Google for our GOOGLE_CLIENT_ID and hands back the
// verified claims. Everything else (finding/creating the QivroPay user,
// issuing the QivroPay session) stays in neonStore.js / server/index.js,
// unchanged from the existing email/password flow.
import { OAuth2Client } from 'google-auth-library';

let client;
function getClient() {
  if (!client) client = new OAuth2Client();
  return client;
}

export function googleClientId() {
  return String(process.env.GOOGLE_CLIENT_ID || '').trim();
}

// Verifies the credential's signature, issuer, audience and expiry against
// Google's published keys, then returns only the fields the rest of the app
// is allowed to trust. Throws on any verification failure or an unverified
// email — callers must never fall back to trusting a client-supplied
// email/name when this throws.
export async function verifyGoogleIdToken(idToken) {
  const audience = googleClientId();
  if (!audience) throw new Error('GOOGLE_CLIENT_ID is not configured');
  let payload;
  try {
    // OAuth2Client.verifyIdToken checks, in this call, that the token: is a
    // well-formed JWT; has a valid Google signature (against Google's live
    // JWKS); has iss of accounts.google.com / https://accounts.google.com;
    // has aud === our GOOGLE_CLIENT_ID (audience, passed above); and has not
    // expired (exp) or been used before its issue time (iat) — rejecting an
    // invalid, expired, or wrong-audience credential before we ever see it.
    const ticket = await getClient().verifyIdToken({ idToken: String(idToken || ''), audience });
    payload = ticket.getPayload();
  } catch (e) {
    // google-auth-library's own thrown errors can embed the raw token or
    // decoded payload verbatim in error.message (e.g. "Wrong number of
    // segments in token: <the actual credential>", "Invalid token
    // signature: <jwt>") — never let that propagate to a caller that might
    // log it. Re-throw a fixed, credential-free message instead.
    throw new Error('Google ID token verification failed');
  }
  if (!payload || !payload.sub || !payload.email || !payload.email_verified) {
    throw new Error('Google account email is not verified');
  }
  return { googleId: payload.sub, email: payload.email, name: payload.name || '' };
}
