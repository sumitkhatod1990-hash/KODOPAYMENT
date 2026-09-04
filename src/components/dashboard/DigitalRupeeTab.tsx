import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Coins, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Lock,
  Landmark,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DigitalRupeeTab: React.FC = () => {
  const [tokens, setTokens] = useState([
    {
      id: 'cbdc_tok_5501',
      walletAddress: 'erupee_rbi_hdfc_881920',
      tokenAmount: 'e₹ 10,000.00 Digital Rupee',
      denominationBreakup: '5x e₹2000 | 10x e₹500',
      rbiSigningKeyVerified: true,
      feeCharged: '₹0.00 (Zero Interchange)',
      status: 'sovereign_settled_in_wallet'
    }
  ]);

  const [testedCBDC, setTestedCBDC] = useState(false);

  const handleTestCBDC = () => {
    setTestedCBDC(true);
    setTimeout(() => {
      setTestedCBDC(false);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#0055FF]" />
            <span>RBI Central Bank Digital Currency (e₹ Digital Rupee) Gateway</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct merchant acceptance of RBI-minted Digital Rupee (CBDC e₹-R &amp; e₹-W) with instant cryptographic token settlement, zero bank interchange fees, and 100% sovereign backing.
          </p>
        </div>

        <button
          onClick={handleTestCBDC}
          disabled={testedCBDC}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>{testedCBDC ? 'Token Received!' : 'Simulate e₹ CBDC Transfer'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">CBDC Processed Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">e₹ 10,000.00 Digital Rupee</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Direct RBI legal tender liability
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Interchange Processing Fee</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">0.00% Zero Fee</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">No card network or gateway fees</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Settlement Finality</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Atomic Instant</div>
          <div className="text-[11px] text-purple-700 font-mono">Cryptographically verified token transfer</div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Token Batch ID</th>
                <th className="p-4 font-semibold">CBDC Merchant Wallet</th>
                <th className="p-4 font-semibold">Digital Rupee Value</th>
                <th className="p-4 font-semibold">Denomination Breakdown</th>
                <th className="p-4 font-semibold">Interchange Fee</th>
                <th className="p-4 font-semibold">Sovereign Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {t.id}
                  </td>
                  <td className="p-4 font-mono text-[#0055FF]">
                    {t.walletAddress}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {t.tokenAmount}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {t.denominationBreakup}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-semibold">
                    {t.feeCharged}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      RBI CBDC VALIDATED
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
