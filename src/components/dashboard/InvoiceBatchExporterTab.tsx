import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FolderDown, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Archive, 
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const InvoiceBatchExporterTab: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState(() => user?.email === 'demo@qivropay.com' ? [
    {
      id: 'batch_2026_q2_all',
      period: '2026 Q2 Full Quarter',
      invoiceCount: 1240,
      totalVolume: '$284,500.00 USD',
      format: 'ZIP Archive (1,240 Validated PDFs)',
      downloadStatus: 'ready_to_export'
    }
  ] : []);

  const [exporting, setExporting] = useState<string | null>(null);

  const handleDownloadBatch = (id: string) => {
    setExporting(id);
    setTimeout(() => {
      setExporting(null);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-[#0055FF]" />
            <span>Invoice exports</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Download your India GST invoices and export batches for accounting.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Archive className="w-4 h-4 text-emerald-600" />
          <span>{batches.length ? 'EXPORTS READY' : 'NO INVOICES YET'}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Invoices Ready for Export</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{batches.reduce((sum, b) => sum + b.invoiceCount, 0).toLocaleString('en-IN')} Invoices</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fully compiled tax PDFs
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Archived Billing Volume</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹{batches.reduce((sum, b) => sum + Number(String(b.totalVolume).replace(/[^0-9.]/g, '') || 0), 0).toLocaleString('en-IN')} INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">India billing volume</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Export Packaging Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">On demand</div>
          <div className="text-[11px] text-purple-700 font-mono">Secure PDF export</div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Batch Archive ID</th>
                <th className="p-4 font-semibold">Billing Period</th>
                <th className="p-4 font-semibold">Invoice Count</th>
                <th className="p-4 font-semibold">Quarterly Volume</th>
                <th className="p-4 font-semibold">Archive Format</th>
                <th className="p-4 font-semibold">1-Click Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {batches.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-sm text-[#8C90A0]">No invoices available yet.</td></tr>
              )}
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {b.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {b.period}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {b.invoiceCount} PDFs
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {b.totalVolume}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {b.format}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDownloadBatch(b.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#F4F5F8] border border-black/5 hover:border-black/20 text-[#0A0D14] font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0055FF]" />
                      <span>{exporting === b.id ? 'Packaging ZIP...' : 'Download Full ZIP'}</span>
                    </button>
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
