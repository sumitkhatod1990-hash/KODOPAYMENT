import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Server, 
  Database, 
  Globe2,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DataResidencyAirGapTab: React.FC = () => {
  const [data] = useState({
    rbiDataResidencyCircular: '100% On-Soil Payment Storage (April 2018 Mandate)',
    primaryCloudDataCenter: 'CtrlS Tier-4 Datacenter (Mumbai, Maharashtra)',
    disasterRecoveryDataCenter: 'Yotta NM1 Sovereign Datacenter (Navi Mumbai)',
    certInSecurityAudit: 'CERT-In Empaneled Auditor Signed & Sealed',
    crossBorderMirroring: '0% Overseas Mirrored - End-to-End Encrypted',
    status: 'rbi_meity_air_gapped_secure'
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#0055FF]" />
            <span>MeitY &amp; RBI 100% Sovereign Data Residency Air-Gap Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Guaranteed 100% on-soil payment and transaction data localization conforming to RBI's April 2018 Storage of Payment System Data circular and MeitY-empaneled Tier-4 sovereign cloud infrastructure.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RBI ON-SOIL AIR-GAP CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">On-Soil Data Localization</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Domestic</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero payment data leaves Indian territory
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Sovereign Cloud Data Centers</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">CtrlS &amp; Yotta NM1</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">MeitY Empaneled Tier-4 Datacenters</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">CERT-In Security Audit</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Passed &amp; Sealed</div>
          <div className="text-[11px] text-purple-700 font-mono">Annual SAR audit submitted to RBI</div>
        </div>
      </div>

      {/* Audit Details */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <Server className="w-5 h-5 text-[#0055FF]" />
          <span>Sovereign Storage Architecture &amp; System Audit Report (SAR)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Primary Database:</span>
            <div className="font-bold text-[#0A0D14] text-sm">{data.primaryCloudDataCenter}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Disaster Recovery (DR):</span>
            <div className="font-bold text-[#0055FF] text-sm">{data.disasterRecoveryDataCenter}</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">CERT-In Audit Status:</span>
            <div className="font-bold text-emerald-700 text-sm">{data.certInSecurityAudit}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
