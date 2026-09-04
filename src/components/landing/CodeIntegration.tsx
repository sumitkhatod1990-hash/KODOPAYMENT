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
    node: `const response = await fetch("https://your-qivropay-domain.com/api/v1/payments/create-session", {
  method: "POST",
  headers: {
    "Authorization": ` + "`Bearer ${process.env.QIVRO_API_KEY}`" + `,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    productId: "prod_..."
  })
});

const session = await response.json();
console.log(session.url);`,
    python: `import os, requests

response = requests.post(
    "https://your-qivropay-domain.com/api/v1/payments/create-session",
    headers={"Authorization": f"Bearer {os.environ['QIVRO_API_KEY']}"},
    json={"productId": "prod_..."},
)
print(response.json()["url"])`,
    go: `req, _ := http.NewRequest("POST", baseURL+"/api/v1/payments/create-session", nil)
req.Header.Set("Authorization", "Bearer "+os.Getenv("QIVRO_API_KEY"))
req.Header.Set("Content-Type", "application/json")`,
    curl: `curl -X POST https://your-qivropay-domain.com/api/v1/payments/create-session \
  -H "Authorization: Bearer qivro_test_..." \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_..."}'`
  };

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(codeSamples[selectedLanguage]);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSample = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/v1/health');
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
            Create a checkout session from your server, send the customer to the hosted checkout, and verify payment server-side.
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
                <span>{isRunning ? 'Executing...' : 'Check API Health'}</span>
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
                <span>Server Response:</span>
                <span className="text-[11px] text-emerald-700">Local health check</span>
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
