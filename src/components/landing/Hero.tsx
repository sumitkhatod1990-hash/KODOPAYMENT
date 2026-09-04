import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();

  return (
    <section className="relative pt-32 pb-6 md:pt-40 md:pb-8 overflow-hidden bg-[#FAFAFC]">

      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-100/40 via-purple-50/30 to-emerald-50/20 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Tag */}
        <div className="flex justify-center mb-6">
          <div className="opp-badge">
            <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse" />
            <span>🇮🇳 INDIA-FIRST PAYMENT INFRASTRUCTURE</span>
          </div>
        </div>

        {/* Master Heading */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0A0D14] tracking-tight leading-[1.08]">
            Payment infrastructure for businesses in India.
          </h1>
          <p className="text-lg sm:text-xl text-[#6E717D] max-w-2xl mx-auto font-normal leading-relaxed">
            Accept UPI and card payments for your products, services, or digital goods, share a payment link in seconds, and track every transaction in one dashboard, built on Cashfree's payment infrastructure.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => (user ? setCurrentView('dashboard') : setCurrentView('auth', { mode: 'signup' }))}
              className="opp-btn-primary px-8 py-3.5 text-sm gap-2"
            >
              <span>{user ? 'Go to dashboard' : 'Get started'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('docs')}
              className="opp-btn-secondary px-7 py-3.5 text-sm gap-2"
            >
              <span>See documentation</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
