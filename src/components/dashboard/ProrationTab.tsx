import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProrationTab: React.FC = () => {
  const [currentPlanPrice, setCurrentPlanPrice] = useState(29);
  const [newPlanPrice, setNewPlanPrice] = useState(99);
  const [daysRemaining, setDaysRemaining] = useState(18);
  const [totalDaysInCycle, setTotalDaysInCycle] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Exact Proration Math
  const dailyCurrentRate = currentPlanPrice / totalDaysInCycle;
  const dailyNewRate = newPlanPrice / totalDaysInCycle;
  const unusedCredit = dailyCurrentRate * daysRemaining;
  const newTierCostRemaining = dailyNewRate * daysRemaining;
  const proratedChargeNow = Math.max(0, newTierCostRemaining - unusedCredit);

  const handleExecuteUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage(`Subscription upgraded! Customer charged prorated net amount of ₹${proratedChargeNow.toFixed(2)} INR today.`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 900);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Subscription Proration & Tier Upgrade Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Handles frictionless mid-billing-cycle plan upgrades and downgrades with exact second-by-second proration and automated credit deductions.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>REAL-TIME PRORATION</span>
        </div>
      </div>

      {/* Interactive Proration Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="opp-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#0A0D14] border-b border-black/5 pb-2">
              Plan Upgrade Parameters
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0D14]">Current Active Plan ($/mo)</label>
              <input
                type="number"
                value={currentPlanPrice}
                onChange={(e) => setCurrentPlanPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs text-[#0A0D14]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0D14]">Upgraded Target Plan ($/mo)</label>
              <input
                type="number"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs text-[#0A0D14]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#0A0D14]">Days Remaining in Current Cycle</span>
                <span className="font-mono font-bold text-[#0055FF]">{daysRemaining} of {totalDaysInCycle} Days</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(Number(e.target.value))}
                className="w-full accent-[#0055FF]"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleExecuteUpgrade}
                disabled={isProcessing}
                className="w-full opp-btn-primary py-3 text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Calculating & Charging...' : 'Execute Live Prorated Upgrade'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Math & Receipt Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="opp-card p-6 sm:p-8 space-y-6">
            
            <div className="flex justify-between items-center pb-4 border-b border-black/5">
              <h3 className="font-bold text-base text-[#0A0D14] font-heading">
                Proration Financial Ledger
              </h3>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                AUDIT-COMPLIANT
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-[#8C90A0]">
                <span>Unused Time on Current Tier ({daysRemaining} days @ ${(dailyCurrentRate).toFixed(2)}/day):</span>
                <span className="text-rose-600 font-bold">-₹{unusedCredit.toFixed(2)} INR Credit</span>
              </div>

              <div className="flex justify-between text-[#8C90A0]">
                <span>Cost for New Tier Remaining ({daysRemaining} days @ ${(dailyNewRate).toFixed(2)}/day):</span>
                <span className="text-[#0A0D14] font-bold">+₹{newTierCostRemaining.toFixed(2)} INR</span>
              </div>

              <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                <span className="font-bold text-sm text-[#0A0D14] font-sans">Immediate Prorated Charge Today:</span>
                <span className="text-2xl font-bold font-mono text-[#0055FF]">₹{proratedChargeNow.toFixed(2)} INR</span>
              </div>

              <div className="flex justify-between text-[#8C90A0] text-[11px] pt-1">
                <span>Next Billing Cycle Full Charge:</span>
                <span className="font-bold text-[#0A0D14]">₹{newPlanPrice.toFixed(2)} INR / month</span>
              </div>
            </div>

            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
