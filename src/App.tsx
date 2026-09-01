sed: --: No such file or directory
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
  const { user, loading: authLoading } = useAuth();

  // India-only safeguard for dynamic values returned by older records or APIs.
  // Source defaults are INR; this keeps a stale dollar-prefixed value from
  // briefly appearing in the UI while data is being migrated.
  useEffect(() => {
    const normalizeText = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) textNodes.push(node as Text);

      textNodes.forEach((textNode) => {
        const parent = textNode.parentElement;
        if (parent?.closest('script, style, pre, code')) return;
        const next = textNode.nodeValue
          ?.replace(/\$([0-9])/g, '₹$1')
          .replace(/\(\$\)/g, '(₹)')
          .replace(/\bUSD\b/g, 'INR');
        if (next && next !== textNode.nodeValue) textNode.nodeValue = next;
      });
    };

    normalizeText(document.body);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(normalizeText));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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
