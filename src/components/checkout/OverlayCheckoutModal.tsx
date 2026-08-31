import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Globe2, 
  Lock, 
  CheckCircle2, 
  Coins, 
  DollarSign, 
  Building2, 
  QrCode, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export const OverlayCheckoutModal: React.FC<OverlayModalProps> = ({ isOpen, onClose, product }) => {
  const { processPayment } = useApp();
  
  const [customerName, setCustomerName] = useState('Alex Chen');
  const [customerEmail, setCustomerEmail] = useState('alex.chen@synthflow.ai');
  const [paymentRail, setPaymentRail] = useState<'card' | 'apple_pay' | 'paypal' | 'ideal' | 'upi' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<any>(null);

  if (!isOpen) return null;

  const currentProduct = product || {
    id: 'prod_overlay_demo',
    name: 'AI Token Starter Pack (5M Credits)',
    price: 29.00,
    currency: 'USD'
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const result = await processPayment({
      sessionId: 'overlay_session',
      customerName,
      customerEmail,
      paymentMethod: paymentRail,
      cardLast4: paymentRail === 'card' ? '4242' : paymentRail.toUpperCase(),
      country: 'US'
    });

    setIsProcessing(false);

    if (result.success) {
      setCompletedTx(result.transaction);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-black/10 shadow-2xl overflow-hidden relative animate-scale-up">
        
        {/* Header */}
        <div className="p-5 border-b border-black/5 bg-[#fafafc] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0071e3] font-bold">
              Overlay Modal SDK
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {completedTx ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1d1d1f] font-heading">
                Payment Completed!
              </h3>
              <p className="text-xs text-[#86868b] font-mono mt-1">
                Transaction: {completedTx.id}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f5f7] text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-[#86868b]">Product:</span>
                <span className="text-[#1d1d1f] font-bold">{completedTx.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Amount:</span>
                <span className="text-[#0071e3] font-bold">${completedTx.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Method:</span>
                <span className="text-emerald-700 font-bold uppercase">{completedTx.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="apple-btn-black w-full py-3 text-xs"
            >
              Close Checkout
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Product Summary */}
            <div className="flex justify-between items-start pb-4 border-b border-black/5">
              <div>
                <h4 className="font-bold text-[#1d1d1f] text-base font-sans">
                  {currentProduct.name}
                </h4>
                <p className="text-xs text-[#86868b]">Instant Delivery • MoR Tax Included</p>
              </div>
              <div className="text-xl font-mono font-black text-[#1d1d1f]">
                ${currentProduct.price.toFixed(2)}
              </div>
            </div>

            {/* Quick Rail Buttons */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'card', label: 'Credit Card', icon: CreditCard },
                { id: 'apple_pay', label: 'Apple Pay', icon: Smartphone },
                { id: 'paypal', label: 'PayPal', icon: DollarSign },
                { id: 'ideal', label: 'iDEAL 🇳🇱', icon: Building2 },
                { id: 'upi', label: 'UPI 🇮🇳', icon: QrCode },
                { id: 'crypto', label: 'USDC', icon: Coins }
              ].map(rail => (
                <button
                  key={rail.id}
                  type="button"
                  onClick={() => setPaymentRail(rail.id as any)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentRail === rail.id
                      ? 'border-[#0071e3] bg-blue-50/50 text-[#0071e3] font-bold'
                      : 'border-black/5 bg-[#f5f5f7] text-[#6e6e73]'
                  }`}
                >
                  <rail.icon className="w-3.5 h-3.5" />
                  <span className="truncate">{rail.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handlePay} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1d1d1f]">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f5f5f7] border border-black/10 text-[#1d1d1f] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1d1d1f]">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f5f5f7] border border-black/10 text-[#1d1d1f] outline-none"
                />
              </div>

              {paymentRail === 'card' && (
                <div className="p-3 rounded-xl bg-[#f5f5f7] border border-black/5 space-y-2 font-mono">
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    className="w-full p-2 rounded-lg bg-white border border-black/10 text-[#1d1d1f] text-xs outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" defaultValue="12/28" className="p-2 rounded-lg bg-white border border-black/10 text-[#1d1d1f] text-xs outline-none" />
                    <input type="text" defaultValue="888" className="p-2 rounded-lg bg-white border border-black/10 text-[#1d1d1f] text-xs outline-none" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="apple-btn-black w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                {isProcessing ? 'Authorizing...' : `Pay $${currentProduct.price.toFixed(2)} USD`}
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
