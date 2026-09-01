import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

let schemaReady;

function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

function sqlClient() {
  const url = databaseUrl();
  if (!url) throw new Error('DATABASE_URL is not configured');
  return neon(url);
}

export async function ensurePaymentStore() {
  if (!schemaReady) {
    const sql = sqlClient();
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
      throw error;
    });
  }
  await schemaReady;
}

export async function recordPaymentOrder(order) {
  await ensurePaymentStore();
  const sql = sqlClient();
  await sql`
    INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
    VALUES (${`order:${order.orderId}`}, 'order_created', ${order.orderId}, ${order.orderStatus || 'ACTIVE'}, ${JSON.stringify(order)}::jsonb)
    ON CONFLICT (event_id) DO NOTHING
  `;
}

export async function getPaymentOrderForSession(sessionToken) {
  await ensurePaymentStore();
  const sql = sqlClient();
  const rows = await sql`
    SELECT payload FROM qivropay_payment_events
    WHERE kind = 'order_created' AND payload->>'sessionToken' = ${String(sessionToken || '')}
    ORDER BY created_at DESC LIMIT 1
  `;
  return rows[0]?.payload || null;
}

export async function recordCashfreeWebhook(eventId, event) {
  await ensurePaymentStore();
  const sql = sqlClient();
  const orderId = event?.data?.order?.order_id || event?.data?.order_id || event?.order_id || null;
  const status = event?.type || event?.event || event?.data?.payment?.payment_status || null;
  const rows = await sql`
    INSERT INTO qivropay_payment_events (event_id, kind, order_id, status, payload)
    VALUES (${eventId}, 'cashfree_webhook', ${orderId}, ${status}, ${JSON.stringify(event)}::jsonb)
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id
  `;
  return rows.length > 0;
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
}

export async function createUser({ email, name, company, password }) {
  await ensureAuthStore();
  const sql = sqlClient();
  const id = `usr_${crypto.randomBytes(12).toString('hex')}`;
  const rows = await sql`
    INSERT INTO qivropay_users (id, email, name, company, password_hash)
    VALUES (${id}, ${email}, ${name}, ${company}, ${hashPassword(password)})
    RETURNING id, email, name, company, created_at
  `;
  return rows[0] || null;
}

export async function findUserByEmail(email) {
  await ensureAuthStore();
  const sql = sqlClient();
  const rows = await sql`SELECT id, email, name, company, password_hash, created_at FROM qivropay_users WHERE email = ${email} LIMIT 1`;
  return rows[0] || null;
}

export function checkUserPassword(password, storedHash) {
  return verifyPassword(password, storedHash);
}

export async function createAuthSession(userId) {
  await ensureAuthStore();
  const sql = sqlClient();
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  await sql`INSERT INTO qivropay_auth_sessions (token_hash, user_id, expires_at) VALUES (${tokenHash}, ${userId}, ${expiresAt})`;
  return { token, expiresAt };
}

export async function getUserForSession(token) {
  if (!token) return null;
  await ensureAuthStore();
  const sql = sqlClient();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const rows = await sql`
    SELECT u.id, u.email, u.name, u.company, u.created_at
    FROM qivropay_auth_sessions s JOIN qivropay_users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash} AND s.expires_at > NOW() LIMIT 1
  `;
  return rows[0] || null;
}

export async function deleteAuthSession(token) {
  if (!token) return;
  await ensureAuthStore();
  const sql = sqlClient();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await sql`DELETE FROM qivropay_auth_sessions WHERE token_hash = ${tokenHash}`;
}
