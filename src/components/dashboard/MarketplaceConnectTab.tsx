import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Split, 
  Users, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MarketplaceConnectTab: React.FC = () => {
  const [vendors, setVendors] = useState([
    {
      id: 'ven_kodo_01',
      name: 'NeuralVoice Plugins Inc.',
      email: 'partners@neuralvoice.ai',
      platformFeePercent: 15,
      grossSales: 14280.00,
      vendorPayoutDue: 12138.00,
      platformCommissionEarned: 2142.00,
      status: 'verified',
      payoutMethod: 'US Bank (••••4190)'
    },
    {
      id: 'ven_kodo_02',
      name: 'Autonomous Vision Models LLC',
      email: 'billing@autovision.io',
      platformFeePercent: 10,
      grossSales: 8950.00,
      vendorPayoutDue: 8055.00,
      platformCommissionEarned: 895.00,
      status: 'verified',
      payoutMethod: 'SEPA Bank (••••7821)'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feePercent, setFeePercent] = useState(15);
  const [payoutMethod, setPayoutMethod] = useState('US Bank (••••5521)');

  const totalGross = vendors.reduce((acc, v) => acc + v.grossSales, 0);
  const totalCommission = vendors.reduce((acc, v) => acc + v.platformCommissionEarned, 0);
  const totalVendorDue = vendors.reduce((acc, v) => acc + v.vendorPayoutDue, 0);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const newVendor = {
      id: `ven_kodo_${Date.now()}`,
      name,
      email,
      platformFeePercent: Number(feePercent),
      grossSales: 0,
      vendorPayoutDue: 0,
      platformCommissionEarned: 0,
      status: 'verified',
      payoutMethod
    };
    setVendors([newVendor, ...vendors]);
    setName('');
    setEmail('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handlePayoutVendor = (vendorId: string) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, vendorPayoutDue: 0 } : v));
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Marketplace Multi-Vendor Connect & Split Payouts
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Power platforms and plugin stores: automatically split single buyer payments between platform take-rate and vendor sub-accounts with zero tax risk.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Sub-Account Vendor</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Marketplace Gross Volume</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">${totalGross.toLocaleString()} USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Across {vendors.length} connected vendors
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Platform Net Commission Earned</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">${totalCommission.toLocaleString()} USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% pure profit retained</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Vendor Payouts Pending</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">${totalVendorDue.toLocaleString()} USD</div>
          <div className="text-[11px] text-purple-700 font-mono">Automated T+2 bank deposits</div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Vendor / Sub-Account</th>
                <th className="p-4 font-semibold">Platform Fee Cut</th>
                <th className="p-4 font-semibold">Gross Sales</th>
                <th className="p-4 font-semibold">Platform Earned</th>
                <th className="p-4 font-semibold">Vendor Payout Due</th>
                <th className="p-4 font-semibold">Payout Account</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14] font-heading text-sm">{vendor.name}</div>
                    <div className="text-[11px] text-[#8C90A0] font-mono">{vendor.email}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-purple-700">
                    {vendor.platformFeePercent}% Platform
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    ${vendor.grossSales.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    +${vendor.platformCommissionEarned.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    ${vendor.vendorPayoutDue.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono text-xs text-[#6E717D]">
                    {vendor.payoutMethod}
                  </td>
                  <td className="p-4">
                    {vendor.vendorPayoutDue > 0 ? (
                      <button
                        onClick={() => handlePayoutVendor(vendor.id)}
                        className="opp-btn-secondary px-3 py-1 text-[11px] font-bold"
                      >
                        Payout Vendor
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[#8C90A0] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled
                      </span>
                    )}
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
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Onboard Sub-Account Vendor</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Vendor / Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Prompt Studios Ltd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Vendor Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="billing@promptstudios.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Platform Fee (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={feePercent}
                    onChange={(e) => setFeePercent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Payout Destination</label>
                  <input
                    type="text"
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Provision Sub-Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
