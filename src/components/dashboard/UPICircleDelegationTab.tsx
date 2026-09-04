import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Shield, 
  Coins,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UPICircleDelegationTab: React.FC = () => {
  const [delegations, setDelegations] = useState([
    {
      id: 'upic_del_99018',
      primaryUser: 'Arjun Mehta (VP Engineering)',
      secondaryDelegate: 'Sneha Rao (DevOps Lead)',
      monthlySpendCap: '₹25,000.00 / month',
      currentMonthUtilized: '₹8,420.00 INR (AWS & Cloudflare sub-bills)',
      approvalMode: 'Zero-PIN Full Delegation (Auto-approved)',
      status: 'upi_circle_active'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Users2 className="w-6 h-6 text-[#0055FF]" />
            <span>NPCI UPI Circle &amp; Delegated Secondary Payer Mandates</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct NPCI UPI Circle integration allowing primary accounts to delegate monthly spend allowances and sub-wallet controls to corporate teams and family members with zero-PIN frictionless checkouts.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NPCI UPI CIRCLE PROTOCOL LIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Delegated Monthly Spend Cap</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹25,000.00 / mo</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Hard ceiling enforcement by NPCI
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Checkout Authorization Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 0.20 Seconds</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero-PIN auto-debit on secondary device</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Corporate Spend Governance</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Policy Bound</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time alerts sent to primary account</div>
        </div>
      </div>

      {/* Delegations Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Primary Account Holder</th>
                <th className="p-4 font-semibold">Secondary Delegated User</th>
                <th className="p-4 font-semibold">Monthly Allowance</th>
                <th className="p-4 font-semibold">Current Month MTD Spend</th>
                <th className="p-4 font-semibold">Authorization Mode</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {delegations.map((d) => (
                <tr key={d.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {d.primaryUser}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {d.secondaryDelegate}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {d.monthlySpendCap}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {d.currentMonthUtilized}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {d.approvalMode}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      CIRCLE ACTIVE
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
