import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  FileCheck, 
  Award, 
  Zap, 
  Sparkles,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const InsuranceTab: React.FC = () => {
  const [policyActive, setPolicyActive] = useState(true);

  const policy = {
    policyNumber: 'POL-QIVROPAY-LLOYDS-99482',
    underwriter: 'Lloyds & QIVROPAY Risk Syndication LLC',
    coverageLimit: '$2,500,000.00 USD',
    status: 'active',
    reimbursementRate: '100% Guaranteed Reimbursement',
    totalClaimsPaid: '$0.00 (Zero Unrecovered Fraud)',
    effectiveDate: 'Jan 01, 2026',
    expiresDate: 'Dec 31, 2027'
  };

  const handleTogglePolicy = () => {
    setPolicyActive(!policyActive);
    if (!policyActive) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#0055FF]" />
            <span>100% Chargeback & Fraud Insurance Policy Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Underwritten institutional chargeback indemnity guaranteeing 100% refund reimbursement for unauthorized transaction disputes or stolen card attacks.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>LLOYDS SYNDICATE BACKED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Insured Policy Limit</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{policy.coverageLimit}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active Syndicate Policy
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Merchant Fraud Liability</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">0.00% Zero Liability</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% covered by QIVROPAY MoR</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Claim Payout SLA</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Instant T+0 Credit</div>
          <div className="text-[11px] text-purple-700 font-mono">No paperwork required</div>
        </div>
      </div>

      {/* Certificate Vault Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#0055FF]" />
            <span>Official Policy Endorsement Certificate</span>
          </h3>
          <button
            onClick={handleTogglePolicy}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 ${
              policyActive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${policyActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{policyActive ? 'Policy Active & Insured' : 'Policy Suspended'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Policy Identification Number:</span>
            <div className="font-bold text-[#0A0D14] text-sm">{policy.policyNumber}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Lead Underwriter Syndicate:</span>
            <div className="font-bold text-[#0A0D14] text-sm">{policy.underwriter}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Reimbursement Guarantee:</span>
            <div className="font-bold text-emerald-700 text-sm">{policy.reimbursementRate}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Coverage Term:</span>
            <div className="font-bold text-[#0055FF] text-sm">{policy.effectiveDate} – {policy.expiresDate}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
