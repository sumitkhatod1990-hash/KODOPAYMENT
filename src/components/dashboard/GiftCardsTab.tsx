sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Gift, 
  Plus, 
  CheckCircle2, 
  Copy, 
  Check, 
  Mail, 
  DollarSign, 
  Sparkles,
  Send,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GiftCardsTab: React.FC = () => {
  const [giftCards, setGiftCards] = useState([
    {
      id: 'gc_qivropay_01',
      code: 'GIFT-QIVROPAY-9812-PRO',
      initialAmount: 100.00,
      currentBalance: 71.00,
      currency: 'INR',
      recipientEmail: 'sarah.dev@promptworks.io',
      senderName: 'Alex Founder',
      status: 'active',
      createdAt: 'Aug 28, 2026'
    },
    {
      id: 'gc_qivropay_02',
      code: 'GIFT-QIVROPAY-4410-VIP',
      initialAmount: 50.00,
      currentBalance: 50.00,
      currency: 'INR',
      recipientEmail: 'jason@hyperstack.ai',
      senderName: 'Elena Marketing',
      status: 'active',
      createdAt: 'Aug 29, 2026'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState(50);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('QIVROPAY Team');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const totalIssued = giftCards.reduce((acc, g) => acc + g.initialAmount, 0);
  const totalBalance = giftCards.reduce((acc, g) => acc + g.currentBalance, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !amount) return;

    const newCard = {
      id: `gc_qivropay_${Date.now().toString().slice(-4)}`,
      code: `GIFT-QIVROPAY-₹{Math.floor(1000 + Math.random() * 9000)}-VIP`,
      initialAmount: Number(amount),
      currentBalance: Number(amount),
      currency: 'INR',
      recipientEmail,
      senderName,
      status: 'active',
      createdAt: 'Just now'
    };

    setGiftCards([newCard, ...giftCards]);
    setRecipientEmail('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Digital Gift Cards & Store Credit Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Issue branded digital gift cards, reward customer loyalty, and offer instant promotional wallet credits.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Digital Gift Card</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Gift Volume Issued</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹{totalIssued.toFixed(2)} INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Across {giftCards.length} recipients
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Outstanding Unclaimed Balance</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹{totalBalance.toFixed(2)} INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Store credit liability in MoR</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Redemption Rate</div>
          <div className="text-2xl font-bold font-mono text-purple-700">68.4%</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">High viral recipient lift</div>
        </div>
      </div>

      {/* Gift Cards Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Claim Code</th>
                <th className="p-4 font-semibold">Recipient Email</th>
                <th className="p-4 font-semibold">Sender / Campaign</th>
                <th className="p-4 font-semibold">Initial Value</th>
                <th className="p-4 font-semibold">Remaining Balance</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {giftCards.map((gc) => (
                <tr key={gc.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono">
                    <button
                      onClick={() => copyCode(gc.code)}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F5F8] border border-black/5 text-[#0055FF] font-bold flex items-center gap-1.5 hover:border-black/20"
                    >
                      <span>{gc.code}</span>
                      {copiedCode === gc.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14] font-semibold">
                    {gc.recipientEmail}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {gc.senderName}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    ${gc.initialAmount.toFixed(2)} INR
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    ${gc.currentBalance.toFixed(2)} INR
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      ACTIVE
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => alert(`Gift card claim instructions dispatched to ${gc.recipientEmail}`)}
                      className="opp-btn-secondary px-3 py-1 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3 text-[#0055FF]" />
                      <span>Resend Email</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Issue Digital Gift Card</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Recipient Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@domain.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Gift Amount (₹)</label>
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Sender Name / Note</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Generate & Send Gift Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
