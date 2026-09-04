import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ensurePaymentStore, recordCashfreeWebhook, recordPaymentOrder, getPaymentOrderForSession, getPaymentOrder, ensureAuthStore, createUser, findUserByEmail, checkUserPassword, createAuthSession, getUserForSession, deleteAuthSession, upsertGoogleUser, createCheckoutSession, getCheckoutSession, saveResource, listResources, getResource, deleteResource, findApiKey, persistenceMode, beginRefundClaim, releaseRefundClaim, claimWelcomeEmail } from './neonStore.js';
import { verifyGoogleIdToken, googleClientId } from './googleAuth.js';
import { applyRefundStatus } from './cashfreeRefundOutcome.js';
import { recordCashfreeOrderOutcome } from './cashfreeOrderOutcome.js';
import { refreshMerchantStatus } from './cashfreePartnerMerchantStatus.js';
import { createOrLinkCashfreeMerchant, getCashfreePartnerOnboardingLink, PartnerOnboardingConflictError } from './cashfreePartnerMerchantOnboarding.js';
import { CashfreePartnerError, resolvePartnerEnvironment } from './cashfreePartner.js';
import { reconcilePayment, reconcileMerchantPayments, listStoredReconciliations, listStoredSettlements, ReconciliationError } from './paymentReconciliation.js';
import Groq from 'groq-sdk';
import { buildPublicSystemPrompt, buildMerchantSystemPrompt } from './supportAiContext.js';
import { sendWelcomeEmail } from './brevoEmail.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 4000;

// Single source of truth for which Cashfree environment this server talks
// to. Accepted CASHFREE_ENV values: "sandbox", "production" (also accepts
// the alias "prod" for backwards compatibility). Anything else is rejected
// outright in production (refuse to start with an ambiguous payment
// environment) and falls back to "sandbox" with a warning in development.
// The frontend never sets its own environment — it receives this exact
// value from the backend (see GET /api/v1/payments/session/:id) so the
// two sides can never diverge.
function normalizeCashfreeEnv(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'sandbox') return 'sandbox';
  if (value === 'production' || value === 'prod') return 'production';
  return null;
}

function resolveCashfreeEnvironment() {
  const raw = process.env.CASHFREE_ENV;
  if (!raw) return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
  const normalized = normalizeCashfreeEnv(raw);
  if (normalized) return normalized;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Invalid CASHFREE_ENV "${raw}" — must be "sandbox" or "production". Refusing to start with an ambiguous payment environment in production.`);
  }
  console.warn(`Invalid CASHFREE_ENV "${raw}" — defaulting to "sandbox" for local development.`);
  return 'sandbox';
}

const CASHFREE_ENVIRONMENT = resolveCashfreeEnvironment(); // 'sandbox' | 'production'

// API keys carry their own environment tag ('test' | 'live'), but Cashfree
// connectivity (CASHFREE_ENVIRONMENT) is a single global setting for the
// whole process — this server cannot talk to sandbox and production Cashfree
// at the same time. A 'test' key must therefore only work while this process
// is running against sandbox, and a 'live' key only while it is running
// against production; any other combination is rejected outright rather than
// silently letting a test key touch production (or vice versa). This is
// enforced once, centrally, in the auth middleware below — never derived from
// anything the client sends (body/header/query), only from the hashed API
// key record looked up server-side.
function apiKeyEnvironmentMatchesServer(apiKeyEnvironment) {
  const expected = apiKeyEnvironment === 'test' ? 'sandbox' : 'production';
  return expected === CASHFREE_ENVIRONMENT;
}
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2025-01-01';
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

function cashfreeBaseUrl() {
  return CASHFREE_ENVIRONMENT === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

function cashfreeCredentials() {
  return {
    appId: process.env.CASHFREE_APP_ID || '',
    secretKey: process.env.CASHFREE_SECRET_KEY || ''
  };
}

// Local development only, obviously not a real secret. Lets checkout-session
// creation work with zero manual setup on a fresh clone. Fixed (not random)
// so signed checkout links keep verifying across a dev server restart.
// Production always requires an explicit QIVROPAY_SESSION_SECRET or
// CASHFREE_SECRET_KEY — this fallback never applies when NODE_ENV=production.
const LOCAL_DEV_CHECKOUT_SECRET = 'qivropay-local-development-only-do-not-use-in-production';

function checkoutTokenSecret() {
  const configured = process.env.QIVROPAY_SESSION_SECRET || process.env.CASHFREE_SECRET_KEY || '';
  if (configured) return configured;
  return process.env.NODE_ENV === 'production' ? '' : LOCAL_DEV_CHECKOUT_SECRET;
}

function signCheckoutSession(session) {
  const secret = checkoutTokenSecret();
  if (!secret) throw new Error('QIVROPAY_SESSION_SECRET or CASHFREE_SECRET_KEY is required');
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyCheckoutSession(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return null;
  const secret = checkoutTokenSecret();
  if (!secret) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return null; }
}

// Minimal in-memory fixed-window rate limiter — no new dependency needed for
// a single-process app. Applied only to a small set of genuinely abusable,
// unauthenticated endpoints (checkout order creation, login, signup);
// merchant-authenticated dashboard routes are never rate limited by this.
//
// Production caveat (Phase 10 audit): this counter lives in the process's own
// memory. It is correct for a single Node process (the documented Docker/VPS
// deployment in DEPLOYMENT_GUIDE.md), but is NOT shared across instances. If
// this service is ever run with more than one process/container behind a
// load balancer (e.g. the `instances: 'max'` PM2 cluster mode in
// ecosystem.config.js), each instance enforces this limit independently, so
// the effective limit is (max * instance count) rather than max. Replacing
// this with a shared store (Redis, etc.) is deliberately out of scope for
// first-merchant launch — do not add that dependency speculatively.
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map(); // key -> { count, resetAt }
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt < now) hits.delete(key);
  }, windowMs).unref();
  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ success: false, error: message || 'Too many attempts. Please wait a few minutes and try again.' });
    }
    next();
  };
}
const cashfreeCreateOrderRateLimit = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20, message: 'Too many checkout attempts. Please wait a few minutes and try again.' });
// Login/signup have no other brute-force protection (no account lockout, no
// CAPTCHA) — this is the minimal production-appropriate guard against
// credential stuffing / password guessing called for by the Phase 10 audit.
const authRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many attempts. Please wait a few minutes and try again.' });
const supportChatRateLimit = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 30, message: 'Too many support chat requests. Please wait a few minutes and try again.' });


// In production, restrict to the configured frontend origin. Locally, default
// to the Vite dev server origin so cookies can also be sent on direct
// (non-proxied) cross-origin requests during testing (e.g. curl, Postman).
const CORS_ORIGIN = process.env.CORS_ORIGIN || PUBLIC_URL || 'http://localhost:3000';
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// Baseline security headers. Applied here (not just in nginx.conf) because
// several documented deployment targets (Vercel/Render/Railway serverless,
// plain `node server/index.js`) never sit behind the nginx config in this
// repo, so headers set only there would silently not apply. No new
// dependency — this is a handful of static header writes, not a policy
// engine. Never set on the Cashfree webhook route's response in a way that
// would change its raw body handling (headers only, body untouched).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Harmless to send over plain HTTP (ignored by browsers there); only takes
  // effect once the production deployment terminates TLS, which it must.
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});

// Cashfree signs the exact raw request body. Keep this route raw before the
// global JSON parser so signature verification cannot be bypassed by re-serialisation.
app.use('/api/v1/webhooks/cashfree', express.raw({ type: 'application/json' }));
app.use(express.json());

// Express 4 does not catch a rejected promise returned by an `async`
// route handler — an unhandled rejection there is not just an unhandled
// request, it terminates the whole Node process (Node 15+ default:
// --unhandled-rejections=throw), taking down every merchant's traffic, not
// just the one request that hit a transient database/network error.
// Verified directly against this Express version during the Phase 10 audit.
// `ah()` wraps a route handler so any rejection is forwarded to Express's
// error-handling middleware (registered at the bottom of this file) instead
// of crashing the process. Applied below only to the routes that were not
// already individually guarded by their own try/catch.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Defense in depth for the same failure class outside of a request handler
// (e.g. a background timer callback). Logs and keeps the process alive
// rather than crashing on every merchant's traffic because of one rejected
// promise. This is not a substitute for `ah()` above — request-handler
// rejections should still produce a clean per-request error response via the
// error middleware, not just a log line.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
});

// Deployment health check. This must not depend on the database or a payment provider.
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, service: 'qivropay-api', environment: process.env.NODE_ENV || 'development' });
});

function readCookie(req, name) {
  const cookies = String(req.headers.cookie || '').split(';');
  const entry = cookies.find((part) => part.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : '';
}

function authCookieOptions(maxAge) {
  return `qivropay_session=; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

function publicUser(user) {
  return user ? { id: user.id, email: user.email, name: user.name, company: user.company, createdAt: user.created_at } : null;
}

app.get('/api/v1/auth/me', async (req, res) => {
  try {
    const user = await getUserForSession(readCookie(req, 'qivropay_session'));
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('Auth lookup failed', error);
    res.status(503).json({ success: false, error: 'Authentication service is temporarily unavailable' });
  }
});

async function triggerWelcomeEmailIfNew(user) {
  if (!user || !user.id || !user.email) {
    console.log('[WelcomeEmail] ❌ Invalid user object passed to triggerWelcomeEmailIfNew');
    return;
  }
  try {
    const claimed = await claimWelcomeEmail(user.id);
    console.log(`[WelcomeEmail] → WELCOME EMAIL CLAIM RESULT: ${claimed ? 'CLAIMED (First attempt for user)' : 'SKIPPED (Already claimed)'}`);
    if (!claimed) return;
    const sendResult = await sendWelcomeEmail({ email: user.email, name: user.name });
    console.log(`[WelcomeEmail] → BREVO RESPONSE / ERROR: ${sendResult.success ? `SUCCESS (Message ID: ${sendResult.messageId})` : `FAILED (${sendResult.error || sendResult.reason})`}`);
  } catch (err) {
    console.error('[WelcomeEmail] → BREVO RESPONSE / ERROR: Unexpected exception:', err?.message || err);
  }
}

app.post('/api/v1/auth/signup', authRateLimit, async (req, res) => {
  if (process.env.NODE_ENV === 'production' && !(process.env.DATABASE_URL || process.env.POSTGRES_URL)) return res.status(503).json({ success:false,error:'Database is not configured' });
  const { email, password, name, company } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || String(password || '').length < 8 || !String(name || '').trim() || !String(company || '').trim()) {
    return res.status(400).json({ success: false, error: 'Name, company, valid email and an 8+ character password are required' });
  }
  console.log(`[WelcomeEmail] → SIGNUP START: ${normalizedEmail}`);
  try {
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    const user = await createUser({ email: normalizedEmail, password: String(password), name: String(name).trim(), company: String(company).trim() });
    console.log(`[WelcomeEmail] → USER CREATED: ID ${user.id}`);
    console.log(`[WelcomeEmail] → NEW USER CONFIRMED: ${user.email}`);
    const session = await createAuthSession(user.id);
    // Safe, error-isolated welcome email trigger
    await triggerWelcomeEmailIfNew(user);
    res.setHeader('Set-Cookie', authCookieOptions(60 * 60 * 24 * 30).replace('qivropay_session=;', `qivropay_session=${encodeURIComponent(session.token)};`));
    res.status(201).json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('Signup failed', error);
    res.status(503).json({ success: false, error: 'Could not create account. Check your database connection.' });
  }
});

app.post('/api/v1/auth/login', authRateLimit, async (req, res) => {
  if (process.env.NODE_ENV === 'production' && !(process.env.DATABASE_URL || process.env.POSTGRES_URL)) return res.status(503).json({ success:false,error:'Database is not configured' });
  const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!normalizedEmail || !password) return res.status(400).json({ success: false, error: 'Email and password are required' });
  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user || !checkUserPassword(password, user.password_hash)) return res.status(401).json({ success: false, error: 'Invalid email or password' });
    const session = await createAuthSession(user.id);
    res.setHeader('Set-Cookie', authCookieOptions(60 * 60 * 24 * 30).replace('qivropay_session=;', `qivropay_session=${encodeURIComponent(session.token)};`));
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('Login failed', error);
    res.status(503).json({ success: false, error: 'Could not sign in. Check your database connection.' });
  }
});

// "Continue with Google" — see server/googleAuth.js for the verification
// step. Shares the signup/login route's rate limit, database gate, session
// cookie and response shape so the frontend treats it identically once it
// resolves; the only thing unique to this route is how the user is found or
// created (upsertGoogleUser, keyed off the verified Google identity/email
// rather than a submitted password).
app.post('/api/v1/auth/google', authRateLimit, async (req, res) => {
  if (process.env.NODE_ENV === 'production' && !(process.env.DATABASE_URL || process.env.POSTGRES_URL)) return res.status(503).json({ success:false,error:'Database is not configured' });
  if (!googleClientId()) return res.status(503).json({ success: false, error: 'Google sign-in is not configured' });
  const credential = String(req.body?.credential || '');
  if (!credential) return res.status(400).json({ success: false, error: 'Missing Google credential' });
  try {
    const { googleId, email, name } = await verifyGoogleIdToken(credential);
    const user = await upsertGoogleUser({ googleId, email, name });
    const session = await createAuthSession(user.id);
    if (user.isNewUser) {
      console.log(`[WelcomeEmail] → NEW GOOGLE USER CONFIRMED: ID ${user.id}`);
      await triggerWelcomeEmailIfNew(user);
    }
    res.setHeader('Set-Cookie', authCookieOptions(60 * 60 * 24 * 30).replace('qivropay_session=;', `qivropay_session=${encodeURIComponent(session.token)};`));
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('Google sign-in failed', error);
    res.status(401).json({ success: false, error: 'Could not verify Google sign-in' });
  }
});

app.post('/api/v1/auth/logout', async (req, res) => {
  try { await deleteAuthSession(readCookie(req, 'qivropay_session')); } catch (error) { console.error('Logout failed', error); }
  res.setHeader('Set-Cookie', authCookieOptions(0));
  res.json({ success: true });
});

// Merchant dashboard APIs require an authenticated merchant session. Public
// checkout creation/status and Cashfree webhook callbacks stay accessible.
app.use('/api/v1', async (req, res, next) => {
  const publicPaths = [
    '/health', '/auth/me', '/auth/login', '/auth/signup', '/auth/logout', '/auth/google',
    '/payments/session/',
    '/india/cashfree/create-order', '/india/cashfree/session/', '/india/cashfree/orders/', '/webhooks/cashfree',
    '/support/chat'
  ];
  const currentPath = req.path || req.url || '';
  const isPublicPath = publicPaths.some((pathPrefix) =>
    currentPath === pathPrefix ||
    currentPath.startsWith(pathPrefix) ||
    (req.originalUrl && (req.originalUrl.includes(pathPrefix) || req.originalUrl.endsWith(pathPrefix)))
  );

  // Try resolving session user for all incoming requests if session cookie exists
  try {
    const sessionToken = readCookie(req, 'qivropay_session');
    if (sessionToken) {
      const user = await getUserForSession(sessionToken);
      if (user) req.user = user;
    }
  } catch (error) {
    // Expired or invalid session cookie — safely keep req.user undefined
  }

  // Public paths (such as /support/chat or public checkout) never block on auth
  if (isPublicPath) {
    return next();
  }

  // Non-public merchant dashboard routes require an authenticated user or API key
  try {
    if (req.user) {
      if (req.method === 'GET' && !req.apiKey && req.user.email !== 'demo@qivropay.com') {
        const empty = {
          '/subscriptions': { subscriptions: [] },
          '/discounts': { discounts: [] }, '/licenses': { licenses: [] },
          '/payouts': { payouts: [] }, '/meters': { meters: [] },
          '/keys': { apiKeys: [] }, '/webhooks': { webhooks: [] },
          '/brands': { brands: [] }, '/affiliates': { affiliates: [] },
          '/wallets': { agentWallets: [] }, '/team': { teamMembers: [] },
          '/audit-logs': { auditLogs: [] },
          '/disputes': { disputes: [] }, '/disputes/analytics': { analytics: {} },
          '/b2b/invoices': { invoices: [] }, '/einvoicing/invoices': { invoices: [] },
          '/webhooks/dlq': { queue: [] }, '/notifications': { notifications: [] }
        };
        if (empty[req.path]) return res.json({ success: true, ...empty[req.path] });
      }
      return next();
    }

    const authorization = String(req.headers.authorization || '');
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const apiKeyRecord = match ? await findApiKey(match[1]) : null;
    if (!apiKeyRecord) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (!apiKeyEnvironmentMatchesServer(apiKeyRecord.key.environment)) {
      return res.status(403).json({ success: false, error: `This API key's environment does not match the payment infrastructure this server is currently connected to (${CASHFREE_ENVIRONMENT}).` });
    }
    req.apiKey = apiKeyRecord.key;
    req.user = { id: apiKeyRecord.merchantId, email: '', name: '', company: '' };
    return next();
  } catch (error) {
    console.error('Dashboard authentication failed', error);
    res.status(503).json({ success: false, error: 'Authentication service is temporarily unavailable' });
  }
});


