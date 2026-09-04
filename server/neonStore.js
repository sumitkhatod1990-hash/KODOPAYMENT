import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let schemaReady;

function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

function sqlClient() {
  const url = databaseUrl();
  if (!url) return null;
  return neon(url);
}

// Reports which persistence backend requests are actually served from, for
// startup logging and diagnostics. Never assume a database silently.
export function persistenceMode() {
  return databaseUrl() ? 'neon-postgres' : 'local-file-store';
}

// -------------------------------------------------------------
// LOCAL DEVELOPMENT PERSISTENCE
// When no DATABASE_URL/POSTGRES_URL is configured (i.e. local dev/QA without
// access to the production database), all data is kept in memory and
// mirrored to a gitignored JSON file so it survives a server restart. This
// file is never read from or written to when a real database is configured,
// so local development data can never leak into or collide with production.
// -------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_STORE_DIR = path.join(__dirname, '.data');
const LOCAL_STORE_PATH = path.join(LOCAL_STORE_DIR, 'dev-store.json');

function loadLocalStore() {
  if (databaseUrl() || process.env.VERCEL === '1') return {};
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_STORE_PATH, 'utf-8'));
    }
  } catch (error) {
    console.warn('Could not read local development store, starting fresh:', error.message);
  }
  return {};
}

const localStore = loadLocalStore();

// In-Memory Fallback Stores (used only when no database is configured)
const memoryUsers = new Map(Object.entries(localStore.users || {}));
const memorySessions = new Map(Object.entries(localStore.sessions || {}));
const memoryEvents = new Map(Object.entries(localStore.events || {}));
const memoryResources = new Map(Object.entries(localStore.resources || {}));
// Phase 10.8C: QivroPay merchant <-> Cashfree Partner merchant mapping,
// keyed by QivroPay merchant_id (one row per QivroPay merchant).
const memoryPartnerMerchants = new Map(Object.entries(localStore.partnerMerchants || {}));

function persistLocalStore() {
  // Never write local dev data alongside a real database, and never write to
  // a read-only Vercel serverless filesystem.
  if (databaseUrl() || process.env.VERCEL === '1') return;
  try {
    fs.mkdirSync(LOCAL_STORE_DIR, { recursive: true });
    const data = {
      users: Object.fromEntries(memoryUsers),
      sessions: Object.fromEntries(memorySessions),
      events: Object.fromEntries(memoryEvents),
      resources: Object.fromEntries(memoryResources),
      partnerMerchants: Object.fromEntries(memoryPartnerMerchants)
    };
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Could not write local development store:', error.message);
  }
}

