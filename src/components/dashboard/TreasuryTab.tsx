import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  ArrowRightLeft, 
  CheckCircle2, 
  TrendingUp, 
  Globe2, 
  Sparkles, 
  RefreshCw, 
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TreasuryTab: React.FC = () => {
  const [balances, setBalances] = useState([
    { currency: 'USD', amount: 84250.00, symbol: '$', name: 'US Dollar' },
    { currency: 'EUR', amount: 38100.00, symbol: '€', name: 'Euro' },
    { currency: 'GBP', amount: 14500.00, symbol: '£', name: 'British Pound' },
    { currency: 'USDC', amount: 22000.00, symbol: 'USDC', name: 'USD Coin (Solana/Base)' }
  ]);

  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState(5000);
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<string | null>(null);

  const fxRates: Record<string, number> = {
    'EUR_USD': 1.09,
    'GBP_USD': 1.28,
    'USD_EUR': 0.92,
    'USD_GBP': 0.78,
    'USD_USDC': 1.00,
    'EUR_USDC': 1.09
  };

  const currentRate = fxRates[`${fromCurrency}_${toCurrency}`] || 1.0;
  const convertedEstimate = amount * currentRate;

  const handleConvert = () => {
    setConverting(true);
    setTimeout(() => {
      setBalances(prev => prev.map(b => {
        if (b.currency === fromCurrency) return { ...b, amount: b.amount - amount };
        if (b.currency === toCurrency) return { ...b, amount: b.amount + convertedEstimate };
        return b;
      }));
      setConverting(false);
      setConvertResult(`Converted ${amount} ${fromCurrency} to ${convertedEstimate.toFixed(2)} ${toCurrency} at mid-market rate 1:${currentRate}`);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#0055FF]" />
            <span>Multi-Currency Treasury & FX Auto-Hedging Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Hold balances in multi-currency floats, avoid expensive foreign exchange spreads, and execute instant interbank currency conversions.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>0% FX SPREAD GUARANTEE</span>
        </div>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {balances.map((bal) => (
          <div key={bal.currency} className="opp-card p-6 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-[#8C90A0]">
              <span>{bal.name}</span>
              <span className="font-bold text-[#0055FF]">{bal.currency}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#0A0D14]">
              {bal.symbol} {bal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Available for payout
            </div>
          </div>
        ))}
      </div>

      {/* FX Conversion Desk */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-[#0055FF]" />
          <span>Instant Treasury FX Conversion Desk</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Convert From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-3 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs font-bold text-[#0A0D14]"
            >
              <option value="EUR">EUR (€ Euro)</option>
              <option value="USD">USD ($ US Dollar)</option>
              <option value="GBP">GBP (£ British Pound)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Convert To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-3 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs font-bold text-[#0A0D14]"
            >
              <option value="USD">USD ($ US Dollar)</option>
              <option value="USDC">USDC (USD Coin)</option>
              <option value="EUR">EUR (€ Euro)</option>
              <option value="GBP">GBP (£ British Pound)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Amount to Convert</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs text-[#0A0D14]"
            />
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAFBFD] border border-black/5 font-mono text-xs">
          <div className="text-[#8C90A0]">
            Interbank Exchange Rate: <span className="font-bold text-[#0A0D14]">1 {fromCurrency} = {currentRate} {toCurrency}</span>
          </div>
          <div className="font-bold text-sm text-emerald-700">
            Estimated Yield: {convertedEstimate.toLocaleString(undefined, { minimumFractionDigits: 2 })} {toCurrency}
          </div>
          <button
            onClick={handleConvert}
            disabled={converting}
            className="opp-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${converting ? 'animate-spin' : ''}`} />
            <span>{converting ? 'Converting...' : 'Execute Conversion'}</span>
          </button>
        </div>

        {convertResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{convertResult}</span>
          </div>
        )}

      </div>

    </div>
  );
};
