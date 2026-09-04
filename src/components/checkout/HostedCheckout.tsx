import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Globe2,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { printOrDownloadInvoice } from '../../utils/invoiceGenerator';

interface CheckoutProps {
  sessionId?: string | null;
}

// QivroPay V1 supports exactly these two rails, both via Cashfree. Nothing
// else is wired to the real Cashfree order/pay flow below.
type PaymentRail = 'card' | 'upi';

export const HostedCheckout: React.FC<CheckoutProps> = ({ sessionId }) => {
  const { setCurrentView, checkoutReturnTo } = useApp();
  // A merchant previewing their own product/payment link from the dashboard
  // gets 'dashboard' here; a real customer opening a shared checkout link
  // gets 'landing' (the default). Keeps "cancel"/"return" from stranding a
  // merchant on the public marketing site instead of their own workspace.
  const exitView: 'landing' | 'dashboard' = checkoutReturnTo === 'dashboard' ? 'dashboard' : 'landing';
  const exitLabel = checkoutReturnTo === 'dashboard' ? 'Back to Dashboard' : 'Return home';
  const goToExit = () => setCurrentView(exitView);

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // The backend is the single source of truth for sandbox vs production —
  // this page never reads its own build-time env var for this. Defaults to
  // the safe choice (sandbox) until the session response tells us otherwise.
  const [cashfreeEnvironment, setCashfreeEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentRail, setPaymentRail] = useState<PaymentRail>('upi');
  const [indiaPaymentMode, setIndiaPaymentMode] = useState<'upi' | 'card'>('upi');

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
        const sid = String(sessionId || '');
        if (!sid) { setPaymentError('This checkout link is invalid or missing.'); return; }

        // A cached receipt from a previous visit is never authoritative on
        // its own — someone could hand-edit localStorage to fabricate one.
        // It's shown only as a temporary UI optimization (avoids a flash of
        // the payment form while the server round-trip below completes) and
        // is immediately revalidated; if the server doesn't confirm it, it
        // is discarded and removed from storage.
        let optimisticReceipt: any = null;
        try {
          const savedReceipt = localStorage.getItem(`qivropay:receipt:${sid}`);
          if (savedReceipt) {
            optimisticReceipt = JSON.parse(savedReceipt);
            setCompletedTx(optimisticReceipt);
            setCheckoutStep(2);
          }
        } catch {}

        const discardUnverifiedReceipt = () => {
          if (!optimisticReceipt) return;
          setCompletedTx(null);
          setCheckoutStep(1);
          try { localStorage.removeItem(`qivropay:receipt:${sid}`); } catch {}
        };

        const res = await fetch(`/api/v1/payments/session/${sid}`);
        const data = await res.json();
        if (data.success && data.session) {
          setSessionData(data.session);
          setCashfreeEnvironment(data.cashfreeEnvironment === 'production' ? 'production' : 'sandbox');
          if (String(data.session.currency || '').toUpperCase() === 'INR') {
            setPaymentRail('upi');
            if (data.session.customerEmail) setCustomerEmail(data.session.customerEmail);
          }
          try {
            const restoreRes = await fetch(`/api/v1/india/cashfree/session/${encodeURIComponent(sid)}/status`);
            const restore = await restoreRes.json();
            if (restore.found && ['PAID', 'SUCCESS'].includes(restore.orderStatus)) {
              const verified = {
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
              };
              setCompletedTx(verified);
              setCheckoutStep(2);
              try { localStorage.setItem(`qivropay:receipt:${sid}`, JSON.stringify(verified)); } catch {}
            } else {
              // Server does not confirm this session as paid — an
              // optimistically-shown cached receipt cannot stand.
              discardUnverifiedReceipt();
            }
          } catch (restoreError) {
            console.warn('Payment receipt restore skipped:', restoreError);
            // Could not verify against the server at all — never keep an
            // unverified "success" screen displayed as if it were real.
            discardUnverifiedReceipt();
          }
        } else {
          setPaymentError(data.error || 'This checkout session is invalid or expired.');
          discardUnverifiedReceipt();
        }
      } catch (err) {
        console.error('Session load error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (checkoutStep !== 2 || indiaPaymentMode !== 'card') return;
    const cashfree = (window as any).Cashfree?.({ mode: cashfreeEnvironment });
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
  }, [checkoutStep, indiaPaymentMode, cashfreeEnvironment]);

  const handleContinueToPayment = () => {
    if (!customerName.trim()) return setPaymentError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return setPaymentError('Please enter a valid email address.');
    if (isInrSession && !/^\+?\d[\d\s-]{9,14}$/.test(customerPhone.trim())) return setPaymentError('Please enter a valid 10-digit mobile number.');
    if (!billingAddress.trim()) return setPaymentError('Please enter your billing address.');
    setPaymentError(null);
    setCheckoutStep(2);
  };

  const basePrice = sessionData?.amount || 29.00;
  // QivroPay currently operates in India only: INR + UPI is the sole checkout rail.
  const isInrSession = true;
  const displayCurrency = 'INR';
  const displaySymbol = '₹';
  const receiptCurrency = String(completedTx?.currency || displayCurrency).toUpperCase();
  const receiptSymbol = '₹';
  const finalUsdAmount = basePrice;
  const isSandboxCheckout = cashfreeEnvironment !== 'production';

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setPaymentError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setPaymentError('Please enter a valid email address.');
      return;
    }
    if (!/^\+?\d[\d\s-]{9,14}$/.test(customerPhone.trim())) {
      setPaymentError('Please enter a valid 10-digit mobile number.');
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
        const cashfree = (window as any).Cashfree?.({ mode: cashfreeEnvironment });
        if (!cashfree) throw new Error('Cashfree checkout SDK failed to load.');
        let paymentResult: any;
        if (indiaPaymentMode === 'card') {
          const card = cashfreeCardNumberRef.current;
          if (!card || !cashfreeCardReadyRef.current || !card.isComplete?.() || !cashfreeCardHolderRef.current?.isComplete?.() || !cashfreeCardExpiryRef.current?.isComplete?.() || !cashfreeCardCvvRef.current?.isComplete?.()) {
            throw new Error('Please complete all card details.');
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
          const statusRes = await fetch(`/api/v1/india/cashfree/orders/${encodeURIComponent(orderData.orderId)}/status?sessionToken=${encodeURIComponent(sessionId || '')}`);
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
            try { localStorage.setItem(`qivropay:receipt:${sessionId || 'checkout'}`, JSON.stringify(transaction)); } catch {}
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            break;
          }
          if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(statusData.orderStatus)) break;
        }
        if (!settled) setPaymentError('Payment confirmation pending. Please check your UPI app and try again.');
      } catch (err: any) {
        const qrRendered = Boolean(cashfreeContainerRef.current?.childElementCount);
        setPaymentError(qrRendered ? null : (err?.message || 'Could not start payment. Please try again.'));
        setIsProcessing(false);
      }
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#0A0D14] font-sans flex flex-col justify-between selection:bg-[#0055FF] selection:text-white">
      
      {/* Checkout Navbar */}
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={goToExit} />
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C90A0]">
            {isSandboxCheckout && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800">
                Sandbox test
              </span>
            )}
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">256-bit Encrypted • QivroPay Payments</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        {loading ? (
          <div className="text-center py-20 font-mono text-sm text-[#0055FF] animate-pulse">
            Loading secure checkout session...
          </div>
        ) : !sessionData ? (
          <div className="w-full max-w-lg p-8 sm:p-12 rounded-3xl bg-white border border-black/10 shadow-xl space-y-4 text-center">
            <div className="text-rose-600 font-bold">Checkout unavailable</div>
            <p className="text-sm text-slate-500">{paymentError || 'This checkout link is invalid or expired.'}</p>
            <button onClick={goToExit} className="opp-btn-primary px-5 py-2.5 text-sm font-semibold">{exitLabel}</button>
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
              {isSandboxCheckout && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                  Sandbox test payment. This is not a live production charge.
                </p>
              )}
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
                <span className="text-[#8C90A0]">Processed Via:</span>
                <span className="text-emerald-700 font-bold">QivroPay (Cashfree)</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => printOrDownloadInvoice(completedTx)}
                className="opp-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Receipt (PDF)</span>
              </button>

              <button
                onClick={() => setCurrentView('portal', { customerEmail: completedTx.customerEmail })}
                className="opp-btn-secondary w-full py-2.5 text-xs font-semibold"
              >
                View Your Receipts
              </button>

              <button
                onClick={goToExit}
                className="text-xs text-[#8C90A0] hover:text-[#0A0D14] transition-colors pt-1"
              >
                ← {exitLabel}
              </button>
            </div>
          </div>

        ) : (

          /* Live Multi-Rail Checkout Grid */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Product & Summary (5 Cols) */}
            <div className="lg:col-span-5 opp-card p-6 sm:p-8 space-y-6">
              
              <button
                onClick={goToExit}
                className="text-xs text-[#8C90A0] hover:text-[#0A0D14] flex items-center gap-1.5 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cancel & {exitLabel}
              </button>

              <div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055FF] font-bold border border-blue-100">
                  {sessionData?.type || 'DIGITAL PRODUCT'}
                </span>
                {isSandboxCheckout && (
                  <span className="ml-2 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    Sandbox test
                  </span>
                )}
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
                {isSandboxCheckout && (
                  <p className="text-[11px] text-amber-800">
                    Test mode: use Cashfree sandbox credentials only. No production charge is created.
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs font-mono pt-4 border-t border-black/[0.06]">
                <div className="flex justify-between text-[#8C90A0]">
                  <span>Amount</span>
                  <span>{displaySymbol}{basePrice.toFixed(2)} {displayCurrency}</span>
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
                  <span className="text-[10px] text-emerald-700 font-bold">● {isSandboxCheckout ? 'Sandbox' : 'Live'} · India · UPI + Cards</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setIndiaPaymentMode('upi'); setPaymentRail('upi'); }} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${indiaPaymentMode === 'upi' ? 'border-[#0055FF] bg-blue-50 text-[#0055FF]' : 'border-black/5 bg-[#F4F5F8] text-[#0A0D14]'}`}>UPI QR 🇮🇳</button>
                  <button type="button" onClick={() => { setIndiaPaymentMode('card'); setPaymentRail('card'); }} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${indiaPaymentMode === 'card' ? 'border-[#0055FF] bg-blue-50 text-[#0055FF]' : 'border-black/5 bg-[#F4F5F8] text-[#0A0D14]'}`}>Credit / Debit / RuPay</button>
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

                {/* Card Form — real Cashfree-hosted fields */}
                {paymentRail === 'card' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#F4F5F8] border border-black/5">
                    <p className="text-[11px] text-[#6E717D]">Secure card fields powered by Cashfree. Your card number never reaches QivroPay servers.</p>
                    <label className="font-semibold text-[#0A0D14]">Card Number</label><div id="qivropay-card-number" className="rounded-xl border border-black/10 bg-white p-3" />
                    <label className="font-semibold text-[#0A0D14]">Card Holder Name</label><div id="qivropay-card-holder" className="rounded-xl border border-black/10 bg-white p-3" />
                    <div className="grid grid-cols-2 gap-3"><div><label className="font-semibold text-[#0A0D14]">Expiry</label><div id="qivropay-card-expiry" className="rounded-xl border border-black/10 bg-white p-3" /></div><div><label className="font-semibold text-[#0A0D14]">CVV</label><div id="qivropay-card-cvv" className="rounded-xl border border-black/10 bg-white p-3" /></div></div>
                  </div>
                )}

                {paymentError && <p className="text-xs text-red-600" role="alert">{paymentError}</p>}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="opp-btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Lock className="w-4 h-4 fill-white" />
                  {isProcessing ? 'Opening secure Cashfree checkout...' : `Pay ₹${finalUsdAmount.toFixed(2)} INR via ${paymentRail === 'card' ? 'Card' : 'UPI'}`}
                </button>

                {isInrSession && indiaPaymentMode === 'upi' && (
                  <div className="mt-4 rounded-2xl border border-black/10 bg-white p-5 text-center" aria-label="QivroPay secure UPI payment">
                    <p className="text-sm font-bold text-[#0A0D14]">Scan & pay securely with any UPI app</p>
                    <p className="mt-1 text-[11px] text-[#8C90A0]">
                      {isSandboxCheckout ? 'Sandbox test payment via Cashfree.' : 'Your payment stays on QivroPay. No redirect.'}
                    </p>
                    <div ref={cashfreeContainerRef} className="mx-auto mt-4 min-h-0 w-fit overflow-hidden rounded-xl bg-white" />
                    {cashfreePaymentStarted && <p className="mt-3 text-xs font-semibold text-emerald-700">Waiting for UPI confirmation…</p>}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#8C90A0] font-medium pt-2">
                  <span>🔒 Card data handled by Cashfree (PCI-DSS Level 1)</span>
                </div>

              </form>

            </div>

          </div>

        )}
      </main>

      <footer className="border-t border-black/[0.06] py-4 text-center text-xs text-[#8C90A0]">
        Powered by QivroPay, built on Cashfree's payment infrastructure{isSandboxCheckout ? ' · Sandbox test mode' : ''}
      </footer>

    </div>
  );
};
