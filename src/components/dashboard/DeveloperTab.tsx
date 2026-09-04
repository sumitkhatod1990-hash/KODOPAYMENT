import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Copy, CheckCircle2, Plus, Trash2, Webhook, Key, Code2 } from 'lucide-react';

export const DeveloperTab: React.FC = () => {
  const { apiKeys, generateApiKey, revokeApiKey } = useApp();
  const [name, setName] = useState('Sandbox demo server');
  const [environment, setEnvironment] = useState<'live' | 'test'>('test');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = await generateApiKey(name, environment);
    if (key?.key) setNewKey(key.key);
    setName('');
  };

  const copy = async (value: string) => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  return <div className="max-w-5xl space-y-7">
    <div><h2 className="text-2xl font-bold">Developer access</h2><p className="mt-1 text-sm text-slate-500">Create API credentials for your backend. Use test keys for sandbox demos until live activation is approved.</p></div>

    {newKey && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="font-bold text-emerald-900">Copy this secret now</div><p className="text-xs text-emerald-800 mt-1">For security, QivroPay will not display the full secret again.</p><div className="mt-3 flex gap-2"><code className="flex-1 overflow-x-auto rounded-xl bg-white border border-emerald-200 px-3 py-3 text-xs">{newKey}</code><button onClick={() => copy(newKey)} className="px-4 rounded-xl bg-emerald-900 text-white text-xs font-bold">{copied ? 'Copied' : 'Copy'}</button></div></div>}

    <section className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-black/10 dark:border-white/10 p-6 space-y-5">
      <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Key className="w-5 h-5" /></div><div><h3 className="font-bold">API keys</h3><p className="text-xs text-slate-500">Use <code>Authorization: Bearer qivro_test_...</code> for sandbox demos, or a live key only after production activation. Server-side only.</p></div></div>
      <div className="space-y-2">{apiKeys.map(k => <div key={k.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-3"><div><div className="font-semibold text-sm">{k.name}</div><div className="text-xs text-slate-500 font-mono mt-1">{k.prefix} · {k.environment}</div></div><button onClick={() => revokeApiKey(k.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div>)}</div>
      <form onSubmit={createKey} className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-wrap gap-2"><input required value={name} onChange={e => setName(e.target.value)} placeholder="Key name" className="flex-1 min-w-[220px] rounded-xl border border-black/10 px-3 py-2.5 text-sm" /><select value={environment} onChange={e => setEnvironment(e.target.value as any)} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"><option value="live">Live</option><option value="test">Test</option></select><button className="rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#0c0f17] px-4 py-2.5 text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Generate</button></form>
    </section>

    <section className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-black/10 dark:border-white/10 p-6 space-y-4"><div className="flex items-center gap-3"><Code2 className="w-5 h-5 text-blue-600" /><div><h3 className="font-bold">Create a checkout session</h3><p className="text-xs text-slate-500">Call this from your server to get a shareable sandbox checkout link for a product.</p></div></div><div className="rounded-2xl bg-slate-950 text-slate-100 p-4 overflow-x-auto"><pre className="text-xs leading-6">{`POST /api/v1/payments/create-session\nAuthorization: Bearer qivro_test_...\nContent-Type: application/json\n\n{\n  "productId": "prod_..."\n}`}</pre></div></section>

    <section className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-black/10 dark:border-white/10 p-6 space-y-4">
      <div className="flex items-center gap-3"><Webhook className="w-5 h-5 text-purple-600" /><div><h3 className="font-bold">Webhooks</h3><p className="text-xs text-slate-500">What QivroPay actually verifies today, and what it doesn't send yet.</p></div></div>
      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <p><strong className="text-slate-900 dark:text-slate-100">Inbound (live):</strong> Cashfree sends payment events to QivroPay's backend. Every event's HMAC signature is verified server-side, with replay protection, before a payment's status is updated — this is what marks a payment succeeded or a refund confirmed in your dashboard.</p>
        <p><strong className="text-slate-900 dark:text-slate-100">Outbound to your server: not available yet.</strong> QivroPay does not currently deliver webhook events to a URL on your own backend. To check payment or refund status programmatically, poll the Payments API from your server rather than expecting a callback.</p>
      </div>
    </section>

    <section className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-black/10 dark:border-white/10 p-6"><div className="flex items-center gap-3"><Code2 className="w-5 h-5 text-blue-600" /><div><h3 className="font-bold">Integration rule</h3><p className="text-xs text-slate-500">Never put a live QivroPay or Cashfree secret in browser code. Create orders on your server, then open the returned checkout session.</p></div></div></section>
  </div>;
};
