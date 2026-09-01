import crypto from 'node:crypto';

// Express example. Mount this route before express.json(), or use express.raw
// for this path so the signature is checked against the exact bytes received.
export function qivropayWebhookHandler({ hasProcessed, markProcessed, fulfill }) {
  return async (req, res) => {
    const timestamp = req.get('x-webhook-timestamp');
    const signature = req.get('x-webhook-signature');
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body || ''), 'utf8');
    const secret = process.env.QIVROPAY_WEBHOOK_SECRET;

    if (!secret || !timestamp || !signature) return res.status(400).json({ received: false });
    if (!Number.isFinite(Number(timestamp)) || Math.abs(Date.now() - Number(timestamp)) > 5 * 60 * 1000) {
      return res.status(400).json({ received: false });
    }

    const expected = crypto.createHmac('sha256', secret)
      .update(`${timestamp}${rawBody.toString('utf8')}`)
      .digest('base64');
    const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!valid) return res.status(401).json({ received: false });

    let event;
    try { event = JSON.parse(rawBody.toString('utf8')); }
    catch { return res.status(400).json({ received: false }); }

    const eventId = req.get('x-idempotency-key') || event.id;
    if (!eventId) return res.status(400).json({ received: false });
    if (await hasProcessed(eventId)) return res.status(200).json({ received: true, duplicate: true });

    await markProcessed(eventId, event);
    if (event.type === 'payment.succeeded' && event.data?.object?.status === 'succeeded') {
      await fulfill({
        transactionId: event.data.object.id,
        customerEmail: event.data.object.customerEmail,
        amount: event.data.object.amount,
        currency: event.data.object.currency
      });
    }
    return res.status(200).json({ received: true, eventId });
  };
}
