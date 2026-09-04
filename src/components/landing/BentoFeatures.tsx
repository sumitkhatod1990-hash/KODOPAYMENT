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
    <section id="capabilities" className="py-24 md:py-36 bg-[#FAFAFC] border-t border-black/[0.06] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="opp-badge">
            <span>🇮🇳 BUILT FOR INDIAN PAYMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A0D14] tracking-tight">
            What you actually get.
          </h2>
          <p className="text-base sm:text-lg text-[#6E717D]">
            Everything a merchant needs to go from signup to their first payment.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Card 1: Merchant Onboarding (7 Cols) */}
          <div className="md:col-span-7 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0055FF] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                Get set up in minutes
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                Create your merchant account, add your store profile, and create your first product and payment link, guided step by step.
              </p>
            </div>

            {/* In-Card Visual Mockup */}
            <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/[0.05] space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[#8C90A0] text-[10px] font-bold">
                <span>GUIDED SETUP</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-black/5 font-bold text-[#0A0D14] flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Store profile</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/5 font-bold text-[#0A0D14] flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>First product</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/5 font-bold text-[#0A0D14] flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Payment link</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Real-time Payments Ledger (5 Cols) */}
          <div className="md:col-span-5 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                Every payment, recorded
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                Successful payments are verified server-to-server via Cashfree's signed webhooks and appear in your Payments ledger automatically.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs font-mono text-emerald-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-emerald-700" />
                <span>Signature-Verified Webhooks</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Payment status is confirmed from Cashfree, never trusted from the browser alone.
              </p>
            </div>
          </div>

          {/* Card 3: UPI & Card Checkout (5 Cols) */}
          <div className="md:col-span-5 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                UPI &amp; Card Checkout
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                Customers pay by scanning a UPI QR code or entering card details in secure fields hosted by Cashfree, never on your server.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs font-mono text-purple-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-700" />
                <span>UPI QR &amp; RuPay/Visa/Mastercard</span>
              </div>
              <p className="text-[11px] text-purple-700">
                Amounts are signed server-side, so a link can't be tampered with in the browser.
              </p>
            </div>
          </div>

          {/* Card 4: Developer API (7 Cols) */}
          <div className="md:col-span-7 opp-card p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                A real API, from your own server
              </h3>
              <p className="text-sm text-[#6E717D] leading-relaxed">
                Generate a scoped API key and create checkout sessions for your products directly from your backend.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0D14] text-white font-mono text-xs space-y-2">
              <div className="flex justify-between text-neutral-400 text-[10px]">
                <span>CREATE A CHECKOUT SESSION</span>
              </div>
              <pre className="text-emerald-300 text-[11px] overflow-x-auto">
{`POST /api/v1/payments/create-session
Authorization: Bearer qivro_test_...

{ "productId": "prod_...", "currency": "INR" }`}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
