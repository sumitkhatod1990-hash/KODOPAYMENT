import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Receipt, 
  Calendar,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdvanceTaxAISTISTab: React.FC = () => {
  const [filings, setFilings] = useState([
    {
      id: 'adv_tax_q2_2026',
      installmentQuarter: 'Q2 (September 15, 2026 - 45% Cumulative)',
      estimatedGrossRevenue: '₹1,20,00,000.00 INR',
      calculatedTaxLiability: '₹13,50,000.00 INR',
      form26ASTdsOffset: '-₹3,20,000.00 (Sec 194-J / 194-O Credits in AIS/TIS)',
      netChallanPayable: '₹10,30,000.00 (Challan ITNS 280 Ready)',
      status: 'on_schedule_zero_interest'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#0055FF]" />
            <span>Advance Tax (Section 208) &amp; Form 26AS AIS/TIS Forecast AI</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous quarterly corporate advance tax calculation matching internal platform revenue against Income Tax AIS/TIS credits to eliminate Section 234B &amp; 234C interest penalties.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>INCOME TAX AIS/TIS SYNCED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Upcoming Q2 Installment Liability</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹10,30,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Due September 15, 2026 (45% Cumulative)
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">AIS / TIS Verified TDS Credits</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹3,20,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Real-time Form 26AS tax offset</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Sec 234B/C Interest Saved</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹1,45,000.00 Saved</div>
          <div className="text-[11px] text-purple-700 font-mono">0% penal interest rate</div>
        </div>
      </div>

      {/* Filings Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Advance Tax Installment</th>
                <th className="p-4 font-semibold">Forecast Gross Revenue</th>
                <th className="p-4 font-semibold">Gross Tax Liability</th>
                <th className="p-4 font-semibold">AIS/TIS TDS Offset</th>
                <th className="p-4 font-semibold">Net Challan 280 Amount</th>
                <th className="p-4 font-semibold">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0055FF]">
                    {f.installmentQuarter}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {f.estimatedGrossRevenue}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0A0D14]">
                    {f.calculatedTaxLiability}
                  </td>
                  <td className="p-4 font-mono text-emerald-700">
                    {f.form26ASTdsOffset}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {f.netChallanPayable}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ZERO INTEREST
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
