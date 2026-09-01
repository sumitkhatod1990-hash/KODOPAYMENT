import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Languages, 
  Globe2, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LocalizationTab: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'de' | 'fr' | 'es' | 'ja' | 'hi'>('de');

  const translations = {
    en: {
      name: 'English (US)',
      btn: 'Pay $49.00 USD (1-Click Apple Pay)',
      vatNotice: 'Prices include all applicable sales taxes under QIVROPAY Merchant of Record.',
      cardPlaceholder: 'Card number • MM / YY • CVC',
      trust: '100% Tax Nexus Insulated'
    },
    de: {
      name: 'Deutsch (Germany & Austria)',
      btn: 'Jetzt 49,00 € bezahlen (1-Klick Apple Pay)',
      vatNotice: 'Preise inkl. gesetzlicher MwSt. Abgewickelt über QIVROPAY als Merchant of Record.',
      cardPlaceholder: 'Kartennummer • MM / JJ • CVC',
      trust: '100% MwSt.-sicher abgewickelt'
    },
    fr: {
      name: 'Français (France & EU)',
      btn: 'Payer 49,00 € (1-Clic Apple Pay)',
      vatNotice: 'Prix TTC avec TVA incluse gérée par QIVROPAY Merchant of Record.',
      cardPlaceholder: 'Numéro de carte • MM / AA • CVC',
      trust: '100% Conforme TVA UE'
    },
    es: {
      name: 'Español (Spain & LatAm)',
      btn: 'Pagar $49.00 USD (Apple Pay en 1 Clic)',
      vatNotice: 'Precios con impuestos incluidos bajo QIVROPAY Merchant of Record.',
      cardPlaceholder: 'Número de tarjeta • MM / AA • CVC',
      trust: '100% Libre de Responsabilidad Fiscal'
    },
    ja: {
      name: '日本語 (Japan)',
      btn: '¥7,500 を支払う (Apple Pay 1クリック)',
      vatNotice: '消費税込・QIVROPAY Merchant of Recordにより安全に処理されます。',
      cardPlaceholder: 'カード番号 • MM / YY • セキュリティコード',
      trust: '100% 税務完全準拠'
    },
    hi: {
      name: 'हिन्दी (India)',
      btn: '₹4,100 का भुगतान करें (UPI / Apple Pay)',
      vatNotice: 'जीएसटी (GST) सहित मूल्य • QIVROPAY द्वारा सुरक्षित रूप से प्रोसेस किया गया।',
      cardPlaceholder: 'कार्ड नंबर • MM / YY • सीवीसी',
      trust: '100% सुरक्षित भुगतान'
    }
  };

  const current = translations[selectedLang];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Languages className="w-6 h-6 text-[#0055FF]" />
            <span>AI Dynamic Checkout Localization (32+ Native Languages)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Real-time cultural, tax disclosure, and linguistic localization ensuring higher global checkout conversion across 220+ countries.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[#F4F5F8] border border-black/5 text-xs font-semibold self-start sm:self-auto">
          {(Object.keys(translations) as Array<keyof typeof translations>).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedLang(key)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-all ${
                selectedLang === key
                  ? 'bg-white text-[#0055FF] font-bold shadow-xs'
                  : 'text-[#6E717D] hover:text-[#0A0D14]'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Native Languages Supported</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">32+ Languages</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-detected via HTTP Headers
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Global Conversion Lift</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">+24.8% Uplift</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">In localized native checkouts</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Statutory VAT Notices</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Compliant</div>
          <div className="text-[11px] text-purple-700 font-mono">German, French, Japanese local laws</div>
        </div>
      </div>

      {/* Live Localized Checkout Preview Canvas */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#0055FF]" />
            <span>Live Localized Hosted Checkout Simulator: {current.name}</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            LOCALE DETECTED
          </span>
        </div>

        <div className="max-w-md mx-auto p-6 rounded-3xl bg-[#FAFBFD] border border-black/10 shadow-sm space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#0A0D14]">Pro Developer Plan</h4>
            <p className="text-[11px] text-[#6E717D]">{current.vatNotice}</p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              readOnly
              value={current.cardPlaceholder}
              className="w-full p-2.5 rounded-xl border border-black/10 bg-white font-mono text-xs text-[#0A0D14]"
            />
            <button className="w-full opp-btn-primary py-2.5 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{current.btn}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 font-mono font-bold pt-2">
            <CheckCircle2 className="w-3 h-3" />
            <span>{current.trust}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
