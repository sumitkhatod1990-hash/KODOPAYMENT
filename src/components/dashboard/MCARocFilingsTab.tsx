import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  FileSignature,
  FileCheck2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MCARocFilingsTab: React.FC = () => {
  const [filings, setFilings] = useState([
    {
      id: 'mca_roc_2026_01',
      companyCin: 'U72900KA2024PTC189021',
      companyName: 'KODO LABS TECHNOLOGIES INDIA PVT LTD',
      formType: 'AOC-4 (Annual Financial Statements) & MGT-7',
      directorDin: 'DIN 09817263 (DSC Signed)',
      rocRoStatus: 'MCA21 V3 Verified & Filed',
      status: 'statutory_compliance_active'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Building className="w-6 h-6 text-[#0055FF]" />
            <span>Automated MCA Corporate ROC Secretarial Filings Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automate statutory Ministry of Corporate Affairs (MCA) annual compliance (Form AOC-4, MGT-7, DIR-3 KYC) with Director Identification Number (DIN) and Digital Signature Certificate (DSC) verification.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MCA21 V3 PORTAL INTEGRATED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">MCA ROC Compliance Status</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Up to Date</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active Registrar of Companies standing
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Director DIN &amp; DSC Status</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">Verified Class-3 DSC</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">DIR-3 KYC completed for current FY</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory Penalty Exposure</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹0.00 Liability</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero late fee default risk</div>
        </div>
      </div>

      {/* Filings Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Filing Batch ID</th>
                <th className="p-4 font-semibold">Corporate Entity (CIN)</th>
                <th className="p-4 font-semibold">Statutory MCA e-Form</th>
                <th className="p-4 font-semibold">Signatory Director DIN</th>
                <th className="p-4 font-semibold">MCA21 Portal Status</th>
                <th className="p-4 font-semibold">ROC Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {f.id}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{f.companyName}</div>
                    <div className="font-mono text-[#8C90A0] text-[11px]">{f.companyCin}</div>
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {f.formType}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {f.directorDin}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {f.rocRoStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      STATUTORY ACTIVE
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
