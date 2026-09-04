import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  CheckCircle2, 
  ShieldCheck, 
  Globe2, 
  DollarSign, 
  Sparkles, 
  Building,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GIFTCityIFSCTab: React.FC = () => {
  const [settlements, setSettlements] = useState([
    {
      id: 'ifsc_tx_7701',
      ifscEntity: 'QIVROPAY Global FinTech IFSC Unit (GIFT City Gandhinagar)',
      ifscaLicenseNo: 'IFSCA/BF/2026/0091',
      settlementCurrency: 'INR (₹48,500.00 INR)',
      inrEquivalent: '₹40,49,750.00 INR',
      withholdingTax: '0.00% (Tax-Free Export under Section 80LA)',
      nostroBank: 'Standard Chartered Bank IFSC Branch',
      status: 'settled_in_ifsc_nostro'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#0055FF]" />
            <span>GIFT City (IFSC) Offshore INR Invoicing &amp; Settlement Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            IFSCA-regulated offshore banking and foreign currency settlement rail operating from GIFT City IFSC (Gandhinagar), enabling zero withholding tax export billing and multi-currency Nostro accounts.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>IFSCA REGULATED OFFSHORE UNIT</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">IFSC INR Settlement Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹48,500.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Direct Nostro foreign currency settlement
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Corporate Tax Holiday (Sec 80LA)</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Tax Exemption</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">10 consecutive years zero tax</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Withholding Tax (WHT)</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">0.00% Zero WHT</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero domestic tax friction</div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">IFSC Settlement ID</th>
                <th className="p-4 font-semibold">GIFT City IFSC Unit</th>
                <th className="p-4 font-semibold">IFSCA License #</th>
                <th className="p-4 font-semibold">Foreign Currency Value</th>
                <th className="p-4 font-semibold">Withholding Tax</th>
                <th className="p-4 font-semibold">Nostro Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {s.id}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{s.ifscEntity}</div>
                    <div className="font-mono text-[#8C90A0] text-[11px]">{s.nostroBank}</div>
                  </td>
                  <td className="p-4 font-mono text-[#0055FF]">
                    {s.ifscaLicenseNo}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {s.settlementCurrency}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-semibold">
                    {s.withholdingTax}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      SETTLED IN NOSTRO
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
