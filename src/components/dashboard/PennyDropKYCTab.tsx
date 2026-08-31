import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Sparkles, 
  Zap, 
  KeyRound,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PennyDropKYCTab: React.FC = () => {
  const [kycs, setKycs] = useState([
    {
      id: 'pny_kyc_8819',
      accountNumber: '•••• •••• 9812',
      ifsc: 'HDFC0000240 (HDFC Bank, Koramangala)',
      bankBeneficiaryName: 'KODO LABS TECHNOLOGIES INDIA PVT LTD',
      pennyCreditStatus: '₹1.00 Credited via IMPS',
      nameMatchScore: '100% Exact Match',
      kycStatus: 'verified_active'
    }
  ]);

  const [simulating, setSimulating] = useState(false);

  const handleSimulatePennyDrop = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#0055FF]" />
            <span>Instant Bank Penny-Drop KYC &amp; DigiLocker Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Verify Indian bank account ownership in real-time by crediting ₹1 via IMPS, retrieving NPCI bank beneficiary records, and matching against MCA CIN and DigiLocker KYC records.
          </p>
        </div>

        <button
          onClick={handleSimulatePennyDrop}
          disabled={simulating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          <span>{simulating ? 'Dropping ₹1 Penny...' : 'Test ₹1 Bank Penny Drop'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Penny Drop Bank Verification</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Real-Time</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live IMPS beneficiary name fetch
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DigiLocker / MCA Name Match</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Fuzzy &amp; Exact Match</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero payout misdirection risk</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Merchant Onboarding Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 3.2s Instant</div>
          <div className="text-[11px] text-purple-700 font-mono">Instant payout clearance</div>
        </div>
      </div>

      {/* KYC Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Bank Account</th>
                <th className="p-4 font-semibold">IFSC &amp; Branch</th>
                <th className="p-4 font-semibold">Bank Registered Beneficiary Name</th>
                <th className="p-4 font-semibold">Penny Drop Status</th>
                <th className="p-4 font-semibold">Name Match Score</th>
                <th className="p-4 font-semibold">KYC Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {kycs.map((k) => (
                <tr key={k.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {k.accountNumber}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {k.ifsc}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {k.bankBeneficiaryName}
                  </td>
                  <td className="p-4 text-emerald-700 font-mono font-semibold">
                    ✓ {k.pennyCreditStatus}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {k.nameMatchScore}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      PAYOUTS UNLOCKED
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
