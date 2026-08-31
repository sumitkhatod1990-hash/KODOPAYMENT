import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Percent, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Receipt, 
  Globe2, 
  Building,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EqualisationLevyTab: React.FC = () => {
  const [levies, setLevies] = useState([
    {
      id: 'eq_lvy_2026_02',
      operatorName: 'Non-Resident SaaS Seller Inc (US)',
      grossIndianSales: '₹75,00,000.00 INR',
      levyRate: '2.00% (Finance Act 2016 Chapter VIII)',
      levyAmountPayable: '₹1,50,000.00 INR',
      challanStatus: 'Challan ITNS 280 Remitted to Reserve Bank of India',
      status: 'cbdt_form_1_compliant'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Percent className="w-6 h-6 text-[#0055FF]" />
            <span>CBDT Equalisation Levy (2%) &amp; Digital Services Tax Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous calculation, withholding, and quarterly Challan ITNS 280 / Form 1 filing of India's 2.0% Equalisation Levy on non-resident e-commerce operators under Chapter VIII of the Finance Act 2016.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CBDT FORM-1 COMPLIANT</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Equalisation Levy (2%) Remitted</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹1,50,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Deposited via RBI Authorized Bank
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">E-Commerce Operator Base</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹75,00,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Gross quarterly consumer billing</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory Penalty Exemption</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Penalty Shield</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero interest under Section 170</div>
        </div>
      </div>

      {/* Levies Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Foreign Operator Entity</th>
                <th className="p-4 font-semibold">Indian Consumer Sales</th>
                <th className="p-4 font-semibold">Levy Statutory Rate</th>
                <th className="p-4 font-semibold">Equalisation Levy Amount</th>
                <th className="p-4 font-semibold">Treasury Challan ITNS 280</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {levies.map((l) => (
                <tr key={l.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {l.operatorName}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {l.grossIndianSales}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {l.levyRate}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {l.levyAmountPayable}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {l.challanStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      CBDT REMITTED
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
