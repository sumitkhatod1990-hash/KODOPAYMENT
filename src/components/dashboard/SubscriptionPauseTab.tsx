import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PauseCircle, 
  PlayCircle, 
  CheckCircle2, 
  HeartHandshake, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SubscriptionPauseTab: React.FC = () => {
  const [pausedSubs, setPausedSubs] = useState([
    {
      id: 'sub_pause_01',
      customerName: 'Alexander Wright',
      plan: 'Pro Developer (₹49/mo)',
      pausedUntil: 'Oct 01, 2026',
      pauseDuration: '2 Billing Cycles',
      churnDeflected: true,
      status: 'temporarily_paused'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <PauseCircle className="w-6 h-6 text-[#0055FF]" />
            <span>Subscription Pause & Holiday Mode Switcher</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Deflect SaaS churn by allowing subscribers to pause billing for 1–3 billing cycles instead of canceling, preserving stored configurations and customer lifetime value.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>35.4% CHURN DEFLECTION RATE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Subscriptions Saved via Pause</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">142 Accounts</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resumed active billing post-holiday
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Preserved Annual LTV</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">+₹83,500.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Protected from permanent churn</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Auto-Resume Reliability</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Automated</div>
          <div className="text-[11px] text-purple-700 font-mono">Automated card recharge on resume</div>
        </div>
      </div>

      {/* Paused Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Customer Account</th>
                <th className="p-4 font-semibold">Subscription Plan</th>
                <th className="p-4 font-semibold">Pause Duration</th>
                <th className="p-4 font-semibold">Scheduled Resume Date</th>
                <th className="p-4 font-semibold">Deflection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {pausedSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {sub.customerName}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {sub.plan}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {sub.pauseDuration}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {sub.pausedUntil}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                      <Clock className="w-3 h-3" />
                      TEMPORARILY PAUSED
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
