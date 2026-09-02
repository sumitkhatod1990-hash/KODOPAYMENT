import React, { useEffect } from 'react';
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
  const { user } = useAuth();

  const isAppSubdomain = typeof window !== 'undefined' && (
    window.location.hostname === 'app.qivropay.com' ||
    window.location.hostname.startsWith('app.')
  );

  // If on app.qivropay.com, prioritize Dashboard / Auth workspace
  if (isAppSubdomain) {
    if (currentView === 'checkout') {
      return <HostedCheckout sessionId={activeSessionId} />;
    }
    if (currentView === 'portal') {
      return <CustomerBillingPortal />;
    }
    if (currentView === 'docs') {
      return <DocsPage />;
    }
    if (!user) {
      return <AuthPage />;
    }
    return <DashboardLayout />;
  }

  if (currentView === 'auth') {
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
