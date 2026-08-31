import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const CTASection: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <section className="py-28 md:py-40 bg-white border-t border-black/5 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1d1d1f] tracking-tight leading-[1.08]">
          Start accepting payments <br />
          in minutes.
        </h2>
        
        <p className="text-base sm:text-xl text-[#6e6e73] max-w-2xl mx-auto">
          Join hundreds of fast-growing AI and SaaS founders. No setup costs, zero monthly fixed fees.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="apple-btn-black px-10 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-lg"
          >
            <span>Launch Merchant Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentView('docs')}
            className="apple-btn-secondary px-8 py-4 text-sm font-medium"
          >
            Explore Developer Docs
          </button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-6 text-xs text-[#86868b] font-medium">
          <span>✓ Instant Sandbox</span>
          <span>•</span>
          <span>✓ 220+ Countries</span>
          <span>•</span>
          <span>✓ Zero Tax Liability</span>
        </div>
      </div>
    </section>
  );
};
