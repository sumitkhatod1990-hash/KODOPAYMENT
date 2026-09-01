import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Fingerprint, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Users, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnePassTab: React.FC = () => {
  const [stats] = useState({
    totalRegisteredShoppers: '14,280,000+',
    networkConversionUplift: '+31.4%',
    avgCheckoutTime: '0.84s (FaceID Passkey)',
    activeQivroPayMerchants: 5420
  });

  const [testedPasskey, setTestedPasskey] = useState(false);

  const handleTestPasskey = () => {
    setTestedPasskey(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setTestedPasskey(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-[#0055FF]" />
            <span>QIVROPAY One-Pass: 1-Click Universal Biometric Checkout</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Universal passkey network enabling 14M+ verified buyers across the entire QIVROPAY merchant ecosystem to checkout in under 1 second with TouchID and FaceID biometrics.
          </p>
        </div>

        <button
          onClick={handleTestPasskey}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          <span>{testedPasskey ? 'Biometric Auth Verified!' : 'Simulate 1-Click FaceID Passkey'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Universal Verified Shopper Network</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{stats.totalRegisteredShoppers}</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Across {stats.activeQivroPayMerchants.toLocaleString()} QIVROPAY merchants
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Checkout Conversion Uplift</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{stats.networkConversionUplift}</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Zero form fields or SMS OTP friction</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Speed to Purchase</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{stats.avgCheckoutTime}</div>
          <div className="text-[11px] text-purple-700 font-mono">Industry leading speed</div>
        </div>
      </div>

      {/* Passkey Card */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0055FF]" />
            <span>FIDO2 / WebAuthn Biometric Security Architecture</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            FIDO2 HARDENED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Apple TouchID / FaceID:</span>
            <div className="font-bold text-[#0A0D14] text-sm">Native WebAuthn Handshake</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F4F5F8] space-y-1">
            <span className="text-[#8C90A0]">Stored Credentials:</span>
            <div className="font-bold text-[#0055FF] text-sm">End-to-End Encrypted Vault</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-emerald-800 font-bold">Network Effect:</span>
            <div className="font-bold text-emerald-700 text-sm">Recognized on Any QIVROPAY Site</div>
          </div>
        </div>
      </div>

    </div>
  );
};
