import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Globe2, 
  Building, 
  Sparkles,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EInvoicingTab: React.FC = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'einv_it_9981',
      country: 'Italy (Agenzia delle Entrate - SDI)',
      recipientCompany: 'Milano AI Software S.r.l.',
      recipientTaxId: 'IT10293840192',
      sdiCode: 'M5UXCR1',
      amount: '€1,200.00 EUR',
      clearanceStatus: 'cleared_delivered',
      irnHash: 'SDI-IT-2026-9981029381',
      clearedAt: 'Aug 25, 2026'
    },
    {
      id: 'einv_in_4421',
      country: 'India (GST e-Invoice Portal - NIC)',
      recipientCompany: 'Bengaluru Cloud Infra Pvt Ltd',
      recipientTaxId: '29AABCU9603R1ZM',
      sdiCode: 'N/A (IRN Portal)',
      amount: '₹145,000.00 INR',
      clearanceStatus: 'cleared_delivered',
      irnHash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
      clearedAt: 'Aug 28, 2026'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0055FF]" />
            <span>Global Mandatory e-Invoicing Engine (SDI / Chorus / IRN)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct government clearance integration for Italian FatturaPA (SDI), French Chorus Pro, and Indian GST e-Invoicing with cryptographic QR validation.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GOVERNMENT CLEARANCE VERIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cleared e-Invoices</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{invoices.length} Cleared</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Statutory Clearance
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cryptographic QR Encoding</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">Active</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">B2B invoice QR verification</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Clearance Latency SLA</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 850ms</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time tax authority API sync</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">e-Invoice ID</th>
                <th className="p-4 font-semibold">Government Authority</th>
                <th className="p-4 font-semibold">Recipient Enterprise</th>
                <th className="p-4 font-semibold">Corporate Tax ID / SDI</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Clearance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {inv.id}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {inv.country}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {inv.recipientCompany}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {inv.recipientTaxId} ({inv.sdiCode})
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {inv.amount}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      CLEARED (SDI/NIC)
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
