import React from 'react';
import { Globe, CreditCard, Link2, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import { formatCurrency } from '../../lib/currency';

export const GlobalPaymentsSection: React.FC = () => {
  const { currency, region } = useRegion();

  const capabilities = [
    {
      icon: Globe,
      title: 'Multi-Currency Checkout',
      desc: 'Accept payments in 9 supported ISO currencies with localized symbols and decimal precision.',
      badge: '9 Currencies',
      points: ['USD, EUR, GBP, AED, AUD, CAD, SGD, JPY, INR', 'Zero synthetic FX markup', 'Deterministic currency pricing']
    },
    {
      icon: CreditCard,
      title: 'International Card Rails',
      desc: 'Process Visa, Mastercard, and American Express with 3D-Secure authentication on signed sessions.',
      badge: 'Cards',
      points: ['Global cardholder acquiring', 'Signed tamper-proof sessions', 'Direct server webhook validation']
    },
    {
      icon: Link2,
      title: 'Currency-Aware Payment Links',
      desc: 'Generate instant hosted checkout links for international clients, invoices, or direct messaging.',
      badge: 'Payment Links',
      points: ['Shareable via email or messaging', 'Branded checkout experience', 'Real-time transaction tracking']
    },
    {
      icon: Smartphone,
      title: 'Regional Capabilities · India',
      desc: 'Domestic payment methods for customers in India, fully integrated into the global architecture.',
      badge: 'Regional Rail',
      points: ['UPI QR & Intent flows', 'RuPay debit & credit cards', 'Indian Net Banking integration']
    }
  ];

  return (
    <section id="global-payments" className="py-20 md:py-28 bg-white border-t border-black/[0.06] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="opp-badge">
            <span>GLOBAL COMMERCE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A0D14] tracking-tight">
            Accept payments from customers around the world.
          </h2>
          <p className="text-base sm:text-lg text-[#6E717D] leading-relaxed">
            One developer-first payment infrastructure uniting international card rails, multi-currency checkout, and regional payment methods.
          </p>
        </div>

        {/* 4-Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="p-6 sm:p-7 rounded-3xl bg-[#FAFAFC] border border-black/10 hover:border-black/20 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-center text-[#0055FF]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-[#6E717D]">
                      {c.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0A0D14] font-heading">
                      {c.title}
                    </h3>
                    <p className="text-xs text-[#6E717D] mt-1.5 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 pt-4 border-t border-black/5 text-[11px] text-[#4d5475]">
                  {c.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Truthful Infrastructure Notice */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f6f2] border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#6E717D]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="leading-relaxed">
              <strong>Transparent Infrastructure:</strong> QivroPay provides the software APIs and merchant checkout layer. Underlying payment processing, card acquiring, and fund settlement are facilitated through our configured partner relationship with Cashfree Payments.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#8C90A0] shrink-0">
            Current Region: {region.name} ({currency})
          </span>
        </div>

      </div>
    </section>
  );
};