export async function ensurePaymentStore() {
  const sql = sqlClient();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_payment_events (
          event_id TEXT PRIMARY KEY,
          kind TEXT NOT NULL,
          order_id TEXT,
          status TEXT,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS qivropay_payment_events_session_idx
          ON qivropay_payment_events ((payload->>'sessionToken'))
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_resources (
          merchant_id TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          resource_id TEXT NOT NULL,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (merchant_id, resource_type, resource_id)
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS qivropay_resources_type_idx
          ON qivropay_resources (merchant_id, resource_type, created_at DESC)
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_checkout_sessions (
          session_id TEXT PRIMARY KEY,
          merchant_id TEXT,
          payload JSONB NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS qivropay_checkout_sessions_merchant_idx
          ON qivropay_checkout_sessions (merchant_id, created_at DESC)
      `;
    })().catch((error) => {
      schemaReady = undefined;
      console.error('Neon payment schema init failed:', error.message);
      throw error;
    });
  }
  await schemaReady;
}

export async function recordPaymentOrder(order) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`
        INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
        VALUES (${`order:${order.orderId}`}, 'order_created', ${order.orderId}, ${order.orderStatus || 'ACTIVE'}, ${JSON.stringify(order)}::jsonb)
        ON CONFLICT (event_id) DO NOTHING
      `;
      return;
    } catch (e) {
      throw e;
    }
  }
  memoryEvents.set(`order:${order.orderId}`, {
    event_id: `order:${order.orderId}`,
    kind: 'order_created',
    order_id: order.orderId,
    status: order.orderStatus || 'ACTIVE',
    payload: order,
    created_at: new Date()
  });
  persistLocalStore();
}

export async function getPaymentOrderForSession(sessionToken) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        SELECT payload FROM qivropay_payment_events
        WHERE kind = 'order_created' AND payload->>'sessionToken' = ${String(sessionToken || '')}
        ORDER BY created_at DESC LIMIT 1
      `;
      if (rows && rows[0]) return rows[0].payload;
    } catch (e) {
      throw e;
    }
  }
  for (const event of memoryEvents.values()) {
    if (event.kind === 'order_created' && event.payload?.sessionToken === String(sessionToken || '')) {
      return event.payload;
    }
  }
  return null;
}

export async function recordCashfreeWebhook(eventId, event) {
  const sql = sqlClient();
  const orderId = event?.data?.order?.order_id || event?.data?.order_id || event?.order_id || null;
  const status = event?.type || event?.event || event?.data?.payment?.payment_status || null;
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
        VALUES (${eventId}, 'cashfree_webhook', ${orderId}, ${status}, ${JSON.stringify(event)}::jsonb)
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `;
      return rows.length > 0;
    } catch (e) {
      throw e;
    }
  }
  const exists = memoryEvents.has(eventId);
  memoryEvents.set(eventId, { eventId, kind: 'cashfree_webhook', orderId, status, payload: event });
  persistLocalStore();
  return !exists;
}

// A tiny per-key async mutex for the local (no-database) fallback only.
// Node is single-threaded, but `await`ing file I/O still yields the event
// loop between a check and its matching write, so a plain
// `if (!map.has(key)) map.set(key, ...)` is not safe against two
// concurrently in-flight async callers for the same key. Chaining each
// call for a given key onto the previous one serializes them correctly.
// Not needed (or used) on the Postgres path, which gets its atomicity from
// a real unique-constraint INSERT instead.
const localClaimMutexTails = new Map();
function withLocalMutex(key, fn) {
  const tail = (localClaimMutexTails.get(key) || Promise.resolve()).then(fn, fn);
  localClaimMutexTails.set(key, tail.catch(() => {}));
  return tail;
}

// Atomically claims that a given order's successful outcome has already
// been credited to the customer aggregate, so it can only ever be credited
// once — regardless of how many times, in what order, or how concurrently
// this is called for the same order (webhook first, status-poll first,
// overlapping webhook retries, or poll/webhook overlap all behave the
// same). Returns true for exactly one caller per order (the one that
// "wins" and should proceed to credit the aggregate); false for every
// other caller (who must not).
//
// This is deliberately independent of, and in addition to,
// recordCashfreeWebhook()'s event-level deduplication above: that catches
// exact repeat deliveries of the same webhook event, but real-world
// Cashfree retries can arrive with different event identifiers for what is
// effectively the same order outcome, so relying on event-level dedup
// alone is not sufficient — this claim is the layer that is actually
// correct regardless.
//
// On Postgres this is a real atomic primitive: a single INSERT guarded by
// the same qivropay_payment_events primary key used for webhook dedup,
// which the database itself serializes via its unique index — correct
// across concurrent requests and multiple server instances, not dependent
// on JavaScript execution order. Locally (no database configured) it uses
// the in-process mutex above, which is the correct equivalent for a
// single-process store.
export async function claimOrderCredited(merchantId, orderId) {
  const claimId = `credit:${merchantId}:${String(orderId)}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
        VALUES (${claimId}, 'order_credited_claim', ${String(orderId)}, 'claimed', '{}'::jsonb)
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `;
      return rows.length > 0;
    } catch (e) {
      throw e;
    }
  }
  return withLocalMutex(claimId, () => {
    if (memoryEvents.has(claimId)) return false;
    memoryEvents.set(claimId, { eventId: claimId, kind: 'order_credited_claim', orderId: String(orderId), payload: {} });
    persistLocalStore();
    return true;
  });
}

// Refund concurrency. Unlike claimOrderCredited() above — a permanent,
// once-ever claim, correct because a successful credit is a fact that never
// needs to be undone — a refund attempt has three states: 'in_flight' (a
// caller is currently calling Cashfree), 'succeeded' (Cashfree accepted the
// refund request — permanent, mirrors claimOrderCredited's once-ever
// semantics), and 'failed' (the Cashfree call errored — releasable, so one
// bad network call cannot permanently lock a merchant out of retrying a
// legitimate refund). A claim stuck at 'in_flight' longer than
// REFUND_CLAIM_STALE_MS (the owning request crashed before it could call
// completeRefundClaim/releaseRefundClaim) is also treated as reclaimable, so
// a process crash mid-request cannot brick refunds for a transaction forever
// either.
//
// Exactly one caller wins beginRefundClaim() for a given (merchant, order)
// at a time: the decision is made entirely by whether one of our own atomic
// SQL statements affected a row (an INSERT for a brand-new claim, or an
// UPDATE ... WHERE status = 'failed' OR stale 'in_flight' for a releasable
// one) — never by a preceding SELECT, so there is no check-then-act window
// for two concurrent callers to both win. The trailing SELECT used to choose
// an error message only runs after both write attempts have already lost,
// so it cannot affect who wins. On the local store, the same decision is
// made inside the single-key mutex used elsewhere in this file, which is the
// correct equivalent for a single-process store. The three-minute window
// below is a fixed literal in the Postgres branch's SQL text (interval
// literals cannot be parameterized through the tagged-template client) — if
// this constant changes, update that literal to match.
const REFUND_CLAIM_STALE_MS = 3 * 60 * 1000;

export async function beginRefundClaim(merchantId, orderId) {
  const claimId = `refund:${merchantId}:${String(orderId)}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const inserted = await sql`
        INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
        VALUES (${claimId}, 'refund_claim', ${String(orderId)}, 'in_flight', ${JSON.stringify({ claimedAt: new Date().toISOString() })}::jsonb)
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `;
      if (inserted.length > 0) return { won: true };

      const reclaimed = await sql`
        UPDATE qivropay_payment_events
        SET status = 'in_flight', payload = ${JSON.stringify({ claimedAt: new Date().toISOString() })}::jsonb
        WHERE event_id = ${claimId}
          AND (
            status = 'failed'
            OR (status = 'in_flight' AND (payload->>'claimedAt')::timestamptz < NOW() - INTERVAL '3 minutes')
          )
        RETURNING event_id
      `;
      if (reclaimed.length > 0) return { won: true };

      const rows = await sql`SELECT status FROM qivropay_payment_events WHERE event_id = ${claimId} LIMIT 1`;
      const status = rows?.[0]?.status;
      return { won: false, reason: status === 'succeeded' ? 'already_refunded' : 'in_progress' };
    } catch (e) {
      throw e;
    }
  }
  return withLocalMutex(claimId, () => {
    const existing = memoryEvents.get(claimId);
    if (existing) {
      if (existing.status === 'succeeded') return { won: false, reason: 'already_refunded' };
      if (existing.status === 'in_flight') {
        const claimedAt = existing.payload?.claimedAt ? new Date(existing.payload.claimedAt).getTime() : 0;
        if (Date.now() - claimedAt < REFUND_CLAIM_STALE_MS) return { won: false, reason: 'in_progress' };
      }
    }
    memoryEvents.set(claimId, { eventId: claimId, kind: 'refund_claim', orderId: String(orderId), status: 'in_flight', payload: { claimedAt: new Date().toISOString() } });
    persistLocalStore();
    return { won: true };
  });
}

