import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Rocket, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Globe2, 
  Satellite, 
  Coins,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const INSpacePayloadEscrowTab: React.FC = () => {
  const [payloads, setPayloads] = useState([
    {
      id: 'insp_ld_99018',
      satelliteMission: 'NavSat-3B Synthetic Aperture Radar (SAR)',
      spaceStartup: 'SkyOrbital Technologies India Pvt Ltd',
      inspaceAuthNumber: 'IN-SPACE/AUTH/2026/0918',
      launchVehicle: 'ISRO SSLV-D4 (Sriharikota SHAR)',
      payloadEscrowValue: '₹12,50,00,000.00 INR',
      milestoneStatus: 'Orbital Insertion 550km LEO Verified',
      status: 'inspace_escrow_released'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Rocket className="w-6 h-6 text-[#0055FF]" />
            <span>IN-SPACe &amp; ISRO SpaceTech Satellite Launch Commercial Escrow</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous commercial launch slot booking, multi-milestone orbital insertion escrow, and statutory IN-SPACe space commerce authorization under the Indian Space Policy 2023.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>IN-SPACE AUTHORIZED ESCROW</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Launch Escrow Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹12.50 Cr INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Released upon verified 550km LEO insertion
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Launch Vehicle Providers</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">ISRO SSLV &amp; PSLV</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Sriharikota Satish Dhawan Space Centre</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">IN-SPACe Legal Standing</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Compliant</div>
          <div className="text-[11px] text-purple-700 font-mono">Space Liability Insurance bound</div>
        </div>
      </div>

      {/* Payloads Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Satellite Mission &amp; Startup</th>
                <th className="p-4 font-semibold">IN-SPACe Auth #</th>
                <th className="p-4 font-semibold">Launch Vehicle</th>
                <th className="p-4 font-semibold">Escrow Value</th>
                <th className="p-4 font-semibold">Telemetry Milestone</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {payloads.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{p.satelliteMission}</div>
                    <div className="font-mono text-[#0055FF] text-[11px]">{p.spaceStartup}</div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0A0D14]">
                    {p.inspaceAuthNumber}
                  </td>
                  <td className="p-4 text-[#0A0D14] font-semibold">
                    {p.launchVehicle}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {p.payloadEscrowValue}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {p.milestoneStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      RELEASED
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