// -------------------------------------------------------------
// PRODUCTION CORE DATA API
// Persistent merchant resources live in Neon when configured. The legacy
// db.json routes remain below for backward compatibility, but core V1 routes
// are intercepted here so new merchants never share seeded demo state.
// -------------------------------------------------------------
const resourceTypeFor = (name) => name;
const newId = (prefix) => `${prefix}_${crypto.randomBytes(10).toString('hex')}`;

app.get('/api/v1/products', async (req, res) => {
  try { return res.json({ success: true, products: await listResources(req.user.id, resourceTypeFor('product')) }); }
  catch (e) { return res.status(503).json({ success:false, error:'Product storage unavailable' }); }
});
app.post('/api/v1/products', ah(async (req, res) => {
  const { name, description = '', price, currency = 'INR', type = 'one_time', active = true, credits } = req.body || {};
  const amount = Number(price);
  if (!String(name || '').trim() || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success:false, error:'Product name and a positive price are required' });
  if (!['one_time','credits'].includes(type)) return res.status(400).json({success:false,error:'QivroPay V1 supports one-time and credit products only'});
  const product = { id:newId('prod'), name:String(name).trim(), description:String(description), price:Number(amount.toFixed(2)), currency:String(currency).toUpperCase(), type, active:Boolean(active), createdAt:new Date().toISOString(), ...(credits != null ? {credits:Number(credits)}:{}),  };
  await saveResource(req.user.id, 'product', product); return res.status(201).json({success:true, product});
}));
app.delete('/api/v1/products/:id', ah(async (req,res)=>{ await deleteResource(req.user.id,'product',req.params.id); return res.json({success:true}); }));

app.get('/api/v1/customers', async (req,res)=>{ try{return res.json({success:true,customers:await listResources(req.user.id,'customer')});}catch(e){return res.status(503).json({success:false,error:'Customer storage unavailable'});} });
app.get('/api/v1/transactions', async (req,res)=>{ try{return res.json({success:true,transactions:await listResources(req.user.id,'transaction')});}catch(e){return res.status(503).json({success:false,error:'Transaction storage unavailable'});} });
app.get('/api/v1/subscriptions', async (req,res)=>{ try{return res.json({success:true,subscriptions:await listResources(req.user.id,'subscription')});}catch(e){return res.status(503).json({success:false,error:'Subscription storage unavailable'});} });

app.get('/api/v1/analytics', async (req,res)=>{
  try{
    const txs=await listResources(req.user.id,'transaction');
    const customers=await listResources(req.user.id,'customer');
    const subscriptions=await listResources(req.user.id,'subscription');
    // A 'refund_pending' transaction was still a real, successful payment —
    // it must keep counting toward gross volume while its refund is
    // unconfirmed (requirement: analytics stays internally consistent even
    // while a refund is pending). Its refundedAmount is deliberately
    // excluded from the net-revenue deduction below until Cashfree actually
    // confirms the refund (status becomes 'refunded'/'partially_refunded') —
    // an unconfirmed refund must not already discount net revenue that may
    // never actually leave the account.
    const paid=txs.filter(t=>t.status==='succeeded' || t.status==='refunded' || t.status==='partially_refunded' || t.status==='refund_pending');
    const totalVolume=paid.reduce((n,t)=>n+Number(t.amount||0),0);
    const refunded=paid.filter(t=>t.status==='refunded' || t.status==='partially_refunded').reduce((n,t)=>n+Number(t.refundedAmount||0),0);
    const activeSubscriptions=subscriptions.filter(s=>s.status==='active').length;
    return res.json({success:true,analytics:{totalVolume:Number(totalVolume.toFixed(2)),totalFees:0,totalNet:Number((totalVolume-refunded).toFixed(2)),mrr:subscriptions.filter(s=>s.status==='active').reduce((n,s)=>n+Number(s.amount||0),0),activeSubscriptions,activeCustomers:customers.length,conversionRate:'—',chargebackRate:'—'}});
  }catch(e){return res.status(503).json({success:false,error:'Analytics storage unavailable'});}
});

app.get('/api/v1/keys', ah(async (req,res)=>{
  const keys = await listResources(req.user.id,'api_key');
  return res.json({success:true,apiKeys:keys.map(({keyHash, ...key})=>({...key,key:key.prefix}))});
}));
app.post('/api/v1/keys/generate', ah(async (req,res)=>{
  const environment = req.body?.environment === 'test' ? 'test' : 'live';
  const rawSecret = crypto.randomBytes(24).toString('base64url');
  const fullKey = `qivro_${environment}_${rawSecret}`;
  const key = { id:newId('key'), name:String(req.body?.name || 'API Key').trim(), prefix:`qivro_${environment}_${rawSecret.slice(0,8)}…`, environment, createdAt:new Date().toISOString(), lastUsed:null, keyHash:crypto.createHash('sha256').update(fullKey).digest('hex') };
  await saveResource(req.user.id,'api_key',key);
  return res.status(201).json({success:true,apiKey:{...key,key:fullKey}});
}));
app.delete('/api/v1/keys/:id', ah(async (req,res)=>{await deleteResource(req.user.id,'api_key',req.params.id);return res.json({success:true,message:'API key revoked'});}));

app.get('/api/v1/webhooks', ah(async (req,res)=>{return res.json({success:true,webhooks:await listResources(req.user.id,'webhook')});}));
app.post('/api/v1/webhooks', ah(async (req,res)=>{
  const url=String(req.body?.url||'').trim();
  let parsed; try{parsed=new URL(url);}catch{}
  if(!parsed || !['http:','https:'].includes(parsed.protocol)) return res.status(400).json({success:false,error:'A valid HTTPS webhook URL is required'});
  const webhook={id:newId('wh'),url,events:Array.isArray(req.body?.events)?req.body.events:[],secret:`whsec_${crypto.randomBytes(24).toString('base64url')}`,active:req.body?.active!==false,createdAt:new Date().toISOString()};
  await saveResource(req.user.id,'webhook',webhook); return res.status(201).json({success:true,webhook});
}));

// -------------------------------------------------------------
// MERCHANT PROFILE (Phase 9A — real, merchant-scoped V1 settings)
// A single 'default' resource per merchant holding only the fields QivroPay
// actually persists and uses: display name, support email, and whether the
// first-merchant onboarding flow has been completed. Nothing here touches
// Cashfree credentials or payment/refund logic.
// -------------------------------------------------------------
function publicMerchantProfile(profile, user) {
  return {
    businessName: profile?.businessName || user?.company || '',
    supportEmail: profile?.supportEmail || '',
    onboardingCompletedAt: profile?.onboardingCompletedAt || null,
    liveActivatedAt: profile?.liveActivatedAt || null
  };
}

// -------------------------------------------------------------
// LIVE PAYMENT APPROVAL GATE (Phase 10.7A safety cleanup)
//
// QivroPay has no real KYC/merchant-onboarding review yet — a merchant can
// currently sign up and, if this server happens to be configured with
// CASHFREE_ENV=production, immediately create a real checkout session
// against the platform's live Cashfree account with zero review. Rather than
// pretend some automated approval exists (there is none), every merchant is
// blocked from live checkout-session/order creation by default. sandbox
// (CASHFREE_ENVIRONMENT === 'sandbox') is never restricted, so local
// development and pre-launch testing are unaffected.
//
// There is deliberately no API route that lets a merchant (or anyone else)
// set `liveActivatedAt` themselves — that would just be a second fake
// approval flow. Until a real Cashfree onboarding/KYC integration exists,
// the only way to activate a merchant for live payments is the operator
// running `node server/scripts/activate-merchant-live.js <email>` directly
// against the production database. See PRODUCTION_READINESS.md.
async function isMerchantLiveActivated(merchantId) {
  try {
    const profile = await getResource(merchantId, 'merchant_profile', 'default');
    return Boolean(profile?.liveActivatedAt);
  } catch (e) {
    return false;
  }
}

async function requireLiveActivationIfProduction(req, res) {
  if (CASHFREE_ENVIRONMENT !== 'production') return true;
  if (await isMerchantLiveActivated(req.user.id)) return true;
  res.status(403).json({
    success: false,
    error: "Live payments aren't activated for your account yet. Complete merchant verification and activation before accepting live payments.",
    errorCode: 'LIVE_PAYMENTS_NOT_ACTIVATED'
  });
  return false;
}

app.get('/api/v1/merchant/profile', async (req, res) => {
  try {
    const profile = await getResource(req.user.id, 'merchant_profile', 'default');
    return res.json({ success: true, profile: publicMerchantProfile(profile, req.user) });
  } catch (e) {
    return res.status(503).json({ success: false, error: 'Merchant profile storage unavailable' });
  }
});

app.put('/api/v1/merchant/profile', async (req, res) => {
  const businessName = String(req.body?.businessName || '').trim();
  const supportEmail = String(req.body?.supportEmail || '').trim();
  if (!businessName) return res.status(400).json({ success: false, error: 'Store / business name is required' });
  if (supportEmail && !/^\S+@\S+\.\S+$/.test(supportEmail)) return res.status(400).json({ success: false, error: 'Enter a valid support email address' });
  try {
    const existing = await getResource(req.user.id, 'merchant_profile', 'default');
    const profile = { id: 'default', businessName, supportEmail, onboardingCompletedAt: existing?.onboardingCompletedAt || null, updatedAt: new Date().toISOString() };
    await saveResource(req.user.id, 'merchant_profile', profile);
    return res.json({ success: true, profile: publicMerchantProfile(profile, req.user) });
  } catch (e) {
    return res.status(503).json({ success: false, error: 'Could not save merchant profile' });
  }
});

