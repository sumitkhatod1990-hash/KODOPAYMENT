import React, { useLayoutEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { ArrowRight, Menu, X } from 'lucide-react';

// Scrolls to an in-page landing anchor, navigating to the landing view first
// if we're not already there. Only used for genuinely public destinations
// (Product/Pricing sections) — never a stand-in for setCurrentView('dashboard'
// | 'auth'), which would wall off a logged-out visitor unexpectedly.
const useScrollToLandingSection = () => {
  const { currentView, setCurrentView } = useApp();
  return (id: string) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (currentView !== 'landing') {
      setCurrentView('landing');
      requestAnimationFrame(() => requestAnimationFrame(scroll));
    } else {
      scroll();
    }
  };
};

export const Navbar: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const goToSection = useScrollToLandingSection();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const navLinks = [
    { label: 'Product', onClick: () => goToSection('product') },
    { label: 'Documentation', onClick: () => setCurrentView('docs') },
    { label: 'Pricing', onClick: () => goToSection('pricing') },
  ];

  // Publish the navbar's real rendered height as a CSS custom property so
  // fixed-position content below it (e.g. the docs page shell) can offset
  // itself correctly instead of guessing a static pixel value. Recomputes
  // whenever the header's box changes (breakpoint changes, mobile menu
  // open/close, font load, etc).
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setHeightVar = () => {
      document.documentElement.style.setProperty('--qp-navbar-height', `${el.offsetHeight}px`);
    };
    setHeightVar();
    const observer = new ResizeObserver(setHeightVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFC]/80 backdrop-blur-xl border-b border-black/[0.06] transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">

        {/* Left: Brand Logo */}
        <Logo onClick={() => setCurrentView('landing')} />

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#6E717D]">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={link.onClick}
              className="hover:text-[#0A0D14] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="opp-btn-primary py-2 px-5 text-xs font-semibold gap-1.5 shadow-sm"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('auth', { mode: 'login' })}
                className="opp-btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => setCurrentView('auth', { mode: 'signup' })}
                className="opp-btn-primary py-2 px-5 text-xs font-semibold gap-1.5 shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 text-[#0A0D14]"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-black/[0.06] bg-[#FAFAFC] px-4 sm:px-6 py-4 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => { link.onClick(); setMobileOpen(false); }}
              className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-[#0A0D14] hover:bg-black/[0.04]"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => { setCurrentView('dashboard'); setMobileOpen(false); }}
                className="opp-btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setCurrentView('auth', { mode: 'login' }); setMobileOpen(false); }}
                  className="opp-btn-secondary w-full py-3 text-sm font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => { setCurrentView('auth', { mode: 'signup' }); setMobileOpen(false); }}
                  className="opp-btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
