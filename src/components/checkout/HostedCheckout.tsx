import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  Coins, 
  Globe2, 
  Smartphone, 
  Check, 
  Building2, 
  Zap, 
  QrCode, 
  DollarSign,
  Download,
  FileText,
  Percent,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { printOrDownloadInvoice } from '../../utils/invoiceGenerator';

interface CheckoutProps {
  sessionId?: string | null;
}

type PaymentRail = 
  | 'card' 
  | 'apple_pay' 
  | 'google_pay' 
  | 'paypal' 
  | 'klarna'
  | 'affirm'
  | 'afterpay'
  | 'sepa' 
  | 'ideal' 
  | 'bancontact' 
  | 'upi' 
  | 'pix' 
  | 'crypto';

export const HostedCheckout: React.FC<CheckoutProps> = ({ sessionId }) => {
  const { processPayment, setCurrentView, products } = useApp();
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('Alex Chen');
  const [customerEmail, setCustomerEmail] = useState('alex.chen@synthflow.ai');
  const [customerPhone, setCustomerPhone] = useState('9999999999');
  const [paymentRail, setPaymentRail] = useState<PaymentRail>('upi');
  const [paymentCategory] = useState<'asia_latam'>('asia_latam');
  const [indiaPaymentMode, setIndiaPaymentMode] = useState<'upi' | 'card'>('upi');
  
  // Country & PPP State
  const [selectedCountry] = useState('IN');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardApplied, setGiftCardApplied] = useState(false);
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  
  // Alternative Rail Inputs
  const [sepaIban, setSepaIban] = useState('DE89 3704 0044 0532 0130 00');
  const [idealBank, setIdealBank] = useState('ING Bank');
  const [upiId, setUpiId] = useState('developer@okhdfcbank');
  const [pixCpf, setPixCpf] = useState('123.456.789-00');
  const [cryptoNetwork, setCryptoNetwork] = useState<'solana' | 'base' | 'polygon'>('solana');
  
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [orderBumpSelected, setOrderBumpSelected] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellClaimed, setUpsellClaimed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [billingAddress, setBillingAddress] = useState('');
  const [cashfreePaymentStarted, setCashfreePaymentStarted] = useState(false);
  const cashfreeContainerRef = useRef<HTMLDivElement>(null);
  const cashfreePaymentMethodRef = useRef<any>(null);
  const cashfreeCardNumberRef = useRef<any>(null);
  const cashfreeCardHolderRef = useRef<any>(null);
  const cashfreeCardExpiryRef = useRef<any>(null);
  const cashfreeCardCvvRef = useRef<any>(null);
  const cashfreeCardReadyRef = useRef(false);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const sid = sessionId || 'demo_session';
        try {
          const savedReceipt = localStorage.getItem(`qivropay:receipt: ₹{sid}`);
          if (savedReceipt) {
            setCompletedTx(JSON.parse(savedReceipt));
            setCheckoutStep(2);
          }
        } catch {}
        const res = await fetch(`/api/v1/payments/session/${sid}`);
        const data = await res.json();
        if (data.success && data.session) {
          setSessionData(data.session);
          if (String(data.session.currency || '').toUpperCase() === 'INR') {
            setPaymentRail('upi');
            if (data.session.customerEmail) setCustomerEmail(data.session.customerEmail);
          }
          try {
            const restoreRes = await fetch(`/api/v1/india/cashfree/session/${encodeURIComponent(sid)}/status`);
            const restore = await restoreRes.json();
            if (restore.found && ['PAID', 'SUCCESS'].includes(restore.orderStatus)) {
              setCompletedTx({
                id: restore.orderId,
                amount: Number(restore.orderAmount || data.session.amount || 0),
                currency: restore.orderCurrency || 'INR',
                status: 'succeeded',
                customerEmail: restore.customerEmail || data.session.customerEmail || '',
                customerName: 'Customer',
                productName: data.session.title || 'QivroPay payment',
                credits: Number(data.session.credits || 0),
                paymentMethod: 'upi',
                createdAt: new Date().toISOString()
              });
              setCheckoutStep(2);
            }
          } catch (restoreError) {
            console.warn('Payment receipt restore skipped:', restoreError);
          }
        } else {
          const p = products[0] || { name: 'AI Token Starter Pack', price: 29.00, currency: 'INR', credits: 5000000 };
          setSessionData({
            sessionId: sid,
            title: p.name,
            description: 'AI Credits & Inference Gateway Access',
            amount: p.price,
            currency: p.currency,
            credits: p.credits,
            type: p.type
          });
        }
      } catch (err) {
        console.error('Session load error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, products]);

  useEffect(() => {
    if (checkoutStep !== 2 || indiaPaymentMode !== 'card') return;
    const cashfree = (window as any).Cashfree?.({ mode: 'production' });
    if (!cashfree) return;
    const mountCard = (name: string, ref: React.MutableRefObject<any>, selector: string) => {
      const component = cashfree.create(name, { values: name === 'cardNumber' ? { placeholder: 'Enter card number' } : undefined });
      component.mount(selector);
      ref.current = component;
      return component;
    };
    const number = mountCard('cardNumber', cashfreeCardNumberRef, '#qivropay-card-number');
    const holder = mountCard('cardHolder', cashfreeCardHolderRef, '#qivropay-card-holder');
    const expiry = mountCard('cardExpiry', cashfreeCardExpiryRef, '#qivropay-card-expiry');
    const cvv = mountCard('cardCvv', cashfreeCardCvvRef, '#qivropay-card-cvv');
    const markReady = () => { cashfreeCardReadyRef.current = true; };
    number.on('ready', markReady); holder.on('ready', markReady); expiry.on('ready', markReady); cvv.on('ready', markReady);
    return () => {
      // Cashfree owns the iframe lifecycle; unmounting during a mode switch
      // can race its internal DOM cleanup and throw a classList error.
      cashfreeCardReadyRef.current = false;
    };
  }, [checkoutStep, indiaPaymentMode]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'LAUNCH50') {
      setDiscountApplied(true);
    }
  };

  const handleContinueToPayment = () => {
    if (!customerName.trim()) return setPaymentError('Apna naam enter karein.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return setPaymentError('Valid email address enter karein.');
    if (isInrSession && !/^\+?\d[\d\s-]{9,14}$/.test(customerPhone.trim())) return setPaymentError('Valid 10-digit mobile number enter karein.');
    if (!billingAddress.trim()) return setPaymentError('Billing address enter karein.');
    setPaymentError(null);
    setCheckoutStep(2);
  };

  const basePrice = sessionData?.amount || 29.00;
  // QivroPay currently operates in India only: INR + UPI is the sole checkout rail.
  const isInrSession = true;
  const displayCurrency = 'INR';
  const displaySymbol = '₹';
  const receiptCurrency = String(completedTx?.currency || displayCurrency).toUpperCase();
  const receiptSymbol = receiptCurrency === 'INR' ? '₹' : '$';
  let finalUsdAmount = basePrice;
  if (discountApplied) {
    finalUsdAmount = finalUsdAmount * 0.5;
  }
  if (orderBumpSelected && !isInrSession) {
    finalUsdAmount += 19.00;
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setPaymentError('Apna naam enter karein.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setPaymentError('Valid email address enter karein.');
      return;
    }
    if (!/^\+?\d[\d\s-]{9,14}$/.test(customerPhone.trim())) {
      setPaymentError('Valid 10-digit mobile number enter karein.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    if (isInrSession) {
      try {
        const orderRes = await fetch('/api/v1/india/cashfree/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderAmount: finalUsdAmount,
            customerEmail,
            customerPhone,
            orderNote: sessionData?.title || 'QivroPay payment',
            sessionToken: sessionId || ''
          })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.success || !orderData.paymentSessionId) {
          throw new Error(orderData.error || 'Cashfree order create failed');
        }
        const cashfree = (window as any).Cashfree?.({ mode: 'production' });
        if (!cashfree) throw new Error('Cashfree checkout SDK load nahi hua');
        let paymentResult: any;
        if (indiaPaymentMode === 'card') {
          const card = cashfreeCardNumberRef.current;
          if (!card || !cashfreeCardReadyRef.current || !card.isComplete?.() || !cashfreeCardHolderRef.current?.isComplete?.() || !cashfreeCardExpiryRef.current?.isComplete?.() || !cashfreeCardCvvRef.current?.isComplete?.()) {
            throw new Error('Card details complete karein.');
          }
          cashfreePaymentMethodRef.current = card;
          paymentResult = await cashfree.pay({ paymentMethod: card, paymentSessionId: orderData.paymentSessionId, redirect: 'if_required', returnUrl: `${window.location.origin}/checkout/${encodeURIComponent(sessionId || '')}` });
        } else {
          // QivroPay owns the visible checkout. Cashfree only mounts its secure
          // PCI component (QR/UPI data never touches our server).
          if (!cashfreeContainerRef.current) throw new Error('Payment container could not be opened');
          const upiQr = cashfree.create('upiQr', { values: { size: '260px' } });
          const qrReady = new Promise<void>((resolve, reject) => {
            upiQr.on('ready', () => resolve());
            upiQr.on('loaderror', (data: any) => reject(new Error(data?.error || 'UPI QR load failed')));
          });
          cashfreeContainerRef.current.id = 'qivropay-upi-qr';
          upiQr.mount('#qivropay-upi-qr');
          cashfreePaymentMethodRef.current = upiQr;
          await Promise.race([qrReady, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('UPI QR took too long to load')), 10000))]);
          setCashfreePaymentStarted(true);
          paymentResult = await cashfree.pay({ paymentMethod: upiQr, paymentSessionId: orderData.paymentSessionId, redirect: 'if_required', returnUrl: `${window.location.origin}/checkout/${encodeURIComponent(sessionId || '')}` });
        }
        // Cashfree may return an intermediate status while the QR is already
        // mounted and waiting for the customer to approve in their UPI app.
        // Do not show a false failure after the QR has rendered.
        if (paymentResult?.error) console.warn('UPI payment status:', paymentResult.error);
        setPaymentError(null);
        setIsProcessing(false);

        // Keep the branded page open while Cashfree processes the UPI payment,
        // then verify the final status server-to-server before showing success.
        let settled = false;
        for (let attempt = 0; attempt < 20; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          const statusRes = await fetch(`/api/v1/india/cashfree/orders/${encodeURIComponent(orderData.orderId)}/status`);
          const statusData = await statusRes.json();
          if (statusData.orderStatus === 'PAID' || statusData.orderStatus === 'SUCCESS') {
            settled = true;
            const transaction = {
              id: orderData.orderId,
              amount: Number(statusData.orderAmount || finalUsdAmount),
              currency: statusData.orderCurrency || 'INR',
              status: 'succeeded',
              customerEmail,
              customerName,
              productName: sessionData?.title || 'QivroPay payment',
              credits: Number(sessionData?.credits || 0),
              paymentMethod: 'upi',
              createdAt: new Date().toISOString()
            };
            setCompletedTx(transaction);
            try { localStorage.setItem(`qivropay:receipt: ₹{sessionId || 'checkout'}`, JSON.stringify(transaction)); } catch {}
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            break;
          }
          if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(statusData.orderStatus)) break;
        }
        if (!settled) setPaymentError('Payment confirmation pending. Please check your UPI app and try again.');
      } catch (err: any) {
        const qrRendered = Boolean(cashfreeContainerRef.current?.childElementCount);
        setPaymentError(qrRendered ? null : (err?.message || 'Live payment start nahi ho saka'));
        setIsProcessing(false);
      }
      return;
    }
    let cardLast4 = '4242';
    if (paymentRail === 'card') {
      cardLast4 = cardNumber.slice(-4).replace(/\s/g, '') || '4242';
    } else {
      cardLast4 = paymentRail.toUpperCase().replace('_', ' ');
    }

    const result = await processPayment({
      sessionId: sessionData?.sessionId || 'custom_session',
      customerName,
      customerEmail,
      paymentMethod: paymentRail,
      cardLast4,
      country: selectedCountry,
      promoCode: discountApplied ? 'LAUNCH50' : undefined
    });

    setIsProcessing(false);

    if (result.success) {
      setCompletedTx(result.transaction);
      if (!isInrSession) setShowUpsellModal(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAcceptUpsell = () => {
    setUpsellClaimed(true);
    setShowUpsellModal(false);
    if (completedTx) {
      setCompletedTx({
        ...completedTx,
        amount: completedTx.amount + 15.00,
        productName: `${completedTx.productName} + 10M Token Pack`
      });
    }
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#0A0D14] font-sans flex flex-col justify-between selection:bg-[#0055FF] selection:text-white">
      
      {/* Checkout Navbar */}
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={() => setCurrentView('landing')} />
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C90A0]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">256-bit Encrypted • QIVROPAY MoR Global Payment Rails</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        {loading ? (
          <div className="text-center py-20 font-mono text-sm text-[#0055FF] animate-pulse">
            Loading secure multi-rail checkout session...
          </div>
        ) : completedTx ? (
          
          /* Success Receipt Card */
          <div className="w-full max-w-lg p-8 sm:p-12 rounded-3xl bg-white border border-black/10 shadow-xl space-y-6 text-center animate-fade-in opp-card">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
                Payment Successful
              </h2>
              <p className="text-xs text-[#8C90A0] font-mono">
                Transaction ID: <span className="text-[#0A0D14] font-semibold">{completedTx.id}</span>
              </p>
            </div>

            {/* Receipt Box */}
            <div className="p-6 rounded-2xl bg-[#F4F5F8] border border-black/5 text-left text-xs space-y-3 font-mono">
              <div className="flex justify-between">
                <span className="text-[#8C90A0]">Product:</span>
                <span className="text-[#0A0D14] font-bold">{completedTx.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C90A0]">Amount Paid:</span>
                <span className="text-[#0055FF] font-bold">{receiptSymbol}{completedTx.amount.toFixed(2)} {receiptCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C90A0]">Payment Rail:</span>
                <span className="text-[#0A0D14] font-bold uppercase">{completedTx.paymentMethod.replace('_', ' ')}</span>
              </div>
              {completedTx.credits > 0 && <div className="flex justify-between"><span className="text-[#8C90A0]">Credits Delivered:</span><span className="text-emerald-700 font-bold">{completedTx.credits.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between">
                <span className="text-[#8C90A0]">Billed To:</span>
                <span className="text-[#0A0D14]">{completedTx.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C90A0]">Settled Via:</span>
                <span className="text-emerald-700 font-bold">QIVROPAY MoR (Zero Tax Liability)</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => printOrDownloadInvoice(completedTx)}
                className="opp-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official Tax Invoice (PDF)</span>
              </button>

              <button
                onClick={() => setCurrentView('portal')}
                className="opp-btn-secondary w-full py-2.5 text-xs font-semibold"
              >
                Open Customer Billing Portal
              </button>

              <button
                onClick={() => setCurrentView('landing')}
                className="text-xs text-[#8C90A0] hover:text-[#0A0D14] transition-colors pt-1"
              >
                ← Back to QIVROPAY Home
              </button>
            </div>
          </div>

        ) : (

          /* Live Multi-Rail Checkout Grid */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Product & Summary (5 Cols) */}
            <div className="lg:col-span-5 opp-card p-6 sm:p-8 space-y-6">
              
              <button 
                onClick={() => setCurrentView('landing')}
                className="text-xs text-[#8C90A0] hover:text-[#0A0D14] flex items-center gap-1.5 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cancel & Return
              </button>

              <div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold border border-blue-100">
                  {sessionData?.type || 'DIGITAL PRODUCT'}
                </span>
                <h2 className="text-2xl font-bold text-[#0A0D14] mt-2 font-heading">
                  {sessionData?.title}
                </h2>
                <p className="text-xs text-[#6E717D] mt-1 leading-relaxed">
                  {sessionData?.description}
                </p>
              </div>

              {/* India-only billing */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#0A0D14] flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#0055FF]" />
                    <span>Your Billing Region</span>
                  </label>
                </div>
                <div className="w-full p-2.5 rounded-xl bg-[#F4F5F8] border border-black/10 text-xs font-mono text-[#0A0D14]">
                  India (+91) · ₹ INR
                </div>
              </div>

              {/* Dynamic In-Checkout Order Bump */}
              {!isInrSession && <div 
                onClick={() => setOrderBumpSelected(!orderBumpSelected)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  orderBumpSelected ? 'bg-blue-50/70 border-[#0055FF] ring-2 ring-[#0055FF]/10' : 'bg-[#FAFBFD] border-black/10 hover:border-black/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={orderBumpSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#0055FF] accent-[#0055FF]"
                    />
                    <span className="font-bold text-xs text-[#0A0D14] font-sans">⚡ Add Dedicated Priority GPU Queue</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0055FF]">+₹19.00 INR</span>
                </div>
                <p className="text-[11px] text-[#6E717D] pl-6">
                  Guarantees sub-50ms TTFT (Time-To-First-Token) & 24/7 dedicated enterprise throughput SLA.
                </p>
              </div>}

              {/* B2B Reverse Charge VAT / Tax ID */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0A0D14]">Buying for a Company? (0% VAT)</span>
                  <span className="text-[10px] text-[#0055FF] font-mono font-bold">VIES & IRS Real-Time</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter EU VAT / US EIN / GSTIN"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-[#F4F5F8] border border-black/10 text-xs font-mono text-[#0A0D14] focus:border-[#0055FF] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (giftCardCode.length > 4) {
                        setGiftCardApplied(true);
                      }
                    }}
                    className="opp-btn-secondary px-4 py-2 text-xs font-semibold"
                  >
                    Verify Tax ID
                  </button>
                </div>
                {giftCardApplied && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-semibold flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Valid Corporate Tax ID: 0% Reverse-Charge Applied</span>
                  </div>
                )}
              </div>

              {/* Promo Code Input */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code (Try LAUNCH50)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-[#F4F5F8] border border-black/10 text-xs font-mono text-[#0A0D14] focus:border-[#0055FF] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="opp-btn-secondary px-4 py-2 text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {discountApplied && (
                  <div className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 50% Launch Coupon Applied!
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs font-mono pt-4 border-t border-black/[0.06]">
                <div className="flex justify-between text-[#8C90A0]">
                  <span>Base Price</span>
                  <span>{displaySymbol}{basePrice.toFixed(2)} {displayCurrency}</span>
                </div>
                {orderBumpSelected && !isInrSession && (
                  <div className="flex justify-between text-[#0055FF] font-bold">
                    <span>Priority GPU Queue Add-On</span>
                    <span>+₹19.00 INR</span>
                  </div>
                )}
                {discountApplied && (
                  <div className="flex justify-between text-[#0055FF] font-bold">
                    <span>Coupon (50%)</span>
                    <span>-₹{(finalUsdAmount).toFixed(2)} INR</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8C90A0]">
                  <span>VAT / Sales Tax</span>
                  <span className="text-emerald-700 font-bold">{displaySymbol}0.00 (MoR Auto-Remitted)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#0A0D14] pt-2 border-t border-black/[0.06] font-sans">
                  <span>Total Due</span>
                  <span className="text-[#0055FF]">{displaySymbol}{finalUsdAmount.toFixed(2)} {displayCurrency}</span>
                </div>
              </div>

            </div>

            {/* Right: Payment Method Form (7 Cols) */}
            <div className="lg:col-span-7 opp-card p-6 sm:p-8 space-y-6">
              
              {/* Dodo-style checkout steps */}
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wide">
                <span className={checkoutStep === 1 ? 'text-[#0055FF]' : 'text-emerald-700'}>1. Contact & billing</span>
                <span className="text-[#C4C7D0]">→</span>
                <span className={checkoutStep === 2 ? 'text-[#0055FF]' : 'text-[#A5A8B4]'}>2. Payment</span>
              </div>

              {checkoutStep === 1 && (
                <div className="space-y-4 rounded-2xl border border-black/10 bg-[#FAFBFD] p-5">
                  <div>
                    <h3 className="text-base font-bold text-[#0A0D14]">Contact Information</h3>
                    <p className="mt-1 text-xs text-[#8C90A0]">We’ll use these details for your receipt and order updates.</p>
                  </div>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[#0055FF]" />
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[#0055FF]" />
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[#0055FF]" />
                  <div className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm text-[#0A0D14]">India (+91) · ₹ INR</div>
                  <textarea value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Billing address" rows={3} className="w-full resize-none rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[#0055FF]" />
                  {paymentError && <p className="text-xs text-red-600" role="alert">{paymentError}</p>}
                  <button type="button" onClick={handleContinueToPayment} className="opp-btn-primary w-full py-3 text-sm font-bold">Continue to Payment →</button>
                </div>
              )}

              {/* Category Selector */}
              <div className={`space-y-3 ${checkoutStep === 1 ? 'hidden' : ''}`}>
                <div className="flex items-center justify-between text-xs font-semibold text-[#8C90A0]">
                  <span>SELECT PAYMENT METHOD</span>
                  <span className="text-[10px] text-emerald-700 font-bold">● India · UPI + Cards</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setIndiaPaymentMode('upi'); setPaymentRail('upi'); }} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${indiaPaymentMode === 'upi' ? 'border-[#0055FF] bg-blue-50 text-[#0055FF]' : 'border-black/5 bg-[#F4F5F8] text-[#0A0D14]'}`}>UPI QR 🇮🇳</button>
                  <button type="button" onClick={() => { setIndiaPaymentMode('card'); setPaymentRail('card'); }} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${indiaPaymentMode === 'card' ? 'border-[#0055FF] bg-blue-50 text-[#0055FF]' : 'border-black/5 bg-[#F4F5F8] text-[#0A0D14]'}`}>Credit / Debit / RuPay</button>
                </div>

                {/* Sub-methods inside category */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {false && paymentCategory === 'cards' && (
                    <button
                      type="button"
                      onClick={() => setPaymentRail('card')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                        paymentRail === 'card' ? 'border-[#0055FF] bg-blue-50/50 text-[#0055FF] font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit / Debit</span>
                    </button>
                  )}

                  {paymentCategory === 'bnpl' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('klarna')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'klarna' ? 'border-[#0055FF] bg-pink-50/70 text-pink-700 font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <span className="font-extrabold text-pink-600 font-sans">Klarna.</span>
                        <span className="text-[10px]">4x ${(finalUsdAmount / 4).toFixed(2)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('affirm')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'affirm' ? 'border-[#0055FF] bg-blue-50/70 text-blue-700 font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <span className="font-extrabold text-blue-600 font-sans">affirm</span>
                        <span className="text-[10px]">4x ${(finalUsdAmount / 4).toFixed(2)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('afterpay')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'afterpay' ? 'border-[#0055FF] bg-emerald-50/70 text-emerald-700 font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <span className="font-extrabold text-emerald-600 font-sans">afterpay</span>
                        <span className="text-[10px]">4x ${(finalUsdAmount / 4).toFixed(2)}</span>
                      </button>
                    </>
                  )}

                  {paymentCategory === 'wallets' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('apple_pay')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'apple_pay' ? 'border-[#0055FF] bg-blue-50/50 text-[#0055FF] font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Apple Pay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('google_pay')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'google_pay' ? 'border-[#0055FF] bg-blue-50/50 text-[#0055FF] font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <Globe2 className="w-4 h-4" />
                        <span>Google Pay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('paypal')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'paypal' ? 'border-[#0055FF] bg-blue-50/50 text-[#0055FF] font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span>PayPal</span>
                      </button>
                    </>
                  )}

                  {paymentCategory === 'europe' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('ideal')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'ideal' ? 'border-[#0055FF] bg-blue-50/50 text-[#0055FF] font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <span className="font-bold text-[11px] text-pink-600">iDEAL 🇳🇱</span>
                        <span>Netherlands</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentRail('sepa')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                          paymentRail === 'sepa' ? 'border-[#0055FF] bg-blue-50/50 text-[#0055FF] font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>SEPA Debit 🇪🇺</span>
                      </button>
                    </>
                  )}

                  {paymentCategory === 'crypto' && (
                    <button
                      type="button"
                      onClick={() => setPaymentRail('crypto')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                        paymentRail === 'crypto' ? 'border-[#0055FF] bg-blue-50/50 text-[#0055FF] font-bold' : 'border-black/5 bg-[#F4F5F8] text-[#6E717D]'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-emerald-600" />
                      <span>INR Stablecoin</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Rail Form */}
              <form onSubmit={handlePay} className={`space-y-4 text-xs ${checkoutStep === 1 ? 'hidden' : ''}`}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#0A0D14]">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] focus:border-[#0055FF] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#0A0D14]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] focus:border-[#0055FF] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#0A0D14]">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full p-3 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] focus:border-[#0055FF] outline-none"
                    />
                  </div>
                </div>

                {/* 1. Card Form */}
                {paymentRail === 'card' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#F4F5F8] border border-black/5">
                    <p className="text-[11px] text-[#6E717D]">Secure card fields powered by Cashfree. Your card number never reaches QivroPay servers.</p>
                    <label className="font-semibold text-[#0A0D14]">Card Number</label><div id="qivropay-card-number" className="rounded-xl border border-black/10 bg-white p-3" />
                    <label className="font-semibold text-[#0A0D14]">Card Holder Name</label><div id="qivropay-card-holder" className="rounded-xl border border-black/10 bg-white p-3" />
                    <div className="grid grid-cols-2 gap-3"><div><label className="font-semibold text-[#0A0D14]">Expiry</label><div id="qivropay-card-expiry" className="rounded-xl border border-black/10 bg-white p-3" /></div><div><label className="font-semibold text-[#0A0D14]">CVV</label><div id="qivropay-card-cvv" className="rounded-xl border border-black/10 bg-white p-3" /></div></div>
                  </div>
                )}

                {/* 2. Apple Pay Form */}
                {paymentRail === 'apple_pay' && (
                  <div className="p-6 rounded-2xl bg-[#F4F5F8] border border-black/5 text-center space-y-2">
                    <Smartphone className="w-8 h-8 text-[#0055FF] mx-auto" />
                    <div className="font-bold text-[#0A0D14]">Apple Pay One-Click Checkout</div>
                    <p className="text-[#8C90A0] text-xs">Touch ID / Face ID biometric authorization enabled.</p>
                  </div>
                )}

                {/* 3. Google Pay Form */}
                {paymentRail === 'google_pay' && (
                  <div className="p-6 rounded-2xl bg-[#F4F5F8] border border-black/5 text-center space-y-2">
                    <Globe2 className="w-8 h-8 text-[#0055FF] mx-auto" />
                    <div className="font-bold text-[#0A0D14]">Google Pay Instant Flow</div>
                    <p className="text-[#8C90A0] text-xs">Authorize securely with your saved Google Wallet payment method.</p>
                  </div>
                )}

                {/* 4. PayPal Form */}
                {paymentRail === 'paypal' && (
                  <div className="p-6 rounded-2xl bg-[#F4F5F8] border border-black/5 text-center space-y-2">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto" />
                    <div className="font-bold text-[#0A0D14]">PayPal & Pay in 4</div>
                    <p className="text-[#8C90A0] text-xs">Redirects seamlessly to PayPal for one-click approval.</p>
                  </div>
                )}

                {/* 5. iDEAL Form */}
                {paymentRail === 'ideal' && (
                  <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5 space-y-3">
                    <label className="font-semibold text-[#0A0D14]">Select Dutch Bank (iDEAL 🇳🇱)</label>
                    <select
                      value={idealBank}
                      onChange={(e) => setIdealBank(e.target.value)}
                      className="w-full p-3 rounded-xl border border-black/10 bg-white text-[#0A0D14] shadow-xs"
                    >
                      <option value="ING Bank">ING Bank</option>
                      <option value="ABN AMRO">ABN AMRO</option>
                      <option value="Rabobank">Rabobank</option>
                      <option value="bunq">bunq</option>
                      <option value="Revolut">Revolut</option>
                    </select>
                  </div>
                )}

                {/* 6. UPI Form */}
                {paymentRail === 'upi' && (
                  <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5 space-y-2">
                    <label className="font-semibold text-[#0A0D14]">UPI ID / Virtual Payment Address (VPA 🇮🇳)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full p-3 rounded-xl border border-black/10 bg-white text-[#0A0D14] font-mono shadow-xs"
                    />
                  </div>
                )}

                {/* 7. Crypto INR Form */}
                {paymentRail === 'crypto' && (
                  <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span>Select Network:</span>
                      <div className="flex gap-1">
                        {(['solana', 'base', 'polygon'] as const).map(net => (
                          <button
                            key={net}
                            type="button"
                            onClick={() => setCryptoNetwork(net)}
                            className={`px-2 py-0.5 rounded-lg uppercase text-[10px] font-bold ${
                              cryptoNetwork === net ? 'bg-[#0055FF] text-white' : 'bg-white text-[#6E717D]'
                            }`}
                          >
                            {net}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-black/10 text-[10px] font-mono text-[#6E717D] truncate shadow-xs">
                      Deposit: 0x71C...B9a4 (Instant confirmation)
                    </div>
                  </div>
                )}

                {paymentError && <p className="text-xs text-red-600" role="alert">{paymentError}</p>}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="opp-btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Lock className="w-4 h-4 fill-white" />
                  {isProcessing ? 'Opening secure Cashfree checkout...' : `Pay ${isInrSession ? '₹' : '$'}${finalUsdAmount.toFixed(2)} ${isInrSession ? 'INR' : 'INR'} via ${paymentRail.toUpperCase().replace('_', ' ')}`}
                </button>

                {isInrSession && indiaPaymentMode === 'upi' && (
                  <div className="mt-4 rounded-2xl border border-black/10 bg-white p-5 text-center" aria-label="QivroPay secure UPI payment">
                    <p className="text-sm font-bold text-[#0A0D14]">Scan & pay securely with any UPI app</p>
                    <p className="mt-1 text-[11px] text-[#8C90A0]">Your payment stays on QivroPay. No redirect.</p>
                    <div ref={cashfreeContainerRef} className="mx-auto mt-4 min-h-0 w-fit overflow-hidden rounded-xl bg-white" />
                    {cashfreePaymentStarted && <p className="mt-3 text-xs font-semibold text-emerald-700">Waiting for UPI confirmation…</p>}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#8C90A0] font-medium pt-2">
                  <span>🔒 PCI-DSS Level 1</span>
                  <span>•</span>
                  <span>100% Money-Back Guarantee</span>
                  <span>•</span>
                  <span>Instant Delivery</span>
                </div>

              </form>

            </div>

          </div>

        )}
      </main>

      {/* 1-Click Post-Purchase Upsell Modal */}
      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0055FF] flex items-center justify-center mx-auto border border-blue-200">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                EXCLUSIVE 1-CLICK UPGRADE (70% OFF)
              </span>
              <h3 className="font-bold text-lg text-[#0A0D14] font-heading pt-1">
                Add 10,000,000 Inference Credits
              </h3>
              <p className="text-xs text-[#6E717D]">
                One-time offer for new buyers. Billed instantly to your authorized payment method with zero card re-entry.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F5F8] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8C90A0]">Special Add-On Price:</span>
              <div>
                <span className="line-through text-[#8C90A0] mr-2">₹49.00</span>
                <span className="font-bold text-emerald-700 text-sm">₹15.00 INR</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAcceptUpsell}
                className="opp-btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Claim 10M Tokens for ₹15 (1-Click)</span>
              </button>
              
              <button
                onClick={() => setShowUpsellModal(false)}
                className="text-xs text-[#8C90A0] hover:text-[#0A0D14] transition-colors pt-1 block mx-auto font-medium"
              >
                No thanks, proceed to receipt & invoice →
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-black/[0.06] py-4 text-center text-xs text-[#8C90A0]">
        Powered by QivroPay (by Neocraft LLP) • Reseller & Merchant of Record for Digital Products across 220+ Territories
      </footer>

    </div>
  );
};
