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
// Phase 2a: Admin and Support persistence memory stores
const memoryAdminUsers = new Map(Object.entries(localStore.adminUsers || {}));
const memoryAdminSessions = new Map(Object.entries(localStore.adminSessions || {}));
const memoryAdminAuditLogs = new Map(Object.entries(localStore.adminAuditLogs || {}));
const memorySupportTickets = new Map(Object.entries(localStore.supportTickets || {}));
const memorySupportChatSessions = new Map(Object.entries(localStore.supportChatSessions || {}));

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
      partnerMerchants: Object.fromEntries(memoryPartnerMerchants),
      adminUsers: Object.fromEntries(memoryAdminUsers),
      adminSessions: Object.fromEntries(memoryAdminSessions),
      adminAuditLogs: Object.fromEntries(memoryAdminAuditLogs),
      supportTickets: Object.fromEntries(memorySupportTickets),
      supportChatSessions: Object.fromEntries(memorySupportChatSessions)
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
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ
        )
      `;
      await sql`
        ALTER TABLE qivropay_checkout_sessions
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS qivropay_checkout_sessions_merchant_idx
          ON qivropay_checkout_sessions (merchant_id, created_at DESC)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS qivropay_resources_global_type_idx
          ON qivropay_resources (resource_type, created_at DESC)
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
      await sql`ALTER TABLE qivropay_users ADD COLUMN IF NOT EXISTS google_sub TEXT`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS qivropay_users_google_sub_key ON qivropay_users (google_sub)`;
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
      const rows = await sql`
        SELECT id, email, name, company, password_hash, google_id, google_sub, created_at
        FROM qivropay_users
        WHERE google_id = ${googleId} OR google_sub = ${googleId}
        LIMIT 1
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
    return null;
  }
  for (const u of memoryUsers.values()) {
    if (u.google_id === googleId || u.google_sub === googleId) return u;
  }
  return null;
}

async function linkGoogleId(userId, googleId) {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`
        UPDATE qivropay_users
        SET google_id = ${googleId}, google_sub = ${googleId}
        WHERE id = ${userId}
        RETURNING id, email, name, company, password_hash, google_id, google_sub, created_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
    return null;
  }
  for (const u of memoryUsers.values()) {
    if (u.id === userId) { u.google_id = googleId; u.google_sub = googleId; persistLocalStore(); return u; }
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
        INSERT INTO qivropay_users (id, email, name, company, password_hash, google_id, google_sub)
        VALUES (${id}, ${email}, ${safeName}, ${''}, ${null}, ${googleId}, ${googleId})
        RETURNING id, email, name, company, password_hash, google_id, google_sub, created_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }
  const user = { id, email, name: safeName, company: '', password_hash: null, google_id: googleId, google_sub: googleId, created_at: new Date().toISOString() };
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

// ---------------------------------------------------------------
// Phase 2a: Admin Platform & Support Store (client.qivropay.com)
// Strict isolation from merchant tables. Uses dedicated tables for
// admin credentials, sessions, audit logging, and customer support.
// ---------------------------------------------------------------

let adminSchemaReady;

export async function ensureAdminStore() {
  const sql = sqlClient();
  if (!sql) return;
  if (!adminSchemaReady) {
    adminSchemaReady = (async () => {
      // 1. Admin Users Table
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_admin_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'read_only',
          status TEXT NOT NULL DEFAULT 'active',
          mfa_secret TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_admin_users_email_idx ON qivropay_admin_users (email)`;

      // 2. Admin Sessions Table
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_admin_sessions (
          token_hash TEXT PRIMARY KEY,
          admin_id TEXT NOT NULL REFERENCES qivropay_admin_users(id) ON DELETE CASCADE,
          ip_address TEXT,
          user_agent TEXT,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_admin_sessions_admin_idx ON qivropay_admin_sessions (admin_id)`;

      // 3. Admin Audit Log Table
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_admin_audit_logs (
          id TEXT PRIMARY KEY,
          admin_id TEXT NOT NULL REFERENCES qivropay_admin_users(id),
          action TEXT NOT NULL,
          target_merchant_id TEXT,
          target_resource_id TEXT,
          details JSONB NOT NULL DEFAULT '{}'::jsonb,
          ip_address TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_admin_audit_logs_created_idx ON qivropay_admin_audit_logs (created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_admin_audit_logs_merchant_idx ON qivropay_admin_audit_logs (target_merchant_id)`;

      // 4. Support Tickets Table (Postgres migration from local JSON)
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_support_tickets (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'General Support',
          message TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'normal',
          status TEXT NOT NULL DEFAULT 'open',
          response_sla TEXT NOT NULL DEFAULT '< 1 hour',
          replies JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_support_tickets_user_idx ON qivropay_support_tickets (user_id, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_support_tickets_status_idx ON qivropay_support_tickets (status, created_at DESC)`;

      // 5. Support Chat Sessions Table
      await sql`
        CREATE TABLE IF NOT EXISTS qivropay_support_chat_sessions (
          id TEXT PRIMARY KEY,
          merchant_id TEXT,
          mode TEXT NOT NULL,
          messages JSONB NOT NULL DEFAULT '[]'::jsonb,
          last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_support_chat_merchant_idx ON qivropay_support_chat_sessions (merchant_id, last_activity_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_support_tickets_priority_idx ON qivropay_support_tickets (priority, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_support_chat_mode_idx ON qivropay_support_chat_sessions (mode, last_activity_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_admin_audit_logs_action_idx ON qivropay_admin_audit_logs (action, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS qivropay_admin_audit_logs_admin_idx ON qivropay_admin_audit_logs (admin_id, created_at DESC)`;
    })().catch((error) => {
      adminSchemaReady = undefined;
      console.error('Neon admin schema init failed:', error.message);
      throw error;
    });
  }
  await adminSchemaReady;
}

export async function createAdminUser({ email, name, password, role = 'read_only', status = 'active' }) {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const rawPassword = String(password || '');
  const safeName = String(name || '').trim();

  if (!normalizedEmail || !rawPassword || !safeName) {
    throw new Error('Email, name, and password are required to create an admin user');
  }
  const id = `adm_${crypto.randomBytes(12).toString('hex')}`;
  const password_hash = hashPassword(rawPassword);
  const now = new Date().toISOString();

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        INSERT INTO qivropay_admin_users (id, email, name, password_hash, role, status, mfa_secret, created_at, updated_at)
        VALUES (${id}, ${normalizedEmail}, ${safeName}, ${password_hash}, ${role}, ${status}, NULL, ${now}, ${now})
        RETURNING id, email, name, role, status, created_at, updated_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }

  if (memoryAdminUsers.has(normalizedEmail)) {
    throw new Error(`Admin user with email ${normalizedEmail} already exists`);
  }

  const admin = {
    id,
    email: normalizedEmail,
    name: safeName,
    password_hash,
    role,
    status,
    mfa_secret: null,
    created_at: now,
    updated_at: now
  };
  memoryAdminUsers.set(normalizedEmail, admin);
  persistLocalStore();
  return { id: admin.id, email: admin.email, name: admin.name, role: admin.role, status: admin.status, created_at: admin.created_at, updated_at: admin.updated_at };
}

export async function findAdminUserByEmail(email) {
  const normalized = String(email || '').toLowerCase().trim();
  if (!normalized) return null;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        SELECT id, email, name, password_hash, role, status, created_at, updated_at
        FROM qivropay_admin_users
        WHERE email = ${normalized}
        LIMIT 1
      `;
      if (rows && rows[0]) return rows[0];
      return null;
    } catch (e) {
      throw e;
    }
  }
  return memoryAdminUsers.get(normalized) || null;
}

export async function findAdminUserById(id) {
  if (!id) return null;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        SELECT id, email, name, role, status, created_at, updated_at
        FROM qivropay_admin_users
        WHERE id = ${id}
        LIMIT 1
      `;
      if (rows && rows[0]) return rows[0];
      return null;
    } catch (e) {
      throw e;
    }
  }
  for (const admin of memoryAdminUsers.values()) {
    if (admin.id === id) {
      return { id: admin.id, email: admin.email, name: admin.name, role: admin.role, status: admin.status, created_at: admin.created_at, updated_at: admin.updated_at };
    }
  }
  return null;
}

export async function listAdminUsers() {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        SELECT id, email, name, role, status, created_at, updated_at
        FROM qivropay_admin_users
        ORDER BY created_at ASC
      `;
      return rows || [];
    } catch (e) {
      throw e;
    }
  }
  return Array.from(memoryAdminUsers.values()).map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    updated_at: u.updated_at
  }));
}

export function checkAdminPassword(password, storedHash) {
  return verifyPassword(password, storedHash);
}

export async function createAdminSession(adminId, { ipAddress = null, userAgent = null } = {}) {
  const token = `adm_tok_${crypto.randomBytes(32).toString('base64url')}`;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(); // 14-day validity
  const now = new Date().toISOString();

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      await sql`
        INSERT INTO qivropay_admin_sessions (token_hash, admin_id, ip_address, user_agent, expires_at, created_at)
        VALUES (${tokenHash}, ${adminId}, ${ipAddress}, ${userAgent}, ${expiresAt}, ${now})
      `;
      return { token, expiresAt };
    } catch (e) {
      throw e;
    }
  }

  memoryAdminSessions.set(tokenHash, {
    tokenHash,
    adminId,
    ipAddress,
    userAgent,
    expiresAt,
    createdAt: now
  });
  persistLocalStore();
  return { token, expiresAt };
}

