import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  Coins, 
  Globe2,
  DollarSign
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'checkout' | 'split' | 'payout'>('checkout');

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-[#FAFAFC]">
      
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-100/40 via-purple-50/30 to-emerald-50/20 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tag */}
        <div className="flex justify-center mb-6">
          <div className="opp-badge">
            <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse" />
            <span>🇮🇳 INDIA'S #1 MERCHANT OF RECORD FOR SAAS &amp; AI</span>
          </div>
        </div>

        {/* Master Heading */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0A0D14] tracking-tight leading-[1.08]">
            The Merchant of Record built for India's SaaS &amp; AI Apps.
          </h1>
          <p className="text-lg sm:text-xl text-[#6E717D] max-w-2xl mx-auto font-normal leading-relaxed">
            Sell software, AI apps, and digital subscriptions across India. QivroPay takes 100% liability for GST filings, UPI AutoPay recurring billing, Section 194-O TDS withholding, and instant Cashfree Easy Split bank payouts.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="opp-btn-primary px-8 py-3.5 text-sm gap-2"
            >
              <span>Launch Merchant Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('checkout')}
              className="opp-btn-secondary px-7 py-3.5 text-sm gap-2"
            >
              <span>Experience Live Checkout</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-[#8C90A0]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Zero GST Filing Burden (28 States &amp; 8 UTs)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Instant T+0 IMPS Bank Payouts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              UPI AutoPay 2.0 &amp; RuPay on UPI (0% MDR)
            </span>
          </div>
        </div>

        {/* Interactive OPP-Style Visual Payment Orchestrator */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="opp-card p-6 sm:p-10 shadow-xl space-y-8">
            
            {/* Header / Interactive Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0055FF] to-[#7B2CBF] text-white flex items-center justify-center font-bold text-sm">
                  Q
                </div>
                <div>
                  <div className="font-bold text-[#0A0D14] text-sm tracking-tight font-sans">
                    QivroPay Payment Orchestrator
                  </div>
                  <div className="text-[11px] font-mono text-[#8C90A0]">
                    Real-time transaction &amp; settlement journey
                  </div>
                </div>
              </div>

              {/* Interactive Journey Steps */}
              <div className="flex p-1 rounded-2xl bg-[#F4F5F8] border border-black/[0.05] text-xs font-mono">
                {[
                  { id: 'checkout', label: '1. Multi-Rail Checkout' },
                  { id: 'split', label: '2. MoR Fee & Tax Split' },
                  { id: 'payout', label: '3. Instant Payout' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-[#0A0D14] font-bold shadow-xs'
                        : 'text-[#6E717D] hover:text-[#0A0D14]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Interactive Visual Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Step 1: Customer & Checkout */}
              <div className={`p-6 rounded-2xl border transition-all ${
                activeTab === 'checkout'
                  ? 'bg-white border-[#0055FF] shadow-md ring-2 ring-[#0055FF]/10'
                  : 'bg-[#F4F5F8] border-black/[0.05]'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#0055FF] bg-blue-50 px-2 py-0.5 rounded-md">
                    CUSTOMER CHECKOUT
                  </span>
                  <Smartphone className="w-4 h-4 text-[#0055FF]" />
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-bold font-mono text-[#0A0D14]">₹49.00 INR</div>
                  <div className="text-xs text-[#6E717D]">
                    Customer paying via <strong>Apple Pay</strong> / <strong>iDEAL</strong>
                  </div>
                  <div className="pt-2 flex gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white border border-black/10 font-bold">Apple Pay</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white border border-black/10 font-bold">Visa</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white border border-black/10 font-bold">UPI</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white border border-black/10 font-bold">iDEAL</span>
                  </div>
                </div>
              </div>

              {/* Step 2: MoR Ledger & Tax Split */}
              <div className={`p-6 rounded-2xl border transition-all ${
                activeTab === 'split'
                  ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-600/10'
                  : 'bg-[#F4F5F8] border-black/[0.05]'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    QIVROPAY MoR LEDGER
                  </span>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8C90A0]">Gross:</span>
                    <span className="font-bold text-[#0A0D14]">₹49.00</span>
                  </div>
                  <div className="flex justify-between text-purple-700">
                    <span>Platform Fee (4%+40¢):</span>
                    <span>-₹2.36</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>VAT/Sales Tax:</span>
                    <span>Remitted (0% Liability)</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Merchant Bank Settlement */}
              <div className={`p-6 rounded-2xl border transition-all ${
                activeTab === 'payout'
                  ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/10'
                  : 'bg-[#F4F5F8] border-black/[0.05]'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    NET BANK PAYOUT
                  </span>
                  <Building className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-bold font-mono text-emerald-700">₹46.64 INR</div>
                  <div className="text-xs text-[#6E717D]">
                    Direct deposit to <strong>Silicon Valley Bank</strong>
                  </div>
                  <div className="text-[10px] font-mono text-[#8C90A0] flex items-center gap-1 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>T+2 Rolling Settlement • Auto-Paid</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Live Ticker Bar */}
            <div className="p-3.5 rounded-2xl bg-[#0A0D14] text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-emerald-400 font-bold">LIVE TRANSACTION STREAM:</span>
                <span className="text-neutral-300 truncate">tx_qivropay_9881 • ₹49.00 INR via Apple Pay • Net ₹46.64 credited</span>
              </div>
              <span className="text-[11px] text-neutral-400">Latency: 14ms</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
