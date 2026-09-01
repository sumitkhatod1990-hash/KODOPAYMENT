sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Mail, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomerSignalsTab: React.FC = () => {
  const [signals, setSignals] = useState([
    {
      id: 'sig_01',
      customerEmail: 'tech@synthetix.com',
      signalType: 'expansion_upsell',
      metric: '92% Token Quota Used (Approaching 500M Limit)',
      healthScore: '98 / 100',
      recommendedAction: 'Dispatch Enterprise Dedicated Cluster Upgrade Offer',
      status: 'action_required'
    },
    {
      id: 'sig_02',
      customerEmail: 'marcus@hypercompute.de',
      signalType: 'churn_risk',
      metric: 'Usage dropped -44% week-over-week',
      healthScore: '42 / 100',
      recommendedAction: 'Trigger Automated Retention Check-in & Engineer Assist Call',
      status: 'action_required'
    }
  ]);

  const handleResolveSignal = (id: string) => {
    setSignals(signals.map(s => s.id === id ? { ...s, status: 'resolved' } : s));
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#0055FF]" />
            <span>Enterprise Customer Churn & Expansion Signals</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            AI telemetry detecting high-risk churn signals (&gt;30% usage drops) and high-velocity expansion upsell triggers (&gt;85% tier capacity).
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>REAL-TIME TELEMETRY ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Expansion Pipeline Identified</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">+₹24,800.00 / mo</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Ready for enterprise tier upgrade
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">At-Risk Churn Volume</div>
          <div className="text-2xl font-bold font-mono text-amber-600">₹1,450.00 / mo</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1 account flagged for intervention</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Signal Accuracy Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">94.6%</div>
          <div className="text-[11px] text-purple-700 font-mono">Telemetry-based ML predictions</div>
        </div>
      </div>

      {/* Signals Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Subscriber Account</th>
                <th className="p-4 font-semibold">Signal Classification</th>
                <th className="p-4 font-semibold">Telemetry Trigger Metric</th>
                <th className="p-4 font-semibold">Health Score</th>
                <th className="p-4 font-semibold">AI Recommended Action</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {signals.map((sig) => (
                <tr key={sig.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {sig.customerEmail}
                  </td>
                  <td className="p-4">
                    {sig.signalType === 'expansion_upsell' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        <TrendingUp className="w-3 h-3" />
                        EXPANSION UPSELL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        CHURN RISK
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-[#0A0D14]">
                    {sig.metric}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {sig.healthScore}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {sig.recommendedAction}
                  </td>
                  <td className="p-4">
                    {sig.status === 'resolved' ? (
                      <span className="text-emerald-700 font-mono font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Action Dispatched
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveSignal(sig.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#0055FF] hover:bg-[#0044CC] text-white font-semibold text-[11px] shadow-xs flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Dispatch Action</span>
                      </button>
                    )}
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
