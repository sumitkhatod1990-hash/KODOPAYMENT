import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, TrendingUp, CheckCircle2, Clock, Plus, Download, FileSpreadsheet } from 'lucide-react';

export const PayoutsTab: React.FC = () => {
  const { payouts, requestPayout, analytics, transactions } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState(1500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await requestPayout(amount);
    setIsSubmitting(false);
    setShowModal(false);
  };

  const exportReconciledCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Customer Email', 'Product', 'Gross Amount ($)', 'MoR Platform Fee ($)', 'Net Payout ($)', 'Payment Rail', 'Tax Nexus Status'];
    const rows = transactions.map(t => [
      t.id,
      new Date(t.createdAt).toISOString(),
      t.customerEmail,
      `"${t.productName}"`,
      t.amount.toFixed(2),
      t.fee.toFixed(2),
      t.net.toFixed(2),
      t.paymentMethod.toUpperCase(),
      'KODO Remitted (0% Liability)'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kodo_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
            Payouts & Bank Settlement
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b]">
            Track revenue payouts transferred to your bank accounts under KODO's daily T+2 rolling settlement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={exportReconciledCSV}
            className="apple-btn-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Reconciled CSV (QuickBooks/Xero)</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="apple-btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Request Instant Payout
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-1">
          <span className="text-xs text-[#86868b] font-medium">Available for Payout</span>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono">
            ${analytics?.totalNet ? (analytics.totalNet * 0.75).toFixed(2) : '1,240.00'}
          </div>
          <span className="text-[11px] text-[#86868b]">Auto-settling on schedule</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-1">
          <span className="text-xs text-[#86868b] font-medium">Payout Destination Bank</span>
          <div className="text-base font-bold text-[#1d1d1f] mt-1">Silicon Valley Bank</div>
          <span className="text-xs text-[#86868b] font-mono">Routing: ••••9812 (Active)</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-1">
          <span className="text-xs text-[#86868b] font-medium">MoR Tax Withholding</span>
          <div className="text-base font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 100% Tax Nexus Insulated
          </div>
          <span className="text-[11px] text-[#86868b]">Zero corporate tax liability on payouts</span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 font-bold text-[#1d1d1f] text-sm">
          Settlement Transfer History
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafafc] text-[#86868b] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Payout ID</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Destination Account</th>
                <th className="p-4 font-semibold">Estimated Arrival</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Initiated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {payouts.map((po) => (
                <tr key={po.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-4 font-mono font-semibold text-[#1d1d1f]">
                    {po.id}
                  </td>
                  <td className="p-4 font-bold text-emerald-700 font-mono text-sm">
                    ${po.amount.toFixed(2)} USD
                  </td>
                  <td className="p-4 font-medium text-[#1d1d1f]">
                    {po.destination}
                  </td>
                  <td className="p-4 font-mono text-[#86868b]">
                    {new Date(po.arrivalDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {po.status === 'paid' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Paid Out
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] font-bold text-[10px] border border-blue-200">
                        In Transit (T+2)
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-[#86868b]">
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#1d1d1f] text-lg font-heading">Request Payout</h3>
              <button onClick={() => setShowModal(false)} className="text-[#86868b] text-sm">✕</button>
            </div>

            <form onSubmit={handleRequest} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Amount to Transfer ($ USD)</label>
                <input
                  type="number"
                  min="50"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] font-mono text-sm font-bold text-[#1d1d1f] outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5 text-[11px] text-[#6e6e73]">
                Transfers settle to <strong>Silicon Valley Bank (••••9812)</strong> within 1-2 business days.
              </div>

              <div className="pt-3 border-t border-black/5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="apple-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="apple-btn-black px-5 py-2">
                  {isSubmitting ? 'Transferring...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
