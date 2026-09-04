import React from 'react';
import { CheckCircle2 } from 'lucide-react';

// QivroPay's commercial/settlement model with Cashfree has not been
// finalized yet (Phase 10.5) — this deliberately does not quote a rate.
// Replace the "Production pricing" status once the fee model is
// implemented and charged.
const sandboxCapabilities = ['INR payments', 'UPI & Cards', 'Sandbox API keys'];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-14 md:py-20 bg-white border-t border-black/[0.06] scroll-mt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="opp-badge">
            <span>PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A0D14] tracking-tight">
            Simple pricing. No surprises.
          </h2>
          <p className="text-sm sm:text-base text-[#6E717D] leading-relaxed max-w-xl mx-auto">
            QivroPay's production commercial pricing is still being finalized. In the meantime, you can create a
            merchant account and use the sandbox to build and test your full payment integration.
          </p>
        </div>

        {/* Central panel */}
        <div className="max-w-[700px] mx-auto opp-card p-6 sm:p-8">

          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8C90A0]">
            QivroPay
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-600">
                Production pricing
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                In progress
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0A0D14] font-heading">
              Currently being finalized.
            </h3>
            <p className="text-sm text-[#6E717D] leading-relaxed">
              We'll publish live pricing here before any production charges apply.
            </p>
          </div>

          <div className="border-t border-black/[0.06] my-5" />

          <div className="space-y-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-600">
              Sandbox
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0A0D14] font-heading">
              Build and test today.
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {sandboxCapabilities.map((label) => (
                <div
                  key={label}
                  className="p-2.5 rounded-xl bg-[#F4F5F8] border border-black/5 font-semibold text-[#0A0D14] flex items-center gap-1.5 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
