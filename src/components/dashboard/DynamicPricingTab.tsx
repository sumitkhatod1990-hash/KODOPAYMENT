import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Zap, 
  ArrowUpRight, 
  Sliders, 
  BarChart3,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DynamicPricingTab: React.FC = () => {
  const [pricingRules, setPricingRules] = useState([
    {
      id: 'pr_01',
      productName: 'AI Token Starter Pack',
      basePrice: 29.00,
      elasticPrice: 34.00,
      trigger: 'High Demand Peak Hours (2 PM - 6 PM UTC)',
      projectedRevenueLift: '+17.4%',
      status: 'active'
    },
    {
      id: 'pr_02',
      productName: 'Pro Intelligence SaaS',
      basePrice: 99.00,
      elasticPrice: 89.00,
      trigger: 'High Churn Risk Region Exit Intent',
      projectedRevenueLift: '+22.8% Retention Lift',
      status: 'active'
    },
    {
      id: 'pr_03',
      productName: 'Self-Hosted Agent Runtime',
      basePrice: 499.00,
      elasticPrice: 549.00,
      trigger: 'Enterprise IP Range & High Purchasing Power (Tier 1)',
      projectedRevenueLift: '+10.0% Margin Expansion',
      status: 'active'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState('AI Token Starter Pack');
  const [basePrice, setBasePrice] = useState(29);
  const [elasticPrice, setElasticPrice] = useState(34);
  const [trigger, setTrigger] = useState('High Demand Surge');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule = {
      id: `pr_${Date.now().toString().slice(-4)}`,
      productName,
      basePrice: Number(basePrice),
      elasticPrice: Number(elasticPrice),
      trigger,
      projectedRevenueLift: `+₹{Math.abs(elasticPrice - basePrice) * 3}% Yield Lift`,
      status: 'active'
    };
    setPricingRules([newRule, ...pricingRules]);
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#0055FF]" />
            <span>AI Smart Dynamic Pricing & Elasticity Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Algorithmic pricing optimization adjusts price points based on demand velocity, regional willingness-to-pay, and conversion likelihood.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Elasticity Rule</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Yield Lift</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">+18.6%</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Tested across 4,200 sessions
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Incremental Revenue Generated</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">+₹2,840.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Pure margin expansion</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Elasticity Rules</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{pricingRules.length}</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time algorithmic dispatch</div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Product Name</th>
                <th className="p-4 font-semibold">Base Price</th>
                <th className="p-4 font-semibold">Dynamic Optimized Price</th>
                <th className="p-4 font-semibold">Surge / Elastic Trigger</th>
                <th className="p-4 font-semibold">Projected Net Yield Lift</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {pricingRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {rule.productName}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0]">
                    ${rule.basePrice.toFixed(2)} INR
                  </td>
                  <td className="p-4 font-mono font-bold text-base text-[#0055FF]">
                    ${rule.elasticPrice.toFixed(2)} INR
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {rule.trigger}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {rule.projectedRevenueLift}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">New Dynamic Elasticity Rule</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Product Name</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Base (₹)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Dynamic Elastic (₹)</label>
                  <input
                    type="number"
                    value={elasticPrice}
                    onChange={(e) => setElasticPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Surge / Elasticity Trigger Condition</label>
                <input
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Save Elasticity Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
