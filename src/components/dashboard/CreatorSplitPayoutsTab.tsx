import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Split, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  Smartphone,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreatorSplitPayoutsTab: React.FC = () => {
  const [splits, setSplits] = useState([
    {
      id: 'spl_cr_9901',
      creatorName: 'Tanmay Bhatt Tech Reviews',
      vpa: 'tanmay@paytm',
      grossCourseRevenue: '₹1,50,000.00 INR',
      platformFeeSplit: '20% (₹30,000.00)',
      creatorTakeHome: '80% (₹1,20,000.00)',
      tdsDeducted194O: '₹1,200.00 (1%)',
      payoutChannel: 'Instant 24x7 IMPS (T+0)',
      status: 'instant_disbursed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Split className="w-6 h-6 text-[#0055FF]" />
            <span>Creator &amp; Gig Economy Instant Daily UPI Split-Payouts</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automate multi-party revenue splitting for course creators, marketplace sellers, and affiliates with instant 24x7 IMPS/UPI bank payouts and automated Section 194-O TDS deduction.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>24x7 T+0 INSTANT SPLIT PAYOUTS</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Creator Payouts Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹1,18,800.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Net disbursed post-TDS
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Platform Revenue Retained</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹30,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">20% commission split</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Payout Channel</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Direct UPI / IMPS</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time instant bank credit</div>
        </div>
      </div>

      {/* Splits Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Creator / Partner</th>
                <th className="p-4 font-semibold">UPI VPA / Bank ID</th>
                <th className="p-4 font-semibold">Gross Revenue</th>
                <th className="p-4 font-semibold">Platform Cut</th>
                <th className="p-4 font-semibold">TDS (1%)</th>
                <th className="p-4 font-semibold">Net Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {splits.map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {s.creatorName}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {s.vpa}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {s.grossCourseRevenue}
                  </td>
                  <td className="p-4 font-mono text-emerald-700">
                    {s.platformFeeSplit}
                  </td>
                  <td className="p-4 font-mono text-rose-700">
                    -{s.tdsDeducted194O}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DISBURSED (T+0 IMPS)
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
