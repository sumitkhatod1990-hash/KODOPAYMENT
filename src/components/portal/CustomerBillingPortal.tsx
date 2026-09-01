import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { 
  CreditCard, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  ArrowLeft, 
  PauseCircle, 
  XCircle,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { printOrDownloadInvoice } from '../../utils/invoiceGenerator';
import confetti from 'canvas-confetti';

export const CustomerBillingPortal: React.FC = () => {
  const { subscriptions, transactions, setCurrentView } = useApp();
  
  const [customerEmail, setCustomerEmail] = useState('alex.chen@synthflow.ai');
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9912');
  const [cardSuccess, setCardSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices'>('subscriptions');

  const customerSubs = subscriptions.filter(s => s.customerEmail.toLowerCase() === customerEmail.toLowerCase()) || [];
  const customerTxs = transactions.filter(t => t.customerEmail.toLowerCase() === customerEmail.toLowerCase()) || [];

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCard(false);
    setCardSuccess(true);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCardSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#0A0D14] font-sans flex flex-col justify-between selection:bg-[#0055FF] selection:text-white">
      
      {/* Portal Header */}
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo onClick={() => setCurrentView('landing')} />
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold border border-blue-100">
              Customer Billing Portal
            </span>
          </div>

          <button
            onClick={() => setCurrentView('landing')}
            className="opp-btn-secondary py-1.5 px-4 text-xs font-semibold"
          >
            ← Back to QIVROPAY
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
        
        {/* User Identity Banner */}
        <div className="opp-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#8C90A0] uppercase font-bold">Manage Subscriptions & Invoices</div>
            <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
              Alex Chen
            </h2>
            <div className="text-xs text-[#6E717D] font-mono">{customerEmail}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUpdatingCard(true)}
              className="opp-btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-[#0055FF]" />
              <span>Update Payment Card</span>
            </button>
          </div>
        </div>

        {cardSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Default payment method successfully updated to ending in {cardNumber.slice(-4)}. Smart dunning retries updated!</span>
          </div>
        )}

        {/* Update Card Modal */}
        {isUpdatingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-black/5">
                <h3 className="font-bold text-[#0A0D14] text-base font-sans">Update Default Payment Card</h3>
                <button onClick={() => setIsUpdatingCard(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
              </div>

              <form onSubmit={handleUpdateCard} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#0A0D14]">Expires (MM/YY)</label>
                    <input type="text" defaultValue="09/29" className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#0A0D14]">CVC</label>
                    <input type="text" defaultValue="911" className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsUpdatingCard(false)} className="opp-btn-secondary px-4 py-2">
                    Cancel
                  </button>
                  <button type="submit" className="opp-btn-primary px-5 py-2">
                    Save Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-black/[0.06] pb-3 text-xs font-mono">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'subscriptions' ? 'bg-[#0A0D14] text-white font-bold' : 'text-[#6E717D] hover:text-[#0A0D14]'
            }`}
          >
            Active Subscriptions ({customerSubs.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'invoices' ? 'bg-[#0A0D14] text-white font-bold' : 'text-[#6E717D] hover:text-[#0A0D14]'
            }`}
          >
            Past Tax Invoices ({customerTxs.length})
          </button>
        </div>

        {/* Tab 1: Active Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {customerSubs.length === 0 ? (
              <div className="opp-card p-12 text-center text-xs text-[#8C90A0] font-mono">
                No active recurring subscriptions found for {customerEmail}.
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
                    <div className="text-[11px] text-[#8C90A0] font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Protected by QIVROPAY MoR Smart Dunning (0 involuntary churn)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => alert('Subscription paused for 30 days. No charges will be incurred.')}
                      className="opp-btn-secondary px-4 py-2 font-semibold flex items-center gap-1.5"
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pause</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Would you like 50% off for the next 3 months instead of canceling?')) {
                          alert('50% retention discount applied to your next 3 billing cycles!');
                        }
                      }}
                      className="p-2 text-[#8C90A0] hover:text-red-600 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Past Invoices */}
        {activeTab === 'invoices' && (
          <div className="opp-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                    <th className="p-4 font-semibold">Invoice Number</th>
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
                        ${tx.amount.toFixed(2)} INR
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
          </div>
        )}

      </main>

      <footer className="border-t border-black/[0.06] py-6 text-center text-xs text-[#8C90A0] font-mono">
        Secured by QIVROPAY Payments Inc. • 256-bit SSL • Merchant of Record for Digital Software & AI Services
      </footer>

    </div>
  );
};
