import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardThemeProvider, useDashboardTheme } from '../../hooks/useDashboardTheme';
import { ArrowRight, CheckCircle2, Copy, Package, Link2, Sparkles } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5;

export const FirstMerchantOnboarding: React.FC = () => (
  <DashboardThemeProvider>
    <FirstMerchantOnboardingShell />
  </DashboardThemeProvider>
);

const FirstMerchantOnboardingShell: React.FC = () => {
  const { user } = useAuth();
  const { merchantProfile, saveMerchantProfile, createProduct, createCheckoutSession, completeOnboarding, setDashboardTab } = useApp();
  const { dark } = useDashboardTheme();

  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 2 — merchant profile
  const [businessName, setBusinessName] = useState(merchantProfile?.businessName || user?.company || '');
  const [supportEmail, setSupportEmail] = useState(merchantProfile?.supportEmail || '');

  // Step 3 — first product
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [createdProduct, setCreatedProduct] = useState<{ id: string; name: string; price: number } | null>(null);

  // Step 4 — first payment link
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) { setError('Store or business name is required'); return; }
    setError('');
    setSaving(true);
    const result = await saveMerchantProfile({ businessName: businessName.trim(), supportEmail: supportEmail.trim() });
    setSaving(false);
    if (!result.success) { setError(result.error || 'Could not save your details. Please try again.'); return; }
    setStep(3);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) { setError('Product name is required'); return; }
    const price = Number(productPrice);
    if (!Number.isFinite(price) || price <= 0) { setError('Enter a valid price greater than 0'); return; }
    setError('');
    setSaving(true);
    const product = await createProduct({ name: productName.trim(), price, currency: 'INR', type: 'one_time' });
    setSaving(false);
    if (!product) { setError('Could not create the product. Please try again.'); return; }
    setCreatedProduct({ id: product.id, name: product.name, price: product.price });
    setStep(4);
  };

  const handleCreateLink = async () => {
    if (!createdProduct) return;
    setError('');
    setSaving(true);
    const sessionId = await createCheckoutSession({ productId: createdProduct.id, amount: createdProduct.price, title: createdProduct.name });
    setSaving(false);
    if (!sessionId) { setError('Could not create the payment link. Please try again.'); return; }
    setLinkUrl(`${window.location.origin}/checkout/${sessionId}`);
    // Onboarding is marked complete only from step 5's own actions (or Skip) —
    // completing it here would flip merchantProfile.onboardingCompletedAt and
    // cause App.tsx to unmount this component before step 5 ever renders.
    setStep(5);
  };

  const copyLink = () => {
    if (!linkUrl) return;
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Scoped the same way as DashboardLayout: `dark` only ever lives on this
    // wrapper, never on <html>/<body>, so it can't leak into the public site.
    <div className={dark ? 'dark' : undefined}>
    <div className="qp-dashboard min-h-screen bg-[#f5f5f7] dark:bg-[#07090e] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0c0f17] border border-black/10 dark:border-white/10 shadow-xl p-6 sm:p-10 space-y-6">

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span className="font-bold text-[#0071e3]">STEP {step} OF 5</span>
            {step < 5 && (
              <button onClick={() => completeOnboarding()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">
                Skip for now
              </button>
            )}
          </div>
          <div className="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0071e3] h-full transition-all duration-300 rounded-full" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        {/* STEP 1 — Welcome */}
        {step === 1 && (
          <div className="text-center space-y-6 py-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-[#0071e3] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-slate-100">Welcome to QivroPay</h2>
              <p className="mt-2 text-sm text-slate-500">Set up your first payment flow in a few steps.</p>
            </div>
            <button onClick={() => setStep(2)} className="apple-btn-black w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2">
              Get started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2 — Merchant profile */}
        {step === 2 && (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-slate-100">Tell us about your business</h2>
              <p className="mt-1 text-sm text-slate-500">Shown on your checkout pages and customer receipts.</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f] dark:text-slate-200">Store / business name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-white/5 text-[#1d1d1f] dark:text-slate-100 outline-none focus:border-[#0071e3]"
                  placeholder="e.g. Acme Software Pvt Ltd"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f] dark:text-slate-200">Support email <span className="font-normal text-slate-400">(optional)</span></label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-white/5 text-[#1d1d1f] dark:text-slate-100 outline-none focus:border-[#0071e3]"
                  placeholder="support@yourcompany.com"
                />
              </div>
            </div>
            {error && <p role="alert" className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={saving} className="apple-btn-black w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? 'Saving…' : 'Continue'} {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* STEP 3 — First product */}
        {step === 3 && (
          <form onSubmit={handleCreateProduct} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-[#0071e3] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-slate-100">Create your first product</h2>
                <p className="mt-0.5 text-sm text-slate-500">What are you selling? You can add more later.</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f] dark:text-slate-200">Product name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-white/5 text-[#1d1d1f] dark:text-slate-100 outline-none focus:border-[#0071e3]"
                  placeholder="e.g. Pro Plan License"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f] dark:text-slate-200">Price (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-white/5 text-[#1d1d1f] dark:text-slate-100 outline-none focus:border-[#0071e3] font-mono"
                  placeholder="499.00"
                />
              </div>
            </div>
            {error && <p role="alert" className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={saving} className="apple-btn-black w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create product'} {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* STEP 4 — First payment link */}
        {step === 4 && createdProduct && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-[#0071e3] flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-slate-100">Create your first payment link</h2>
                <p className="mt-0.5 text-sm text-slate-500">Share this with a customer to get paid.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#1d1d1f] dark:text-slate-100 text-sm">{createdProduct.name}</div>
                <div className="text-xs text-slate-500 font-mono">₹{createdProduct.price.toFixed(2)} INR</div>
              </div>
            </div>
            {error && <p role="alert" className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleCreateLink} disabled={saving} className="apple-btn-black w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create payment link'} {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* STEP 5 — Ready */}
        {step === 5 && (
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-slate-100">You're ready to collect payments.</h2>
            </div>
            {linkUrl && (
              <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-left">
                <span className="font-mono text-xs text-[#1d1d1f] dark:text-slate-100 truncate max-w-xs">{linkUrl}</span>
                <button onClick={copyLink} className="apple-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            )}
            <div className="space-y-2.5">
              <button onClick={() => { setDashboardTab('payment-links' as any); completeOnboarding(); }} className="apple-btn-black w-full py-3.5 text-sm font-semibold">
                Create another payment link
              </button>
              <button onClick={() => { setDashboardTab('home' as any); completeOnboarding(); }} className="apple-btn-secondary w-full py-2.5 text-sm font-semibold">
                Go to Overview
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  );
};
