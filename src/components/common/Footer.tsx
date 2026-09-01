import React from 'react';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="w-full border-t border-black/10 bg-[#f5f5f7] text-[#6e6e73] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Logo size="lg" showSubtitle={true} onClick={() => setCurrentView('landing')} />
            <p className="text-xs text-[#86868b] max-w-sm leading-relaxed">
              The all-in-one billing and payments platform for AI-first companies. From credit-based billing and LLM token metering to subscriptions and global payments in 220+ countries.
            </p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/10 text-xs font-medium text-emerald-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Payment Systems Operational (99.99% SLA)
            </div>
          </div>

          {/* Column: Billing */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1d1d1f]">
              Billing Models
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentView('dashboard', { tab: 'products' })} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Credit-Based Billing
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('dashboard', { tab: 'products' })} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Usage & Metered Events
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('dashboard', { tab: 'products' })} className="hover:text-[#1d1d1f] hover:underline text-left">
                  SaaS Subscriptions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('dashboard', { tab: 'payment-links' })} className="hover:text-[#1d1d1f] hover:underline text-left">
                  One-Time Checkouts
                </button>
              </li>
            </ul>
          </div>

          {/* Column: Platform & MoR */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1d1d1f]">
              Global MoR
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentView('landing')} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Merchant of Record
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('landing')} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Tax & VAT Compliance
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('landing')} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Adaptive Currencies
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('landing')} className="hover:text-[#1d1d1f] hover:underline text-left">
                  Purchasing Power (PPP)
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
                  API Reference
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('dashboard', { tab: 'developer' })} className="hover:text-[#0071e3] hover:underline text-left">
                  API Keys & Sandbox
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('dashboard', { tab: 'developer' })} className="hover:text-[#0071e3] hover:underline text-left">
                  Webhook Endpoints
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('docs')} className="hover:text-[#0071e3] hover:underline text-left">
                  Node.js / Python SDKs
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#86868b]">
          <div className="flex items-center gap-4">
            <span>© 2026 QivroPay (by Neocraft LLP). All rights reserved.</span>
            <span>•</span>
            <span>PCI-DSS Level 1</span>
            <span>•</span>
            <span>Bharat Sovereign MoR</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-[#1d1d1f] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#1d1d1f] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#1d1d1f] cursor-pointer">Master Reseller Agreement</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
