import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GitFork, 
  Users, 
  CheckCircle2, 
  Plus, 
  Landmark, 
  PieChart, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WaterfallTab: React.FC = () => {
  const [splits, setSplits] = useState([
    {
      id: 'wf_split_01',
      beneficiary: 'Founder 1 (Delaware LLC)',
      share: 45.0,
      bankAccount: 'Chase Private Client (...9921)',
      totalDistributed: '$48,200.00 USD',
      status: 'active'
    },
    {
      id: 'wf_split_02',
      beneficiary: 'Founder 2 (Tech Lead)',
      share: 35.0,
      bankAccount: 'Silicon Valley Bank (...4012)',
      totalDistributed: '$37,480.00 USD',
      status: 'active'
    },
    {
      id: 'wf_split_03',
      beneficiary: 'Seed Investor Pool / LP Syndicate',
      share: 20.0,
      bankAccount: 'First Republic Trust (...1190)',
      totalDistributed: '$21,420.00 USD',
      status: 'active'
    }
  ]);

  const [simulatedRevenue, setSimulatedRevenue] = useState(10000);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <GitFork className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Co-Founder & Investor Equity Waterfall Splitter</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatically split and route every incoming transaction net payout directly to co-founders, advisors, and LP investors based on equity ownership percentages.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>100% AUTOMATED WATERFALL</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Distributed to Beneficiaries</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">$107,100.00 USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> T+0 Instant Split Settlement
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Equity Allocated</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{splits.reduce((acc, s) => acc + s.share, 0).toFixed(1)}%</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% cap table reconciled</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Beneficiary Accounts</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{splits.length} Recipients</div>
          <div className="text-[11px] text-purple-700 font-mono">Automated 1099-MISC tax reporting</div>
        </div>
      </div>

      {/* Simulator Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#0055FF]" />
            <span>Real-Time Payout Waterfall Calculator</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#0055FF]">
            Simulated Net Inflow: ${simulatedRevenue.toLocaleString()} USD
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          {splits.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5 space-y-1">
              <span className="text-[#8C90A0] font-semibold">{s.beneficiary} ({s.share}%):</span>
              <div className="font-bold text-emerald-700 text-base">
                ${((simulatedRevenue * s.share) / 100).toFixed(2)} USD
              </div>
              <div className="text-[10px] text-[#8C90A0]">{s.bankAccount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Splits Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Beneficiary / Stakeholder</th>
                <th className="p-4 font-semibold">Waterfall Revenue Share</th>
                <th className="p-4 font-semibold">Designated Payout Rail</th>
                <th className="p-4 font-semibold">Lifetime Distributed</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {splits.map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {s.beneficiary}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF] text-sm">
                    {s.share.toFixed(1)}%
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {s.bankAccount}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {s.totalDistributed}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      AUTO-ROUTING
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
