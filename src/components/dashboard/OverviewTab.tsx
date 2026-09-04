import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { deriveOnboardingState } from '../../lib/cashfreeOnboardingState';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const OverviewTab: React.FC<{ onNavigateTab: (tab: any) => void }> = ({ onNavigateTab }) => {
  const { analytics, transactions, setCurrentView, createCheckoutSession, products, cashfreePartnerStatus, cashfreePartnerStatusLoading } = useApp();

  const handleQuickCheckout = async () => {
    const prod = products[0];
    if (prod) {
      const sessionId = await createCheckoutSession({ productId: prod.id, amount: prod.price, title: prod.name });
      if (sessionId) setCurrentView('checkout', { sessionId, returnTo: 'dashboard' });
    }
  };

  // Phase 10.8E — a compact, non-repetitive nudge toward Set Up Payments.
  // Deliberately quiet once complete (a one-line confirmation, no card, no
  // button) so a merchant who has already finished setup is never
  // interrupted by it again.
  const onboardingState = useMemo(() => deriveOnboardingState(cashfreePartnerStatus).state, [cashfreePartnerStatus]);

  return (
    <div className="space-y-8 animate-fade-in">

      {!cashfreePartnerStatusLoading && onboardingState !== 'ACTIVE' && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/30 text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#1d1d1f] text-sm font-sans">Payment setup incomplete</h4>
              <p className="text-xs text-[#86868b]">Complete verification to start accepting payments.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('verification')}
            className="apple-btn-black px-4 py-2 text-xs font-semibold shadow-sm shrink-0"
          >
            Continue setup
          </button>
        </div>
      )}

      {!cashfreePartnerStatusLoading && onboardingState === 'ACTIVE' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Payment setup complete
        </div>
      )}


      {/* Top Banner Notice */}
      <div className="p-5 rounded-3xl bg-white border border-black/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0071e3]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#1d1d1f] text-sm font-sans">
              Payment Infrastructure Active · India
            </h4>
            <p className="text-xs text-[#86868b]">
              Accept UPI and card payments in India, powered by Cashfree.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('payment-links')}
            className="apple-btn-black px-4 py-2 text-xs font-semibold shadow-sm"
          >
            + Create Payment Link
          </button>
          <button
            onClick={handleQuickCheckout}
            className="apple-btn-secondary px-4 py-2 text-xs"
          >
            Test Checkout Flow
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Gross Volume */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Gross Volume</span>
            <DollarSign className="w-4 h-4 text-[#0071e3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            ₹{analytics?.totalVolume.toLocaleString() || '0.00'}
          </div>
        </div>

        {/* Net Payouts */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Net Payouts</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            ₹{analytics?.totalNet.toLocaleString() || '0.00'}
          </div>
          <div className="text-xs text-[#86868b]">
            Platform fee: <strong>₹{analytics?.totalFees || '0.00'}</strong>
          </div>
        </div>

        {/* Recurring records */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Recurring Records</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            ₹{analytics?.mrr.toLocaleString() || '0.00'}
          </div>
          <div className="text-xs text-[#86868b]">
            <strong>{analytics?.activeSubscriptions || 0}</strong> active records
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            {analytics?.activeCustomers || 0}
          </div>
          <div className="text-xs text-[#86868b] font-semibold">
            Conversion: <strong>{analytics?.conversionRate || '—'}</strong>
          </div>
        </div>

      </div>

      {/* Recent Transactions — real data only, no fabricated chart or activity */}
      {transactions.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-black/10 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] text-[#86868b] flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#1d1d1f] text-base font-sans">
              Your payment activity will appear here
            </h3>
            <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
              Create your first product and payment link to start collecting payments.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="apple-btn-black px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2"
          >
            Create your first product <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-7 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1d1d1f] text-base font-sans">
                Recent Transactions Feed
              </h3>
              <p className="text-xs text-[#86868b]">
                Your most recent payments
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('payments')}
              className="text-xs font-bold text-[#0071e3] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/10 text-[#86868b] font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Transaction ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Net Payout</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-3.5 font-mono font-semibold text-[#1d1d1f]">
                      {tx.id}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-[#1d1d1f]">{tx.customerName}</div>
                      <div className="text-[11px] text-[#86868b] font-mono">{tx.customerEmail}</div>
                    </td>
                    <td className="py-3.5 text-[#1d1d1f] font-medium">
                      {tx.productName}
                    </td>
                    <td className="py-3.5 font-bold text-[#1d1d1f] font-mono">
                      ₹{(Number(tx.amount) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 font-mono text-emerald-700 font-bold">
                      ₹{(Number(tx.net) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Succeeded
                      </span>
                    </td>
                    <td className="py-3.5 text-[#86868b] font-mono">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
