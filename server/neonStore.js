import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

let schemaReady;

// In-Memory Fallback Stores
const memoryUsers = new Map();
const memorySessions = new Map();
const memoryEvents = new Map();

function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

function sqlClient() {
  const url = databaseUrl();
  if (!url) return null;
  return neon(url);
}

export async function ensurePaymentStore() {
  const sql = sqlClient();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS qivropay_payment_events (
        event_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        order_id TEXT,
        status TEXT,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.catch((error) => {
      schemaReady = undefined;
      console.warn('Neon payment schema init skipped/failed, using fallback store', error.message);
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
      console.warn('Neon recordPaymentOrder fallback', e.message);
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
      console.warn('Neon getPaymentOrderForSession fallback', e.message);
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
      console.warn('Neon recordCashfreeWebhook fallback', e.message);
    }
  }
  const exists = memoryEvents.has(eventId);
  memoryEvents.set(eventId, { eventId, kind: 'cashfree_webhook', orderId, status, payload: event });
  return !exists;
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

export async function ensureAuthStore() {
  const sql = sqlClient();
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS qivropay_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        password_hash TEXT NOT NULL,
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
  } catch (e) {
    console.warn('Neon auth schema check skipped', e.message);
  }
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
      console.warn('Neon createUser fallback', e.message);
    }
  }
  const user = { id, email, name, company, password_hash, created_at: new Date().toISOString() };
  memoryUsers.set(email.toLowerCase(), user);
  return user;
}

export async function findUserByEmail(email) {
  const normalized = String(email || '').toLowerCase().trim();
  const sql = sqlClient();
  if (sql) {
    try {
      await ensureAuthStore();
      const rows = await sql`SELECT id, email, name, company, password_hash, created_at FROM qivropay_users WHERE email = ${normalized} LIMIT 1`;
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      console.warn('Neon findUserByEmail fallback', e.message);
    }
  }
  return memoryUsers.get(normalized) || null;
}

export function checkUserPassword(password, storedHash) {
  return verifyPassword(password, storedHash);
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
      console.warn('Neon createAuthSession fallback', e.message);
    }
  }
  memorySessions.set(tokenHash, { tokenHash, userId, expiresAt });
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
      console.warn('Neon getUserForSession fallback', e.message);
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
      console.warn('Neon deleteAuthSession fallback', e.message);
    }
  }
  memorySessions.delete(tokenHash);
}
