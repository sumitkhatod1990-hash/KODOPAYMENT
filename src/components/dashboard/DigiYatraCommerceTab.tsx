import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plane, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  ScanFace, 
  ShoppingBag,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DigiYatraCommerceTab: React.FC = () => {
  const [checkouts, setCheckouts] = useState([
    {
      id: 'dgy_chk_2026_88',
      passengerIdentity: 'Rajesh Sharma (DigiYatra ID: DY-DEL-99182)',
      airportTerminal: 'Indira Gandhi International Airport (DEL T3)',
      merchantOutlet: 'Delhi Duty Free / Starbucks Departure Concourse',
      biometricAuthMode: '1:1 DigiYatra Face-Pay (Zero-Card / Zero-Phone)',
      transactionAmount: '₹8,450.00 INR',
      aaiUdfFeeShare: '₹350.00 (Auto-split to Airports Authority of India)',
      status: 'face_pay_success'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Plane className="w-6 h-6 text-[#0055FF]" />
            <span>DigiYatra Biometric Airport Terminal Merchant Checkout Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous 1:1 facial biometric matching commerce at 30+ Indian airports (Duty Free, F&amp;B, Lounges) with automated Airports Authority of India (AAI) statutory fee splitting.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DGCA DIGIYATRA BIOMETRIC CERTIFIED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Biometric Face-Pay Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹8,450.00 Cleared</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero phone / zero card frictionless POS
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Biometric Matching Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 0.25 Seconds</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1:1 Self-sovereign cryptographic token match</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">AAI Statutory Fee Split</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Reconciled</div>
          <div className="text-[11px] text-purple-700 font-mono">Instant UDF/PSF concession royalty deduction</div>
        </div>
      </div>

      {/* Checkouts Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Passenger &amp; DigiYatra ID</th>
                <th className="p-4 font-semibold">Airport Terminal &amp; Merchant</th>
                <th className="p-4 font-semibold">Biometric Mode</th>
                <th className="p-4 font-semibold">Transaction Value</th>
                <th className="p-4 font-semibold">AAI Concession Split</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {checkouts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.passengerIdentity}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    <div className="font-semibold text-[#0055FF]">{c.airportTerminal}</div>
                    <div className="text-[11px] text-[#8C90A0]">{c.merchantOutlet}</div>
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    {c.biometricAuthMode}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {c.transactionAmount}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {c.aaiUdfFeeShare}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      FACE-PAY SUCCESS
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
