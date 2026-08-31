import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Play, 
  Coins, 
  ArrowUpRight,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CashfreeENACHMandatesTab: React.FC = () => {
  const [mandates, setMandates] = useState<any[]>([
    {
      id: 'mnd_cf_99104',
      customerName: 'Infosys Enterprise Solutions Ltd',
      customerEmail: 'finance@infosys.com',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '••••••••8912',
      maxAmount: '₹50,000.00',
      recurringAmount: '₹19,999.00',
      frequency: 'Monthly',
      authMode: 'NetBanking (NPCI e-Sign)',
      umrn: 'HDFC702026083100918',
      status: 'ACTIVE',
      nextDebitDate: '15 Sep 2026'
    },
    {
      id: 'mnd_cf_99105',
      customerName: 'Zomato Media Pvt Ltd',
      customerEmail: 'billing@zomato.com',
      bankName: 'ICICI Bank Ltd',
      accountNumber: '••••••••4402',
      maxAmount: '₹1,00,000.00',
      recurringAmount: '₹49,999.00',
      frequency: 'Monthly',
      authMode: 'Debit Card OTP',
      umrn: 'ICIC702026083100412',
      status: 'ACTIVE',
      nextDebitDate: '20 Sep 2026'
    },
    {
      id: 'mnd_cf_99106',
      customerName: 'Razorpay Software Pvt Ltd',
      customerEmail: 'accounts@razorpay.com',
      bankName: 'State Bank of India',
      accountNumber: '••••••••1190',
      maxAmount: '₹25,000.00',
      recurringAmount: '₹9,999.00',
      frequency: 'Quarterly',
      authMode: 'Aadhaar e-Sign',
      umrn: 'SBIN702026083100771',
      status: 'ACTIVE',
      nextDebitDate: '01 Oct 2026'
    }
  ]);

  const [isTriggeringDebit, setIsTriggeringDebit] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '',
    ifscCode: 'HDFC0000240',
    maxAmount: 50000,
    recurringAmount: 14999,
    authMode: 'NetBanking (NPCI)'
  });

  const handleTriggerDebit = (id: string) => {
    setIsTriggeringDebit(id);
    setTimeout(() => {
      setIsTriggeringDebit(null);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 1200);
  };

  const handleCreateMandate = (e: React.FormEvent) => {
    e.preventDefault();
    const newMandate = {
      id: `mnd_cf_${Date.now().toString().slice(-5)}`,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      bankName: formData.bankName,
      accountNumber: `••••••••${formData.accountNumber.slice(-4) || '9912'}`,
      maxAmount: `₹${Number(formData.maxAmount).toLocaleString('en-IN')}.00`,
      recurringAmount: `₹${Number(formData.recurringAmount).toLocaleString('en-IN')}.00`,
      frequency: 'Monthly',
      authMode: formData.authMode,
      umrn: `NPCI${Date.now().toString().slice(-10)}`,
      status: 'ACTIVE',
      nextDebitDate: '05 Oct 2026'
    };
    setMandates(prev => [newMandate, ...prev]);
    setShowCreateModal(false);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#0055FF]" />
            <span>Cashfree e-NACH &amp; NetBanking Mandates Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Recurring enterprise SaaS auto-debit across 55+ Indian scheduled commercial banks with automated NPCI UMRN registration.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New e-NACH Mandate</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active e-NACH Float Volume</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹1,74,997.00</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% On-Time Auto-Debit SLA</span>
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Supported Indian Banks</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">55+ Banks</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">
            HDFC, ICICI, SBI, Axis, Kotak, PNB
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Mandate Success Rate</div>
          <div className="text-2xl font-bold font-mono text-purple-700">99.4%</div>
          <div className="text-[11px] text-purple-700 font-mono">
            NPCI e-Sign &amp; Debit Card OTP
          </div>
        </div>
      </div>

      {/* Mandates Table */}
      <div className="opp-card overflow-hidden">
        <div className="p-4 border-b border-black/[0.06] bg-[#FAFBFD] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[#0A0D14] uppercase tracking-wider font-mono">
            Registered Enterprise e-NACH Mandates
          </h3>
          <span className="text-xs font-mono text-emerald-600">● Real-Time NACH Gateway</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Corporate Customer</th>
                <th className="p-4 font-semibold">Bank / Account</th>
                <th className="p-4 font-semibold">UMRN Number</th>
                <th className="p-4 font-semibold">Recurring Debit</th>
                <th className="p-4 font-semibold">Max Limit</th>
                <th className="p-4 font-semibold">Next Debit</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {mandates.map(m => (
                <tr key={m.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{m.customerName}</div>
                    <div className="text-[11px] text-[#8C90A0] font-mono">{m.customerEmail}</div>
                  </td>
                  <td className="p-4 font-mono">
                    <div className="font-bold text-[#0A0D14]">{m.bankName}</div>
                    <div className="text-[10px] text-[#8C90A0]">{m.accountNumber} • {m.authMode}</div>
                  </td>
                  <td className="p-4 font-mono text-[11px] font-bold text-[#0055FF]">
                    {m.umrn}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {m.recurringAmount} <span className="text-[10px] text-[#8C90A0]">/ {m.frequency}</span>
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {m.maxAmount}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">
                    {m.nextDebitDate}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTriggerDebit(m.id)}
                      disabled={isTriggeringDebit === m.id}
                      className="opp-btn-secondary px-3 py-1.5 text-[11px] font-bold gap-1"
                    >
                      <Play className={`w-3 h-3 fill-current ${isTriggeringDebit === m.id ? 'animate-spin' : ''}`} />
                      <span>{isTriggeringDebit === m.id ? 'Debiting...' : 'Trigger Debit'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">
                Register New e-NACH Direct Bank Mandate
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMandate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Corporate Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Consultancy Services Ltd"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Finance / Billing Email</label>
                <input
                  type="email"
                  required
                  placeholder="finance@tcs.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Select Bank</label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                  >
                    <option value="HDFC Bank Ltd">HDFC Bank Ltd</option>
                    <option value="ICICI Bank Ltd">ICICI Bank Ltd</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank Ltd">Axis Bank Ltd</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Bank Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="50200088192019"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Monthly Debit Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.recurringAmount}
                    onChange={(e) => setFormData({ ...formData, recurringAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Max Mandate Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="opp-btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="opp-btn-primary px-5 py-2 font-semibold"
                >
                  Initiate NPCI e-Mandate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
