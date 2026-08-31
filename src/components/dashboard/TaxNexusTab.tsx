import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe2, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Building, 
  Sparkles,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const TaxNexusTab: React.FC = () => {
  const [taxRecords, setTaxRecords] = useState([
    {
      region: 'European Union (EU VAT OSS)',
      flag: '🇪🇺',
      nexusThreshold: '€10,000 across EU',
      currentVolume: '€48,290 / yr',
      status: 'Fully Compliant & Auto-Remitted',
      taxRateApplied: '17% - 27% (Destination Based)',
      nexusId: 'EU37209182'
    },
    {
      region: 'United States (Economic Nexus)',
      flag: '🇺🇸',
      nexusThreshold: '$100,000 / 200 txs per state',
      currentVolume: '$142,800 / yr',
      status: 'Fully Compliant & Insulated',
      taxRateApplied: 'State & Local Sales Tax Managed by KODO',
      nexusId: 'US-EIN-94-3829104'
    },
    {
      region: 'United Kingdom (UK HMRC VAT)',
      flag: '🇬🇧',
      nexusThreshold: '£85,000',
      currentVolume: '£34,100 / yr',
      status: 'Registered & Remitted',
      taxRateApplied: '20% UK Standard VAT',
      nexusId: 'GB992817402'
    },
    {
      region: 'India (GST OIDAR)',
      flag: '🇮🇳',
      nexusThreshold: 'Immediate OIDAR digital services',
      currentVolume: '₹1,480,000 / yr',
      status: 'Compliant & Remitted',
      taxRateApplied: '18% IGST OIDAR',
      nexusId: '9921IND9812K1Z0'
    },
    {
      region: 'Australia (ATO GST)',
      flag: '🇦🇺',
      nexusThreshold: 'A$75,000',
      currentVolume: 'A$28,400 / yr',
      status: 'Compliant & Registered',
      taxRateApplied: '10% GST',
      nexusId: 'ARN30009812'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Global Tax Nexus & Automated VAT/GST World Radar
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            KODO acts as your official Merchant of Record: registering, calculating, collecting, and remitting digital goods taxes in 220+ territories with zero liability for your business.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>220+ TERRITORIES INSULATED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Merchant Tax Liability</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">0.00% (Zero Risk)</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fully remitted under KODO Nexus
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Global Tax Jurisdictions Managed</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">220+ Countries</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">EU VAT, US State Tax, GST, UK VAT</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Audit Defense Status</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Certified</div>
          <div className="text-[11px] text-purple-700 font-mono">Annual SOC2 & MoR filings</div>
        </div>
      </div>

      {/* Tax Nexus Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Jurisdiction / Region</th>
                <th className="p-4 font-semibold">KODO Nexus ID</th>
                <th className="p-4 font-semibold">Economic Threshold</th>
                <th className="p-4 font-semibold">Your Annual Volume</th>
                <th className="p-4 font-semibold">Standard Tax Rate</th>
                <th className="p-4 font-semibold">Remittance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {taxRecords.map((tax, idx) => (
                <tr key={idx} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14] flex items-center gap-2 font-sans text-sm">
                      <span>{tax.flag}</span>
                      <span>{tax.region}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {tax.nexusId}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {tax.nexusThreshold}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {tax.currentVolume}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {tax.taxRateApplied}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {tax.status}
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