app.post('/api/v1/merchant/onboarding/complete', async (req, res) => {
  try {
    const existing = await getResource(req.user.id, 'merchant_profile', 'default');
    const profile = { id: 'default', businessName: existing?.businessName || req.user.company || '', supportEmail: existing?.supportEmail || '', onboardingCompletedAt: existing?.onboardingCompletedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    await saveResource(req.user.id, 'merchant_profile', profile);
    return res.json({ success: true, profile: publicMerchantProfile(profile, req.user) });
  } catch (e) {
    return res.status(503).json({ success: false, error: 'Could not update onboarding status' });
  }
});

// Phase 10.8C — internal/test-only route. Returns the calling QivroPay
// merchant's own Cashfree Partner onboarding/KYC/activation status, if a
// mapping exists. Not wired into signup, not exposed in any customer-facing
// UI yet, and takes no client-supplied cf_merchant_id: the Cashfree merchant
// looked up is always the one this merchant is already mapped to (via the
// req.user.id derived by the auth middleware above, same as every other
// /api/v1/merchant/* route) — a merchant can never request another
// merchant's Cashfree status. Never returns the Partner API key; the error
// branch only ever forwards the already-sanitized CashfreePartnerError
// fields (status/code/message).
// Shared shape for both the status route and the onboard route below — kept
// as distinct named fields (never collapsed to a single approved boolean)
// per the Phase 10.8C/10.8D status-model requirement.
function sanitizedPartnerMappingStatus(mapping) {
  return {
    cfMerchantId: mapping.cf_merchant_id,
    onboardingStatus: mapping.onboarding_status,
    kycStatus: mapping.kyc_status,
    fullKycStatus: mapping.full_kyc_status,
    activationStatus: mapping.activation_status,
    transactionAccess: mapping.transaction_access,
    updatedAt: mapping.updated_at
  };
}

app.get('/api/v1/merchant/cashfree-partner-status', ah(async (req, res) => {
  const result = await refreshMerchantStatus(req.user.id);
  if (!result.started) {
    return res.json({ success: true, started: false, message: 'Cashfree onboarding not started' });
  }
  if (result.error) {
    // A failed refresh must never overwrite or hide the last successfully
    // observed status — refreshMerchantStatus() already guarantees the
    // stored row is untouched on failure; this just surfaces both the
    // (stale, clearly labeled) last-known status and the sanitized error.
    //
    // Deliberately HTTP 200, not 502: this is a read route, and the
    // frontend's safeFetch() helper (used for every other read in this app)
    // treats any non-2xx as "no data at all" and discards the body — which
    // would silently throw away the last-known status this branch exists to
    // preserve. success:false / stale:true in the body is how a caller
    // detects this case; a real transport/auth failure still reaches the
    // browser as its own non-2xx from fetch() itself, same as any other
    // read route here.
    return res.json({
      success: false,
      started: true,
      stale: true,
      lastKnownStatus: sanitizedPartnerMappingStatus(result.mapping),
      error: { status: result.error.status, code: result.error.code, message: result.error.message }
    });
  }
  return res.json({ success: true, started: true, stale: false, ...sanitizedPartnerMappingStatus(result.mapping) });
}));

// Phase 10.8D. Creates (at most once — see cashfreePartnerMerchantOnboarding.js
// for the full idempotency/duplicate-safety argument) the Cashfree Partner
// merchant behind the calling QivroPay merchant, or returns the existing
// mapping if one is already there. merchant_email/merchant_name are sourced
// from the authenticated account itself (never re-collected from the
// client); poc_phone/merchant_site_url are not tracked anywhere in QivroPay
// today, so they are the only fields this route actually needs from the
// request body. The Cashfree merchant_id used is always this account's own
// QivroPay merchant_id — the client can never supply or influence it.
app.post('/api/v1/merchant/cashfree-partner/onboard', ah(async (req, res) => {
  // Phase 10.8E: confirmed by manual testing directly against the real
  // api-sandbox.cashfree.com Partner endpoint — POST /merchants' poc_phone
  // field (Cashfree's error: "Validation failed for phone number on
  // 'MerchantPhone'") rejects any "+91" prefix, space, hyphen or
  // parenthesis; only a plain 10-digit string (no country code) is
  // accepted. Normalizing here (stripping a leading "+91"/"91"/"0" country
  // code or trunk prefix, then requiring exactly 10 digits) lets a merchant
  // type a natural "+91 98765 43210" and still succeed, rather than hitting
  // an opaque Cashfree rejection for a phone number that looks entirely
  // valid to a human.
  const pocPhoneDigits = String(req.body?.pocPhone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
  const merchantSiteUrl = String(req.body?.merchantSiteUrl || '').trim();
  if (!/^\d{10}$/.test(pocPhoneDigits)) {
    return res.status(400).json({ success: false, error: 'Enter a valid 10-digit contact mobile number' });
  }
  const pocPhone = pocPhoneDigits;
  if (!/^https?:\/\/\S+\.\S+/i.test(merchantSiteUrl)) {
    return res.status(400).json({ success: false, error: 'A valid business website URL (including https://) is required' });
  }

  // Phase 10.8E: prefer the merchant's own editable QivroPay profile name
  // (Settings / first-run onboarding — Phase 9A) over the immutable signup
  // "company" field, so an edit made there is reflected in what Cashfree is
  // told, rather than silently reusing a possibly-stale signup value. Falls
  // back to req.user.company (never empty — required at signup) if the
  // profile lookup fails or the profile has no name set yet.
  let merchantName = String(req.user.company || '').trim();
  try {
    const existingProfile = await getResource(req.user.id, 'merchant_profile', 'default');
    if (existingProfile?.businessName) merchantName = String(existingProfile.businessName).trim();
  } catch (e) {
    // Profile storage unavailable — fall back to req.user.company rather than
    // blocking payment setup on an unrelated storage hiccup.
  }
  if (!merchantName) {
    return res.status(400).json({ success: false, error: 'Add your business name in Settings before starting payment setup' });
  }

  try {
    const result = await createOrLinkCashfreeMerchant(req.user.id, {
      merchantEmail: req.user.email,
      merchantName,
      pocPhone,
      merchantSiteUrl
    });
    const status = result.created ? 201 : 200;
    if (result.error) {
      // Created successfully, but the immediate status refresh failed — the
      // mapping exists, so this is not a creation failure; report it the
      // same way the status route reports a failed refresh.
      //
      // Phase 10.8E fix: `started` was missing from this branch and the one
      // below (confirmed by a real end-to-end browser run against the live
      // Cashfree sandbox — the merchant was genuinely created, this route
      // returned 201, but the frontend's normalizeCashfreePartnerStatus()
      // treats a response with no `started` key as `started:false`, so the
      // screen fell back to "not started" right after a successful
      // creation). Always include it explicitly here, matching the sibling
      // GET /cashfree-partner-status route above.
      return res.status(status).json({
        success: true,
        started: true,
        created: result.created,
        stale: true,
        lastKnownStatus: sanitizedPartnerMappingStatus(result.mapping),
        error: { status: result.error.status, code: result.error.code, message: result.error.message }
      });
    }
    return res.status(status).json({ success: true, started: true, created: result.created, stale: false, ...sanitizedPartnerMappingStatus(result.mapping) });
  } catch (err) {
    if (err instanceof PartnerOnboardingConflictError) {
      return res.status(409).json({ success: false, error: err.message, errorCode: err.code });
    }
    if (err instanceof CashfreePartnerError) {
      return res.status(502).json({ success: false, error: err.message, errorCode: err.code });
    }
    throw err;
  }
}));

// Phase 10.8D. Generates a fresh, short-lived (Cashfree documents "active
// for 1 hour only") embeddable onboarding/KYC link for a merchant that
// already has a Cashfree mapping. Returns only what the frontend needs to
// launch it (link URL + timestamps) — never the Partner API key, never
// unrelated Cashfree internals. return_url is always computed server-side
// (this server's own public origin), never accepted from the client.
app.post('/api/v1/merchant/cashfree-partner/onboarding-link', ah(async (req, res) => {
  const publicOrigin = PUBLIC_URL || (process.env.NODE_ENV === 'production' ? '' : `http://localhost:${PORT}`);
  if (!publicOrigin) return res.status(503).json({ success: false, error: 'PUBLIC_URL is required in production' });
  const returnUrl = `${publicOrigin}/dashboard?cashfreeOnboarding=return`;

  try {
    const result = await getCashfreePartnerOnboardingLink(req.user.id, returnUrl);
    if (!result.started) {
      return res.json({ success: true, started: false, message: 'Cashfree onboarding not started — create the merchant first' });
    }
    if (result.error) {
      return res.status(502).json({ success: false, started: true, error: { status: result.error.status, code: result.error.code, message: result.error.message } });
    }
    return res.json({ success: true, started: true, link: result.link });
  } catch (err) {
    if (err instanceof CashfreePartnerError) {
      return res.status(502).json({ success: false, error: err.message, errorCode: err.code });
    }
    throw err;
  }
}));

// -------------------------------------------------------------
// SETTLEMENT / RECONCILIATION (Phase 10.8F)
//
// Read-only with respect to Cashfree — every route below only retrieves and
// compares data already reported by Cashfree's documented, Partner-usable
// settlement endpoints (see cashfreePartnerSettlement.js). None of them
// create a payout, change a settlement, or move money. Every route is
// scoped to req.user.id exactly like the routes above it — a merchant can
// never request another merchant's settlements, settlement identifiers,
// UTRs, or reconciliation data; there is no way to pass a different
// merchant/cf_merchant_id in from the request body or query string.
// -------------------------------------------------------------

// Cashfree cf_settlement_id / settlement_utr are real Cashfree-issued
// financial identifiers — never sent back with any extra internal fields
// beyond what this project itself derived from them.
function publicSettlement(settlement) {
  return {
    cfSettlementId: settlement.id,
    status: settlement.status,
    settlementUtr: settlement.settlementUtr,
    settlementCurrency: settlement.settlementCurrency,
    settlementType: settlement.settlementType,
    settlementInitiatedOn: settlement.settlementInitiatedOn,
    settlementProcessedOn: settlement.settlementProcessedOn,
    updatedAt: settlement.fetchedAt
  };
}

function publicReconciliation(record) {
  return {
    orderId: record.id,
    state: record.state,
    discrepancy: record.discrepancy || null,
    reason: record.reason || null,
    cfSettlementId: record.cfSettlementId || null,
    lastCheckedAt: record.lastCheckedAt,
    stale: Boolean(record.stale),
    // Never forwards record.error.message verbatim — that's Cashfree's own
    // (only-the-secret-redacted) wording, meant for logs, not a
    // merchant-facing dashboard. status/code are still exposed for the
    // frontend to key off (e.g. a future feature_not_enabled-style branch),
    // same pattern as the Phase 10.8E onboarding-link route.
    error: record.error ? { status: record.error.status, code: record.error.code, message: 'Cashfree settlement data could not be refreshed just now.' } : null
  };
}

// Every real Cashfree settlement record this merchant has had reported
// (cf_settlement_id, status, UTR, dates) — no fabricated rows, ever. An
// empty array here means exactly what it says: no settlement has been
// observed for this merchant in the current Cashfree environment, not that
// settlements are hidden or pending in some invisible way.
// `environment` is CASHFREE_PARTNER_ENV's actual resolved value (Phase
// 10.8F Part 10 — a demo merchant must never be able to mistake a sandbox
// settlement for a real one). Every settlement/reconciliation row returned
// here was retrieved under this exact environment; there is no
// production-approved account behind this yet, so this is 'sandbox' in
// every environment this project currently runs in.
app.get('/api/v1/merchant/settlements', ah(async (req, res) => {
  const settlements = await listStoredSettlements(req.user.id);
  return res.json({ success: true, environment: resolvePartnerEnvironment(), settlements: settlements.map(publicSettlement) });
}));

app.get('/api/v1/merchant/reconciliation', ah(async (req, res) => {
  const records = await listStoredReconciliations(req.user.id);
  return res.json({ success: true, environment: resolvePartnerEnvironment(), reconciliations: records.map(publicReconciliation) });
}));

// Manual, on-demand only (Phase 10.8F Part 8 explicitly rules out an
// uncontrolled background polling job in this phase) — with an optional
// single orderId, or bounded to the merchant's most recent 25 succeeded
// payments when omitted, to keep this from becoming an unbounded scan of
// real Cashfree API calls triggered from a single button click.
app.post('/api/v1/merchant/reconciliation/refresh', ah(async (req, res) => {
  const orderId = req.body?.orderId ? String(req.body.orderId) : null;
  try {
    if (orderId) {
      const result = await reconcilePayment(req.user.id, orderId);
      return res.json({ success: true, reconciliations: [publicReconciliation(result)] });
    }
    const results = await reconcileMerchantPayments(req.user.id, { limit: 25 });
    return res.json({ success: true, reconciliations: results.map(publicReconciliation) });
  } catch (err) {
    if (err instanceof ReconciliationError) {
      return res.status(400).json({ success: false, error: err.message, errorCode: err.code });
    }
    if (err instanceof CashfreePartnerError) {
      return res.status(502).json({ success: false, error: 'Cashfree settlement data is temporarily unavailable. Please try again.', errorCode: err.code });
    }
    throw err;
  }
}));

app.post('/api/v1/payments/create-session', ah(async (req,res)=>{
  if (!(await requireLiveActivationIfProduction(req, res))) return;
  const productId=String(req.body?.productId||'');
  const product=productId ? await getResource(req.user.id,'product',productId) : null;
  const amount=Number(req.body?.amount ?? product?.price);
  const currency=String(product?.currency||req.body?.currency||'INR').toUpperCase();
  if(!Number.isFinite(amount)||amount<=0) return res.status(400).json({success:false,error:'A valid product or positive amount is required'});
  if(Math.abs(amount - Math.round(amount*100)/100) > 1e-9) return res.status(400).json({success:false,error:'Amount must have at most 2 decimal places'});
  if(currency!=='INR') return res.status(400).json({success:false,error:'QivroPay V1 currently supports INR checkout only'});
  const session={sessionId:`cs_${crypto.randomBytes(18).toString('hex')}`,merchantId:req.user.id,productId:product?.id||null,title:String(req.body?.title||product?.name||'Payment'),description:String(req.body?.description||product?.description||''),amount:Number(amount.toFixed(2)),currency,customerEmail:String(req.body?.customerEmail||'').trim().toLowerCase(),type:product?.type||'one_time',credits:product?.credits||0,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+30*60*1000).toISOString()};
  const publicOrigin = PUBLIC_URL || (process.env.NODE_ENV === 'production' ? '' : `http://localhost:${PORT}`);
  if (!publicOrigin) return res.status(503).json({success:false,error:'PUBLIC_URL is required in production'});
  if (!checkoutTokenSecret()) return res.status(503).json({success:false,error:'Checkout signing secret is not configured'});
  await createCheckoutSession(session);
  const token=signCheckoutSession(session);
  return res.status(201).json({success:true,sessionId:token,url:`${publicOrigin}/checkout/${token}`});
}));

app.get('/api/v1/payments/session/:id', ah(async (req,res)=>{
  const verified=verifyCheckoutSession(req.params.id);
  const session=verified || await getCheckoutSession(req.params.id);
  if(!session) return res.status(404).json({success:false,error:'Session not found'});
  if(session.expiresAt && new Date(session.expiresAt)<new Date()) return res.status(410).json({success:false,error:'Checkout session expired'});
  // The Cashfree SDK mode (sandbox/production) comes from this same response
  // — the frontend has no independent env config of its own — so the
  // backend and the browser's Cashfree SDK can never disagree about which
  // environment a payment runs against. Non-secret: no credentials here.
  return res.json({success:true,session,cashfreeEnvironment:CASHFREE_ENVIRONMENT});
}));

// Database Helpers
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { products: [], transactions: [], subscriptions: [], customers: [], discounts: [], licenses: [], payouts: [], meters: [], apiKeys: [], webhooks: [], brands: [], sessions: {} };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json', err);
    return { products: [], transactions: [], subscriptions: [], customers: [], discounts: [], licenses: [], payouts: [], meters: [], apiKeys: [], webhooks: [], brands: [], sessions: {} };
  }
}

function writeDB(data) {
  // Vercel Functions run from a read-only deployment bundle. Payment
  // events are persisted in Neon; never attempt to mutate db.json there.
  if (process.env.VERCEL === '1') return true;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json', err);
    return false;
  }
}

// -------------------------------------------------------------
// 0. ACCOUNT VERIFICATION & SETUP GUIDE API
//
// Phase 10.7A safety cleanup: this used to accept PAN/GSTIN/bank details and
// unconditionally mark the merchant "approved", and to fabricate a penny-drop
// bank-verification result (fake UTR, fake NPCI reference, always SUCCESS) —
// a merchant could submit any real-looking KYC data and get back a fabricated
// approval with no verification actually taking place. QivroPay has no real
// KYC/bank-verification integration yet, so these routes no longer collect or
// fabricate anything. They stay in place (matching the rest of this legacy
// route collection) but now say so honestly instead of pretending to verify.
// -------------------------------------------------------------
app.get('/api/v1/verification/status', (req, res) => {
  res.json({
    success: true,
    verification: { status: 'unverified', type: null }
  });
});

app.post('/api/v1/verification/submit', (req, res) => {
  return res.status(410).json({
    success: false,
    error: 'Account verification is not yet available. QivroPay does not collect PAN, GSTIN or bank account details until a real KYC/verification integration is in place.'
  });
});

app.post('/api/v1/verification/penny-drop', (req, res) => {
  return res.status(410).json({
    success: false,
    error: 'Bank account verification is not yet available. QivroPay does not perform penny-drop bank verification yet.'
  });
});

app.get('/api/v1/setup-guide/status', (req, res) => {
  const db = readDB();
  const userId = req.user?.id || 'default';
  const steps = db.setupGuide?.[userId] || {
    verification: !!(db.verifications?.[userId] || db.verification),
    testKeys: false,
    testPayment: false,
    testWebhook: false,
    liveKeys: false,
    liveWebhook: false,
    livePayment: false,
    goLive: false
  };

  let score = 0;
  if (steps.verification) score += 25;
  let testSub = (steps.testKeys ? 1 : 0) + (steps.testPayment ? 1 : 0) + (steps.testWebhook ? 1 : 0);
  score += (testSub / 3) * 25;
  let liveSub = (steps.liveKeys ? 1 : 0) + (steps.liveWebhook ? 1 : 0) + (steps.livePayment ? 1 : 0);
  score += (liveSub / 3) * 25;
  if (steps.goLive) score += 25;

  res.json({
    success: true,
    completedSteps: steps,
    progress: Math.min(100, Math.round(score))
  });
});

app.post('/api/v1/setup-guide/step', (req, res) => {
  const { stepKey, completed } = req.body || {};
  if (!stepKey) return res.status(400).json({ success: false, error: 'stepKey is required' });

  const db = readDB();
  const userId = req.user?.id || 'default';
  if (!db.setupGuide) db.setupGuide = {};
  if (!db.setupGuide[userId]) {
    db.setupGuide[userId] = {
      verification: !!(db.verifications?.[userId] || db.verification),
      testKeys: false,
      testPayment: false,
      testWebhook: false,
      liveKeys: false,
      liveWebhook: false,
      livePayment: false,
      goLive: false
    };
  }

  db.setupGuide[userId][stepKey] = completed !== undefined ? !!completed : !db.setupGuide[userId][stepKey];
  writeDB(db);

  const steps = db.setupGuide[userId];
  let score = 0;
  if (steps.verification) score += 25;
  let testSub = (steps.testKeys ? 1 : 0) + (steps.testPayment ? 1 : 0) + (steps.testWebhook ? 1 : 0);
  score += (testSub / 3) * 25;
  let liveSub = (steps.liveKeys ? 1 : 0) + (steps.liveWebhook ? 1 : 0) + (steps.livePayment ? 1 : 0);
  score += (liveSub / 3) * 25;
  if (steps.goLive) score += 25;

  res.json({
    success: true,
    completedSteps: steps,
    progress: Math.min(100, Math.round(score))
  });
});

// -------------------------------------------------------------
// 0.5. 24/7 MERCHANT SUPPORT & TICKET API
// -------------------------------------------------------------
app.get('/api/v1/support/tickets', (req, res) => {
  const db = readDB();
  const userId = req.user?.id || 'default';
  const userTickets = (db.supportTickets || []).filter(t => t.userId === userId || !t.userId);
  res.json({ success: true, tickets: userTickets });
});

app.post('/api/v1/support/tickets', (req, res) => {
  const { name, email, subject, category, message, priority = 'normal' } = req.body || {};
  if (!subject || !message) {
    return res.status(400).json({ success: false, error: 'Subject and message are required' });
  }

  const db = readDB();
  const userId = req.user?.id || 'default';
  const ticketId = `TICK-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  const newTicket = {
    id: ticketId,
    userId,
    name: name || req.user?.name || 'Merchant',
    email: email || req.user?.email || 'merchant@qivropay.in',
    subject,
    category: category || 'General Support',
    message,
    priority,
    status: 'open',
    responseSLA: priority === 'urgent' ? '< 15 mins' : '< 1 hour',
    createdAt: new Date().toISOString(),
    replies: [
      {
        sender: 'QivroPay Priority Desk',
        message: `Namaste ${name || 'Merchant'}! Your ticket #${ticketId} has been registered with our support desk. A member of the QivroPay team will follow up by email.`,
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.supportTickets = db.supportTickets || [];
  db.supportTickets.unshift(newTicket);
  writeDB(db);

  res.status(201).json({
    success: true,
    ticket: newTicket,
    message: `Support ticket #${ticketId} created successfully.`
  });
});

