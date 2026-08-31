import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Download, 
  Send, 
  CreditCard, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const B2BInvoicesTab: React.FC = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'inv_b2b_1001',
      companyName: 'Synthetix Global Corp',
      taxId: 'US-EIN-94-3829104',
      amount: 12500.00,
      currency: 'USD',
      terms: 'Net 30',
      status: 'sent',
      dueDate: '2026-09-30',
      virtualIban: 'US84 KODO 0192 8847 2910 44',
      items: ['Enterprise AI Gateway Dedicated Cluster (Annual License)', 'Custom SLA & 24/7 Support']
    },
    {
      id: 'inv_b2b_1002',
      companyName: 'Nordic Autonomous Systems AB',
      taxId: 'SE556012345601',
      amount: 8400.00,
      currency: 'EUR',
      terms: 'Net 15',
      status: 'paid',
      dueDate: '2026-08-25',
      virtualIban: 'DE89 KODO 0044 0532 0130 99',
      items: ['Self-Hosted On-Premise GPU Nodes (5 Seats)']
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [amount, setAmount] = useState(5000);
  const [currency, setCurrency] = useState('USD');
  const [terms, setTerms] = useState('Net 30');
  const [itemName, setItemName] = useState('Custom Enterprise AI Integration');

  const totalOutstanding = invoices.filter(i => i.status === 'sent').reduce((acc, i) => acc + i.amount, 0);
  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !amount) return;

    const newInv = {
      id: `inv_b2b_${Date.now().toString().slice(-4)}`,
      companyName,
      taxId: taxId || 'US-EIN-PENDING',
      amount: Number(amount),
      currency,
      terms,
      status: 'sent',
      dueDate: '2026-09-30',
      virtualIban: `US84 KODO 0192 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 44`,
      items: [itemName]
    };

    setInvoices([newInv, ...invoices]);
    setCompanyName('');
    setTaxId('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleMarkPaid = (id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv));
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            B2B Enterprise Invoicing & Virtual Bank Accounts (vIBAN)
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Close high-ticket enterprise software deals with Net-30/60 commercial invoices, corporate tax verification, and automated wire transfer reconciliation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue B2B Enterprise Invoice</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Outstanding B2B Accounts Receivable</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">${totalOutstanding.toLocaleString()} USD</div>
          <div className="text-[11px] text-purple-700 font-mono">Net 30 & Net 60 Terms Active</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Settled B2B Wire Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">${totalCollected.toLocaleString()} USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Reconciled via vIBAN
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Corporate Tax Insulation</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Tax Nexus</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">US EIN, EU VAT & GSTIN Compliant</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Invoice #</th>
                <th className="p-4 font-semibold">Enterprise Client</th>
                <th className="p-4 font-semibold">Tax ID (EIN / VAT)</th>
                <th className="p-4 font-semibold">Amount & Currency</th>
                <th className="p-4 font-semibold">Payment Terms</th>
                <th className="p-4 font-semibold">Dedicated Virtual IBAN</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {inv.id}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{inv.companyName}</div>
                    <div className="text-[10px] text-[#8C90A0]">{inv.items[0]}</div>
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {inv.taxId}
                  </td>
                  <td className="p-4 font-mono font-bold text-base text-[#0A0D14]">
                    ${inv.amount.toLocaleString()} {inv.currency}
                  </td>
                  <td className="p-4 font-mono text-purple-700 font-semibold">
                    {inv.terms} (Due {inv.dueDate})
                  </td>
                  <td className="p-4 font-mono text-[11px] text-[#0055FF] font-semibold">
                    {inv.virtualIban}
                  </td>
                  <td className="p-4">
                    {inv.status === 'paid' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        PAID & RECONCILED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold text-[10px] border border-blue-200">
                        SENT • PENDING WIRE
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {inv.status !== 'paid' ? (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        className="opp-btn-secondary px-3 py-1 text-[11px] font-bold"
                      >
                        Mark Wire Received
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">✓ Settled</span>
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
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Create B2B Enterprise Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Company / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI Technologies Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Tax ID (EIN / VAT)</label>
                  <input
                    type="text"
                    placeholder="US-EIN-94-382..."
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Payment Terms</label>
                  <select
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-semibold text-[#0A0D14]"
                  >
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Invoice Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Line Item Description</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Generate & Send Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
