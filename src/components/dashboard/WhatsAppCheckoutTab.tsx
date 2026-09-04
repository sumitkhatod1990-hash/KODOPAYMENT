import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Clock,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WhatsAppCheckoutTab: React.FC = () => {
  const [checkouts, setCheckouts] = useState([
    {
      id: 'wa_ord_301',
      customerPhone: '+91 98765 43210',
      intentInitiated: 'Interactive WhatsApp Catalog Message',
      selectedPlan: 'AI Copilot Ultra (₹1,499/mo)',
      paymentAction: '1-Click UPI Intent (GPay / PhonePe in WhatsApp)',
      timeToCheckout: '12.4 Seconds',
      status: 'completed_active'
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#0055FF]" />
            <span>Indian WhatsApp Conversational Checkout &amp; UPI Payment Bot</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Complete SaaS tier selection, plan customization, and 1-click UPI Intent payment processing without leaving the WhatsApp chat window via official Meta Cloud API.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>META CLOUD WHATSAPP API READY</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">WhatsApp Checkout Conversion</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">68.2% Conversion</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> +2.4x higher than standard web forms
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Speed to Payment</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">12.4 Seconds</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Instant UPI Intent handoff</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Indian Mobile Shoppers Reach</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">500M+ Active Users</div>
          <div className="text-[11px] text-purple-700 font-mono">Zero app install barrier</div>
        </div>
      </div>

      {/* Checkouts Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer WhatsApp Phone</th>
                <th className="p-4 font-semibold">Selected SaaS Plan</th>
                <th className="p-4 font-semibold">UPI Payment Execution</th>
                <th className="p-4 font-semibold">Checkout Time</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {checkouts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {c.id}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {c.customerPhone}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {c.selectedPlan}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold">
                    ✓ {c.paymentAction}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {c.timeToCheckout}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      PAID IN WHATSAPP
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
