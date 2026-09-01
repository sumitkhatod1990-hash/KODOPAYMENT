sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Discount } from '../../types';
import { Plus, Trash2, Tag, CheckCircle2 } from 'lucide-react';

export const DiscountsTab: React.FC = () => {
  const { discounts, createDiscount, deleteDiscount } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [amount, setAmount] = useState<number>(20);
  const [maxRedemptions, setMaxRedemptions] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || amount <= 0) return;
    setIsSubmitting(true);
    await createDiscount({
      code: code.toUpperCase().trim(),
      name,
      type,
      amount: Number(amount),
      maxRedemptions: Number(maxRedemptions),
      duration: 'forever'
    });
    setIsSubmitting(false);
    setShowModal(false);
    setCode('');
    setName('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
            Discounts & Coupons
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b]">
            Create promotional coupon codes for product launches, Black Friday, and developer campaigns.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="apple-btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Discount Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discounts.map((d) => (
          <div key={d.id} className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Tag className="w-5 h-5" />
                </div>

                <button
                  onClick={() => deleteDiscount(d.id)}
                  className="text-[#86868b] hover:text-red-600 p-1 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="text-xl font-mono font-black text-[#1d1d1f] tracking-wider">
                  {d.code}
                </div>
                <div className="text-xs text-[#6e6e73] font-sans mt-0.5 font-medium">
                  {d.name}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#86868b]">Discount Value:</span>
                <span className="font-bold text-[#0071e3]">
                  {d.type === 'percentage' ? `${d.amount}% OFF` : `₹${d.amount} OFF`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/5 flex justify-between items-center text-[11px] font-mono text-[#86868b]">
              <span>Redeemed: <strong>{d.redemptionCount}/{d.maxRedemptions}</strong></span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">ACTIVE</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#1d1d1f] text-lg font-heading">New Discount Code</h3>
              <button onClick={() => setShowModal(false)} className="text-[#86868b] text-sm">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Promo Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] font-mono font-bold text-sm text-[#1d1d1f] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Campaign Description</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Special 50% Off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1d1d1f]">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1d1d1f]">Amount ({type === 'percentage' ? '%' : '$'})</label>
                  <input
                    type="number"
                    min="1"
                    max={type === 'percentage' ? 100 : 1000}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] font-mono text-[#1d1d1f] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Max Redemptions</label>
                <input
                  type="number"
                  min="1"
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] font-mono text-[#1d1d1f] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-black/5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="apple-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="apple-btn-black px-5 py-2">
                  {isSubmitting ? 'Creating...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
