import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  FileText, 
  Sparkles, 
  Clock,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EWayBillTab: React.FC = () => {
  const [ewayBills, setEwayBills] = useState([
    {
      id: 'ewb_nic_881902',
      invoiceRef: 'gst_inv_2026_8891',
      consignee: 'Tata Consultancy Cloud Hub (Pune)',
      consigneeGstin: '27AAACT2727Q1ZW',
      distanceKm: '145 KM',
      transporter: 'BlueDart Express (ID: 27AABCB0011D1ZZ)',
      vehicleNumber: 'MH-12-RN-9821',
      ewayBillNumber: '2418 9012 8841',
      validUntil: 'Sep 02, 2026 23:59',
      status: 'nic_active_in_transit'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#0055FF]" />
            <span>Automated Indian e-Way Bill &amp; Goods Transport GST Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automatic generation of statutory Part-A and Part-B NIC e-Way Bills with government signed QR passes for all hardware &amp; physical goods shipments above ₹50,000 INR.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GOVERNMENT NIC E-WAY BILL PORTAL</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Generated e-Way Bills</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">100% Compliant</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Real-time 12-digit EWB Number
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Generation Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">&lt; 1.2s via NIC API</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Automated vehicle &amp; transporter binding</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">GST Transit Audit Status</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">Zero Interception Fines</div>
          <div className="text-[11px] text-purple-700 font-mono">Statutory QR code on shipping label</div>
        </div>
      </div>

      {/* eWayBills Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">12-Digit E-Way Bill #</th>
                <th className="p-4 font-semibold">Consignee &amp; GSTIN</th>
                <th className="p-4 font-semibold">Transporter &amp; Vehicle #</th>
                <th className="p-4 font-semibold">Transit Distance</th>
                <th className="p-4 font-semibold">Validity Window</th>
                <th className="p-4 font-semibold">Transit Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {ewayBills.map((ewb) => (
                <tr key={ewb.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0055FF] text-sm">
                    {ewb.ewayBillNumber}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{ewb.consignee}</div>
                    <div className="font-mono text-[#8C90A0] text-[11px]">{ewb.consigneeGstin}</div>
                  </td>
                  <td className="p-4 font-mono text-[#0A0D14]">
                    {ewb.vehicleNumber} ({ewb.transporter})
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {ewb.distanceKm}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 font-semibold">
                    {ewb.validUntil}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <QrCode className="w-3 h-3" />
                      QR ACTIVE (IN TRANSIT)
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
