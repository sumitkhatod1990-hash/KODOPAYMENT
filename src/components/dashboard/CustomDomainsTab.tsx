import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  Plus, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomDomainsTab: React.FC = () => {
  const [domains, setDomains] = useState([
    {
      id: 'dom_qivropay_01',
      domain: 'billing.synthflow.ai',
      targetCname: 'custom.qivropay.io',
      sslStatus: 'issued_active',
      dnsStatus: 'verified',
      createdAt: 'Aug 25, 2026'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);

  const handleConnectDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;

    setVerifying(true);
    setTimeout(() => {
      const added = {
        id: `dom_qivropay_${Date.now().toString().slice(-3)}`,
        domain: newDomain,
        targetCname: 'custom.qivropay.io',
        sslStatus: 'issued_active',
        dnsStatus: 'verified',
        createdAt: 'Today'
      };
      setDomains([added, ...domains]);
      setVerifying(false);
      setNewDomain('');
      setShowModal(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  const copyCname = () => {
    navigator.clipboard.writeText('custom.qivropay.io');
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#0055FF]" />
            <span>Custom Domain & Automated SSL Provisioning</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Host your hosted checkout pages and self-serve customer billing portals directly on your own custom subdomains (e.g. <code className="text-[#0055FF] font-mono">pay.yourdomain.com</code>).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Custom Subdomain</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Connected Custom Domains</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{domains.length} Active</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> CNAME Route Verified
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">SSL Certificate Status</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% TLS 1.3</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Auto-renewing ZeroSSL</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">White-Label URL Redirection</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">Active</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero QIVROPAY branding in URL bar</div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Custom Subdomain</th>
                <th className="p-4 font-semibold">Required CNAME Target</th>
                <th className="p-4 font-semibold">DNS Verification</th>
                <th className="p-4 font-semibold">SSL Encryption</th>
                <th className="p-4 font-semibold">Created</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-sm text-[#0055FF]">
                    {dom.domain}
                  </td>
                  <td className="p-4 font-mono">
                    <button
                      onClick={copyCname}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F5F8] border border-black/5 text-[#0A0D14] font-semibold flex items-center gap-1.5 hover:border-black/20"
                    >
                      <span>{dom.targetCname}</span>
                      {copiedTarget ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> DNS Verified
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-[#0A0D14] font-mono text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" /> Auto-SSL TLS 1.3
                    </span>
                  </td>
                  <td className="p-4 text-[#8C90A0] font-mono text-[11px]">
                    {dom.createdAt}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      LIVE & PROVISIONED
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
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Connect Custom Domain</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleConnectDomain} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Your Custom Subdomain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. checkout.yourbrand.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-black/5 space-y-2 text-xs">
                <div className="font-semibold text-[#0A0D14]">DNS Instructions:</div>
                <p className="text-[#6E717D] text-[11px] leading-relaxed">
                  Create a <code className="font-mono font-bold text-[#0055FF]">CNAME</code> record in Cloudflare / AWS Route53 pointing your subdomain to <code className="font-mono font-bold text-[#0055FF]">custom.qivropay.io</code>.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={verifying} className="opp-btn-primary px-5 py-2 font-semibold flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Verifying DNS...' : 'Verify & Issue SSL'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
