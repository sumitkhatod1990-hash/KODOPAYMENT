sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { Search, CheckCircle2, RefreshCw, FileText } from 'lucide-react';

export const TransactionsTab: React.FC = () => {
  const { transactions, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(t => 
    t.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
            Transactions & MoR Settlement
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b]">
            Real-time feed of all charges, fees, VAT breakdowns, and merchant payouts.
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          className="apple-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Feed
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-black/10 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions by ID, email, customer or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/5 text-[#1d1d1f] focus:border-[#0071e3] outline-none"
          />
        </div>

        <div className="text-xs text-[#86868b] font-medium">
          Showing <strong>{filteredTransactions.length}</strong> transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafafc] text-[#86868b] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Gross</th>
                <th className="p-4 font-semibold">QIVROPAY Fee</th>
                <th className="p-4 font-semibold">Net Payout</th>
                <th className="p-4 font-semibold">Payment Method</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-4 font-mono font-semibold text-[#1d1d1f]">
                    {tx.id}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-[#1d1d1f]">{tx.customerName}</div>
                    <div className="text-[11px] text-[#86868b] font-mono">{tx.customerEmail}</div>
                  </td>
                  <td className="p-4 text-[#1d1d1f] font-medium">
                    {tx.productName}
                  </td>
                  <td className="p-4 font-bold text-[#1d1d1f] font-mono">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono text-[#86868b]">
                    -₹{tx.fee.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">
                    ${tx.net.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono uppercase text-[#6e6e73]">
                    {tx.paymentMethod} {tx.cardLast4 ? `(•${tx.cardLast4})` : ''}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Succeeded
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="text-xs font-bold text-[#0071e3] hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1d1d1f] text-base font-sans">QIVROPAY MoR Invoice</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">PAID</span>
              </div>
              <button onClick={() => setSelectedTx(null)} className="text-[#86868b] hover:text-[#1d1d1f] text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#86868b]">Invoice Number:</span>
                <span className="font-mono text-[#1d1d1f] font-bold">INV-{selectedTx.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Date:</span>
                <span className="text-[#1d1d1f] font-mono">{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Customer:</span>
                <span className="text-[#1d1d1f]">{selectedTx.customerName} ({selectedTx.customerEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Product:</span>
                <span className="text-[#1d1d1f] font-medium">{selectedTx.productName}</span>
              </div>
              
              <div className="pt-3 border-t border-black/5 space-y-1.5">
                <div className="flex justify-between text-[#86868b]">
                  <span>Gross Charged:</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold">₹{selectedTx.amount.toFixed(2)} INR</span>
                </div>
                <div className="flex justify-between text-[#86868b]">
                  <span>MoR Platform Fee:</span>
                  <span className="font-mono text-[#1d1d1f]">-₹{selectedTx.fee.toFixed(2)} INR</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-black/5 text-[#1d1d1f]">
                  <span>Net Settled Payout:</span>
                  <span className="font-mono text-emerald-700">₹{selectedTx.net.toFixed(2)} INR</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-black/5 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="apple-btn-black px-5 py-2 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