// Marks a claimed refund attempt as permanently completed (Cashfree accepted
// the refund request). A no-op if the claim isn't held as 'in_flight' — that
// should never happen since only the caller that won beginRefundClaim() ever
// calls this, but the WHERE guard keeps it safe regardless.
export async function completeRefundClaim(merchantId, orderId) {
  const claimId = `refund:${merchantId}:${String(orderId)}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`UPDATE qivropay_payment_events SET status = 'succeeded' WHERE event_id = ${claimId} AND status = 'in_flight'`;
      return;
    } catch (e) { throw e; }
  }
  await withLocalMutex(claimId, () => {
    const existing = memoryEvents.get(claimId);
    if (existing && existing.status === 'in_flight') {
      memoryEvents.set(claimId, { ...existing, status: 'succeeded' });
      persistLocalStore();
    }
  });
}

// Releases a claimed refund attempt that did not succeed (Cashfree returned
// an error, or the request to Cashfree itself failed) so a legitimate retry
// is not permanently blocked by beginRefundClaim().
export async function releaseRefundClaim(merchantId, orderId) {
  const claimId = `refund:${merchantId}:${String(orderId)}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`UPDATE qivropay_payment_events SET status = 'failed' WHERE event_id = ${claimId} AND status = 'in_flight'`;
      return;
    } catch (e) { throw e; }
  }
  await withLocalMutex(claimId, () => {
    const existing = memoryEvents.get(claimId);
    if (existing && existing.status === 'in_flight') {
      memoryEvents.set(claimId, { ...existing, status: 'failed' });
      persistLocalStore();
    }
  });
}

