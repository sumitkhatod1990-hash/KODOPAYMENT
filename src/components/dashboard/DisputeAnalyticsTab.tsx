sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertOctagon, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles, 
  BrainCircuit, 
  ArrowRight,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DisputeAnalyticsTab: React.FC = () => {
  const [skus, setSkus] = useState([
    { sku: 'Enterprise Dedicated GPU', disputeRate: '0.00%', risk: 'low' },
    { sku: 'Pro Developer Annual Plan', disputeRate: '0.01%', risk: 'low' },
    { sku: 'Trial Subscription Drop-Off', disputeRate: '0.08%', risk: 'mitigated' }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-[#0055FF]" />
            <span>AI Chargeback Root-Cause Analyzer & Loss Prevention</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Deep ML clustering analyzing dispute patterns across card BINs, trial drop-offs, and billing descriptors to eliminate dispute losses before they occur.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>0.00% NET DISPUTE LOSS RATE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Prevented Merchant Loss</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹24,900.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Shielded by AI Pre-Arbitration
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Primary Root Cause Identified</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">Billing Descriptor</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Resolved via dynamic statement descriptor</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Visa / MC Early Warning Alerts</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Active (Ethoca / RDR)</div>
          <div className="text-[11px] text-purple-700 font-mono">Automatic pre-chargeback refunds</div>
        </div>
      </div>

      {/* SKU Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Product SKU / Tier</th>
                <th className="p-4 font-semibold">Historical Dispute Rate</th>
                <th className="p-4 font-semibold">AI Risk Classification</th>
                <th className="p-4 font-semibold">Proactive Protection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {skus.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {item.sku}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {item.disputeRate}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    ✓ 100% Insulated under QIVROPAY MoR
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
