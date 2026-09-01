sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scan, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RevenueLeakageTab: React.FC = () => {
  const [leakages, setLeakages] = useState([
    {
      id: 'leak_01',
      source: 'Orphaned Webhook Failures on Plan Upgrades',
      estimatedLostMrr: '₹2,450.00 / mo',
      affectedAccounts: 12,
      patchStatus: 'auto_recovered',
      lastAudited: 'Today'
    }
  ]);

  const [scanning, setScanning] = useState(false);

  const handleTriggerAudit = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Scan className="w-6 h-6 text-[#0055FF]" />
            <span>Autonomous AI Revenue Leakage & Ghost Subscription Auditor</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous background AI auditor scanning active merchant subscriptions to detect dropped webhooks, uncollected tax drift, and orphaned gateway tokens.
          </p>
        </div>

        <button
          onClick={handleTriggerAudit}
          disabled={scanning}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Auditing MRR Pipeline...' : 'Run Full Revenue Audit'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Recaptured Leaked MRR</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">+₹2,450.00 / mo</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Repaired & Synchronized
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Pipeline Health Integrity</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">99.98% Clean</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero ghost customer drift</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Continuous Scanning Cycle</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Real-Time</div>
          <div className="text-[11px] text-purple-700 font-mono">Every 60 minutes automated audit</div>
        </div>
      </div>

      {/* Leakage Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Audit Leakage Issue</th>
                <th className="p-4 font-semibold">Estimated Leaked MRR</th>
                <th className="p-4 font-semibold">Affected Subscribers</th>
                <th className="p-4 font-semibold">AI Automated Resolution</th>
                <th className="p-4 font-semibold">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {leakages.map((lk) => (
                <tr key={lk.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {lk.source}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {lk.estimatedLostMrr}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {lk.affectedAccounts} accounts
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    ✓ Auto-Resynced Token & Replayed Webhooks
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      AUTO RECOVERED
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
