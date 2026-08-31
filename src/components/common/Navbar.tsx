import React from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFC]/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Logo onClick={() => setCurrentView('landing')} />
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-[#8C90A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>MoR Engine Active</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#6E717D]">
          <button 
            onClick={() => setCurrentView('landing')} 
            className="hover:text-[#0A0D14] transition-colors"
          >
            Overview
          </button>
          <button 
            onClick={() => setCurrentView('dashboard', { tab: 'products' })} 
            className="hover:text-[#0A0D14] transition-colors"
          >
            Products & Pricing
          </button>
          <button 
            onClick={() => setCurrentView('dashboard', { tab: 'developer' })} 
            className="hover:text-[#0A0D14] transition-colors"
          >
            Developer Hub
          </button>
          <button 
            onClick={() => setCurrentView('docs')} 
            className="hover:text-[#0A0D14] transition-colors"
          >
            Documentation
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('checkout')}
            className="hidden sm:inline-flex opp-btn-secondary py-2 px-4 text-xs font-semibold"
          >
            Test Checkout
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="opp-btn-primary py-2 px-5 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
