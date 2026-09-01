sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  UploadCloud, 
  Send, 
  Sparkles, 
  Clock, 
  AlertTriangle,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DisputesTab: React.FC = () => {
  const { user } = useAuth();
  const [disputesList, setDisputesList] = useState(() => user?.email === 'demo@qivropay.com' ? [
    {
      id: 'dp_qivropay_01',
      transactionId: 'tx_qivropay_9881',
      amount: 49.00,
      currency: 'INR',
      reason: 'Fraudulent Claim (Unrecognized Charge)',
      status: 'under_review',
      evidenceStatus: 'ai_compiled_ready',
      customerEmail: 'alex.chen@synthflow.ai',
      disputeDeadline: 'In 4 days',
      evidenceScore: '98% Win Probability (3DS 2.0 Biometric + Server Log Trace)'
    }
  ] : []);

  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleSubmitEvidence = (id: string) => {
    setSubmittingId(id);
    setTimeout(() => {
      setDisputesList(prev => prev.map(d => d.id === id ? { ...d, status: 'won_settled', evidenceStatus: 'evidence_submitted_won' } : d));
      setSubmittingId(null);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Automated Chargeback Defense AI & Dispute Shield
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            QIVROPAY Merchant of Record insulates 100% of chargeback financial liabilities while our AI automatically compiles forensic evidence packages for card networks.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% MoR INSULATED GUARANTEE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Merchant Liability Loss</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹0.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono">Covered completely by QIVROPAY MoR</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">AI Dispute Win Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">94.2%</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Card network rebuttal benchmarks</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Open Inquiries</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{disputesList.filter(d => d.status !== 'won_settled').length}</div>
          <div className="text-[11px] text-purple-700 font-mono">AI Evidence Prepared</div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Dispute ID / Tx</th>
                <th className="p-4 font-semibold">Customer / Email</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Network Reason</th>
                <th className="p-4 font-semibold">AI Evidence Assessment</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {disputesList.map((dp) => (
                <tr key={dp.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14] font-mono">{dp.id}</div>
                    <div className="text-[10px] text-[#8C90A0] font-mono">{dp.transactionId}</div>
                  </td>
                  <td className="p-4 font-mono">
                    <div className="text-[#0A0D14] font-semibold">{dp.customerEmail}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    ${dp.amount.toFixed(2)} INR
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {dp.reason}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-semibold text-[11px]">
                    {dp.evidenceScore}
                  </td>
                  <td className="p-4">
                    {dp.status === 'won_settled' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        WON & SETTLED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                        UNDER REVIEW
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {dp.status !== 'won_settled' ? (
                      <button
                        onClick={() => handleSubmitEvidence(dp.id)}
                        disabled={submittingId === dp.id}
                        className="opp-btn-primary px-3 py-1 text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{submittingId === dp.id ? 'Submitting...' : 'Submit AI Evidence'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Protected
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
