import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Users,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WinBackDownsellTab: React.FC = () => {
  const [offers, setOffers] = useState([
    {
      id: 'wb_off_101',
      customerName: 'Marcus Sterling',
      originalPlan: 'Enterprise Scale (₹299/mo)',
      downsellOffer: 'Pro Growth (₹99/mo for 6 months)',
      retainedMrr: '₹99.00 / mo',
      acceptedAt: 'Aug 29, 2026',
      status: 'successfully_retained'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#0055FF]" />
            <span>AI Churn Win-Back &amp; Downsell Offer Orchestrator</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous exit-intent cancellation flow interceptor that analyzes subscriber usage and offers personalized discounts and plan downgrades to save subscriber LTV.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>42.8% EXIT INTENT RESCUE RATE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Rescued Subscribers</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">189 Customers</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Converted cancellation into downsell
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Retained MRR Run-Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">+₹18,711.00 / mo</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Preserved recurring revenue</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customer Win-Back Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Real-Time &lt; 1s</div>
          <div className="text-[11px] text-purple-700 font-mono">In-portal 1-click discount accept</div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Customer Name</th>
                <th className="p-4 font-semibold">Original Plan (Churn Intent)</th>
                <th className="p-4 font-semibold">AI Tailored Downsell Offer</th>
                <th className="p-4 font-semibold">Retained MRR</th>
                <th className="p-4 font-semibold">Accepted Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {o.customerName}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] line-through">
                    {o.originalPlan}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {o.downsellOffer}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {o.retainedMrr}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {o.acceptedAt}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      RESCUED &amp; ACTIVE
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
