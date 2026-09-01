sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Briefcase, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  Building, 
  Sparkles, 
  Landmark, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PurchaseOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState([
    {
      id: 'po_inv_9901',
      poNumber: 'PO-ENTERPRISE-2026-8812',
      enterpriseClient: 'Deloitte Global Tax & Advisory Ltd',
      amount: '₹45,000.00 INR',
      terms: 'Net-30 Days',
      dueDate: 'Sep 28, 2026',
      status: 'pending_wire_settlement'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#0055FF]" />
            <span>Enterprise Purchase Orders (PO) & Net-Terms Invoicing</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Accept enterprise Purchase Orders (PO #), automated two-way accounts payable matching, and Net-30 / Net-60 wire settlements under QIVROPAY Merchant of Record.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NET-30 WIRE SETTLEMENT ACTIVE</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Enterprise PO Pipeline</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹45,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Two-Way Matched to AP Portal
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Settlement Terms</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">Net-30 &amp; Net-60</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Automated ACH/Wire matching</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Enterprise Deal Velocity</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">+3.4x Faster</div>
          <div className="text-[11px] text-purple-700 font-mono">Bypasses credit card limits</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Invoice ID</th>
                <th className="p-4 font-semibold">PO Number</th>
                <th className="p-4 font-semibold">Enterprise Client</th>
                <th className="p-4 font-semibold">PO Amount</th>
                <th className="p-4 font-semibold">Payment Terms</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {ord.id}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {ord.poNumber}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {ord.enterpriseClient}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {ord.amount}
                  </td>
                  <td className="p-4 font-semibold text-[#0A0D14]">
                    {ord.terms}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {ord.dueDate}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold text-[10px] border border-blue-200">
                      <Clock className="w-3 h-3" />
                      PENDING WIRE
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
