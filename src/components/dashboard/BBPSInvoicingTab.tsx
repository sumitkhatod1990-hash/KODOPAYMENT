import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Zap, 
  Globe2,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BBPSInvoicingTab: React.FC = () => {
  const [bills, setBills] = useState([
    {
      id: 'bbps_bill_9921',
      consumerNumber: 'KODO-SaaS-90812',
      billerCategory: 'SaaS & IT Cloud Subscriptions',
      customerName: 'Vikram Mehra',
      billAmount: '₹4,999.00 INR',
      dueDate: 'Sep 05, 2026',
      paymentChannel: 'PhonePe BBPS Hub',
      status: 'bill_fetched_ready_to_pay'
    }
  ]);

  const [simulating, setSimulating] = useState(false);

  const handleSimulateBBPSFetch = () => {
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
            <Receipt className="w-6 h-6 text-[#0055FF]" />
            <span>Bharat BillPay (BBPS) Recurring SaaS Invoicing Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Enable Indian consumers and enterprise buyers to fetch and pay recurring SaaS and utility bills directly from 500+ Indian banking apps (PhonePe, GPay, Paytm, BHIM, HDFC, SBI).
          </p>
        </div>

        <button
          onClick={handleSimulateBBPSFetch}
          disabled={simulating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Smartphone className="w-4 h-4" />
          <span>{simulating ? 'Broadcasting to BBPS...' : 'Simulate BBPS App Bill Fetch'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">BBPS Connected Banking Apps</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">500+ Indian Apps</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live on PhonePe, GPay, Paytm &amp; Bank Portals
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">On-Time Invoice Settlement</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">94.2% Paid Pre-Due Date</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">In-app push bill notifications</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">NPCI Biller Registration</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Active Certified</div>
          <div className="text-[11px] text-purple-700 font-mono">Official NPCI BBPOU Operating Unit</div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Consumer Number</th>
                <th className="p-4 font-semibold">Customer Account</th>
                <th className="p-4 font-semibold">Biller Category</th>
                <th className="p-4 font-semibold">Bill Amount</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">BBPS Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {b.consumerNumber}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {b.customerName}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {b.billerCategory}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {b.billAmount}
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {b.dueDate}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      FETCHED ON PHONEPE
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
