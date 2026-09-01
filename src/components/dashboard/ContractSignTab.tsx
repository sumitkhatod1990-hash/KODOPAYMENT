sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSignature, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContractSignTab: React.FC = () => {
  const [contracts, setContracts] = useState([
    {
      id: 'cnt_qivropay_881',
      title: 'Enterprise Master Services Agreement (MSA) & 99.99% SLA',
      clientName: 'Synthetix Global Corp',
      contractValue: '₹120,000.00 / yr',
      status: 'signed_active',
      signerEmail: 'legal@synthetix.com',
      sha256Hash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
      signedAt: 'Aug 27, 2026'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [contractValue, setContractValue] = useState('₹50,000.00 / yr');
  const [signatureName, setSignatureName] = useState('Alex Founder');

  const handleGenerateAndSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !signerEmail) return;

    const newCnt = {
      id: `cnt_qivropay_${Date.now().toString().slice(-3)}`,
      title: 'Enterprise Master Services Agreement (MSA) & SLA',
      clientName,
      contractValue,
      status: 'signed_active',
      signerEmail,
      sha256Hash: 'e4a19b882310dc94821039482103984019284019283019284019284019283019',
      signedAt: 'Today'
    };

    setContracts([newCnt, ...contracts]);
    setClientName('');
    setSignerEmail('');
    setShowModal(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Enterprise Contract E-Signing (MSA / SLA)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Generate, dispatch, and cryptographically sign enterprise Master Services Agreements (MSA), Business Associate Agreements (BAA), and SLAs directly alongside high-ticket B2B invoices.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Draft Enterprise MSA</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Executed Contract Value</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹120,000.00 / yr</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Cryptographically Sealed
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Legal Enforceability</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">ESIGN & eIDAS</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% US & EU compliant</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cryptographic Audit Hash</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">SHA-256</div>
          <div className="text-[11px] text-purple-700 font-mono">Immutable audit timestamp</div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Agreement Title</th>
                <th className="p-4 font-semibold">Enterprise Client</th>
                <th className="p-4 font-semibold">Contract Value</th>
                <th className="p-4 font-semibold">Signer Email</th>
                <th className="p-4 font-semibold">SHA-256 Audit Hash</th>
                <th className="p-4 font-semibold">Executed Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {contracts.map((cnt) => (
                <tr key={cnt.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14] font-sans">{cnt.title}</div>
                    <div className="text-[10px] text-[#8C90A0] font-mono">{cnt.id}</div>
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {cnt.clientName}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {cnt.contractValue}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {cnt.signerEmail}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-[#8C90A0] truncate max-w-[140px]">
                    {cnt.sha256Hash}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {cnt.signedAt}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      EXECUTED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Draft & E-Sign Enterprise MSA</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleGenerateAndSign} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Client Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme AI Global Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Signer Email</label>
                  <input
                    type="email"
                    required
                    placeholder="legal@acme.ai"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Annual Value (₹)</label>
                  <input
                    type="text"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  E-Sign & Execute Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
