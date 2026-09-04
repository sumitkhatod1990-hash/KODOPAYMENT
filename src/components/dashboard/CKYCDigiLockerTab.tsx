import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Fingerprint, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  FileText, 
  Users,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CKYCDigiLockerTab: React.FC = () => {
  const [records, setRecords] = useState([
    {
      id: 'ckyc_rec_8819',
      directorName: 'Rajesh Vardhan Rao',
      ckycNumber: '40019284719281',
      panNumber: 'AAACR9821K',
      digiLockerStatus: 'DigiLocker Aadhaar XML Verified',
      cersaiRegistryStatus: 'CERSAI Active Validated',
      status: 'kyc_cleared_for_onboarding'
    }
  ]);

  const [verifying, setVerifying] = useState(false);

  const handleVerifyCKYC = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-[#0055FF]" />
            <span>RBI Central KYC (CKYC) &amp; DigiLocker 2.0 Instant ID Verifier</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct paperless onboarding for Indian enterprise directors, high-ticket buyers, and merchants via CERSAI 14-digit CKYC Registry and DigiLocker offline XML verification.
          </p>
        </div>

        <button
          onClick={handleVerifyCKYC}
          disabled={verifying}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>{verifying ? 'Querying CERSAI...' : 'Simulate 14-Digit CKYC Lookup'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">CKYC Registry Verification Speed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">&lt; 8.5 Seconds</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero document upload needed
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DigiLocker XML Integrity</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Cryptographic</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">UIDAI digital signature verified</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">RBI Compliance Audit</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Fully Certified</div>
          <div className="text-[11px] text-purple-700 font-mono">Meets Master Direction on KYC (2016)</div>
        </div>
      </div>

      {/* Records Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Director / Entity Name</th>
                <th className="p-4 font-semibold">14-Digit CKYC Number</th>
                <th className="p-4 font-semibold">NSDL PAN</th>
                <th className="p-4 font-semibold">DigiLocker Aadhaar XML</th>
                <th className="p-4 font-semibold">CERSAI Status</th>
                <th className="p-4 font-semibold">KYC Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {r.directorName}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF] text-sm">
                    {r.ckycNumber}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {r.panNumber}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {r.digiLockerStatus}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {r.cersaiRegistryStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      KYC VERIFIED
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
