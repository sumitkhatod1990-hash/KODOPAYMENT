import React, { useState } from 'react';
import { Landmark, CheckCircle2 } from 'lucide-react';
export const TreasuryTab: React.FC = () => {
  const [balance] = useState(84250);
  return <div className="space-y-8 animate-fade-in font-sans"><div><h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2"><Landmark className="w-6 h-6 text-[#0055FF]" /><span>INR Treasury & Settlement Balance</span></h2><p className="text-sm text-[#8C90A0]">Track Indian-rupee collections and settlements to your verified bank account.</p></div><div className="opp-card p-6 space-y-2 max-w-xl"><span className="text-xs font-mono text-[#8C90A0]">Available INR balance</span><div className="text-3xl font-bold font-mono text-[#0A0D14]">₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div><div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Available for payout</div></div></div>;
};
