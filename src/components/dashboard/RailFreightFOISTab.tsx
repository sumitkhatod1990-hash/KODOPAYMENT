import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Train, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Receipt, 
  Truck, 
  Coins,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RailFreightFOISTab: React.FC = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'fois_rr_882901',
      consignorEntity: 'Tata Steel Ltd (Jamshedpur Works)',
      originStation: 'Tatanagar Jn (TATA / South Eastern Railway)',
      destinationStation: 'JNPT Nhava Sheva (INNSA / Central Railway)',
      railwayReceiptNo: 'RR-CRIS-2026-9901827',
      freightChargesPaid: '₹42,50,00,000.00 INR',
      freightGst5Percent: '₹2,12,500.00 (Credited to GSTN GSTR-2B)',
      foisStatus: 'cris_fois_epayment_confirmed'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Train className="w-6 h-6 text-[#0055FF]" />
            <span>Indian Railways (CRIS FOIS) Bulk Freight &amp; RR Desk</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Direct integration with Indian Railways Freight Operations Information System (FOIS) for automated bulk freight e-payment settlement and instant 5% freight GST input credit auto-population in GSTR-2B.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>INDIAN RAILWAYS CRIS FOIS SYNCED</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Freight e-Payment Settlement</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹42,50,000.00 Paid</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Direct CRIS electronic clearing
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Rail Freight GST (5%) Claimed</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹2,12,500.00 ITC</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% matched in GSTR-2B input ledger</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Digital Railway Receipt (RR)</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Instant e-RR</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time wagon loading weight sync</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Consignor Cargo Entity</th>
                <th className="p-4 font-semibold">Origin &amp; Destination Stations</th>
                <th className="p-4 font-semibold">Digital e-RR Number</th>
                <th className="p-4 font-semibold">Freight Value</th>
                <th className="p-4 font-semibold">5% GST ITC Credit</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {i.consignorEntity}
                  </td>
                  <td className="p-4 text-[#0A0D14]">
                    <div>From: {i.originStation}</div>
                    <div className="font-semibold text-emerald-700">To: {i.destinationStation}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {i.railwayReceiptNo}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {i.freightChargesPaid}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {i.freightGst5Percent}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      CRIS CLEARED
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
