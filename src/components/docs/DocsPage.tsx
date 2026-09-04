import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { Terminal, Copy, CheckCircle2, Play, BookOpen, Webhook, AlertCircle } from 'lucide-react';

type EndpointId = 'create_session' | 'create_product' | 'refund' | 'refund_status' | 'webhooks' | 'limitations';

// Endpoints where "Execute Request" makes sense against the live sandbox
// without any prior state (no transactionId to look up, nothing to refund).
const CALLABLE_ENDPOINTS: EndpointId[] = ['create_session', 'create_product'];
// Purely informational panels — not a single callable request.
const INFO_ENDPOINTS: EndpointId[] = ['webhooks', 'limitations'];

// Visual treatment per HTTP method / indicator badge — kept separate from
// content so sidebar and header badges read consistently at a glance.
const METHOD_STYLES: Record<string, string> = {
  POST: 'text-[#0071e3] bg-blue-50 border-blue-100',
  GET: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  INFO: 'text-[#6e6e73] bg-black/[0.04] border-black/10',
};

export const DocsPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointId>('create_session');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const endpoints: Array<{ id: EndpointId; name: string; method: string; path: string }> = [
    { id: 'create_session', name: 'Create a Checkout Session (UPI & Cards)', method: 'POST', path: '/api/v1/payments/create-session' },
    { id: 'create_product', name: 'Create a Product', method: 'POST', path: '/api/v1/products' },
    { id: 'refund', name: 'Refund a Payment', method: 'POST', path: '/api/v1/payments/refund' },
    { id: 'refund_status', name: 'Check Refund Status', method: 'GET', path: '/api/v1/payments/refund-status/:transactionId' },
    { id: 'webhooks', name: 'Webhooks', method: 'INFO', path: 'What exists today' },
    { id: 'limitations', name: 'V1 Limitations', method: 'INFO', path: 'What is not built yet' },
  ];

  const handleTestCall = async () => {
    setIsCalling(true);
    try {
      let res;
      if (selectedEndpoint === 'create_session') {
        res = await fetch('/api/v1/payments/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: "Demo Product",
            amount: 4999.00,
            currency: "INR",
            customerEmail: "customer@example.com"
          })
        });
      } else if (selectedEndpoint === 'create_product') {
        res = await fetch('/api/v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: "Demo Product",
            price: 9999,
            currency: "INR",
            type: "one_time"
          })
        });
      } else {
        return;
      }

      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setTestResult(JSON.stringify({ error: 'Failed to make API request' }, null, 2));
    } finally {
      setIsCalling(false);
    }
  };

  const active = endpoints.find(e => e.id === selectedEndpoint)!;
  const isInfo = INFO_ENDPOINTS.includes(selectedEndpoint);
  const isCallable = CALLABLE_ENDPOINTS.includes(selectedEndpoint);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#1d1d1f] flex flex-col font-sans">
      <Navbar />

      {/* Cleared by the navbar's real rendered height (published as a CSS
          custom property by Navbar itself) rather than a guessed static
          offset — stays correct across breakpoints and if the navbar's
          own height ever changes. */}
      <main className="flex-1 w-full" style={{ paddingTop: 'var(--qp-navbar-height, 4.5rem)' }}>

        {/* Intro / page header */}
        <div className="border-b border-black/5 bg-[#fafafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0071e3] mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Developer Documentation
            </div>
            <h1 className="text-3xl sm:text-[2.25rem] sm:leading-tight font-bold text-[#1d1d1f] font-heading tracking-tight">
              API Reference
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73] max-w-2xl leading-relaxed">
              Integrate checkout sessions, products, and refunds directly from your server using QivroPay's REST API. Use test keys for sandbox demos until live activation is approved.
            </p>
          </div>
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* Docs Sidebar (3 Cols) */}
            <aside className="lg:col-span-3">
              <div
                className="space-y-6 lg:sticky"
                style={{ top: 'calc(var(--qp-navbar-height, 4.5rem) + 1.5rem)' }}
              >
                <div className="p-5 rounded-3xl bg-[#f5f5f7] border border-black/5 space-y-4">
                  <div className="font-bold text-[#1d1d1f] text-sm flex items-center gap-2 font-sans">
                    <BookOpen className="w-4 h-4 text-[#0071e3]" />
                    API Reference
                  </div>

                  <div className="space-y-1.5">
                    {endpoints.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => { setSelectedEndpoint(ep.id); setTestResult(null); }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors font-medium border ${
                          selectedEndpoint === ep.id
                            ? 'bg-white text-[#1d1d1f] shadow-sm font-bold border-black/5'
                            : 'text-[#6e6e73] border-transparent hover:text-[#1d1d1f] hover:bg-white/60'
                        }`}
                      >
                        <span>{ep.name}</span>
                        <span className={`shrink-0 px-1.5 py-0.5 rounded-md font-mono text-[9px] uppercase font-bold border ${METHOD_STYLES[ep.method]}`}>
                          {ep.method}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#f5f5f7] border border-black/5 space-y-3 text-xs">
                  <div className="font-bold text-[#1d1d1f]">Authentication</div>
                  <p className="text-[#6e6e73] leading-relaxed">
                    There is no separate SDK yet — call the REST API directly from your server with a generated API key.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Docs Content (9 Cols) */}
            <section className="lg:col-span-9 space-y-8">

              <div className="space-y-2 pb-6 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${METHOD_STYLES[active.method]}`}>
                    {active.method}
                  </span>
                  <code className="font-mono text-sm text-[#1d1d1f] font-bold break-all">
                    {active.path}
                  </code>
                </div>
                <h2 className="text-2xl sm:text-[1.75rem] font-bold text-[#1d1d1f] font-heading">
                  {active.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  {selectedEndpoint === 'webhooks' && 'How payment status actually reaches your dashboard today.'}
                  {selectedEndpoint === 'limitations' && 'What QivroPay V1 does and does not support yet — read this before you integrate.'}
                  {!isInfo && <>Execute authenticated requests with your <code>qivro_test_...</code> secret key for sandbox, or a live key only after production activation.</>}
                </p>
              </div>

              {selectedEndpoint === 'webhooks' && (
                /* Webhooks — informational only, not a callable endpoint */
                <div className="rounded-3xl bg-white border border-black/10 shadow-sm p-6 space-y-4 text-sm text-[#3a3a3c] leading-relaxed">
                  <div className="flex items-start gap-3">
                    <Webhook className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-[#1d1d1f]">Inbound (live): Cashfree → QivroPay</div>
                      <p className="mt-1">Cashfree notifies QivroPay's backend when a payment or refund's status changes. Every event's signature is verified server-side, with replay protection, before it updates your dashboard. This is what marks a payment succeeded or a refund confirmed — you don't configure or receive this directly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-4 border-t border-black/5">
                    <Webhook className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-[#1d1d1f]">Outbound to your server: not available yet</div>
                      <p className="mt-1">QivroPay does not currently deliver webhook events to a URL on your own backend. If your integration needs to react to a payment or refund, poll the relevant endpoint from your server instead of waiting for a callback.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEndpoint === 'limitations' && (
                /* V1 limitations — informational only */
                <div className="rounded-3xl bg-white border border-black/10 shadow-sm p-6 space-y-4 text-sm text-[#3a3a3c] leading-relaxed">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-[#1d1d1f]">Currently supported in V1</div>
                      <ul className="mt-1.5 list-disc pl-5 space-y-1">
                        <li>INR-only checkout via Cashfree (UPI, Visa, Mastercard, RuPay)</li>
                        <li>One-time payments and shareable payment links</li>
                        <li>API-key authentication for server-to-server requests</li>
                        <li>Signed, tamper-proof checkout sessions</li>
                        <li>Refunds and refund status reconciliation</li>
                        <li>Inbound Cashfree webhook handling (signature-verified)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-4 border-t border-black/5">
                    <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-[#1d1d1f]">Not yet available</div>
                      <ul className="mt-1.5 list-disc pl-5 space-y-1">
                        <li>Multi-currency or non-INR settlement</li>
                        <li>Subscriptions or recurring billing (UPI AutoPay included)</li>
                        <li>Outbound webhooks to your own backend</li>
                        <li>A first-party SDK — integrate via the REST API directly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {!isInfo && (
                /* Code Box */
                <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden font-mono text-xs">
                  <div className="px-5 py-3.5 border-b border-black/5 bg-[#fafafc] flex justify-between items-center font-sans">
                    <span className="text-[#1d1d1f] font-bold">Request Example</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-black/10 text-[10px] font-mono font-semibold text-[#0071e3]">
                      Auth: Bearer Token
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 text-slate-200 leading-relaxed overflow-x-auto bg-[#090a0c]">
                    {selectedEndpoint === 'create_session' && (
                      <pre className="text-emerald-400">
{`curl -X POST https://YOUR_QIVROPAY_DOMAIN/api/v1/payments/create-session \\
  -H "Authorization: Bearer qivro_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Demo Product",
    "amount": 4999.00,
    "currency": "INR",
    "customerEmail": "customer@example.com"
  }'`}
                      </pre>
                    )}

                    {selectedEndpoint === 'create_product' && (
                      <pre className="text-purple-300">
{`curl -X POST https://YOUR_QIVROPAY_DOMAIN/api/v1/products \\
  -H "Authorization: Bearer qivro_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Demo Product",
    "price": 9999.00,
    "currency": "INR",
    "type": "one_time"
  }'`}
                      </pre>
                    )}

                    {selectedEndpoint === 'refund' && (
                      <pre className="text-amber-300">
{`curl -X POST https://YOUR_QIVROPAY_DOMAIN/api/v1/payments/refund \\
  -H "Authorization: Bearer qivro_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "transactionId": "cs_...",
    "amount": 4999.00,
    "note": "Customer requested refund"
  }'

# amount is optional — omit it for a full refund.
# Only one refund can be in flight per transaction at a time.`}
                      </pre>
                    )}

                    {selectedEndpoint === 'refund_status' && (
                      <pre className="text-amber-300">
{`curl https://YOUR_QIVROPAY_DOMAIN/api/v1/payments/refund-status/cs_... \\
  -H "Authorization: Bearer qivro_test_..."

# Reconciles a refund left "pending" against Cashfree's own refund_status.
# Safe to call repeatedly from any session — it is a no-op once the
# refund has reached a terminal state.`}
                      </pre>
                    )}
                  </div>

                  {/* Action Bar — only for endpoints that can be safely called with no prior state */}
                  {isCallable && (
                    <div className="px-5 py-3.5 border-t border-black/5 bg-[#fafafc] flex justify-between items-center font-sans">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#86868b]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Live Sandbox
                      </span>
                      <button
                        onClick={handleTestCall}
                        disabled={isCalling}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#0A0D14] hover:bg-[#202430] active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        {isCalling ? 'Sending...' : 'Execute Request'}
                      </button>
                    </div>
                  )}

                  {/* Result Preview */}
                  {isCallable && testResult && (
                    <div className="p-4 border-t border-emerald-500/20 bg-emerald-50/50 text-xs font-mono">
                      <div className="flex justify-between text-emerald-900 font-bold mb-2">
                        <span>Server Response:</span>
                        <span className="text-[10px] text-emerald-700">qivropay-core/1.0</span>
                      </div>
                      <pre className="text-emerald-900 overflow-x-auto p-3 bg-white rounded-2xl border border-emerald-200">
                        {testResult}
                      </pre>
                    </div>
                  )}
                </div>
              )}

            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