export async function getAdminUserForSession(token) {
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        SELECT u.id, u.email, u.name, u.role, u.status, u.created_at, u.updated_at
        FROM qivropay_admin_sessions s
        JOIN qivropay_admin_users u ON u.id = s.admin_id
        WHERE s.token_hash = ${tokenHash} AND s.expires_at > NOW()
        LIMIT 1
      `;
      if (rows && rows[0]) return rows[0];
      return null;
    } catch (e) {
      throw e;
    }
  }

  const session = memoryAdminSessions.get(tokenHash);
  if (session && new Date(session.expiresAt) > new Date()) {
    for (const u of memoryAdminUsers.values()) {
      if (u.id === session.adminId) {
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          status: u.status,
          created_at: u.created_at,
          updated_at: u.updated_at
        };
      }
    }
  }
  return null;
}

export async function deleteAdminSession(token) {
  if (!token) return;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      await sql`DELETE FROM qivropay_admin_sessions WHERE token_hash = ${tokenHash}`;
      return;
    } catch (e) {
      throw e;
    }
  }
  memoryAdminSessions.delete(tokenHash);
  persistLocalStore();
}

export async function recordAdminAuditLog({ adminId, action, targetMerchantId = null, targetResourceId = null, details = {}, ipAddress = null }) {
  const id = `aud_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const now = new Date().toISOString();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        INSERT INTO qivropay_admin_audit_logs (id, admin_id, action, target_merchant_id, target_resource_id, details, ip_address, created_at)
        VALUES (${id}, ${adminId}, ${action}, ${targetMerchantId}, ${targetResourceId}, ${JSON.stringify(details)}::jsonb, ${ipAddress}, ${now})
        RETURNING id, admin_id, action, target_merchant_id, target_resource_id, details, ip_address, created_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }

  const logEntry = {
    id,
    admin_id: adminId,
    action,
    target_merchant_id: targetMerchantId,
    target_resource_id: targetResourceId,
    details,
    ip_address: ipAddress,
    created_at: now
  };
  memoryAdminAuditLogs.set(id, logEntry);
  persistLocalStore();
  return logEntry;
}

export async function listAdminAuditLogs({ limit = 50, offset = 0, adminId = null, targetMerchantId = null } = {}) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      if (adminId && targetMerchantId) {
        return await sql`
          SELECT l.*, u.email as admin_email, u.name as admin_name
          FROM qivropay_admin_audit_logs l
          JOIN qivropay_admin_users u ON u.id = l.admin_id
          WHERE l.admin_id = ${adminId} AND l.target_merchant_id = ${targetMerchantId}
          ORDER BY l.created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      } else if (adminId) {
        return await sql`
          SELECT l.*, u.email as admin_email, u.name as admin_name
          FROM qivropay_admin_audit_logs l
          JOIN qivropay_admin_users u ON u.id = l.admin_id
          WHERE l.admin_id = ${adminId}
          ORDER BY l.created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      } else if (targetMerchantId) {
        return await sql`
          SELECT l.*, u.email as admin_email, u.name as admin_name
          FROM qivropay_admin_audit_logs l
          JOIN qivropay_admin_users u ON u.id = l.admin_id
          WHERE l.target_merchant_id = ${targetMerchantId}
          ORDER BY l.created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      } else {
        return await sql`
          SELECT l.*, u.email as admin_email, u.name as admin_name
          FROM qivropay_admin_audit_logs l
          JOIN qivropay_admin_users u ON u.id = l.admin_id
          ORDER BY l.created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      }
    } catch (e) {
      throw e;
    }
  }

  let logs = Array.from(memoryAdminAuditLogs.values());
  if (adminId) logs = logs.filter(l => l.admin_id === adminId);
  if (targetMerchantId) logs = logs.filter(l => l.target_merchant_id === targetMerchantId);

  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return logs.slice(safeOffset, safeOffset + safeLimit).map(l => {
    let admin_email = 'unknown';
    let admin_name = 'Admin';
    for (const u of memoryAdminUsers.values()) {
      if (u.id === l.admin_id) {
        admin_email = u.email;
        admin_name = u.name;
        break;
      }
    }
    return { ...l, admin_email, admin_name };
  });
}

export async function bootstrapAdminUser({ email, password, name = 'Platform Administrator', role = 'super_admin' }) {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const rawPassword = String(password || '');
  if (!normalizedEmail) {
    throw new Error('Explicit admin email is required for bootstrap');
  }
  if (!rawPassword || rawPassword.length < 12) {
    throw new Error('Explicit admin password of at least 12 characters is required for bootstrap');
  }

  const existing = await findAdminUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error(`Admin user with email "${normalizedEmail}" already exists`);
  }

  return await createAdminUser({
    email: normalizedEmail,
    name: String(name || 'Platform Administrator').trim(),
    password: rawPassword,
    role,
    status: 'active'
  });
}

// ---------------------------------------------------------------
// Support Tickets & Chat Persistence
// ---------------------------------------------------------------

export async function createSupportTicket({ userId = null, name, email, subject, category = 'General Support', message, priority = 'normal', responseSLA = '< 1 hour', initialReply = null }) {
  const ticketId = `TICK-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();
  const replies = initialReply ? [initialReply] : [];

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        INSERT INTO qivropay_support_tickets (id, user_id, name, email, subject, category, message, priority, status, response_sla, replies, created_at, updated_at)
        VALUES (${ticketId}, ${userId}, ${name}, ${email}, ${subject}, ${category}, ${message}, ${priority}, 'open', ${responseSLA}, ${JSON.stringify(replies)}::jsonb, ${now}, ${now})
        RETURNING id, user_id, name, email, subject, category, message, priority, status, response_sla, replies, created_at, updated_at
      `;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      throw e;
    }
  }

  const ticket = {
    id: ticketId,
    user_id: userId,
    name,
    email,
    subject,
    category,
    message,
    priority,
    status: 'open',
    response_sla: responseSLA,
    replies,
    created_at: now,
    updated_at: now
  };
  memorySupportTickets.set(ticketId, ticket);
  persistLocalStore();
  return ticket;
}

export async function listSupportTickets({ userId = null, status = null, limit = 50, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      if (userId && status) {
        return await sql`
          SELECT * FROM qivropay_support_tickets
          WHERE (user_id = ${userId} OR email = ${userId}) AND status = ${status}
          ORDER BY created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      } else if (userId) {
        return await sql`
          SELECT * FROM qivropay_support_tickets
          WHERE user_id = ${userId} OR email = ${userId}
          ORDER BY created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      } else if (status) {
        return await sql`
          SELECT * FROM qivropay_support_tickets
          WHERE status = ${status}
          ORDER BY created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      } else {
        return await sql`
          SELECT * FROM qivropay_support_tickets
          ORDER BY created_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      }
    } catch (e) {
      throw e;
    }
  }

  let tickets = Array.from(memorySupportTickets.values());
  if (userId) tickets = tickets.filter(t => t.user_id === userId || t.email === userId);
  if (status) tickets = tickets.filter(t => t.status === status);
  tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return tickets.slice(safeOffset, safeOffset + safeLimit);
}

