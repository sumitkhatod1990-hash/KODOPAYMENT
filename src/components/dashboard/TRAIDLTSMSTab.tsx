import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Smartphone, 
  Zap,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TRAIDLTSMSTab: React.FC = () => {
  const [templates, setTemplates] = useState([
    {
      id: 'dlt_tmpl_88190',
      principalEntityId: 'PE-110198271629',
      headerSenderId: 'KODOPY (Transactional)',
      templateType: 'Transactional Mandate & OTP Alerts',
      contentHash: '0x88f1a2c891b0...',
      carrierSync: 'Jio, Airtel, Vi, BSNL DLT Verified',
      deliverySuccess: '99.98% Scrubbing Pass Rate'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#0055FF]" />
            <span>TRAI DLT SMS &amp; WhatsApp Template Scrubbing Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Ensure 100% transactional delivery of authentication OTPs, payment links, and mandate notifications across Jio, Airtel, Vi, and BSNL without telecom blockchain filtering under TRAI TCCCPR regulations.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>TRAI DLT BLOCKCHAIN VERIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DLT Scrubbing Success Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">99.98% Delivered</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero telecom regulatory drops
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">OTP Delivery Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 1.8 Seconds</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Direct Tier-1 telecom routes</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DLT Header Sender ID</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">KODOPY Active</div>
          <div className="text-[11px] text-purple-700 font-mono">Registered on Airtel &amp; Jio DLT</div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">DLT Template ID</th>
                <th className="p-4 font-semibold">TRAI Principal Entity (PE)</th>
                <th className="p-4 font-semibold">Approved Sender Header</th>
                <th className="p-4 font-semibold">Carrier Blockchain Sync</th>
                <th className="p-4 font-semibold">Delivery Rate</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {t.id}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {t.principalEntityId}
                  </td>
                  <td className="p-4 font-bold text-emerald-700">
                    {t.headerSenderId}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {t.carrierSync}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {t.deliverySuccess}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DLT COMPLIANT
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