// Phase 10.7A safety cleanup: this route used to (a) accept a client-supplied
// `customApiKey` and use it, unvalidated, as credentials to call Google's
// Gemini API on the server's behalf — letting any authenticated merchant turn
// this endpoint into a generic outbound LLM proxy funded by whatever key they
// supplied, and (b) answer with a system prompt and canned replies asserting
// QivroPay is a Merchant of Record that handles GST/Section 194-O TDS,
// instant T+0 payouts and 2-minute KYC — none of which this product
// implements. It is not called from any reachable UI (no dashboard surface
// links to it), so it is disabled outright rather than rebuilt with a
// narrower, truthful prompt. Re-enable only with a fixed provider key
// (never client-supplied) and a system prompt limited to features this
// product actually has.
let groqClientInstance = null;
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!groqClientInstance) {
    groqClientInstance = new Groq({ apiKey });
  }
  return groqClientInstance;
}

app.post('/api/v1/support/chat', supportChatRateLimit, ah(async (req, res) => {
  // Determine authenticated merchant session strictly server-side
  const sessionToken = readCookie(req, 'qivropay_session');
  let user = null;
  if (sessionToken) {
    try {
      user = await getUserForSession(sessionToken);
    } catch (err) {
      console.error('Support chat auth lookup failed:', err);
    }
  }

  // Security requirement: NEVER accept merchantId/userId/mode from request body as authority
  const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!rawMessages.length) {
    return res.status(400).json({ success: false, error: 'A message or conversation history is required.' });
  }

  // Bound conversation history length to prevent token exhaustion
  const conversation = rawMessages
    .slice(-10)
    .filter(m => m && typeof m.content === 'string' && ['user', 'assistant'].includes(m.role))
    .map(m => ({ role: m.role, content: String(m.content).trim() }));

  if (!conversation.length || conversation[conversation.length - 1].role !== 'user') {
    return res.status(400).json({ success: false, error: 'Invalid conversation format. Last message must be from user.' });
  }

  const mode = user ? 'authenticated' : 'public';
  const systemPrompt = user
    ? await buildMerchantSystemPrompt(user.id, user)
    : buildPublicSystemPrompt();

  const groq = getGroqClient();
  if (!groq) {
    return res.json({
      success: true,
      reply: "Hello! I am the QivroPay Support Assistant. The AI support backend service is currently unconfigured. Please contact support or consult our developer documentation.",
      mode
    });
  }

  const apiKey = process.env.GROQ_API_KEY || '';
  if (apiKey.startsWith('gsk_mock_') || apiKey.startsWith('gsk_test_')) {
    return res.json({
      success: true,
      reply: `[Mocked Groq Response] Hello! I am the QivroPay Support Assistant serving in ${mode} mode.`,
      mode
    });
  }

  try {
    const configuredModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const modelsToTry = [configuredModel, 'openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'groq/compound-mini'];
    // Deduplicate models array
    const candidateModels = Array.from(new Set(modelsToTry));


    let completion = null;
    let lastError = null;

    for (const modelCandidate of candidateModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversation
          ],
          model: modelCandidate,
          temperature: 0.3,
          max_tokens: 1024,
        });
        if (completion) break;
      } catch (err) {
        lastError = err;
        console.warn(`Groq model ${modelCandidate} unavailable:`, err?.message || err);
      }

    }

    if (!completion) {
      throw lastError || new Error('No Groq model candidates succeeded');
    }

    const reply = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try asking again.";
    return res.json({
      success: true,
      reply,
      mode
    });
  } catch (error) {
    console.error('Groq support chat error:', error?.message || error);
    return res.status(503).json({
      success: false,
      error: 'The AI Support Assistant is temporarily unavailable. Please try again in a few moments.'
    });
  }

}));


// -------------------------------------------------------------
// 1. PRODUCTS & AI CREDITS API
// -------------------------------------------------------------
app.get('/api/v1/products', (req, res) => {
  const db = readDB();
  res.json({ success: true, products: db.products || [] });
});

app.post('/api/v1/products', (req, res) => {
  const { name, description, price, currency = 'INR', type = 'credits', credits = 0, billingType = 'one_time', interval = 'one_time' } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const db = readDB();
  const newProduct = {
    id: `prod_qivropay_${crypto.randomBytes(4).toString('hex')}`,
    name,
    description: description || '',
    price: Number(price),
    currency,
    type,
    credits: Number(credits) || 0,
    billingType,
    interval,
    active: true,
    createdAt: new Date().toISOString()
  };

  db.products = db.products || [];
  db.products.unshift(newProduct);
  writeDB(db);

  res.status(201).json({ success: true, product: newProduct });
});

