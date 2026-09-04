import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  QrCode, 
  Nfc, 
  CheckCircle2, 
  DollarSign, 
  Delete, 
  Sparkles, 
  Download, 
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MobilePOSTab: React.FC = () => {
  const [amountStr, setAmountStr] = useState('25.00');
  const [currency, setCurrency] = useState('INR');
  const [paymentMode, setPaymentMode] = useState<'qr' | 'tap'>('qr');
  const [qrType, setQrType] = useState<'upi' | 'pix' | 'usdc' | 'sepa'>('upi');
  const [posSuccess, setPosSuccess] = useState(false);
  const [isNfcReading, setIsNfcReading] = useState(false);

  const handleKeypad = (val: string) => {
    if (val === 'C') {
      setAmountStr('0.00');
    } else if (val === 'DEL') {
      setAmountStr(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      if (amountStr === '0.00' || amountStr === '0') {
        setAmountStr(val);
      } else {
        setAmountStr(amountStr + val);
      }
    }
  };

  const handleSimulatePayment = () => {
    setPosSuccess(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleSimulateNfcTap = () => {
    setIsNfcReading(true);
    setTimeout(() => {
      setIsNfcReading(false);
      setPosSuccess(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
          Mobile POS Terminal & Dynamic QR Tap-to-Pay
        </h2>
        <p className="text-xs sm:text-sm text-[#8C90A0]">
          Turn any tablet, smartphone, or laptop into a full point-of-sale terminal accepting instant QR codes and Apple Pay NFC Tap-to-Phone payments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Terminal Display & Keypad (6 Cols) */}
        <div className="lg:col-span-6 opp-card p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#8C90A0]">QIVROPAY TERMINAL V4.2</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE • READY</span>
            </div>
          </div>

          {/* Amount Screen */}
          <div className="p-6 rounded-3xl bg-[#0A0D14] text-white text-right space-y-1">
            <span className="text-xs font-mono text-[#8C90A0]">CHARGE AMOUNT</span>
            <div className="text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
              ${parseFloat(amountStr || '0').toFixed(2)} <span className="text-sm text-white/60">{currency}</span>
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2 text-lg font-bold font-mono">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeypad(k)}
                className="p-4 rounded-2xl bg-[#F4F5F8] text-[#0A0D14] hover:bg-[#EAEBED] active:scale-95 transition-all text-center border border-black/5"
              >
                {k}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleKeypad('C')}
            className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-mono text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            Clear Amount (C)
          </button>

        </div>

        {/* Right: Payment Method & Dynamic QR / NFC Mode (6 Cols) */}
        <div className="lg:col-span-6 opp-card p-6 sm:p-8 space-y-6">
          
          {/* Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F4F5F8] border border-black/5 text-xs font-semibold">
            <button
              onClick={() => { setPaymentMode('qr'); setPosSuccess(false); }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                paymentMode === 'qr' ? 'bg-[#0A0D14] text-white shadow-xs' : 'text-[#6E717D]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Dynamic QR Code</span>
            </button>

            <button
              onClick={() => { setPaymentMode('tap'); setPosSuccess(false); }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                paymentMode === 'tap' ? 'bg-[#0A0D14] text-white shadow-xs' : 'text-[#6E717D]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Tap-to-Pay (NFC)</span>
            </button>
          </div>

          {posSuccess ? (
            
            /* Success State */
            <div className="p-8 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A0D14] font-heading">
                  Payment Captured!
                </h3>
                <p className="text-xs text-emerald-800 font-mono font-semibold">
                  ${parseFloat(amountStr || '0').toFixed(2)} INR settled to QIVROPAY MoR
                </p>
              </div>
              <button
                onClick={() => setPosSuccess(false)}
                className="opp-btn-primary px-6 py-2.5 text-xs font-semibold shadow-md"
              >
                Next POS Transaction
              </button>
            </div>

          ) : paymentMode === 'qr' ? (
            
            /* Dynamic QR Generator */
            <div className="space-y-4 text-center">
              
              <div className="flex justify-center gap-1.5">
                {[
                  { id: 'upi', label: 'UPI 🇮🇳' },
                  { id: 'pix', label: 'PIX 🇧🇷' },
                  { id: 'usdc', label: 'INR 🪙' },
                  { id: 'sepa', label: 'SEPA 🇪🇺' }
                ].map(q => (
                  <button
                    key={q.id}
                    onClick={() => setQrType(q.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                      qrType === q.id ? 'bg-[#0055FF] text-white' : 'bg-[#F4F5F8] text-[#6E717D]'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* QR Canvas Box */}
              <div className="p-6 rounded-3xl bg-white border-2 border-black/10 shadow-md max-w-xs mx-auto space-y-3">
                <div className="w-48 h-48 bg-white mx-auto flex items-center justify-center border-4 border-[#0A0D14] rounded-2xl p-2">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=qivropay_pay_${qrType}_${amountStr}`} 
                    alt="Dynamic Payment QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] font-mono text-[#8C90A0]">
                  Scan with any {qrType.toUpperCase()} app to pay <strong>₹{parseFloat(amountStr || '0').toFixed(2)}</strong>
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                className="opp-btn-primary w-full py-3 text-xs font-semibold shadow-md"
              >
                Simulate Instant Scan & Pay
              </button>

            </div>

          ) : (

            /* Tap to Pay NFC Simulator */
            <div className="p-8 rounded-3xl bg-[#FAFBFD] border border-black/5 text-center space-y-5">
              <div className={`w-20 h-20 rounded-full bg-blue-50 text-[#0055FF] flex items-center justify-center mx-auto border border-blue-200 ${isNfcReading ? 'animate-ping' : 'animate-bounce'}`}>
                <Nfc className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#0A0D14] font-heading">
                  Hold Phone or Contactless Card Near Device
                </h3>
                <p className="text-xs text-[#8C90A0]">
                  Accepts Apple Pay, Google Wallet, Visa payWave, and Mastercard Contactless.
                </p>
              </div>

              <button
                onClick={handleSimulateNfcTap}
                disabled={isNfcReading}
                className="opp-btn-primary w-full py-3 text-xs font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isNfcReading ? 'Reading NFC Card...' : 'Simulate Contactless Card Tap'}</span>
              </button>
            </div>

          )}

        </div>

      </div>

    </div>
  );
};
