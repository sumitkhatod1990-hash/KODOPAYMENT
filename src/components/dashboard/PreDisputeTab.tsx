import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  BellRing, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  TrendingDown, 
  Zap,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PreDisputeTab: React.FC = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 'alt_ethoca_882',
      network: 'Mastercard Ethoca Alert',
      cardLast4: '8841',
      amount: '$149.00 USD',
      issuerBank: 'Barclays UK',
      actionTaken: 'Auto-Refunded in 3 mins',
      chargebackAvoided: true,
      timestamp: 'Aug 30, 2026 18:14'
    },
    {
      id: 'alt_verifi_991',
      network: 'Visa Verifi CDRN',
      cardLast4: '1120',
      amount: '$299.00 USD',
      issuerBank: 'JPMorgan Chase',
      actionTaken: 'Auto-Refunded in 2 mins',
      chargebackAvoided: true,
      timestamp: 'Aug 31, 2026 02:40'
    }
  ]);

  const [simulating, setSimulating] = useState(false);

  const handleSimulateAlert = () => {
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
            <BellRing className="w-6 h-6 text-[#0055FF]" />
            <span>Ethoca & Verifi Pre-Dispute Chargeback Deflection Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Directly connected to Visa Verifi CDRN and Mastercard Ethoca early warning networks to auto-refund alerted fraud claims within 24 hours *before* they turn into official chargebacks.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>0.00% OFFICIAL CHARGEBACK RATIO</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Pre-Dispute Deflection Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">98.9% Deflected</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-resolved before network fines
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Chargeback Fees Saved</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">+$14,250.00 USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Avoided $15-$25 dispute penalties</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Response Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 180s</div>
          <div className="text-[11px] text-purple-700 font-mono">Automated card refund execution</div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Alert ID</th>
                <th className="p-4 font-semibold">Card Network Feed</th>
                <th className="p-4 font-semibold">Alert Amount</th>
                <th className="p-4 font-semibold">Issuing Bank</th>
                <th className="p-4 font-semibold">Automated Deflection Action</th>
                <th className="p-4 font-semibold">Chargeback Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {a.id}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {a.network} (•••• {a.cardLast4})
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {a.amount}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {a.issuerBank}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {a.actionTaken}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      PREVENTED (0% DISPUTE)
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
