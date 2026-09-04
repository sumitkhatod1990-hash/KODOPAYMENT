import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  ArrowRight,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AnnualSwitcherTab: React.FC = () => {
  const [activeSubscribers, setActiveSubscribers] = useState(140);
  const [monthlyPrice, setMonthlyPrice] = useState(49);
  const [annualConverted, setAnnualConverted] = useState(38);
  const [simulating, setSimulating] = useState(false);

  const annualPrice = monthlyPrice * 10; // 2 months free = 10x monthly
  const immediateCashflowLift = annualConverted * annualPrice;

  const handleSimulateConversion = () => {
    setSimulating(true);
    setTimeout(() => {
      setAnnualConverted(prev => prev + 5);
      setSimulating(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#0055FF]" />
            <span>1-Click Annual Upfront Discount Switcher</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Convert monthly subscribers to annual upfront billing by automatically embedding "Get 2 Months Free" upgrade prompts in the customer portal and invoice emails.
          </p>
        </div>

        <button
          onClick={handleSimulateConversion}
          disabled={simulating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{simulating ? 'Converting...' : 'Simulate 5x Annual Upgrades'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Immediate Upfront Cashflow</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">+₹{immediateCashflowLift.toLocaleString()} INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Across {annualConverted} annual subscribers
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Annual Conversion Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{((annualConverted / activeSubscribers) * 100).toFixed(1)}%</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Industry average is 12-15%</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Churn Deflection Lift</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">-78% Churn Risk</div>
          <div className="text-[11px] text-purple-700 font-mono">12-month guaranteed retention</div>
        </div>
      </div>

      {/* Customer Portal Preview Banner */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#0055FF]" />
            <span>Interactive Customer Portal In-App Switcher Banner</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            PORTAL EMBED ACTIVE
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/60 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#0055FF] uppercase tracking-wider bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                SPECIAL LOYALTY OFFER
              </span>
              <h4 className="font-bold text-[#0A0D14] text-base font-heading">
                Switch to Annual Billing and Get 2 Months Completely Free!
              </h4>
              <p className="text-xs text-[#6E717D]">
                Pay <strong className="text-[#0A0D14]">₹{annualPrice}.00 / year</strong> instead of <span className="line-through">₹{monthlyPrice * 12}.00</span>. Save ${(monthlyPrice * 2).toFixed(2)} INR today.
              </p>
            </div>

            <button
              onClick={handleSimulateConversion}
              className="opp-btn-primary px-6 py-3 font-semibold text-xs shrink-0 flex items-center gap-2 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Upgrade to Annual (1-Click)</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
