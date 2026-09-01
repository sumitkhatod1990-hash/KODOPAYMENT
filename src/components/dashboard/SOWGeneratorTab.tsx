import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSignature, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Download,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SOWGeneratorTab: React.FC = () => {
  const [proposals, setProposals] = useState([
    {
      id: 'sow_prop_991',
      enterpriseClient: 'Synthetix Cloud Infra Corp',
      expansionValue: '₹68,400.00 / yr',
      proposedSeats: '150 Dedicated Cluster Nodes',
      generatedAt: 'Aug 31, 2026',
      status: 'ready_for_procurement_signoff'
    }
  ]);

  const [generating, setGenerating] = useState(false);

  const handleGenerateSOW = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-[#0055FF]" />
            <span>AI Enterprise SOW & Expansion Proposal Generator</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous AI generator synthesizing customer usage telemetry into customized, C-suite ready Statements of Work (SOW) and expansion proposals in 5 seconds.
          </p>
        </div>

        <button
          onClick={handleGenerateSOW}
          disabled={generating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Drafting Enterprise SOW...' : 'Draft New Expansion SOW'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Expansion Value Drafted</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹68,400.00 / yr</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready for e-signature
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">SOW Close Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">74.8% Signed</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Tailored pricing & SLA inclusions</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Generation Time</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 4.5s</div>
          <div className="text-[11px] text-purple-700 font-mono">Instant PDF document compilation</div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">SOW Proposal ID</th>
                <th className="p-4 font-semibold">Enterprise Client</th>
                <th className="p-4 font-semibold">Proposed Annual Value</th>
                <th className="p-4 font-semibold">Capacity Upgrade Scope</th>
                <th className="p-4 font-semibold">Generated Date</th>
                <th className="p-4 font-semibold">Procurement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {proposals.map((prop) => (
                <tr key={prop.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {prop.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {prop.enterpriseClient}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {prop.expansionValue}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {prop.proposedSeats}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {prop.generatedAt}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      READY FOR SIGNOFF
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
