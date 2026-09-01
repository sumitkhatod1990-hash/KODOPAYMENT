import { neon } from '@neondatabase/serverless';

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