export async function getSupportTicketById(id) {
  if (!id) return null;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`SELECT * FROM qivropay_support_tickets WHERE id = ${id} LIMIT 1`;
      return rows?.[0] || null;
    } catch (e) {
      throw e;
    }
  }
  return memorySupportTickets.get(id) || null;
}

export async function addSupportTicketReply(ticketId, reply) {
  if (!ticketId || !reply) throw new Error('ticketId and reply are required');
  const now = new Date().toISOString();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const existing = await sql`SELECT replies FROM qivropay_support_tickets WHERE id = ${ticketId} LIMIT 1`;
      if (!existing || !existing[0]) return null;
      const currentReplies = Array.isArray(existing[0].replies) ? existing[0].replies : [];
      currentReplies.push(reply);
      const rows = await sql`
        UPDATE qivropay_support_tickets
        SET replies = ${JSON.stringify(currentReplies)}::jsonb, updated_at = ${now}
        WHERE id = ${ticketId}
        RETURNING *
      `;
      return rows?.[0] || null;
    } catch (e) {
      throw e;
    }
  }

  const ticket = memorySupportTickets.get(ticketId);
  if (!ticket) return null;
  ticket.replies = ticket.replies || [];
  ticket.replies.push(reply);
  ticket.updated_at = now;
  memorySupportTickets.set(ticketId, ticket);
  persistLocalStore();
  return ticket;
}

export async function updateSupportTicketStatus(ticketId, status) {
  if (!ticketId || !status) throw new Error('ticketId and status are required');
  const now = new Date().toISOString();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        UPDATE qivropay_support_tickets
        SET status = ${status}, updated_at = ${now}
        WHERE id = ${ticketId}
        RETURNING *
      `;
      return rows?.[0] || null;
    } catch (e) {
      throw e;
    }
  }

  const ticket = memorySupportTickets.get(ticketId);
  if (!ticket) return null;
  ticket.status = status;
  ticket.updated_at = now;
  memorySupportTickets.set(ticketId, ticket);
  persistLocalStore();
  return ticket;
}

export async function saveSupportChatSession({ sessionId, merchantId = null, mode = 'public', messages = [] }) {
  const sid = sessionId || `chat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        INSERT INTO qivropay_support_chat_sessions (id, merchant_id, mode, messages, last_activity_at, created_at)
        VALUES (${sid}, ${merchantId}, ${mode}, ${JSON.stringify(messages)}::jsonb, ${now}, ${now})
        ON CONFLICT (id) DO UPDATE
        SET messages = ${JSON.stringify(messages)}::jsonb, last_activity_at = ${now}, mode = ${mode}, merchant_id = COALESCE(qivropay_support_chat_sessions.merchant_id, ${merchantId})
        RETURNING *
      `;
      return rows?.[0] || null;
    } catch (e) {
      throw e;
    }
  }

  const existing = memorySupportChatSessions.get(sid);
  const session = {
    id: sid,
    merchant_id: merchantId || existing?.merchant_id || null,
    mode,
    messages,
    last_activity_at: now,
    created_at: existing?.created_at || now
  };
  memorySupportChatSessions.set(sid, session);
  persistLocalStore();
  return session;
}

export async function listSupportChatSessions({ merchantId = null, limit = 50, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      if (merchantId) {
        return await sql`
          SELECT * FROM qivropay_support_chat_sessions
          WHERE merchant_id = ${merchantId}
          ORDER BY last_activity_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      } else {
        return await sql`
          SELECT * FROM qivropay_support_chat_sessions
          ORDER BY last_activity_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `;
      }
    } catch (e) {
      throw e;
    }
  }

  let sessions = Array.from(memorySupportChatSessions.values());
  if (merchantId) sessions = sessions.filter(s => s.merchant_id === merchantId);
  sessions.sort((a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at));
  return sessions.slice(safeOffset, safeOffset + safeLimit);
}

export async function getSupportChatSession(sessionId) {
  if (!sessionId) return null;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`SELECT * FROM qivropay_support_chat_sessions WHERE id = ${sessionId} LIMIT 1`;
      return rows?.[0] || null;
    } catch (e) {
      throw e;
    }
  }
  return memorySupportChatSessions.get(sessionId) || null;
}

// ---------------------------------------------------------------
// Phase 2B: Core Admin Query Primitives & Aggregations
// ---------------------------------------------------------------

export async function findUserById(userId) {
  if (!userId) return null;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`
        SELECT id, email, name, company, google_id, google_sub, created_at
        FROM qivropay_users
        WHERE id = ${userId}
        LIMIT 1
      `;
      if (rows && rows[0]) return rows[0];
      return null;
    } catch (e) {
      throw e;
    }
  }
  for (const u of memoryUsers.values()) {
    if (u.id === userId) {
      return { id: u.id, email: u.email, name: u.name, company: u.company, google_id: u.google_id || null, google_sub: u.google_sub || null, created_at: u.created_at };
    }
  }
  return null;
}

