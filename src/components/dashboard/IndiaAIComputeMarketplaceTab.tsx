import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Coins, 
  Server,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IndiaAIComputeMarketplaceTab: React.FC = () => {
  const [tokens, setTokens] = useState([
    {
      id: 'iai_tok_99182',
      aiResearchLab: 'Sarvam AI / BharatGen Indic Foundation Model',
      gpuClusterType: '512x NVIDIA H100 SXM5 Sovereign Cluster (Yotta NM1)',
      grossComputeCost: '₹24,00,000.00 INR (120 GPU Hours)',
      indiaAiSubsidyOffset: '-₹12,00,000.00 (50% MeitY IndiaAI Voucher # MEITY-IAI-8819)',
      netBilledAmount: '₹12,00,000.00 INR (Instant RuPay / e-NACH)',
      status: 'sovereign_compute_allocated'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#0055FF]" />
            <span>IndiaAI Mission Sovereign GPU Compute &amp; Token Marketplace</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous billing and 50% MeitY IndiaAI Mission compute subsidy voucher offset for sovereign NVIDIA H100/B200 GPU AI cluster capacity allocated to Indian Indic AI startups.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MEITY INDIAAI MISSION CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">IndiaAI Voucher Subsidy Offset</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹12,00,000.00 Saved</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 50% Direct MeitY subsidy deduction
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Sovereign GPU Pool Capacity</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">10,000+ GPUs</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Tier-4 Sovereign Indian Cloud (Yotta/CtrlS)</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Compute Allocation Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 3.0 Seconds</div>
          <div className="text-[11px] text-purple-700 font-mono">Instant Slurm/Kubernetes cluster provisioning</div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">AI Research Lab &amp; Model</th>
                <th className="p-4 font-semibold">GPU Cluster Specification</th>
                <th className="p-4 font-semibold">Gross Compute Cost</th>
                <th className="p-4 font-semibold">MeitY 50% Voucher</th>
                <th className="p-4 font-semibold">Net Billed Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{t.aiResearchLab}</div>
                    <div className="font-mono text-[#8C90A0] text-[10px]">{t.id}</div>
                  </td>
                  <td className="p-4 text-[#0055FF] font-semibold">
                    {t.gpuClusterType}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0A0D14]">
                    {t.grossComputeCost}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">
                    {t.indiaAiSubsidyOffset}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {t.netBilledAmount}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ALLOCATED
                    </span>
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
