import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  Package, 
  Zap,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AICopilotTab: React.FC = () => {
  const { refreshData } = useApp();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const samplePrompts = [
    "Create a $49/mo Pro AI plan with 50M tokens and 50% India PPP discount",
    "Generate a $199 perpetual license key for self-hosted agent clusters",
    "Provision a $19 dedicated GPU priority compute queue with 1-click checkout"
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/v1/copilot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.success) {
        setGenerationResult(data);
        await refreshData();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('AI Copilot generation error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#0055FF]" />
          <span>AI Prompt-to-Checkout Copilot</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#8C90A0]">
          Describe your pricing model or software product in plain English, and KODO's copilot will provision the product, configure global tax rules, and generate your live checkout link.
        </p>
      </div>

      {/* Input Box */}
      <div className="opp-card p-6 sm:p-8 space-y-4">
        
        <form onSubmit={handleGenerate} className="space-y-3">
          <label className="text-xs font-mono uppercase font-bold text-[#8C90A0]">
            Describe Product & Pricing Model in Plain English
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g. Create a $79/mo subscription for Enterprise AI Developers with 14-day trial, automated EU VAT deduction, and 50% discount for India and Brazil..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#F4F5F8] border border-black/10 text-xs sm:text-sm text-[#0A0D14] outline-none focus:border-[#0055FF] transition-all resize-none pr-28"
            />
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-3 bottom-4 opp-btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Link'}</span>
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] text-[#8C90A0] font-mono">Try one of these prompt templates:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-[#FAFBFD] border border-black/5 text-[#0055FF] hover:border-black/20 text-left transition-all"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Generated Result Container */}
      {generationResult && (
        <div className="opp-card p-6 sm:p-8 space-y-6 animate-fade-in border-2 border-[#0055FF]/30">
          
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-[#0A0D14] font-heading">
                Product Generated Successfully
              </h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              LIVE ON RAILS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5">
              <span className="text-[#8C90A0]">Product Title:</span>
              <div className="font-bold text-sm text-[#0A0D14] mt-1">{generationResult.product.name}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5">
              <span className="text-[#8C90A0]">Billing Model:</span>
              <div className="font-bold text-sm text-[#0055FF] mt-1 uppercase">{generationResult.product.type}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5">
              <span className="text-[#8C90A0]">Base Price:</span>
              <div className="font-bold text-sm text-emerald-700 mt-1">${generationResult.product.price.toFixed(2)} USD</div>
            </div>
          </div>

          {/* Checkout URL Box */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#8C90A0]">Hosted Checkout URL</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generationResult.checkoutUrl}
                className="flex-1 p-3 rounded-xl bg-[#F4F5F8] border border-black/10 font-mono text-xs text-[#0A0D14]"
              />
              <button
                onClick={() => copyUrl(generationResult.checkoutUrl)}
                className="opp-btn-primary px-4 py-3 text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Embed Code Snippet */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#8C90A0]">Embeddable 1-Click Button Snippet</span>
            <pre className="p-4 rounded-2xl bg-[#0A0D14] text-emerald-300 font-mono text-xs overflow-x-auto">
              {generationResult.embedSnippet}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