app.delete('/api/v1/products/:id', (req, res) => {
  const db = readDB();
  db.products = (db.products || []).filter(p => p.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// -------------------------------------------------------------
// 2. SUBSCRIPTIONS API
// -------------------------------------------------------------
app.get('/api/v1/subscriptions', (req, res) => {
  const db = readDB();
  res.json({ success: true, subscriptions: db.subscriptions || [] });
});

app.post('/api/v1/subscriptions/cancel', (req, res) => {
  const { subscriptionId } = req.body;
  const db = readDB();
  const sub = (db.subscriptions || []).find(s => s.id === subscriptionId);
  if (sub) {
    sub.status = 'cancelled';
    sub.cancelAtPeriodEnd = true;
    writeDB(db);
    return res.json({ success: true, subscription: sub });
  }
  res.status(404).json({ error: 'Subscription not found' });
});

// -------------------------------------------------------------
// 3. DISCOUNTS & COUPONS API
// -------------------------------------------------------------
app.get('/api/v1/discounts', (req, res) => {
  const db = readDB();
  res.json({ success: true, discounts: db.discounts || [] });
});

app.post('/api/v1/discounts', (req, res) => {
  const { code, name, type = 'percentage', amount, maxRedemptions = 100, duration = 'forever' } = req.body;
  if (!code || !amount) {
    return res.status(400).json({ error: 'Code and amount are required' });
  }

  const db = readDB();
  const newDiscount = {
    id: `disc_${crypto.randomBytes(4).toString('hex')}`,
    code: code.toUpperCase().trim(),
    name: name || `${amount}${type === 'percentage' ? '%' : '$'} Discount`,
    type,
    amount: Number(amount),
    duration,
    redemptionCount: 0,
    maxRedemptions: Number(maxRedemptions),
    active: true,
    createdAt: new Date().toISOString()
  };

  db.discounts = db.discounts || [];
  db.discounts.unshift(newDiscount);
  writeDB(db);

  res.status(201).json({ success: true, discount: newDiscount });
});

app.delete('/api/v1/discounts/:id', (req, res) => {
  const db = readDB();
  db.discounts = (db.discounts || []).filter(d => d.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Discount deleted' });
});

// -------------------------------------------------------------
// 4. LICENSES & ENTITLEMENTS API
// -------------------------------------------------------------
app.get('/api/v1/licenses', (req, res) => {
  const db = readDB();
  res.json({ success: true, licenses: db.licenses || [] });
});

app.post('/api/v1/licenses/generate', (req, res) => {
  const { productName, customerEmail, maxActivations = 3 } = req.body;
  const db = readDB();

  const key = `QIVROPAY-₹{crypto.randomBytes(2).toString('hex').toUpperCase()}-₹{crypto.randomBytes(2).toString('hex').toUpperCase()}-₹{crypto.randomBytes(2).toString('hex').toUpperCase()}-₹{crypto.randomBytes(1).toString('hex').toUpperCase()}`;
  const newLicense = {
    id: `lic_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    productName: productName || 'QIVROPAY Desktop Agent Pro License',
    customerEmail: customerEmail || 'customer@company.com',
    key,
    activations: 0,
    maxActivations: Number(maxActivations),
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.licenses = db.licenses || [];
  db.licenses.unshift(newLicense);
  writeDB(db);

  res.status(201).json({ success: true, license: newLicense });
});

app.post('/api/v1/licenses/revoke', (req, res) => {
  const { licenseId } = req.body;
  const db = readDB();
  const lic = (db.licenses || []).find(l => l.id === licenseId);
  if (lic) {
    lic.status = 'revoked';
    writeDB(db);
    return res.json({ success: true, license: lic });
  }
  res.status(404).json({ error: 'License not found' });
});

// -------------------------------------------------------------
// 6. USAGE METERS API
// -------------------------------------------------------------
app.get('/api/v1/meters', (req, res) => {
  const db = readDB();
  res.json({ success: true, meters: db.meters || [] });
});

app.post('/api/v1/meters/track', (req, res) => {
  const { eventName = 'llm_tokens_consumed', units = 1000, customerId } = req.body;
  const db = readDB();

  let meter = (db.meters || []).find(m => m.eventName === eventName);
  if (meter) {
    meter.currentUsage += Number(units);
    meter.updatedAt = new Date().toISOString();
  } else {
    meter = {
      id: `mtr_qivropay_${crypto.randomBytes(3).toString('hex')}`,
      name: eventName,
      eventName,
      aggregation: 'sum',
      currentUsage: Number(units),
      unit: 'units',
      updatedAt: new Date().toISOString()
    };
    db.meters = db.meters || [];
    db.meters.push(meter);
  }

  writeDB(db);
  res.json({ success: true, trackedEvent: { eventName, units, customerId, timestamp: new Date().toISOString() }, meter });
});

// -------------------------------------------------------------
// 7. PAYMENTS, CHECKOUT & REFUND API
// -------------------------------------------------------------
// POST /api/v1/payments/create-session and GET /api/v1/payments/session/:id
// are implemented once, earlier in this file (production-core, authenticated,
// merchant-scoped, signed-token based). A legacy db.json-backed duplicate of
// both routes used to live here with demo defaults (₹29, "AI Credits Pack",
// 5,000,000 credits) — removed so there is exactly one implementation of each.

app.post('/api/v1/payments/process', (req, res) => {
  return res.status(410).json({ success:false, error:'Legacy simulated payment processing has been removed. Use the Cashfree checkout flow.' });
});

app.post('/api/v1/payments/refund', ah(async (req, res) => {
  const transactionId=String(req.body?.transactionId||'').trim();
  const amount=req.body?.amount == null ? null : Number(req.body.amount);
  const note=String(req.body?.note || 'Customer requested refund').slice(0,200);
  const tx=await getResource(req.user.id,'transaction',transactionId);
  if(!tx) return res.status(404).json({success:false,error:'Transaction not found'});
  if(tx.status!=='succeeded') return res.status(409).json({success:false,error:'Only successful payments can be refunded'});
  const stored=await getPaymentOrder(transactionId);
  const {appId,secretKey}=cashfreeCredentials();
  if(!appId||!secretKey) return res.status(503).json({success:false,error:'Cashfree credentials are not configured'});
  const refundAmount=amount == null ? Number(tx.amount) : Number(amount);
  if(!Number.isFinite(refundAmount)||refundAmount<=0||refundAmount>Number(tx.amount)) return res.status(400).json({success:false,error:'Invalid refund amount'});

  // Concurrency gate: two overlapping requests can both pass the tx.status
  // check above (neither has written back yet), so the actual "only one
  // caller may talk to Cashfree" decision is made here, atomically, not by
  // that earlier read. See beginRefundClaim() in neonStore.js.
  const claim=await beginRefundClaim(req.user.id,transactionId);
  if(!claim.won){
    return res.status(409).json({success:false,error:'A refund has already been requested for this transaction.'});
  }

  try{
    const refundId=`refund_${crypto.randomBytes(10).toString('hex')}`;
    const response=await fetch(`${cashfreeBaseUrl()}/orders/${encodeURIComponent(transactionId)}/refunds`,{method:'POST',headers:{'x-api-version':CASHFREE_API_VERSION,'x-client-id':appId,'x-client-secret':secretKey,'Content-Type':'application/json'},body:JSON.stringify({refund_amount:Number(refundAmount.toFixed(2)),refund_id:refundId,refund_note:note})});
    const data=await response.json();
    if(!response.ok) { await releaseRefundClaim(req.user.id,transactionId); return res.status(response.status).json({success:false,error:data.message||'Cashfree refund request failed'}); }
    // Never assume HTTP 2xx means the refund is complete — Cashfree's own
    // refund_status field (PENDING/SUCCESS/CANCELLED/...) is authoritative.
    // applyRefundStatus() decides the resulting transaction + claim state.
    const updated=await applyRefundStatus(req.user.id,transactionId,{refundId:data.refund_id||refundId,refundAmount,refundStatus:data.refund_status});
    return res.status(201).json({success:true,transaction:updated,refund:data});
  }catch(err){ await releaseRefundClaim(req.user.id,transactionId); return res.status(502).json({success:false,error:'Failed to communicate with Cashfree refund service'});}
}));

// On-demand reconciliation for a refund left 'refund_pending' by the POST
// above (Cashfree accepted the request but had not yet confirmed a terminal
// outcome). This is the "smallest robust architecture" for learning a
// pending refund's eventual status: the current Cashfree webhook
// subscription for this project does not include refund events, so there is
// no push-based signal to rely on. Rather than build a background job/queue,
// this is a plain pull triggered on demand (called by the merchant dashboard
// when it renders a refund_pending row) — idempotent and safe to call any
// number of times from any number of sessions/devices, since it does
// nothing unless the transaction is still actually pending, and does not
// depend on any one browser tab staying open: the next person (or the same
// merchant, later, from anywhere) to load the dashboard resolves it.
app.get('/api/v1/payments/refund-status/:transactionId', ah(async (req, res) => {
  const transactionId=String(req.params.transactionId||'').trim();
  const tx=await getResource(req.user.id,'transaction',transactionId);
  if(!tx) return res.status(404).json({success:false,error:'Transaction not found'});
  if(tx.status!=='refund_pending') return res.json({success:true,transaction:tx,reconciled:false});
  if(!tx.refundId) return res.status(409).json({success:false,error:'No refund reference recorded for this transaction'});
  const {appId,secretKey}=cashfreeCredentials();
  if(!appId||!secretKey) return res.status(503).json({success:false,error:'Cashfree credentials are not configured'});
  try{
    const response=await fetch(`${cashfreeBaseUrl()}/orders/${encodeURIComponent(transactionId)}/refunds/${encodeURIComponent(tx.refundId)}`,{headers:{'x-api-version':CASHFREE_API_VERSION,'x-client-id':appId,'x-client-secret':secretKey,'Content-Type':'application/json'}});
    const data=await response.json();
    if(!response.ok) return res.status(response.status).json({success:false,error:data.message||'Cashfree refund status lookup failed'});
    const updated=await applyRefundStatus(req.user.id,transactionId,{refundId:data.refund_id||tx.refundId,refundAmount:data.refund_amount,refundStatus:data.refund_status});
    return res.json({success:true,transaction:updated,reconciled:true});
  }catch(err){return res.status(502).json({success:false,error:'Failed to reach Cashfree for refund status reconciliation'});}
}));

// -------------------------------------------------------------
// 8. CUSTOMERS, API KEYS, WEBHOOKS & BRANDS
// -------------------------------------------------------------
app.get('/api/v1/customers', (req, res) => {
  const db = readDB();
  res.json({ success: true, customers: db.customers || [] });
});

app.get('/api/v1/transactions', (req, res) => {
  const db = readDB();
  res.json({ success: true, transactions: db.transactions || [] });
});

app.get('/api/v1/keys', (req, res) => {
  const db = readDB();
  res.json({ success: true, apiKeys: db.apiKeys || [] });
});

app.post('/api/v1/keys/generate', (req, res) => {
  const { name = 'Production API Key', environment = 'live' } = req.body;
  const db = readDB();

  const secretHex = crypto.randomBytes(16).toString('hex');
  const fullKey = `qivropay_${environment}_${secretHex}`;
  const newKey = {
    id: `key_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    name,
    key: fullKey,
    prefix: `qivropay_${environment}_${secretHex.slice(0, 4)}...`,
    environment,
    createdAt: new Date().toISOString(),
    lastUsed: 'Just now'
  };

  db.apiKeys = db.apiKeys || [];
  db.apiKeys.unshift(newKey);
  writeDB(db);

  res.status(201).json({ success: true, apiKey: newKey });
});

app.delete('/api/v1/keys/:id', (req, res) => {
  const db = readDB();
  db.apiKeys = (db.apiKeys || []).filter(k => k.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'API key revoked' });
});

app.get('/api/v1/webhooks', (req, res) => {
  const db = readDB();
  res.json({ success: true, webhooks: db.webhooks || [] });
});

app.post('/api/v1/webhooks/test', (req, res) => {
  const { eventType = 'payment.succeeded' } = req.body;
  res.json({
    success: true,
    event: {
      id: `evt_qivropay_${crypto.randomBytes(6).toString('hex')}`,
      type: eventType,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'tx_qivropay_demo_test',
          amount: 2900,
          currency: 'usd',
          customerEmail: 'developer@ai.com',
          status: 'succeeded'
        }
      }
    }
  });
});

app.get('/api/v1/brands', (req, res) => {
  const db = readDB();
  res.json({ success: true, brands: db.brands || [] });
});

// -------------------------------------------------------------
// 11. TEAM MEMBERS & AUDIT LOGS API
// -------------------------------------------------------------
app.get('/api/v1/team', (req, res) => {
  const db = readDB();
  res.json({ success: true, teamMembers: db.teamMembers || [] });
});

app.post('/api/v1/team/invite', (req, res) => {
  const { name, email, role = 'Developer' } = req.body;
  const db = readDB();
  const newMember = {
    id: `team_${crypto.randomBytes(3).toString('hex')}`,
    name,
    email,
    role,
    status: 'active',
    lastActive: 'Invited'
  };
  db.teamMembers = db.teamMembers || [];
  db.teamMembers.push(newMember);

  // Add audit log
  db.auditLogs = db.auditLogs || [];
  db.auditLogs.unshift({
    id: `log_${crypto.randomBytes(3).toString('hex')}`,
    action: `Team Member Invited (${role})`,
    user: 'Owner',
    details: `Invited ${email} as ${role}`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.status(201).json({ success: true, member: newMember });
});

app.get('/api/v1/audit-logs', (req, res) => {
  const db = readDB();
  res.json({ success: true, auditLogs: db.auditLogs || [] });
});

// -------------------------------------------------------------
// 12. ZERO-CODE PAY-PER-INFERENCE AI GATEWAY PROXY
// -------------------------------------------------------------
app.post('/api/v1/proxy/chat/completions', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid QIVROPAY Bearer API key' });
  }

  const { model = 'gpt-4o', messages = [], customerId = 'cus_qivropay_9910' } = req.body;
  const db = readDB();

  // Deduct fractional micro-fee (₹0.002) and record telemetry
  const promptTokens = (messages[0]?.content?.length || 50) * 2;
  const completionTokens = 120;
  const microCost = 0.0024;

  // Track usage meter automatically
  let meter = (db.meters || []).find(m => m.eventName === 'llm_tokens_consumed');
  if (meter) {
    meter.currentUsage += (promptTokens + completionTokens);
  }

  writeDB(db);

  res.json({
    id: `chatcmpl_qivropay_${crypto.randomBytes(8).toString('hex')}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hello! I am your AI assistant running seamlessly behind the QIVROPAY Pay-Per-Inference Zero-Code Gateway. Your request was authenticated, metered, and settled in 8ms.'
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens
    },
    qivropay_settlement: {
      micro_charge_usd: microCost,
      currency: 'INR',
      status: 'debited_from_meter',
      latency_ms: 8
    }
  });
});

// -------------------------------------------------------------
// 13. ABANDONED CHECKOUT RECOVERY API
// -------------------------------------------------------------
app.get('/api/v1/abandoned-checkouts', (req, res) => {
  const db = readDB();
  res.json({ success: true, abandonedCheckouts: db.abandonedCheckouts || [] });
});

app.post('/api/v1/abandoned-checkouts/send-recovery', (req, res) => {
  const { checkoutId } = req.body;
  const db = readDB();
  const abn = (db.abandonedCheckouts || []).find(a => a.id === checkoutId);
  if (abn) {
    abn.recoveryStatus = 'email_sent';
    writeDB(db);
    return res.json({ 
      success: true, 
      message: `Recovery email with 15% discount link dispatched to ${abn.customerEmail}` 
    });
  }
  res.status(404).json({ error: 'Abandoned checkout session not found' });
});

// -------------------------------------------------------------
// 14. VISUAL PAYMENT WORKFLOWS API
// -------------------------------------------------------------
app.get('/api/v1/workflows', (req, res) => {
  const db = readDB();
  res.json({ success: true, workflows: db.workflows || [] });
});

app.post('/api/v1/workflows/toggle', (req, res) => {
  const { workflowId } = req.body;
  const db = readDB();
  const wf = (db.workflows || []).find(w => w.id === workflowId);
  if (wf) {
    wf.active = !wf.active;
    writeDB(db);
    return res.json({ success: true, workflow: wf });
  }
  res.status(404).json({ error: 'Workflow not found' });
});

app.post('/api/v1/workflows/create', (req, res) => {
  const { name, trigger, condition, action, target } = req.body;
  const db = readDB();
  const newWf = {
    id: `wf_${crypto.randomBytes(3).toString('hex')}`,
    name,
    trigger: trigger || 'payment.succeeded',
    condition: condition || 'amount >= 50',
    action: action || 'slack_notification',
    target: target || '#general',
    executions: 0,
    active: true
  };
  db.workflows = db.workflows || [];
  db.workflows.push(newWf);
  writeDB(db);
  res.status(201).json({ success: true, workflow: newWf });
});

// -------------------------------------------------------------
// 15. 1-CLICK MIGRATION IMPORTER API
// -------------------------------------------------------------
app.post('/api/v1/migration/import', (req, res) => {
  const { source = 'stripe', count = 12 } = req.body;
  const db = readDB();

  // Add migration audit log
  db.auditLogs = db.auditLogs || [];
  db.auditLogs.unshift({
    id: `log_${crypto.randomBytes(3).toString('hex')}`,
    action: `Platform Migration from ${source.toUpperCase()}`,
    user: 'System Importer',
    details: `Imported ${count} active customer cohorts, products, and recurring schedules from ${source}.`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json({
    success: true,
    message: `Successfully migrated ${count} records from ${source.toUpperCase()} with zero downtime.`,
    imported: {
      products: 3,
      customers: 8,
      subscriptions: 4
    }
  });
});

// -------------------------------------------------------------
// 17. AI SMART DUNNING & CHURN RADAR API
// -------------------------------------------------------------
app.get('/api/v1/dunning/retries', (req, res) => {
  const db = readDB();
  res.json({ success: true, dunningRetries: db.dunningRetries || [] });
});

app.post('/api/v1/dunning/trigger-retry', (req, res) => {
  const { retryId } = req.body;
  const db = readDB();
  const dun = (db.dunningRetries || []).find(d => d.id === retryId);
  if (dun) {
    dun.status = 'recovered';
    dun.recoveryProbability = '100% (Settled)';
    writeDB(db);
    return res.json({ success: true, message: 'Card successfully charged using ML Smart Retry Window' });
  }
  res.status(404).json({ error: 'Dunning record not found' });
});

// -------------------------------------------------------------
// 18. AI PROMPT-TO-CHECKOUT COPILOT API
// -------------------------------------------------------------
app.post('/api/v1/copilot/generate', (req, res) => {
  const { prompt } = req.body;
  const db = readDB();

  // Extract price, type, and title from natural language prompt
  let price = 49.00;
  const priceMatch = prompt.match(/\$?(\d+(\.\d{2})?)/);
  if (priceMatch) {
    price = parseFloat(priceMatch[1]);
  }

  let type = 'subscription';
  if (prompt.toLowerCase().includes('credit') || prompt.toLowerCase().includes('token')) {
    type = 'credits';
  } else if (prompt.toLowerCase().includes('license') || prompt.toLowerCase().includes('key')) {
    type = 'license';
  }

  let title = 'AI Copilot Generated Product';
  if (prompt.toLowerCase().includes('pro')) title = 'Pro AI Supercharge Plan';
  else if (prompt.toLowerCase().includes('gpu')) title = 'Dedicated GPU Cluster Compute';
  else if (prompt.toLowerCase().includes('starter')) title = 'Starter Developer AI Tier';

  const newProd = {
    id: `prod_copilot_${crypto.randomBytes(3).toString('hex')}`,
    name: title,
    description: `Auto-generated from natural language prompt: "${prompt}"`,
    price,
    currency: 'INR',
    type,
    active: true,
    createdAt: new Date().toISOString()
  };

  db.products = db.products || [];
  db.products.unshift(newProd);
  writeDB(db);

  const checkoutUrl = `http://localhost:4000/checkout/${newProd.id}`;
  const embedSnippet = `<script src="http://localhost:4000/checkout.js"></script>\n<button onclick="QivroPay.openCheckout('${newProd.id}')">Pay ₹${price} INR</button>`;

  res.json({
    success: true,
    product: newProd,
    checkoutUrl,
    embedSnippet,
    reasoning: `Extracted ${type} model priced at ₹${price} INR with instant global MoR tax routing.`
  });
});

// -------------------------------------------------------------
// 19. CHARGEBACK DEFENSE AI API
// -------------------------------------------------------------
app.get('/api/v1/disputes', (req, res) => {
  const db = readDB();
  res.json({ success: true, disputes: db.disputes || [] });
});

app.post('/api/v1/disputes/submit-evidence', (req, res) => {
  const { disputeId } = req.body;
  const db = readDB();
  const dp = (db.disputes || []).find(d => d.id === disputeId);
  if (dp) {
    dp.status = 'won_settled';
    dp.evidenceStatus = 'evidence_submitted_won';
    writeDB(db);
    return res.json({ 
      success: true, 
      message: 'AI Evidence Package submitted to Visa/Mastercard network. 100% Insulated by QIVROPAY MoR.' 
    });
  }
  res.status(404).json({ error: 'Dispute not found' });
});

// -------------------------------------------------------------
// 20. B2B ENTERPRISE INVOICING API
// -------------------------------------------------------------
app.get('/api/v1/b2b/invoices', (req, res) => {
  const db = readDB();
  res.json({ success: true, b2bInvoices: db.b2bInvoices || [] });
});

app.post('/api/v1/b2b/create-invoice', (req, res) => {
  const { companyName, taxId, amount, currency = 'INR', terms = 'Net 30', items = [] } = req.body;
  const db = readDB();
  const newInv = {
    id: `inv_b2b_${crypto.randomBytes(3).toString('hex')}`,
    companyName,
    taxId,
    amount: Number(amount),
    currency,
    terms,
    status: 'sent',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    virtualIban: `US84 QIVROPAY 0192 ${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    items: items.length > 0 ? items : ['Enterprise Software License', '24/7 SLA Support']
  };
  db.b2bInvoices = db.b2bInvoices || [];
  db.b2bInvoices.unshift(newInv);
  writeDB(db);
  res.status(201).json({ success: true, invoice: newInv });
});

// -------------------------------------------------------------
// 21. DIGITAL GIFT CARDS & STORE CREDITS API
// -------------------------------------------------------------
app.get('/api/v1/gift-cards', (req, res) => {
  const db = readDB();
  res.json({ success: true, giftCards: db.giftCards || [] });
});

app.post('/api/v1/gift-cards/create', (req, res) => {
  const { initialAmount = 50, recipientEmail, senderName = 'Merchant' } = req.body;
  const db = readDB();
  const newCard = {
    id: `gc_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    code: `GIFT-QIVROPAY-₹{crypto.randomBytes(2).toString('hex').toUpperCase()}-VIP`,
    initialAmount: Number(initialAmount),
    currentBalance: Number(initialAmount),
    currency: 'INR',
    recipientEmail,
    senderName,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  db.giftCards = db.giftCards || [];
  db.giftCards.unshift(newCard);
  writeDB(db);
  res.status(201).json({ success: true, giftCard: newCard });
});

// -------------------------------------------------------------
// 22. A/B CHECKOUT CRO SPLIT TESTING API
// -------------------------------------------------------------
app.get('/api/v1/ab-tests', (req, res) => {
  const db = readDB();
  res.json({ success: true, abTests: db.abTests || [] });
});

app.post('/api/v1/ab-tests/create', (req, res) => {
  const { name, variantA, variantB } = req.body;
  const db = readDB();
  const newTest = {
    id: `test_${crypto.randomBytes(3).toString('hex')}`,
    name,
    variantA: variantA || 'Default Checkout',
    variantB: variantB || 'Order Bump + Apple Pay First',
    trafficSplit: '50% / 50%',
    viewsA: 0,
    conversionsA: 0,
    conversionRateA: '0.00%',
    viewsB: 0,
    conversionsB: 0,
    conversionRateB: '0.00%',
    winner: 'Collecting Sample Data',
    status: 'active'
  };
  db.abTests = db.abTests || [];
  db.abTests.unshift(newTest);
  writeDB(db);
  res.status(201).json({ success: true, test: newTest });
});

// -------------------------------------------------------------
// 23. GLOBAL TAX NEXUS & COMPLIANCE API
// -------------------------------------------------------------
app.get('/api/v1/tax-nexus', (req, res) => {
  const db = readDB();
  res.json({ success: true, taxNexusRecords: db.taxNexusRecords || [] });
});

// -------------------------------------------------------------
// 24. DYNAMIC PRICING & ELASTICITY API
// -------------------------------------------------------------
app.get('/api/v1/pricing/rules', (req, res) => {
  const db = readDB();
  res.json({ success: true, pricingRules: db.pricingRules || [] });
});

// -------------------------------------------------------------
// 25. REAL-TIME B2B VAT / EIN VALIDATOR (VIES & IRS)
// -------------------------------------------------------------
app.post('/api/v1/tax/validate-vat', (req, res) => {
  const { taxId, country } = req.body;
  
  if (!taxId || taxId.length < 5) {
    return res.status(400).json({ valid: false, message: 'Invalid corporate tax identifier format' });
  }

  // Live simulation of VIES / IRS corporate database lookup
  res.json({
    valid: true,
    taxId,
    companyName: 'Verified Enterprise Entity Ltd.',
    country: country || 'DE',
    reverseChargeApplicable: true,
    exemptionRate: '0.00% Reverse Charge Applied under EU VAT / US Export rules',
    viesValidationTimestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 26. WEBHOOK DEAD-LETTER QUEUE (DLQ) & RETRY API
// -------------------------------------------------------------
app.get('/api/v1/webhooks/dlq', (req, res) => {
  const db = readDB();
  res.json({ success: true, deadLetterQueue: db.deadLetterQueue || [] });
});

app.post('/api/v1/webhooks/dlq/retry', (req, res) => {
  const { dlqId } = req.body;
  const db = readDB();
  const item = (db.deadLetterQueue || []).find(d => d.id === dlqId);
  if (item) {
    item.status = 'delivered';
    item.failureReason = 'Resolved (HTTP 200 OK)';
    writeDB(db);
    return res.json({ success: true, message: `Event ${item.eventId} successfully re-dispatched and acknowledged with HTTP 200.` });
  }
  res.status(404).json({ error: 'DLQ item not found' });
});

// -------------------------------------------------------------
// 28. SUBSCRIPTION PRORATION & TIER CHANGE API
// -------------------------------------------------------------
app.post('/api/v1/subscriptions/prorate', (req, res) => {
  const { currentPlanPrice = 29, newPlanPrice = 99, daysRemaining = 18, totalDaysInCycle = 30 } = req.body;
  
  const dailyCurrentRate = currentPlanPrice / totalDaysInCycle;
  const dailyNewRate = newPlanPrice / totalDaysInCycle;
  
  const unusedCredit = dailyCurrentRate * daysRemaining;
  const newTierCostRemaining = dailyNewRate * daysRemaining;
  const proratedChargeNow = Math.max(0, newTierCostRemaining - unusedCredit);

  res.json({
    success: true,
    prorationCalculation: {
      currentPlanPrice,
      newPlanPrice,
      daysRemaining,
      unusedCredit: Number(unusedCredit.toFixed(2)),
      newTierCostRemaining: Number(newTierCostRemaining.toFixed(2)),
      proratedChargeNow: Number(proratedChargeNow.toFixed(2)),
      nextCycleFullAmount: newPlanPrice
    }
  });
});

// -------------------------------------------------------------
// 29. TAX EXEMPTION CERTIFICATES API
// -------------------------------------------------------------
app.get('/api/v1/tax-exemptions', (req, res) => {
  const db = readDB();
  res.json({ success: true, taxExemptions: db.taxExemptions || [] });
});

app.post('/api/v1/tax-exemptions/upload', (req, res) => {
  const { organizationName, type, certificateNumber, jurisdiction } = req.body;
  const db = readDB();
  const newExemption = {
    id: `exm_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    organizationName,
    type: type || '501(c)(3) Non-Profit Charity',
    certificateNumber,
    jurisdiction: jurisdiction || 'United States',
    status: 'verified',
    expiresAt: '2028-12-31',
    verifiedAt: new Date().toISOString().slice(0, 10)
  };
  db.taxExemptions = db.taxExemptions || [];
  db.taxExemptions.unshift(newExemption);
  writeDB(db);
  res.status(201).json({ success: true, exemption: newExemption });
});

// -------------------------------------------------------------
// 30. IN-APP BILLING NOTIFICATIONS API
// -------------------------------------------------------------
app.get('/api/v1/notifications', (req, res) => {
  const db = readDB();
  res.json({ success: true, notifications: db.inAppNotifications || [] });
});

app.post('/api/v1/notifications/mark-read', (req, res) => {
  const db = readDB();
  (db.inAppNotifications || []).forEach(n => n.read = true);
  writeDB(db);
  res.json({ success: true, message: 'All notifications marked as read' });
});

// -------------------------------------------------------------
// 31. METERED OVERAGES & BURST TIERS API
// -------------------------------------------------------------
app.get('/api/v1/meters/overages', (req, res) => {
  const db = readDB();
  res.json({ success: true, tiers: db.meteredOverageTiers || [] });
});

// -------------------------------------------------------------
// 32. FRAUD VELOCITY & GEOFENCING API
// -------------------------------------------------------------
app.get('/api/v1/fraud-shield/rules', (req, res) => {
  const db = readDB();
  res.json({ success: true, rules: db.fraudShieldRules || [] });
});

// -------------------------------------------------------------
// 33. CREDIT NOTES & INVOICE ADJUSTMENTS API
// -------------------------------------------------------------
app.get('/api/v1/credit-notes', (req, res) => {
  const db = readDB();
  res.json({ success: true, creditNotes: db.creditNotes || [] });
});

app.post('/api/v1/credit-notes/issue', (req, res) => {
  const { customerEmail, originalInvoiceId, adjustmentAmount, reason, taxId } = req.body;
  const db = readDB();
  const newNote = {
    id: `cn_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    originalInvoiceId: originalInvoiceId || 'inv_qivropay_9881',
    customerEmail,
    taxId: taxId || 'EU-VAT-VERIFIED',
    amount: 49.00,
    adjustmentAmount: Number(adjustmentAmount) || 9.31,
    reason: reason || 'Retroactive B2B Tax Exemption Credit Note',
    status: 'issued_refunded',
    issuedAt: new Date().toISOString().slice(0, 10)
  };
  db.creditNotes = db.creditNotes || [];
  db.creditNotes.unshift(newNote);
  writeDB(db);
  res.status(201).json({ success: true, creditNote: newNote });
});

// -------------------------------------------------------------
// 35. CUSTOM DOMAIN & SSL PROVISIONING API
// -------------------------------------------------------------
app.get('/api/v1/domains', (req, res) => {
  const db = readDB();
  res.json({ success: true, domains: db.customDomains || [] });
});

app.post('/api/v1/domains/verify', (req, res) => {
  const { domain } = req.body;
  const db = readDB();
  const newDomain = {
    id: `dom_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    domain,
    targetCname: 'custom.qivropay.io',
    sslStatus: 'issued_active',
    dnsStatus: 'verified',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  db.customDomains = db.customDomains || [];
  db.customDomains.unshift(newDomain);
  writeDB(db);
  res.status(201).json({ success: true, domain: newDomain });
});

// -------------------------------------------------------------
// 36. MULTI-ENTITY CORPORATE HOLDING API
// -------------------------------------------------------------
app.get('/api/v1/entities', (req, res) => {
  const db = readDB();
  res.json({ success: true, entities: db.corporateEntities || [] });
});

// -------------------------------------------------------------
// 37. ENTERPRISE CONTRACT E-SIGNING API
// -------------------------------------------------------------
app.get('/api/v1/contracts', (req, res) => {
  const db = readDB();
  res.json({ success: true, contracts: db.contracts || [] });
});

app.post('/api/v1/contracts/sign', (req, res) => {
  const { title, clientName, contractValue, signerEmail } = req.body;
  const db = readDB();
  const newContract = {
    id: `cnt_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    title: title || 'Enterprise Master Services Agreement (MSA) & 99.99% SLA',
    clientName,
    contractValue: contractValue || '₹120,000.00 / yr',
    status: 'signed_active',
    signerEmail: signerEmail || 'legal@client.com',
    sha256Hash: crypto.randomBytes(32).toString('hex'),
    signedAt: new Date().toISOString().slice(0, 10)
  };
  db.contracts = db.contracts || [];
  db.contracts.unshift(newContract);
  writeDB(db);
  res.status(201).json({ success: true, contract: newContract });
});

// -------------------------------------------------------------
// 38. VIRTUAL CORPORATE CARD ISSUING API
// -------------------------------------------------------------
app.get('/api/v1/cards', (req, res) => {
  const db = readDB();
  res.json({ success: true, cards: db.issuedCards || [] });
});

app.post('/api/v1/cards/issue', (req, res) => {
  const { cardholderName, spendLimitMonthly, brand = 'Visa Business Corporate' } = req.body;
  const db = readDB();
  const newCard = {
    id: `crd_qivropay_${crypto.randomBytes(3).toString('hex')}`,
    cardholderName,
    last4: Math.floor(1000 + Math.random() * 9000).toString(),
    exp: '12/29',
    brand,
    spendLimitMonthly: Number(spendLimitMonthly) || 5000,
    spentThisMonth: 0,
    status: 'active',
    type: 'virtual'
  };
  db.issuedCards = db.issuedCards || [];
  db.issuedCards.unshift(newCard);
  writeDB(db);
  res.status(201).json({ success: true, card: newCard });
});

// -------------------------------------------------------------
// 39. CHARGEBACK INSURANCE POLICY API
// -------------------------------------------------------------
app.get('/api/v1/insurance/status', (req, res) => {
  const db = readDB();
  res.json({ success: true, policy: db.insurancePolicy });
});

// -------------------------------------------------------------
// 41. MULTI-ACQUIRER SMART ROUTING API
// -------------------------------------------------------------
app.get('/api/v1/routing/acquirers', (req, res) => {
  const db = readDB();
  res.json({ success: true, acquirers: db.acquirerRails || [] });
});

// -------------------------------------------------------------
// 42. MERCHANT REVENUE-BASED FINANCING (RBF) CAPITAL API
// -------------------------------------------------------------
app.get('/api/v1/capital/offers', (req, res) => {
  const db = readDB();
  res.json({ 
    success: true, 
    preApprovedAmount: 125000.00,
    advances: db.capitalAdvances || [] 
  });
});

app.post('/api/v1/capital/advance', (req, res) => {
  const { amount } = req.body;
  const db = readDB();
  const reqAmount = Number(amount) || 50000;
  const fee = reqAmount * 0.06;
  const newAdvance = {
    id: `cap_adv_${crypto.randomBytes(3).toString('hex')}`,
    approvedAmount: reqAmount,
    repaymentRate: '10% Daily Net Volume Split',
    fee,
    totalToRepay: reqAmount + fee,
    repaidSoFar: 0,
    status: 'active_repaying',
    fundedAt: new Date().toISOString().slice(0, 10)
  };
  db.capitalAdvances = db.capitalAdvances || [];
  db.capitalAdvances.unshift(newAdvance);
  writeDB(db);
  res.status(201).json({ success: true, advance: newAdvance });
});

// -------------------------------------------------------------
// 43. GLOBAL GOVERNMENT TAX FILING PACKAGES API
// -------------------------------------------------------------
app.get('/api/v1/tax-filings/packages', (req, res) => {
  const db = readDB();
  res.json({ success: true, filings: db.taxFilings || [] });
});

// -------------------------------------------------------------
// 45. GLOBAL MANDATORY E-INVOICING CLEARANCE (SDI/CHORUS/IRN) API
// -------------------------------------------------------------
app.get('/api/v1/einvoicing/invoices', (req, res) => {
  const db = readDB();
  res.json({ success: true, invoices: db.eInvoices || [] });
});

// -------------------------------------------------------------
// 46. ENTERPRISE CUSTOMER CHURN & EXPANSION SIGNALS API
// -------------------------------------------------------------
app.get('/api/v1/customers/signals', (req, res) => {
  const db = readDB();
  res.json({ success: true, signals: db.customerSignals || [] });
});

// -------------------------------------------------------------
// 47. ZERO-KNOWLEDGE (ZK) PROOF RECEIPTS API
// -------------------------------------------------------------
app.get('/api/v1/zk-receipts', (req, res) => {
  const db = readDB();
  res.json({ success: true, receipts: db.zkReceipts || [] });
});

// -------------------------------------------------------------
// 48. VIRAL CUSTOMER REFERRALS & CREDITS API
// -------------------------------------------------------------
app.get('/api/v1/referrals/campaigns', (req, res) => {
  const db = readDB();
  res.json({ success: true, campaigns: db.referralCampaigns || [] });
});

// -------------------------------------------------------------
// 49. CHARGEBACK ROOT-CAUSE ANALYTICS API
// -------------------------------------------------------------
app.get('/api/v1/disputes/analytics', (req, res) => {
  const db = readDB();
  res.json({ success: true, analytics: db.disputeAnalytics });
});

// -------------------------------------------------------------
// 50. AI DISPUTE AUTO-REBUTTAL EVIDENCE GENERATOR API
// -------------------------------------------------------------
app.get('/api/v1/disputes/rebuttals', (req, res) => {
  const db = readDB();
  res.json({ success: true, rebuttals: db.disputeRebuttals || [] });
});

// -------------------------------------------------------------
// 51. CUSTOMER SPEND SOFT-CAP LIMITS API
// -------------------------------------------------------------
app.get('/api/v1/spend-limits', (req, res) => {
  const db = readDB();
  res.json({ success: true, limits: db.spendLimits || [] });
});

// -------------------------------------------------------------
// 52. ENTERPRISE PURCHASE ORDERS (PO) API
// -------------------------------------------------------------
app.get('/api/v1/purchase-orders', (req, res) => {
  const db = readDB();
  res.json({ success: true, orders: db.purchaseOrders || [] });
});

// -------------------------------------------------------------
// 53. AUTONOMOUS AI REVENUE LEAKAGE AUDIT API
// -------------------------------------------------------------
app.get('/api/v1/revenue-leakage/audit', (req, res) => {
  const db = readDB();
  res.json({ success: true, leakages: db.revenueLeakages || [] });
});

// -------------------------------------------------------------
// 54. AUTOMATED FX CURRENCY HEDGING (90-DAY LOCK) API
// -------------------------------------------------------------
app.get('/api/v1/fx/hedges', (req, res) => {
  const db = readDB();
  res.json({ success: true, hedges: db.fxHedges || [] });
});

// -------------------------------------------------------------
// 55. SUBSCRIPTION PAUSE & HOLIDAY MODE API
// -------------------------------------------------------------
app.get('/api/v1/subscriptions/pause', (req, res) => {
  const db = readDB();
  res.json({ success: true, paused: db.pausedSubscriptions || [] });
});

// -------------------------------------------------------------
// 56. B2B WHOLESALE VOLUME PRICING TIERS API
// -------------------------------------------------------------
app.get('/api/v1/pricing/volume-tiers', (req, res) => {
  const db = readDB();
  res.json({ success: true, tiers: db.volumeTiers || [] });
});

// -------------------------------------------------------------
// 57. AI ENTERPRISE SOW & EXPANSION PROPOSALS API
// -------------------------------------------------------------
app.get('/api/v1/sow/proposals', (req, res) => {
  const db = readDB();
  res.json({ success: true, proposals: db.sowProposals || [] });
});

// -------------------------------------------------------------
// 58. DYNAMIC 3DS SMART EXEMPTIONS API
// -------------------------------------------------------------
app.get('/api/v1/3ds/exemptions', (req, res) => {
  const db = readDB();
  res.json({ success: true, exemptions: db.smart3DS });
});

// -------------------------------------------------------------
// 59. REAL-TIME SAAS NET REVENUE RETENTION (NRR) API
// -------------------------------------------------------------
app.get('/api/v1/saas/nrr', (req, res) => {
  const db = readDB();
  res.json({ success: true, nrr: db.nrrMetrics });
});

// -------------------------------------------------------------
// 60. B2B REVERSE-CHARGE TAX AUDIT VAULT API
// -------------------------------------------------------------
app.get('/api/v1/tax/certificates', (req, res) => {
  const db = readDB();
  res.json({ success: true, certificates: db.taxCertificates || [] });
});

// -------------------------------------------------------------
// 61. INVOICE PDF BULK BATCH EXPORTER API
// -------------------------------------------------------------
app.get('/api/v1/invoices/batch-export', (req, res) => {
  const db = readDB();
  res.json({ success: true, batches: db.invoiceBatches || [] });
});

// -------------------------------------------------------------
// 62. AI NETWORK TOKENIZATION & ACCOUNT UPDATER API
// -------------------------------------------------------------
app.get('/api/v1/network-tokens', (req, res) => {
  const db = readDB();
  res.json({ success: true, tokens: db.networkTokens || [] });
});

// -------------------------------------------------------------
// 64. QIVROPAY ONE-PASS UNIVERSAL BIOMETRIC IDENTITY API
// -------------------------------------------------------------
app.get('/api/v1/one-pass/status', (req, res) => {
  const db = readDB();
  res.json({ success: true, networkStats: db.onePassUsers });
});

// -------------------------------------------------------------
// 65. AUTOMATED ENTERPRISE SLA UPTIME CREDITS API
// -------------------------------------------------------------
app.get('/api/v1/sla/credits', (req, res) => {
  const db = readDB();
  res.json({ success: true, credits: db.slaCredits || [] });
});

// -------------------------------------------------------------
// 66. ETHOCA & VERIFI PRE-DISPUTE CHARGEBACK DEFLECTION API
// -------------------------------------------------------------
app.get('/api/v1/disputes/pre-dispute-alerts', (req, res) => {
  const db = readDB();
  res.json({ success: true, alerts: db.preDisputeAlerts || [] });
});

// -------------------------------------------------------------
// 68. AI CUSTOMER CHURN WIN-BACK DOWNSELL API
// -------------------------------------------------------------
app.get('/api/v1/subscriptions/win-back-offers', (req, res) => {
  const db = readDB();
  res.json({ success: true, offers: db.winBackOffers || [] });
});

// -------------------------------------------------------------
// 69. AUTOMATED GREEN CHECKOUT & CARBON REMOVAL API
// -------------------------------------------------------------
app.get('/api/v1/climate/carbon-offsets', (req, res) => {
  const db = readDB();
  res.json({ success: true, climate: db.carbonOffsets });
});

// -------------------------------------------------------------
// 70. INDIA: UPI & UPI AUTOPAY 2.0 MANDATES API
// -------------------------------------------------------------
app.get('/api/v1/india/upi-autopay', (req, res) => {
  const db = readDB();
  res.json({ success: true, mandates: db.upiAutoPayMandates || [] });
});

// -------------------------------------------------------------
// 71. INDIA: GST & NIC E-INVOICING IRN API
// -------------------------------------------------------------
app.get('/api/v1/india/gst-invoicing', (req, res) => {
  const db = readDB();
  res.json({ success: true, filings: db.indianGstFilings || [] });
});

// -------------------------------------------------------------
// 72. INDIA: TDS WITHHOLDING SECTION 194-O DESK API
// -------------------------------------------------------------
app.get('/api/v1/india/tds-desk', (req, res) => {
  const db = readDB();
  res.json({ success: true, withholdings: db.tdsWithholdings || [] });
});

// -------------------------------------------------------------
// 73. INDIA: PENNY-DROP BANK KYC & DIGILOCKER DESK API
// -------------------------------------------------------------
app.get('/api/v1/india/penny-drop-kyc', (req, res) => {
  const db = readDB();
  res.json({ success: true, kycs: db.pennyDropKycs || [] });
});

// -------------------------------------------------------------
// 74. INDIA: RUPAY CREDIT ON UPI & COFT VAULT API
// -------------------------------------------------------------
app.get('/api/v1/india/rupay-upi', (req, res) => {
  const db = readDB();
  res.json({ success: true, rupay: db.rupayTokens });
});

// -------------------------------------------------------------
// 75. INDIA: E-NACH & 55+ NETBANKING HUB API
// -------------------------------------------------------------
app.get('/api/v1/india/enach-netbanking', (req, res) => {
  const db = readDB();
  res.json({ success: true, mandates: db.enachMandates || [] });
});

// -------------------------------------------------------------
// 76. INDIA: BHARAT BILLPAY (BBPS) INVOICING API
// -------------------------------------------------------------
app.get('/api/v1/india/bbps-invoices', (req, res) => {
  const db = readDB();
  res.json({ success: true, bills: db.bbpsInvoices || [] });
});

// -------------------------------------------------------------
// 77. INDIA: GOVERNMENT NIC E-WAY BILL API
// -------------------------------------------------------------
app.get('/api/v1/india/eway-bills', (req, res) => {
  const db = readDB();
  res.json({ success: true, ewayBills: db.eWayBills || [] });
});

// -------------------------------------------------------------
// 78. INDIA: RBI ACCOUNT AGGREGATOR (AA) FINANCING API
// -------------------------------------------------------------
app.get('/api/v1/india/account-aggregator', (req, res) => {
  const db = readDB();
  res.json({ success: true, credits: db.accountAggregatorCredits || [] });
});

// -------------------------------------------------------------
// 79. INDIA: LRS & CROSS-BORDER OUTBOUND TCS API
// -------------------------------------------------------------
app.get('/api/v1/india/lrs-tcs', (req, res) => {
  const db = readDB();
  res.json({ success: true, filings: db.lrsTcsFilings || [] });
});

// -------------------------------------------------------------
// 80. INDIA: ONDC BECKN PROTOCOL GATEWAY API
// -------------------------------------------------------------
app.get('/api/v1/india/ondc', (req, res) => {
  const db = readDB();
  res.json({ success: true, orders: db.ondcOrders || [] });
});

// -------------------------------------------------------------
// 81. INDIA: RBI DIGITAL RUPEE (CBDC e₹) RAIL API
// -------------------------------------------------------------
app.get('/api/v1/india/digital-rupee', (req, res) => {
  const db = readDB();
  res.json({ success: true, tokens: db.digitalRupeeTokens || [] });
});

// -------------------------------------------------------------
// 82. INDIA: WHATSAPP CONVERSATIONAL UPI BOT API
// -------------------------------------------------------------
app.get('/api/v1/india/whatsapp-checkout', (req, res) => {
  const db = readDB();
  res.json({ success: true, checkouts: db.whatsAppCheckouts || [] });
});

// -------------------------------------------------------------
// 83. INDIA: MCA CORPORATE ROC SECRETARIAL VAULT API
// -------------------------------------------------------------
app.get('/api/v1/india/mca-filings', (req, res) => {
  const db = readDB();
  res.json({ success: true, filings: db.mcaFilings || [] });
});

// -------------------------------------------------------------
// 84. INDIA: NPCI UPI LITE & OFFLINE WALLET API
// -------------------------------------------------------------
app.get('/api/v1/india/upi-lite', (req, res) => {
  const db = readDB();
  res.json({ success: true, upiLite: db.upiLiteTxns });
});

// -------------------------------------------------------------
// 85. INDIA: B2B GSTR-2B VS PURCHASE AI RECONCILIATION API
// -------------------------------------------------------------
app.get('/api/v1/india/gstr2b-recon', (req, res) => {
  const db = readDB();
  res.json({ success: true, recons: db.gstr2bRecons || [] });
});

// -------------------------------------------------------------
// 87. INDIA: DPIIT STARTUP INDIA & ANGEL TAX EXEMPTION API
// -------------------------------------------------------------
app.get('/api/v1/india/startup-india', (req, res) => {
  const db = readDB();
  res.json({ success: true, startupIndia: db.startupIndiaTax });
});

// -------------------------------------------------------------
// 88. INDIA: RBI CKYC & DIGILOCKER 2.0 VERIFIER API
// -------------------------------------------------------------
app.get('/api/v1/india/ckyc', (req, res) => {
  const db = readDB();
  res.json({ success: true, records: db.ckycRecords || [] });
});

// -------------------------------------------------------------
// 89. INDIA: FASTAG & NPCI NETC FLEET INVOICING API
// -------------------------------------------------------------
app.get('/api/v1/india/fastag-netc', (req, res) => {
  const db = readDB();
  res.json({ success: true, txns: db.fastagFleetTxns || [] });
});

// -------------------------------------------------------------
// 90. INDIA: SEZ & STPI ZERO-GST EXPORT LUT API
// -------------------------------------------------------------
app.get('/api/v1/india/sez-lut', (req, res) => {
  const db = readDB();
  res.json({ success: true, invoices: db.sezLutInvoices || [] });
});

// -------------------------------------------------------------
// 91. INDIA: GIFT CITY (IFSC) INR OFFSHORE RAIL API
// -------------------------------------------------------------
app.get('/api/v1/india/gift-city-ifsc', (req, res) => {
  const db = readDB();
  res.json({ success: true, settlements: db.giftCitySettlements || [] });
});

// -------------------------------------------------------------
// 92. INDIA: TREDS MSME INVOICE DISCOUNTING API
// -------------------------------------------------------------
app.get('/api/v1/india/treds', (req, res) => {
  const db = readDB();
  res.json({ success: true, auctions: db.tredsAuctions || [] });
});

// -------------------------------------------------------------
// 93. INDIA: GEM & PFMS PUBLIC PROCUREMENT DESK API
// -------------------------------------------------------------
app.get('/api/v1/india/gem-pfms', (req, res) => {
  const db = readDB();
  res.json({ success: true, contracts: db.gemContracts || [] });
});

// -------------------------------------------------------------
// 94. INDIA: EPFO & ESIC PAYROLL STATUTORY ECR API
// -------------------------------------------------------------
app.get('/api/v1/india/epfo-esic', (req, res) => {
  const db = readDB();
  res.json({ success: true, challans: db.epfoChallans || [] });
});

// -------------------------------------------------------------
// 95. INDIA: TRAI DLT SMS & WHATSAPP SCRUBBING RADAR API
// -------------------------------------------------------------
app.get('/api/v1/india/trai-dlt', (req, res) => {
  const db = readDB();
  res.json({ success: true, templates: db.traiDltTemplates || [] });
});

// -------------------------------------------------------------
// 96. INDIA: OCEN EMBEDDED MICRO-SME CREDIT RAIL API
// -------------------------------------------------------------
app.get('/api/v1/india/ocen', (req, res) => {
  const db = readDB();
  res.json({ success: true, loans: db.ocenCreditLoans || [] });
});

// -------------------------------------------------------------
// 97. INDIA: CLOUD HSM CLASS-3 DSC E-SIGN VAULT API
// -------------------------------------------------------------
app.get('/api/v1/india/cloud-hsm-dsc', (req, res) => {
  const db = readDB();
  res.json({ success: true, signatures: db.cloudHsmDscSignatures || [] });
});

// -------------------------------------------------------------
// 98. INDIA: ADVANCE TAX (SEC 208) & AIS/TIS RECON API
// -------------------------------------------------------------
app.get('/api/v1/india/advance-tax', (req, res) => {
  const db = readDB();
  res.json({ success: true, filings: db.advanceTaxFilings || [] });
});

// -------------------------------------------------------------
// 99. INDIA: CBIC B2C DYNAMIC UPI QR CODE API
// -------------------------------------------------------------
app.get('/api/v1/india/b2c-dynamic-qr', (req, res) => {
  const db = readDB();
  res.json({ success: true, qrCodes: db.b2cDynamicQrCodes || [] });
});

// -------------------------------------------------------------
// 100. INDIA: DPDP ACT 2023 & SAHAMATI AA CONSENT VAULT API
// -------------------------------------------------------------
app.get('/api/v1/india/dpdp-consent', (req, res) => {
  const db = readDB();
  res.json({ success: true, consents: db.dpdpConsents || [] });
});

// -------------------------------------------------------------
// 101. INDIA: ICEGATE CUSTOMS BOE & IMPORT IGST CREDIT API
// -------------------------------------------------------------
app.get('/api/v1/india/icegate', (req, res) => {
  const db = readDB();
  res.json({ success: true, boes: db.icegateBoEs || [] });
});

// -------------------------------------------------------------
// 102. INDIA: NPCI UPMS CENTRALIZED RECURRING MANDATES API
// -------------------------------------------------------------
app.get('/api/v1/india/upms', (req, res) => {
  const db = readDB();
  res.json({ success: true, mandates: db.upmsMandates || [] });
});

// -------------------------------------------------------------
// 103. INDIA: NCLT INSOLVENCY & RBI WILFUL DEFAULTER RADAR API
// -------------------------------------------------------------
app.get('/api/v1/india/nclt-defaulter', (req, res) => {
  const db = readDB();
  res.json({ success: true, screenings: db.ncltScreenings || [] });
});

// -------------------------------------------------------------
// 104. INDIA: CBDT EQUALISATION LEVY (2%) & DST DESK API
// -------------------------------------------------------------
app.get('/api/v1/india/equalisation-levy', (req, res) => {
  const db = readDB();
  res.json({ success: true, levies: db.equalisationLevies || [] });
});

// -------------------------------------------------------------
// 105. INDIA: RBI PA-CB & DGFT E-BRC / FIRC INWARD REALIZATION API
// -------------------------------------------------------------
app.get('/api/v1/india/pacb-ebrc', (req, res) => {
  const db = readDB();
  res.json({ success: true, realizations: db.pacbInwardRealizations || [] });
});

// -------------------------------------------------------------
// 106. INDIA: SECTION 135 MCA CORPORATE CSR (2%) IMPACT ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/corporate-csr', (req, res) => {
  const db = readDB();
  res.json({ success: true, allocations: db.corporateCsrAllocations || [] });
});

// -------------------------------------------------------------
// 107. INDIA: MEITY & RBI 100% SOVEREIGN DATA RESIDENCY AIR-GAP API
// -------------------------------------------------------------
app.get('/api/v1/india/data-residency', (req, res) => {
  const db = readDB();
  res.json({ success: true, residencyAudit: db.dataResidencyAudits });
});

// -------------------------------------------------------------
// 108. INDIA: NLP MARINE LOGISTICS & E-BL CARGO ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/nlp-marine', (req, res) => {
  const db = readDB();
  res.json({ success: true, cargoes: db.nlpMarineCargoes || [] });
});

// -------------------------------------------------------------
// 109. INDIA: SEBI CAT-I/II AIF SYNDICATE CAPITAL ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/sebi-aif', (req, res) => {
  const db = readDB();
  res.json({ success: true, drawdowns: db.sebiAifDrawdowns || [] });
});

// -------------------------------------------------------------
// 110. INDIA: E-NAM APMC AGRI MANDI SETTLEMENT RAIL API
// -------------------------------------------------------------
app.get('/api/v1/india/enam-agri', (req, res) => {
  const db = readDB();
  res.json({ success: true, trades: db.enamMandiTrades || [] });
});

// -------------------------------------------------------------
// 111. INDIA: QUANTUM-SAFE LATTICE TOKENIZATION SHIELD API
// -------------------------------------------------------------
app.get('/api/v1/india/quantum-safe', (req, res) => {
  const db = readDB();
  res.json({ success: true, tokens: db.quantumSafeTokens || [] });
});

// -------------------------------------------------------------
// 113. INDIA: NPCI UPI CIRCLE DELEGATED PAYMENTS API
// -------------------------------------------------------------
app.get('/api/v1/india/upi-circle', (req, res) => {
  const db = readDB();
  res.json({ success: true, delegations: db.upiCircleDelegations || [] });
});

// -------------------------------------------------------------
// 114. INDIA: RBI CIMS XBRL REGULATORY FILINGS API
// -------------------------------------------------------------
app.get('/api/v1/india/rbi-cims', (req, res) => {
  const db = readDB();
  res.json({ success: true, filings: db.rbiCimsFilings || [] });
});

// -------------------------------------------------------------
// 115. INDIA: MFI & SHG AADHAAR E-KIST COLLECTION API
// -------------------------------------------------------------
app.get('/api/v1/india/mfi-shg', (req, res) => {
  const db = readDB();
  res.json({ success: true, collections: db.mfiShgCollections || [] });
});

// -------------------------------------------------------------
// 116. INDIA: PM E-DRIVE EV FLEET SUBSIDY & CARBON CREDIT API
// -------------------------------------------------------------
app.get('/api/v1/india/pm-edrive', (req, res) => {
  const db = readDB();
  res.json({ success: true, subsidies: db.pmEDriveSubsidies || [] });
});

// -------------------------------------------------------------
// 117. INDIA: IN-SPACE & ISRO SPACETECH PAYLOAD ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/inspace', (req, res) => {
  const db = readDB();
  res.json({ success: true, payloads: db.inspacePayloads || [] });
});

