import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Link2, 
  CreditCard, 
  Receipt, 
  Landmark, 
  ArrowRight
} from 'lucide-react';

interface FeatureStripe {
  id: string;
  title: string;
  icon: React.ElementType;
  bgColor: string;
}

const STRIPES: FeatureStripe[] = [
  {
    id: 'payment-links',
    title: 'Payment Links',
    icon: Link2,
    bgColor: 'bg-[#0055FF]'
  },
  {
    id: 'global-cards',
    title: 'Global Cards & Rails',
    icon: CreditCard,
    bgColor: 'bg-[#0A0D14]'
  },
  {
    id: 'payments-ledger',
    title: 'Payments & Ledger',
    icon: Receipt,
    bgColor: 'bg-[#1E293B]'
  },
  {
    id: 'settlements',
    title: 'Settlements',
    icon: Landmark,
    bgColor: 'bg-[#2563EB]'
  }
];

export const PaymentInfrastructure: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Continuous smooth loop interval
  useEffect(() => {
    if (isHovered || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STRIPES.length);
    }, 3400);

    return () => clearInterval(interval);
  }, [isHovered, prefersReducedMotion]);

  return (
    <section className="py-20 md:py-28 bg-[#FAFAFC] border-t border-black/[0.06] overflow-x-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-[460px] flex items-center">
        
        {/* Split Layout Container */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE CONTENT - Standard Container Width */}
          <div className="lg:col-span-6 space-y-6 text-left max-w-xl">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-[#0055FF] text-xs font-mono font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse" />
              <span>PAYMENT INFRASTRUCTURE</span>
            </div>

            {/* Main Heading & Faded Secondary Heading */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A0D14] tracking-tight leading-[1.08]">
                Your payments should just work.
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#989BAA] tracking-tight leading-[1.15]">
                Why are you still building payment infrastructure?
              </p>
            </div>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#6E717D] leading-relaxed max-w-xl font-normal pt-1">
              Accept payments, create checkout links, track transactions, and manage your payment operations from one place — multi-currency payment infrastructure built for modern businesses.
            </p>

            {/* CTA Button Group */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => (user ? setCurrentView('dashboard') : setCurrentView('auth', { mode: 'signup' }))}
                className="opp-btn-primary px-7 py-3.5 text-sm gap-2"
              >
                <span>{user ? 'Go to dashboard' : 'Start collecting payments'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('docs')}
                className="opp-btn-secondary px-6 py-3.5 text-sm gap-2 text-[#6E717D] hover:text-[#0A0D14]"
              >
                <span>Read technical docs</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE STRIPES - Shifted Right & Anchored to Viewport Right Edge */}
          <div 
            className="lg:col-span-6 w-full lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[440px] xl:w-[480px] 2xl:w-[520px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex flex-col gap-3.5 sm:gap-4 relative">
              {STRIPES.map((stripe, index) => {
                const Icon = stripe.icon;
                
                // Relative display slot for continuous stack reordering animation
                const slot = (index - activeIndex + STRIPES.length) % STRIPES.length;
                const isActive = slot === 0;

                return (
                  <div
                    key={stripe.id}
                    onClick={() => setActiveIndex(index)}
                    className={`
                      cursor-pointer py-4 sm:py-4.5 lg:py-5 px-6 sm:px-8 
                      transition-all duration-500 ease-in-out select-none flex items-center justify-between gap-4
                      rounded-2xl sm:rounded-3xl lg:rounded-l-[28px] lg:rounded-r-none
                      ${stripe.bgColor} text-white
                      ${isActive 
                        ? 'opacity-100 shadow-lg shadow-blue-500/10 lg:-translate-x-3 z-20 ring-1 ring-white/20' 
                        : 'opacity-90 hover:opacity-100 lg:translate-x-0 z-10'
                      }
                    `}
                    style={{
                      order: slot,
                      transitionProperty: 'transform, opacity, box-shadow',
                    }}
                  >
                    {/* Icon & Clean Bold Label */}
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-2xl font-extrabold tracking-tight text-white font-heading">
                        {stripe.title}
                      </h3>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping mr-4 lg:mr-8 shrink-0" title="Active feature" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Visual Indicator Dots */}
            <div className="flex items-center justify-center lg:justify-start gap-2 pt-5 lg:pl-2">
              {STRIPES.map((stripe, idx) => (
                <button
                  key={stripe.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex 
                      ? 'w-7 bg-[#0055FF]' 
                      : 'w-2 bg-black/15 hover:bg-black/30'
                  }`}
                  aria-label={`Show ${stripe.title} feature`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
