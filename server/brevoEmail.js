// Brevo Transactional Email Service for QivroPay
// Uses official @getbrevo/brevo Node SDK

import * as Brevo from '@getbrevo/brevo';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSenderConfig() {
  const email = process.env.BREVO_SENDER_EMAIL || 'info@qivropay.com';
  const name = process.env.BREVO_SENDER_NAME || 'QivroPay';
  return { email, name };
}

export function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim());
}

export function createTransactionalEmailsApi(apiKey) {
  const key = apiKey || process.env.BREVO_API_KEY || '';
  if (!key) return null;

  try {
    const BrevoClass = Brevo.BrevoClient || Brevo.default?.BrevoClient;
    if (BrevoClass) {
      const client = new BrevoClass({ apiKey: key });
      if (client?.transactionalEmails) {
        return client.transactionalEmails;
      }
    }

    const ApiClass = Brevo.TransactionalEmailsApi || Brevo.default?.TransactionalEmailsApi;
    const ApiKeysEnum = Brevo.TransactionalEmailsApiApiKeys || Brevo.default?.TransactionalEmailsApiApiKeys;

    if (ApiClass) {
      const apiInstance = new ApiClass();
      if (ApiKeysEnum && ApiKeysEnum.apiKey) {
        apiInstance.setApiKey(ApiKeysEnum.apiKey, key);
      } else if (typeof apiInstance.setApiKey === 'function') {
        apiInstance.setApiKey(0, key);
      }
      return apiInstance;
    }
  } catch (err) {
    console.error('[Brevo] Failed to initialize Brevo TransactionalEmailsApi:', err.message);
  }
  return null;
}

export function buildWelcomeEmailHtml({ email, name }) {
  const safeName = escapeHtml(name || '').trim() || 'there';
  const safeEmail = escapeHtml(email || '').trim();
  const baseUrl = (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to QivroPay</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
    .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0f172a; padding: 32px 40px; text-align: left; }
    .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
    .logo-accent { color: #38bdf8; }
    .content { padding: 40px; }
    h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.3px; }
    p { font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 20px; }
    .btn-container { margin: 32px 0; text-align: left; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
    .notice-box { background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; font-size: 14px; color: #334155; margin-bottom: 28px; }
    .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-text">Qivro<span class="logo-accent">Pay</span></div>
      </div>
      <div class="content">
        <h1>Welcome to QivroPay</h1>
        <p>Hi ${safeName},</p>
        <p>Your QivroPay merchant account is ready.</p>
        <p>From your dashboard, you can complete your business setup, create your first product, generate a shareable payment link, and explore the QivroPay payment infrastructure.</p>
        
        <div class="btn-container">
          <a href="${baseUrl}" class="btn" target="_blank">Get started &rarr;</a>
        </div>

        <div class="notice-box">
          For production payments, complete the required merchant onboarding and activation steps shown in your dashboard.
        </div>

        <p>&mdash; The QivroPay Team</p>
      </div>
      <div class="footer">
        This transactional message was sent to ${safeEmail} regarding your QivroPay account.<br>&copy; QivroPay Payment Infrastructure. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function buildWelcomeEmailText({ email, name }) {
  const safeName = (name || '').trim() || 'there';
  const baseUrl = (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');

  return `Welcome to QivroPay

Hi ${safeName},

Your QivroPay merchant account is ready.

From your dashboard, you can complete your business setup, create your first product, generate a payment link, and explore the QivroPay payment infrastructure.

Get started: ${baseUrl}

For production payments, complete the required merchant onboarding and activation steps shown in your dashboard.

— The QivroPay Team
`;
}

export async function sendWelcomeEmail({ email, name }, options = {}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return { success: false, error: 'Invalid recipient email address' };
  }

  const sender = getSenderConfig();
  const apiKey = options.apiKey || process.env.BREVO_API_KEY || '';

  if (!apiKey || !apiKey.trim()) {
    console.log(`[Brevo] BREVO_API_KEY is not configured; skipping welcome email for ${normalizedEmail}`);
    return { success: false, skipped: true, reason: 'unconfigured' };
  }

  const apiInstance = options.apiInstance || createTransactionalEmailsApi(apiKey);
  if (!apiInstance) {
    console.warn(`[Brevo] Could not create Brevo API instance; skipping welcome email for ${normalizedEmail}`);
    return { success: false, error: 'Brevo API client initialization failed' };
  }

  const htmlContent = buildWelcomeEmailHtml({ email: normalizedEmail, name });
  const textContent = buildWelcomeEmailText({ email: normalizedEmail, name });

  const sendSmtpEmail = {
    sender,
    to: [{ email: normalizedEmail, name: String(name || '').trim() || undefined }],
    subject: 'Welcome to QivroPay',
    htmlContent,
    textContent
  };

  try {
    const result = typeof apiInstance.sendTransacEmail === 'function'
      ? await apiInstance.sendTransacEmail(sendSmtpEmail)
      : await apiInstance.sendTransacEmail?.(sendSmtpEmail);

    console.log(`[Brevo] Welcome email sent successfully to ${normalizedEmail}`);
    return { success: true, messageId: result?.messageId || result?.body?.messageId || 'sent' };
  } catch (error) {
    const errorMessage = error?.response?.body?.message || error?.message || String(error);
    console.error(`[Brevo] Failed to send welcome email to ${normalizedEmail}: ${errorMessage}`);
    return { success: false, error: 'Brevo email delivery failed' };
  }
}
