import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Zap, 
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ENACHNetBankingTab: React.FC = () => {
  const [mandates, setMandates] = useState([
    {
      id: 'enach_mnd_5501',
      corporateEntity: 'Infosys Cloud Operations',
      bank: 'State Bank of India (SBI)',
      maxLimit: '₹10,00,000.00 INR',
      npciUmrn: 'UMRN99881122334455',
      debitMode: 'NetBanking / Aadhaar e-Sign',
      status: 'npci_registered_active'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#0055FF]" />
            <span>e-NACH &amp; 55+ Indian Banks NetBanking Mandate Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Power high-ticket recurring B2B enterprise SaaS subscriptions (up to ₹10 Lakhs per month) through NPCI e-NACH mandates and direct NetBanking integration across 55+ Indian commercial banks.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NPCI E-MANDATE REGISTERED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">High-Ticket Limit per Mandate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹10,00,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ideal for annual enterprise contracts
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Integrated Indian Banks</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">55+ Banks Direct</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">SBI, HDFC, ICICI, Axis, Kotak, PNB</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">e-NACH Registration Speed</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 60 Seconds</div>
          <div className="text-[11px] text-purple-700 font-mono">Instant Aadhaar OTP / Debit Card e-Sign</div>
        </div>
      </div>

      {/* Mandates Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Mandate ID</th>
                <th className="p-4 font-semibold">Enterprise Subscriber</th>
                <th className="p-4 font-semibold">Destination Bank</th>
                <th className="p-4 font-semibold">Maximum Auto-Debit Limit</th>
                <th className="p-4 font-semibold">NPCI UMRN #</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {mandates.map((m) => (
                <tr key={m.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {m.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {m.corporateEntity}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {m.bank}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {m.maxLimit}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {m.npciUmrn}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      NPCI REGISTERED
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
