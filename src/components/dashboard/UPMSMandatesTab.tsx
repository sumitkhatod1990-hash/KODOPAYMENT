import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Zap, 
  Receipt,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UPMSMandatesTab: React.FC = () => {
  const [mandates, setMandates] = useState([
    {
      id: 'upms_mnd_5501',
      billerCategory: 'Enterprise B2B Cloud Infrastructure',
      corporateCustomer: 'HCL Digital Solutions',
      presentmentAmount: '₹85,000.00 / month',
      channelDispatched: 'Auto-Presented on HDFC NetBanking & WhatsApp Intent',
      customerApprovalTime: '4.2 Seconds (Instant OTP Authorize)',
      status: 'upms_auto_presented_paid'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Send className="w-6 h-6 text-[#0055FF]" />
            <span>NPCI Unified Presentment Management System (UPMS) Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Centralized bill presentment engine delivering recurring SaaS and enterprise invoices directly into corporate customer banking and UPI apps with 1-click mandate auto-debit authorizations.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NPCI UPMS CENTRALIZED BILLER</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">UPMS Presentment Success Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">99.1% Delivered</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-pushed to customer banking app
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Approval Time</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">4.2 Seconds</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1-Tap OTP authorization</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Collection Friction Deflected</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">-84% Dunning Overhead</div>
          <div className="text-[11px] text-purple-700 font-mono">No chasing unpaid manual PDFs</div>
        </div>
      </div>

      {/* Mandates Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">UPMS Presentment Ref</th>
                <th className="p-4 font-semibold">Enterprise Customer</th>
                <th className="p-4 font-semibold">Recurring Bill Value</th>
                <th className="p-4 font-semibold">Dispatched Channel</th>
                <th className="p-4 font-semibold">Customer Response</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {mandates.map((m) => (
                <tr key={m.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {m.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {m.corporateCustomer}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {m.presentmentAmount}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    {m.channelDispatched}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {m.customerApprovalTime}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      AUTO-SETTLED
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
