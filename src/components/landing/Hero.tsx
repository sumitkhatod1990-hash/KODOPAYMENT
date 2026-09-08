import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, CalendarDays } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();

  const handleBookDemo = () => {
    const pricingEl = document.getElementById('pricing');
    if (pricingEl) {
      pricingEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView('auth', { mode: 'signup' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#f7f6f2] px-0 pb-10 pt-24 sm:pb-16 md:pt-36 md:pb-24">
      {/* Background gradients */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(63,123,255,.35),transparent_62%),linear-gradient(180deg,transparent,rgba(112,84,232,.15))] -z-10 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(135deg,rgba(21,26,74,.18)_1px,transparent_1px),linear-gradient(45deg,rgba(21,26,74,.12)_1px,transparent_1px)] [background-size:34px_34px] -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Top Tag */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="opp-badge max-w-full bg-white/70 text-[9px] text-[#151a4a] sm:text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#7054E8] animate-pulse" />
            <span>🇮🇳 INDIA PAYMENTS / BUILT FOR DEVELOPERS</span>
          </div>
        </div>

        {/* 2-column Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-[0.82fr_1.18fr] items-center gap-8 lg:gap-14">
          <div className="space-y-6">
            <h1 className="hero-reveal text-[clamp(3.25rem,15vw,6.4rem)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#151a4a]">
              Payments,
              <br />
              beautifully
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7054E8] to-[#3F7BFF]">
                handled.
              </span>
            </h1>

            <p className="hero-reveal hero-reveal-delay-1 max-w-md text-base font-normal leading-relaxed text-[#4d5475] sm:text-xl">
              India-first infrastructure for UPI, cards, and payment links—designed to make every payment feel simple.
            </p>

            <div className="hero-reveal hero-reveal-delay-2 flex flex-wrap items-center gap-3 pt-2 sm:gap-3.5">
              <button
                onClick={() => (user ? setCurrentView('dashboard') : setCurrentView('auth', { mode: 'signup' }))}
                className="opp-btn-primary px-8 py-3.5 text-sm gap-2"
              >
                <span>{user ? 'Go to dashboard' : 'Start building'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleBookDemo}
                className="opp-btn-secondary px-7 py-3.5 text-sm gap-2"
              >
                <CalendarDays className="w-4 h-4" /> Book a Demo
              </button>

              <button
                onClick={() => setCurrentView('docs')}
                className="opp-btn-secondary px-7 py-3.5 text-sm gap-2"
              >
                <span>Read the docs</span>
              </button>
            </div>
          </div>

          <div className="hero-phone-wrap hero-reveal hero-reveal-delay-2 qp-image-frame mt-10 aspect-[4/3] md:mt-0">
            <img
              src="/qivropay-phone-dark.png"
              alt="QivroPay mobile payment experience"
              className="qp-image-lock mx-auto max-w-3xl rounded-[2rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
