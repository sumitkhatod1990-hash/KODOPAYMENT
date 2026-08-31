import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartHandshake, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Activity, 
  Stethoscope,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ABDMHealthcareClaimTab: React.FC = () => {
  const [claims, setClaims] = useState([
    {
      id: 'abdm_clm_99018',
      patientName: 'Sunita Devi (ABHA ID: 91-8819-2019-4829)',
      healthcareProvider: 'AIIMS New Delhi (Ayush Grid Centre)',
      treatmentPackage: 'Advanced Cardiology Day Care (NHA PMJAY Code: MC001)',
      grossClaimValue: '₹45,000.00 INR',
      abdmEClaimApproval: '100% Cashless Adjudicated via NHA Gateway',
      disbursementLatency: '1.8 Seconds (Instant NPCI IMPS Payout)',
      status: 'cashless_claim_settled'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#0055FF]" />
            <span>Ayushman Bharat (ABDM) &amp; Ayush Grid Healthcare e-Claim Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous patient ABHA ID verification, National Health Authority (NHA) FHIR-compliant e-Claim adjudication, and instant 1.8s cashless hospital reimbursement settlement over NPCI IMPS rails.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NHA ABDM PROTOCOL CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cashless Reimbursement Settled</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹45,000.00 Disbursed</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Adjudicated via NHA Gateway
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Claim Disbursement Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">1.8 Seconds</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Instant 24x7 NPCI IMPS direct-to-hospital</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">ABHA Identity Standing</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Verified</div>
          <div className="text-[11px] text-purple-700 font-mono">FHIR R4 digital health records matched</div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Patient &amp; ABHA ID</th>
                <th className="p-4 font-semibold">Hospital Provider</th>
                <th className="p-4 font-semibold">Treatment Package</th>
                <th className="p-4 font-semibold">Claim Amount</th>
                <th className="p-4 font-semibold">Adjudication Status</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{c.patientName}</div>
                    <div className="font-mono text-[#8C90A0] text-[10px]">{c.id}</div>
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {c.healthcareProvider}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    {c.treatmentPackage}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {c.grossClaimValue}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {c.abdmEClaimApproval}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      SETTLED
                    </span>
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
