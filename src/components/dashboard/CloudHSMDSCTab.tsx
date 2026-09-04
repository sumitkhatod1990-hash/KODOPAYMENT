import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSignature, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  FileText, 
  Clock,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CloudHSMDSCTab: React.FC = () => {
  const [signatures, setSignatures] = useState([
    {
      id: 'dsc_sig_88201',
      documentTitle: 'Enterprise MSA & SLA Contract (Infosys BPM)',
      certifyingAuthority: 'eMudhra / NSDL Class-3 Cloud HSM',
      signerName: 'Aakash Sharma (Director - DIN 08918273)',
      timestamp: '2026-08-31 11:45:12 IST',
      cryptoHash: 'SHA-256 (0x77c29e18a901...) Verified',
      status: 'it_act_2000_legally_binding'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-[#0055FF]" />
            <span>Cloud HSM Class-3 Digital Signature Certificate (DSC) Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Legally enforceable digital document signing under Section 5 of the Information Technology Act 2000 using FIPS 140-2 Level-3 Cloud Hardware Security Modules (HSMs).
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CCA INDIA RECOGNIZED CLASS-3 DSC</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cryptographic Key Security</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">FIPS 140-2 Level 3</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Hardware-isolated private keys
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Legal Enforceability</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% IT Act 2000</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Admissible across all Indian Courts</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Signing Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 1.5 Seconds</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero physical USB crypto-token required</div>
        </div>
      </div>

      {/* Signatures Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Document Reference</th>
                <th className="p-4 font-semibold">Signatory Name &amp; DIN</th>
                <th className="p-4 font-semibold">Certifying Authority</th>
                <th className="p-4 font-semibold">Cryptographic SHA-256 Hash</th>
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {signatures.map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {s.documentTitle}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {s.signerName}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    {s.certifyingAuthority}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 text-[11px]">
                    {s.cryptoHash}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0]">
                    {s.timestamp}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      LEGALLY BOUND
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
