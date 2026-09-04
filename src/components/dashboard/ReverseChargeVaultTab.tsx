import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Globe2, 
  Lock, 
  Building,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReverseChargeVaultTab: React.FC = () => {
  const [certs, setCerts] = useState([
    {
      id: 'tax_cert_vies_881',
      buyerCompany: 'München AI Systems GmbH',
      vatId: 'DE301928471',
      databaseValidated: 'European Commission VIES',
      reverseChargeApplied: true,
      auditTimestamp: 'Aug 28, 2026 14:22:01 UTC',
      status: 'statutory_proof_verified'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0055FF]" />
            <span>B2B Reverse-Charge Tax Audit Certificate Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Cryptographic timestamped audit log of all EU VIES &amp; UK HMRC VAT validations guaranteeing 100% statutory tax exemption proof and zero merchant tax audit liability.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% STATUTORY AUDIT INSULATION</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cryptographic Audit Certificates</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Validated</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Real-Time VIES Consultation Logs
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Merchant Audit Liability</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">0.00% Zero Risk</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% absorbed by QIVROPAY MoR</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Validation Authority</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">EU VIES &amp; UK HMRC</div>
          <div className="text-[11px] text-purple-700 font-mono">Official government API proof</div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Certificate ID</th>
                <th className="p-4 font-semibold">Buyer Enterprise</th>
                <th className="p-4 font-semibold">Validated Corporate VAT ID</th>
                <th className="p-4 font-semibold">Statutory Authority</th>
                <th className="p-4 font-semibold">Audit Timestamp</th>
                <th className="p-4 font-semibold">Tax Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {c.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.buyerCompany}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {c.vatId}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {c.databaseValidated}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {c.auditTimestamp}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      REVERSE CHARGE (0% VAT)
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
