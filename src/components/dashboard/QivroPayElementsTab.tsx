sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Code2, 
  Copy, 
  Check, 
  Layers, 
  Sparkles, 
  CreditCard, 
  CheckCircle2, 
  Smartphone,
  ExternalLink,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QivroPayElementsTab: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<'react' | 'vue' | 'html'>('react');
  const [selectedComponent, setSelectedComponent] = useState<'pricing' | 'card' | 'portal'>('pricing');
  const [copiedCode, setCopiedCode] = useState(false);

  const snippets = {
    pricing: {
      react: `import { QivroPayPricingTable } from '@qivropay/elements-react';

export default function PricingSection() {
  return (
    <QivroPayPricingTable 
      apiKey="pk_live_qivropay_9812..."
      productId="prod_starter"
      theme="light"
      showPPPBanners={true}
      onSuccess={(session) => console.log('Subscription active:', session)}
    />
  );
}`,
      vue: `<script setup>
import { QivroPayPricingTable } from '@qivropay/elements-vue';
</script>

<template>
  <QivroPayPricingTable 
    apiKey="pk_live_qivropay_9812..."
    productId="prod_starter"
    :showPPPBanners="true"
  />
</template>`,
      html: `<!-- QIVROPAY Elements HTML Embed -->
<script src="https://js.qivropay.io/v1/elements.js"></script>
<div id="qivropay-pricing-container"></div>
<script>
  QivroPayElements.renderPricingTable('#qivropay-pricing-container', {
    apiKey: 'pk_live_qivropay_9812...',
    productId: 'prod_starter'
  });
</script>`
    },
    card: {
      react: `import { QivroPayCardElement, useQivroPay } from '@qivropay/elements-react';

export function InlineCheckout() {
  const { createToken } = useQivroPay();

  const handlePay = async () => {
    const { token, error } = await createToken();
    if (!error) console.log('Charged successfully:', token);
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <QivroPayCardElement hidePostalCode={false} />
      <button type="submit" className="opp-btn-primary">Pay ₹49 INR</button>
    </form>
  );
}`,
      vue: `<script setup>
import { QivroPayCardElement } from '@qivropay/elements-vue';
</script>

<template>
  <QivroPayCardElement :hidePostalCode="false" />
</template>`,
      html: `<script src="https://js.qivropay.io/v1/elements.js"></script>
<div id="qivropay-card-element"></div>
<script>
  const card = QivroPayElements.createCardElement('#qivropay-card-element');
</script>`
    },
    portal: {
      react: `import { QivroPayCustomerPortalWidget } from '@qivropay/elements-react';

export function UserSettings() {
  return (
    <QivroPayCustomerPortalWidget 
      customerId="cus_qivropay_991"
      allowCancel={true}
      allowPaymentMethodUpdate={true}
    />
  );
}`,
      vue: `<script setup>
import { QivroPayCustomerPortalWidget } from '@qivropay/elements-vue';
</script>

<template>
  <QivroPayCustomerPortalWidget customerId="cus_qivropay_991" />
</template>`,
      html: `<script src="https://js.qivropay.io/v1/elements.js"></script>
<div id="qivropay-portal-widget"></div>
<script>
  QivroPayElements.renderPortal('#qivropay-portal-widget', { customerId: 'cus_qivropay_991' });
</script>`
    }
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(snippets[selectedComponent][selectedFramework]);
    setCopiedCode(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#0055FF]" />
          <span>QIVROPAY Elements UI Component Library</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#8C90A0]">
          Drop-in, styled UI components with built-in Apple Pay, 3DS 2.0 fraud defense, and Purchasing Power Parity (PPP) localization.
        </p>
      </div>

      {/* Component Picker & Framework Switcher */}
      <div className="opp-card p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
          <div className="flex gap-2">
            {[
              { id: 'pricing', label: 'Pricing Table' },
              { id: 'card', label: 'Card Element' },
              { id: 'portal', label: 'Customer Portal Widget' }
            ].map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedComponent(comp.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedComponent === comp.id
                    ? 'bg-[#0A0D14] text-white shadow-xs'
                    : 'bg-[#F4F5F8] text-[#6E717D] hover:text-[#0A0D14]'
                }`}
              >
                {comp.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-[#F4F5F8] border border-black/5 text-xs font-semibold">
            {(['react', 'vue', 'html'] as const).map((fw) => (
              <button
                key={fw}
                onClick={() => setSelectedFramework(fw)}
                className={`px-3 py-1.5 rounded-lg uppercase text-[11px] font-mono transition-all ${
                  selectedFramework === fw
                    ? 'bg-white text-[#0055FF] font-bold shadow-xs'
                    : 'text-[#6E717D] hover:text-[#0A0D14]'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        {/* Live Visual Preview */}
        <div className="p-8 rounded-2xl bg-[#FAFBFD] border border-black/5 space-y-4">
          <div className="text-xs font-mono uppercase font-bold text-[#8C90A0] flex items-center justify-between">
            <span>Interactive Component Preview</span>
            <span className="text-emerald-700">● Live Canvas</span>
          </div>

          {selectedComponent === 'pricing' && (
            <div className="max-w-sm mx-auto p-6 rounded-3xl bg-white border border-black/10 shadow-lg space-y-4 text-center">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0055FF] text-[10px] font-bold font-mono">
                POPULAR PRO TIER
              </span>
              <div className="text-3xl font-bold font-mono text-[#0A0D14]">₹49<span className="text-xs text-[#8C90A0]">/month</span></div>
              <p className="text-xs text-[#6E717D]">50M AI inference tokens & automated tax compliance</p>
              <button className="w-full opp-btn-primary py-2.5 text-xs font-bold shadow-md">
                Subscribe with 1-Click
              </button>
            </div>
          )}

          {selectedComponent === 'card' && (
            <div className="max-w-sm mx-auto p-6 rounded-3xl bg-white border border-black/10 shadow-lg space-y-3">
              <label className="text-xs font-semibold text-[#0A0D14]">Card Details</label>
              <div className="p-3 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs text-[#0A0D14] flex justify-between items-center">
                <span>4242 •••• •••• 4242</span>
                <span className="text-[#8C90A0]">12/28 • 888</span>
              </div>
              <button className="w-full opp-btn-primary py-2.5 text-xs font-bold">
                Pay Now
              </button>
            </div>
          )}

          {selectedComponent === 'portal' && (
            <div className="max-w-sm mx-auto p-6 rounded-3xl bg-white border border-black/10 shadow-lg space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold text-[#0A0D14]">
                <span>Active Subscription</span>
                <span className="text-emerald-700">● Active</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F5F8] text-[#6E717D]">
                Renews on Sept 30, 2026 for ₹49.00 INR
              </div>
              <div className="flex gap-2">
                <button className="opp-btn-secondary flex-1 py-1.5 text-[11px] font-semibold">Change Card</button>
                <button className="opp-btn-secondary flex-1 py-1.5 text-[11px] font-semibold text-rose-600">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-[#8C90A0]">Drop-In Code Snippet</span>
            <button
              onClick={copySnippet}
              className="opp-btn-primary px-3 py-1 text-xs font-semibold flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-5 rounded-2xl bg-[#0A0D14] text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10">
            {snippets[selectedComponent][selectedFramework]}
          </pre>
        </div>

      </div>

    </div>
  );
};
