import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Hero } from './components/landing/Hero';
import { BentoFeatures } from './components/landing/BentoFeatures';
import { ArchitectureFlow } from './components/landing/ArchitectureFlow';
import { PricingCalculator } from './components/landing/PricingCalculator';
import { CodeIntegration } from './components/landing/CodeIntegration';
import { WallOfLove } from './components/landing/WallOfLove';
import { ComparisonTable } from './components/landing/ComparisonTable';
import { CTASection } from './components/landing/CTASection';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { HostedCheckout } from './components/checkout/HostedCheckout';
import { DocsPage } from './components/docs/DocsPage';
import { CustomerBillingPortal } from './components/portal/CustomerBillingPortal';
import { AuthPage } from './components/auth/AuthPage';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { currentView, activeSessionId } = useApp();
  const { user, loading: authLoading } = useAuth();

  if (currentView === 'dashboard' && authLoading) {
    return <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-gray-500">Loading your secure workspace…</div>;
  }

  if (currentView === 'auth' || (currentView === 'dashboard' && !user)) {
    return <AuthPage />;
  }

  if (currentView === 'dashboard') {
    return <DashboardLayout />;
  }

  if (currentView === 'checkout') {
    return <HostedCheckout sessionId={activeSessionId} />;
  }

  if (currentView === 'docs') {
    return <DocsPage />;
  }

  if (currentView === 'portal') {
    return <CustomerBillingPortal />;
  }

  // Default: Landing Page
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#1d1d1f] flex flex-col selection:bg-[#0071e3] selection:text-white">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <BentoFeatures />
        <ArchitectureFlow />
        <PricingCalculator />
        <CodeIntegration />
        <WallOfLove />
        <ComparisonTable />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};
