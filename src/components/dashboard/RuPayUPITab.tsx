import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Lock,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RuPayUPITab: React.FC = () => {
  const [data] = useState({
    totalRuPayVolume: '₹1.48 Crore INR',
    zeroMdrSub2kCount: '3,840 Transactions (0% Fee)',
    rbiCoftVaultStatus: '100% Tokenized via NSDL / NPCI',
    creditOnUpiAuthRate: '98.6%'
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#0055FF]" />
            <span>RuPay Credit on UPI &amp; RBI Domestic CoFT Token Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Accept RuPay credit cards seamlessly via UPI QR and Intent with 0% Merchant Discount Rate (MDR) on transactions up to ₹2,000, backed by RBI Card-on-File Tokenization (CoFT).
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>0% MDR ON SUB-₹2,000 TXNS</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">RuPay on UPI Processed Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{data.totalRuPayVolume}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {data.creditOnUpiAuthRate} Auth Pass Rate
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">0% Fee Sub-₹2k Transactions</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{data.zeroMdrSub2kCount}</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero merchant processing fees</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">RBI CoFT Vault Compliance</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Tokenized</div>
          <div className="text-[11px] text-purple-700 font-mono">No raw 16-digit card numbers stored</div>
        </div>
      </div>

      {/* Info Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#0055FF]" />
          <span>NPCI &amp; RBI Domestic Sovereign Card Security Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">RuPay Credit Card on UPI:</span>
            <div className="font-bold text-emerald-700 text-sm">Linked directly in GPay / PhonePe</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">RBI CoFT Tokenization:</span>
            <div className="font-bold text-[#0A0D14] text-sm">NSDL / NPCI Certified Token Vault</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">MDR Benefit:</span>
            <div className="font-bold text-emerald-700 text-sm">₹0 Fees for Micro-Transactions</div>
          </div>
        </div>
      </div>

    </div>
  );
};
