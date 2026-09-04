import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Lock, 
  SmartphoneNfc,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Smart3DSTab: React.FC = () => {
  const [data] = useState({
    totalFrictionlessRate: '79.4%',
    traExemptionsGranted: 1420,
    lowValueExemptions: 3810,
    avgCheckoutSpeed: '1.1s (Frictionless 1-Click)'
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <SmartphoneNfc className="w-6 h-6 text-[#0055FF]" />
            <span>Dynamic 3DS Smart Exemption & Frictionless Card Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatically requests PSD2/PSD3 SCA exemptions (Transaction Risk Analysis / Low-Value / Recurring) to bypass SMS OTP challenges for trusted shoppers while maintaining 100% fraud shift protection.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>79.4% FRICTIONLESS RATE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Frictionless 1-Click Pass Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{data.totalFrictionlessRate}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero OTP drop-offs
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">TRA Risk Exemptions Granted</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{data.traExemptionsGranted.toLocaleString()} Exemptions</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Under &lt; 0.01% fraud rate tier</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Avg Checkout Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{data.avgCheckoutSpeed}</div>
          <div className="text-[11px] text-purple-700 font-mono">3.8s faster than manual 3DS</div>
        </div>
      </div>

      {/* Rules Breakdown */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0055FF]" />
          <span>Active PSD2 / PSD3 Exemption Corridor Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Transaction Risk Analysis (TRA):</span>
            <div className="font-bold text-emerald-700 text-sm">Exempt up to €500.00 INR</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Low-Value Transactions:</span>
            <div className="font-bold text-[#0A0D14] text-sm">Exempt up to €30.00 INR</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Recurring Merchant Initiated:</span>
            <div className="font-bold text-[#0055FF] text-sm">100% Frictionless (MIT)</div>
          </div>
        </div>
      </div>

    </div>
  );
};