// Releases a claim that had already been permanently locked to 'succeeded'
// (Cashfree had accepted the refund request — SUCCESS or PENDING — so a
// second beginRefundClaim() correctly refused to run) after later, authoritative
// evidence (a reconciliation lookup or a webhook) shows the refund actually
// ended in FAILED/CANCELLED. Distinct from releaseRefundClaim() above, which
// only ever releases a claim that never got past 'in_flight' (the initial
// POST to Cashfree itself failed or errored) — this one exists specifically
// for "we thought it went through, but it didn't", so a legitimate retry
// remains possible per requirement 7 of the Phase 8 refund-status fix. Only
// ever called from the trusted reconciliation/webhook path, never from a
// plain merchant-initiated refund request.
export async function reopenRefundClaimAfterFailure(merchantId, orderId) {
  const claimId = `refund:${merchantId}:${String(orderId)}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`UPDATE qivropay_payment_events SET status = 'failed' WHERE event_id = ${claimId} AND status IN ('in_flight', 'succeeded')`;
      return;
    } catch (e) { throw e; }
  }
  await withLocalMutex(claimId, () => {
    const existing = memoryEvents.get(claimId);
    if (existing && (existing.status === 'in_flight' || existing.status === 'succeeded')) {
      memoryEvents.set(claimId, { ...existing, status: 'failed' });
      persistLocalStore();
    }
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = String(stored || '').split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

let authSchemaReady;

export async function ensureAuthStore() {
  const sql = sqlClient();
  if (!sql) return;
  if (!authSchemaReady) {
    authSchemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          password_hash TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_auth_sessions (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES qivropay_users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      // Additive migration for Google Sign-In (Phase 11): existing deployments
      // already have qivropay_users without this column / with password_hash
      // NOT NULL, and CREATE TABLE IF NOT EXISTS above is a no-op for them, so
      // both statements must run unconditionally every time. Both are
      // idempotent — Postgres accepts DROP NOT NULL and ADD COLUMN IF NOT
      // EXISTS even when already applied. A plain (non-partial) UNIQUE index
      // is safe here: Postgres never treats two NULLs as equal, so any number
      // of password-only accounts (google_id IS NULL) can coexist.
      await sql`ALTER TABLE qivropay_users ALTER COLUMN password_hash DROP NOT NULL`;
      await sql`ALTER TABLE qivropay_users ADD COLUMN IF NOT EXISTS google_id TEXT`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS qivropay_users_google_id_key ON qivropay_users (google_id)`;
    })().catch((error) => {
      authSchemaReady = undefined;
      console.error('Neon auth schema init failed:', error.message);
      throw error;
    });
  }
  await authSchemaReady;
}

export async function createUser({ email, name, company, password }) {
  const sql = sqlClient();
  const id = `usr_${crypto.randomBytes(12).toString('hex')}`;
  const password_hash = hashPassword(password);
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`
        INSERT INTO qivropay_users (id, email, name, company, password_hash)
        VALUES (${id}, ${email}, ${name}, ${company}, ${password_hash})
        RETURNING id, email, name, company, created_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }
  const user = { id, email, name, company, password_hash, created_at: new Date().toISOString() };
  memoryUsers.set(email.toLowerCase(), user);
  persistLocalStore();
  return user;
}

export async function findUserByEmail(email) {
  const normalized = String(email || '').toLowerCase().trim();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`SELECT id, email, name, company, password_hash, google_id, created_at FROM qivropay_users WHERE email = ${normalized} LIMIT 1`;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }
  return memoryUsers.get(normalized) || null;
}

export function checkUserPassword(password, storedHash) {
  return verifyPassword(password, storedHash);
}

// ---------------------------------------------------------------
// Google Sign-In (Phase 11)
// The route handler (server/index.js) verifies the Google ID token's
// signature/audience/expiry via server/googleAuth.js *before* calling
// upsertGoogleUser — everything below trusts googleId/email/name as already
// server-verified and never re-derives identity from client-supplied values.
// ---------------------------------------------------------------

export async function findUserByGoogleId(googleId) {
  if (!googleId) return null;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`SELECT id, email, name, company, password_hash, google_id, created_at FROM qivropay_users WHERE google_id = ${googleId} LIMIT 1`;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
    return null;
  }
  for (const u of memoryUsers.values()) {
    if (u.google_id === googleId) return u;
  }
  return null;
}

async function linkGoogleId(userId, googleId) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`
        UPDATE qivropay_users SET google_id = ${googleId} WHERE id = ${userId}
        RETURNING id, email, name, company, password_hash, google_id, created_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
    return null;
  }
  for (const u of memoryUsers.values()) {
    if (u.id === userId) { u.google_id = googleId; persistLocalStore(); return u; }
  }
  return null;
}

