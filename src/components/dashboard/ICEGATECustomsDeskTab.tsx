import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Anchor, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Package, 
  Coins,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ICEGATECustomsDeskTab: React.FC = () => {
  const [boes, setBoes] = useState([
    {
      id: 'boe_ice_99182',
      portLocation: 'Nhava Sheva Port (INNSA1)',
      billOfEntryNo: 'BOE-88192019',
      importedGoods: 'NVIDIA H100 AI Compute Hardware Servers',
      customsDutyPaid: '₹4,80,000.00 BCD + AIDC',
      igstInputCredit: '₹18,50,000.00 IGST (Credited to GSTR-2B)',
      icegateStatus: 'customs_out_of_charge_cleared'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Anchor className="w-6 h-6 text-[#0055FF]" />
            <span>ICEGATE Customs Bill of Entry (BoE) &amp; Import IGST Credit Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct Indian Customs EDI Gateway (ICEGATE) synchronization for hardware and server imports, verifying Bill of Entry (BoE) assessments and auto-crediting import IGST to GSTR-2B.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ICEGATE INDIAN CUSTOMS EDI SYNCED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Import IGST Credit Claimed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹18,50,000.00 IGST</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-populated in GSTR-2B Input Credit
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customs Out of Charge (OOC)</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Cleared</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero port demurrage detention delay</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Basic Customs Duty (BCD)</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹4,80,000.00 Paid</div>
          <div className="text-[11px] text-purple-700 font-mono">Direct ICEGATE e-Payment debit</div>
        </div>
      </div>

      {/* BoEs Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Bill of Entry (BoE) #</th>
                <th className="p-4 font-semibold">Customs Port (ICEGATE)</th>
                <th className="p-4 font-semibold">Imported Hardware Item</th>
                <th className="p-4 font-semibold">Customs Duty Paid</th>
                <th className="p-4 font-semibold">Import IGST Credit</th>
                <th className="p-4 font-semibold">Port Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {boes.map((b) => (
                <tr key={b.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {b.billOfEntryNo}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {b.portLocation}
                  </td>
                  <td className="p-4 text-[#0A0D14] font-semibold">
                    {b.importedGoods}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {b.customsDutyPaid}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {b.igstInputCredit}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      OUT OF CHARGE (OOC)
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
