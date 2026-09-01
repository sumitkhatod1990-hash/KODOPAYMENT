sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building, 
  Globe2, 
  CreditCard, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<WizardProps> = ({ isOpen, onClose }) => {
  const { createProduct, createCheckoutSession, setCurrentView } = useApp();
  
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('QIVROPAY AI Technologies Inc.');
  const [statementDescriptor, setStatementDescriptor] = useState('QIVROPAY*AI');
  const [primaryCurrency, setPrimaryCurrency] = useState('INR');
  const [bankAccount, setBankAccount] = useState('Silicon Valley Bank (••••9812)');
  const [productTitle, setProductTitle] = useState('AI Inference Credit Pack');
  const [productPrice, setProductPrice] = useState(29);
  const [createdSessionUrl, setCreatedSessionUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFinish = async () => {
    const prod = await createProduct({
      name: productTitle,
      price: productPrice,
      currency: primaryCurrency,
      type: 'credits',
      credits: 5000000
    });

    if (prod) {
      const sessionId = await createCheckoutSession({
        productId: prod.id,
        amount: prod.price,
        title: prod.name
      });
      if (sessionId) {
        setCreatedSessionUrl(`${window.location.origin}/checkout/${sessionId}`);
      }
    }

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-10 space-y-6 animate-scale-up relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#6e6e73]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wizard Progress Stepper */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#86868b]">
            <span className="font-bold text-[#0071e3]">STEP {step} OF 4</span>
            <span>{step === 1 ? 'Brand Profile' : step === 2 ? 'Tax & Currency' : step === 3 ? 'Bank Rails' : 'Ready to Sell'}</span>
          </div>
          <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#0071e3] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Business Profile */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-[#1d1d1f] font-heading">
                Set up your brand profile
              </h3>
              <p className="text-xs text-[#6e6e73]">
                Your brand name and bank statement descriptor shown to global buyers.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Brand / Legal Entity Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] outline-none text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Credit Card Statement Descriptor (Max 22 chars)</label>
                <input
                  type="text"
                  maxLength={22}
                  value={statementDescriptor}
                  onChange={(e) => setStatementDescriptor(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] font-mono font-bold text-sm text-[#1d1d1f] outline-none"
                />
                <span className="text-[11px] text-[#86868b]">Appears on customer bank statements as "{statementDescriptor}"</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="apple-btn-black px-6 py-3 text-xs flex items-center gap-2"
              >
                <span>Continue to Tax & Rails</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Tax & Currencies */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-[#1d1d1f] font-heading">
                Merchant of Record & Tax Setup
              </h3>
              <p className="text-xs text-[#6e6e73]">
                Configure India GST and INR settlement preferences for your QivroPay account.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Primary Operating Currency</label>
                <select
                  value={primaryCurrency}
                  onChange={(e) => setPrimaryCurrency(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-sm text-[#1d1d1f]"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-[#0071e3] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>QIVROPAY Tax Nexus Coverage</span>
                </div>
                <p className="text-xs text-[#6e6e73]">
                  India GST records and Indian-rupee payment activity are available in your QivroPay dashboard.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button onClick={() => setStep(1)} className="apple-btn-secondary px-4 py-2.5 text-xs">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="apple-btn-black px-6 py-3 text-xs flex items-center gap-2"
              >
                <span>Continue to Bank Rails</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payout Rails */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-[#1d1d1f] font-heading">
                Connect Payout Bank Account
              </h3>
              <p className="text-xs text-[#6e6e73]">
                Net earnings settle daily on a rolling T+2 schedule directly to your bank account.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Bank Name & Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-sm text-[#1d1d1f] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5">
                  <div className="font-bold text-[#1d1d1f]">Payout Schedule</div>
                  <div className="text-[11px] text-emerald-700 font-bold">Daily Rolling (T+2)</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5">
                  <div className="font-bold text-[#1d1d1f]">Platform Fee</div>
                  <div className="text-[11px] text-[#0071e3] font-bold">4% + 40¢ Flat</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button onClick={() => setStep(2)} className="apple-btn-secondary px-4 py-2.5 text-xs">
                Back
              </button>
              <button
                onClick={handleFinish}
                className="apple-btn-black px-6 py-3 text-xs flex items-center gap-2"
              >
                <span>Launch First Product & MoR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Completion */}
        {step === 4 && (
          <div className="text-center space-y-6 animate-fade-in py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#1d1d1f] font-heading">
                You're Ready to Accept Payments!
              </h3>
              <p className="text-xs text-[#86868b] mt-1">
                Your Merchant of Record legal agreement, statement descriptors, and product rails are active.
              </p>
            </div>

            {createdSessionUrl && (
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/10 text-left text-xs font-mono space-y-2">
                <span className="text-[#86868b] uppercase text-[10px] font-bold">Your Live Shareable Checkout Link:</span>
                <div className="p-2.5 bg-white rounded-xl border border-black/5 text-[#0071e3] font-bold truncate">
                  {createdSessionUrl}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="apple-btn-black w-full py-3.5 text-xs font-semibold shadow-md"
            >
              Go to Merchant Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