async function createGoogleUser({ email, name, googleId }) {
  const sql = sqlClient();
  const id = `usr_${crypto.randomBytes(12).toString('hex')}`;
  // Business/store name isn't collected on the Google button — the existing
  // FirstMerchantOnboarding step already requires it (falling back to
  // user.company) before a merchant reaches the dashboard, so an empty
  // string here (still satisfies the NOT NULL column) is filled in there.
  const safeName = String(name || '').trim() || email.split('@')[0];
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`
        INSERT INTO qivropay_users (id, email, name, company, password_hash, google_id)
        VALUES (${id}, ${email}, ${safeName}, ${''}, ${null}, ${googleId})
        RETURNING id, email, name, company, password_hash, google_id, created_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }
  const user = { id, email, name: safeName, company: '', password_hash: null, google_id: googleId, created_at: new Date().toISOString() };
  memoryUsers.set(email.toLowerCase(), user);
  persistLocalStore();
  return user;
}

// Idempotent welcome email claim. Returns true on the first claim for a user id,
// false for any subsequent attempt (handling Google callback retries / request retries).
export async function claimWelcomeEmail(userId) {
  if (!userId) return false;
  const claimId = `welcome_email:${String(userId)}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
        VALUES (${claimId}, 'welcome_email_claim', ${String(userId)}, 'claimed', ${JSON.stringify({ claimedAt: new Date().toISOString() })}::jsonb)
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `;
      return rows.length > 0;
    } catch (e) {
      throw e;
    }
  }
  return withLocalMutex(claimId, () => {
    if (memoryEvents.has(claimId)) return false;
    memoryEvents.set(claimId, { eventId: claimId, kind: 'welcome_email_claim', orderId: String(userId), status: 'claimed', payload: { claimedAt: new Date().toISOString() } });
    persistLocalStore();
    return true;
  });
}

// Single entry point for "Continue with Google": resolves the verified
// Google identity to a QivroPay user, creating one only if neither the
// google_id nor the verified email match an existing row — so an existing
// email/password account signing in with the same Google email gets linked
// in place rather than duplicated (per the Phase 11 spec). Returns the user
// object with an explicit `isNewUser` boolean flag so callers know whether
// this was a brand-new account creation.
export async function upsertGoogleUser({ googleId, email, name }) {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!googleId || !normalizedEmail) throw new Error('Google account did not provide a verified id/email');
  const byGoogleId = await findUserByGoogleId(googleId);
  if (byGoogleId) return { ...byGoogleId, isNewUser: false };
  const byEmail = await findUserByEmail(normalizedEmail);
  if (byEmail) {
    if (byEmail.google_id && byEmail.google_id !== googleId) {
      throw new Error('This email is already linked to a different Google account');
    }
    if (!byEmail.google_id) {
      const linked = await linkGoogleId(byEmail.id, googleId);
      return { ...linked, isNewUser: false };
    }
    return { ...byEmail, isNewUser: false };
  }
  const created = await createGoogleUser({ email: normalizedEmail, name, googleId });
  return { ...created, isNewUser: true };
}

export async function createAuthSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      await sql`INSERT INTO qivropay_auth_sessions (token_hash, user_id, expires_at) VALUES (${tokenHash}, ${userId}, ${expiresAt})`;
      return { token, expiresAt };
    } catch (e) {
      throw e;
    }
  }
  memorySessions.set(tokenHash, { tokenHash, userId, expiresAt });
  persistLocalStore();
  return { token, expiresAt };
}

export async function getUserForSession(token) {
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`
        SELECT u.id, u.email, u.name, u.company, u.created_at
        FROM qivropay_auth_sessions s JOIN qivropay_users u ON u.id = s.user_id
        WHERE s.token_hash = ${tokenHash} AND s.expires_at > NOW() LIMIT 1
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }
  const session = memorySessions.get(tokenHash);
  if (session && new Date(session.expiresAt) > new Date()) {
    for (const u of memoryUsers.values()) {
      if (u.id === session.userId) return u;
    }
  }
  return null;
}

export async function deleteAuthSession(token) {
  if (!token) return;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      await sql`DELETE FROM qivropay_auth_sessions WHERE token_hash = ${tokenHash}`;
      return;
    } catch (e) {
      throw e;
    }
  }
  memorySessions.delete(tokenHash);
  persistLocalStore();
}


export async function createCheckoutSession(session) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`
        INSERT INTO qivropay_checkout_sessions (session_id, merchant_id, payload, status, expires_at)
        VALUES (${session.sessionId}, ${session.merchantId || null}, ${JSON.stringify(session)}::jsonb, 'open', ${session.expiresAt || null})
        ON CONFLICT (session_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
      `;
      return session;
    } catch (e) { throw e; }
  }
  memoryEvents.set(`checkout:${session.sessionId}`, { kind: 'checkout_session', payload: session });
  persistLocalStore();
  return session;
}

export async function getCheckoutSession(sessionId) {
  const id = String(sessionId || '');
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`SELECT payload FROM qivropay_checkout_sessions WHERE session_id = ${id} LIMIT 1`;
      if (rows?.[0]?.payload) return rows[0].payload;
    } catch (e) { throw e; }
  }
  return memoryEvents.get(`checkout:${id}`)?.payload || null;
}

export async function saveResource(merchantId, resourceType, resource) {
  const sql = sqlClient();
  const id = String(resource.id);
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`
        INSERT INTO qivropay_resources (merchant_id, resource_type, resource_id, payload)
        VALUES (${merchantId}, ${resourceType}, ${id}, ${JSON.stringify(resource)}::jsonb)
        ON CONFLICT (merchant_id, resource_type, resource_id)
        DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
      `;
      return resource;
    } catch (e) { throw e; }
  }
  memoryResources.set(`${merchantId}:${resourceType}:${id}`, resource);
  persistLocalStore();
  return resource;
}

