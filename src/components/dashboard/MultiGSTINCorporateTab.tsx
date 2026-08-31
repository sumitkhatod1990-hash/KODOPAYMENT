import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Globe2, 
  FileCheck2, 
  Receipt, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MultiGSTINCorporateTab: React.FC = () => {
  const [gstins, setGstins] = useState<any[]>([
    {
      id: 'gst_29_kar',
      stateName: 'Karnataka (State Code 29)',
      gstin: '29ABCDE1234F1Z5',
      tradeName: 'QivroPay Technologies Bengaluru HQ',
      address: '7th Floor, Koramangala Hub, Bengaluru, KA 560034',
      taxRate: '18% (9% CGST + 9% SGST)',
      itcEligible: true,
      status: 'VERIFIED_ACTIVE',
      monthlyVolume: '₹48,90,000'
    },
    {
      id: 'gst_27_mah',
      stateName: 'Maharashtra (State Code 27)',
      gstin: '27ABCDE1234F1Z3',
      tradeName: 'QivroPay Technologies Mumbai Financial Hub',
      address: 'Bandra Kurla Complex (BKC), Mumbai, MH 400051',
      taxRate: '18% (18% IGST Inter-State)',
      itcEligible: true,
      status: 'VERIFIED_ACTIVE',
      monthlyVolume: '₹62,40,000'
    },
    {
      id: 'gst_07_del',
      stateName: 'Delhi NCR (State Code 07)',
      gstin: '07ABCDE1234F1Z8',
      tradeName: 'QivroPay Technologies New Delhi Operations',
      address: 'Connaught Place, Central Delhi, DL 110001',
      taxRate: '18% (18% IGST Inter-State)',
      itcEligible: true,
      status: 'VERIFIED_ACTIVE',
      monthlyVolume: '₹31,10,000'
    },
    {
      id: 'gst_33_tn',
      stateName: 'Tamil Nadu (State Code 33)',
      gstin: '33ABCDE1234F1Z1',
      tradeName: 'QivroPay Technologies Chennai Fintech Desk',
      address: 'OMR Cyber Corridor, Chennai, TN 600096',
      taxRate: '18% (18% IGST Inter-State)',
      itcEligible: true,
      status: 'VERIFIED_ACTIVE',
      monthlyVolume: '₹22,80,000'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    stateName: 'Telangana (State Code 36)',
    gstin: '36ABCDE1234F1Z9',
    tradeName: 'QivroPay Hyderabad Tech City Desk',
    address: 'HITEC City, Madhapur, Hyderabad, TS 500081'
  });

  const handleAddGstin = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `gst_${Date.now()}`,
      stateName: formData.stateName,
      gstin: formData.gstin.toUpperCase(),
      tradeName: formData.tradeName,
      address: formData.address,
      taxRate: '18% (18% IGST Inter-State)',
      itcEligible: true,
      status: 'VERIFIED_ACTIVE',
      monthlyVolume: '₹0.00'
    };
    setGstins(prev => [...prev, newEntry]);
    setShowAddModal(false);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Building className="w-6 h-6 text-[#0055FF]" />
            <span>Corporate Multi-GSTIN &amp; Multi-State Invoicing Rail</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous Place of Supply (PoS) routing, state-wise CGST/SGST vs IGST segregation, and automated Input Tax Credit (ITC) ledger pass-through.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add State GSTIN Branch</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active State Registrations</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{gstins.length} States</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Tax Compliant</span>
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Aggregated Monthly Gross</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹1.65 Cr</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">
            Pan-India Enterprise SaaS
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Input Tax Credit (ITC) Passed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹29.74 Lakh</div>
          <div className="text-[11px] text-emerald-700 font-mono">
            GSTR-2B Auto-Reconciled
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Place of Supply (PoS) AI</div>
          <div className="text-2xl font-bold font-mono text-purple-700">0.05ms</div>
          <div className="text-[11px] text-purple-700 font-mono">
            Auto Intra vs Inter-State
          </div>
        </div>
      </div>

      {/* State Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gstins.map(g => (
          <div key={g.id} className="opp-card p-6 sm:p-7 space-y-4 hover:border-[#0055FF]/40 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0055FF]" />
                <span className="font-bold text-sm text-[#0A0D14]">{g.stateName}</span>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                ● ACTIVE NEXUS
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#8C90A0]">GSTIN Number:</span>
                <span className="font-mono font-bold text-sm text-[#0055FF] bg-blue-50/80 px-2.5 py-0.5 rounded-lg border border-blue-100">
                  {g.gstin}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8C90A0]">Trade / Branch Name:</span>
                <span className="font-medium text-[#0A0D14] text-right truncate max-w-[200px]">{g.tradeName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8C90A0]">Default Tax Apportionment:</span>
                <span className="font-mono text-emerald-800 font-bold">{g.taxRate}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8C90A0]">Monthly B2B Invoiced Volume:</span>
                <span className="font-mono font-bold text-[#0A0D14]">{g.monthlyVolume}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.06] text-[11px] text-[#8C90A0] truncate">
              📍 {g.address}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">
                Add State GSTIN Registration
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGstin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">State Name &amp; Code</label>
                <input
                  type="text"
                  required
                  value={formData.stateName}
                  onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">15-Digit GSTIN Number</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Trade / Branch Entity Name</label>
                <input
                  type="text"
                  required
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Registered Physical Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="opp-btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="opp-btn-primary px-5 py-2 font-semibold"
                >
                  Verify &amp; Add GSTIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
