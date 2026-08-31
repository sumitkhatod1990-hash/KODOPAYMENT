import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Palette, 
  Save, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  CreditCard, 
  CheckCircle2, 
  Sun, 
  Moon,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ThemeStudioTab: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#0055FF');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [borderRadius, setBorderRadius] = useState<'8px' | '16px' | '24px'>('16px');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [customCss, setCustomCss] = useState('/* Custom merchant checkout CSS overrides */\n.kodo-btn-pay {\n  box-shadow: 0 8px 24px rgba(0, 85, 255, 0.25);\n}');
  const [saved, setSaved] = useState(false);

  const handleSaveTheme = () => {
    setSaved(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#0055FF]" />
            <span>White-Label Checkout Branding & Theme Studio</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Customize colors, typography, border styling, and dark mode themes for your hosted checkout pages with real-time live preview.
          </p>
        </div>

        <button
          onClick={handleSaveTheme}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Branding Saved & Live' : 'Publish Branding'}</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="opp-card p-6 space-y-5">
            <h3 className="font-bold text-sm text-[#0A0D14] border-b border-black/5 pb-2">
              Color Palette & Style
            </h3>

            {/* Primary Brand Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#0A0D14]">Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-black/10 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs text-[#0A0D14] uppercase flex-1"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#0A0D14]">Success / Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-black/10 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs text-[#0A0D14] uppercase flex-1"
                />
              </div>
            </div>

            {/* Theme Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#0A0D14]">Default Checkout Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    themeMode === 'light' ? 'border-[#0055FF] bg-blue-50/60 text-[#0055FF]' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    themeMode === 'dark' ? 'border-[#0055FF] bg-[#0A0D14] text-white' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#0A0D14]">Container Corner Radius</label>
              <div className="grid grid-cols-3 gap-2">
                {(['8px', '16px', '24px'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBorderRadius(r)}
                    className={`py-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                      borderRadius === r ? 'border-[#0055FF] bg-white text-[#0055FF] shadow-xs' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom CSS */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#0A0D14]">Custom CSS Overrides</label>
              <textarea
                rows={3}
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0A0D14] text-emerald-300 font-mono text-xs outline-none border border-white/10"
              />
            </div>

          </div>

        </div>

        {/* Right: Live Checkout Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8C90A0]">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#0055FF]" />
              <span>LIVE RENDER PREVIEW</span>
            </span>
            <span className="text-emerald-700">● 100% Pixel-Accurate</span>
          </div>

          <div 
            className={`p-6 sm:p-8 border shadow-xl transition-all ${
              themeMode === 'dark' ? 'bg-[#0A0D14] text-white border-white/10' : 'bg-white text-[#0A0D14] border-black/10'
            }`}
            style={{ borderRadius: borderRadius }}
          >
            <div className="max-w-md mx-auto space-y-6">
              
              <div className="flex justify-between items-start pb-4 border-b border-black/5">
                <div>
                  <h4 className="font-bold text-lg font-heading">Pro Developer Plan</h4>
                  <p className="text-xs text-[#8C90A0]">Unlimited AI inference & API access</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono">$49.00</div>
                  <div className="text-[10px] text-[#8C90A0] uppercase font-mono">USD / month</div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F4F5F8] text-[#0A0D14] flex justify-between items-center font-mono">
                  <span>4242 •••• •••• 4242</span>
                  <span className="text-[#8C90A0]">12/28 • 888</span>
                </div>

                <button
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Subscribe • $49.00 USD</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[11px] text-[#8C90A0]">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Encrypted & Insulated by KODO Merchant of Record</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
