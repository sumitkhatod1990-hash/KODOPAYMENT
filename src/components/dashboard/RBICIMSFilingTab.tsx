import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Landmark, 
  FileText, 
  Coins,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RBICIMSFilingTab: React.FC = () => {
  const [filings, setFilings] = useState([
    {
      id: 'cims_flg_2026_q2',
      filingCategory: 'Payment Aggregator (PA) Statutory Returns',
      reportingQuarter: 'Q2 FY 2026-27 (XBRL Taxonomy v4.2)',
      escrowBalanceAudited: '₹142,50,00,000.00 INR (100% Capital Adequacy)',
      crossBorderInflowUsd: '$18,450,000.00 USD Realized',
      cimsFilingStatus: 'Digitally Signed & Validated with RBI CIMS Portal',
      status: 'rbi_cims_acknowledged'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#0055FF]" />
            <span>RBI CIMS (Centralised Information Management System) XBRL Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous regulatory compliance reporting converting daily transactional telemetry, nodal escrow balances, and PA net worth ratios into XBRL/XML taxonomy conforming to Reserve Bank of India CIMS standards.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RBI CIMS PORTAL SYNCED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Audited Nodal Escrow Balance</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹142.50 Cr INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Statutory Capital Adequacy
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Cross-Border Realization Inflows</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">$18,450,000.00 USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Real-time FEMA export compliance</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">XBRL Validation Status</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Validated</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero schema validation errors</div>
        </div>
      </div>

      {/* Filings Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">CIMS Filing Category</th>
                <th className="p-4 font-semibold">Reporting Quarter</th>
                <th className="p-4 font-semibold">Nodal Escrow Capital</th>
                <th className="p-4 font-semibold">Cross-Border Inflows</th>
                <th className="p-4 font-semibold">CIMS Portal Validation</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {f.filingCategory}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {f.reportingQuarter}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {f.escrowBalanceAudited}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {f.crossBorderInflowUsd}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {f.cimsFilingStatus}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ACKNOWLEDGED
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
