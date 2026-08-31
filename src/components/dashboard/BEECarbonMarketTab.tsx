import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Leaf, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  TreePine, 
  TrendingUp,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BEECarbonMarketTab: React.FC = () => {
  const [trades, setTrades] = useState([
    {
      id: 'ccts_ccc_881920',
      carbonCreditEntity: 'Adani Green Energy Ltd (Khavda Solar Park)',
      cccRegistrySerialNumber: 'BEE/CCTS/CCC/2026/09182',
      carbonCreditsTraded: '25,000 CCC Units (25,000 tCO2e)',
      grossTradeValue: '₹4,75,00,000.00 INR (₹1,900/CCC)',
      cctsSettlementStatus: 'Registry Ownership Transferred & Funds Escrow Cleared',
      status: 'ccc_escrow_settled'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#0055FF]" />
            <span>BEE Indian Carbon Market (CCTS) Carbon Credit Trading Escrow</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous verification and instant trade settlement under Bureau of Energy Efficiency (BEE) Carbon Credit Trading Scheme (CCTS) for Indian industrial decarbonization and renewable energy carbon offsets.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>BEE CCTS REGISTRY SYNCED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Carbon Credit Escrow Settled</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹4.75 Cr Net</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 25,000 CCC units transferred
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Market Clearing Price</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹1,900.00 / CCC</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1 CCC = 1 Tonne CO2 Equivalent</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">CCTS Registry Standing</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Verified</div>
          <div className="text-[11px] text-purple-700 font-mono">Grid-connected renewable generation verified</div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Decarbonization Project Entity</th>
                <th className="p-4 font-semibold">BEE CCTS Registry Serial #</th>
                <th className="p-4 font-semibold">Volume Traded</th>
                <th className="p-4 font-semibold">Gross Escrow Value</th>
                <th className="p-4 font-semibold">Settlement Status</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {t.carbonCreditEntity}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {t.cccRegistrySerialNumber}
                  </td>
                  <td className="p-4 text-[#0A0D14] font-semibold">
                    {t.carbonCreditsTraded}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {t.grossTradeValue}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {t.cctsSettlementStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      SETTLED
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
