import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  Download,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { printOrDownloadInvoice } from '../../utils/invoiceGenerator';

export const CustomerBillingPortal: React.FC = () => {
  const { subscriptions, transactions, setCurrentView, portalCustomerEmail } = useApp();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'receipts'>('receipts');

  const customerEmail = portalCustomerEmail || '';
  const customerSubs = customerEmail ? subscriptions.filter(s => s.customerEmail.toLowerCase() === customerEmail.toLowerCase()) : [];
  const customerTxs = customerEmail ? transactions.filter(t => t.customerEmail.toLowerCase() === customerEmail.toLowerCase()) : [];
  const customerName = customerTxs[0]?.customerName || '';

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#0A0D14] font-sans flex flex-col justify-between selection:bg-[#0055FF] selection:text-white">

      {/* Portal Header */}
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo onClick={() => setCurrentView('landing')} />
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold border border-blue-100">
              Your Receipts
            </span>
          </div>

          <button
            onClick={() => setCurrentView('landing')}
            className="opp-btn-secondary py-1.5 px-4 text-xs font-semibold"
          >
            ← Back to QivroPay
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-8">

        {!customerEmail ? (
          <div className="opp-card p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F5F8] text-[#8C90A0] flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0A0D14]">No customer selected</h2>
            <p className="text-xs text-[#6E717D] max-w-sm mx-auto">
              This page opens from your receipt after a payment, scoped to that payment's email address. There's nothing to show here on its own.
            </p>
          </div>
        ) : (
          <>
            {/* User Identity Banner */}
            <div className="opp-card p-6 sm:p-8 space-y-1">
              <div className="text-xs font-mono text-[#8C90A0] uppercase font-bold">Your payments</div>
              {customerName && (
                <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
                  {customerName}
                </h2>
              )}
              <div className="text-xs text-[#6E717D] font-mono">{customerEmail}</div>
            </div>

            {/* Payment methods note — QivroPay does not store or manage cards; Cashfree
                handles them at checkout time and nothing is retained for reuse here. */}
            <div className="opp-card p-5 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-[#6E717D] leading-relaxed">
                Payment details are handled securely by Cashfree at checkout. QivroPay doesn't store your card or UPI details, so there's nothing to manage here — you'll enter your payment details again the next time you pay.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 border-b border-black/[0.06] pb-3 text-xs font-mono">
              <button
                onClick={() => setActiveTab('receipts')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'receipts' ? 'bg-[#0A0D14] text-white font-bold' : 'text-[#6E717D] hover:text-[#0A0D14]'
                }`}
              >
                Receipts ({customerTxs.length})
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'subscriptions' ? 'bg-[#0A0D14] text-white font-bold' : 'text-[#6E717D] hover:text-[#0A0D14]'
                }`}
              >
                Subscriptions ({customerSubs.length})
              </button>
            </div>

            {/* Tab: Subscriptions — read-only; QivroPay V1 has no subscription
                creation path, so this will always be empty for a real merchant. */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                {customerSubs.length === 0 ? (
                  <div className="opp-card p-12 text-center text-xs text-[#8C90A0] font-mono">
                    No subscriptions found for {customerEmail}.
                  </div>
                ) : (
                  customerSubs.map((sub) => (
                    <div key={sub.id} className="opp-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-[#0A0D14] font-sans">{sub.planName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {sub.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-[#6E717D] font-mono">
                          Billed: <strong>₹{sub.amount.toFixed(2)} INR / {sub.interval}</strong> • Next billing cycle: {sub.currentPeriodEnd}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Receipts */}
            {activeTab === 'receipts' && (
              <div className="opp-card overflow-hidden">
                {customerTxs.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#8C90A0] font-mono">
                    No receipts found for {customerEmail}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                          <th className="p-4 font-semibold">Receipt Number</th>
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">Product</th>
                          <th className="p-4 font-semibold">Total Paid</th>
                          <th className="p-4 font-semibold">Payment Rail</th>
                          <th className="p-4 font-semibold">PDF Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.05]">
                        {customerTxs.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[#F4F5F8] transition-colors">
                            <td className="p-4 font-mono font-bold text-[#0A0D14]">
                              INV-{tx.id.slice(-8).toUpperCase()}
                            </td>
                            <td className="p-4 font-mono text-[#6E717D]">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-[#0A0D14] font-medium">
                              {tx.productName}
                            </td>
                            <td className="p-4 font-mono font-bold text-[#0055FF]">
                              ₹{tx.amount.toFixed(2)} INR
                            </td>
                            <td className="p-4 font-mono uppercase text-[10px]">
                              {tx.paymentMethod.replace('_', ' ')}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => printOrDownloadInvoice(tx)}
                                className="opp-btn-secondary px-3 py-1 text-[11px] font-semibold flex items-center gap-1.5"
                              >
                                <Download className="w-3 h-3 text-[#0055FF]" />
                                <span>PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      <footer className="border-t border-black/[0.06] py-6 text-center text-xs text-[#8C90A0] font-mono">
        Secured by QivroPay • 256-bit SSL
      </footer>

    </div>
  );
};
