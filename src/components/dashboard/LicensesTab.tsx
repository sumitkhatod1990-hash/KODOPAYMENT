import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { License } from '../../types';
import { Key, Plus, Trash2, Copy, CheckCircle2, ShieldCheck, Search } from 'lucide-react';

export const LicensesTab: React.FC = () => {
  const { licenses, generateLicense, revokeLicense, products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState('KODO Desktop Agent Pro License');
  const [customerEmail, setCustomerEmail] = useState('');
  const [maxActivations, setMaxActivations] = useState(3);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredLicenses = licenses.filter(l => 
    l.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) return;
    setIsGenerating(true);
    await generateLicense(productName, customerEmail, maxActivations);
    setIsGenerating(false);
    setShowModal(false);
    setCustomerEmail('');
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
            License Keys & Digital Entitlements
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b]">
            Cryptographic license key provisioning, hardware device binding, and activation quotas.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="apple-btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Issue License Key
        </button>
      </div>

      {/* Licenses Table Card */}
      <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-black/5 flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search licenses by key or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/5 text-[#1d1d1f] focus:border-[#0071e3] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafafc] text-[#86868b] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">License Key</th>
                <th className="p-4 font-semibold">Assigned Customer</th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Activations / Limit</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Issued Date</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredLicenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-xl border border-black/5">
                        {lic.key}
                      </span>
                      <button
                        onClick={() => copyKey(lic.key, lic.id)}
                        className="text-[#86868b] hover:text-[#1d1d1f]"
                      >
                        {copiedKey === lic.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[#1d1d1f]">
                    {lic.customerEmail}
                  </td>
                  <td className="p-4 text-[#1d1d1f] font-medium">
                    {lic.productName}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0071e3]">
                    {lic.activations} / {lic.maxActivations} Devices
                  </td>
                  <td className="p-4">
                    {lic.status === 'active' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[10px] border border-red-200">
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-[#86868b]">
                    {new Date(lic.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {lic.status === 'active' && (
                      <button
                        onClick={() => revokeLicense(lic.id)}
                        className="text-xs text-[#86868b] hover:text-red-600 hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#1d1d1f] text-lg font-heading">Issue License Key</h3>
              <button onClick={() => setShowModal(false)} className="text-[#86868b] text-sm">✕</button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Target Product</label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Custom Desktop Binary">Custom Desktop Binary</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Customer Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dev@company.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Max Allowed Activations</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxActivations}
                  onChange={(e) => setMaxActivations(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] font-mono text-[#1d1d1f] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-black/5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="apple-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={isGenerating} className="apple-btn-black px-5 py-2">
                  {isGenerating ? 'Generating...' : 'Issue Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
