import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Landmark, 
  Clock,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TReDSInvoiceDiscountingTab: React.FC = () => {
  const [auctions, setAuctions] = useState([
    {
      id: 'treds_fact_881',
      exchange: 'RXIL (Receivables Exchange of India Ltd)',
      buyerEnterprise: 'Bharat Petroleum Corporation Ltd (BPCL)',
      invoiceAmount: '₹8,50,000.00 INR',
      discountedCash: '₹8,39,800.00 INR (1.2% Factoring Discount)',
      financierBank: 'State Bank of India (SBI Factoring Desk)',
      settlementSpeed: 'T+1 Instant Disbursed',
      status: 'factored_settled'
    }
  ]);

  const [auctioning, setAuctioning] = useState(false);

  const handleAuctionInvoice = () => {
    setAuctioning(true);
    setTimeout(() => {
      setAuctioning(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-[#0055FF]" />
            <span>TReDS (Trade Receivables Discounting System) MSME Exchange</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct RBI-regulated TReDS auction exchange integration (RXIL, M1xchange, Invoicemart) allowing B2B SaaS and enterprise vendors to auction unpaid receivables for instant T+1 bank cash.
          </p>
        </div>

        <button
          onClick={handleAuctionInvoice}
          disabled={auctioning}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Coins className="w-4 h-4" />
          <span>{auctioning ? 'Submitting to RXIL...' : 'Auction Invoice on TReDS'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Discounted Cash Flow Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹8,39,800.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> T+1 bank settlement via SBI Factoring
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Factoring Cost</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">1.2% Low Discount</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Competitive bidding across 40+ banks</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Working Capital Unlocked</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 24 Hours</div>
          <div className="text-[11px] text-purple-700 font-mono">Without waiting 90-120 days for PSU payments</div>
        </div>
      </div>

      {/* Auctions Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">TReDS Auction ID</th>
                <th className="p-4 font-semibold">Enterprise Buyer / PSU</th>
                <th className="p-4 font-semibold">Factoring Exchange</th>
                <th className="p-4 font-semibold">Gross Invoice Amount</th>
                <th className="p-4 font-semibold">Discounted Cash</th>
                <th className="p-4 font-semibold">Financier Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {auctions.map((a) => (
                <tr key={a.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {a.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {a.buyerEnterprise}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {a.exchange}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {a.invoiceAmount}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {a.discountedCash}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DISBURSED (T+1)
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
