import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartHandshake, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Building2, 
  FileText,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CorporateCSRVaultTab: React.FC = () => {
  const [allocations, setAllocations] = useState([
    {
      id: 'csr_all_2026_01',
      statutoryYear: 'FY 2026-27 (Section 135 Companies Act)',
      netProfitAverage: '₹1,80,00,000.00 (3-Year Avg Net Profit)',
      statutory2PercentAllocation: '₹3,60,000.00 INR',
      impactPartner: 'Pratham Digital Tech Education NGO (Reg # CSR000182)',
      ngo80GStatus: 'Form 10A & 80G Tax Exemption Verified',
      mcaFormStatus: 'Form CSR-1 & CSR-2 Pre-Compiled for Board Approval',
      status: 'csr_mandate_fulfilled'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#0055FF]" />
            <span>Section 135 MCA Corporate CSR (2%) Impact Escrow Ledger</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous calculation, Schedule VII NGO escrow allocation, 80G tax verification, and MCA Form CSR-1 / CSR-2 annual reporting under Section 135 of the Indian Companies Act 2013.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SECTION 135 CSR COMPLIANT</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory 2% CSR Allocation</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹3,60,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Disbursed to MCA CSR-01 registered NGO
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">3-Year Average Net Profit</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹1,80,00,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Audited Section 198 net profit</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">MCA Form CSR-2 Status</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Pre-Compiled</div>
          <div className="text-[11px] text-purple-700 font-mono">1-Click filing with Ministry of Corporate Affairs</div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Statutory Assessment Year</th>
                <th className="p-4 font-semibold">Audited Net Profit Base</th>
                <th className="p-4 font-semibold">2% CSR Fund</th>
                <th className="p-4 font-semibold">NGO Partner &amp; 80G Status</th>
                <th className="p-4 font-semibold">MCA Form Filing</th>
                <th className="p-4 font-semibold">Compliance Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {allocations.map((a) => (
                <tr key={a.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {a.statutoryYear}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {a.netProfitAverage}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {a.statutory2PercentAllocation}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{a.impactPartner}</div>
                    <div className="text-emerald-700 text-[11px]">✓ {a.ngo80GStatus}</div>
                  </td>
                  <td className="p-4 text-[#0A0D14] font-mono">
                    {a.mcaFormStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      CSR FULFILLED
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
