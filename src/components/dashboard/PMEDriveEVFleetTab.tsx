import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Leaf, 
  Coins, 
  Truck,
  BatteryCharging
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PMEDriveEVFleetTab: React.FC = () => {
  const [subsidies, setSubsidies] = useState([
    {
      id: 'pmedr_sub_99182',
      evFleetOperator: 'BluSmart Mobility Fleet Depot #14 (Gurgaon)',
      aadhaarVoucherCode: 'PM-EDRIVE-EV8819201',
      kwhPowerDispensed: '4,500 kWh (Direct DC Fast Charging)',
      subsidyCredited: '₹18,00,000.00 INR (MHI Direct Subsidy Offset)',
      carbonOffsetCo2: '3.82 Metric Tonnes CO2 Saved',
      status: 'subsidy_disbursed_to_fleet'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <BatteryCharging className="w-6 h-6 text-[#0055FF]" />
            <span>PM E-DRIVE &amp; FAME-III EV Fleet Green Carbon Subsidy Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous compliance and instant subsidy claim settlement engine under Ministry of Heavy Industries' PM E-DRIVE scheme for commercial EV fleet charging checkouts and carbon credit certification.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MHI PM E-DRIVE SUBSIDY CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">PM E-DRIVE Subsidy Offset</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹18,00,000.00 Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-deducted from electricity tariff bill
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">CO2 Carbon Emission Saved</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">3.82 Tonnes CO2</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">BEE Green Energy Certificate issued</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">EV Power Dispensed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">4,500 kWh</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time OCPP 2.0.1 smart meter sync</div>
        </div>
      </div>

      {/* Subsidies Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">EV Fleet Operator</th>
                <th className="p-4 font-semibold">Aadhaar e-Voucher Code</th>
                <th className="p-4 font-semibold">Power Dispensed</th>
                <th className="p-4 font-semibold">MHI Subsidy Credited</th>
                <th className="p-4 font-semibold">Carbon Offset CO2</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {subsidies.map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {s.evFleetOperator}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {s.aadhaarVoucherCode}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {s.kwhPowerDispensed}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {s.subsidyCredited}
                  </td>
                  <td className="p-4 font-semibold text-emerald-700">
                    🌱 {s.carbonOffsetCo2}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DISBURSED
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
