import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LineChart, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Sparkles, 
  Zap, 
  TrendingUp,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AccountAggregatorTab: React.FC = () => {
  const [credits, setCredits] = useState([
    {
      id: 'aa_loan_301',
      merchantName: 'FreshMatrix SaaS India Pvt Ltd',
      aaFiuConsent: 'Setu AA Consent Approved (HDFC & ICICI)',
      monthlyBankFlow: '₹18,50,000.00 / mo',
      preApprovedCredit: '₹25,00,000.00 INR',
      interestRate: '1.15% / month (RBF Split)',
      status: 'credit_line_ready_to_disburse'
    }
  ]);

  const [disbursing, setDisbursing] = useState(false);

  const handleDisburseCredit = () => {
    setDisbursing(true);
    setTimeout(() => {
      setDisbursing(false);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <LineChart className="w-6 h-6 text-[#0055FF]" />
            <span>RBI Account Aggregator (AA) Working Capital Financing</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Consent-based real-time bank statement telemetry via RBI-regulated Account Aggregators (Setu, Anumati, OneMoney) unlocking instant collateral-free working capital advances up to ₹25 Lakhs.
          </p>
        </div>

        <button
          onClick={handleDisburseCredit}
          disabled={disbursing}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Coins className="w-4 h-4" />
          <span>{disbursing ? 'Disbursing ₹25 Lakhs...' : 'Disburse ₹25 Lakhs via IMPS'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Pre-Approved Working Capital</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹25,00,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 0 collateral / Zero paper bank statements
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Verified Monthly Cash Flow</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹18,50,000.00 / mo</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Real-time banking data via Setu AA</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Disbursement Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 30 Seconds (IMPS)</div>
          <div className="text-[11px] text-purple-700 font-mono">Direct transfer to Indian current account</div>
        </div>
      </div>

      {/* Credits Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Credit Facility ID</th>
                <th className="p-4 font-semibold">Merchant Entity</th>
                <th className="p-4 font-semibold">RBI Account Aggregator Consent</th>
                <th className="p-4 font-semibold">Verified Bank Flow</th>
                <th className="p-4 font-semibold">Pre-Approved Credit</th>
                <th className="p-4 font-semibold">Repayment Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {credits.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {c.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.merchantName}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {c.aaFiuConsent}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {c.monthlyBankFlow}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {c.preApprovedCredit}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {c.interestRate}
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
