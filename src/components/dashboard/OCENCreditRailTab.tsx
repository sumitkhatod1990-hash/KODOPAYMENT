import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Coins, 
  Building2,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OCENCreditRailTab: React.FC = () => {
  const [loans, setLoans] = useState([
    {
      id: 'ocen_loan_991',
      borrowerEntity: 'Zensight Analytics SaaS',
      ocenLspPartner: 'Bajaj Finserv & IDFC First Bank',
      creditFacility: '₹15,00,000.00 Revolving SaaS Credit',
      drawdownInterest: '1.08% / month on utilized capital',
      repaymentTrigger: 'Auto-debit on monthly MRR receipts',
      status: 'ocen_active_disbursed'
    }
  ]);

  const [requesting, setRequesting] = useState(false);

  const handleRequestCredit = () => {
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#0055FF]" />
            <span>OCEN (Open Credit Enablement Network) Embedded SME Credit Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Empower your SaaS subscribers with instant cash-flow based revolving credit lines directly inside your checkout flow via iSPIRT's OCEN 4.0 Loan Service Provider (LSP) network.
          </p>
        </div>

        <button
          onClick={handleRequestCredit}
          disabled={requesting}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Coins className="w-4 h-4" />
          <span>{requesting ? 'Connecting OCEN LSP...' : 'Simulate OCEN Credit Offer'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Pre-Approved Revolving Credit</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹15,00,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero collateral / Instant digital underwriting
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">OCEN Banking Partners</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">IDFC, Bajaj, Axis</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1.08% / month competitive interest</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Checkout Conversion Uplift</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">+38.4% Uplift</div>
          <div className="text-[11px] text-purple-700 font-mono">Subscribers buy annual plans instantly</div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">OCEN Facility ID</th>
                <th className="p-4 font-semibold">Borrower SaaS Entity</th>
                <th className="p-4 font-semibold">Underwriting Bank</th>
                <th className="p-4 font-semibold">Revolving Credit Limit</th>
                <th className="p-4 font-semibold">Interest Terms</th>
                <th className="p-4 font-semibold">Disbursement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {loans.map((l) => (
                <tr key={l.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {l.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {l.borrowerEntity}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {l.ocenLspPartner}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {l.creditFacility}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {l.drawdownInterest}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      OCEN DISBURSED
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
