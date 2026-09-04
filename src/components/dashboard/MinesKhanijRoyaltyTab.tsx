import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Pickaxe, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Percent, 
  Building2,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MinesKhanijRoyaltyTab: React.FC = () => {
  const [passes, setPasses] = useState([
    {
      id: 'khn_pass_2026_09',
      miningLessee: 'Vedanta Sesa Iron Ore Division (Odisha)',
      khanijETransitPass: 'OD-KHANIJ-ETP-8819201',
      mineralGrade: 'High-Grade Iron Ore Lump (64% Fe)',
      statutoryStateRoyalty: '₹15,00,000.00 (15% Ad-valorem)',
      dmfCess30Percent: '₹4,50,000.00 (District Mineral Foundation)',
      nmetCess2Percent: '₹30,000.00 (National Mineral Exploration Trust)',
      netTreasuryChallan: '₹19,80,000.00 (e-Treasury Challan Remitted)',
      status: 'khanij_pass_active_valid'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Pickaxe className="w-6 h-6 text-[#0055FF]" />
            <span>Ministry of Mines Khanij Online Royalty &amp; DMF Cess Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous statutory mineral royalty calculation, District Mineral Foundation (DMF 30%) and NMET (2%) statutory cess deductions, and instant e-Treasury challan generation for Khanij e-Transit passes.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MINISTRY OF MINES KHANIJ CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory Royalty Remitted</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹19,80,000.00 Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> State e-Treasury Challan Auto-Discharged
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DMF 30% Statutory Cess</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹4,50,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">District Mineral Foundation local trust fund</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Khanij e-Transit Pass Validity</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Valid</div>
          <div className="text-[11px] text-purple-700 font-mono">RFID Weighbridge GPS toll synchronized</div>
        </div>
      </div>

      {/* Passes Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Mining Lessee Entity</th>
                <th className="p-4 font-semibold">Khanij e-Transit Pass #</th>
                <th className="p-4 font-semibold">Mineral Grade</th>
                <th className="p-4 font-semibold">DMF + NMET Cess</th>
                <th className="p-4 font-semibold">Net Challan Remitted</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {passes.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {p.miningLessee}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {p.khanijETransitPass}
                  </td>
                  <td className="p-4 text-[#0A0D14] font-semibold">
                    {p.mineralGrade}
                  </td>
                  <td className="p-4 font-mono text-rose-600 font-bold">
                    {p.dmfCess30Percent}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {p.netTreasuryChallan}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      VALIDATED
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
