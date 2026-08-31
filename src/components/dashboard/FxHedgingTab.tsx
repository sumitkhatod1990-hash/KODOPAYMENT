import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRightLeft, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Globe2,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FxHedgingTab: React.FC = () => {
  const [hedges, setHedges] = useState([
    {
      id: 'hdg_eur_01',
      pair: 'EUR / USD',
      lockedRate: '1.0920',
      forwardVolume: '€250,000.00 EUR',
      duration: '90 Days Forward',
      expiresAt: 'Nov 25, 2026',
      status: 'locked_active'
    }
  ]);

  const [simulatedVolume, setSimulatedVolume] = useState(250000);
  const [locking, setLocking] = useState(false);

  const handleLockRate = () => {
    setLocking(true);
    setTimeout(() => {
      setLocking(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-[#0055FF]" />
            <span>Automated FX Currency Hedging & 90-Day Forward Lock</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Lock forward foreign exchange conversion rates for international EUR, GBP, JPY, and CAD receivables to eliminate currency depreciation losses on global SaaS contracts.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ZERO FX VOLATILITY SPREAD</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Hedged Receivables</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">€250,000.00 EUR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Locked at 1.0920 USD Rate
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">FX Depreciation Shielded</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">+$8,750.00 USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Protected against recent dollar swings</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Settlement Execution</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">T+0 Guaranteed</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time forward settlement</div>
        </div>
      </div>

      {/* Rate Lock Simulator */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#0055FF]" />
            <span>90-Day Forward Rate Lock Simulator</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#0055FF]">
            Volume: €{simulatedVolume.toLocaleString()} EUR
          </span>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min={50000}
            max={1000000}
            step={25000}
            value={simulatedVolume}
            onChange={(e) => setSimulatedVolume(Number(e.target.value))}
            className="w-full accent-[#0055FF]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
              <span className="text-[#8C90A0]">Forward Rate:</span>
              <div className="font-bold text-[#0A0D14] text-sm">1.0920 USD / EUR</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
              <span className="text-[#8C90A0]">Guaranteed USD Payout:</span>
              <div className="font-bold text-emerald-700 text-sm">${(simulatedVolume * 1.092).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center">
              <button
                onClick={handleLockRate}
                disabled={locking}
                className="opp-btn-primary px-4 py-2 text-xs font-semibold"
              >
                {locking ? 'Locking...' : 'Lock 90-Day Rate'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
