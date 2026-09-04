import React from 'react';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  const goToSection = (id: string) => {
    setCurrentView('landing');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }));
  };

  return (
    <footer className="w-full border-t border-black/10 bg-[#f5f5f7] text-[#6e6e73] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">

          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Logo size="lg" showSubtitle={true} onClick={() => setCurrentView('landing')} />
            <p className="text-xs text-[#86868b] max-w-sm leading-relaxed">
              A merchant checkout and payment product for businesses in India, built on Cashfree's payment infrastructure.
            </p>
          </div>

          {/* Column: Product */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1d1d1f]">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => goToSection('product')} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => goToSection('pricing')} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('auth', { mode: 'signup' })} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Column: Developers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1d1d1f]">
              Developers
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentView('docs')} className="hover:text-[#0071e3] hover:underline text-left">
                  Documentation
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('docs')} className="hover:text-[#0071e3] hover:underline text-left">
                  API Reference
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#86868b]">
          <div className="flex items-center gap-4">
            <span>© 2026 QivroPay. All rights reserved.</span>
            <span>•</span>
            <span>India Payments</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView('privacy')} className="hover:text-[#1d1d1f] hover:underline text-left transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setCurrentView('terms')} className="hover:text-[#1d1d1f] hover:underline text-left transition-colors">
              Terms of Service
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
