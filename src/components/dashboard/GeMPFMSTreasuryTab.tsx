import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Building, 
  Receipt,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GeMPFMSTreasuryTab: React.FC = () => {
  const [contracts, setContracts] = useState([
    {
      id: 'gem_cntr_2026_901',
      buyerMinistry: 'Ministry of Electronics & Information Technology (MeitY)',
      contractNumber: 'GEMC-51168772910819',
      cracStatus: 'CRAC (Acceptance Certificate) Signed',
      invoiceValue: '₹24,00,000.00 INR',
      pfmsStatus: 'PFMS Treasury Sanction # 9817263',
      status: 'pfms_disbursed_to_bank'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#0055FF]" />
            <span>Government e-Marketplace (GeM) &amp; PFMS Treasury Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct GeM public procurement integration for Indian government tech contracts with automated Consignee Receipt and Acceptance Certificate (CRAC) validation and PFMS digital treasury disbursement tracking.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GOVERNMENT GEM &amp; PFMS INTEGRATED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">GeM Contract Invoice Value</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹24,00,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ministry order fulfilled
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">PFMS Treasury Sanction</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Disbursed</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Direct RBI/SBI Treasury debit</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">CRAC Acceptance Status</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Digitally Signed</div>
          <div className="text-[11px] text-purple-700 font-mono">10-Day mandatory clearance rule</div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">GeM Contract #</th>
                <th className="p-4 font-semibold">Procuring Ministry / Department</th>
                <th className="p-4 font-semibold">CRAC Delivery Standing</th>
                <th className="p-4 font-semibold">Contract Bill Value</th>
                <th className="p-4 font-semibold">PFMS Treasury Sanction</th>
                <th className="p-4 font-semibold">Disbursement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {c.contractNumber}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.buyerMinistry}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {c.cracStatus}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14] text-sm">
                    {c.invoiceValue}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-semibold">
                    {c.pfmsStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      PFMS PAID
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
