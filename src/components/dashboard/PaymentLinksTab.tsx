import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link2, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

export const PaymentLinksTab: React.FC = () => {
  const { createCheckoutSession, setCurrentView } = useApp();
  const [customTitle, setCustomTitle] = useState('Custom AI Payment Link');
  const [amount, setAmount] = useState<number>(49);
  const [currency, setCurrency] = useState('USD');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    const sessionId = await createCheckoutSession({
      amount,
      title: customTitle,
      currency
    });
    setIsGenerating(false);

    if (sessionId) {
      const fullUrl = `${window.location.origin}/checkout/${sessionId}`;
      setGeneratedLink(fullUrl);
    }
  };

  const copyGeneratedLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      
      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
          Instant Payment Links Generator
        </h2>
        <p className="text-xs sm:text-sm text-[#86868b]">
          Generate shareable, multi-currency checkout links for clients, Discord, Twitter, or email invoices.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-5 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1d1d1f]">Payment Link Title</label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Consulting, Custom AI Setup, or Subscription"
              className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none text-sm font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1d1d1f]">Amount to Charge</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1d1d1f]">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none text-sm font-mono"
              >
                <option value="USD">USD ($) - United States</option>
                <option value="EUR">EUR (€) - Eurozone</option>
                <option value="GBP">GBP (£) - United Kingdom</option>
                <option value="INR">INR (₹) - India</option>
                <option value="JPY">JPY (¥) - Japan</option>
                <option value="CAD">CAD ($) - Canada</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="apple-btn-black px-6 py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <Link2 className="w-4 h-4" />
            {isGenerating ? 'Generating Link...' : 'Create Live Payment Link'}
          </button>
        </form>

        {generatedLink && (
          <div className="pt-6 border-t border-black/5 space-y-3 animate-fade-in">
            <div className="text-xs font-mono font-bold uppercase text-[#0071e3]">
              ✓ Checkout Link Ready
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/10 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-[#1d1d1f] truncate max-w-md">
                {generatedLink}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyGeneratedLink}
                  className="apple-btn-black px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={() => {
                    const sessionId = generatedLink.split('/checkout/')[1];
                    setCurrentView('checkout', { sessionId });
                  }}
                  className="apple-btn-secondary px-4 py-2 text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
