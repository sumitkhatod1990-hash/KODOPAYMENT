import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Coins, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EPFOESICPayrollTab: React.FC = () => {
  const [challans, setChallans] = useState([
    {
      id: 'epfo_ecr_2026_08',
      wageMonth: 'August 2026',
      headCount: '42 Tech Engineers & Operations',
      totalEpfoDeduction: '₹2,52,000.00 INR',
      totalEsicDeduction: '₹48,300.00 INR',
      trrnNumber: 'TRRN-8819028471928',
      sbiEChequeStatus: 'Electronic Challan Receipt Generated',
      status: 'epfo_statutory_cleared'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0055FF]" />
            <span>EPFO &amp; ESIC Payroll Statutory ECR Challan Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automate monthly tech team payroll statutory compliance, Electronic Challan cum Return (ECR) generation, and TRRN government treasury reconciliation for EPFO &amp; ESIC.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>EPFO &amp; ESIC UNIFIED COMPLIANCE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Monthly EPFO PF Contribution</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹2,52,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 12% Employer + 12% Employee Share
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">ESIC Health Contribution</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹48,300.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">4.0% statutory medical cover</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory Penalty Risk</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹0.00 (Zero Default)</div>
          <div className="text-[11px] text-purple-700 font-mono">Filed before 15th statutory cut-off</div>
        </div>
      </div>

      {/* Challans Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Wage Month</th>
                <th className="p-4 font-semibold">Enrolled Employees</th>
                <th className="p-4 font-semibold">EPFO Contribution</th>
                <th className="p-4 font-semibold">ESIC Contribution</th>
                <th className="p-4 font-semibold">Treasury TRRN #</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {challans.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.wageMonth}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {c.headCount}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {c.totalEpfoDeduction}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {c.totalEsicDeduction}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {c.trrnNumber}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      TRRN CLEARED
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
