import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Sparkles, 
  Lock, 
  Key, 
  Zap,
  Fingerprint
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuantumSafeTokenTab: React.FC = () => {
  const [tokens, setTokens] = useState([
    {
      id: 'qst_token_9901',
      primaryAccountReference: 'NPCI RuPay Token **** 8829',
      latticeAlgorithm: 'Crystals-Kyber-1024 (NIST Round 3 PQC)',
      signatureScheme: 'Dilithium-5 Post-Quantum Digital Signature',
      quantumSecurityLevel: 'Category 5 (AES-256 Equivalent Quantum Resistance)',
      status: 'post_quantum_shield_active'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#0055FF]" />
            <span>Quantum-Safe Cryptography (QSC) Lattice-Based Tokenizer</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Next-generation post-quantum cryptographic protection utilizing Crystals-Kyber-1024 lattice key encapsulation and Dilithium-5 signatures under India's National Quantum Mission standards.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>POST-QUANTUM RESISTANT (PQC)</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Post-Quantum Security Level</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">NIST Category 5</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Immune to Shor's quantum factoring algorithm
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Lattice Key Encapsulation</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">Kyber-1024</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Module Learning-With-Errors (MLWE)</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Token Vault Protection</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Quantum Shield</div>
          <div className="text-[11px] text-purple-700 font-mono">Guards against Harvest Now, Decrypt Later</div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Payment Token Ref</th>
                <th className="p-4 font-semibold">Primary Account Reference</th>
                <th className="p-4 font-semibold">Lattice Algorithm</th>
                <th className="p-4 font-semibold">Post-Quantum Signature</th>
                <th className="p-4 font-semibold">Security Level</th>
                <th className="p-4 font-semibold">Shield Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {t.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {t.primaryAccountReference}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {t.latticeAlgorithm}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {t.signatureScheme}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    {t.quantumSecurityLevel}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      QUANTUM SHIELDED
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
