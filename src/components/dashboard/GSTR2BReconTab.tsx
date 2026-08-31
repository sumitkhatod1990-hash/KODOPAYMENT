import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Receipt,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GSTR2BReconTab: React.FC = () => {
  const [recons, setRecons] = useState([
    {
      id: 'gstr2b_match_701',
      vendorName: 'Tata Communications Cloud Services',
      vendorGstin: '27AAACT2727Q1ZW',
      portalItcAmount: '₹15,300.00 IGST',
      purchaseRegisterAmount: '₹15,300.00 IGST',
      matchScore: '100% Perfect Match',
      itcClaimStatus: 'ready_for_gstr3b_offset'
    }
  ]);

  const [matching, setMatching] = useState(false);

  const handleRunRecon = () => {
    setMatching(true);
    setTimeout(() => {
      setMatching(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0055FF]" />
            <span>B2B GSTR-2B vs Purchase Ledger AI Reconciliation Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous AI reconciliation between government GSTN GSTR-2B input tax credit (ITC) data and your internal vendor purchase registers to eliminate tax leakage and maximize ITC offsets.
          </p>
        </div>

        <button
          onClick={handleRunRecon}
          disabled={matching}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${matching ? 'animate-spin' : ''}`} />
          <span>{matching ? 'Matching GSTR-2B...' : 'Run GSTR-2B AI Auto-Match'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Input Tax Credit (ITC) Matched</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹15,300.00 IGST</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% matched against GSTN portal
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">ITC Leakage Prevented</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹0.00 Lost Credit</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Flagged unmatched supplier invoices</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">GSTR-3B Auto-Offset</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">1-Click Ready</div>
          <div className="text-[11px] text-purple-700 font-mono">Instant electronic tax offset</div>
        </div>
      </div>

      {/* Recons Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Vendor Supplier</th>
                <th className="p-4 font-semibold">Vendor Verified GSTIN</th>
                <th className="p-4 font-semibold">GSTN Portal GSTR-2B ITC</th>
                <th className="p-4 font-semibold">Internal Purchase Ledger</th>
                <th className="p-4 font-semibold">AI Match Score</th>
                <th className="p-4 font-semibold">ITC Claim Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {recons.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {r.vendorName}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {r.vendorGstin}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {r.portalItcAmount}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {r.purchaseRegisterAmount}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {r.matchScore}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ELIGIBLE FOR GSTR-3B
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
