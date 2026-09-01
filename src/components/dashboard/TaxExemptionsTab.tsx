import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  UploadCloud, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Building, 
  ShieldCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaxExemptionsTab: React.FC = () => {
  const [exemptions, setExemptions] = useState([
    {
      id: 'exm_qivropay_101',
      organizationName: 'Mozilla Open Source Foundation',
      type: '501(c)(3) Non-Profit Charity',
      certificateNumber: 'US-EXM-94-382910',
      jurisdiction: 'United States (Federal + California)',
      status: 'verified',
      expiresAt: 'Dec 31, 2028',
      verifiedAt: 'Aug 15, 2026'
    },
    {
      id: 'exm_qivropay_102',
      organizationName: 'NextGen Systems Reseller Corp',
      type: 'Wholesale B2B Resale Exemption',
      certificateNumber: 'TX-RESALE-8849102',
      jurisdiction: 'Texas, USA',
      status: 'verified',
      expiresAt: 'Jun 30, 2027',
      verifiedAt: 'Aug 20, 2026'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [type, setType] = useState('501(c)(3) Non-Profit Charity');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [jurisdiction, setJurisdiction] = useState('United States');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName || !certificateNumber) return;

    const newExm = {
      id: `exm_qivropay_${Date.now().toString().slice(-3)}`,
      organizationName,
      type,
      certificateNumber,
      jurisdiction,
      status: 'verified',
      expiresAt: 'Dec 31, 2028',
      verifiedAt: 'Today'
    };

    setExemptions([newExm, ...exemptions]);
    setOrganizationName('');
    setCertificateNumber('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0055FF]" />
            <span>Tax Exemption Certificates (501(c)(3) & Resale)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Store and automatically verify digital goods sales tax exemption certificates for non-profits, government entities, and wholesale B2B resellers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Exemption Certificate</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Verified Certificates</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{exemptions.length} Verified</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Tax Nexus Insulated
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Tax Exempt Sales Volume</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">$42,900.00 USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">0% sales tax charged</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Audit Defense Compliance</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Audit-Ready</div>
          <div className="text-[11px] text-purple-700 font-mono">IRS & State DOR compliant</div>
        </div>
      </div>

      {/* Exemptions Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Entity / Organization</th>
                <th className="p-4 font-semibold">Exemption Classification</th>
                <th className="p-4 font-semibold">Certificate Number</th>
                <th className="p-4 font-semibold">Jurisdiction</th>
                <th className="p-4 font-semibold">Expiration Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {exemptions.map((exm) => (
                <tr key={exm.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {exm.organizationName}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {exm.type}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {exm.certificateNumber}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {exm.jurisdiction}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {exm.expiresAt}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      VERIFIED 0% TAX
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
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Upload Exemption Certificate</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Organization / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wikimedia Foundation"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Exemption Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-semibold text-[#0A0D14]"
                >
                  <option value="501(c)(3) Non-Profit Charity">501(c)(3) Non-Profit Charity</option>
                  <option value="Wholesale B2B Resale Exemption">Wholesale B2B Resale Exemption</option>
                  <option value="Government & Educational Entity">Government & Educational Entity</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Certificate / Tax Exemption Number</label>
                <input
                  type="text"
                  required
                  placeholder="US-EXM-94-..."
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Verify & Store Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
