import React, { useState } from 'react';
import { 
  Globe2, 
  CreditCard, 
  ShieldCheck, 
  Building, 
  ArrowDown, 
  CheckCircle2, 
  Smartphone, 
  Coins, 
  Zap, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const ArchitectureFlow: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<'checkout' | 'billing' | 'tax' | 'rails' | 'ledger' | 'payout'>('ledger');

  const nodeDetails = {
    checkout: {
      title: 'Indian Customer & KODO Checkout',
      badge: '0.28s Checkout',
      desc: 'Seamless Indian customer checkout supporting UPI (GPay, PhonePe, Paytm, CRED), RuPay on UPI (0% MDR), UPI AutoPay 2.0, NetBanking across 55+ banks, and Corporate Credit Cards.',
      metrics: ['Sub-second load times', 'UPI AutoPay Mandates', 'Dynamic GSTIN Input']
    },
    billing: {
      title: 'UPI AutoPay & Metered Subscriptions',
      badge: 'Billing Engine',
      desc: 'Autonomous recurring SaaS billing via NPCI UPI AutoPay 2.0, token/usage-based billing for AI apps, tiered seats, proration, and automated WhatsApp dunning alerts.',
      metrics: ['Zero-OTP Renewal Mandates', 'Token Overages Metering', 'Prorated Tier Upgrades']
    },
    tax: {
      title: 'Merchant of Record (MoR) GST Shield',
      badge: '100% Zero Tax Liability',
      desc: 'KODO acts as the official legal reseller of your digital software. We calculate, collect, and file GST across all 28 Indian States & 8 UTs under KODO\'s GSTIN. Zero tax liability for developers.',
      metrics: ['Zero GST State Registrations', 'Automated IRN & QR Codes', 'GSTR-1/3B Filings Handled']
    },
    rails: {
      title: 'Cashfree Payment Gateway Integration',
      badge: 'India Acquirer',
      desc: 'Direct integration with Cashfree PG for lightning-fast UPI intent routing, card tokenization, and seamless API handshake.',
      metrics: ['99.99% Uptime', 'Dynamic 3D-Secure 2.0', 'Zero Card Failure']
    },
    ledger: {
      title: 'Cashfree Easy Split & MoR Fee',
      badge: 'Transparent 3% Fee',
      desc: 'Automated split engine: 97.0% merchant share, 3.0% KODO MoR platform fee (+ 18% GST), and statutory 1.0% Section 194-O TDS deduction remitted directly to the Income Tax Department.',
      metrics: ['Section 194-O TDS Remittance', '18% GST Invoicing', 'Instant Split Calculation']
    },
    payout: {
      title: 'Merchant Bank Account Settlement',
      badge: 'Instant T+0 IMPS',
      desc: 'Net earnings are automatically disbursed into the merchant\'s verified Indian bank account (HDFC, ICICI, SBI, Axis) in real-time via 24x7 IMPS rails with verified Bank UTR numbers.',
      metrics: ['Instant T+0 IMPS Payouts', 'Automated Form 16A', 'Bank UTR Reconciliation']
    }
  };

  return (
    <section className="py-24 md:py-36 bg-white border-t border-black/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#0055FF]">
            How QivroPay Works As Your Merchant of Record
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A0D14] tracking-tight">
            The Complete End-to-End Flow.
          </h2>
          <p className="text-base sm:text-lg text-[#6E717D] max-w-2xl mx-auto">
            From checkout and billing to Indian GST compliance and direct bank payouts.
          </p>
        </div>

        {/* Master Flow Interactive Canvas */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#F4F5F8] border border-black/10 p-6 sm:p-12 shadow-sm space-y-10">
          
          {/* Level 0: Master Hub Node */}
          <div className="flex justify-center">
            <div className="p-4 sm:px-8 sm:py-4 rounded-2xl bg-[#0A0D14] text-white shadow-lg border border-black flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0055FF] to-[#7B2CBF] text-white font-extrabold flex items-center justify-center text-sm font-sans">
                Q
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base tracking-tight font-sans">
                  QIVROPAY
                </div>
                <div className="text-[10px] text-[#8C90A0] font-mono">
                  Merchant of Record Engine (MoR)
                </div>
              </div>
            </div>
          </div>

          {/* Connecting Down Line */}
          <div className="flex justify-center -my-6">
            <div className="w-0.5 h-10 bg-black/20" />
          </div>

          {/* Level 1: Triad Branch (Checkout | Billing | Tax) */}
          <div className="relative pt-2">
            {/* Horizontal Branch Bar */}
            <div className="hidden sm:block absolute top-0 left-[16.66%] right-[16.66%] h-0.5 bg-black/20" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Branch 1: CHECKOUT */}
              <div 
                onClick={() => setSelectedNode('checkout')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedNode === 'checkout'
                    ? 'bg-white border-[#0071e3] shadow-md ring-2 ring-[#0071e3]/20'
                    : 'bg-white/80 border-black/5 hover:border-black/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#0071e3]">
                    01 • CHECKOUT
                  </span>
                  <Smartphone className="w-4 h-4 text-[#0071e3]" />
                </div>
                <div className="font-bold text-[#1d1d1f] text-sm">
                  Customer → Payment
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Dynamic multi-currency checkout with Apple Pay & PPP.
                </p>
              </div>

              {/* Branch 2: BILLING */}
              <div 
                onClick={() => setSelectedNode('billing')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedNode === 'billing'
                    ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-600/20'
                    : 'bg-white/80 border-black/5 hover:border-black/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono uppercase font-bold text-purple-600">
                    02 • BILLING
                  </span>
                  <Coins className="w-4 h-4 text-purple-600" />
                </div>
                <div className="font-bold text-[#1d1d1f] text-sm">
                  Credits & Subscriptions
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Token metering, auto-refill, and SaaS billing cycles.
                </p>
              </div>

              {/* Branch 3: TAX */}
              <div 
                onClick={() => setSelectedNode('tax')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedNode === 'tax'
                    ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
                    : 'bg-white/80 border-black/5 hover:border-black/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono uppercase font-bold text-emerald-600">
                    03 • TAX COMPLIANCE
                  </span>
                  <Globe2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-bold text-[#1d1d1f] text-sm">
                  Global Remittance
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  VAT, GST, and US Sales Tax auto-remitted under KODO.
                </p>
              </div>

            </div>
          </div>

          {/* Level 2: Payment Rails Connector */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-0.5 h-6 bg-black/20" />
            <div 
              onClick={() => setSelectedNode('rails')}
              className={`w-full max-w-lg p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedNode === 'rails'
                  ? 'bg-white border-[#0071e3] shadow-md ring-2 ring-[#0071e3]/20'
                  : 'bg-white/80 border-black/5 hover:border-black/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#0071e3]" />
                <div>
                  <div className="font-bold text-[#1d1d1f] text-xs uppercase tracking-wider">
                    PAYMENT RAILS
                  </div>
                  <div className="text-[11px] text-[#86868b] font-mono">
                    Apple Pay • Cards (Visa/MC/Amex) • UPI • Crypto
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#86868b]" />
            </div>
          </div>

          {/* Level 3: KODO Ledger Connector */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-0.5 h-6 bg-black/20" />
            <div 
              onClick={() => setSelectedNode('ledger')}
              className={`w-full max-w-lg p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedNode === 'ledger'
                  ? 'bg-white border-[#0071e3] shadow-md ring-2 ring-[#0071e3]/20'
                  : 'bg-white/80 border-black/5 hover:border-black/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-[#0071e3]" />
                <div>
                  <div className="font-bold text-[#1d1d1f] text-xs uppercase tracking-wider">
                    KODO LEDGER & FEE SEGREGATION
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono font-bold">
                    Gross Revenue → Deducts (4% + 40¢) + Segregated Tax
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#86868b]" />
            </div>
          </div>

          {/* Level 4: Payout & Merchant Bank */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-0.5 h-6 bg-black/20" />
            <div 
              onClick={() => setSelectedNode('payout')}
              className={`w-full max-w-lg p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedNode === 'payout'
                  ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
                  : 'bg-white/80 border-black/5 hover:border-black/20'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#1d1d1f] text-xs uppercase tracking-wider">
                    MERCHANT BANK PAYOUT
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono font-bold">
                    Daily T+2 Rolling Settlement → Direct Bank Deposit
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                PAID
              </span>
            </div>
          </div>

          {/* Interactive Inspection Detail Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-md space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] animate-ping" />
                <h4 className="font-bold text-[#1d1d1f] text-base font-sans">
                  {nodeDetails[selectedNode].title}
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] text-xs font-mono font-bold border border-blue-100">
                {nodeDetails[selectedNode].badge}
              </span>
            </div>

            <p className="text-sm text-[#6e6e73] leading-relaxed">
              {nodeDetails[selectedNode].desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {nodeDetails[selectedNode].metrics.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#f5f5f7] border border-black/5 text-xs text-[#1d1d1f] font-semibold flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
