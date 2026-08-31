import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, 
  Tag, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Zap,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VolumePricingTab: React.FC = () => {
  const [tiers] = useState([
    { seats: '1 - 9 Seats', discount: '0% (Standard)', unitPrice: '$49.00 / seat' },
    { seats: '10 - 49 Seats', discount: '15% Off', unitPrice: '$41.65 / seat' },
    { seats: '50 - 99 Seats', discount: '25% Off', unitPrice: '$36.75 / seat' },
    { seats: '100+ Seats', discount: '35% Off (Enterprise)', unitPrice: '$31.85 / seat' }
  ]);

  const [simulatedSeats, setSimulatedSeats] = useState(25);

  let discountPct = 0;
  let unitCost = 49.00;
  if (simulatedSeats >= 100) {
    discountPct = 0.35;
    unitCost = 31.85;
  } else if (simulatedSeats >= 50) {
    discountPct = 0.25;
    unitCost = 36.75;
  } else if (simulatedSeats >= 10) {
    discountPct = 0.15;
    unitCost = 41.65;
  }

  const totalMonthly = simulatedSeats * unitCost;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#0055FF]" />
            <span>B2B Wholesale Quantity Tier & Volume Discount Matrix</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Dynamically calculate stepped and graduated volume pricing curves inside checkout, unlocking high-volume enterprise procurement deals.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>DYNAMIC CHECKOUT SYNC</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Selected Volume Tier</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{(discountPct * 100).toFixed(0)}% Volume Discount</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ${unitCost.toFixed(2)} USD per seat
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Monthly Contract</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">For {simulatedSeats} enterprise seats</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Deal Size Uplift</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">+4.2x ACV</div>
          <div className="text-[11px] text-purple-700 font-mono">Higher annual contract values</div>
        </div>
      </div>

      {/* Simulator */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0055FF]" />
            <span>Interactive Seat Quantity Discount Calculator</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#0055FF]">
            {simulatedSeats} Team Seats
          </span>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min={1}
            max={200}
            step={1}
            value={simulatedSeats}
            onChange={(e) => setSimulatedSeats(Number(e.target.value))}
            className="w-full accent-[#0055FF]"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8C90A0]">
            <span>1 Seat</span>
            <span>50 Seats (25% off)</span>
            <span>100+ Seats (35% off)</span>
          </div>
        </div>
      </div>

      {/* Tiers Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Seat Quantity Bracket</th>
                <th className="p-4 font-semibold">Wholesale Discount</th>
                <th className="p-4 font-semibold">Discounted Unit Price</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {tiers.map((t, idx) => (
                <tr key={idx} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {t.seats}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {t.discount}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {t.unitPrice}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE TIER
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
