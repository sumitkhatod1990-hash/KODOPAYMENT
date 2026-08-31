import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Building2, 
  Signal,
  TowerControl
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DigitalBharatNidhiEscrowTab: React.FC = () => {
  const [escrows, setEscrows] = useState([
    {
      id: 'dbn_usof_99018',
      telecomInfraProvider: 'Indus Towers Ltd (North-East Circle-2)',
      dotSchemeName: 'Digital Bharat Nidhi 4G/5G Saturation in Unconnected Villages',
      milestoneTowersErected: '140 Solar-Powered 5G Small Cell Sites',
      dotCapitalSubsidyDisbursed: '₹28,00,00,000.00 INR (DoT Approved)',
      status: 'usof_grant_disbursed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#0055FF]" />
            <span>DoT Digital Bharat Nidhi (USOF) Rural 5G Infrastructure Escrow</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous milestone tracking and capital subsidy disbursement under Department of Telecommunications (DoT) Digital Bharat Nidhi (Universal Service Obligation Fund) for rural optical fiber and 5G cellular infrastructure.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DOT USOF CAPITAL SUBSIDY ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DoT USOF Capital Subsidy Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹28.00 Cr Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Released upon verified GIS field inspection
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Rural Sites Energized</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">140 Solar 5G Towers</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% Unconnected tribal villages</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Telecommunications Act Standing</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Compliant</div>
          <div className="text-[11px] text-purple-700 font-mono">Digital Bharat Nidhi Section 24 aligned</div>
        </div>
      </div>

      {/* Escrows Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Telecom Infrastructure Provider</th>
                <th className="p-4 font-semibold">DoT Scheme Mandate</th>
                <th className="p-4 font-semibold">Milestone Telemetry</th>
                <th className="p-4 font-semibold">Capital Subsidy Disbursed</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {escrows.map((e) => (
                <tr key={e.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {e.telecomInfraProvider}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {e.dotSchemeName}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    {e.milestoneTowersErected}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {e.dotCapitalSubsidyDisbursed}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DISBURSED
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
