import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sprout, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Receipt, 
  Scale,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ENAMAgriTradeTab: React.FC = () => {
  const [trades, setTrades] = useState([
    {
      id: 'enam_trd_99018',
      farmerBeneficiary: 'Rameshwar Patidar (Kisan ID: MP-88192)',
      commodity: 'Grade-A Sharbati Wheat (50 Metric Tonnes)',
      assayingGrade: '99.4% Moisture & Quality Assayed (e-NWR # 99182)',
      grossSaleValue: '₹14,50,000.00 INR',
      apmcMandiCess: '-₹29,000.00 (2% Mandi Shulk Deducted)',
      netFarmerPayout: '₹14,21,000.00 (Instant Direct DBT Payout)',
      status: 'enam_mandi_settled'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#0055FF]" />
            <span>e-NAM (National Agriculture Market) APMC Mandi Settlement Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct electronic agriculture trade integration with Government of India's e-NAM portal, enabling instant DBT farmer payouts against electronic assaying warehouse receipts (e-NWR) with APMC cess deduction.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GOVT OF INDIA E-NAM INTEGRATED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Direct DBT Farmer Payouts</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹14,21,000.00 Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Instant 24x7 IMPS Aadhaar DBT transfer
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">APMC Mandi Mandates Connected</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">1,361 Mandis</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Across 23 Indian States &amp; UTs</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">APMC Cess Withheld</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹29,000.00 Cess</div>
          <div className="text-[11px] text-purple-700 font-mono">2% Mandi Board Shulk compliance</div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Farmer Beneficiary &amp; Kisan ID</th>
                <th className="p-4 font-semibold">Commodity &amp; Assaying Grade</th>
                <th className="p-4 font-semibold">Gross Auction Value</th>
                <th className="p-4 font-semibold">APMC Mandi Cess (2%)</th>
                <th className="p-4 font-semibold">Net DBT Bank Payout</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{t.farmerBeneficiary}</div>
                    <div className="font-mono text-[#8C90A0] text-[11px]">{t.id}</div>
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    <div className="font-semibold">{t.commodity}</div>
                    <div className="font-mono text-emerald-700 text-[11px]">{t.assayingGrade}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {t.grossSaleValue}
                  </td>
                  <td className="p-4 font-mono text-rose-700 font-semibold">
                    {t.apmcMandiCess}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {t.netFarmerPayout}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DBT SETTLED
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
