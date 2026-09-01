sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subscription } from '../../types';
import { CreditCard, CheckCircle2, AlertCircle, XCircle, Search } from 'lucide-react';

export const SubscriptionsTab: React.FC = () => {
  const { subscriptions, cancelSubscription } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredSubs = subscriptions.filter(s => 
    s.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = async (subId: string) => {
    if (confirm('Cancel recurring subscription for this customer?')) {
      setCancellingId(subId);
      await cancelSubscription(subId);
      setCancellingId(null);
    }
  };

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const mrrTotal = subscriptions.filter(s => s.status === 'active').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
          Recurring SaaS Subscriptions
        </h2>
        <p className="text-xs sm:text-sm text-[#86868b]">
          Manage subscriber retention, automated dunning schedules, and monthly recurring revenue (MRR).
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-1">
          <span className="text-xs text-[#86868b] font-medium">Active Subscribers</span>
          <div className="text-3xl font-extrabold text-[#1d1d1f]">{activeCount}</div>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-1">
          <span className="text-xs text-[#86868b] font-medium">Monthly Recurring Revenue</span>
          <div className="text-3xl font-extrabold text-[#0071e3] font-mono">₹{mrrTotal.toFixed(2)}</div>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-1">
          <span className="text-xs text-[#86868b] font-medium">Dunning & Churn Protection</span>
          <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4" /> Smart Auto-Retries Active
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-black/5 flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/5 text-[#1d1d1f] focus:border-[#0071e3] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafafc] text-[#86868b] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Subscription ID</th>
                <th className="p-4 font-semibold">Subscriber</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Billing Amount</th>
                <th className="p-4 font-semibold">Next Period End</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-4 font-mono font-semibold text-[#1d1d1f]">
                    {sub.id}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-[#1d1d1f]">{sub.customerName}</div>
                    <div className="text-[11px] text-[#86868b] font-mono">{sub.customerEmail}</div>
                  </td>
                  <td className="p-4 text-[#1d1d1f] font-medium">
                    {sub.planName}
                  </td>
                  <td className="p-4 font-bold text-[#1d1d1f] font-mono">
                    ${sub.amount.toFixed(2)} / {sub.interval}
                  </td>
                  <td className="p-4 font-mono text-[#86868b]">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {sub.status === 'active' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Active
                      </span>
                    )}
                    {sub.status === 'past_due' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                        Past Due (Retrying)
                      </span>
                    )}
                    {sub.status === 'cancelled' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold text-[10px]">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {sub.status === 'active' && (
                      <button
                        onClick={() => handleCancel(sub.id)}
                        disabled={cancellingId === sub.id}
                        className="text-xs text-[#86868b] hover:text-red-600 hover:underline"
                      >
                        {cancellingId === sub.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
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
