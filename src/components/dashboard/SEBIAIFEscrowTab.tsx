import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  FileText,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SEBIAIFEscrowTab: React.FC = () => {
  const [drawdowns, setDrawdowns] = useState([
    {
      id: 'aif_drw_2026_09',
      aifFundName: 'Bharat DeepTech Ventures (SEBI Cat-II AIF)',
      capitalCallAmount: '₹5,00,00,000.00 INR',
      investorParticipation: '24 Limited Partners (DigiLocker Accredited)',
      tdsWithholdingSec194LBB: '₹50,00,000.00 (10% TDS Deposited)',
      netPortfolioDeployment: '₹4,50,00,000.00 INR Disbursed to Target Startups',
      status: 'sebi_aif_compliant_executed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0055FF]" />
            <span>SEBI Category I/II AIF &amp; Angel Syndicate Capital Call Escrow</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous investor capital call drawdown, DigiLocker accredited investor verification, distribution waterfall calculation, and Section 194LBB TDS (10%) statutory withholding under SEBI AIF Regulations.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SEBI AIF CAT-I/II COMPLIANT</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Capital Call Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹4,50,00,000.00 Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Disbursed to startup portfolio
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Section 194LBB TDS Withheld</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹50,00,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">10% statutory income distribution TDS</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">LP Accreditation Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 30 Seconds</div>
          <div className="text-[11px] text-purple-700 font-mono">DigiLocker net worth certificate check</div>
        </div>
      </div>

      {/* Drawdowns Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">SEBI AIF Fund Name</th>
                <th className="p-4 font-semibold">Capital Call Amount</th>
                <th className="p-4 font-semibold">LP Investor Count</th>
                <th className="p-4 font-semibold">Sec 194LBB TDS Withheld</th>
                <th className="p-4 font-semibold">Net Startup Deployment</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {drawdowns.map((d) => (
                <tr key={d.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {d.aifFundName}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {d.capitalCallAmount}
                  </td>
                  <td className="p-4 text-[#0A0D14] font-semibold">
                    {d.investorParticipation}
                  </td>
                  <td className="p-4 font-mono text-rose-700 font-semibold">
                    {d.tdsWithholdingSec194LBB}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {d.netPortfolioDeployment}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      DEPLOYED
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
