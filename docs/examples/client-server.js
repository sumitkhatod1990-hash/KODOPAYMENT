import express from 'express';
import { qivropayWebhookHandler } from './qivropay-webhook.js';

const app = express();
const QIVROPAY_URL = 'https://qivropay.com';

// Keep the raw body for webhook signature verification.
app.post('/webhooks/qivropay', express.raw({ type: 'application/json' }), qivropayWebhookHandler({
  hasProcessed: async (eventId) => false, // replace with a database lookup
  markProcessed: async (eventId, event) => { console.log('processed', eventId, event.type); },
  fulfill: async ({ transactionId, customerEmail }) => {
    // Deliver credits/product idempotently in your database.
    console.log('fulfill', transactionId, customerEmail);
  }
}));

app.use(express.json());

app.post('/buy', async (req, res) => {
  const response = await fetch(`${QIVROPAY_URL}/api/v1/payments/create-session`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.QIVROPAY_SECRET_KEY}`
    },
    body: JSON.stringify({
      amount: Number(req.body.amount),
      currency: 'INR',
      title: req.body.title || 'Client product',
      credits: Number(req.body.credits || 0),
      customerEmail: req.body.customerEmail || ''
    })
  });
  const data = await response.json();
  if (!response.ok || !data.success) return res.status(502).json({ error: 'QivroPay session creation failed' });
  return res.json({ checkoutUrl: data.url, sessionId: data.sessionId });
});

app.listen(process.env.PORT || 3001, () => console.log('Client integration server ready'));