export async function getAdminOverviewStats() {
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      await ensurePaymentStore();
      await ensurePartnerMerchantStore();
      await ensureAdminStore();

      const [merchantsAgg] = await sql`
        SELECT
          COUNT(*)::int as total_merchants,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as new_merchants
        FROM qivropay_users
      `;

      const [txAgg] = await sql`
        SELECT
          COUNT(*)::int as total_transactions,
          COUNT(*) FILTER (WHERE payload->>'status' IN ('succeeded', 'refunded', 'partially_refunded', 'refund_pending'))::int as successful_transactions,
          COUNT(*) FILTER (WHERE payload->>'status' = 'failed')::int as failed_transactions,
          COUNT(*) FILTER (WHERE payload->>'status' IN ('refunded', 'partially_refunded'))::int as refunded_transactions,
          COUNT(*) FILTER (WHERE payload->>'status' = 'refund_pending')::int as refund_pending_transactions,
          COALESCE(SUM(CASE WHEN payload->>'status' IN ('succeeded', 'refunded', 'partially_refunded', 'refund_pending') THEN (payload->>'amount')::numeric ELSE 0 END), 0)::float as total_volume,
          COUNT(DISTINCT merchant_id)::int as active_merchants
        FROM qivropay_resources
        WHERE resource_type = 'transaction'
      `;

      const [onboardingAgg] = await sql`
        SELECT COUNT(*)::int as pending_onboarding
        FROM qivropay_cashfree_partner_merchants
        WHERE onboarding_status IS NULL OR onboarding_status != 'COMPLETED' OR kyc_status != 'APPROVED'
      `;

      const [supportAgg] = await sql`
        SELECT
          COUNT(*) FILTER (WHERE status IN ('open', 'in_progress'))::int as open_tickets
        FROM qivropay_support_tickets
      `;

      const [chatAgg] = await sql`
        SELECT COUNT(*)::int as unresolved_chats
        FROM qivropay_support_chat_sessions
        WHERE last_activity_at >= NOW() - INTERVAL '7 days'
      `;

      const recentSignups = await sql`
        SELECT id, name, email, company, created_at
        FROM qivropay_users
        ORDER BY created_at DESC
        LIMIT 5
      `;

      const recentTxRows = await sql`
        SELECT merchant_id, payload, created_at
        FROM qivropay_resources
        WHERE resource_type = 'transaction'
        ORDER BY created_at DESC
        LIMIT 5
      `;
      const recentTransactions = recentTxRows.map(r => ({
        id: r.payload?.id || r.payload?.orderId,
        merchantId: r.merchant_id,
        amount: Number(r.payload?.amount || 0),
        currency: r.payload?.currency || 'INR',
        status: r.payload?.status || 'unknown',
        createdAt: r.created_at
      }));

      const recentSupportActivity = await sql`
        SELECT id, user_id as merchant_id, email, subject, status, priority, created_at, updated_at
        FROM qivropay_support_tickets
        ORDER BY updated_at DESC
        LIMIT 5
      `;

      return {
        totalMerchants: merchantsAgg?.total_merchants || 0,
        activeMerchants: txAgg?.active_merchants || 0,
        newMerchants: merchantsAgg?.new_merchants || 0,
        merchantsPendingOnboarding: onboardingAgg?.pending_onboarding || 0,
        openSupportTickets: supportAgg?.open_tickets || 0,
        unresolvedSupportChats: chatAgg?.unresolved_chats || 0,
        totalTransactions: txAgg?.total_transactions || 0,
        successfulTransactions: txAgg?.successful_transactions || 0,
        failedTransactions: txAgg?.failed_transactions || 0,
        refundedTransactions: txAgg?.refunded_transactions || 0,
        refundPendingTransactions: txAgg?.refund_pending_transactions || 0,
        totalPaymentVolume: txAgg?.total_volume || 0,
        recentSignups: recentSignups || [],
        recentTransactions: recentTransactions || [],
        recentSupportActivity: recentSupportActivity || []
      };
    } catch (e) {
      throw e;
    }
  }

  // Memory fallback
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

  const usersList = Array.from(memoryUsers.values());
  const totalMerchants = usersList.length;
  const newMerchants = usersList.filter(u => new Date(u.created_at).getTime() >= thirtyDaysAgo).length;

  const allTx = [];
  const activeMerchantSet = new Set();
  for (const [key, val] of memoryResources.entries()) {
    if (key.includes(':transaction:')) {
      const parts = key.split(':');
      const merchantId = parts[0];
      allTx.push({ merchantId, ...val });
      activeMerchantSet.add(merchantId);
    }
  }

  const totalTransactions = allTx.length;
  const successfulTransactions = allTx.filter(t => ['succeeded', 'refunded', 'partially_refunded', 'refund_pending'].includes(t.status)).length;
  const failedTransactions = allTx.filter(t => t.status === 'failed').length;
  const refundedTransactions = allTx.filter(t => ['refunded', 'partially_refunded'].includes(t.status)).length;
  const refundPendingTransactions = allTx.filter(t => t.status === 'refund_pending').length;
  const totalPaymentVolume = allTx.filter(t => ['succeeded', 'refunded', 'partially_refunded', 'refund_pending'].includes(t.status))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const pendingOnboarding = Array.from(memoryPartnerMerchants.values())
    .filter(m => !m.onboarding_status || m.onboarding_status !== 'COMPLETED' || m.kyc_status !== 'APPROVED').length;

  const tickets = Array.from(memorySupportTickets.values());
  const openSupportTickets = tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;

  const chats = Array.from(memorySupportChatSessions.values());
  const unresolvedSupportChats = chats.filter(c => new Date(c.last_activity_at).getTime() >= sevenDaysAgo).length;

  const recentSignups = usersList.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
    .map(u => ({ id: u.id, name: u.name, email: u.email, company: u.company, createdAt: u.created_at }));

  const recentTransactions = allTx.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5)
    .map(t => ({ id: t.id || t.orderId, merchantId: t.merchantId, amount: Number(t.amount || 0), currency: t.currency || 'INR', status: t.status || 'unknown', createdAt: t.createdAt }));

  const recentSupportActivity = tickets.slice().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5)
    .map(t => ({ id: t.id, merchant_id: t.user_id, email: t.email, subject: t.subject, status: t.status, priority: t.priority, created_at: t.created_at, updated_at: t.updated_at }));

  return {
    totalMerchants,
    activeMerchants: activeMerchantSet.size,
    newMerchants,
    merchantsPendingOnboarding: pendingOnboarding,
    openSupportTickets,
    unresolvedSupportChats,
    totalTransactions,
    successfulTransactions,
    failedTransactions,
    refundedTransactions,
    refundPendingTransactions,
    totalPaymentVolume: Number(totalPaymentVolume.toFixed(2)),
    recentSignups,
    recentTransactions,
    recentSupportActivity
  };
}

export async function listAdminClients({ page = 1, pageSize = 25, search = '', status = '', from = null, to = null } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const safeOffset = (safePage - 1) * safeLimit;
  const q = String(search || '').trim().toLowerCase();

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      await ensurePaymentStore();
      await ensurePartnerMerchantStore();

      let query = sql`
        SELECT
          u.id,
          u.name,
          u.email,
          u.company,
          u.created_at,
          COALESCE(pm.onboarding_status, 'NOT_STARTED') as onboarding_status,
          (SELECT MAX(s.created_at) FROM qivropay_auth_sessions s WHERE s.user_id = u.id) as last_login_at,
          (SELECT COUNT(*)::int FROM qivropay_resources r WHERE r.merchant_id = u.id AND r.resource_type = 'transaction') as payment_count,
          (SELECT COALESCE(SUM((r.payload->>'amount')::numeric), 0)::float FROM qivropay_resources r WHERE r.merchant_id = u.id AND r.resource_type = 'transaction' AND r.payload->>'status' IN ('succeeded', 'refunded', 'partially_refunded', 'refund_pending')) as payment_volume
        FROM qivropay_users u
        LEFT JOIN qivropay_cashfree_partner_merchants pm ON pm.merchant_id = u.id
        WHERE 1=1
      `;
      // Fetch all for filter/pagination simplicity across driver differences
      const rows = await sql`
        SELECT
          u.id,
          u.name,
          u.email,
          u.company,
          u.created_at,
          COALESCE(pm.onboarding_status, 'NOT_STARTED') as onboarding_status,
          (SELECT MAX(s.created_at) FROM qivropay_auth_sessions s WHERE s.user_id = u.id) as last_login_at,
          (SELECT COUNT(*)::int FROM qivropay_resources r WHERE r.merchant_id = u.id AND r.resource_type = 'transaction') as payment_count,
          (SELECT COALESCE(SUM((r.payload->>'amount')::numeric), 0)::float FROM qivropay_resources r WHERE r.merchant_id = u.id AND r.resource_type = 'transaction' AND r.payload->>'status' IN ('succeeded', 'refunded', 'partially_refunded', 'refund_pending')) as payment_volume
        FROM qivropay_users u
        LEFT JOIN qivropay_cashfree_partner_merchants pm ON pm.merchant_id = u.id
        ORDER BY u.created_at DESC, u.id DESC
      `;

      let filtered = rows;
      if (q) {
        filtered = filtered.filter(r =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.company.toLowerCase().includes(q)
        );
      }
      if (from) {
        const fromTime = new Date(from).getTime();
        if (!isNaN(fromTime)) filtered = filtered.filter(r => new Date(r.created_at).getTime() >= fromTime);
      }
      if (to) {
        const toTime = new Date(to).getTime();
        if (!isNaN(toTime)) filtered = filtered.filter(r => new Date(r.created_at).getTime() <= toTime);
      }
      if (status && status !== 'all') {
        filtered = filtered.filter(r => r.onboarding_status.toLowerCase() === status.toLowerCase());
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / safeLimit) || 1;
      const paged = filtered.slice(safeOffset, safeOffset + safeLimit).map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        company: r.company,
        createdAt: r.created_at,
        lastLoginAt: r.last_login_at || null,
        status: 'active',
        onboardingStatus: r.onboarding_status,
        paymentCount: r.payment_count || 0,
        paymentVolume: Number((r.payment_volume || 0).toFixed(2))
      }));

      return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
    } catch (e) {
      throw e;
    }
  }

  // Memory fallback
  let users = Array.from(memoryUsers.values()).map(u => {
    const pm = memoryPartnerMerchants.get(u.id);
    let lastLoginAt = null;
    for (const s of memorySessions.values()) {
      if (s.userId === u.id && (!lastLoginAt || new Date(s.createdAt) > new Date(lastLoginAt))) {
        lastLoginAt = s.createdAt;
      }
    }

    let paymentCount = 0;
    let paymentVolume = 0;
    for (const [key, val] of memoryResources.entries()) {
      if (key.startsWith(`${u.id}:transaction:`)) {
        paymentCount += 1;
        if (['succeeded', 'refunded', 'partially_refunded', 'refund_pending'].includes(val.status)) {
          paymentVolume += Number(val.amount || 0);
        }
      }
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company,
      createdAt: u.created_at,
      lastLoginAt,
      status: 'active',
      onboardingStatus: pm?.onboarding_status || 'NOT_STARTED',
      paymentCount,
      paymentVolume: Number(paymentVolume.toFixed(2))
    };
  });

  if (q) {
    users = users.filter(u =>
      String(u.id || '').toLowerCase().includes(q) ||
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q) ||
      String(u.company || '').toLowerCase().includes(q)
    );
  }
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!isNaN(fromTime)) users = users.filter(u => new Date(u.createdAt).getTime() >= fromTime);
  }
  if (to) {
    const toTime = new Date(to).getTime();
    if (!isNaN(toTime)) users = users.filter(u => new Date(u.createdAt).getTime() <= toTime);
  }
  if (status && status !== 'all') {
    users = users.filter(u => u.onboardingStatus.toLowerCase() === status.toLowerCase());
  }

  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = users.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const paged = users.slice(safeOffset, safeOffset + safeLimit);

  return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
}

