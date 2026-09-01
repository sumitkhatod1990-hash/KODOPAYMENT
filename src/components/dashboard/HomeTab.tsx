sed: --: No such file or directory
import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  ShieldCheck,
  Coins,
  Globe2
} from 'lucide-react';

export const HomeTab: React.FC<{ onNavigateTab: (tab: any) => void }> = ({ onNavigateTab }) => {
  const { analytics, transactions, subscriptions, setCurrentView, createCheckoutSession, products } = useApp();

  const handleQuickCheckout = async () => {
    const prod = products[0];
    if (prod) {
      const sessionId = await createCheckoutSession({ productId: prod.id, amount: prod.price, title: prod.name });
      if (sessionId) setCurrentView('checkout', { sessionId });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner Notice */}
      <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0071e3]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#1d1d1f] text-sm font-sans">
              Merchant of Record Active (220+ Countries)
            </h4>
            <p className="text-xs text-[#86868b]">
              India GST, collections, settlements, and INR payment activity in one QivroPay dashboard.
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

      {/* Today's Pulse Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Gross Volume */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Gross Settled Volume</span>
            <DollarSign className="w-4 h-4 text-[#0071e3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            ${analytics?.totalVolume.toLocaleString() || '0.00'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last month</span>
          </div>
        </div>

        {/* Net Payouts */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Net Merchant Take-Home</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            ${analytics?.totalNet.toLocaleString() || '0.00'}
          </div>
          <div className="text-xs text-[#86868b]">
            Total MoR Fees: <strong>₹{analytics?.totalFees || '0.00'}</strong> (4% + 40¢)
          </div>
        </div>

        {/* Active MRR */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Monthly Recurring (MRR)</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            ${analytics?.mrr.toLocaleString() || '0.00'}
          </div>
          <div className="text-xs text-[#86868b]">
            <strong>{analytics?.activeSubscriptions || 0}</strong> active subscribers
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-[#86868b] font-medium">
            <span>Active Customers</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f] font-sans">
            {analytics?.activeCustomers || 0}
          </div>
          <div className="text-xs text-emerald-700 font-semibold">
            Conversion: <strong>{analytics?.conversionRate || '5.2%'}</strong>
          </div>
        </div>

      </div>

      {/* SVG Growth Chart */}
      <div className="p-7 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#1d1d1f] text-base font-sans">
              Revenue Growth & Settled Volume
            </h3>
            <p className="text-xs text-[#86868b]">
              Processed across all 220+ supported countries over the last 30 days
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-[#0071e3]">
            ● Live Volume Trend
          </div>
        </div>

        <div className="h-44 w-full pt-4">
          <svg viewBox="0 0 800 180" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="appleGradHome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0071e3" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0071e3" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(0,0,0,0.04)" />
            <line x1="0" y1="90" x2="800" y2="90" stroke="rgba(0,0,0,0.04)" />
            <line x1="0" y1="140" x2="800" y2="140" stroke="rgba(0,0,0,0.04)" />
            
            <path
              d="M0,150 Q100,140 200,110 T400,80 T600,45 T800,20 L800,180 L0,180 Z"
              fill="url(#appleGradHome)"
            />
            <path
              d="M0,150 Q100,140 200,110 T400,80 T600,45 T800,20"
              fill="none"
              stroke="#0071e3"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="200" cy="110" r="4.5" fill="#0071e3" />
            <circle cx="400" cy="80" r="4.5" fill="#0071e3" />
            <circle cx="600" cy="45" r="4.5" fill="#0071e3" />
            <circle cx="800" cy="20" r="5" fill="#0071e3" />
          </svg>
        </div>
      </div>

      {/* Quick Launchpad & Active Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div 
          onClick={() => onNavigateTab('products')}
          className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm hover:border-[#0071e3] transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 w-fit group-hover:scale-105 transition-transform">
            <Coins className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-[#1d1d1f] text-base group-hover:text-[#0071e3] transition-colors">
            AI Credit Packages
          </h4>
          <p className="text-xs text-[#6e6e73]">
            Issue token quotas for GPT-4, Claude & embeddings with automatic refill.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('discounts')}
          className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm hover:border-[#0071e3] transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 w-fit group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-[#1d1d1f] text-base group-hover:text-[#0071e3] transition-colors">
            Discounts & Promo Codes
          </h4>
          <p className="text-xs text-[#6e6e73]">
            Create promotional discount codes and percentage coupons for launch marketing.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('licenses')}
          className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm hover:border-[#0071e3] transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 w-fit group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-[#1d1d1f] text-base group-hover:text-[#0071e3] transition-colors">
            License Entitlements
          </h4>
          <p className="text-xs text-[#6e6e73]">
            Manage cryptographic license keys, hardware binding, and activations.
          </p>
        </div>

      </div>

      {/* Recent Live Transactions */}
      <div className="p-7 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#1d1d1f] text-base font-sans">
              Recent Transactions Feed
            </h3>
            <p className="text-xs text-[#86868b]">
              Live payments settled via QIVROPAY MoR checkout rails
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
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 font-mono text-emerald-700 font-bold">
                    ${tx.net.toFixed(2)}
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

    </div>
  );
};
