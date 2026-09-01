import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const comparisonRows = [
    { feature: "Built-in Merchant of Record (MoR)", qivropay: true, stripe: false, ls: true, paddle: true },
    { feature: "Global Tax, VAT & GST Auto-Remittance", qivropay: true, stripe: "Requires Stripe Tax (₹)", ls: true, paddle: true },
    { feature: "Native AI Credit & Token Metering", qivropay: true, stripe: false, ls: false, paddle: false },
    { feature: "Transparent Pricing (Zero Fixed Fees)", qivropay: "4% + 40¢", stripe: "2.9% + 30¢ + Addons", ls: "5% + 50¢", paddle: "5% + 50¢" },
    { feature: "Purchasing Power Parity (PPP)", qivropay: true, stripe: false, ls: false, paddle: false },
    { feature: "Instant Apple Pay & UPI Checkout", qivropay: true, stripe: true, ls: true, paddle: true },
    { feature: "Digital License Key Engine", qivropay: true, stripe: false, ls: true, paddle: false },
    { feature: "Same-Day Merchant Verification", qivropay: true, stripe: true, ls: "Weeks Delay", paddle: "Slow" },
  ];

  return (
    <section className="py-24 md:py-36 bg-[#f5f5f7] border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#0071e3]">
            Feature Matrix
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
            How QIVROPAY compares.
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] max-w-2xl mx-auto">
            Engineered from the ground up for modern AI agents and global SaaS founders.
          </p>
        </div>

        {/* Table */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-black/10 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafafc] font-mono text-xs uppercase">
                <th className="p-5 text-[#1d1d1f] font-bold">Feature</th>
                <th className="p-5 text-[#0071e3] font-black bg-blue-50/60 border-x border-blue-100">
                  ⚡ QIVROPAY Payments
                </th>
                <th className="p-5 text-[#86868b]">Stripe Stack</th>
                <th className="p-5 text-[#86868b]">LemonSqueezy</th>
                <th className="p-5 text-[#86868b]">Paddle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fafafc] transition-colors">
                  <td className="p-5 font-medium text-[#1d1d1f]">
                    {row.feature}
                  </td>
                  
                  {/* QIVROPAY Column */}
                  <td className="p-5 font-bold text-[#1d1d1f] bg-blue-50/30 border-x border-blue-100">
                    {typeof row.qivropay === 'boolean' ? (
                      <span className="flex items-center gap-2 text-[#0071e3]">
                        <Check className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="font-mono text-[#0071e3]">{row.qivropay}</span>
                    )}
                  </td>

                  <td className="p-5 text-[#6e6e73]">
                    {typeof row.stripe === 'boolean' ? (
                      row.stripe ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <span className="text-xs">{row.stripe}</span>
                    )}
                  </td>

                  <td className="p-5 text-[#6e6e73]">
                    {typeof row.ls === 'boolean' ? (
                      row.ls ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <span className="font-mono text-xs">{row.ls}</span>
                    )}
                  </td>

                  <td className="p-5 text-[#6e6e73]">
                    {typeof row.paddle === 'boolean' ? (
                      row.paddle ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <span className="font-mono text-xs">{row.paddle}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
};
