import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronRight, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Key, 
  Play, 
  Webhook, 
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  BookOpen,
  LifeBuoy
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { MerchantSupportModal } from './MerchantSupportModal';

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerification: () => void;
  verificationData: any | null;
  onNavigateTab: (tab: any) => void;
  isTestMode: boolean;
  setIsTestMode: (val: boolean) => void;
}

export const SetupGuideWidget: React.FC<SetupGuideProps> = ({
  isOpen,
  onClose,
  onOpenVerification,
  verificationData,
  onNavigateTab,
  isTestMode,
  setIsTestMode
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<'none' | 'test' | 'live'>('none');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);

  // Completed steps tracking stored in localStorage
  const [completedSteps, setCompletedSteps] = useState<{
    verification: boolean;
    testKeys: boolean;
    testPayment: boolean;
    testWebhook: boolean;
    liveKeys: boolean;
    liveWebhook: boolean;
    livePayment: boolean;
    goLive: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('qivropay_setup_guide_completed');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      verification: !!verificationData,
      testKeys: false,
      testPayment: false,
      testWebhook: false,
      liveKeys: false,
      liveWebhook: false,
      livePayment: false,
      goLive: false
    };
  });

  // Sync with backend API on mount
  useEffect(() => {
    fetch('/api/v1/setup-guide/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.completedSteps) {
          setCompletedSteps(prev => ({
            ...prev,
            ...data.completedSteps,
            verification: !!(data.completedSteps.verification || verificationData)
          }));
          try {
            localStorage.setItem('qivropay_setup_guide_completed', JSON.stringify({
              ...data.completedSteps,
              verification: !!(data.completedSteps.verification || verificationData)
            }));
          } catch (e) {}
        }
      })
      .catch(err => console.warn('Setup guide backend sync error', err));
  }, [verificationData]);

  const toggleStep = async (stepKey: keyof typeof completedSteps) => {
    const nextVal = !completedSteps[stepKey];
    setCompletedSteps(prev => {
      const next = { ...prev, [stepKey]: nextVal };
      try { localStorage.setItem('qivropay_setup_guide_completed', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    try {
      await fetch('/api/v1/setup-guide/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepKey, completed: nextVal })
      });
    } catch (err) {
      console.warn('Backend setup step update error', err);
    }
  };

  // Calculate dynamic progress percentage
  // 4 main modules:
  // 1. Account verification (25%)
  // 2. Test mode integration (25% -> 3 sub-steps)
  // 3. Live mode integration (25% -> 3 sub-steps)
  // 4. Go live (25%)
  const calculateProgress = () => {
    let score = 0;
    if (completedSteps.verification) score += 25;
    
    let testSub = 0;
    if (completedSteps.testKeys) testSub++;
    if (completedSteps.testPayment) testSub++;
    if (completedSteps.testWebhook) testSub++;
    score += (testSub / 3) * 25;

    let liveSub = 0;
    if (completedSteps.liveKeys) liveSub++;
    if (completedSteps.liveWebhook) liveSub++;
    if (completedSteps.livePayment) liveSub++;
    score += (liveSub / 3) * 25;

    if (completedSteps.goLive || (!isTestMode && completedSteps.verification)) score += 25;

    return Math.min(100, Math.round(score));
  };

  const progressPercentage = calculateProgress();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateTestPayment = async () => {
    try {
      await fetch('/api/v1/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 500,
          currency: 'INR',
          paymentMethod: 'UPI AutoPay 2.0',
          customerName: 'Test Sandbox Buyer',
          customerEmail: 'sandbox@qivropay.in',
          productName: 'Sandbox Test Simulation'
        })
      });
    } catch (e) {
      console.warn('Sandbox payment simulation', e);
    }
    await toggleStep('testPayment');
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
  };

  const handleLiveTestPayment = async () => {
    try {
      await fetch('/api/v1/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1,
          currency: 'INR',
          paymentMethod: 'RuPay / UPI Live',
          customerName: 'Live Verification Buyer',
          customerEmail: 'live@qivropay.in',
          productName: 'Live ₹1 Activation Test'
        })
      });
    } catch (e) {
      console.warn('Live payment test', e);
    }
    await toggleStep('livePayment');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  };

  const handleActivateGoLive = () => {
    setIsTestMode(false);
    toggleStep('goLive');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  if (!isOpen) {
    return (
      <>
        {/* Floating Help Circle Button at Bottom Right (Image 1 bottom-right icon) */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="w-12 h-12 rounded-full bg-[#0A0D14] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-none ring-4 ring-black/5"
            title="Help & Support"
          >
            <span className="text-lg font-bold">?</span>
          </button>

          {/* Quick Help Drawer */}
          {helpOpen && (
            <div className="absolute bottom-16 right-0 w-80 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xl space-y-4 animate-scale-up font-sans text-xs text-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <LifeBuoy className="w-4 h-4 text-[#0055FF]" />
                  <span>QivroPay Merchant Help</span>
                </div>
                <button onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigateTab('developer')}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors font-medium text-slate-800"
                >
                  <BookOpen className="w-4 h-4 text-[#0055FF]" />
                  <span>Developer Docs & API Specs</span>
                </button>

                <button
                  onClick={() => onNavigateTab('copilot')}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors font-medium text-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Checkout Copilot</span>
                </button>

                <button
                  onClick={() => {
                    setSupportModalOpen(true);
                    setHelpOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors font-medium text-slate-800 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Contact 24/7 Merchant Support</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-mono">
                QivroPay MoR • India Stack Compliant
              </div>
            </div>
          )}
        </div>

        {/* Support Modal */}
        <MerchantSupportModal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
          userName={verificationData?.fullName || 'Merchant'}
          userEmail={verificationData?.website ? `support@${verificationData.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : 'merchant@qivropay.in'}
        />
      </>
    );
  }

  return (
    <>
      {/* Floating Setup Guide Card / Popout Widget */}
      <div 
        className={`fixed z-50 transition-all duration-300 font-sans ${
          isExpanded 
            ? 'inset-4 md:inset-10 lg:inset-20 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            : 'bottom-6 right-6 w-[360px] sm:w-[400px]'
        }`}
      >
        <div 
          className={`w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col transition-all ${
            isExpanded ? 'max-w-2xl max-h-[90vh]' : 'max-h-[85vh]'
          }`}
        >
          
          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg font-heading tracking-tight">
              Setup guide
            </h3>

            <div className="flex items-center gap-2">
              {/* Progress Percentage */}
              <span className="text-xs sm:text-sm font-semibold text-slate-600 font-mono">
                {progressPercentage}%
              </span>

              {/* Popout / Expand Toggle Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors border border-slate-200/60"
                title={isExpanded ? "Collapse to Floating Widget" : "Expand to Window"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors border border-slate-200/60"
                title="Close Setup Guide"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Checklist Items */}
          <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[calc(85vh-80px)]">
            
            {/* 1. Verify your account */}
            <div 
              onClick={onOpenVerification}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                completedSteps.verification
                  ? 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50'
                  : 'bg-[#F9FAFB] border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Verify your account
                    </span>
                    {completedSteps.verification && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Choose individual or registered entity to begin
                  </p>
                </div>

                <div className="p-1 text-slate-400 group-hover:text-slate-700 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 2. Test mode integration */}
            <div className="rounded-2xl border border-slate-200/80 bg-[#F9FAFB] overflow-hidden transition-all">
              <div 
                onClick={() => setOpenSection(openSection === 'test' ? 'none' : 'test')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Test mode integration
                  </span>
                  {(completedSteps.testKeys && completedSteps.testPayment && completedSteps.testWebhook) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>

                <div className="p-1 text-slate-400">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSection === 'test' ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Accordion Expand Content */}
              {openSection === 'test' && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-white space-y-3.5 text-xs animate-fade-in">
                  
                  {/* Step 2.1: API Keys */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">1. Test Sandbox API Key</span>
                      <button
                        onClick={() => copyToClipboard('pk_test_qivropay_9a7d8e2f1c4b', 'test_key')}
                        className="text-[11px] font-semibold text-[#0055FF] hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'test_key' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'test_key' ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                    <code className="block p-1.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700 select-all truncate">
                      pk_test_qivropay_9a7d8e2f1c4b
                    </code>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input 
                        type="checkbox" 
                        checked={completedSteps.testKeys} 
                        onChange={() => toggleStep('testKeys')}
                        className="rounded border-slate-300 text-[#0055FF] focus:ring-[#0055FF]" 
                      />
                      <span className="text-[11px] text-slate-600">Keys integrated in app</span>
                    </label>
                  </div>

                  {/* Step 2.2: Test Payment */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">2. Run Sandbox Transaction</span>
                      <button
                        onClick={handleSimulateTestPayment}
                        className="px-2.5 py-1 rounded-lg bg-[#0055FF] text-white hover:bg-blue-600 text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Simulate ₹500</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Test simulated UPI AutoPay, RuPay Cards & NetBanking without moving real money.
                    </p>
                  </div>

                  {/* Step 2.3: Test Webhook */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">3. Webhook Endpoint</span>
                      <button
                        onClick={() => onNavigateTab('developer')}
                        className="text-[11px] text-[#0055FF] font-semibold hover:underline flex items-center gap-1"
                      >
                        <Webhook className="w-3 h-3" />
                        <span>Webhook Studio</span>
                      </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={completedSteps.testWebhook} 
                        onChange={() => toggleStep('testWebhook')}
                        className="rounded border-slate-300 text-[#0055FF] focus:ring-[#0055FF]" 
                      />
                      <span className="text-[11px] text-slate-600">Webhook listener responding with 200 OK</span>
                    </label>
                  </div>

                </div>
              )}
            </div>

            {/* 3. Live mode integration */}
            <div className="rounded-2xl border border-slate-200/80 bg-[#F9FAFB] overflow-hidden transition-all">
              <div 
                onClick={() => setOpenSection(openSection === 'live' ? 'none' : 'live')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Live mode integration
                  </span>
                  {(completedSteps.liveKeys && completedSteps.liveWebhook && completedSteps.livePayment) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>

                <div className="p-1 text-slate-400">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSection === 'live' ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Accordion Expand Content */}
              {openSection === 'live' && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-white space-y-3.5 text-xs animate-fade-in">
                  
                  {/* Step 3.1: Live API Keys */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">1. Production API Credentials</span>
                      <button
                        onClick={() => copyToClipboard('pk_live_qivropay_7719a8bc43d0', 'live_key')}
                        className="text-[11px] font-semibold text-[#0055FF] hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'live_key' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'live_key' ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                    <code className="block p-1.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700 select-all truncate">
                      pk_live_qivropay_7719a8bc43d0
                    </code>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input 
                        type="checkbox" 
                        checked={completedSteps.liveKeys} 
                        onChange={() => toggleStep('liveKeys')}
                        className="rounded border-slate-300 text-[#0055FF] focus:ring-[#0055FF]" 
                      />
                      <span className="text-[11px] text-slate-600">Configured live environment credentials</span>
                    </label>
                  </div>

                  {/* Step 3.2: Production Webhook */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">2. HTTPS Webhook Destination</span>
                      <button
                        onClick={() => onNavigateTab('developer')}
                        className="text-[11px] text-[#0055FF] font-semibold hover:underline"
                      >
                        Configure
                      </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={completedSteps.liveWebhook} 
                        onChange={() => toggleStep('liveWebhook')}
                        className="rounded border-slate-300 text-[#0055FF] focus:ring-[#0055FF]" 
                      />
                      <span className="text-[11px] text-slate-600">Verified live SSL HTTPS webhook receiver</span>
                    </label>
                  </div>

                  {/* Step 3.3: ₹1 Live Rail Test */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">3. Live ₹1 Test Payment</span>
                      <button
                        onClick={handleLiveTestPayment}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-black text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Verify ₹1</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Process a ₹1 charge on a real UPI or card to ensure end-to-end settlement.
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* 4. Go live (Locked until verification is approved) */}
            <div 
              className={`p-4 rounded-2xl border transition-all ${
                completedSteps.verification
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-[#F9FAFB] border-slate-200/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${completedSteps.verification ? 'text-slate-900' : 'text-slate-400'}`}>
                      Go live
                    </span>
                    {completedSteps.verification && !isTestMode && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        LIVE ACTIVE
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${completedSteps.verification ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                    {completedSteps.verification
                      ? 'Your account is verified and approved to process real customer payments.'
                      : 'Unlocks once verification is approved'}
                  </p>
                </div>

                <div className="p-1">
                  {completedSteps.verification ? (
                    <Unlock className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Action Button when Unlocked */}
              {completedSteps.verification && isTestMode && (
                <div className="pt-3 border-t border-slate-100 mt-3 flex justify-end">
                  <button
                    onClick={handleActivateGoLive}
                    className="px-4 py-2 rounded-xl bg-[#0A0D14] text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Switch to Live Rails</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Floating Help Circle Button (matching Image 1) */}
        <div className="absolute -bottom-2 right-0 translate-y-full pt-3 flex justify-end">
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="w-11 h-11 rounded-full bg-[#0A0D14] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-black/5"
            title="Help & Support"
          >
            <span className="text-base font-bold">?</span>
          </button>
        </div>

      </div>

      {/* Support Modal */}
      <MerchantSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        userName={verificationData?.fullName || 'Merchant'}
        userEmail={verificationData?.website ? `support@${verificationData.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : 'merchant@qivropay.in'}
      />
    </>
  );
};