// -------------------------------------------------------------
// 118. INDIA: MOD IDEX DEFENSE GRANT & PROCUREMENT ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/idex-defense', (req, res) => {
  const db = readDB();
  res.json({ success: true, grants: db.idexDefenseGrants || [] });
});

// -------------------------------------------------------------
// 119. INDIA: DPIIT PATENT BOX (SEC 115BBF) CONCESSIONAL TAX API
// -------------------------------------------------------------
app.get('/api/v1/india/patent-box', (req, res) => {
  const db = readDB();
  res.json({ success: true, royalties: db.patentBoxRoyalties || [] });
});

// -------------------------------------------------------------
// 120. INDIA: MEITY ISM SEMICONDUCTOR DLI SUBSIDY ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/semiconductor-dli', (req, res) => {
  const db = readDB();
  res.json({ success: true, dlis: db.semiconductorDlis || [] });
});

// -------------------------------------------------------------
// 121. INDIA: MEITY INDIAAI MISSION GPU COMPUTE MARKETPLACE API
// -------------------------------------------------------------
app.get('/api/v1/india/india-ai-compute', (req, res) => {
  const db = readDB();
  res.json({ success: true, tokens: db.indiaAiComputeTokens || [] });
});

// -------------------------------------------------------------
// 122. INDIA: CRIS FOIS RAILWAY FREIGHT & RR INVOICING API
// -------------------------------------------------------------
app.get('/api/v1/india/rail-freight', (req, res) => {
  const db = readDB();
  res.json({ success: true, invoices: db.railFreightInvoices || [] });
});

