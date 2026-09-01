sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Terminal, Copy, CheckCircle2, Play, Code2, ArrowRight } from 'lucide-react';

export const CodeIntegration: React.FC = () => {
  const { setCurrentView } = useApp();
  const [selectedLanguage, setSelectedLanguage] = useState<'node' | 'python' | 'go' | 'curl'>('node');
  const [copied, setCopied] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const codeSamples = {
    node: `import { QivroPay } from '@qivropay/payments';

const qivropay = new QivroPay({
  apiKey: process.env.QIVROPAY_SECRET_KEY
});

// 1. Create instant AI checkout session
const session = await qivropay.checkout.create({
  title: "AI Token Starter Pack",
  amount: 29.00,
  currency: "INR",
  customer: {
    email: "alex.chen@synthflow.ai",
    name: "Alex Chen"
  },
  credits: {
    unit: "tokens",
    amount: 5000000
  },
  successUrl: "https://yourdomain.com/success",
  cancelUrl: "https://yourdomain.com/pricing"
});

console.log("Hosted checkout URL:", session.url);`,

    python: `from qivropay import QivroPay
import os

qivropay = QivroPay(api_key=os.environ.get("QIVROPAY_SECRET_KEY"))

# Create AI Subscription with localized PPP
session = qivropay.checkout.create(
    title="QIVROPAY Pro Subscription",
    amount=79.00,
    currency="INR",
    customer_email="developer@startup.ai",
    billing_type="recurring_monthly",
    interval="month"
)

print("Checkout URL:", session.url)`,

    go: `package main

import (
	"fmt"
	"os"
	"github.com/qivropaypayments/qivropay-go"
)

func main() {
	client := qivropay.NewClient(os.Getenv("QIVROPAY_SECRET_KEY"))

	session, err := client.Checkout.Create(&qivropay.CheckoutParams{
		Title:    "Enterprise Inference Tier",
		Amount:   199.00,
		Currency: "INR",
		CustomerEmail: "cto@company.com",
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("Checkout Link: %s\\n", session.URL)
}`,

    curl: `curl -X POST https://api.qivropay.io/v1/payments/create-session \\
  -H "Authorization: Bearer qivropay_live_9a7d3c5f..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "AI Token Starter Pack",
    "amount": 29.00,
    "currency": "INR",
    "customerEmail": "alex.chen@synthflow.ai"
  }'`
  };

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(codeSamples[selectedLanguage]);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSample = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/v1/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "AI Token Starter Pack",
          amount: 29.00,
          currency: "INR",
          customerEmail: "developer@apple-grade.io"
        })
      });
      const data = await res.json();
      setExecutionResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setExecutionResult(JSON.stringify({ error: "Network error", status: 500 }, null, 2));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="py-24 md:py-36 bg-[#f5f5f7] border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-14 space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#0071e3]">
            Developer Experience
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
            Designed for engineers.
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] max-w-2xl mx-auto">
            Integrate with 3 lines of code. Typed SDKs for TypeScript, Python, and Go with real-time signed webhooks.
          </p>
        </div>

        {/* Apple Terminal Card */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-black/10 overflow-hidden font-mono text-xs shadow-md">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/5 flex flex-wrap items-center justify-between gap-4 bg-[#fafafc]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-sans font-medium text-[#86868b]">qivropay-sdk-playground</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-full border border-black/5">
              {(['node', 'python', 'go', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3.5 py-1 rounded-full uppercase text-[11px] font-bold transition-all ${
                    selectedLanguage === lang
                      ? 'bg-white text-[#1d1d1f] shadow-sm'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {lang === 'node' ? 'Node.js' : lang}
                </button>
              ))}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-8 overflow-x-auto text-slate-100 leading-relaxed bg-[#090a0c]">
            <pre className="text-emerald-400 font-mono">
              {codeSamples[selectedLanguage]}
            </pre>
          </div>

          {/* Action Bar */}
          <div className="border-t border-black/5 bg-[#fafafc] px-8 py-4 flex flex-wrap items-center justify-between gap-4 font-sans">
            <div className="flex items-center gap-2 text-xs text-[#86868b]">
              <Terminal className="w-4 h-4 text-[#0071e3]" />
              <span>Target: <code>POST /api/v1/payments/create-session</code></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunSample}
                disabled={isRunning}
                className="apple-btn-black px-5 py-2.5 text-xs flex items-center gap-2 active:scale-95 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Executing...' : 'Run Live API Call'}</span>
              </button>

              <button
                onClick={() => setCurrentView('docs')}
                className="apple-btn-secondary px-4 py-2 text-xs"
              >
                View Full Docs →
              </button>
            </div>
          </div>

          {/* Output */}
          {executionResult && (
            <div className="border-t border-emerald-500/20 bg-emerald-50/50 p-6 animate-slide-up font-mono">
              <div className="flex justify-between items-center text-emerald-800 font-bold mb-2">
                <span>⚡ Live Server Response (Status: 200 OK):</span>
                <span className="text-[11px] text-emerald-700">Response time: 14ms</span>
              </div>
              <pre className="text-emerald-900 overflow-x-auto p-4 bg-white rounded-2xl border border-emerald-200">
                {executionResult}
              </pre>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
