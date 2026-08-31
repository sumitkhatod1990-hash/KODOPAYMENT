import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Bell, 
  Zap, 
  Sparkles,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UPIAutoPayTab: React.FC = () => {
  const [mandates, setMandates] = useState([
    {
      id: 'umn_upi_99482910',
      customerVpa: 'rahul.sharma@okhdfcbank',
      app: 'Google Pay (GPay)',
      amount: '₹2,499.00 / mo',
      frequency: 'Monthly Recurring',
      rbiPreDebitAlert: 'Sent (24h prior via SMS & Email)',
      mandateStatus: 'active_authorized',
      createdAt: 'Aug 30, 2026'
    },
    {
      id: 'umn_upi_77381920',
      customerVpa: 'priya.nair@ybl',
      app: 'PhonePe',
      amount: '₹999.00 / mo',
      frequency: 'Monthly Recurring',
      rbiPreDebitAlert: 'Sent (24h prior via SMS & Email)',
      mandateStatus: 'active_authorized',
      createdAt: 'Aug 31, 2026'
    }
  ]);

  const [simulating, setSimulating] = useState(false);

  const handleSimulateMandate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#0055FF]" />
            <span>UPI & UPI AutoPay 2.0 Recurring Mandate Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automated recurring subscription billing via UPI AutoPay across PhonePe, Google Pay, Paytm, CRED, and BHIM with RBI-compliant 24-hr pre-debit notifications.
          </p>
        </div>

        <button
          onClick={handleSimulateMandate}
          disabled={simulating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>{simulating ? 'Simulating Intent...' : 'Test UPI AutoPay QR Intent'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">UPI AutoPay Success Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">98.4% Auto-Debit</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> No OTP required under ₹15,000
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">RBI Pre-Debit Notifications</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Automated</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">24h prior SMS & Email dispatch</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Interchange Processing Cost</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">0% Fee (Sub-₹2k)</div>
          <div className="text-[11px] text-purple-700 font-mono">Huge cost savings vs cards</div>
        </div>
      </div>

      {/* Mandates Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Unique Mandate (UMN)</th>
                <th className="p-4 font-semibold">Customer UPI VPA</th>
                <th className="p-4 font-semibold">UPI App</th>
                <th className="p-4 font-semibold">Mandate Amount</th>
                <th className="p-4 font-semibold">RBI Pre-Debit Alert</th>
                <th className="p-4 font-semibold">Mandate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {mandates.map((m) => (
                <tr key={m.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {m.id}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {m.customerVpa}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {m.app}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {m.amount}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {m.rbiPreDebitAlert}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE RECURRING
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