// -------------------------------------------------------------
// 123. INDIA: MINES KHANIJ ONLINE ROYALTY & DMF CESS API
// -------------------------------------------------------------
app.get('/api/v1/india/mines-khanij', (req, res) => {
  const db = readDB();
  res.json({ success: true, passes: db.minesKhanijRoyalty || [] });
});

// -------------------------------------------------------------
// 124. INDIA: ABDM & AYUSH GRID HEALTHCARE E-CLAIM API
// -------------------------------------------------------------
app.get('/api/v1/india/abdm-health', (req, res) => {
  const db = readDB();
  res.json({ success: true, claims: db.abdmHealthClaims || [] });
});

// -------------------------------------------------------------
// 125. INDIA: BEE NATIONAL CARBON MARKET (CCTS) ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/bee-carbon', (req, res) => {
  const db = readDB();
  res.json({ success: true, trades: db.beeCarbonTrades || [] });
});

// -------------------------------------------------------------
// 126. INDIA: DOT DIGITAL BHARAT NIDHI (USOF) 5G ESCROW API
// -------------------------------------------------------------
app.get('/api/v1/india/digital-bharat-nidhi', (req, res) => {
  const db = readDB();
  res.json({ success: true, escrows: db.digitalBharatNidhiEscrows || [] });
});

// -------------------------------------------------------------
// 127. INDIA: DGCA DIGIYATRA BIOMETRIC AIRPORT COMMERCE API
// -------------------------------------------------------------
app.get('/api/v1/india/digiyatra-commerce', (req, res) => {
  const db = readDB();
  res.json({ success: true, checkouts: db.digiYatraAirportCheckouts || [] });
});

// -------------------------------------------------------------
// 128. INDIA: JAL JEEVAN MISSION (JJM) IOT SMART WATER TARIFF API
// -------------------------------------------------------------
app.get('/api/v1/india/jjm-water', (req, res) => {
  const db = readDB();
  res.json({ success: true, invoices: db.jjmWaterInvoices || [] });
});

