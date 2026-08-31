import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartHandshake, 
  ShieldAlert, 
  CheckCircle2, 
  Gift, 
  PauseCircle, 
  Sparkles, 
  TrendingDown, 
  Percent, 
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChurnInterceptorTab: React.FC = () => {
  const [rescuedSubscribers, setRescuedSubscribers] = useState([
    {
      id: 'res_kodo_01',
      customerEmail: 'alex.chen@synthflow.ai',
      reason: 'Too expensive for current volume',
      deflectionOffer: '50% Discount for 3 Months',
      mrrSaved: 49.00,
      timestamp: '25 mins ago',
      status: 'accepted_retained'
    },
    {
      id: 'res_kodo_02',
      customerEmail: 'marcus@hypercompute.de',
      reason: 'Temporarily pausing project',
      deflectionOffer: '2-Month Subscription Snooze (Zero Charge)',
      mrrSaved: 99.00,
      timestamp: 'Yesterday',
      status: 'accepted_retained'
    }
  ]);

  const [testEmail, setTestEmail] = useState('demo.user@startup.ai');
  const [simulating, setSimulating] = useState(false);

  const handleSimulateRescue = () => {
    setSimulating(true);
    setTimeout(() => {
      const newRescue = {
        id: `res_kodo_${Date.now().toString().slice(-4)}`,
        customerEmail: testEmail,
        reason: 'Feature complexity / underutilized',
        deflectionOffer: 'Switch to Developer Lite Plan ($19/mo) + 1-on-1 Onboarding Call',
        mrrSaved: 29.00,
        timestamp: 'Just now',
        status: 'accepted_retained'
      };
      setRescuedSubscribers([newRescue, ...rescuedSubscribers]);
      setSimulating(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 800);
  };

  const totalSavedMRR = rescuedSubscribers.reduce((acc, r) => acc + r.mrrSaved, 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#0055FF]" />
            <span>Subscription Churn Interceptor & AI Rescue Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatically catches customer cancellation requests in the Billing Portal and offers personalized retention incentives (pause, discount, or downgrade).
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>41.2% CANCELLATION DEFLECTION RATE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Saved MRR Velocity</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">+${totalSavedMRR.toFixed(2)} USD / mo</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Across {rescuedSubscribers.length} rescued accounts
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Deflection Win Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">41.2%</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Industry average is 15-20%</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Most Effective Offer</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">50% Off (3 Mo)</div>
          <div className="text-[11px] text-purple-700 font-mono">64% acceptance rate</div>
        </div>
      </div>

      {/* Interactive Simulator */}
      <div className="opp-card p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#0055FF]" />
          <span>Test Live Churn Deflection Offer Dispatcher</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-black/10 bg-[#F4F5F8] text-xs font-mono text-[#0A0D14]"
            placeholder="subscriber@domain.com"
          />
          <button
            onClick={handleSimulateRescue}
            disabled={simulating}
            className="opp-btn-primary px-6 py-3 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simulating ? 'Synthesizing Offer...' : 'Trigger Cancellation Rescue Flow'}</span>
          </button>
        </div>
      </div>

      {/* Rescued Subscribers Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Subscriber Email</th>
                <th className="p-4 font-semibold">Cancellation Intent Reason</th>
                <th className="p-4 font-semibold">AI Deflection Offer Accepted</th>
                <th className="p-4 font-semibold">Saved MRR</th>
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rescuedSubscribers.map((res) => (
                <tr key={res.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {res.customerEmail}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    "{res.reason}"
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {res.deflectionOffer}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    +${res.mrrSaved.toFixed(2)} USD/mo
                  </td>
                  <td className="p-4 text-[#8C90A0] font-mono text-[11px]">
                    {res.timestamp}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      RETAINED
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