export async function listResources(merchantId, resourceType) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        SELECT payload FROM qivropay_resources
        WHERE merchant_id = ${merchantId} AND resource_type = ${resourceType}
        ORDER BY created_at DESC
      `;
      return rows.map(r => r.payload);
    } catch (e) { throw e; }
  }
  return [...memoryResources.entries()]
    .filter(([key]) => key.startsWith(`${merchantId}:${resourceType}:`))
    .map(([, value]) => value);
}

export async function getResource(merchantId, resourceType, resourceId) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        SELECT payload FROM qivropay_resources
        WHERE merchant_id = ${merchantId} AND resource_type = ${resourceType} AND resource_id = ${String(resourceId)}
        LIMIT 1
      `;
      if (rows?.[0]?.payload) return rows[0].payload;
    } catch (e) { throw e; }
  }
  return memoryResources.get(`${merchantId}:${resourceType}:${resourceId}`) || null;
}

export async function deleteResource(merchantId, resourceType, resourceId) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`DELETE FROM qivropay_resources WHERE merchant_id = ${merchantId} AND resource_type = ${resourceType} AND resource_id = ${String(resourceId)}`;
      return;
    } catch (e) { throw e; }
  }
  memoryResources.delete(`${merchantId}:${resourceType}:${resourceId}`);
  persistLocalStore();
}


