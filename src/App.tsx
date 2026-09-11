import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Hero } from './components/landing/Hero';
import { ProductPreview } from './components/landing/ProductPreview';
import { FeatureCards } from './components/landing/FeatureCards';
import { BentoFeatures } from './components/landing/BentoFeatures';
import { ArchitectureFlow } from './components/landing/ArchitectureFlow';
import { CodeIntegration } from './components/landing/CodeIntegration';
import { PricingSection } from './components/landing/PricingSection';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { FirstMerchantOnboarding } from './components/dashboard/FirstMerchantOnboarding';
import { HostedCheckout } from './components/checkout/HostedCheckout';
import { DocsPage } from './components/docs/DocsPage';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/legal/TermsOfServicePage';
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

  if (currentView === 'privacy') {
    return <PrivacyPolicyPage />;
  }

  if (currentView === 'terms') {
    return <TermsOfServicePage />;
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

        {/* Built for businesses operating across markets */}
        <section className="bg-[#f7f6f2] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-6 text-[#151a4a]">
              <div>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#7054E8]">
                  Built for modern businesses
                </p>
                <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-5xl">
                  Payments made simple, wherever you grow.
                </h2>
              </div>
              <span className="hidden text-sm text-[#4d5475]/60 sm:block">
                Cards · Regional rails · Payment links
              </span>
            </div>
            <img
              src="/qivropay-businesses.png"
              alt="QivroPay helping businesses manage payments"
              className="qp-image-lock mx-auto aspect-[16/8] max-w-5xl rounded-[1.5rem] object-cover shadow-[0_18px_50px_-28px_rgba(21,26,74,.3)]"
            />
          </div>
        </section>

        <ProductPreview />
        <FeatureCards />
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

