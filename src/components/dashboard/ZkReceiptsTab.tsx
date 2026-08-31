import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  ShieldCheck, 
  Fingerprint, 
  Sparkles, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ZkReceiptsTab: React.FC = () => {
  const [receipts, setReceipts] = useState([
    {
      id: 'zk_kodo_01',
      txHash: '0x7f8e3b2a9d1c0e4f',
      zkProof: 'zk-SNARK-BN254:0x49a8d29b01c3e4f7a8b9c0d1e2f3a4b5c6d7e8f9',
      settlementVerified: true,
      taxSegregated: true,
      piiProtected: true,
      timestamp: 'Aug 29, 2026'
    }
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyProof = (proof: string, id: string) => {
    navigator.clipboard.writeText(proof);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-[#0055FF]" />
            <span>Zero-Knowledge (ZK) Proof Receipts & Privacy Verifier</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Cryptographically verify tax-compliant settlement using zk-SNARK mathematical proofs without exposing customer PII or sensitive corporate bank account numbers.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ZK-SNARK BN254 PROOF ENGINE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cryptographic Proof Verifications</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Validated</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Mathematical Tax Insulation
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Customer PII Exposure</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">0.00% Zero Leakage</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero PII disclosed on receipts</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Proof Generation Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 120ms</div>
          <div className="text-[11px] text-purple-700 font-mono">Sub-second zk-SNARK synthesis</div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">ZK Receipt ID</th>
                <th className="p-4 font-semibold">Settlement Tx Hash</th>
                <th className="p-4 font-semibold">Cryptographic Proof Payload</th>
                <th className="p-4 font-semibold">Tax Remittance Proven</th>
                <th className="p-4 font-semibold">PII Shield</th>
                <th className="p-4 font-semibold">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {receipts.map((rcp) => (
                <tr key={rcp.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {rcp.id}
                  </td>
                  <td className="p-4 font-mono text-[#0055FF]">
                    {rcp.txHash}
                  </td>
                  <td className="p-4 font-mono">
                    <button
                      onClick={() => copyProof(rcp.zkProof, rcp.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F5F8] border border-black/5 text-[#0A0D14] font-semibold flex items-center gap-1.5 hover:border-black/20"
                    >
                      <span className="truncate max-w-[140px]">{rcp.zkProof}</span>
                      {copiedId === rcp.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="p-4 text-emerald-700 font-mono font-bold">
                    ✓ Proven (0% Nexus Risk)
                  </td>
                  <td className="p-4 text-[#0A0D14] font-semibold">
                    100% Encrypted
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ZK VERIFIED
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
