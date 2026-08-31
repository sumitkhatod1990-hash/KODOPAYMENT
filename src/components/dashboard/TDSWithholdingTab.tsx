import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  FileText, 
  Sparkles,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TDSWithholdingTab: React.FC = () => {
  const [withholdings, setWithholdings] = useState([
    {
      id: 'tds_rec_001',
      vendorName: 'Bengaluru AI Studio Pvt Ltd',
      pan: 'AABCB1234D (NSDL Verified)',
      grossPayout: '₹4,50,000.00',
      tdsRate: '1.00% (Section 194-O Marketplace)',
      tdsDeducted: '₹4,500.00',
      netDisbursed: '₹4,45,500.00',
      form16A: 'Generated (Ready for Q2 Download)'
    }
  ]);

  const [downloading, setDownloading] = useState(false);

  const handleDownloadForm16A = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0055FF]" />
            <span>TDS Withholding &amp; Section 194-O Tax Compliance Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automate mandatory 1% TDS deduction on marketplace seller and affiliate payouts under Income Tax Section 194-O / 194-J with NSDL PAN validation and automated Form 16A generation.
          </p>
        </div>

        <button
          onClick={handleDownloadForm16A}
          disabled={downloading}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Downloading...' : 'Export Form 16A Batch'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total TDS Deducted & Remitted</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹4,500.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-remitted to Income Tax Dept
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">PAN NSDL Verification</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Real-Time Validated</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero 20% higher TDS penalty risk</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Quarterly Form 26Q Filing</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">1-Click NSDL Export</div>
          <div className="text-[11px] text-purple-700 font-mono">Pre-compiled FVU text file</div>
        </div>
      </div>

      {/* Withholdings Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Vendor / Developer</th>
                <th className="p-4 font-semibold">Verified Permanent Account (PAN)</th>
                <th className="p-4 font-semibold">Gross Payout Volume</th>
                <th className="p-4 font-semibold">TDS Rate</th>
                <th className="p-4 font-semibold">TDS Deducted</th>
                <th className="p-4 font-semibold">Net Payout Disbursed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {withholdings.map((w) => (
                <tr key={w.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {w.vendorName}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {w.pan}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {w.grossPayout}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {w.tdsRate}
                  </td>
                  <td className="p-4 font-mono font-bold text-rose-700">
                    -{w.tdsDeducted}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {w.netDisbursed}
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
