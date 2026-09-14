import React from 'react';
import { Layers, ShoppingBag, Laptop, Briefcase, Users2, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const SolutionsSection: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();

  const solutions = [
    {
      icon: Laptop,
      title: 'Global SaaS & Software',
      desc: 'Meter tokens, issue API credits, manage user seats, and collect recurring or one-time subscriptions in multiple currencies.',
      tags: ['Credits & Usage', 'Subscriptions', 'Multi-Currency']
    },
    {
      icon: Sparkles,
      title: 'Digital Products & Creators',
      desc: 'Sell ebooks, course licenses, presets, and digital assets with instant checkout links and automated customer receipts.',
      tags: ['Instant Links', 'License Delivery', 'Zero Friction']
    },
    {
      icon: ShoppingBag,
      title: 'E-Commerce & Digital Commerce',
      desc: 'Accept payments across international cards and regional rails with tamper-proof checkout sessions and webhook reconciliation.',
      tags: ['Card Acquiring', 'Hosted Checkout', 'Order Verification']
    },
    {
      icon: Briefcase,
      title: 'Agencies & Professional Services',
      desc: 'Generate branded invoice links for international clients in USD, EUR, GBP, or domestic rails without complex merchant setups.',
      tags: ['Client Invoicing', 'Retainers', 'Multi-Market']
    },
    {
      icon: Layers,
      title: 'Platforms & Developer APIs',
      desc: 'Integrate programmatic payment creation into your software stack with lightweight REST APIs, webhooks, and sandbox environments.',
      tags: ['Server-to-Server', 'Test & Live Keys', 'REST Endpoints']
    },
    {
      icon: Users2,
      title: 'Global Companies & Exporters',
      desc: 'Expand customer reach beyond domestic boundaries with multi-currency acceptance and localized payment experiences.',
      tags: ['Cross-Border', '9 Currencies', 'Unified Operations']
    }
  ];

  return (
    <section id="solutions" className="py-20 md:py-28 bg-[#f7f6f2] border-t border-black/[0.06] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="opp-badge">
            <span>SOLUTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#151a4a] tracking-tight">
            Built for modern businesses selling worldwide.
          </h2>
          <p className="text-base sm:text-lg text-[#4d5475] leading-relaxed">
            Whether you are launching a global SaaS, distributing digital tools, or billing international clients, QivroPay adapts to your business model.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="p-7 rounded-3xl bg-white border border-black/10 hover:border-black/20 transition-all flex flex-col justify-between space-y-6 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0055FF] flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#151a4a] font-heading">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#4d5475] mt-2 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-black/5">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#f7f6f2] text-[#4d5475]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="text-center pt-4">
          <button
            onClick={() => (user ? setCurrentView('dashboard') : setCurrentView('auth', { mode: 'signup' }))}
            className="opp-btn-primary px-8 py-3.5 text-sm gap-2 inline-flex items-center"
          >
            <span>{user ? 'Go to your dashboard' : 'Start building your integration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
