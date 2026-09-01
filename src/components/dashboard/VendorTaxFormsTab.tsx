import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Globe2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VendorTaxFormsTab: React.FC = () => {
  const [forms, setForms] = useState([
    {
      id: 'tax_w9_01',
      vendorName: 'TechStream Media LLC',
      formType: 'IRS Form W-9 (US Entity)',
      tinMatchStatus: 'IRS TIN Matched & Validated',
      backupWithholding: '0.00% (Exempt)',
      signedDate: 'Aug 25, 2026',
      status: 'verified_active'
    },
    {
      id: 'tax_w8_01',
      vendorName: 'Hiroshi Tanaka (Tokyo)',
      formType: 'IRS Form W-8BEN (Foreign Individual)',
      tinMatchStatus: 'Foreign Tax ID Verified',
      backupWithholding: '10.00% (US-Japan Treaty)',
      signedDate: 'Aug 29, 2026',
      status: 'verified_active'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0055FF]" />
            <span>Automated B2B Vendor W-9 & W-8BEN Tax Collection Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Collect legally compliant digital IRS W-9 (US) and W-8BEN/W-8BEN-E (non-US) forms with automated IRS TIN matching before disbursing marketplace or affiliate payouts.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>IRS TIN MATCHING VERIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Tax Form Completion Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Compliant</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Payouts gated until TIN verified
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Year-End 1099-NEC Automation</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">1-Click IRS Filing</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Automated electronic dispatch</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">IRS Penalty Liability</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">$0.00 Liability</div>
          <div className="text-[11px] text-purple-700 font-mono">100% protected under QIVROPAY MoR</div>
        </div>
      </div>

      {/* Forms Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Vendor / Contractor</th>
                <th className="p-4 font-semibold">Statutory Tax Form</th>
                <th className="p-4 font-semibold">IRS TIN Match Status</th>
                <th className="p-4 font-semibold">Backup Withholding</th>
                <th className="p-4 font-semibold">Signed Date</th>
                <th className="p-4 font-semibold">Payout Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {forms.map((f) => (
                <tr key={f.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {f.vendorName}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {f.formType}
                  </td>
                  <td className="p-4 text-emerald-700 font-mono font-bold">
                    ✓ {f.tinMatchStatus}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {f.backupWithholding}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {f.signedDate}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      UNLOCKED (T+0)
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