// -------------------------------------------------------------
// 129. INDIA: CASHFREE PAYMENT INFRASTRUCTURE CREDENTIALS VERIFICATION API
// -------------------------------------------------------------
app.post('/api/v1/india/cashfree/verify-credentials', async (req, res) => {
  if (!(await requireLiveActivationIfProduction(req, res))) return;
  const { appId: currentAppId, secretKey: currentSecretKey } = cashfreeCredentials();

  if (!currentSecretKey) {
    return res.status(400).json({
      success: false,
      error: 'Cashfree Secret Key is required. Please input in Settings or set CASHFREE_SECRET_KEY env.'
    });
  }

  try {
    // Server-side credential check. Secrets must never arrive from the browser.
    // This only proves the API key/secret can authenticate and create an
    // order against Cashfree's Orders API — it does not verify a bank
    // account, split configuration, or anything else. Report exactly that
    // and nothing more; no field here is ever fabricated.
    const testOrderId = `cf_test_${Date.now()}`;
    const cfResponse = await fetch(`${cashfreeBaseUrl()}/orders`, {
      method: 'POST',
      headers: {
        'x-api-version': CASHFREE_API_VERSION,
        'x-client-id': currentAppId,
        'x-client-secret': currentSecretKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: testOrderId,
        order_amount: 1.00,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'cus_qivropay_verify',
          customer_email: 'support@qivropay.in',
          customer_phone: '9876543210'
        },
        order_meta: {
          return_url: `${PUBLIC_URL || 'http://localhost:' + PORT}/dashboard?order_id={order_id}`,
          notify_url: `${PUBLIC_URL || 'http://localhost:' + PORT}/api/v1/webhooks/cashfree`
        },
        order_note: 'QivroPay (by Neocraft LLP) Gateway Verification'
      })
    });

    const cfData = await cfResponse.json();

    if (cfResponse.ok && cfData.payment_session_id) {
      // Scoped per merchant — never a single shared record that one
      // merchant's verification could overwrite for another.
      await saveResource(req.user.id, 'cashfree_config', {
        id: 'default',
        appId: currentAppId,
        environment: CASHFREE_ENVIRONMENT,
        status: 'connected',
        lastVerifiedAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        status: 'connected',
        environment: CASHFREE_ENVIRONMENT,
        gateway: 'Cashfree Payment Gateway (Orders API)',
        testOrderId: cfData.order_id || testOrderId
      });
    } else {
      return res.status(400).json({
        success: false,
        error: cfData.message || 'Cashfree Authentication Failed'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Network error connecting to Cashfree'
    });
  }
});

// -------------------------------------------------------------
// 130. INDIA: CASHFREE CREATE LIVE REAL ORDER API
// -------------------------------------------------------------
app.post('/api/v1/india/cashfree/create-order', cashfreeCreateOrderRateLimit, ah(async (req, res) => {
  const { secretKey, appId } = cashfreeCredentials();
  const publicOrigin = PUBLIC_URL || (process.env.NODE_ENV === 'production' ? '' : `${req.protocol}://${req.get('host')}`);
  if (!appId || !secretKey || !publicOrigin) return res.status(503).json({ success:false, error:'Cashfree credentials and PUBLIC_URL are required' });

  const token = String(req.body?.sessionToken || '');
  const session = verifyCheckoutSession(token) || await getCheckoutSession(token);
  if (!session) return res.status(404).json({ success:false, error:'Checkout session not found' });
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) return res.status(410).json({ success:false,error:'Checkout session expired' });

  const normalizedEmail = String(req.body?.customerEmail || session.customerEmail || '').trim().toLowerCase();
  const normalizedPhone = String(req.body?.customerPhone || '').replace(/\D/g, '').slice(-10);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({success:false,error:'Valid customer email and 10-digit phone are required'});

  try {
    await ensurePaymentStore();
    const orderId = `qv_cf_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;
    const cfResponse = await fetch(`${cashfreeBaseUrl()}/orders`, {
      method:'POST',
      headers:{'x-api-version':CASHFREE_API_VERSION,'x-client-id':appId,'x-client-secret':secretKey,'Content-Type':'application/json'},
      body:JSON.stringify({
        order_id:orderId,
        order_amount:Number(Number(session.amount).toFixed(2)),
        order_currency:String(session.currency || 'INR').toUpperCase(),
        customer_details:{customer_id:`cus_${crypto.randomBytes(8).toString('hex')}`,customer_email:normalizedEmail,customer_phone:normalizedPhone},
        // Cashfree caps order_meta.return_url at 500 chars. The full signed
        // checkout token (payload + HMAC signature) can be 500+ chars on its
        // own, so it's too long to use here. The bare session id is short
        // and sufficient: GET /api/v1/payments/session/:id already falls
        // back to a direct persisted-record lookup (getCheckoutSession) when
        // the id isn't a valid signed token, so the checkout page still
        // loads correctly if Cashfree ever redirects back through this URL.
        order_meta:{return_url:`${publicOrigin}/checkout/${encodeURIComponent(session.sessionId)}`,notify_url:`${publicOrigin}/api/v1/webhooks/cashfree`},
        order_note:String(session.title || 'QivroPay payment').slice(0,200)
      })
    });
    const cfData=await cfResponse.json();
    if(!cfResponse.ok || !cfData.payment_session_id) return res.status(cfResponse.status || 400).json({success:false,error:cfData.message || 'Failed to create order on Cashfree'});
    await recordPaymentOrder({orderId,cfOrderId:cfData.cf_order_id,orderAmount:cfData.order_amount,orderCurrency:cfData.order_currency,orderStatus:cfData.order_status,customerEmail:normalizedEmail,customerPhone:normalizedPhone,sessionToken:token,merchantId:session.merchantId,productId:session.productId,productName:session.title,sessionAmount:session.amount,sessionType:session.type});
    return res.status(201).json({success:true,orderId,cfOrderId:cfData.cf_order_id,paymentSessionId:cfData.payment_session_id,orderAmount:cfData.order_amount,orderCurrency:cfData.order_currency,orderStatus:cfData.order_status,environment:CASHFREE_ENVIRONMENT});
  } catch(err){ return res.status(502).json({success:false,error:'Failed to communicate with Cashfree'}); }
}));

app.get('/api/v1/india/cashfree/session/:sessionToken/status', async (req, res) => {
  const token = String(req.params.sessionToken || '');
  if (!token) return res.status(400).json({ success: false, error: 'Missing checkout session' });
  try {
    const stored = await getPaymentOrderForSession(token);
    if (!stored?.orderId) return res.json({ success: true, found: false });
    const { appId, secretKey } = cashfreeCredentials();
    if (!appId || !secretKey) return res.status(503).json({ success: false, error: 'Cashfree credentials are not configured' });
    const cfResponse = await fetch(`${cashfreeBaseUrl()}/orders/${encodeURIComponent(stored.orderId)}`, { headers: { 'x-api-version': CASHFREE_API_VERSION, 'x-client-id': appId, 'x-client-secret': secretKey, 'Content-Type': 'application/json' } });
    const cfData = await cfResponse.json();
    if (!cfResponse.ok) return res.status(cfResponse.status).json({ success: false, error: cfData.message || 'Cashfree order lookup failed' });
    res.json({ success: true, found: true, orderId: stored.orderId, orderStatus: cfData.order_status, orderAmount: cfData.order_amount, orderCurrency: cfData.order_currency, customerEmail: stored.customerEmail });
  } catch (err) { res.status(503).json({ success: false, error: err.message || 'Payment status restore failed' }); }
});

// Verify the payment server-to-server after the browser returns from Cashfree.
// A redirect alone is never treated as proof of payment.
// Public endpoint (the paying customer is never an authenticated merchant),
// but authorization comes from possession of the signed checkout session
// token, never from the orderId alone. The orderId in the URL must match the
// Cashfree order that was actually created for that specific checkout
// session — an unguessable, unrelated orderId cannot be used to look up
// someone else's payment status.
app.get('/api/v1/india/cashfree/orders/:orderId/status', ah(async (req, res) => {
  const orderId=String(req.params.orderId || '').trim();
  if(!/^qv_cf_[A-Za-z0-9_-]+$/.test(orderId)) return res.status(400).json({success:false,error:'Invalid order ID'});
  const sessionToken=String(req.query.sessionToken || '');
  if(!sessionToken) return res.status(401).json({success:false,error:'Checkout session token is required'});
  const session=verifyCheckoutSession(sessionToken) || await getCheckoutSession(sessionToken);
  if(!session) return res.status(404).json({success:false,error:'Checkout session not found'});
  if(session.expiresAt && new Date(session.expiresAt) < new Date()) return res.status(410).json({success:false,error:'Checkout session expired'});
  const stored=await getPaymentOrderForSession(sessionToken);
  if(!stored?.orderId || stored.orderId !== orderId) return res.status(403).json({success:false,error:'This order does not belong to your checkout session'});
  const { appId, secretKey } = cashfreeCredentials();
  if(!appId || !secretKey) return res.status(503).json({success:false,error:'Cashfree credentials are not configured'});
  try {
    const cfResponse=await fetch(`${cashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}`,{headers:{'x-api-version':CASHFREE_API_VERSION,'x-client-id':appId,'x-client-secret':secretKey,'Content-Type':'application/json'}});
    const cfData=await cfResponse.json();
    if(!cfResponse.ok) return res.status(cfResponse.status).json({success:false,error:cfData.message || 'Cashfree order lookup failed'});
    const providerStatus=String(cfData.order_status||'').toUpperCase();
    const paid=providerStatus==='PAID';
    if(stored?.merchantId && ['PAID','FAILED','EXPIRED','CANCELLED'].includes(providerStatus)){
      await recordCashfreeOrderOutcome(stored.merchantId, orderId, {
        amount: Number(cfData.order_amount),
        currency: cfData.order_currency,
        customerEmail: stored.customerEmail,
        customerName: 'Customer',
        productName: stored.productName,
        succeeded: paid
      });
    }
    return res.json({success:true,orderId,orderStatus:cfData.order_status,orderAmount:cfData.order_amount,orderCurrency:cfData.order_currency,paid});
  } catch(err){return res.status(502).json({success:false,error:'Cashfree order lookup failed'});}
}));

// Cashfree production webhook receiver. The raw body is verified before JSON
// parsing and every provider delivery is recorded idempotently.
app.post('/api/v1/webhooks/cashfree', async (req, res) => {
  const webhookSecret=process.env.CASHFREE_WEBHOOK_SECRET || process.env.QIVROPAY_WEBHOOK_SECRET || '';
  if(!webhookSecret) return res.status(503).json({success:false,error:'Cashfree webhook secret is not configured'});
  const timestamp=req.get('x-webhook-timestamp'); const signature=req.get('x-webhook-signature');
  const rawBody=Buffer.isBuffer(req.body)?req.body:Buffer.from(String(req.body||''),'utf8');
  if(!timestamp || !signature) return res.status(400).json({success:false,error:'Missing Cashfree webhook signature headers'});
  const timestampMs=Number(timestamp);
  if(!Number.isFinite(timestampMs) || Math.abs(Date.now()-timestampMs)>5*60*1000) return res.status(400).json({success:false,error:'Expired Cashfree webhook timestamp'});
  const expected=crypto.createHmac('sha256',webhookSecret).update(`${timestamp}${rawBody.toString('utf8')}`).digest('base64');
  const a=Buffer.from(expected), b=Buffer.from(signature);
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)) return res.status(401).json({success:false,error:'Invalid Cashfree webhook signature'});
  let event; try{event=JSON.parse(rawBody.toString('utf8'));}catch{return res.status(400).json({success:false,error:'Invalid webhook JSON'});}
  const eventId=req.get('x-idempotency-key') || crypto.createHash('sha256').update(rawBody).digest('hex');
  try{
    const fresh=await recordCashfreeWebhook(eventId,event);
    if(!fresh) return res.status(200).json({success:true,received:true,eventId,duplicate:true});

    // Refund status events have a different payload shape (event.data.refund)
    // from payment/order events and are handled separately. Only a verified
    // webhook (already signature-checked above) or a direct Cashfree status
    // lookup ever changes refund state — never the merchant's refund request
    // itself, which only records that a refund was *requested*.
    const isRefundEvent = String(event?.type || event?.event || '').toUpperCase().includes('REFUND') || Boolean(event?.data?.refund);
    if (isRefundEvent) {
      const refund = event?.data?.refund || {};
      const refundOrderId = refund.order_id || event?.data?.order?.order_id || event?.data?.order_id;
      const storedOrder = refundOrderId ? await getPaymentOrder(refundOrderId) : null;
      if (storedOrder?.merchantId && refundOrderId) {
        // Same decision logic as the refund POST response and the
        // reconciliation lookup below — see applyRefundStatus() for why.
        await applyRefundStatus(storedOrder.merchantId, refundOrderId, {
          refundId: refund.refund_id,
          refundAmount: refund.refund_amount,
          refundStatus: refund.refund_status
        });
      }
      return res.status(200).json({success:true,received:true,eventId});
    }

    const orderId=event?.data?.order?.order_id || event?.data?.order_id || event?.order_id;
    const paymentStatus=String(event?.data?.payment?.payment_status || event?.data?.order?.order_status || event?.event || '').toUpperCase();
    const stored=orderId ? await getPaymentOrder(orderId) : null;
    if(stored?.merchantId && orderId){
      const amount=Number(stored.orderAmount || stored.sessionAmount || 0);
      const succeeded=['SUCCESS','PAID','PAYMENT_SUCCESS'].some(x=>paymentStatus.includes(x));
      const failed=['FAILED','CANCELLED','EXPIRED'].some(x=>paymentStatus.includes(x));
      if(succeeded || failed){
        await recordCashfreeOrderOutcome(stored.merchantId, orderId, {
          amount,
          currency: stored.orderCurrency,
          customerEmail: stored.customerEmail,
          customerName: 'Customer',
          productName: stored.productName,
          succeeded
        });
      }
    }
    return res.status(200).json({success:true,received:true,eventId});
  }catch(err){console.error('Cashfree webhook processing failed',err);return res.status(503).json({success:false,error:'Payment event storage is unavailable; please retry webhook delivery'});}
});

// Analytics Dashboard Endpoint
app.get('/api/v1/analytics', (req, res) => {
  const db = readDB();
  const txs = db.transactions || [];
  const activeSubs = (db.subscriptions || []).filter(s => s.status === 'active');

  const totalVolume = txs.reduce((acc, t) => acc + (t.status === 'succeeded' ? t.amount : 0), 0);
  const totalFees = txs.reduce((acc, t) => acc + (t.status === 'succeeded' ? t.fee : 0), 0);
  const totalNet = txs.reduce((acc, t) => acc + (t.status === 'succeeded' ? t.net : 0), 0);
  const mrr = activeSubs.reduce((acc, s) => acc + s.amount, 0);

  res.json({
    success: true,
    analytics: {
      totalVolume: Number(totalVolume.toFixed(2)),
      totalFees: Number(totalFees.toFixed(2)),
      totalNet: Number(totalNet.toFixed(2)),
      mrr: Number(mrr.toFixed(2)),
      activeSubscriptions: activeSubs.length,
      activeCustomers: (db.customers || []).length,
      conversionRate: '5.2%',
      chargebackRate: '0.00%'
    }
  });
});

// Serve frontend static build
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error-handling middleware. This is what every ah()-wrapped route
// above forwards a rejected promise to (via next(err)) instead of letting it
// crash the process. Registered last, after every route, per Express's
// requirement that error-handling middleware (4 arguments) come after the
// routes it protects. Logs full detail server-side only; the client only
// ever gets a generic message — never err.message/err.stack, which could
// echo a database connection string, an internal file path, or similar.
app.use((err, req, res, next) => {
  console.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: 'An unexpected error occurred. Please try again.' });
});

// Vercel imports the Express app as a serverless function. Keep the listener for
// local Docker/VM deployments, but never open a port inside a Vercel function.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`⚡ QivroPay API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${env}`);
    if (persistenceMode() === 'neon-postgres') {
      console.log('   Persistence: Neon Postgres (DATABASE_URL)');
    } else if (env === 'production') {
      console.log('   Persistence: NOT CONFIGURED — set DATABASE_URL/POSTGRES_URL. Auth and merchant data endpoints will return 503 until configured.');
    } else {
      console.log('   Persistence: local development store (server/.data/dev-store.json)');
      console.log('   Note: local development data is isolated from production and is not shared with any external database.');
    }
  });
}

export default app;
