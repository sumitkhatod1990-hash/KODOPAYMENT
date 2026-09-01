sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CardIssuingTab: React.FC = () => {
  const [cards, setCards] = useState([
    {
      id: 'crd_qivropay_001',
      cardholderName: 'Autonomous AI Agent #04',
      last4: '8841',
      exp: '08/29',
      brand: 'Visa Business Corporate',
      spendLimitMonthly: 5000.00,
      spentThisMonth: 1420.50,
      status: 'active',
      type: 'virtual'
    },
    {
      id: 'crd_qivropay_002',
      cardholderName: 'DevOps Cluster Infra',
      last4: '4291',
      exp: '11/28',
      brand: 'Mastercard Commercial',
      spendLimitMonthly: 10000.00,
      spentThisMonth: 3820.00,
      status: 'active',
      type: 'virtual'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [spendLimitMonthly, setSpendLimitMonthly] = useState(5000);
  const [brand, setBrand] = useState('Visa Business Corporate');

  const handleIssueCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardholderName) return;

    const newCard = {
      id: `crd_qivropay_${Date.now().toString().slice(-3)}`,
      cardholderName,
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      exp: '12/29',
      brand,
      spendLimitMonthly: Number(spendLimitMonthly),
      spentThisMonth: 0,
      status: 'active',
      type: 'virtual'
    };

    setCards([newCard, ...cards]);
    setCardholderName('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const toggleFreeze = (id: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'frozen' : 'active' } : c));
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#0055FF]" />
            <span>Virtual Corporate Card Issuing Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Issue instant virtual Visa & Mastercard debit cards directly from your merchant balance to team members, cloud infrastructure, and autonomous AI agents.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Virtual Card</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Issued Cards</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{cards.length} Cards Active</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Funded via Merchant Float
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Monthly Spend Limit Pool</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹{cards.reduce((acc, c) => acc + c.spendLimitMonthly, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Real-time spend controls</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Spent This Month</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹{cards.reduce((acc, c) => acc + c.spentThisMonth, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} INR</div>
          <div className="text-[11px] text-purple-700 font-mono">0% FX markup on global spend</div>
        </div>
      </div>

      {/* Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
              card.status === 'active' 
                ? 'bg-gradient-to-br from-[#0A0D14] to-[#1E2330] text-white shadow-xl border-black/10' 
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase opacity-75">QIVROPAY COMMERCIAL</span>
                <h4 className="text-base font-bold font-heading pt-1">{card.cardholderName}</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-white/10 text-white">
                {card.brand.includes('Visa') ? 'VISA' : 'MASTERCARD'}
              </span>
            </div>

            <div className="py-8 font-mono text-xl tracking-widest">
              •••• •••• •••• {card.last4}
            </div>

            <div className="flex justify-between items-end text-xs font-mono">
              <div>
                <span className="text-[9px] uppercase opacity-60 block">EXPIRY</span>
                <span>{card.exp}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase opacity-60 block">MONTHLY SPEND</span>
                <span className="text-emerald-400 font-bold">₹{card.spentThisMonth.toFixed(2)} / ${card.spendLimitMonthly.toFixed(2)}</span>
              </div>
              <button
                onClick={() => toggleFreeze(card.id)}
                className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                {card.status === 'active' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{card.status === 'active' ? 'Freeze' : 'Unfreeze'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Issue Virtual Corporate Card</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleIssueCard} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Cardholder / Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Workflow Worker #07"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Monthly Spend Limit (₹)</label>
                  <input
                    type="number"
                    value={spendLimitMonthly}
                    onChange={(e) => setSpendLimitMonthly(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Card Network</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-semibold text-[#0A0D14]"
                  >
                    <option value="Visa Business Corporate">Visa Business Corporate</option>
                    <option value="Mastercard Commercial">Mastercard Commercial</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Instant Issue Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
