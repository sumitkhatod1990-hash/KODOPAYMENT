import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  RefreshCw, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Send,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DunningRadarTab: React.FC = () => {
  const [retriesList, setRetriesList] = useState([
    {
      id: 'dun_01',
      customerEmail: 'tech.lead@datanode.cloud',
      planName: 'Pro Intelligence SaaS (₹99/mo)',
      failReason: 'insufficient_funds',
      retryCount: 2,
      nextSmartRetry: 'Tomorrow 9:15 AM (ML Payday Window)',
      recoveryProbability: '88%',
      status: 'retrying'
    },
    {
      id: 'dun_02',
      customerEmail: 'finance@vectorflow.ai',
      planName: 'Pro Intelligence SaaS (₹99/mo)',
      failReason: 'card_expired',
      retryCount: 1,
      nextSmartRetry: 'Portal Update Link Sent',
      recoveryProbability: '94%',
      status: 'portal_link_sent'
    },
    {
      id: 'dun_03',
      customerEmail: 'devin@agenticmesh.io',
      planName: 'Pro Intelligence SaaS (₹99/mo)',
      failReason: 'generic_decline',
      retryCount: 1,
      nextSmartRetry: 'Today 3:30 PM (Optimal Card Window)',
      recoveryProbability: '76%',
      status: 'retrying'
    }
  ]);

  const [churnRiskAccounts, setChurnRiskAccounts] = useState([
    {
      id: 'churn_01',
      customerEmail: 'samuel@quantumcraft.io',
      mrr: 99.00,
      usageDrop: '-64% Token Consumption',
      riskLevel: 'HIGH',
      suggestion: 'Auto-dispatch 30% retention credit via billing portal'
    },
    {
      id: 'churn_02',
      customerEmail: 'clara@neuraldesign.studio',
      mrr: 99.00,
      usageDrop: '-48% Inference Calls',
      riskLevel: 'MEDIUM',
      suggestion: 'Trigger feature walkthrough & check-in email'
    }
  ]);

  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleInstantRetry = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      setRetriesList(prev => prev.map(item => item.id === id ? { ...item, status: 'recovered', recoveryProbability: '100% (Settled)' } : item));
      setRetryingId(null);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }, 700);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            AI Smart Dunning & Churn Prediction Radar
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Machine learning retry algorithms schedule card attempts at optimal banking windows, while telemetry radars predict subscriber churn before cancellation.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-blue-700 font-bold bg-blue-50 border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ML SMART RETRY ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Smart Dunning Recovery Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">41.8%</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% vs blind 24h retry
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Recovered MRR This Month</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹3,420.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Saved from involuntary churn</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Accounts at Churn Risk</div>
          <div className="text-2xl font-bold font-mono text-amber-600">{churnRiskAccounts.length}</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Proactive retention alerts</div>
        </div>
      </div>

      {/* Section 1: Smart Card Retries */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14] font-heading flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0055FF]" />
          <span>Smart Banking Retry Pipeline</span>
        </h3>

        <div className="opp-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                  <th className="p-4 font-semibold">Subscriber</th>
                  <th className="p-4 font-semibold">Plan Amount</th>
                  <th className="p-4 font-semibold">Decline Reason</th>
                  <th className="p-4 font-semibold">Smart Scheduled Window</th>
                  <th className="p-4 font-semibold">ML Success Odds</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {retriesList.map((dun) => (
                  <tr key={dun.id} className="hover:bg-[#F4F5F8] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#0A0D14]">
                      {dun.customerEmail}
                    </td>
                    <td className="p-4 text-[#0A0D14] font-medium">
                      {dun.planName}
                    </td>
                    <td className="p-4 font-mono text-[#8C90A0] uppercase text-[11px]">
                      {dun.failReason.replace('_', ' ')}
                    </td>
                    <td className="p-4 font-mono text-purple-700 font-semibold">
                      {dun.nextSmartRetry}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-700">
                      {dun.recoveryProbability}
                    </td>
                    <td className="p-4">
                      {dun.status === 'recovered' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          RECOVERED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold text-[10px] border border-blue-200">
                          SCHEDULED
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {dun.status !== 'recovered' && (
                        <button
                          onClick={() => handleInstantRetry(dun.id)}
                          disabled={retryingId === dun.id}
                          className="opp-btn-secondary px-3 py-1 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${retryingId === dun.id ? 'animate-spin' : ''}`} />
                          <span>{retryingId === dun.id ? 'Retrying...' : 'Instant Retry'}</span>
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

      {/* Section 2: Proactive Churn Risk Radar */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14] font-heading flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Proactive Churn Risk Radar (Usage Telemetry)</span>
        </h3>

        <div className="opp-card p-6 space-y-4">
          {churnRiskAccounts.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl bg-[#FAFBFD] border border-black/5 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-[#0A0D14]">{c.customerEmail}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                    {c.riskLevel} RISK
                  </span>
                </div>
                <div className="text-[11px] text-rose-600 font-mono font-semibold">
                  {c.usageDrop} in past 14 days
                </div>
                <div className="text-xs text-[#6E717D]">
                  💡 Recommended: {c.suggestion}
                </div>
              </div>

              <button
                onClick={() => alert(`Automated 30% retention offer sent to ${c.customerEmail}`)}
                className="opp-btn-secondary px-4 py-2 text-xs font-semibold text-purple-700 hover:text-purple-900"
              >
                Dispatch Retention Offer
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
