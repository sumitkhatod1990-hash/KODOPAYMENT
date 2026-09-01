import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Key, Webhook, Copy, CheckCircle2, Plus, Trash2, Play, Code2, ShieldCheck, Terminal } from 'lucide-react';

export const DeveloperTab: React.FC = () => {
  const { apiKeys, webhooks, generateApiKey, revokeApiKey } = useApp();
  const [keyName, setKeyName] = useState('Production Server Key');
  const [keyEnv, setKeyEnv] = useState<'live' | 'test'>('live');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Webhook Simulator State
  const [selectedEvent, setSelectedEvent] = useState('payment.succeeded');
  const [targetWebhookUrl, setTargetWebhookUrl] = useState('https://api.yourdomain.com/webhooks/qivropay');
  const [customAmount, setCustomAmount] = useState(29.00);
  const [customCustomer, setCustomCustomer] = useState('developer@startup.ai');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateApiKey(keyName, keyEnv);
    setKeyName('');
  };

  const handleSimulateWebhook = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/v1/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: selectedEvent,
          url: targetWebhookUrl,
          amount: customAmount,
          customerEmail: customCustomer
        })
      });
      const data = await res.json();
      setDispatchResult({
        status: 200,
        statusText: 'OK (Delivered)',
        latency: '16ms',
        payload: data.event
      });
    } catch (err) {
      setDispatchResult({
        status: 500,
        statusText: 'Failed to deliver',
        latency: '0ms',
        payload: { error: 'Connection refused' }
      });
    } finally {
      setIsDispatching(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl font-sans">
      
      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
          Developer API Keys & Webhook Studio
        </h2>
        <p className="text-xs sm:text-sm text-[#86868b]">
          Manage REST API authentication credentials and test live HMAC-SHA256 signed webhook event dispatches.
        </p>
      </div>

      {/* 1. API Keys Card */}
      <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-black/5">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0071e3]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1d1d1f] text-base font-sans">
              API Authentication Keys
            </h3>
            <p className="text-xs text-[#86868b]">
              Include in your HTTP Authorization header: <code>Bearer qivropay_live_...</code>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {apiKeys.map((k) => (
            <div key={k.id} className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-[#1d1d1f]">{k.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${k.environment === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {k.environment}
                  </span>
                </div>
                <div className="text-[#86868b] text-[11px] font-sans">
                  Created: {new Date(k.createdAt).toLocaleDateString()} • Last used: {k.lastUsed}
                </div>
                <div className="text-[#1d1d1f] font-bold bg-white px-3 py-1 rounded-xl border border-black/5 w-fit select-all shadow-sm">
                  {k.key}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(k.key, k.id)}
                  className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                >
                  {copiedKey === k.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === k.id ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => revokeApiKey(k.id)}
                  className="p-2 rounded-xl text-[#86868b] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Revoke Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleGenerateKey} className="pt-4 border-t border-black/5 flex flex-wrap items-center gap-3 text-xs">
          <input
            type="text"
            placeholder="Key Description (e.g. Backend Production Server)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="flex-1 min-w-[200px] p-2.5 rounded-xl bg-[#f5f5f7] border border-black/10 text-[#1d1d1f] focus:border-[#0071e3] outline-none"
          />
          <select
            value={keyEnv}
            onChange={(e) => setKeyEnv(e.target.value as any)}
            className="p-2.5 rounded-xl bg-[#f5f5f7] border border-black/10 text-[#1d1d1f]"
          >
            <option value="live">Live Mode Key</option>
            <option value="test">Sandbox Test Key</option>
          </select>
          <button
            type="submit"
            className="apple-btn-black px-5 py-2.5 font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Generate Key
          </button>
        </form>
      </div>

      {/* 2. Webhook Simulator & Event Debugger Studio */}
      <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1d1d1f] text-base font-sans">
                Webhook Simulator & Event Debugger
              </h3>
              <p className="text-xs text-[#86868b]">
                Broadcast mock events and verify HMAC-SHA256 signatures in your backend.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold">
            HMAC-SHA256
          </span>
        </div>

        {/* Simulator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1d1d1f]">Event Type</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] font-mono font-bold"
            >
              <option value="payment.succeeded">payment.succeeded</option>
              <option value="subscription.created">subscription.created</option>
              <option value="subscription.cancelled">subscription.cancelled</option>
              <option value="meter.threshold_reached">meter.threshold_reached</option>
              <option value="refund.processed">refund.processed</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-semibold text-[#1d1d1f]">Target Listener URL</label>
            <input
              type="text"
              value={targetWebhookUrl}
              onChange={(e) => setTargetWebhookUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-mono text-[#86868b]">
            Header: <code>qivropay-signature: t=172500...,v1=9f8e7d...</code>
          </div>
          <button
            onClick={handleSimulateWebhook}
            disabled={isDispatching}
            className="apple-btn-black px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isDispatching ? 'Dispatching...' : 'Dispatch Test Webhook'}</span>
          </button>
        </div>

        {/* Dispatch Result Inspector */}
        {dispatchResult && (
          <div className="p-6 rounded-2xl bg-[#090a0c] border border-black/10 text-xs font-mono space-y-3 animate-fade-in shadow-inner">
            <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-white/10 pb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>HTTP Response: {dispatchResult.status} {dispatchResult.statusText}</span>
              </span>
              <span className="text-neutral-400">Latency: {dispatchResult.latency}</span>
            </div>
            
            <pre className="text-emerald-300 overflow-x-auto p-2 leading-relaxed">
              {JSON.stringify(dispatchResult.payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Verification Code Snippet */}
        <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/5 space-y-2 text-xs">
          <div className="font-bold text-[#1d1d1f] font-sans flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#0071e3]" />
            <span>How to verify signatures in Node.js</span>
          </div>
          <pre className="p-3 rounded-xl bg-white border border-black/5 text-slate-800 font-mono text-[11px] overflow-x-auto">
{`import crypto from 'crypto';

export function verifyQivroPayWebhook(req) {
  const signature = req.headers['qivropay-signature'];
  const expected = crypto.createHmac('sha256', process.env.QIVROPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body)).digest('hex');
  return signature === expected;
}`}
          </pre>
        </div>

      </div>

      {/* 3. QIVROPAY CLI & Localhost Tunneling Simulator */}
      <div className="opp-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#0055FF]" />
            <h3 className="font-bold text-base text-[#0A0D14] font-heading">
              QIVROPAY CLI & Localhost Tunneling Daemon
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
            CLI v1.4.0
          </span>
        </div>

        <p className="text-xs text-[#6E717D]">
          Test webhooks locally on your computer without deploying to production or exposing public ngrok URLs.
        </p>

        {/* Interactive Terminal Window */}
        <div className="rounded-2xl bg-[#0A0D14] p-5 font-mono text-xs text-white space-y-3 shadow-xl border border-white/10">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-white/40 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="ml-2">bash - qivropay listen --forward-to localhost:3000/api/webhook</span>
          </div>

          <div className="space-y-1.5 leading-relaxed text-[11px]">
            <div className="text-white/60">$ npm install -g @qivropay/cli</div>
            <div className="text-white/60">$ qivropay login --api-key qivropay_live_9a7d3...</div>
            <div className="text-emerald-400 font-bold">&gt; Logged in to QIVROPAY Merchant of Record (qivropay.io)</div>
            <div className="text-white/60 pt-2">$ qivropay listen --forward-to http://localhost:3000/api/webhooks</div>
            <div className="text-blue-400 font-semibold">&gt; Ready! Forwarding live MoR webhook events to http://localhost:3000/api/webhooks</div>
            <div className="text-white/40">&gt; Webhook signing secret: whsec_qivropay_7719a8bc43d0e9812f (saved to local .env)</div>
            
            <div className="pt-2 border-t border-white/10 text-emerald-300">
              [2026-08-31 04:45:12] 200 OK payment.succeeded (tx_qivropay_9881) &rarr; 14ms
            </div>
            <div className="text-emerald-300">
              [2026-08-31 04:45:18] 200 OK subscription.created (sub_qivropay_771) &rarr; 8ms
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
