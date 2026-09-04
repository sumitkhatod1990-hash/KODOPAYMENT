import React, { useState } from 'react';
import { Link2, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

const MAX_TITLE_LENGTH = 140;

export const PaymentLinksTab: React.FC = () => {
  // Fields start empty — no prepopulated demo title or amount.
  const [title, setTitle] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; amount?: string }>({});
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const next: { title?: string; amount?: string } = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      next.title = 'Title is required';
    } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      next.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer`;
    }

    const trimmedAmount = amountInput.trim();
    if (!trimmedAmount) {
      next.amount = 'Amount is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) {
      next.amount = 'Enter a valid amount with up to 2 decimal places';
    } else if (Number(trimmedAmount) <= 0) {
      next.amount = 'Amount must be greater than 0';
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    setError(null);
    setGeneratedLink(null);
    if (!validate()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/v1/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amountInput.trim()),
          currency: 'INR',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || 'Could not create payment link. Please try again.');
        return;
      }
      // sessionId is the signed checkout token returned by the backend — the
      // URL is built from that real token, not fabricated on the frontend.
      setGeneratedLink(`${window.location.origin}/checkout/${data.sessionId}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyGeneratedLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openCheckout = () => {
    if (!generatedLink) return;
    window.open(generatedLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">

      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
          Instant Payment Links Generator
        </h2>
        <p className="text-xs sm:text-sm text-[#86868b]">
          Generate shareable INR checkout links for clients, WhatsApp, email, or invoices.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} noValidate className="space-y-5 text-xs">

          <div className="space-y-1.5">
            <label htmlFor="payment-link-title" className="font-semibold text-[#1d1d1f]">Payment Link Title</label>
            <input
              id="payment-link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Design"
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? 'payment-link-title-error' : undefined}
              className={`w-full p-3 rounded-xl border bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none text-sm font-sans ${fieldErrors.title ? 'border-red-400' : 'border-black/10'}`}
            />
            {fieldErrors.title && <p id="payment-link-title-error" className="text-red-600 dark:text-red-400">{fieldErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="payment-link-amount" className="font-semibold text-[#1d1d1f]">Amount to Charge</label>
              <input
                id="payment-link-amount"
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="499.00"
                aria-invalid={Boolean(fieldErrors.amount)}
                aria-describedby={fieldErrors.amount ? 'payment-link-amount-error' : undefined}
                className={`w-full p-3 rounded-xl border bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none font-mono text-sm ${fieldErrors.amount ? 'border-red-400' : 'border-black/10'}`}
              />
              {fieldErrors.amount && <p id="payment-link-amount-error" className="text-red-600 dark:text-red-400">{fieldErrors.amount}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1d1d1f]">Default Currency</label>
              <div className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-mono">INR (₹) · India</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            aria-busy={isGenerating}
            className="opp-btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link2 className="w-4 h-4" />
            {isGenerating ? 'Creating payment link…' : 'Create payment link'}
          </button>
          {error && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
        </form>

        {generatedLink && (
          <div className="pt-6 border-t border-black/5 space-y-3 animate-fade-in">
            <div className="text-xs font-mono font-bold uppercase text-[#0071e3]">
              ✓ Payment link ready
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/10 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-[#1d1d1f] truncate max-w-md">
                {generatedLink}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyGeneratedLink}
                  className="opp-btn-primary gap-1.5 !px-4 !py-2 text-xs"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy link'}</span>
                </button>

                <button
                  type="button"
                  onClick={openCheckout}
                  className="opp-btn-secondary gap-1.5 !px-4 !py-2 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open checkout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
