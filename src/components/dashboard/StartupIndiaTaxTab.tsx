import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  FileText, 
  Percent,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StartupIndiaTaxTab: React.FC = () => {
  const [data] = useState({
    dpiitRecognitionNumber: 'DIPP98102',
    section80IACStatus: '3-Year 100% Tax Holiday Approved',
    angelTaxSection56: 'Exempt under CBDT Notification 2019',
    patentsFastTracked: '3 FinTech Software Patents Filed'
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Award className="w-6 h-6 text-[#0055FF]" />
            <span>DPIIT Startup India &amp; Section 80-IAC Tax Exemption Registry</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Statutory registry and compliance documentation vault for DPIIT Startup India certification, 3-year Section 80-IAC 100% income tax holiday, and Section 56(2)(viib) Angel Tax exemptions.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DPIIT RECOGNIZED STARTUP</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">DPIIT Recognition Number</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{data.dpiitRecognitionNumber}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ministry of Commerce &amp; Industry (Govt of India)
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Section 80-IAC Tax Holiday</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Tax Exemption</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">For 3 consecutive assessment years</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Angel Tax Liability</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹0.00 (100% Exempt)</div>
          <div className="text-[11px] text-purple-700 font-mono">Section 56(2)(viib) CBDT cleared</div>
        </div>
      </div>

      {/* Certificate Details */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0055FF]" />
          <span>Statutory Government Certifications &amp; Patent Filings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">DPIIT Startup Certificate:</span>
            <div className="font-bold text-emerald-700 text-sm">Active &amp; In Good Standing</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Section 80-IAC CBDT Order:</span>
            <div className="font-bold text-[#0A0D14] text-sm">Inter-Ministerial Board Approved</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">Fast-Tracked IPR:</span>
            <div className="font-bold text-emerald-700 text-sm">{data.patentsFastTracked}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
