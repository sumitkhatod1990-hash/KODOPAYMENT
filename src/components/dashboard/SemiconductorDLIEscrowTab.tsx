import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Building2, 
  FileText,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SemiconductorDLIEscrowTab: React.FC = () => {
  const [dlis, setDlis] = useState([
    {
      id: 'ism_dli_99201',
      chipDesignProject: 'Indus-AI RISC-V Neural Accelerator SoC (12nm)',
      fablessStartup: 'SiliconBharat Microelectronics Pvt Ltd',
      meityIsmSanctionOrder: 'MEITY/ISM/DLI/2026-081',
      mpwTapeoutCost: '₹8,00,00,000.00 INR (TSMC Multi-Project Wafer)',
      dliSubsidySanctioned: '₹4,00,00,000.00 INR (50% MeitY DLI Grant Disbursed)',
      status: 'tapeout_milestone_cleared'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#0055FF]" />
            <span>India Semiconductor Mission (ISM) Design-Linked Incentive Escrow</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous milestone tracking and 50% capital subsidy claim disbursement under Ministry of Electronics and IT (MeitY) Design-Linked Incentive (DLI) scheme for fabless semiconductor chip design and MPW foundry tape-outs.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MEITY ISM DLI 50% SUBSIDY ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">MeitY DLI Subsidy Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹4.00 Cr Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 50% of Multi-Project Wafer (MPW) cost
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Semiconductor Architecture</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">RISC-V 12nm FinFET</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">DIR-V (Digital India RISC-V) aligned</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Foundry Escrow Milestone</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Tape-Out Cleared</div>
          <div className="text-[11px] text-purple-700 font-mono">GDSII silicon layout verified</div>
        </div>
      </div>

      {/* DLIs Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">SoC Design Project &amp; Startup</th>
                <th className="p-4 font-semibold">MeitY ISM Order #</th>
                <th className="p-4 font-semibold">Tape-Out Gross Cost</th>
                <th className="p-4 font-semibold">50% DLI Subsidy Disbursed</th>
                <th className="p-4 font-semibold">Milestone Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {dlis.map((d) => (
                <tr key={d.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{d.chipDesignProject}</div>
                    <div className="font-mono text-[#0055FF] text-[11px]">{d.fablessStartup}</div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0A0D14]">
                    {d.meityIsmSanctionOrder}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {d.mpwTapeoutCost}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {d.dliSubsidySanctioned}
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
