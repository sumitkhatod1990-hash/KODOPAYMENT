import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Building, 
  Globe2, 
  CheckCircle2, 
  Plus, 
  Layers, 
  TrendingUp,
  ShieldCheck,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MultiEntityTab: React.FC = () => {
  const [entities, setEntities] = useState([
    {
      id: 'ent_kodo_101',
      name: 'KODO Global Holdings Delaware Inc.',
      jurisdiction: 'Delaware, United States',
      taxId: 'US-EIN-94-3829104',
      role: 'Parent Global Holding Entity',
      annualVolume: '$4,280,000.00 USD'
    },
    {
      id: 'ent_kodo_102',
      name: 'KODO European Operations Ireland Ltd.',
      jurisdiction: 'Dublin, Ireland',
      taxId: 'IE99382104M',
      role: 'EU & UK MoR Operating Subsidiary',
      annualVolume: '€2,490,000.00 EUR'
    },
    {
      id: 'ent_kodo_103',
      name: 'KODO Asia-Pacific Pte. Ltd.',
      jurisdiction: 'Singapore',
      taxId: 'SG202601928K',
      role: 'APAC Regional Gateway Entity',
      annualVolume: 'S$1,820,000.00 SGD'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Delaware, United States');
  const [taxId, setTaxId] = useState('');
  const [role, setRole] = useState('Regional Operating Entity');

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newEnt = {
      id: `ent_kodo_${Date.now().toString().slice(-3)}`,
      name,
      jurisdiction,
      taxId: taxId || 'PENDING-TAX-ID',
      role,
      annualVolume: '$0.00 USD'
    };

    setEntities([...entities, newEnt]);
    setName('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0055FF]" />
            <span>Multi-Entity Corporate Holding & Subsidiary Sub-Ledgers</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Manage multi-national legal holding structures across the US, Europe, and Asia with segregated subsidiary tax sub-ledgers and consolidated parent P&L reporting.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Corporate Entity</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Consolidated Group Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">$8,590,000.00 USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Across {entities.length} operating subsidiaries
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Tax Jurisdiction Segregation</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Ringfenced</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero cross-border tax contamination</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Inter-Company Settlement</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Automated</div>
          <div className="text-[11px] text-purple-700 font-mono">Transfer pricing compliant</div>
        </div>
      </div>

      {/* Entities Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Corporate Legal Name</th>
                <th className="p-4 font-semibold">Jurisdiction / Headquarters</th>
                <th className="p-4 font-semibold">Tax ID / EIN / VAT</th>
                <th className="p-4 font-semibold">Corporate Hierarchy Role</th>
                <th className="p-4 font-semibold">Annual Processed Volume</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {entities.map((ent) => (
                <tr key={ent.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14] font-sans">
                    {ent.name}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {ent.jurisdiction}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {ent.taxId}
                  </td>
                  <td className="p-4 text-[#0A0D14] font-semibold">
                    {ent.role}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {ent.annualVolume}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
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
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Add Corporate Legal Entity</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleAddEntity} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Legal Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme International Holdings Ltd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Jurisdiction</label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Tax ID / EIN</label>
                  <input
                    type="text"
                    placeholder="US-EIN-..."
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Corporate Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Register Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
