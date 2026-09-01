sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Split, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Sliders, 
  Play, 
  Sparkles,
  Zap,
  ArrowRight,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ABTestingTab: React.FC = () => {
  const [tests, setTests] = useState([
    {
      id: 'test_01',
      name: 'Checkout Pricing Structure Experiment',
      variantA: 'One-Time Payment (₹49.00 INR)',
      variantB: 'Monthly Subscription (₹19.00/mo)',
      trafficSplit: '50% / 50%',
      viewsA: 1420,
      conversionsA: 82,
      conversionRateA: '5.77%',
      viewsB: 1390,
      conversionsB: 118,
      conversionRateB: '8.49%',
      winner: 'Variant B (+47.1% Lift)',
      status: 'active'
    },
    {
      id: 'test_02',
      name: 'Apple Pay Priority vs Default Card',
      variantA: 'Default Card Form First',
      variantB: 'Apple Pay One-Click Banner First',
      trafficSplit: '50% / 50%',
      viewsA: 950,
      conversionsA: 48,
      conversionRateA: '5.05%',
      viewsB: 970,
      conversionsB: 79,
      conversionRateB: '8.14%',
      winner: 'Variant B (+61.2% Lift)',
      status: 'active'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [testName, setTestName] = useState('');
  const [variantA, setVariantA] = useState('Standard Checkout');
  const [variantB, setVariantB] = useState('Order Bump + Klarna BNPL');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName) return;

    const newTest = {
      id: `test_${Date.now().toString().slice(-4)}`,
      name: testName,
      variantA,
      variantB,
      trafficSplit: '50% / 50%',
      viewsA: 0,
      conversionsA: 0,
      conversionRateA: '0.00%',
      viewsB: 0,
      conversionsB: 0,
      conversionRateB: '0.00%',
      winner: 'Collecting Sample Data',
      status: 'active'
    };

    setTests([newTest, ...tests]);
    setTestName('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            A/B Checkout Conversion Rate Optimization (CRO)
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Scientifically test price points, checkout button placements, and order bumps with automated statistical significance tracking.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch A/B Split Test</span>
        </button>
      </div>

      {/* Tests List */}
      <div className="space-y-6">
        {tests.map((test) => (
          <div key={test.id} className="opp-card p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-base text-[#0A0D14] font-sans">{test.name}</h3>
                </div>
                <span className="text-[11px] text-[#8C90A0] font-mono">Traffic Split: {test.trafficSplit}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-mono text-xs font-bold border border-purple-200 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{test.winner}</span>
                </span>
              </div>
            </div>

            {/* Split Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Variant A */}
              <div className="p-5 rounded-2xl bg-[#FAFBFD] border border-black/5 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-[#8C90A0]">Variant A (Control)</span>
                  <span className="text-[#0A0D14]">{test.viewsA} Views</span>
                </div>
                <div className="text-xs font-medium text-[#0A0D14]">{test.variantA}</div>
                <div className="flex items-baseline justify-between pt-2 border-t border-black/5 font-mono">
                  <span className="text-[11px] text-[#8C90A0]">Conversion:</span>
                  <span className="text-xl font-bold text-[#0A0D14]">{test.conversionRateA} ({test.conversionsA} orders)</span>
                </div>
              </div>

              {/* Variant B */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-[#0055FF]">Variant B (Challenger)</span>
                  <span className="text-[#0055FF]">{test.viewsB} Views</span>
                </div>
                <div className="text-xs font-medium text-[#0A0D14]">{test.variantB}</div>
                <div className="flex items-baseline justify-between pt-2 border-t border-blue-100 font-mono">
                  <span className="text-[11px] text-[#8C90A0]">Conversion:</span>
                  <span className="text-xl font-bold text-emerald-700">{test.conversionRateB} ({test.conversionsB} orders)</span>
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Launch A/B Checkout Test</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Experiment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Trial vs Lifetime Deal"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Variant A (Control)</label>
                <input
                  type="text"
                  value={variantA}
                  onChange={(e) => setVariantA(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Variant B (Challenger)</label>
                <input
                  type="text"
                  value={variantB}
                  onChange={(e) => setVariantB(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Start Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
