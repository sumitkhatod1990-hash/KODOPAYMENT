import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { Terminal, Copy, CheckCircle2, Play, BookOpen } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'create_session' | 'track_meter' | 'create_product' | 'webhooks'>('create_session');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const endpoints = [
    { id: 'create_session', name: 'Create INR Checkout Session (UPI & Cards)', method: 'POST', path: '/api/v1/payments/create-session' },
    { id: 'track_meter', name: 'Track AI Token / Usage Meter', method: 'POST', path: '/api/v1/meters/track' },
    { id: 'create_product', name: 'Create SaaS Plan / UPI AutoPay', method: 'POST', path: '/api/v1/products' },
    { id: 'webhooks', name: 'Verify HMAC Webhooks (Payment & Easy Split)', method: 'POST', path: '/api/v1/webhooks' },
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
            title: "Pro SaaS Subscription (Monthly)",
            amount: 4999.00,
            currency: "INR",
            customerEmail: "founder@bangalore-tech.in",
            customerGstin: "29ABCDE1234F1Z5",
            paymentMethods: ["upi", "upi_autopay", "rupay_card", "netbanking"]
          })
        });
      } else if (selectedEndpoint === 'create_product') {
        res = await fetch('/api/v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: "AI Agents Scale Tier (UPI AutoPay)",
            price: 9999,
            currency: "INR",
            type: "subscription",
            billingInterval: "month",
            hsnSacCode: "998313"
          })
        });
      } else {
        res = await fetch('/api/v1/webhooks/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            eventType: 'payment.succeeded',
            data: {
              orderId: 'kodo_ord_99018',
              grossAmount: 10000,
              merchantShare: 9600,
              kodoFee: 300,
              tdsWithheld194O: 100,
              payoutMode: 'IMPS_T0'
            }
          })
        });
      }

      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setTestResult(JSON.stringify({ error: 'Failed to make API request' }, null, 2));
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#1d1d1f] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Docs Sidebar (3 Cols) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-5 rounded-3xl bg-[#f5f5f7] border border-black/5 space-y-4">
              <div className="font-bold text-[#1d1d1f] text-sm flex items-center gap-2 font-sans">
                <BookOpen className="w-4 h-4 text-[#0071e3]" />
                API Reference
              </div>

              <div className="space-y-1">
                {endpoints.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => { setSelectedEndpoint(ep.id as any); setTestResult(null); }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors font-medium ${
                      selectedEndpoint === ep.id
                        ? 'bg-white text-[#1d1d1f] shadow-sm font-bold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/60'
                    }`}
                  >
                    <span>{ep.name}</span>
                    <span className="font-mono text-[10px] uppercase font-bold text-[#0071e3]">{ep.method}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#f5f5f7] border border-black/5 space-y-3 text-xs">
              <div className="font-bold text-[#1d1d1f]">SDK Installation</div>
              <div className="p-2.5 rounded-xl bg-white border border-black/5 font-mono text-[11px] text-[#1d1d1f] shadow-sm">
                npm i @kodo/payments
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-black/5 font-mono text-[11px] text-[#1d1d1f] shadow-sm">
                pip install kodo-payments
              </div>
            </div>
          </aside>

          {/* Main Docs Content (9 Cols) */}
          <section className="lg:col-span-9 space-y-8">
            
            <div className="space-y-2 pb-6 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] font-mono text-[11px] font-bold border border-blue-100">
                  POST
                </span>
                <code className="font-mono text-sm text-[#1d1d1f] font-bold">
                  {endpoints.find(e => e.id === selectedEndpoint)?.path}
                </code>
              </div>
              <h1 className="text-2xl font-bold text-[#1d1d1f] font-heading">
                {endpoints.find(e => e.id === selectedEndpoint)?.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                Execute authenticated requests with your <code>kodo_live_...</code> or <code>kodo_test_...</code> secret key.
              </p>
            </div>

            {/* Code Box */}
            <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden font-mono text-xs">
              <div className="p-4 border-b border-black/5 bg-[#fafafc] flex justify-between items-center font-sans">
                <span className="text-[#1d1d1f] font-bold">Request Example</span>
                <span className="text-xs text-[#0071e3] font-mono">Auth: Bearer Token</span>
              </div>

              <div className="p-6 text-slate-200 leading-relaxed overflow-x-auto bg-[#090a0c]">
                {selectedEndpoint === 'create_session' && (
                  <pre className="text-emerald-400">
{`curl -X POST https://api.kodo.io/v1/payments/create-session \\
  -H "Authorization: Bearer kodo_live_india_9a7d3c5f8e1b4a20984efc71289" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Pro SaaS Subscription (Monthly)",
    "amount": 4999.00,
    "currency": "INR",
    "customerEmail": "founder@bangalore-tech.in",
    "customerGstin": "29ABCDE1234F1Z5",
    "paymentMethods": ["upi", "upi_autopay", "rupay_card", "netbanking"]
  }'`}
                  </pre>
                )}

                {selectedEndpoint === 'track_meter' && (
                  <pre className="text-blue-300">
{`curl -X POST https://api.kodo.io/v1/meters/track \\
  -H "Authorization: Bearer kodo_live_india_9a7d3c5f8e1b4a20984efc71289" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "cus_kodo_bangalore_9910",
    "eventName": "llm_tokens_consumed",
    "units": 25000,
    "ratePerUnitInr": 0.002
  }'`}
                  </pre>
                )}

                {selectedEndpoint === 'create_product' && (
                  <pre className="text-purple-300">
{`curl -X POST https://api.kodo.io/v1/products \\
  -H "Authorization: Bearer kodo_live_india_9a7d3c5f8e1b4a20984efc71289" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "AI Agents Scale Tier (UPI AutoPay)",
    "price": 9999.00,
    "currency": "INR",
    "type": "subscription",
    "billingInterval": "month",
    "hsnSacCode": "998313"
  }'`}
                  </pre>
                )}

                {selectedEndpoint === 'webhooks' && (
                  <pre className="text-amber-300">
{`// Verify Signed Webhooks & Cashfree Easy Split in Node.js
import { Kodo } from '@kodo/payments';

export async function handleWebhook(req, res) {
  const signature = req.headers['kodo-signature'];
  const event = Kodo.webhooks.constructEvent(req.body, signature, process.env.KODO_WEBHOOK_SECRET);

  if (event.type === 'payment.succeeded') {
    console.log('Customer Paid:', event.data.grossAmount);
    console.log('Net IMPS Payout to Merchant:', event.data.merchantShare);
    console.log('Sec 194-O TDS Deducted:', event.data.tdsWithheld194O);
  }

  res.json({ received: true });
}`}
                  </pre>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-black/5 bg-[#fafafc] flex justify-between items-center font-sans">
                <span className="text-xs text-[#86868b]">Live Sandbox</span>
                <button
                  onClick={handleTestCall}
                  disabled={isCalling}
                  className="apple-btn-black px-4 py-2 text-xs flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isCalling ? 'Sending...' : 'Execute Request'}
                </button>
              </div>

              {/* Result Preview */}
              {testResult && (
                <div className="p-4 border-t border-emerald-500/20 bg-emerald-50/50 text-xs font-mono">
                  <div className="flex justify-between text-emerald-900 font-bold mb-2">
                    <span>⚡ Server Response (200 OK):</span>
                    <span className="text-[10px] text-emerald-700">kodo-core/1.0</span>
                  </div>
                  <pre className="text-emerald-900 overflow-x-auto p-3 bg-white rounded-2xl border border-emerald-200">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>

          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};
