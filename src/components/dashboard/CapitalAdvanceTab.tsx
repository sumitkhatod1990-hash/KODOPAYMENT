import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Coins, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CapitalAdvanceTab: React.FC = () => {
  const [advances, setAdvances] = useState([
    {
      id: 'cap_adv_901',
      approvedAmount: 75000.00,
      repaymentRate: '10% Daily Net Volume Split',
      fee: 4500.00,
      totalToRepay: 79500.00,
      repaidSoFar: 14250.00,
      status: 'active_repaying',
      fundedAt: 'Aug 10, 2026'
    }
  ]);

  const [preApprovedAmount] = useState(125000);
  const [requestAmount, setRequestAmount] = useState(50000);
  const [requesting, setRequesting] = useState(false);

  const handleDrawCapital = (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);

    setTimeout(() => {
      const fee = requestAmount * 0.06;
      const newAdv = {
        id: `cap_adv_${Date.now().toString().slice(-3)}`,
        approvedAmount: Number(requestAmount),
        repaymentRate: '10% Daily Net Volume Split',
        fee,
        totalToRepay: Number(requestAmount) + fee,
        repaidSoFar: 0,
        status: 'active_repaying',
        fundedAt: 'Today'
      };

      setAdvances([newAdv, ...advances]);
      setRequesting(false);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  const totalFunded = advances.reduce((acc, a) => acc + a.approvedAmount, 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#0055FF]" />
            <span>Instant Revenue-Based Working Capital & Financing (RBF)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            1-Click non-dilutive capital advances up to $150,000 USD based on verified platform MRR growth, automatically repaid via a 10% daily revenue split with 0% fixed interest.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>PRE-APPROVED: ${preApprovedAmount.toLocaleString()} USD</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Growth Capital Drawn</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">${totalFunded.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Funded instantly to merchant balance
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Repayment Structure</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">10% Daily Split</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">0% interest • Flat 6% fixed fee</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Credit Check Requirement</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Zero Credit Checks</div>
          <div className="text-[11px] text-purple-700 font-mono">100% based on QIVROPAY MRR telemetry</div>
        </div>
      </div>

      {/* Instant Drawdown Form */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0055FF]" />
            <span>Instant Capital Drawdown Calculator</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            60-SECOND SETTLEMENT
          </span>
        </div>

        <form onSubmit={handleDrawCapital} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8C90A0]">Select Capital Advance Amount:</span>
              <span className="font-bold text-[#0055FF] text-sm">${requestAmount.toLocaleString()} USD</span>
            </div>
            <input
              type="range"
              min={10000}
              max={preApprovedAmount}
              step={5000}
              value={requestAmount}
              onChange={(e) => setRequestAmount(Number(e.target.value))}
              className="w-full accent-[#0055FF]"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#8C90A0]">
              <span>$10,000</span>
              <span>$50,000</span>
              <span>${preApprovedAmount.toLocaleString()} (Max)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs pt-2">
            <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
              <span className="text-[#8C90A0]">Instant Inflow to Balance:</span>
              <div className="font-bold text-emerald-700 text-sm">+${requestAmount.toLocaleString()} USD</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
              <span className="text-[#8C90A0]">Flat Fixed Fee (6%):</span>
              <div className="font-bold text-[#0A0D14] text-sm">${(requestAmount * 0.06).toLocaleString()} USD</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
              <span className="text-[#8C90A0]">Total Payback:</span>
              <div className="font-bold text-[#0055FF] text-sm">${(requestAmount * 1.06).toLocaleString()} USD</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={requesting}
            className="w-full opp-btn-primary py-3 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${requesting ? 'animate-spin' : ''}`} />
            <span>{requesting ? 'Depositing Capital...' : `Accept & Draw $${requestAmount.toLocaleString()} USD Instantly`}</span>
          </button>
        </form>
      </div>

      {/* Active Advances Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Advance ID</th>
                <th className="p-4 font-semibold">Funded Capital</th>
                <th className="p-4 font-semibold">Repayment Mechanism</th>
                <th className="p-4 font-semibold">Total Payback</th>
                <th className="p-4 font-semibold">Repaid So Far</th>
                <th className="p-4 font-semibold">Funded Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {advances.map((adv) => (
                <tr key={adv.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {adv.id}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF] text-sm">
                    ${adv.approvedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {adv.repaymentRate}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    ${adv.totalToRepay.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    ${adv.repaidSoFar.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {adv.fundedAt}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE REPAYING
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
