import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingCart, 
  Mail, 
  Send, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Percent,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AbandonedCheckoutsTab: React.FC = () => {
  const [abandonedList, setAbandonedList] = useState([
    {
      id: 'abn_qivropay_01',
      customerEmail: 'marcus.vance@axonlabs.io',
      productName: 'Pro Intelligence SaaS',
      amount: 99.00,
      currency: 'USD',
      lastStep: 'Card Information Entry',
      abandonedAt: '15 mins ago',
      recoveryStatus: 'email_sent',
      discountOffered: 15
    },
    {
      id: 'abn_qivropay_02',
      customerEmail: 'charlotte@creativespark.design',
      productName: 'AI Token Starter Pack',
      amount: 29.00,
      currency: 'USD',
      lastStep: 'Payment Method Select',
      abandonedAt: '45 mins ago',
      recoveryStatus: 'pending',
      discountOffered: 15
    },
    {
      id: 'abn_qivropay_03',
      customerEmail: 'dev.lead@robomind.ai',
      productName: 'Self-Hosted Agent Runtime',
      amount: 499.00,
      currency: 'USD',
      lastStep: 'Email Entry',
      abandonedAt: '2 hours ago',
      recoveryStatus: 'pending',
      discountOffered: 15
    }
  ]);

  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendRecovery = (id: string) => {
    setSendingId(id);
    setTimeout(() => {
      setAbandonedList(prev => prev.map(item => item.id === id ? { ...item, recoveryStatus: 'email_sent' } : item));
      setSendingId(null);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }, 600);
  };

  const totalLost = abandonedList.reduce((acc, a) => acc + a.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Abandoned Checkout Recovery Drip Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatically recover dropped checkout sessions with smart 1-hour and 24-hour email sequences and one-click 15% discount links.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AUTOPILOT DRIP ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Recoverable Revenue Pipeline</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">${totalLost.toFixed(2)} USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Captured across {abandonedList.length} shoppers</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Recovery Conversion Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">24.8%</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +6.2% vs industry avg (18%)
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Recovered Revenue This Month</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">$1,842.00 USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Direct MoR checkout conversions</div>
        </div>
      </div>

      {/* Abandoned Cart Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Customer Email</th>
                <th className="p-4 font-semibold">Product Abandoned</th>
                <th className="p-4 font-semibold">Cart Amount</th>
                <th className="p-4 font-semibold">Last Step</th>
                <th className="p-4 font-semibold">Dropped Time</th>
                <th className="p-4 font-semibold">Recovery Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {abandonedList.map((item) => (
                <tr key={item.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {item.customerEmail}
                  </td>
                  <td className="p-4 text-[#0A0D14] font-medium">
                    {item.productName}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    ${item.amount.toFixed(2)} USD
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {item.lastStep}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0]">
                    {item.abandonedAt}
                  </td>
                  <td className="p-4">
                    {item.recoveryStatus === 'email_sent' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold text-[10px] border border-blue-100 font-mono">
                        <Mail className="w-3 h-3" />
                        15% Email Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200 font-mono">
                        <Clock className="w-3 h-3" />
                        Scheduled in 15m
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {item.recoveryStatus === 'pending' ? (
                      <button
                        onClick={() => handleSendRecovery(item.id)}
                        disabled={sendingId === item.id}
                        className="opp-btn-primary px-3 py-1 text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>{sendingId === item.id ? 'Sending...' : 'Send Recovery Now'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                      </span>
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