export async function findApiKey(rawKey) {
  const key = String(rawKey || '');
  if (!key) return null;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        SELECT merchant_id, payload FROM qivropay_resources
        WHERE resource_type = 'api_key' AND payload->>'keyHash' = ${hash} LIMIT 1
      `;
      if (rows?.[0]) return { merchantId: rows[0].merchant_id, key: rows[0].payload };
    } catch (e) { throw e; }
  }
  for (const [composite, value] of memoryResources.entries()) {
    if (composite.includes(':api_key:') && value.keyHash === hash) {
      return { merchantId: composite.split(':')[0], key: value };
    }
  }
  return null;
}

export async function getPaymentOrder(orderId) {
  const id = String(orderId || '');
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`SELECT payload FROM qivropay_payment_events WHERE kind = 'order_created' AND order_id = ${id} ORDER BY created_at DESC LIMIT 1`;
      if (rows?.[0]?.payload) return rows[0].payload;
    } catch (e) { throw e; }
  }
  for (const event of memoryEvents.values()) if (event.kind === 'order_created' && event.order_id === id) return event.payload;
  return null;
}

// -------------------------------------------------------------
// PHASE 10.8C: QivroPay merchant <-> Cashfree Partner merchant mapping.
//
// One row per QivroPay merchant, pointing at the (already-created,
// already-onboarded outside this codebase) Cashfree Partner sub-merchant it
// corresponds to. This module only stores identifiers and the last-fetched
// onboarding/KYC/activation status text Cashfree returned — it never talks
// to the Cashfree Partner API itself (see cashfreePartnerMerchantStatus.js)
// and never fabricates or infers a status QivroPay hasn't actually observed
// from a real Cashfree response.
//
// Both merchant_id (the QivroPay side) and cf_merchant_id (the Cashfree
// side) are unique: a QivroPay merchant maps to at most one Cashfree
// merchant, and a Cashfree merchant is claimed by at most one QivroPay
// merchant. No FK to qivropay_users on purpose — same as qivropay_resources
// above, this store must not take on an ordering dependency on
// ensureAuthStore() having run first.
// -------------------------------------------------------------

let partnerSchemaReady;

export async function ensurePartnerMerchantStore() {
  const sql = sqlClient();
  if (!sql) return;
  if (!partnerSchemaReady) {
    partnerSchemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_cashfree_partner_merchants (
          merchant_id TEXT PRIMARY KEY,
          cf_merchant_id TEXT NOT NULL UNIQUE,
          onboarding_status TEXT,
          kyc_status TEXT,
          full_kyc_status TEXT,
          activation_status TEXT,
          transaction_access TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((error) => {
      partnerSchemaReady = undefined;
      console.error('Neon partner merchant schema init failed:', error.message);
      throw error;
    });
  }
  await partnerSchemaReady;
}

export class PartnerMappingError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'PartnerMappingError';
    this.code = code;
  }
}

function toPartnerMappingRow(record) {
  if (!record) return null;
  return {
    merchant_id: record.merchant_id,
    cf_merchant_id: record.cf_merchant_id,
    onboarding_status: record.onboarding_status ?? null,
    kyc_status: record.kyc_status ?? null,
    full_kyc_status: record.full_kyc_status ?? null,
    activation_status: record.activation_status ?? null,
    transaction_access: record.transaction_access ?? null,
    created_at: record.created_at,
    updated_at: record.updated_at
  };
}

// Creates the mapping row for a QivroPay merchant that does not yet have
// one, pointed at a Cashfree merchant_id that is not yet claimed by any
// other QivroPay merchant. Throws PartnerMappingError('duplicate_merchant')
// or PartnerMappingError('duplicate_cf_merchant') rather than silently
// overwriting or silently succeeding — callers must treat both as 409s, not
// retry them as transient failures.
export async function createPartnerMerchantMapping({ merchantId, cfMerchantId }) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePartnerMerchantStore();
      const existingByMerchant = await sql`SELECT merchant_id FROM qivropay_cashfree_partner_merchants WHERE merchant_id = ${merchantId} LIMIT 1`;
      if (existingByMerchant.length > 0) throw new PartnerMappingError('This QivroPay merchant is already mapped to a Cashfree merchant', 'duplicate_merchant');
      const existingByCf = await sql`SELECT merchant_id FROM qivropay_cashfree_partner_merchants WHERE cf_merchant_id = ${cfMerchantId} LIMIT 1`;
      if (existingByCf.length > 0) throw new PartnerMappingError('This Cashfree merchant is already mapped to a QivroPay merchant', 'duplicate_cf_merchant');
      try {
        const rows = await sql`
          INSERT INTO qivropay_cashfree_partner_merchants (merchant_id, cf_merchant_id)
          VALUES (${merchantId}, ${cfMerchantId})
          RETURNING *
        `;
        return toPartnerMappingRow(rows[0]);
      } catch (e) {
        // Backstop for a race between the pre-checks above and this insert —
        // the real unique constraints are the source of truth, the SELECTs
        // above are only there to report which one collided in the common
        // (non-racing) case.
        if (e.code === '23505') {
          throw new PartnerMappingError('This QivroPay merchant or Cashfree merchant is already mapped', 'duplicate_mapping');
        }
        throw e;
      }
    } catch (e) {
      throw e;
    }
  }
  if (memoryPartnerMerchants.has(merchantId)) {
    throw new PartnerMappingError('This QivroPay merchant is already mapped to a Cashfree merchant', 'duplicate_merchant');
  }
  for (const record of memoryPartnerMerchants.values()) {
    if (record.cf_merchant_id === cfMerchantId) {
      throw new PartnerMappingError('This Cashfree merchant is already mapped to a QivroPay merchant', 'duplicate_cf_merchant');
    }
  }
  const now = new Date().toISOString();
  const record = {
    merchant_id: merchantId,
    cf_merchant_id: cfMerchantId,
    onboarding_status: null,
    kyc_status: null,
    full_kyc_status: null,
    activation_status: null,
    transaction_access: null,
    created_at: now,
    updated_at: now
  };
  memoryPartnerMerchants.set(merchantId, record);
  persistLocalStore();
  return toPartnerMappingRow(record);
}

export async function getPartnerMerchantMapping(merchantId) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePartnerMerchantStore();
      const rows = await sql`SELECT * FROM qivropay_cashfree_partner_merchants WHERE merchant_id = ${merchantId} LIMIT 1`;
      if (rows?.[0]) return toPartnerMappingRow(rows[0]);
      return null;
    } catch (e) {
      throw e;
    }
  }
  return toPartnerMappingRow(memoryPartnerMerchants.get(merchantId) || null);
}

// Overwrites the last-known-status columns for an existing mapping with
// values freshly fetched from Cashfree. Fields not present in `statusFields`
// are left untouched (not cleared) — a caller normalizing a partial Cashfree
// response should only pass the fields it actually observed. Returns null,
// without writing anything, if no mapping exists for merchantId (callers
// must createPartnerMerchantMapping first; this never creates one).
export async function updatePartnerMerchantStatus(merchantId, statusFields) {
  const fields = ['onboardingStatus', 'kycStatus', 'fullKycStatus', 'activationStatus', 'transactionAccess'];
  const columnFor = {
    onboardingStatus: 'onboarding_status',
    kycStatus: 'kyc_status',
    fullKycStatus: 'full_kyc_status',
    activationStatus: 'activation_status',
    transactionAccess: 'transaction_access'
  };
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePartnerMerchantStore();
      const existing = await sql`SELECT * FROM qivropay_cashfree_partner_merchants WHERE merchant_id = ${merchantId} LIMIT 1`;
      if (!existing?.[0]) return null;
      const merged = { ...existing[0] };
      for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(statusFields || {}, field)) {
          merged[columnFor[field]] = statusFields[field];
        }
      }
      const rows = await sql`
        UPDATE qivropay_cashfree_partner_merchants
        SET onboarding_status = ${merged.onboarding_status},
            kyc_status = ${merged.kyc_status},
            full_kyc_status = ${merged.full_kyc_status},
            activation_status = ${merged.activation_status},
            transaction_access = ${merged.transaction_access},
            updated_at = NOW()
        WHERE merchant_id = ${merchantId}
        RETURNING *
      `;
      return toPartnerMappingRow(rows[0]);
    } catch (e) {
      throw e;
    }
  }
  const existing = memoryPartnerMerchants.get(merchantId);
  if (!existing) return null;
  const updated = { ...existing };
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(statusFields || {}, field)) {
      updated[columnFor[field]] = statusFields[field];
    }
  }
  updated.updated_at = new Date().toISOString();
  memoryPartnerMerchants.set(merchantId, updated);
  persistLocalStore();
  return toPartnerMappingRow(updated);
}

// -------------------------------------------------------------
// PHASE 10.8D: Cashfree Partner merchant CREATION claim.
//
// Distinct from the mapping table's own PRIMARY KEY/UNIQUE constraints
// (which are the actual, authoritative guard against ever persisting two
// rows for one QivroPay merchant or two rows pointing at the same Cashfree
// merchant): this claim exists only to stop two concurrent requests from
// both slipping past the "no mapping yet" check and both firing a real
// POST /merchants call to Cashfree at the same time. It deliberately copies
// the shape of beginRefundClaim/completeRefundClaim/releaseRefundClaim
// above rather than generalizing them — those are tested, load-bearing
// payment-refund primitives that Phase 10.8D must not touch or risk
// regressing. Reuses the existing qivropay_payment_events table (no new
// schema) via a distinct event 'kind', exactly as beginRefundClaim reuses it
// for refund claims.
//
// Cashfree's own uniqueness check on merchant_id (see createOrLinkCashfreeMerchant
// in cashfreePartnerMerchantOnboarding.js, which always sends the QivroPay
// merchant_id itself as the Cashfree merchant_id) is the real cross-process,
// cross-instance backstop this claim cannot fully provide on its own — see
// the extensive comment in that file for how a Cashfree-side 409 on retry is
// treated as "already created, go recover the mapping" rather than a hard
// failure.
const PARTNER_MERCHANT_CREATION_CLAIM_STALE_MS = 3 * 60 * 1000;

export async function beginPartnerMerchantCreationClaim(merchantId) {
  const claimId = `partner_create:${merchantId}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const inserted = await sql`
        INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
        VALUES (${claimId}, 'partner_merchant_creation_claim', ${merchantId}, 'in_flight', ${JSON.stringify({ claimedAt: new Date().toISOString() })}::jsonb)
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `;
      if (inserted.length > 0) return { won: true };
      const reclaimed = await sql`
        UPDATE qivropay_payment_events
        SET status = 'in_flight', payload = ${JSON.stringify({ claimedAt: new Date().toISOString() })}::jsonb
        WHERE event_id = ${claimId}
          AND (
            status = 'failed'
            OR (status = 'in_flight' AND (payload->>'claimedAt')::timestamptz < NOW() - INTERVAL '3 minutes')
          )
        RETURNING event_id
      `;
      if (reclaimed.length > 0) return { won: true };
      return { won: false };
    } catch (e) {
      throw e;
    }
  }
  return withLocalMutex(claimId, () => {
    const existing = memoryEvents.get(claimId);
    if (existing && existing.status === 'in_flight') {
      const claimedAt = existing.payload?.claimedAt ? new Date(existing.payload.claimedAt).getTime() : 0;
      if (Date.now() - claimedAt < PARTNER_MERCHANT_CREATION_CLAIM_STALE_MS) return { won: false };
    }
    memoryEvents.set(claimId, { eventId: claimId, kind: 'partner_merchant_creation_claim', orderId: merchantId, status: 'in_flight', payload: { claimedAt: new Date().toISOString() } });
    persistLocalStore();
    return { won: true };
  });
}

