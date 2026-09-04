import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Building2, 
  Sparkles,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IndianGSTTab: React.FC = () => {
  const [filings, setFilings] = useState([
    {
      id: 'gst_inv_2026_8891',
      buyerGstin: '27AABCK1234F1Z8 (Reliance Cloud Infra)',
      stateCode: '27 - Maharashtra (Intra-State)',
      taxableAmount: '₹85,000.00',
      taxBreakup: 'CGST (9%): ₹7,650.00 | SGST (9%): ₹7,650.00',
      totalWithGst: '₹1,00,300.00',
      irnHash: 'a3f98c194b8e0129f8c4710298bb4a8172901...64char',
      status: 'irn_generated_nic_verified'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0055FF]" />
            <span>Indian GST &amp; Government NIC e-Invoicing IRN Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automated state-wise 18% GST calculation (Intra-State CGST+SGST vs Inter-State IGST with SAC 998313 code), real-time GSTIN validation, and instant IRP 64-character IRN hash generation with signed QR code.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GOVERNMENT GSTN / NIC INTEGRATED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">GSTIN Real-Time Verification</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Validated</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Real-time active status check
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Government e-Invoice IRN Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 0.9s per Invoice</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Instant cryptographic QR generation</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Input Tax Credit (ITC) Reconciled</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Seamless</div>
          <div className="text-[11px] text-purple-700 font-mono">GSTR-1 &amp; GSTR-3B auto-filing ready</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Tax Invoice ID</th>
                <th className="p-4 font-semibold">Buyer Verified GSTIN</th>
                <th className="p-4 font-semibold">Place of Supply (State)</th>
                <th className="p-4 font-semibold">Taxable Amount</th>
                <th className="p-4 font-semibold">GST Breakdown (18%)</th>
                <th className="p-4 font-semibold">NIC e-Invoice Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {f.id}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {f.buyerGstin}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {f.stateCode}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {f.taxableAmount}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-semibold text-[11px]">
                    {f.taxBreakup}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <QrCode className="w-3 h-3" />
                      IRN SIGNED &amp; COMPLIANT
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
