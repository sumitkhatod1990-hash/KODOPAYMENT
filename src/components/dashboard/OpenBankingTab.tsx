import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  TrendingDown, 
  Sparkles,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OpenBankingTab: React.FC = () => {
  const [mandates, setMandates] = useState([
    {
      id: 'mnd_kodo_001',
      customerName: 'Marcus Vance',
      bank: 'Barclays Bank UK',
      rail: 'Faster Payments Open Banking Mandate',
      amount: '£79.00 GBP / mo',
      interchangeSaved: '£2.75 / tx (3.5% saved)',
      status: 'active_mandate'
    },
    {
      id: 'mnd_kodo_002',
      customerName: 'Synthetix Tech GmbH',
      bank: 'BNP Paribas (France)',
      rail: 'SEPA Direct Request-to-Pay',
      amount: '€249.00 EUR / mo',
      interchangeSaved: '€7.47 / tx (3.0% saved)',
      status: 'active_mandate'
    },
    {
      id: 'mnd_kodo_003',
      customerName: 'Aarav Sharma',
      bank: 'HDFC Bank (India)',
      rail: 'UPI AutoPay Recurring Mandate',
      amount: '₹4,999.00 INR / mo',
      interchangeSaved: '₹149.00 / tx (3.0% saved)',
      status: 'active_mandate'
    }
  ]);

  const [simulatedMonthlyVolume, setSimulatedMonthlyVolume] = useState(100000);
  const cardFees = simulatedMonthlyVolume * 0.032; // 3.2% card fee
  const openBankingFees = simulatedMonthlyVolume * 0.005; // 0.5% flat bank rail fee
  const annualSavings = (cardFees - openBankingFees) * 12;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#0055FF]" />
            <span>Pay-by-Bank & Open Banking Subscriptions</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct bank-to-bank recurring debits via FedNow (US), SEPA Request-to-Pay (EU), and UPI AutoPay (India) cutting interchange costs to zero.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Percent className="w-4 h-4 text-emerald-600" />
          <span>0% CARD INTERCHANGE FEES</span>
        </div>
      </div>

      {/* Savings Calculator Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading">
            Live Interchange Fee Savings Calculator
          </h3>
          <span className="text-xs font-mono font-bold text-[#0055FF]">
            Monthly SaaS Volume: ${simulatedMonthlyVolume.toLocaleString()} USD
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={10000}
            max={1000000}
            step={10000}
            value={simulatedMonthlyVolume}
            onChange={(e) => setSimulatedMonthlyVolume(Number(e.target.value))}
            className="w-full accent-[#0055FF]"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8C90A0]">
            <span>$10,000 / mo</span>
            <span>$500,000 / mo</span>
            <span>$1,000,000 / mo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Traditional Card Interchange (3.2%):</span>
            <div className="font-bold text-rose-600 text-sm">-${cardFees.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Open Banking Direct Rail (0.5%):</span>
            <div className="font-bold text-[#0A0D14] text-sm">-${openBankingFees.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">Annual Net Savings to Merchant:</span>
            <div className="font-bold text-emerald-700 text-lg">+${annualSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD / yr</div>
          </div>
        </div>
      </div>

      {/* Mandates Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Subscriber Account</th>
                <th className="p-4 font-semibold">Origin Bank Institution</th>
                <th className="p-4 font-semibold">Direct Bank Rail</th>
                <th className="p-4 font-semibold">Recurring Amount</th>
                <th className="p-4 font-semibold">Interchange Saved</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {mandates.map((mnd) => (
                <tr key={mnd.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {mnd.customerName}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {mnd.bank}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {mnd.rail}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {mnd.amount}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {mnd.interchangeSaved}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE MANDATE
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
