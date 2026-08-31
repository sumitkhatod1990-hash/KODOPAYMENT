import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Calendar,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const RevenueForecastTab: React.FC = () => {
  const [growthModel, setGrowthModel] = useState<'conservative' | 'expected' | 'aggressive'>('expected');

  const forecasts = {
    conservative: {
      mrr3: '$38,400',
      arr12: '$520,000',
      nrrExpected: '115%',
      confidence: '95% Confidence Interval',
      curve: [24, 27, 31, 35, 38, 42, 45, 48, 51, 55, 59, 64]
    },
    expected: {
      mrr3: '$46,200',
      arr12: '$740,000',
      nrrExpected: '128%',
      confidence: '85% Confidence Interval',
      curve: [24, 29, 36, 42, 49, 56, 64, 72, 81, 91, 102, 114]
    },
    aggressive: {
      mrr3: '$58,900',
      arr12: '$1,120,000',
      nrrExpected: '142%',
      confidence: '70% High-Velocity Model',
      curve: [24, 33, 44, 57, 72, 89, 108, 129, 153, 180, 210, 245]
    }
  };

  const current = forecasts[growthModel];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#0055FF]" />
            <span>AI Revenue Forecasting & ARR Run-Rate Predictor</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Machine learning revenue trajectory modeling combining historical retention curves, expansion MRR, and seasonal purchasing cycles.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#F4F5F8] border border-black/5 text-xs font-semibold self-start sm:self-auto">
          {(['conservative', 'expected', 'aggressive'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setGrowthModel(m)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                growthModel === m
                  ? 'bg-white text-[#0055FF] font-bold shadow-xs'
                  : 'text-[#6E717D] hover:text-[#0A0D14]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Projected 3-Month MRR</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{current.mrr3} / mo</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {current.confidence}
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Projected 12-Month ARR Run Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{current.arr12} ARR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Net of predicted churn</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Target Net Revenue Retention</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{current.nrrExpected} NRR</div>
          <div className="text-[11px] text-purple-700 font-mono">Expansion across active base</div>
        </div>
      </div>

      {/* Visual Chart / Projection Bars */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0055FF]" />
            <span>12-Month Projected Growth Curve (Monthly MRR Index)</span>
          </h3>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ML MODEL ACTIVE
          </span>
        </div>

        {/* 12-Month Bar Visualizer */}
        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-56 pt-6">
          {current.curve.map((val, idx) => {
            const heightPercent = Math.min(100, Math.max(15, (val / Math.max(...current.curve)) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-[#8C90A0] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  ${val}k
                </span>
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className="w-full rounded-xl bg-gradient-to-t from-[#0055FF] to-blue-400 group-hover:to-emerald-400 transition-all duration-500 shadow-sm"
                />
                <span className="text-[10px] font-mono text-[#8C90A0]">
                  M{idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