export async function getAdminClient360(merchantId) {
  if (!merchantId) return null;
  const user = await findUserById(merchantId);
  if (!user) return null;

  const profile = await getResource(merchantId, 'merchant_profile', 'profile');
  const mapping = await getPartnerMerchantMapping(merchantId);
  const transactions = await listResources(merchantId, 'transaction');
  const products = await listResources(merchantId, 'product');
  const customers = await listResources(merchantId, 'customer');
  const tickets = await listSupportTickets({ userId: merchantId, limit: 100 });
  const chats = await listSupportChatSessions({ merchantId, limit: 100 });

  // Get checkout sessions for merchant
  let checkoutSessions = [];
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      const rows = await sql`
        SELECT session_id, merchant_id, payload, status, created_at, expires_at
        FROM qivropay_checkout_sessions
        WHERE merchant_id = ${merchantId}
        ORDER BY created_at DESC
        LIMIT 10
      `;
      checkoutSessions = rows.map(r => ({
        sessionId: r.session_id,
        amount: r.payload?.totalAmount || r.payload?.amount || 0,
        currency: r.payload?.currency || 'INR',
        status: r.status,
        createdAt: r.created_at,
        expiresAt: r.expires_at
      }));
    } catch (e) {
      console.error('Failed to load checkout sessions for 360:', e);
    }
  } else {
    for (const [key, ev] of memoryEvents.entries()) {
      if (key.startsWith('checkout:') && ev.payload?.merchantId === merchantId) {
        checkoutSessions.push({
          sessionId: ev.payload.sessionId,
          amount: ev.payload.totalAmount || ev.payload.amount || 0,
          currency: ev.payload.currency || 'INR',
          status: ev.payload.status || 'open',
          createdAt: ev.payload.createdAt,
          expiresAt: ev.payload.expiresAt || null
        });
      }
    }
    checkoutSessions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    checkoutSessions = checkoutSessions.slice(0, 10);
  }

  // Find last login
  let lastLoginAt = null;
  if (sql) {
    try {
      const rows = await sql`
        SELECT created_at FROM qivropay_auth_sessions
        WHERE user_id = ${merchantId}
        ORDER BY created_at DESC LIMIT 1
      `;
      if (rows?.[0]) lastLoginAt = rows[0].created_at;
    } catch {}
  } else {
    for (const s of memorySessions.values()) {
      if (s.userId === merchantId && (!lastLoginAt || new Date(s.createdAt) > new Date(lastLoginAt))) {
        lastLoginAt = s.createdAt;
      }
    }
  }

  // Payment summary
  const totalCount = transactions.length;
  const successfulCount = transactions.filter(t => t.status === 'succeeded').length;
  const failedCount = transactions.filter(t => t.status === 'failed').length;
  const refundedCount = transactions.filter(t => ['refunded', 'partially_refunded'].includes(t.status)).length;
  const refundPendingCount = transactions.filter(t => t.status === 'refund_pending').length;
  const totalVolume = transactions
    .filter(t => ['succeeded', 'refunded', 'partially_refunded', 'refund_pending'].includes(t.status))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Activity timeline
  const activity = [];
  if (user.created_at) {
    activity.push({
      timestamp: user.created_at,
      type: 'account',
      title: 'Merchant Registered',
      description: `Account created for ${user.email} (${user.company})`
    });
  }
  if (mapping?.created_at) {
    activity.push({
      timestamp: mapping.created_at,
      type: 'onboarding',
      title: 'Cashfree Partner Linked',
      description: `Mapped to Cashfree merchant ${mapping.cf_merchant_id}`
    });
  }
  for (const t of transactions.slice(0, 5)) {
    activity.push({
      timestamp: t.createdAt,
      type: 'payment',
      title: `Payment ${t.status.toUpperCase()}`,
      description: `${t.currency || 'INR'} ${t.amount} — Order ${t.id || t.orderId}`
    });
  }
  for (const tk of tickets.slice(0, 5)) {
    activity.push({
      timestamp: tk.created_at,
      type: 'support',
      title: `Support Ticket: ${tk.subject}`,
      description: `Status: ${tk.status} (${tk.priority} priority)`
    });
  }
  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    account: {
      merchantId: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      phone: profile?.phone || profile?.businessPhone || null,
      website: profile?.website || null,
      signupDate: user.created_at,
      lastLoginAt,
      authProvider: user.google_id ? 'google' : 'email'
    },
    onboarding: {
      hasMapping: Boolean(mapping),
      cfMerchantId: mapping?.cf_merchant_id || null,
      onboardingStatus: mapping?.onboarding_status || 'NOT_STARTED',
      kycStatus: mapping?.kyc_status || null,
      fullKycStatus: mapping?.full_kyc_status || null,
      activationStatus: mapping?.activation_status || null,
      transactionAccess: mapping?.transaction_access || null,
      updatedAt: mapping?.updated_at || null
    },
    payments: {
      summary: {
        totalCount,
        totalVolume: Number(totalVolume.toFixed(2)),
        successfulCount,
        failedCount,
        refundedCount,
        refundPendingCount
      },
      recentTransactions: transactions.slice(0, 10).map(t => ({
        id: t.id || t.orderId,
        orderId: t.orderId || t.id,
        amount: Number(t.amount || 0),
        currency: t.currency || 'INR',
        status: t.status,
        customerEmail: t.customerEmail || '',
        customerName: t.customerName || '',
        paymentMethod: t.paymentMethod || 'cashfree',
        refundedAmount: Number(t.refundedAmount || 0),
        createdAt: t.createdAt
      }))
    },
    products: products.slice(0, 10).map(p => ({
      id: p.id,
      name: p.name || 'Unnamed Product',
      amount: Number(p.price || p.amount || 0),
      currency: p.currency || 'INR',
      status: p.status || 'active',
      createdAt: p.createdAt || p.created_at || null
    })),
    paymentLinks: checkoutSessions,
    customers: {
      totalCustomers: customers.length,
      recentCustomers: customers.slice(0, 10).map(c => ({
        id: c.id,
        name: c.name || 'Customer',
        email: c.email,
        totalSpent: Number(c.totalSpent || 0),
        lastActive: c.lastActive || null
      }))
    },
    support: {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length,
      recentTickets: tickets.slice(0, 10).map(t => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        category: t.category,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }))
    },
    chat: {
      totalSessions: chats.length,
      recentSessions: chats.slice(0, 10).map(c => ({
        id: c.id,
        mode: c.mode,
        messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
        createdAt: c.created_at,
        lastActivityAt: c.last_activity_at
      }))
    },
    activity: activity.slice(0, 20)
  };
}

