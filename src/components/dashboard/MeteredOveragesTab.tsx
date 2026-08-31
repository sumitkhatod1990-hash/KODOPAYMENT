import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Gauge, 
  Cpu, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Plus, 
  Sliders, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MeteredOveragesTab: React.FC = () => {
  const [tiers, setTiers] = useState([
    {
      id: 'ov_01',
      meterName: 'AI Inference Tokens (Millions)',
      includedUnits: '50M Tokens',
      tier1: '0 - 50M: Included in $49/mo Base',
      tier2: '50M - 200M: $0.0008 / 1k Tokens',
      tier3: '200M+: $0.0005 / 1k Tokens (Volume Discount)',
      autoBumpThreshold: '250M Tokens (Auto-upgrades to Enterprise Cluster)',
      status: 'active'
    },
    {
      id: 'ov_02',
      meterName: 'Dedicated GPU Node Hours',
      includedUnits: '100 Hours',
      tier1: '0 - 100 Hrs: Included in Base',
      tier2: '100 - 500 Hrs: $0.45 / GPU Hour',
      tier3: '500+ Hrs: $0.35 / GPU Hour',
      autoBumpThreshold: '600 Hrs (Auto-upgrades to Dedicated Rack)',
      status: 'active'
    }
  ]);

  const [simulatedUsage, setSimulatedUsage] = useState(140); // 140M tokens

  const calculateOverage = (usageM: number) => {
    if (usageM <= 50) return 0;
    const overageM = usageM - 50;
    return overageM * 1000 * 0.0008; // $0.0008 per 1k = $0.80 per 1M
  };

  const calculatedOverageFee = calculateOverage(simulatedUsage);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Gauge className="w-6 h-6 text-[#0055FF]" />
            <span>Tiered Metered Overages & Threshold Auto-Bumping</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatic graduated burst pricing curves and auto-upgrades when customers exceed included base subscription quotas.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>REAL-TIME BURST CALCULATION</span>
        </div>
      </div>

      {/* Simulator Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading">
            Live Token Consumption & Overage Calculator
          </h3>
          <span className="text-xs font-mono font-bold text-[#0055FF]">
            Current Consumption: {simulatedUsage}M Tokens
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={10}
            max={300}
            value={simulatedUsage}
            onChange={(e) => setSimulatedUsage(Number(e.target.value))}
            className="w-full accent-[#0055FF]"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8C90A0]">
            <span>10M (Within Base Quota)</span>
            <span>50M (Base Limit)</span>
            <span>200M (Volume Tier)</span>
            <span>300M (Auto-Bump)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Base Included Plan:</span>
            <div className="font-bold text-[#0A0D14] text-sm">$49.00 USD (50M Tokens)</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Metered Burst Overage:</span>
            <div className="font-bold text-[#0055FF] text-sm">+${calculatedOverageFee.toFixed(2)} USD ({Math.max(0, simulatedUsage - 50)}M Over)</div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-[#0055FF]">Total Invoice At Renewal:</span>
            <div className="font-bold text-emerald-700 text-lg">${(49 + calculatedOverageFee).toFixed(2)} USD</div>
          </div>
        </div>

        {simulatedUsage >= 250 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-800 font-semibold flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Threshold Reached (&gt;250M): Account auto-scheduled for Enterprise Dedicated Cluster upgrade on next cycle.</span>
          </div>
        )}
      </div>

      {/* Tiers Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Meter Resource</th>
                <th className="p-4 font-semibold">Base Included Quota</th>
                <th className="p-4 font-semibold">Tier 1 Rate</th>
                <th className="p-4 font-semibold">Tier 2 Burst Rate</th>
                <th className="p-4 font-semibold">Volume Discount Tier</th>
                <th className="p-4 font-semibold">Auto-Bump Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {tiers.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {t.meterName}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {t.includedUnits}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {t.tier1}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {t.tier2}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">
                    {t.tier3}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {t.autoBumpThreshold}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
