import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  TrendingUp, 
  Coins,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UPILiteTab: React.FC = () => {
  const [data] = useState({
    totalSub500Volume: '₹48,20,000.00 INR',
    zeroPinTransactions: '124,500 Micro-Payments',
    bankUptimeReliability: '99.99% (On-Device Offline Wallet)',
    avgLatency: '0.38 Seconds'
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#0055FF]" />
            <span>NPCI UPI Lite &amp; Zero-PIN Micro-Transactions Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Process high-velocity micro-payments (up to ₹500 per txn) with zero UPI PIN friction directly from on-device local wallets, bypassing core banking server load.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>0.38s INSTANT ZERO-PIN PAY</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Zero-PIN Micro-Payments</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{data.zeroPinTransactions}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 0% PIN failure rate
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">UPI Lite Processed Volume</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{data.totalSub500Volume}</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Micro-subscriptions &amp; add-ons</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Bank Server Uptime Insulation</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{data.bankUptimeReliability}</div>
          <div className="text-[11px] text-purple-700 font-mono">100% immune to bank core downtime</div>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0055FF]" />
          <span>NPCI UPI Lite Local Device Protocol Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Local Balance Limit:</span>
            <div className="font-bold text-[#0A0D14] text-sm">₹2,000 on-device wallet</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Single Txn Limit:</span>
            <div className="font-bold text-[#0055FF] text-sm">₹500 per 1-Tap payment</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">Checkout Latency:</span>
            <div className="font-bold text-emerald-700 text-sm">380ms Sub-Second Instant</div>
          </div>
        </div>
      </div>

    </div>
  );
};
