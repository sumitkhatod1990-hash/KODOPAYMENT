import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Percent, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Landmark, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TreasuryYieldTab: React.FC = () => {
  const [sweepActive, setSweepActive] = useState(true);
  const [investedFloat, setInvestedFloat] = useState(148500);

  const apy = 0.048; // 4.80% APY
  const annualEarned = investedFloat * apy;
  const dailyEarned = annualEarned / 365;

  const handleToggleSweep = () => {
    setSweepActive(!sweepActive);
    if (!sweepActive) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Percent className="w-6 h-6 text-[#0055FF]" />
            <span>High-Yield Merchant Float & Auto-Treasury Yield (4.80% APY)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Earn 4.80% APY yield on your idle settlement balances backed by short-term US Treasury Bills with daily compounding and 100% instant T+0 payout liquidity.
          </p>
        </div>

        <button
          onClick={handleToggleSweep}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto ${
            sweepActive 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${sweepActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          <span>{sweepActive ? 'Auto-Yield Sweep Active' : 'Yield Sweep Paused'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Treasury Float</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">${investedFloat.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> US Short-Term T-Bills (0-3M)
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Institutional APY Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">4.80% APY</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Daily compounding interest</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Projected Annual Yield</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">+${annualEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD / yr</div>
          <div className="text-[11px] text-purple-700 font-mono">+${dailyEarned.toFixed(2)} USD / day interest</div>
        </div>
      </div>

      {/* Yield Simulator Slider */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0055FF]" />
            <span>Interactive Float Yield & Interest Calculator</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#0055FF]">
            Selected Float: ${investedFloat.toLocaleString()} USD
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={10000}
            max={1000000}
            step={10000}
            value={investedFloat}
            onChange={(e) => setInvestedFloat(Number(e.target.value))}
            className="w-full accent-[#0055FF]"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8C90A0]">
            <span>$10,000 Float</span>
            <span>$500,000 Float</span>
            <span>$1,000,000 Float</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Daily Passive Interest:</span>
            <div className="font-bold text-emerald-700 text-sm">+${dailyEarned.toFixed(2)} USD / day</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Monthly Yield Cashflow:</span>
            <div className="font-bold text-[#0055FF] text-sm">+${(annualEarned / 12).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD / mo</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">12-Month Net Passive Income:</span>
            <div className="font-bold text-emerald-700 text-lg">+${annualEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</div>
          </div>
        </div>
      </div>

    </div>
  );
};
