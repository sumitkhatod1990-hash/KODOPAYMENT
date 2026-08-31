import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Shield, 
  Coins, 
  Building2,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IDEXDefenseEscrowTab: React.FC = () => {
  const [grants, setGrants] = useState([
    {
      id: 'idex_grt_88192',
      defenseProject: 'AI-Powered Autonomous Counter-UAS Radar',
      defenseVendor: 'Garuda Shield Defence Systems Ltd',
      modIdexGrantNo: 'MOD/IDEX/DISC-9/2026-881',
      milestoneGrantAmount: '₹1,50,00,000.00 INR (Phase-2 Field Trials)',
      dgqaInspectionSignOff: 'DGQA Certified & Cleared for Indian Army Deployment',
      status: 'mod_escrow_disbursed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0055FF]" />
            <span>Ministry of Defence (MoD) iDEX &amp; Make-In-India Escrow</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous milestone-based defense procurement and innovations grant disbursement under Ministry of Defence iDEX with statutory DGQA (Directorate General of Quality Assurance) inspection sign-off release.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MOD IDEX &amp; DGQA CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">MoD Milestone Grant Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹1,50,00,000.00 Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Disbursed to defense tech vendor
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DGQA Quality Clearance</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Cleared</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Field trial telemetry verified</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Make-In-India Defense Offset</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Indigenized</div>
          <div className="text-[11px] text-purple-700 font-mono">DAP 2020 Buy (Indian-IDDM) compliant</div>
        </div>
      </div>

      {/* Grants Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Defense Tech Project &amp; Vendor</th>
                <th className="p-4 font-semibold">MoD iDEX Grant Ref</th>
                <th className="p-4 font-semibold">Milestone Amount</th>
                <th className="p-4 font-semibold">DGQA Quality Sign-Off</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {grants.map((g) => (
                <tr key={g.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{g.defenseProject}</div>
                    <div className="font-mono text-[#0055FF] text-[11px]">{g.defenseVendor}</div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0A0D14]">
                    {g.modIdexGrantNo}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {g.milestoneGrantAmount}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {g.dgqaInspectionSignOff}
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
