import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sliders, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  Sparkles, 
  DollarSign, 
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SpendLimitsTab: React.FC = () => {
  const [limits, setLimits] = useState([
    {
      id: 'sp_lim_01',
      customerName: 'Synthetix AI Corp',
      monthlyBudget: 5000.00,
      currentSpend: 3420.00,
      softCapPercentage: '80%',
      actionOnCap: 'Email Alert & Slack Webhook Trigger',
      status: 'active'
    }
  ]);

  const [budget, setBudget] = useState(5000);
  const [softCap, setSoftCap] = useState(80);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#0055FF]" />
            <span>Customer Tier Usage Budget & Spend Soft-Cap Controls</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Empower enterprise clients with self-serve monthly spending limits, automated soft-cap webhook alerts, and hard-limit API throttles to prevent bill shocks.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ZERO BILL SHOCK GUARANTEE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Budget Controls</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Configured</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Soft-Cap Warnings Enabled
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customer Dispute Deflection</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">-92% Overage Inquiries</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Proactive usage threshold alerts</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Webhook Trigger Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 50ms</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time Slack / Discord dispatch</div>
        </div>
      </div>

      {/* Configurator Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0055FF]" />
            <span>Interactive Spend Soft-Cap Threshold Simulator</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#0055FF]">
            Budget: ${budget.toLocaleString()} USD
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8C90A0]">Monthly Spending Ceiling:</span>
              <span className="font-bold text-[#0A0D14]">${budget.toLocaleString()} USD</span>
            </div>
            <input
              type="range"
              min={1000}
              max={25000}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#0055FF]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8C90A0]">Soft-Cap Warning Trigger Percentage:</span>
              <span className="font-bold text-amber-600">{softCap}% (${(budget * (softCap / 100)).toFixed(0)} USD)</span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              value={softCap}
              onChange={(e) => setSoftCap(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
