import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe2, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck2, 
  DollarSign, 
  Sparkles, 
  Building2,
  FileSignature
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LRSComplianceTab: React.FC = () => {
  const [filings, setFilings] = useState([
    {
      id: 'lrs_remit_441',
      purpose: 'Foreign Cloud Infra (AWS / OpenAI US)',
      remittanceUsd: '$12,500.00 USD',
      equivalentInr: '₹10,43,750.00 INR',
      tcsCollected: '₹52,187.50 INR (5.00% TCS under Sec 206C)',
      formA2Status: 'Form A2 & 15CB Generated via Authorized Dealer (AD)',
      status: 'rbi_compliant_remitted'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-[#0055FF]" />
            <span>LRS &amp; Cross-Border Cloud Outbound TCS Compliance Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automate RBI Liberalised Remittance Scheme (LRS) limits and Income Tax Section 206C(1G) TCS withholding (5% / 20%) with instant Form A2 &amp; 15CA/15CB generation for paying global cloud infrastructure.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RBI LRS &amp; SEC 206C COMPLIANT</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Authorized Outbound Remittances</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">$12,500.00 USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fully processed via Authorized Dealer Bank
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Tax Collected at Source (TCS)</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹52,187.50 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">5.0% Section 206C tax credit to PAN</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory Form A2 / 15CB</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Automated</div>
          <div className="text-[11px] text-purple-700 font-mono">CA digital signature ready</div>
        </div>
      </div>

      {/* Filings Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Remittance Ref ID</th>
                <th className="p-4 font-semibold">Overseas Purpose</th>
                <th className="p-4 font-semibold">USD Remitted</th>
                <th className="p-4 font-semibold">INR Equivalent</th>
                <th className="p-4 font-semibold">TCS Withheld (5%)</th>
                <th className="p-4 font-semibold">RBI Statutory Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {f.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {f.purpose}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {f.remittanceUsd}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {f.equivalentInr}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">
                    {f.tcsCollected}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      FORM A2 COMPLIANT
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
