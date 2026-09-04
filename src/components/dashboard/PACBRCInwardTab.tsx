import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  FileText, 
  Building2,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PACBRCInwardTab: React.FC = () => {
  const [realizations, setRealizations] = useState([
    {
      id: 'pacb_ebrc_9901',
      foreignBuyer: 'Vortex Global Labs LLC (California)',
      inwardRemittanceUsd: '₹24,500.00 INR',
      inrRealized: '₹20,45,750.00 INR',
      eBrcNumber: 'DGFT-EBRC-881920198',
      fircCertNo: 'SCB-FIRC-2026-99018',
      dgftPortalStatus: 'DGFT Export EDPMS Realized',
      status: 'rbi_pacb_fully_realized'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-[#0055FF]" />
            <span>RBI Cross-Border Payment Aggregator (PA-CB) &amp; e-BRC / FIRC Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous inward export realization under RBI PA-CB Master Directions, generating electronic Bank Realisation Certificates (e-BRC) and Foreign Inward Remittance Certificates (FIRC) with DGFT EDPMS synchronization.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RBI PA-CB &amp; DGFT E-BRC CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Inward Export Realization</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹24,500.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> INR realized into Indian Current Account
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DGFT e-BRC Status</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Digitally Signed</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Real-time EDPMS IRM reconciliation</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">FIRC Tax Certificate</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Auto-Generated</div>
          <div className="text-[11px] text-purple-700 font-mono">Proof of foreign inward remittance</div>
        </div>
      </div>

      {/* Realizations Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Foreign Buyer Entity</th>
                <th className="p-4 font-semibold">Inward Foreign Currency</th>
                <th className="p-4 font-semibold">INR Realized</th>
                <th className="p-4 font-semibold">DGFT e-BRC #</th>
                <th className="p-4 font-semibold">Bank FIRC Document #</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {realizations.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {r.foreignBuyer}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {r.inwardRemittanceUsd}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {r.inrRealized}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {r.eBrcNumber}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {r.fircCertNo}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      EDPMS REALIZED
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