export async function listAdminPayments({ page = 1, pageSize = 25, merchantId = null, status = null, search = '', minAmount = null, maxAmount = null, from = null, to = null, environment = null } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const safeOffset = (safePage - 1) * safeLimit;
  const q = String(search || '').trim().toLowerCase();

  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await ensureAuthStore();
      const rows = await sql`
        SELECT
          r.resource_id as id,
          r.merchant_id,
          u.name as merchant_name,
          u.email as merchant_email,
          u.company as merchant_company,
          r.payload,
          r.created_at
        FROM qivropay_resources r
        LEFT JOIN qivropay_users u ON u.id = r.merchant_id
        WHERE r.resource_type = 'transaction'
        ORDER BY r.created_at DESC, r.resource_id DESC
      `;

      let filtered = rows.map(r => ({
        id: r.payload?.id || r.payload?.orderId || r.id,
        merchantId: r.merchant_id,
        merchantName: r.merchant_name || 'Merchant',
        merchantEmail: r.merchant_email || '',
        merchantCompany: r.merchant_company || '',
        orderId: r.payload?.orderId || r.payload?.id || r.id,
        amount: Number(r.payload?.amount || 0),
        currency: r.payload?.currency || 'INR',
        status: r.payload?.status || 'unknown',
        customerEmail: r.payload?.customerEmail || '',
        customerName: r.payload?.customerName || '',
        paymentMethod: r.payload?.paymentMethod || 'cashfree',
        refundedAmount: Number(r.payload?.refundedAmount || r.payload?.refundAmount || 0),
        refundStatus: r.payload?.refundStatus || null,
        environment: r.payload?.environment || (r.payload?.liveMode ? 'production' : (r.payload?.mode === 'live' ? 'production' : 'sandbox')),
        createdAt: r.created_at
      }));

      if (merchantId) filtered = filtered.filter(p => p.merchantId === merchantId);
      if (status && status !== 'all') filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
      if (environment && environment !== 'all') filtered = filtered.filter(p => (p.environment || '').toLowerCase() === environment.toLowerCase());
      if (minAmount != null && !isNaN(Number(minAmount))) filtered = filtered.filter(p => p.amount >= Number(minAmount));
      if (maxAmount != null && !isNaN(Number(maxAmount))) filtered = filtered.filter(p => p.amount <= Number(maxAmount));
      if (from) {
        const fromTime = new Date(from).getTime();
        if (!isNaN(fromTime)) filtered = filtered.filter(p => new Date(p.createdAt).getTime() >= fromTime);
      }
      if (to) {
        const toTime = new Date(to).getTime();
        if (!isNaN(toTime)) filtered = filtered.filter(p => new Date(p.createdAt).getTime() <= toTime);
      }
      if (q) {
        filtered = filtered.filter(p =>
          String(p.id).toLowerCase().includes(q) ||
          String(p.orderId).toLowerCase().includes(q) ||
          String(p.customerEmail).toLowerCase().includes(q) ||
          String(p.customerName).toLowerCase().includes(q) ||
          String(p.merchantName).toLowerCase().includes(q) ||
          String(p.merchantCompany).toLowerCase().includes(q) ||
          String(p.merchantId).toLowerCase().includes(q)
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / safeLimit) || 1;
      const paged = filtered.slice(safeOffset, safeOffset + safeLimit);

      return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
    } catch (e) {
      throw e;
    }
  }

  // Memory fallback
  const allPayments = [];
  for (const [key, val] of memoryResources.entries()) {
    if (key.includes(':transaction:')) {
      const merchantIdPart = key.split(':')[0];
      const u = memoryUsers.get(merchantIdPart) || Array.from(memoryUsers.values()).find(user => user.id === merchantIdPart);
      allPayments.push({
        id: val.id || val.orderId,
        merchantId: merchantIdPart,
        merchantName: u?.name || 'Merchant',
        merchantEmail: u?.email || '',
        merchantCompany: u?.company || '',
        orderId: val.orderId || val.id,
        amount: Number(val.amount || 0),
        currency: val.currency || 'INR',
        status: val.status || 'unknown',
        customerEmail: val.customerEmail || '',
        customerName: val.customerName || '',
        paymentMethod: val.paymentMethod || 'cashfree',
        refundedAmount: Number(val.refundedAmount || val.refundAmount || 0),
        refundStatus: val.refundStatus || null,
        environment: val.environment || (val.liveMode ? 'production' : (val.mode === 'live' ? 'production' : 'sandbox')),
        createdAt: val.createdAt || new Date().toISOString()
      });
    }
  }

  let filtered = allPayments;
  if (merchantId) filtered = filtered.filter(p => p.merchantId === merchantId);
  if (status && status !== 'all') filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
  if (environment && environment !== 'all') filtered = filtered.filter(p => (p.environment || '').toLowerCase() === environment.toLowerCase());
  if (minAmount != null && !isNaN(Number(minAmount))) filtered = filtered.filter(p => p.amount >= Number(minAmount));
  if (maxAmount != null && !isNaN(Number(maxAmount))) filtered = filtered.filter(p => p.amount <= Number(maxAmount));
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!isNaN(fromTime)) filtered = filtered.filter(p => new Date(p.createdAt).getTime() >= fromTime);
  }
  if (to) {
    const toTime = new Date(to).getTime();
    if (!isNaN(toTime)) filtered = filtered.filter(p => new Date(p.createdAt).getTime() <= toTime);
  }
  if (q) {
    filtered = filtered.filter(p =>
      String(p.id).toLowerCase().includes(q) ||
      String(p.orderId).toLowerCase().includes(q) ||
      String(p.customerEmail).toLowerCase().includes(q) ||
      String(p.customerName).toLowerCase().includes(q) ||
      String(p.merchantName).toLowerCase().includes(q) ||
      String(p.merchantCompany).toLowerCase().includes(q) ||
      String(p.merchantId).toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = filtered.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const paged = filtered.slice(safeOffset, safeOffset + safeLimit);

  return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
}

export async function getAdminPaymentById(paymentId) {
  if (!paymentId) return null;
  const rawId = String(paymentId).trim();

  let transactionRow = null;
  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePaymentStore();
      await ensureAuthStore();
      const rows = await sql`
        SELECT
          r.resource_id as id,
          r.merchant_id,
          u.name as merchant_name,
          u.email as merchant_email,
          u.company as merchant_company,
          r.payload,
          r.created_at
        FROM qivropay_resources r
        LEFT JOIN qivropay_users u ON u.id = r.merchant_id
        WHERE r.resource_type = 'transaction'
          AND (r.resource_id = ${rawId} OR r.payload->>'id' = ${rawId} OR r.payload->>'orderId' = ${rawId})
        LIMIT 1
      `;
      if (rows && rows[0]) {
        transactionRow = rows[0];
      }
    } catch (e) {
      throw e;
    }
  }

  if (!transactionRow) {
    for (const [key, val] of memoryResources.entries()) {
      if (key.includes(':transaction:')) {
        const resourceId = key.split(':')[2];
        if (resourceId === rawId || val.id === rawId || val.orderId === rawId) {
          const merchantIdPart = key.split(':')[0];
          const u = memoryUsers.get(merchantIdPart) || Array.from(memoryUsers.values()).find(user => user.id === merchantIdPart);
          transactionRow = {
            id: val.id || val.orderId || resourceId,
            merchant_id: merchantIdPart,
            merchant_name: u?.name || 'Merchant',
            merchant_email: u?.email || '',
            merchant_company: u?.company || '',
            payload: val,
            created_at: val.createdAt || new Date().toISOString()
          };
          break;
        }
      }
    }
  }

  if (!transactionRow) return null;

  const p = transactionRow.payload || {};
  const merchantId = transactionRow.merchant_id;
  const orderId = p.orderId || p.id || transactionRow.id;
  const amount = Number(p.amount || 0);
  const currency = p.currency || 'INR';
  const status = p.status || 'unknown';
  const createdAt = p.createdAt || transactionRow.created_at;
  const environment = p.environment || (p.liveMode ? 'production' : (p.mode === 'live' ? 'production' : 'sandbox'));

  // Merchant details
  const merchant = {
    id: merchantId,
    name: transactionRow.merchant_name || 'Merchant',
    email: transactionRow.merchant_email || '',
    company: transactionRow.merchant_company || null
  };

  // Customer details
  const customer = {
    name: p.customerName || null,
    email: p.customerEmail || null,
    phone: p.customerPhone || null
  };

  // Cashfree / Gateway processing references
  const processing = {
    cfOrderId: p.cfOrderId || p.orderId || null,
    cfPaymentId: p.cfPaymentId || p.paymentId || null,
    paymentMethod: p.paymentMethod || 'cashfree',
    gatewayStatus: p.gatewayStatus || p.status || null,
    bankReference: p.bankReference || p.referenceId || null
  };

  // Refund details (only if exists)
  let refund = null;
  const hasRefund = Number(p.refundedAmount || p.refundAmount || 0) > 0 || Boolean(p.refundId) || Boolean(p.refundStatus) || ['refunded', 'partially_refunded', 'refund_pending'].includes(status);
  if (hasRefund) {
    refund = {
      hasRefund: true,
      refundId: p.refundId || null,
      amount: Number(p.refundedAmount || p.refundAmount || 0),
      status: p.refundStatus || (status === 'refund_pending' ? 'PENDING' : (status === 'partially_refunded' ? 'PARTIALLY_REFUNDED' : 'SUCCESS')),
      note: p.refundNote || null,
      refundedAt: p.refundedAt || p.updatedAt || null
    };
  }

  // Settlement details (only if exists)
  let settlement = null;
  const line = await getResource(merchantId, 'cf_settlement_line', orderId);
  if (line?.cfSettlementId) {
    const s = await getResource(merchantId, 'cf_settlement', line.cfSettlementId);
    if (s) {
      settlement = {
        cfSettlementId: s.id || line.cfSettlementId,
        status: s.status,
        settlementUtr: s.settlementUtr || null,
        settlementCurrency: s.settlementCurrency || 'INR',
        settlementType: s.settlementType || null,
        settlementInitiatedOn: s.settlementInitiatedOn || null,
        settlementProcessedOn: s.settlementProcessedOn || null,
        updatedAt: s.fetchedAt || s.updatedAt || null
      };
    }
  }

  // Reconciliation details (only if exists)
  let reconciliation = null;
  const recon = await getResource(merchantId, 'payment_reconciliation', orderId);
  if (recon) {
    reconciliation = {
      state: recon.state,
      discrepancy: recon.discrepancy || null,
      lastCheckedAt: recon.lastCheckedAt || null
    };
  }

  // Related support tickets
  let relatedTicket = null;
  const tickets = await listSupportTickets({ userId: merchantId, limit: 20 });
  if (Array.isArray(tickets) && tickets.length > 0) {
    const matching = tickets.find(t =>
      (t.subject && t.subject.includes(orderId)) ||
      (t.message && t.message.includes(orderId))
    );
    const chosen = matching || tickets[0];
    if (chosen) {
      relatedTicket = {
        id: chosen.id,
        subject: chosen.subject,
        status: chosen.status,
        priority: chosen.priority,
        createdAt: chosen.created_at
      };
    }
  }

  return {
    id: transactionRow.id,
    orderId,
    amount,
    currency,
    status,
    createdAt,
    environment,
    merchant,
    customer,
    processing,
    refund,
    settlement,
    reconciliation,
    relatedTicket
  };
}

