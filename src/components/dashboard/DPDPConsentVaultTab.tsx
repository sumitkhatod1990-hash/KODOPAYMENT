import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Lock, 
  FileText, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DPDPConsentVaultTab: React.FC = () => {
  const [consents, setConsents] = useState([
    {
      id: 'dpdp_cns_8819',
      dataPrincipal: 'Rahul V. Sharma',
      consentArtifactId: 'sahamati_cns_99018271',
      purpose: 'Real-Time Financial Telemetry for SaaS Working Capital',
      validUntil: 'Aug 31, 2027',
      cryptoPurgeStatus: 'Zero Leftover Trace / SHA-256 Verified',
      status: 'active_consent_granted'
    }
  ]);

  const [purging, setPurging] = useState(false);

  const handleSimulatePurge = () => {
    setPurging(true);
    setTimeout(() => {
      setPurging(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#0055FF]" />
            <span>DPDP Act 2023 &amp; Sahamati AA Consent Revocation Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous compliance with India's Digital Personal Data Protection Act 2023 and Sahamati Account Aggregator consent guidelines, enabling instant Data Principal consent pause, revocation, and cryptographic data purging.
          </p>
        </div>

        <button
          onClick={handleSimulatePurge}
          disabled={purging}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4 text-rose-300" />
          <span>{purging ? 'Cryptographically Purging...' : 'Execute Data Principal Right-to-Erasure'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DPDP Act Compliance Rating</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Compliant</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero regulatory penalty exposure (₹250 Cr cap)
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Data Erasure Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 100ms Purge</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Cryptographic database row shredding</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Sahamati AA Consent Audit</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Active Certified</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time consent revocation webhooks</div>
        </div>
      </div>

      {/* Consents Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Data Principal (User)</th>
                <th className="p-4 font-semibold">Sahamati Consent Artifact</th>
                <th className="p-4 font-semibold">Permitted Purpose</th>
                <th className="p-4 font-semibold">Validity Date</th>
                <th className="p-4 font-semibold">Cryptographic Purge Status</th>
                <th className="p-4 font-semibold">DPDP Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {consents.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.dataPrincipal}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {c.consentArtifactId}
                  </td>
                  <td className="p-4 text-[#0A0D14] max-w-xs">
                    {c.purpose}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {c.validUntil}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 text-[11px]">
                    ✓ {c.cryptoPurgeStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DPDP COMPLIANT
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
