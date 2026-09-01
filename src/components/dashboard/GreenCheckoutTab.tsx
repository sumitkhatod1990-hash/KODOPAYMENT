import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Leaf, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Globe2, 
  Trees, 
  DollarSign,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GreenCheckoutTab: React.FC = () => {
  const [climate] = useState({
    totalCo2RemovedTons: '142.8 Tons CO2',
    totalMerchantContribution: '$18,450.00 USD',
    activeProjects: 'Frontier Biochar & Direct Air Capture (DAC)',
    greenBadgeParticipationRate: '84.2%'
  });

  const [optedIn, setOptedIn] = useState(true);

  const handleToggleGreen = () => {
    setOptedIn(!optedIn);
    if (!optedIn) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Green Checkout &amp; Carbon Removal Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Empower your customers with 1-click carbon removal micro-contributions at checkout, funding permanent Frontier-verified biochar and direct air capture projects.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Trees className="w-4 h-4 text-emerald-600" />
          <span>FRONTIER CLIMATE VERIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Permanent CO2 Removed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{climate.totalCo2RemovedTons}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 1,000+ year durability carbon removal
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Merchant Eco-Fund</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{climate.totalMerchantContribution}</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1% volume micro-allocations</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Shopper Green Opt-In Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{climate.greenBadgeParticipationRate}</div>
          <div className="text-[11px] text-purple-700 font-mono">High brand affinity boost</div>
        </div>
      </div>

      {/* Live Badge Preview */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0055FF]" />
            <span>&lt;qivropay-checkout&gt; Green Badge Integration Preview</span>
          </h3>
          <button
            onClick={handleToggleGreen}
            className={`px-3 py-1 rounded-full font-mono text-xs font-bold transition-all ${
              optedIn ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {optedIn ? '✓ 1% Carbon Removal Active' : 'Enable Carbon Removal'}
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              🌿
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-950 font-heading">Climate Positive Checkout Powered by QIVROPAY</div>
              <div className="text-xs text-emerald-800">1.0% of this purchase goes directly towards permanent carbon removal via Frontier.</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm">
            VERIFIED 100% GREEN
          </span>
        </div>
      </div>

    </div>
  );
};