export async function listAdminOnboarding({ page = 1, pageSize = 25, onboardingStatus = null, kycStatus = null, activationStatus = null } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const safeOffset = (safePage - 1) * safeLimit;

  const sql = sqlClient();
  if (sql) {
    try {
      await ensurePartnerMerchantStore();
      await ensureAuthStore();

      const rows = await sql`
        SELECT
          m.merchant_id,
          u.name as merchant_name,
          u.email as merchant_email,
          m.cf_merchant_id,
          m.onboarding_status,
          m.kyc_status,
          m.full_kyc_status,
          m.activation_status,
          m.transaction_access,
          m.created_at,
          m.updated_at
        FROM qivropay_cashfree_partner_merchants m
        LEFT JOIN qivropay_users u ON u.id = m.merchant_id
        ORDER BY m.updated_at DESC
      `;

      let filtered = rows;
      if (onboardingStatus && onboardingStatus !== 'all') {
        filtered = filtered.filter(r => (r.onboarding_status || '').toLowerCase() === onboardingStatus.toLowerCase());
      }
      if (kycStatus && kycStatus !== 'all') {
        filtered = filtered.filter(r => (r.kyc_status || '').toLowerCase() === kycStatus.toLowerCase());
      }
      if (activationStatus && activationStatus !== 'all') {
        filtered = filtered.filter(r => (r.activation_status || '').toLowerCase() === activationStatus.toLowerCase());
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / safeLimit) || 1;
      const paged = filtered.slice(safeOffset, safeOffset + safeLimit).map(r => ({
        merchantId: r.merchant_id,
        merchantName: r.merchant_name || 'Merchant',
        merchantEmail: r.merchant_email || '',
        cfMerchantId: r.cf_merchant_id,
        onboardingStatus: r.onboarding_status || 'NOT_STARTED',
        kycStatus: r.kyc_status || null,
        fullKycStatus: r.full_kyc_status || null,
        activationStatus: r.activation_status || null,
        transactionAccess: r.transaction_access || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
    } catch (e) {
      throw e;
    }
  }

  // Memory fallback
  let list = Array.from(memoryPartnerMerchants.values()).map(m => {
    const u = memoryUsers.get(m.merchant_id) || Array.from(memoryUsers.values()).find(user => user.id === m.merchant_id);
    return {
      merchantId: m.merchant_id,
      merchantName: u?.name || 'Merchant',
      merchantEmail: u?.email || '',
      cfMerchantId: m.cf_merchant_id,
      onboardingStatus: m.onboarding_status || 'NOT_STARTED',
      kycStatus: m.kyc_status || null,
      fullKycStatus: m.full_kyc_status || null,
      activationStatus: m.activation_status || null,
      transactionAccess: m.transaction_access || null,
      createdAt: m.created_at,
      updatedAt: m.updated_at
    };
  });

  if (onboardingStatus && onboardingStatus !== 'all') {
    list = list.filter(r => (r.onboardingStatus || '').toLowerCase() === onboardingStatus.toLowerCase());
  }
  if (kycStatus && kycStatus !== 'all') {
    list = list.filter(r => (r.kycStatus || '').toLowerCase() === kycStatus.toLowerCase());
  }
  if (activationStatus && activationStatus !== 'all') {
    list = list.filter(r => (r.activationStatus || '').toLowerCase() === activationStatus.toLowerCase());
  }

  list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const total = list.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const paged = list.slice(safeOffset, safeOffset + safeLimit);

  return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
}

export async function listAdminAuditLogsFiltered({ page = 1, pageSize = 25, adminId = null, action = null, targetMerchantId = null, from = null, to = null } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const safeOffset = (safePage - 1) * safeLimit;

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        SELECT
          l.id,
          l.admin_id,
          u.name as admin_name,
          u.email as admin_email,
          u.role as admin_role,
          l.action,
          l.target_merchant_id,
          l.target_resource_id,
          l.details,
          l.ip_address,
          l.created_at
        FROM qivropay_admin_audit_logs l
        LEFT JOIN qivropay_admin_users u ON u.id = l.admin_id
        ORDER BY l.created_at DESC
      `;

      let filtered = rows;
      if (adminId) filtered = filtered.filter(l => l.admin_id === adminId);
      if (action) filtered = filtered.filter(l => l.action.toLowerCase() === action.toLowerCase());
      if (targetMerchantId) filtered = filtered.filter(l => l.target_merchant_id === targetMerchantId);
      if (from) {
        const fromTime = new Date(from).getTime();
        if (!isNaN(fromTime)) filtered = filtered.filter(l => new Date(l.created_at).getTime() >= fromTime);
      }
      if (to) {
        const toTime = new Date(to).getTime();
        if (!isNaN(toTime)) filtered = filtered.filter(l => new Date(l.created_at).getTime() <= toTime);
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / safeLimit) || 1;
      const paged = filtered.slice(safeOffset, safeOffset + safeLimit).map(l => ({
        id: l.id,
        adminId: l.admin_id,
        adminName: l.admin_name || 'Admin',
        adminEmail: l.admin_email || 'admin@qivropay.internal',
        adminRole: l.admin_role || 'super_admin',
        action: l.action,
        targetMerchantId: l.target_merchant_id,
        targetResourceId: l.target_resource_id,
        details: l.details || {},
        ipAddress: l.ip_address,
        createdAt: l.created_at
      }));

      return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
    } catch (e) {
      throw e;
    }
  }

  // Memory fallback
  let logs = Array.from(memoryAdminAuditLogs.values()).map(l => {
    let admin_email = 'unknown';
    let admin_name = 'Admin';
    let admin_role = 'super_admin';
    for (const u of memoryAdminUsers.values()) {
      if (u.id === l.admin_id) {
        admin_email = u.email;
        admin_name = u.name;
        admin_role = u.role;
        break;
      }
    }
    return {
      id: l.id,
      adminId: l.admin_id,
      adminName: admin_name,
      adminEmail: admin_email,
      adminRole: admin_role,
      action: l.action,
      targetMerchantId: l.target_merchant_id,
      targetResourceId: l.target_resource_id,
      details: l.details || {},
      ipAddress: l.ip_address,
      createdAt: l.created_at
    };
  });

  if (adminId) logs = logs.filter(l => l.adminId === adminId);
  if (action) logs = logs.filter(l => l.action.toLowerCase() === action.toLowerCase());
  if (targetMerchantId) logs = logs.filter(l => l.targetMerchantId === targetMerchantId);
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!isNaN(fromTime)) logs = logs.filter(l => new Date(l.createdAt).getTime() >= fromTime);
  }
  if (to) {
    const toTime = new Date(to).getTime();
    if (!isNaN(toTime)) logs = logs.filter(l => new Date(l.createdAt).getTime() <= toTime);
  }

  logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = logs.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const paged = logs.slice(safeOffset, safeOffset + safeLimit);

  return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
}

export async function listAdminTicketsFiltered({ page = 1, pageSize = 25, search = '', status = null, priority = null, merchantId = null, from = null, to = null } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const safeOffset = (safePage - 1) * safeLimit;
  const q = String(search || '').trim().toLowerCase();

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        SELECT * FROM qivropay_support_tickets
        ORDER BY created_at DESC
      `;

      let filtered = rows;
      if (merchantId) filtered = filtered.filter(t => t.user_id === merchantId || t.email === merchantId);
      if (status && status !== 'all') filtered = filtered.filter(t => t.status.toLowerCase() === status.toLowerCase());
      if (priority && priority !== 'all') filtered = filtered.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
      if (from) {
        const fromTime = new Date(from).getTime();
        if (!isNaN(fromTime)) filtered = filtered.filter(t => new Date(t.created_at).getTime() >= fromTime);
      }
      if (to) {
        const toTime = new Date(to).getTime();
        if (!isNaN(toTime)) filtered = filtered.filter(t => new Date(t.created_at).getTime() <= toTime);
      }
      if (q) {
        filtered = filtered.filter(t =>
          String(t.id).toLowerCase().includes(q) ||
          String(t.subject).toLowerCase().includes(q) ||
          String(t.email).toLowerCase().includes(q) ||
          String(t.name).toLowerCase().includes(q)
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / safeLimit) || 1;
      const paged = filtered.slice(safeOffset, safeOffset + safeLimit);

      return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
    } catch (e) {
      throw e;
    }
  }

  // Memory fallback
  let tickets = Array.from(memorySupportTickets.values());
  if (merchantId) tickets = tickets.filter(t => t.user_id === merchantId || t.email === merchantId);
  if (status && status !== 'all') tickets = tickets.filter(t => t.status.toLowerCase() === status.toLowerCase());
  if (priority && priority !== 'all') tickets = tickets.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!isNaN(fromTime)) tickets = tickets.filter(t => new Date(t.created_at).getTime() >= fromTime);
  }
  if (to) {
    const toTime = new Date(to).getTime();
    if (!isNaN(toTime)) tickets = tickets.filter(t => new Date(t.created_at).getTime() <= toTime);
  }
  if (q) {
    tickets = tickets.filter(t =>
      String(t.id).toLowerCase().includes(q) ||
      String(t.subject).toLowerCase().includes(q) ||
      String(t.email).toLowerCase().includes(q) ||
      String(t.name).toLowerCase().includes(q)
    );
  }

  tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = tickets.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const paged = tickets.slice(safeOffset, safeOffset + safeLimit);

  return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
}

