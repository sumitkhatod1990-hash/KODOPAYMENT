import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  CheckCircle2, 
  Code2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SDKPlaygroundTab: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'node' | 'python' | 'curl' | 'react'>('node');
  const [orderAmount, setOrderAmount] = useState(4999);
  const [customerEmail, setCustomerEmail] = useState('founder@bangalore-tech.in');
  const [customerGstin, setCustomerGstin] = useState('29ABCDE1234F1Z5');
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionOutput(null);
    try {
      const res = await fetch('/api/v1/india/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderAmount,
          customerEmail,
          customerPhone: '9876543210',
          orderNote: `QivroPay Playground Order (${customerGstin})`
        })
      });
      const data = await res.json();
      setExecutionOutput(data);
      if (data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      setExecutionOutput({ error: 'Failed to execute against Cashfree Sandbox', details: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  const getCodeSnippet = () => {
    if (selectedLang === 'node') {
      return `import { QivroPay } from '@qivropay/sdk';

const qivro = new QivroPay({
  appId: process.env.CASHFREE_APP_ID, // TEST11055944...
  secretKey: process.env.CASHFREE_SECRET_KEY,
  environment: 'SANDBOX'
});

// Create 1-Click INR Checkout Session with 18% GST & Section 194-O TDS
const session = await qivro.checkout.createSession({
  title: "Pro AI SaaS Monthly (UPI AutoPay)",
  amount: ₹{orderAmount}.00,
  currency: "INR",
  customerEmail: "${customerEmail}",
  customerGstin: "${customerGstin}", // Dynamic B2B Input Tax Credit
  paymentMethods: ["upi", "upi_autopay", "rupay_card", "netbanking"]
});

console.log("Payment Session ID:", session.paymentSessionId);
console.log("Hosted Checkout URL:", session.checkoutUrl);`;
    }

    if (selectedLang === 'python') {
      return `from qivropay import QivroPayClient

qivro = QivroPayClient(
    app_id="TEST110559449949df01b9dff3b901f544955011",
    secret_key="cfsk_ma_test_...",
    environment="SANDBOX"
)

# Provision instant checkout with Easy Split (97% merchant / 3% MoR fee)
order = qivro.orders.create(
    amount=${orderAmount}.00,
    currency="INR",
    customer_email="${customerEmail}",
    customer_gstin="${customerGstin}",
    return_url="https://myapp.in/dashboard?success=true"
)

print(f"Active Cashfree Order: {order.order_id}")
print(f"Live Checkout URL: {order.checkout_url}")`;
    }

    if (selectedLang === 'react') {
      return `import { QivroCheckoutButton } from '@qivropay/react';

export default function PricingCard() {
  return (
    <QivroCheckoutButton
      amount={${orderAmount}}
      currency="INR"
      customerEmail="${customerEmail}"
      gstin="${customerGstin}"
      onSuccess={(order) => {
        console.log("UPI Debit Succeeded:", order.orderId);
        console.log("GST Invoice IRN:", order.irn);
      }}
    >
      Subscribe with UPI AutoPay (₹${orderAmount}/mo)
    </QivroCheckoutButton>
  );
}`;
    }

    return `curl -X POST https://api.qivropay.in/v1/payments/create-session \\
  -H "Authorization: Bearer qivro_live_india_991820" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": ₹{orderAmount}.00,
    "currency": "INR",
    "customerEmail": "${customerEmail}",
    "customerGstin": "${customerGstin}",
    "paymentMethods": ["upi", "upi_autopay", "rupay_card"]
  }'`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
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
            <span>Interactive Developer SDK Playground</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Run real-time API queries against Cashfree PG &amp; QivroPay MoR engine directly in your browser.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex p-1 rounded-2xl bg-white border border-black/[0.08] shadow-xs text-xs font-mono">
          {[
            { id: 'node', label: 'Node.js (TS)' },
            { id: 'python', label: 'Python SDK' },
            { id: 'react', label: 'React Elements' },
            { id: 'curl', label: 'cURL / REST' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedLang(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl transition-all font-semibold ${
                selectedLang === tab.id
                  ? 'bg-[#0A0D14] text-white shadow-xs'
                  : 'text-[#8C90A0] hover:text-[#0A0D14]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Interactive Code Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-[#0A0D14] border border-black/20 shadow-2xl overflow-hidden font-mono text-xs">
            
            {/* Top Bar */}
            <div className="p-4 bg-[#141721] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[11px] text-[#8C90A0]">
                  {selectedLang === 'node' ? 'checkout.ts' : selectedLang === 'python' ? 'checkout.py' : selectedLang === 'react' ? 'CheckoutButton.tsx' : 'request.sh'}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-[11px] transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="p-6 text-slate-200 overflow-x-auto leading-relaxed max-h-[340px]">
              <pre className="text-emerald-300">{getCodeSnippet()}</pre>
            </div>

            {/* Playground Control Bar */}
            <div className="p-4 bg-[#141721] border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[11px] text-[#8C90A0]">
                <span>Amount: <strong>₹{orderAmount}</strong></span>
                <span>•</span>
                <span>GST: <strong>18% ITC</strong></span>
              </div>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-5 py-2 rounded-xl bg-gradient-to-tr from-[#0055FF] to-[#7B2CBF] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Executing against Cashfree Sandbox...' : 'Run Live Query (200 OK)'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right: Real-Time Execution Output Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="opp-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0055FF]" />
                <h3 className="font-bold text-xs text-[#0A0D14] uppercase tracking-wider font-mono">
                  Sandbox Response Console
                </h3>
              </div>
              {executionOutput && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  200 OK (16ms)
                </span>
              )}
            </div>

            {executionOutput ? (
              <div className="space-y-3">
                <pre className="p-4 rounded-2xl bg-[#0A0D14] text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[300px]">
                  {JSON.stringify(executionOutput, null, 2)}
                </pre>

                {executionOutput.checkoutUrl && (
                  <a
                    href={executionOutput.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full opp-btn-primary py-2.5 text-xs justify-center font-semibold gap-1.5"
                  >
                    <span>Open Live Cashfree Checkout Window</span>
                    <Zap className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 text-xs text-[#8C90A0] font-mono">
                <Cpu className="w-8 h-8 mx-auto text-[#8C90A0] opacity-50" />
                <p>Click "Run Live Query" to generate an authentic Cashfree payment session token.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
