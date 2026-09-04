import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Receipt, 
  Building2,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MFISHGCollectionTab: React.FC = () => {
  const [collections, setCollections] = useState([
    {
      id: 'mfi_shg_88192',
      shgGroupName: 'Gramin Mahila Swayam Sahayata Samiti (Wardha)',
      kistAmountCollected: '₹48,000.00 INR (12 Members x ₹4,000)',
      collectionChannel: 'AEPS Biometric + UPI 123PAY Soundbox',
      nabardPslCreditScore: '98.5% Repayment Track Record',
      status: 'kist_auto_reconciled'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0055FF]" />
            <span>Microfinance (MFI) &amp; Self-Help Group (SHG) e-Kist Collection Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous digital collection infrastructure for Tier-3/4 rural micro-enterprises and women Self-Help Groups (SHGs) using Aadhaar AEPS biometric and UPI 123PAY voice soundbox terminals with NABARD PSL credit reporting.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NABARD PSL CREDIT SYNCED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">e-Kist Group Repayment Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">98.5% On-Time</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero manual cash transit risk
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Collection Channels</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">AEPS &amp; 123PAY</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Biometric fingerprint &amp; audio soundbox</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">NABARD PSL Compliance</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Eligible</div>
          <div className="text-[11px] text-purple-700 font-mono">Priority Sector Lending statutory credit</div>
        </div>
      </div>

      {/* Collections Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Self-Help Group (SHG) Entity</th>
                <th className="p-4 font-semibold">Monthly e-Kist Collected</th>
                <th className="p-4 font-semibold">Collection Terminal</th>
                <th className="p-4 font-semibold">NABARD Track Record</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {collections.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{c.shgGroupName}</div>
                    <div className="font-mono text-[#8C90A0] text-[10px]">{c.id}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {c.kistAmountCollected}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {c.collectionChannel}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {c.nabardPslCreditScore}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      RECONCILED
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