export async function completePartnerMerchantCreationClaim(merchantId) {
  const claimId = `partner_create:${merchantId}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`UPDATE qivropay_payment_events SET status = 'succeeded' WHERE event_id = ${claimId} AND status = 'in_flight'`;
      return;
    } catch (e) { throw e; }
  }
  await withLocalMutex(claimId, () => {
    const existing = memoryEvents.get(claimId);
    if (existing && existing.status === 'in_flight') {
      memoryEvents.set(claimId, { ...existing, status: 'succeeded' });
      persistLocalStore();
    }
  });
}

// Releases a claim that did not end in a persisted mapping, so a legitimate
// retry (the common case: a transient network/timeout error) is not
// permanently blocked. Safe to call even when the underlying Cashfree call
// actually succeeded but the mapping write failed — the retry path in
// createOrLinkCashfreeMerchant() recovers via Cashfree's own 409, not via
// this claim being 'succeeded'.
export async function releasePartnerMerchantCreationClaim(merchantId) {
  const claimId = `partner_create:${merchantId}`;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await sql`UPDATE qivropay_payment_events SET status = 'failed' WHERE event_id = ${claimId} AND status = 'in_flight'`;
      return;
    } catch (e) { throw e; }
  }
  await withLocalMutex(claimId, () => {
    const existing = memoryEvents.get(claimId);
    if (existing && existing.status === 'in_flight') {
      memoryEvents.set(claimId, { ...existing, status: 'failed' });
      persistLocalStore();
    }
  });
}
