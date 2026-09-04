import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Lock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NetworkTokensTab: React.FC = () => {
  const [tokens, setTokens] = useState([
    {
      id: 'tok_vau_9901',
      last4: '4242',
      brand: 'Visa Signature (Chase)',
      accountUpdaterStatus: 'card_auto_updated_2028',
      networkToken: 'dpan_4921980019284242',
      authLift: '+3.8%',
      updatedAt: 'Aug 30, 2026'
    }
  ]);

  const [simulating, setSimulating] = useState(false);

  const handleSimulateUpdater = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#0055FF]" />
            <span>AI Network Tokenization & Card Account Updater Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatically synchronizes with Visa / Mastercard Real-Time Account Updater (VAU/MAU) to replace expired cards with cryptographically secure DPAN network tokens.
          </p>
        </div>

        <button
          onClick={handleSimulateUpdater}
          disabled={simulating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
          <span>{simulating ? 'Syncing Visa/MC...' : 'Run Account Updater Sync'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Expired Card Churn Eliminated</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">99.4% Recovered</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-recharged on renewed cards
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Authorization Uplift via Tokens</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">+3.8% Auth Rate</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Direct Visa/Mastercard DPAN tokens</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Interchange Fee Savings</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">-10 bps Savings</div>
          <div className="text-[11px] text-purple-700 font-mono">Reduced card network processing rates</div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Token ID</th>
                <th className="p-4 font-semibold">Card Brand & Issuer</th>
                <th className="p-4 font-semibold">Cryptographic DPAN Token</th>
                <th className="p-4 font-semibold">Account Updater Action</th>
                <th className="p-4 font-semibold">Auth Uplift</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {tokens.map((tok) => (
                <tr key={tok.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {tok.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {tok.brand} (•••• {tok.last4})
                  </td>
                  <td className="p-4 font-mono text-[#0055FF]">
                    {tok.networkToken}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ Expiry Auto-Updated to 2028
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {tok.authLift}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE TOKEN
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
