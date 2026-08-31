import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Share2, 
  Gift, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Zap,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReferralEngineTab: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [advocates, setAdvocates] = useState(184);
  const [salesGenerated, setSalesGenerated] = useState(14280);
  const [creditsGiven, setCreditsGiven] = useState(1840);

  const sampleLink = 'https://pay.synthflow.ai/checkout?ref=ALEX20';

  const copyRefLink = () => {
    navigator.clipboard.writeText(sampleLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Customer Referral & Viral Growth Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Turn paying customers into organic sales champions by issuing unique referral links that grant instant discount vouchers and recurring subscription credits.
          </p>
        </div>

        <button
          onClick={copyRefLink}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copiedLink ? 'Copied Sample Link!' : 'Copy Viral Referral Link'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Referral Revenue Generated</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">${salesGenerated.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Across {advocates} active advocates
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customer Reward Credits Issued</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">${creditsGiven.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Applied to next renewal invoices</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Viral K-Factor Coefficient</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">1.34x Growth</div>
          <div className="text-[11px] text-purple-700 font-mono">Exponential organic loop</div>
        </div>
      </div>

      {/* Viral Campaign Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#0055FF]" />
            <span>Active Referral Campaign Rules</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            CAMPAIGN ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Friend Discount Incentive:</span>
            <div className="font-bold text-emerald-700 text-sm">20% Off First 3 Months</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Advocate Reward Incentive:</span>
            <div className="font-bold text-[#0055FF] text-sm">$20.00 Subscription Bill Credit</div>
          </div>
        </div>
      </div>

    </div>
  );
};
