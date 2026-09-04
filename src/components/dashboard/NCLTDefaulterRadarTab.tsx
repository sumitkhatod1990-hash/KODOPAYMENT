import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  Building, 
  FileText,
  UserX
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NCLTDefaulterRadarTab: React.FC = () => {
  const [screenings, setScreenings] = useState([
    {
      id: 'nclt_chk_901',
      entityName: 'Apex Horizon Infrastructure Ltd',
      mcaCin: 'L45200MH2012PLC182901',
      ncltBench: 'NCLT Mumbai Bench (CIRP Case # CP(IB) 881/2026)',
      rbiDefaulterMatch: 'Clean (No RBI Wilful Tag)',
      mcaDirectorDisqualification: 'Clean DIN Status (No Sec 164(2) Defaults)',
      riskRecommendation: 'HIGH RISK - Require 100% Upfront Payment / Freeze Net-30',
      status: 'flagged_risk_intercepted'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#0055FF]" />
            <span>NCLT Insolvency (IBC) &amp; RBI Wilful Defaulter Screening Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous credit protection screening enterprise B2B customers and corporate directors against NCLT Corporate Insolvency Resolution (CIRP), MCA Section 164(2) disqualifications, and RBI Defaulter registries.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-rose-700 font-bold bg-rose-50 border-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>INSOLVENCY RISK SHIELD ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Insolvency &amp; Default Exposure</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹0.00 Bad Debt</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> High-risk post-paid terms automatically blocked
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">NCLT Court Judgments Radar</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">14 Indian Benches</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Real-time daily CIRP order tracking</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">MCA Director DIN Screening</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Verified</div>
          <div className="text-[11px] text-purple-700 font-mono">Section 164(2) non-filing checks</div>
        </div>
      </div>

      {/* Screenings Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Entity Name &amp; CIN</th>
                <th className="p-4 font-semibold">NCLT Insolvency (CIRP) Status</th>
                <th className="p-4 font-semibold">RBI Wilful Defaulter List</th>
                <th className="p-4 font-semibold">MCA DIN Disqualification</th>
                <th className="p-4 font-semibold">AI Credit Policy Recommendation</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {screenings.map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{s.entityName}</div>
                    <div className="font-mono text-[#8C90A0] text-[11px]">{s.mcaCin}</div>
                  </td>
                  <td className="p-4 font-mono text-rose-700 font-semibold text-[11px]">
                    ⚠ {s.ncltBench}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {s.rbiDefaulterMatch}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {s.mcaDirectorDisqualification}
                  </td>
                  <td className="p-4 font-mono font-bold text-rose-700 text-[11px]">
                    {s.riskRecommendation}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      <AlertTriangle className="w-3 h-3" />
                      RISK INTERCEPTED
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
