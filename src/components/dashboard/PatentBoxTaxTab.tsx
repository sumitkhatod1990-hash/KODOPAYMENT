import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Percent, 
  Coins, 
  FileText,
  Calculator
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PatentBoxTaxTab: React.FC = () => {
  const [royalties, setRoyalties] = useState([
    {
      id: 'ptb_roy_2026_01',
      patentNumber: 'IN-PAT-382901 (Deep Learning Encryption Engine)',
      patentHolder: 'QIVROPAY Labs Technologies India Pvt Ltd',
      grossGlobalRoyalty: '₹85,00,000.00 INR',
      statutoryNormalTaxRate: '25.0% Corporate Tax',
      concessionalSec115BBFRate: '10.0% Concessional Patent Box Rate',
      taxSavedVia115BBF: '₹12,75,000.00 Saved',
      status: 'form_3cfa_filed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Award className="w-6 h-6 text-[#0055FF]" />
            <span>DPIIT Patent Box (Section 115BBF) 10% Concessional Tax Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous verification of Indian Patent Office (IPO) granted patents and statutory concessional 10% corporate income tax calculation on domestic and global software royalty income under Section 115BBF.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SECTION 115BBF CONCESSIONAL 10%</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Corporate Tax Saved via 115BBF</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹12,75,000.00 Saved</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Reduced from 25% to 10% rate
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Global Royalty Inflows</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹85,00,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Eligible IP development in India</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Form 3CFA Statutory Return</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Auto-Generated</div>
          <div className="text-[11px] text-purple-700 font-mono">1-Click Income Tax portal e-Filing</div>
        </div>
      </div>

      {/* Royalties Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Indian Granted Patent</th>
                <th className="p-4 font-semibold">Global Royalty Revenue</th>
                <th className="p-4 font-semibold">Normal vs Concessional Tax</th>
                <th className="p-4 font-semibold">Net Tax Benefit</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {royalties.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{r.patentNumber}</div>
                    <div className="font-mono text-[#8C90A0] text-[11px]">{r.patentHolder}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {r.grossGlobalRoyalty}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    <div>Standard: <span className="line-through text-rose-600">{r.statutoryNormalTaxRate}</span></div>
                    <div className="font-bold text-emerald-700">Sec 115BBF: {r.concessionalSec115BBFRate}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {r.taxSavedVia115BBF}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      FORM 3CFA FILED
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
