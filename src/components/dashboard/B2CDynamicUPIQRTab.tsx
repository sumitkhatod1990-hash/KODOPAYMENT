import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Zap, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const B2CDynamicUPIQRTab: React.FC = () => {
  const [qrCodes, setQrCodes] = useState([
    {
      id: 'b2c_qr_99018',
      invoiceNumber: 'INV-2026-B2C-8819',
      consumerName: 'Ananya Deshmukh',
      invoiceTotal: '₹1,768.82 INR (incl. 18% GST)',
      upiIntentPayload: 'upi://pay?pa=kodopayments@icici&pn=KodoPayments&am=1768.82&tr=INV8819',
      cbicCompliance: 'CBIC Notification 14/2020 Compliant Dynamic QR',
      status: 'scanned_and_settled'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <QrCode className="w-6 h-6 text-[#0055FF]" />
            <span>B2C Dynamic UPI QR Code Engine (CBIC Compliant)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatic generation of statutory dynamic UPI QR codes on all consumer retail and B2C SaaS invoices conforming to CBIC GST Notification No. 14/2020 with real-time scan settlement.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CBIC NOTIF 14/2020 COMPLIANT</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Dynamic QR Generation Speed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">&lt; 0.12 Seconds</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Real-time invoice amount &amp; GST embed
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Scan &amp; Pay Success Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">99.4% First Scan</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Compatible with GPay, PhonePe, Paytm, CRED</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory GST Fine Protection</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Protected</div>
          <div className="text-[11px] text-purple-700 font-mono">Avoids ₹25,000 per invoice penalty</div>
        </div>
      </div>

      {/* QrCodes Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">B2C Invoice Number</th>
                <th className="p-4 font-semibold">Consumer Customer</th>
                <th className="p-4 font-semibold">Total with 18% GST</th>
                <th className="p-4 font-semibold">Dynamic UPI Intent String</th>
                <th className="p-4 font-semibold">CBIC Standing</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {qrCodes.map((q) => (
                <tr key={q.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {q.invoiceNumber}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {q.consumerName}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {q.invoiceTotal}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px] truncate max-w-xs">
                    {q.upiIntentPayload}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {q.cbicCompliance}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      PAID VIA QR
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
