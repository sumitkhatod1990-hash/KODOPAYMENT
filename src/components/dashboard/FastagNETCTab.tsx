import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  CreditCard, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FastagNETCTab: React.FC = () => {
  const [txns, setTxns] = useState([
    {
      id: 'ftg_tx_90182',
      vehicleRegNumber: 'KA-01-MJ-8821',
      tollPlaza: 'KIAL Expressway Toll Plaza (Bengaluru)',
      tollAmount: '₹110.00 INR',
      fastagTagId: '34161FA82039182',
      npciNetcStatus: 'NPCI NETC Settled via Fastag Wallet',
      itcEligible: 'GST Tax Invoice Generated'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#0055FF]" />
            <span>Fastag &amp; NPCI NETC Fleet Toll Invoicing Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automate corporate fleet toll payments, RFID Fastag wallet auto-recharging, and toll tax invoice GST input tax credit reconciliation across all Indian National Highways.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NPCI NETC NATIONAL TOLL CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Fleet Fastag Wallets</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Automated</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-recharge below ₹500 balance
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Toll Clearance Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 0.25 Seconds</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">High-speed barrier RFID pass</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Toll GST Tax Invoicing</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Tax Deductible</div>
          <div className="text-[11px] text-purple-700 font-mono">Statutory NHAI electronic toll slips</div>
        </div>
      </div>

      {/* Txns Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Vehicle Plate #</th>
                <th className="p-4 font-semibold">National Toll Plaza</th>
                <th className="p-4 font-semibold">Toll Amount</th>
                <th className="p-4 font-semibold">Fastag RFID Tag ID</th>
                <th className="p-4 font-semibold">NETC Settlement</th>
                <th className="p-4 font-semibold">GST Invoicing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {txns.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {t.vehicleRegNumber}
                  </td>
                  <td className="p-4 font-bold text-[#0055FF]">
                    {t.tollPlaza}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {t.tollAmount}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {t.fastagTagId}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {t.npciNetcStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <Receipt className="w-3 h-3" />
                      INVOICE COMPILED
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
