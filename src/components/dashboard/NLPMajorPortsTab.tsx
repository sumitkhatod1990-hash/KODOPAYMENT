import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Ship, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Anchor, 
  Package, 
  Globe2,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NLPMajorPortsTab: React.FC = () => {
  const [cargoes, setCargoes] = useState([
    {
      id: 'nlp_bl_88201',
      consignee: 'AeroTech Dynamics India Pvt Ltd',
      billOfLadingNo: 'MAEU-88192019',
      originPort: 'Port of Hamburg (DEHAM)',
      dischargePort: 'JNPT Nhava Sheva (INNSA1)',
      marineInsuranceCover: '₹1,50,00,000.00 (ICICI Lombard Marine All-Risk)',
      escrowStatus: 'Customs Out-of-Charge Escrow Released',
      status: 'nlp_marine_verified'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Ship className="w-6 h-6 text-[#0055FF]" />
            <span>National Logistics Portal (NLP Marine) Cargo &amp; e-BL Escrow</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct integration with India's National Logistics Portal (Marine) for container shipping custody, digital Bill of Lading (e-BL) verification, and 1-click marine cargo insurance issuance.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NLP MARINE PORTAL INTEGRATED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Marine Insurance Bound</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹1,50,00,000.00 Cover</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All-risk maritime cargo insurance
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Major Indian Ports Connected</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">13 Major Ports</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">JNPT, Mundra, Chennai, Cochin, Vizag</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customs Escrow Release</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Instant OOC</div>
          <div className="text-[11px] text-purple-700 font-mono">Automated cargo custody handover</div>
        </div>
      </div>

      {/* Cargoes Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Bill of Lading (e-BL) #</th>
                <th className="p-4 font-semibold">Consignee Importer</th>
                <th className="p-4 font-semibold">Origin &amp; Discharge Ports</th>
                <th className="p-4 font-semibold">Marine Insurance Cover</th>
                <th className="p-4 font-semibold">Escrow Milestone</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {cargoes.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {c.billOfLadingNo}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.consignee}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    <div>From: {c.originPort}</div>
                    <div className="font-semibold text-emerald-700">To: {c.dischargePort}</div>
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {c.marineInsuranceCover}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {c.escrowStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      NLP VERIFIED
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
