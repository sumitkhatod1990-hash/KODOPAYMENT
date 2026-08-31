import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Download, 
  Send, 
  RotateCcw, 
  Sparkles,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreditNotesTab: React.FC = () => {
  const [creditNotes, setCreditNotes] = useState([
    {
      id: 'cn_kodo_701',
      originalInvoiceId: 'inv_kodo_9881',
      customerEmail: 'elena.tech@berlin-ai.de',
      taxId: 'DE391029482',
      amount: 49.00,
      adjustmentAmount: 9.31,
      reason: 'Retroactive B2B EU VAT Exemption Applied (0% Reverse-Charge)',
      status: 'issued_refunded',
      issuedAt: 'Aug 28, 2026'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceId, setInvoiceId] = useState('inv_kodo_9881');
  const [taxId, setTaxId] = useState('DE391029482');
  const [adjustmentAmount, setAdjustmentAmount] = useState(9.31);
  const [reason, setReason] = useState('Retroactive Corporate Tax ID Verification');

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) return;

    const newNote = {
      id: `cn_kodo_${Date.now().toString().slice(-3)}`,
      originalInvoiceId: invoiceId,
      customerEmail,
      taxId,
      amount: 49.00,
      adjustmentAmount: Number(adjustmentAmount),
      reason,
      status: 'issued_refunded',
      issuedAt: 'Today'
    };

    setCreditNotes([newNote, ...creditNotes]);
    setCustomerEmail('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0055FF]" />
            <span>Credit Notes & Retroactive Tax Adjustments</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Issue legally compliant credit notes and adjust historical VAT/sales tax charges when customers supply corporate Tax IDs after checkout.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Adjustment Credit Note</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Credit Notes Issued</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{creditNotes.length} Issued</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Tax Authority Reconciled
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total VAT Adjusted</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">${creditNotes.reduce((acc, c) => acc + c.adjustmentAmount, 0).toFixed(2)} USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Auto-remitted adjustments</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">MoR Legal Status</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">Audit-Ready</div>
          <div className="text-[11px] text-purple-700 font-mono">PDFs archived in KODO vault</div>
        </div>
      </div>

      {/* Credit Notes Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Credit Note #</th>
                <th className="p-4 font-semibold">Original Invoice</th>
                <th className="p-4 font-semibold">Customer / Email</th>
                <th className="p-4 font-semibold">Verified Tax ID</th>
                <th className="p-4 font-semibold">Adjustment Value</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {creditNotes.map((note) => (
                <tr key={note.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {note.id}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0]">
                    {note.originalInvoiceId}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0A0D14]">
                    {note.customerEmail}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {note.taxId}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    -${note.adjustmentAmount.toFixed(2)} USD
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {note.reason}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ADJUSTED
                    </span>
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
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Issue Adjustment Credit Note</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleIssue} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Customer Email</label>
                <input
                  type="email"
                  required
                  placeholder="customer@domain.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Original Invoice ID</label>
                  <input
                    type="text"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Verified Tax ID</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Adjustment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Adjustment Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Generate Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
