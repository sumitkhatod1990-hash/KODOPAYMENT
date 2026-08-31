import React from 'react';
import { 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Building, 
  Cpu, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Globe2, 
  Coins, 
  Zap, 
  Smartphone,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BentoFeatures: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <section className="py-24 md:py-36 bg-[#FAFAFC] border-t border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="opp-badge">
            <span>🇮🇳 BHARAT MERCHANT OF RECORD CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A0D14] tracking-tight">
            Engineered for India's SaaS, AI apps & creators.
          </h2>
          <p className="text-base sm:text-lg text-[#6E717D]">
            Everything required to monetize, accept UPI AutoPay recurring payments, automate Indian GST e-invoicing, and get instant IMPS bank payouts.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Embedded Merchant Onboarding (7 Cols) */}
          <div className="md:col-span-7 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0055FF] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                Frictionless Indian Merchant Onboarding
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                Onboard Indian SaaS founders and software creators into your ecosystem in under 2 minutes with automated PAN verification, GSTIN check, and ₹1 Penny-Drop bank verification.
              </p>
            </div>

            {/* In-Card Visual Mockup */}
            <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/[0.05] space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[#8C90A0] text-[10px] font-bold">
                <span>INSTANT ONBOARDING</span>
                <span className="text-emerald-600">● 100% VERIFIED</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-black/5 font-bold text-[#0A0D14] flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>PAN / GSTIN</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/5 font-bold text-[#0A0D14] flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>MoR Reseller</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/5 font-bold text-[#0A0D14] flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Penny Drop</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 100% Zero-Liability GST Shield (5 Cols) */}
          <div className="md:col-span-5 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                Zero GST Liability Shield
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                As your legal Merchant of Record, KODO calculates, collects, and files GST across all 28 Indian States & 8 UTs. Zero state registrations or audit hassles.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs font-mono text-emerald-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-emerald-700" />
                <span>28 States & 8 UTs Managed</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Never file GSTR-1 or GSTR-3B manually again. KODO handles 100% of GST remittances under our sovereign tax nexus.
              </p>
            </div>
          </div>

          {/* Card 3: UPI AutoPay 2.0 & Subscriptions (5 Cols) */}
          <div className="md:col-span-5 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                UPI AutoPay 2.0 Recurring Engine
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                Offer seamless recurring subscriptions via NPCI UPI AutoPay with zero-PIN renewals on GPay, PhonePe, Paytm, and CRED.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs font-mono text-purple-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-700" />
                <span>Zero-PIN Renewal Mandates</span>
              </div>
              <p className="text-[11px] text-purple-700">
                100% compliant with RBI e-Mandate circulars with automated WhatsApp dunning alerts.
              </p>
            </div>
          </div>

          {/* Card 4: Real-Time Token & GPU Usage Metering (7 Cols) */}
          <div className="md:col-span-7 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                AI Token Metering &amp; Cashfree Easy Split
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                Stream token counts, GPU runtime, or API queries. KODO meters usage, deducts 1% Section 194-O TDS, and settles net earnings directly to your bank via instant IMPS.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0D14] text-white font-mono text-xs space-y-2">
              <div className="flex justify-between text-neutral-400 text-[10px]">
                <span>STREAM INGESTION &amp; EASY SPLIT</span>
                <span className="text-emerald-400">● 200 OK</span>
              </div>
              <pre className="text-emerald-300 text-[11px] overflow-x-auto">
{`await kodo.meters.track({
  eventName: "llm_inference_tokens",
  units: 25000,
  customerId: "cus_kodo_9910"
});
// Instant T+0 IMPS Payout: ₹9,600 (after 3% fee + 1% Sec 194-O TDS)`}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
