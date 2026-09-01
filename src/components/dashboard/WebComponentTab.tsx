sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Zap, 
  CheckCircle2, 
  MonitorPlay,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WebComponentTab: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [productId, setProductId] = useState('prod_qivropay_pro_49');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const snippet = `<!-- 1. Include the Ultra-Lightweight QIVROPAY Web Component Loader (2.4kb) -->
<script type="module" src="https://js.qivropay.io/v1/qivropay-checkout.js"></script>

<!-- 2. Drop the Zero-Iframe Shadow DOM Checkout Element Anywhere -->
<qivropay-checkout
  product-id="${productId}"
  theme="${theme}"
  currency="INR"
  mor-nexus="true"
  on-success="handlePaymentSuccess"
></qivropay-checkout>

<script>
  function handlePaymentSuccess(event) {
    console.log('Payment Succeeded with 0% Tax Liability:', event.detail);
    window.location.href = '/thank-you?tx=' + event.detail.transactionId;
  }
</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Code2 className="w-6 h-6 text-[#0055FF]" />
            <span>Zero-Iframe Native &lt;qivropay-checkout&gt; Web Component</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Drop-in Shadow DOM Web Component rendering native Apple Pay, Cards, and BNPL without iframe performance penalties or CSS layout thrashing.
          </p>
        </div>

        <button
          onClick={copyCode}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied HTML Snippet!' : 'Copy Web Component Code'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Bundle Payload Size</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">2.4 kB Gzipped</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sub-50ms Shadow DOM Init
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Framework Compatibility</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">100% Universal</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">React, Vue, Svelte, Angular, Webflow</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">PCI-DSS Scope Insulation</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">SAQ-A Compliant</div>
          <div className="text-[11px] text-purple-700 font-mono">Full tokenization in Shadow DOM</div>
        </div>
      </div>

      {/* Live Preview & Code Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Snippet */}
        <div className="opp-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5">
            <h3 className="font-bold text-sm text-[#0A0D14] font-heading">HTML & JS Custom Element</h3>
            <span className="text-[10px] font-mono text-[#8C90A0]">W3C WEB COMPONENT SPEC</span>
          </div>

          <pre className="p-4 rounded-2xl bg-[#0A0D14] text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
            {snippet}
          </pre>
        </div>

        {/* Right: Live Interactive Shadow DOM Mockup */}
        <div className="opp-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5">
            <h3 className="font-bold text-sm text-[#0A0D14] font-heading flex items-center gap-1.5">
              <MonitorPlay className="w-4 h-4 text-[#0055FF]" />
              <span>Rendered Shadow DOM Preview</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              LIVE NATIVE RENDER
            </span>
          </div>

          <div className="p-6 rounded-2xl border border-black/10 bg-[#FAFBFD] space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-[#0A0D14]">Pro Developer Plan</h4>
                <p className="text-xs text-[#8C90A0]">₹49.00 INR / month • Auto-renews</p>
              </div>
              <span className="opp-badge text-emerald-700 bg-emerald-50 border-emerald-200">0% TAX (MoR)</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                readOnly
                value="4242 •••• •••• 4242   12/28   CVC 991"
                className="w-full p-2.5 rounded-xl border border-black/10 bg-white font-mono text-xs text-[#0A0D14]"
              />
              <button className="w-full opp-btn-primary py-2.5 font-semibold text-xs flex items-center justify-center gap-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay ₹49.00 INR (1-Click Apple Pay)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
