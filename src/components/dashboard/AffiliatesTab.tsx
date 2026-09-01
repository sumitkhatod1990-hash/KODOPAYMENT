import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  DollarSign, 
  Link2, 
  Copy, 
  CheckCircle2, 
  Plus, 
  TrendingUp, 
  Check, 
  Percent,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AffiliatesTab: React.FC = () => {
  const { affiliates, createAffiliate, settleAffiliatePayout } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [commissionRate, setCommissionRate] = useState(20);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const totalReferred = affiliates.reduce((acc, a) => acc + (a.referredVolume || 0), 0);
  const totalUnpaid = affiliates.reduce((acc, a) => acc + (a.unpaidCommissions || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    await createAffiliate({ name, email, referralCode, commissionRate });
    setName('');
    setEmail('');
    setReferralCode('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/checkout/demo_session?via=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Affiliates & Partner Program
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Track partner referral links, commission splits, and automated MoR commission payouts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Affiliate Partner</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Referred Revenue</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹{totalReferred.toLocaleString()} INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% this month
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Unpaid Commissions Due</div>
          <div className="text-2xl font-bold font-mono text-purple-700">₹{totalUnpaid.toLocaleString()} INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Auto-segregated in MoR ledger</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Affiliates</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{affiliates.length}</div>
          <div className="text-[11px] text-emerald-600 font-mono">100% compliant payout rails</div>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Partner / Affiliate</th>
                <th className="p-4 font-semibold">Referral Code / Link</th>
                <th className="p-4 font-semibold">Commission</th>
                <th className="p-4 font-semibold">Clicks</th>
                <th className="p-4 font-semibold">Conversions</th>
                <th className="p-4 font-semibold">Referred Volume</th>
                <th className="p-4 font-semibold">Unpaid Due</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {affiliates.map((aff) => (
                <tr key={aff.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{aff.name}</div>
                    <div className="text-[11px] text-[#8C90A0] font-mono">{aff.email}</div>
                  </td>
                  <td className="p-4 font-mono">
                    <button
                      onClick={() => copyLink(aff.referralCode)}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F5F8] border border-black/5 text-[#0055FF] font-bold flex items-center gap-1.5 hover:border-black/20"
                    >
                      <span>?via={aff.referralCode}</span>
                      {copiedCode === aff.referralCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="p-4 font-mono font-bold text-purple-700">
                    {aff.commissionRate}%
                  </td>
                  <td className="p-4 font-mono">{aff.clicks || 0}</td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">{aff.conversions || 0}</td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    ${(aff.referredVolume || 0).toFixed(2)}
                  </td>
                  <td className="p-4 font-mono font-bold text-purple-700">
                    ${(aff.unpaidCommissions || 0).toFixed(2)}
                  </td>
                  <td className="p-4">
                    {(aff.unpaidCommissions || 0) > 0 ? (
                      <button
                        onClick={() => settleAffiliatePayout(aff.id)}
                        className="opp-btn-secondary px-3 py-1 text-[11px] font-bold"
                      >
                        Payout
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[#8C90A0]">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Affiliate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Add Affiliate Partner</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Partner / Creator Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="david@channel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Referral Code</label>
                  <input
                    type="text"
                    placeholder="david"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toLowerCase())}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Commission (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Create Partner Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
