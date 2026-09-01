sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  BarChart3, 
  Zap, 
  PieChart,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NRRRadarTab: React.FC = () => {
  const [metrics] = useState({
    nrr: '118.4%',
    grossRetention: '96.2%',
    expansionMrr: '+₹14,200.00 / mo',
    contractionMrr: '-₹1,850.00 / mo',
    churnedMrr: '-₹2,100.00 / mo',
    quickRatio: '4.2x'
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#0055FF]" />
            <span>Real-Time SaaS Net Revenue Retention (NRR) &amp; Quick Ratio</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Institutional-grade SaaS cohort retention telemetry tracking expansion MRR, contraction drift, and investor-ready Quick Ratio efficiency.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>TOP 5% BENCHMARK TIER</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Net Revenue Retention (NRR)</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{metrics.nrr}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Growth without new customer acquisition
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Gross Revenue Retention (GRR)</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{metrics.grossRetention}</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Excluding expansion MRR</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">SaaS Quick Ratio</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{metrics.quickRatio}</div>
          <div className="text-[11px] text-purple-700 font-mono">&gt; 4.0 indicates hyper-efficient growth</div>
        </div>
      </div>

      {/* MRR Waterfall Breakdown */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#0055FF]" />
          <span>Monthly Net MRR Movement Telemetry</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">Expansion MRR Inflow:</span>
            <div className="font-bold text-emerald-700 text-sm">{metrics.expansionMrr}</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
            <span className="text-amber-800 font-bold">Contraction MRR:</span>
            <div className="font-bold text-amber-700 text-sm">{metrics.contractionMrr}</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
            <span className="text-rose-800 font-bold">Churned MRR Outflow:</span>
            <div className="font-bold text-rose-700 text-sm">{metrics.churnedMrr}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
