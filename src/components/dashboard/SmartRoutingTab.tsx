sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Network, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SmartRoutingTab: React.FC = () => {
  const [acquirers, setAcquirers] = useState([
    {
      id: 'acq_01',
      name: 'JPMorgan Chase Direct',
      region: 'North America (INR)',
      authRate: '97.4%',
      priority: 1,
      latency: '42ms',
      status: 'healthy'
    },
    {
      id: 'acq_02',
      name: 'Adyen Global Rail',
      region: 'Europe & UK (INR/INR)',
      authRate: '96.8%',
      priority: 2,
      latency: '55ms',
      status: 'healthy'
    },
    {
      id: 'acq_03',
      name: 'Barclays Merchant Rail',
      region: 'UK & Commonwealth (INR)',
      authRate: '95.9%',
      priority: 3,
      latency: '61ms',
      status: 'healthy'
    },
    {
      id: 'acq_04',
      name: 'Checkout.com Multi-Currency',
      region: 'APAC & MENA (INR/AED/INR)',
      authRate: '96.2%',
      priority: 4,
      latency: '68ms',
      status: 'healthy'
    }
  ]);

  const [simulating, setSimulating] = useState(false);
  const [lastCascade, setLastCascade] = useState<string | null>(null);

  const triggerTestCascade = () => {
    setSimulating(true);
    setLastCascade(null);

    setTimeout(() => {
      setSimulating(false);
      setLastCascade('⚡ Transaction Soft-Declined on Primary Acquirer (Do Not Honor) ➔ Instantly Cascaded to Adyen Global Rail in 48ms ➔ APPROVED & AUTHORIZED');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Network className="w-6 h-6 text-[#0055FF]" />
            <span>AI Multi-Acquirer Smart Routing & Cascading</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Dynamically cascades declined card transactions across tier-1 acquiring banks (Chase, Adyen, Barclays) in sub-50ms to boost card authorization rates to 96.8%.
          </p>
        </div>

        <button
          onClick={triggerTestCascade}
          disabled={simulating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          <span>{simulating ? 'Simulating Failover...' : 'Test Acquirer Failover Cascade'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Blended Authorization Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">96.8% Approved</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> +12.4% vs Single-Acquirer Gateways
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cascade Recovery Velocity</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹64,900.00 / mo</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Rescued from false declines</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Failover Evaluation Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 48ms</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero customer perceptible lag</div>
        </div>
      </div>

      {/* Live Simulation Alert */}
      {lastCascade && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{lastCascade}</span>
        </div>
      )}

      {/* Acquirers Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Priority Routing Order</th>
                <th className="p-4 font-semibold">Acquiring Banking Partner</th>
                <th className="p-4 font-semibold">Optimization Corridor</th>
                <th className="p-4 font-semibold">Authorization Rate</th>
                <th className="p-4 font-semibold">Avg Rail Latency</th>
                <th className="p-4 font-semibold">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {acquirers.map((acq) => (
                <tr key={acq.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-center w-24">
                    <span className="w-6 h-6 rounded-full bg-[#0055FF]/10 text-[#0055FF] inline-flex items-center justify-center font-bold">
                      {acq.priority}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14] font-sans">
                    {acq.name}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {acq.region}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {acq.authRate}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {acq.latency}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <Activity className="w-3 h-3 text-emerald-600" />
                      ONLINE (ACTIVE)
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
