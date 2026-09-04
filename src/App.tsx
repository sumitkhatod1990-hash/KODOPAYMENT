import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Hero } from './components/landing/Hero';
import { ProductPreview } from './components/landing/ProductPreview';
import { BentoFeatures } from './components/landing/BentoFeatures';
import { ArchitectureFlow } from './components/landing/ArchitectureFlow';
import { CodeIntegration } from './components/landing/CodeIntegration';
import { PricingSection } from './components/landing/PricingSection';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { FirstMerchantOnboarding } from './components/dashboard/FirstMerchantOnboarding';
import { HostedCheckout } from './components/checkout/HostedCheckout';
import { DocsPage } from './components/docs/DocsPage';
import { CustomerBillingPortal } from './components/portal/CustomerBillingPortal';
import { AuthPage } from './components/auth/AuthPage';
import { useAuth } from './context/AuthContext';

import { SupportChat } from './components/common/SupportChat';

export const App: React.FC = () => {
  const { currentView, activeSessionId, merchantProfile, profileLoading } = useApp();
  const { user, loading: authLoading } = useAuth();

  if (currentView === 'auth') {
    return <AuthPage />;
  }

  if (currentView === 'dashboard') {
    if (authLoading) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading your workspace…</div>;
    if (!user) return <AuthPage />;
    if (profileLoading) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading your workspace…</div>;
    if (merchantProfile && !merchantProfile.onboardingCompletedAt) return <FirstMerchantOnboarding />;
    return <DashboardLayout />;
  }

  if (currentView === 'checkout') {
    return <HostedCheckout sessionId={activeSessionId} />;
  }

  if (currentView === 'docs') {
    return (
      <>
        <DocsPage />
        <SupportChat />
      </>
    );
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
        <ProductPreview />
        <BentoFeatures />
        <ArchitectureFlow />
        <CodeIntegration />
        <PricingSection />
      </main>

      <Footer />
      <SupportChat />
    </div>
  );
};

