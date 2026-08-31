import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Droplets, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Activity, 
  Waves,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const JJMSmartWaterTariffTab: React.FC = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'jjm_wt_882910',
      gramPanchayat: 'Ralegan Siddhi Gram Panchayat (Ahmednagar)',
      iotSensorNetwork: 'Ministry of Jal Shakti IoT Water Flow Node # 491',
      monthlyLitersPumped: '4,500,000 Litres (FHTC Pure Tap Water)',
      userTariffCollected: '₹1,35,000.00 INR via Bharat BillPay (BBPS)',
      centralJjmPerformanceGrant: '₹5,00,000.00 Incentive Drawdown Released',
      status: 'jjm_grant_disbursed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Droplets className="w-6 h-6 text-[#0055FF]" />
            <span>Jal Jeevan Mission (JJM) Rural IoT Smart Water Invoicing Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous real-time IoT water flow sensor telemetry integration, Gram Panchayat water user charge billing over Bharat BillPay (BBPS), and instant Central JJM performance grant drawdowns.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MINISTRY OF JAL SHAKTI JJM SYNCED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">JJM Performance Grant Released</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹5,00,000.00 Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Disbursed to Gram Panchayat water committee
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">FHTC Water Flow Telemetry</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">4.5M Litres / mo</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% Potable Functional Household Tap Connections</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Gram Panchayat User Fee Collection</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹1,35,000.00 INR</div>
          <div className="text-[11px] text-purple-700 font-mono">BBPS &amp; Bharat QR dynamic settlement</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Gram Panchayat &amp; District</th>
                <th className="p-4 font-semibold">JJM IoT Flow Sensor Network</th>
                <th className="p-4 font-semibold">Potable Water Pumped</th>
                <th className="p-4 font-semibold">User Tariff (BBPS)</th>
                <th className="p-4 font-semibold">Central Performance Grant</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {i.gramPanchayat}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {i.iotSensorNetwork}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {i.monthlyLitersPumped}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0A0D14]">
                    {i.userTariffCollected}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {i.centralJjmPerformanceGrant}
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
