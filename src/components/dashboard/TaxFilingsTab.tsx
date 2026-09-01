sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Globe2, 
  ShieldCheck,
  Sparkles,
  ArrowDownToLine
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaxFilingsTab: React.FC = () => {
  const [filings, setFilings] = useState([
    {
      id: 'tax_fl_2026_q2_eu',
      jurisdiction: 'EU VAT One-Stop Shop (OSS)',
      period: '2026 Q2',
      taxCollected: '€18,420.00 INR',
      filingStatus: 'ready_to_remit',
      deadline: 'Sep 30, 2026',
      format: 'XML & CSV Schema'
    },
    {
      id: 'tax_fl_2026_q2_uk',
      jurisdiction: 'UK HMRC VAT Return',
      period: '2026 Q2',
      taxCollected: '£11,280.00 INR',
      filingStatus: 'ready_to_remit',
      deadline: 'Oct 07, 2026',
      format: 'MTD VAT JSON'
    },
    {
      id: 'tax_fl_2026_q2_us',
      jurisdiction: 'US Multi-State DOR Summary',
      period: '2026 Q2',
      taxCollected: '₹24,650.00 INR',
      filingStatus: 'remitted_settled',
      deadline: 'Aug 20, 2026',
      format: 'NACHA & State CSV'
    }
  ]);

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadPackage = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Building className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Global Tax Filing & Remittance Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Pre-compiled statutory tax remittance packages for EU VAT One-Stop Shop (OSS), UK HMRC, and US State Departments of Revenue.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% AUDIT-READY COMPLIANCE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Tax Remitted Under QIVROPAY MoR</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹54,350.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Segregated in QIVROPAY Escrow Trust
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Merchant Tax Filing Liability</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">0% Zero Filings</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">QIVROPAY files all returns directly</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Jurisdictions Remitted</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">52 State & Global</div>
          <div className="text-[11px] text-purple-700 font-mono">EU OSS, UK HMRC, US 45 States</div>
        </div>
      </div>

      {/* Filings Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Tax Authority Jurisdiction</th>
                <th className="p-4 font-semibold">Filing Period</th>
                <th className="p-4 font-semibold">Tax Liability Collected</th>
                <th className="p-4 font-semibold">Remittance Deadline</th>
                <th className="p-4 font-semibold">Filing Package Export</th>
                <th className="p-4 font-semibold">Remittance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filings.map((fl) => (
                <tr key={fl.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14] font-sans">
                    {fl.jurisdiction}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {fl.period}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {fl.taxCollected}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {fl.deadline}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDownloadPackage(fl.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#F4F5F8] border border-black/5 hover:border-black/20 text-[#0A0D14] font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 text-[#0055FF]" />
                      <span>{downloading === fl.id ? 'Exporting...' : `Download ${fl.format}`}</span>
                    </button>
                  </td>
                  <td className="p-4">
                    {fl.filingStatus === 'remitted_settled' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        REMITTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold text-[10px] border border-blue-200">
                        <Clock className="w-3 h-3" />
                        READY TO REMIT
                      </span>
                    )}
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
