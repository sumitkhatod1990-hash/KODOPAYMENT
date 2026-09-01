import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PricingCalculator: React.FC = () => {
  const { setCurrentView } = useApp();
  const [monthlyVolume, setMonthlyVolume] = useState<number>(35000);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(50);

  const totalTransactions = Math.max(1, Math.round(monthlyVolume / avgOrderValue));
  
  // QIVROPAY: 4% + ₹0.40
  const qivropayFee = (monthlyVolume * 0.04) + (totalTransactions * 0.40);
  const qivropayNet = monthlyVolume - qivropayFee;

  // LemonSqueezy: 5% + ₹0.50
  const lsFee = (monthlyVolume * 0.05) + (totalTransactions * 0.50);
  const lsNet = monthlyVolume - lsFee;

  // Stripe Stack: Stripe + Billing + Tax + Anrok/TaxJar overhead (₹250/mo minimum)
  const stripeStackFee = (monthlyVolume * (0.029 + 0.007 + 0.005 + 0.015)) + (totalTransactions * 0.30) + 250;
  const stripeNet = monthlyVolume - stripeStackFee;

  const savingsVsLS = Math.max(0, lsFee - qivropayFee);

  return (
    <section className="py-24 md:py-36 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#0071e3]">
            Transparent Economics
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
            Calculate your net earnings with QIVROPAY.
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] max-w-2xl mx-auto">
            No monthly subscription fees, no minimums, no surprise charges. Just simple 4% + 40¢ per transaction.
          </p>
        </div>

        {/* Apple Style Calculator Master Card */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#f5f5f7] border border-black/10 p-8 sm:p-14 space-y-10 shadow-sm">
          
          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pb-10 border-b border-black/10">
            
            {/* Monthly Volume */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#1d1d1f] font-semibold">Estimated Monthly Volume</span>
                <span className="font-mono font-black text-2xl text-[#1d1d1f]">
                  ${monthlyVolume.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="300000"
                step="2000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#86868b]">
                <span>₹2,000/mo</span>
                <span>₹150,000/mo</span>
                <span>₹300,000+/mo</span>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#1d1d1f] font-semibold">Average Order / Plan Price</span>
                <span className="font-mono font-black text-2xl text-[#0071e3]">
                  ${avgOrderValue}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#86868b]">
                <span>₹5 (Micro AI)</span>
                <span>₹50 (SaaS Tier)</span>
                <span>₹250 (Annual)</span>
              </div>
            </div>

          </div>

          {/* 3-Column Result Tier */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* QIVROPAY (White Hero) */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#0071e3] space-y-6 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 bg-[#0071e3] text-white font-mono font-bold text-[10px] uppercase px-4 py-1 rounded-bl-2xl">
                Highest Take-Home
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0071e3]">
                  QivroPay (by Neocraft LLP)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#1d1d1f] font-mono mt-1">
                  ${Math.round(qivropayNet).toLocaleString()}
                </div>
                <div className="text-xs text-[#86868b] font-medium mt-0.5">Net Monthly Payout</div>
              </div>

              <div className="space-y-3 text-xs border-t border-black/5 pt-4 text-[#6e6e73] font-mono">
                <div className="flex justify-between">
                  <span>Platform Fee (4% + 40¢):</span>
                  <span className="text-[#1d1d1f] font-bold">₹{Math.round(qivropayFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant of Record:</span>
                  <span className="text-emerald-600 font-bold">Included (₹0)</span>
                </div>
                <div className="flex justify-between">
                  <span>Global Tax Remittance:</span>
                  <span className="text-emerald-600 font-bold">Included (₹0)</span>
                </div>
              </div>
            </div>

            {/* LemonSqueezy */}
            <div className="p-8 rounded-3xl bg-white border border-black/10 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#86868b]">
                  LemonSqueezy
                </span>
                <div className="text-3xl font-bold text-[#1d1d1f] font-mono mt-1">
                  ${Math.round(lsNet).toLocaleString()}
                </div>
                <div className="text-xs text-[#86868b] font-medium mt-0.5">Net Monthly Payout</div>
              </div>

              <div className="space-y-3 text-xs border-t border-black/5 pt-4 text-[#6e6e73] font-mono">
                <div className="flex justify-between">
                  <span>Fee (5% + 50¢):</span>
                  <span className="text-[#1d1d1f]">₹{Math.round(lsFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Extra Cost vs QIVROPAY:</span>
                  <span className="font-bold">+₹{Math.round(savingsVsLS).toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            {/* Stripe Stack */}
            <div className="p-8 rounded-3xl bg-white border border-black/10 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#86868b]">
                  Stripe + Tax Stack
                </span>
                <div className="text-3xl font-bold text-[#1d1d1f] font-mono mt-1">
                  ${Math.round(stripeNet).toLocaleString()}
                </div>
                <div className="text-xs text-[#86868b] font-medium mt-0.5">Net Monthly Payout</div>
              </div>

              <div className="space-y-3 text-xs border-t border-black/5 pt-4 text-[#6e6e73] font-mono">
                <div className="flex justify-between">
                  <span>Stripe + Addons:</span>
                  <span className="text-[#1d1d1f]">₹{Math.round(stripeStackFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Tax Filing:</span>
                  <span>Self-managed</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-sm text-[#1d1d1f]">
              <Sparkles className="w-5 h-5 text-[#0071e3]" />
              <span>You save <strong>₹{Math.round(savingsVsLS * 12).toLocaleString()} every year</strong> with QIVROPAY.</span>
            </div>

            <button
              onClick={() => setCurrentView('dashboard')}
              className="apple-btn-black px-8 py-3.5 text-xs uppercase tracking-wider flex items-center gap-2 active:scale-95 shadow-md"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
