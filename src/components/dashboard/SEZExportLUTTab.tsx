import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck2, 
  Sparkles, 
  FileText, 
  Percent,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SEZExportLUTTab: React.FC = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'sez_inv_2026_11',
      sezClient: 'Microsoft India (R&D) Pvt Ltd (Manyata SEZ)',
      sezGstin: '29AAACM2212M1ZY',
      lutArnNumber: 'AD290324009821L (Valid FY 2026-27)',
      invoiceValue: '₹14,50,000.00 INR',
      gstApplied: '0.00% (Zero-Rated Supply to SEZ under LUT)',
      status: 'sez_customs_endorsed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0055FF]" />
            <span>Indian SEZ &amp; STPI Zero-GST Export LUT Compliance Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automate Letter of Undertaking (LUT) Rule 96A compliance, generating zero-rated GST invoices for IT exports and supplies to Special Economic Zones (SEZ) like Manyata, DLF CyberCity, and GIFT City.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GST RULE 96A LUT ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active LUT ARN Number</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">AD290324009821L</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Valid for entire Financial Year 2026-27
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Zero-Rated SEZ Supplies</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹14,50,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">0% GST with zero capital blockage</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customs Specified Officer Endorsement</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Automated</div>
          <div className="text-[11px] text-purple-700 font-mono">SEZ Online portal integration</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">SEZ Invoice ID</th>
                <th className="p-4 font-semibold">SEZ Customer &amp; Unit GSTIN</th>
                <th className="p-4 font-semibold">LUT ARN #</th>
                <th className="p-4 font-semibold">Contract Value</th>
                <th className="p-4 font-semibold">GST Rate</th>
                <th className="p-4 font-semibold">Customs Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {i.id}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{i.sezClient}</div>
                    <div className="font-mono text-[#0055FF] text-[11px]">{i.sezGstin}</div>
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {i.lutArnNumber}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {i.invoiceValue}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-semibold">
                    {i.gstApplied}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      CUSTOMS ENDORSED
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