export async function updateSupportTicketPriority(ticketId, priority) {
  if (!ticketId || !priority) throw new Error('ticketId and priority are required');
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    throw new Error(`Invalid priority: must be one of ${validPriorities.join(', ')}`);
  }

  const now = new Date().toISOString();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        UPDATE qivropay_support_tickets
        SET priority = ${priority}, updated_at = ${now}
        WHERE id = ${ticketId}
        RETURNING *
      `;
      return rows?.[0] || null;
    } catch (e) {
      throw e;
    }
  }

  const ticket = memorySupportTickets.get(ticketId);
  if (!ticket) return null;
  ticket.priority = priority;
  ticket.updated_at = now;
  memorySupportTickets.set(ticketId, ticket);
  persistLocalStore();
  return ticket;
}

export async function listAdminChatLogs({ page = 1, pageSize = 25, merchantId = null, mode = null, from = null, to = null, search = '' } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const safeOffset = (safePage - 1) * safeLimit;
  const q = String(search || '').trim().toLowerCase();

  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAdminStore();
      const rows = await sql`
        SELECT id, merchant_id, mode, messages, last_activity_at, created_at
        FROM qivropay_support_chat_sessions
        ORDER BY last_activity_at DESC
      `;

      let filtered = rows.map(r => ({
        id: r.id,
        merchantId: r.merchant_id,
        mode: r.mode,
        messageCount: Array.isArray(r.messages) ? r.messages.length : 0,
        createdAt: r.created_at,
        lastActivityAt: r.last_activity_at
      }));

      if (merchantId) filtered = filtered.filter(c => c.merchantId === merchantId);
      if (mode && mode !== 'all') filtered = filtered.filter(c => c.mode.toLowerCase() === mode.toLowerCase());
      if (from) {
        const fromTime = new Date(from).getTime();
        if (!isNaN(fromTime)) filtered = filtered.filter(c => new Date(c.createdAt).getTime() >= fromTime);
      }
      if (to) {
        const toTime = new Date(to).getTime();
        if (!isNaN(toTime)) filtered = filtered.filter(c => new Date(c.createdAt).getTime() <= toTime);
      }
      if (q) filtered = filtered.filter(c => c.id.toLowerCase().includes(q) || String(c.merchantId || '').toLowerCase().includes(q));

      const total = filtered.length;
      const totalPages = Math.ceil(total / safeLimit) || 1;
      const paged = filtered.slice(safeOffset, safeOffset + safeLimit);

      return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
    } catch (e) {
      throw e;
    }
  }

  // Memory fallback
  let chats = Array.from(memorySupportChatSessions.values()).map(c => ({
    id: c.id,
    merchantId: c.merchant_id,
    mode: c.mode,
    messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
    createdAt: c.created_at,
    lastActivityAt: c.last_activity_at
  }));

  if (merchantId) chats = chats.filter(c => c.merchantId === merchantId);
  if (mode && mode !== 'all') chats = chats.filter(c => c.mode.toLowerCase() === mode.toLowerCase());
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!isNaN(fromTime)) chats = chats.filter(c => new Date(c.createdAt).getTime() >= fromTime);
  }
  if (to) {
    const toTime = new Date(to).getTime();
    if (!isNaN(toTime)) chats = chats.filter(c => new Date(c.createdAt).getTime() <= toTime);
  }
  if (q) chats = chats.filter(c => c.id.toLowerCase().includes(q) || String(c.merchantId || '').toLowerCase().includes(q));

  chats.sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
  const total = chats.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const paged = chats.slice(safeOffset, safeOffset + safeLimit);

  return { data: paged, pagination: { page: safePage, pageSize: safeLimit, total, totalPages } };
}
