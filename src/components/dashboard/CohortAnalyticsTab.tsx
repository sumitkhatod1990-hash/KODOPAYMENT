sed: --: No such file or directory
import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const CohortAnalyticsTab: React.FC = () => {
  const cohorts = [
    { cohort: 'Jan 2026', size: 140, m0: 100, m1: 92, m2: 88, m3: 85, m4: 83, m5: 81, m6: 80, nrr: '118%' },
    { cohort: 'Feb 2026', size: 185, m0: 100, m1: 94, m2: 90, m3: 88, m4: 86, m5: 84, m6: null, nrr: '122%' },
    { cohort: 'Mar 2026', size: 220, m0: 100, m1: 95, m2: 91, m3: 89, m4: 87, m5: null, m6: null, nrr: '125%' },
    { cohort: 'Apr 2026', size: 310, m0: 100, m1: 96, m2: 93, m3: 91, m4: null, m5: null, m6: null, nrr: '129%' },
    { cohort: 'May 2026', size: 420, m0: 100, m1: 97, m2: 94, m3: null, m4: null, m5: null, m6: null, nrr: '134%' },
    { cohort: 'Jun 2026', size: 540, m0: 100, m1: 98, m2: null, m3: null, m4: null, m5: null, m6: null, nrr: '138%' }
  ];

  const getCellColor = (val: number | null) => {
    if (val === null) return 'bg-transparent text-transparent';
    if (val >= 95) return 'bg-blue-600 text-white font-bold';
    if (val >= 90) return 'bg-blue-500 text-white font-bold';
    if (val >= 85) return 'bg-blue-400 text-white font-medium';
    if (val >= 80) return 'bg-blue-300 text-slate-900 font-medium';
    return 'bg-blue-200 text-slate-900';
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#0055FF]" />
            <span>Subscriber Cohort Retention & LTV Expansion Matrix</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Track subscriber retention behavior over 6–12 months, Net Revenue Retention (NRR) expansion, and organic churn velocity.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>128% AVERAGE NRR</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Net Revenue Retention (NRR)</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">128.4%</div>
          <div className="text-[11px] text-emerald-600 font-mono">Net expansion across existing tiers</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Month 1 Retention Benchmark</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">96.2%</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Top-decile SaaS benchmark</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customer Lifetime Value (LTV)</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹842.00 INR</div>
          <div className="text-[11px] text-purple-700 font-mono">+34% vs last quarter</div>
        </div>
      </div>

      {/* Cohort Matrix Table */}
      <div className="opp-card overflow-hidden">
        <div className="p-4 border-b border-black/5 flex justify-between items-center bg-[#FAFBFD]">
          <span className="font-bold text-xs text-[#0A0D14]">Monthly Subscriber Retention Cohorts</span>
          <span className="text-[10px] font-mono text-[#8C90A0]">Values indicate % of initial active subscribers</span>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-3 text-left">Cohort</th>
                <th className="p-3">Subscribers</th>
                <th className="p-3">M0</th>
                <th className="p-3">M1</th>
                <th className="p-3">M2</th>
                <th className="p-3">M3</th>
                <th className="p-3">M4</th>
                <th className="p-3">M5</th>
                <th className="p-3">M6</th>
                <th className="p-3 font-bold text-[#0055FF]">NRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {cohorts.map((c, idx) => (
                <tr key={idx} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-3 text-left font-bold text-[#0A0D14] font-sans">
                    {c.cohort}
                  </td>
                  <td className="p-3 font-mono font-semibold text-[#8C90A0]">
                    {c.size}
                  </td>
                  <td className="p-2"><span className={`inline-block w-12 py-1.5 rounded-lg text-[11px] ${getCellColor(c.m0)}`}>{c.m0}%</span></td>
                  <td className="p-2"><span className={`inline-block w-12 py-1.5 rounded-lg text-[11px] ${getCellColor(c.m1)}`}>{c.m1 !== null ? `${c.m1}%` : '-'}</span></td>
                  <td className="p-2"><span className={`inline-block w-12 py-1.5 rounded-lg text-[11px] ${getCellColor(c.m2)}`}>{c.m2 !== null ? `${c.m2}%` : '-'}</span></td>
                  <td className="p-2"><span className={`inline-block w-12 py-1.5 rounded-lg text-[11px] ${getCellColor(c.m3)}`}>{c.m3 !== null ? `${c.m3}%` : '-'}</span></td>
                  <td className="p-2"><span className={`inline-block w-12 py-1.5 rounded-lg text-[11px] ${getCellColor(c.m4)}`}>{c.m4 !== null ? `${c.m4}%` : '-'}</span></td>
                  <td className="p-2"><span className={`inline-block w-12 py-1.5 rounded-lg text-[11px] ${getCellColor(c.m5)}`}>{c.m5 !== null ? `${c.m5}%` : '-'}</span></td>
                  <td className="p-2"><span className={`inline-block w-12 py-1.5 rounded-lg text-[11px] ${getCellColor(c.m6)}`}>{c.m6 !== null ? `${c.m6}%` : '-'}</span></td>
                  <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                    {c.nrr}
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
