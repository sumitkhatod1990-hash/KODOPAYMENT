sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SLACreditsTab: React.FC = () => {
  const [credits, setCredits] = useState([
    {
      id: 'sla_cred_901',
      enterpriseClient: 'Deloitte Cloud Advisory',
      guaranteedUptime: '99.99%',
      actualMonthlyUptime: '99.94% (26 min incident)',
      creditPercentage: '10.00% Invoice Credit',
      creditAmount: '₹4,500.00 INR',
      appliedToInvoice: 'inv_deloitte_aug_2026',
      status: 'auto_credited'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Enterprise SLA Uptime Credits &amp; Downtime Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Connects directly to infrastructure status monitoring webhooks (Datadog, Pingdom, BetterStack) to automatically calculate and apply contract SLA credits to enterprise invoices without manual customer dispute tickets.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>REAL-TIME SLA RADAR ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Automated SLA Credits Applied</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹4,500.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-deducted from renewal invoice
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Enterprise Trust Score</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">99.8 / 100</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero manual billing support tickets</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">SLA Availability Guarantee</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">99.99% Uptime</div>
          <div className="text-[11px] text-purple-700 font-mono">Contractually enforceable</div>
        </div>
      </div>

      {/* Credits Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Credit ID</th>
                <th className="p-4 font-semibold">Enterprise Account</th>
                <th className="p-4 font-semibold">SLA Guarantee vs Actual</th>
                <th className="p-4 font-semibold">Contract Penalty Formula</th>
                <th className="p-4 font-semibold">Credit Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {credits.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {c.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.enterpriseClient}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {c.guaranteedUptime} vs <span className="text-amber-600 font-bold">{c.actualMonthlyUptime}</span>
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {c.creditPercentage}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {c.creditAmount}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      AUTO CREDITED
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
