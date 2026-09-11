import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Download,
  AlertCircle,
  CreditCard,
  QrCode,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { printOrDownloadInvoice } from '../../utils/invoiceGenerator';
import { formatCurrency, getCurrencySymbol, CURRENCY_METADATA } from '../../lib/currency';

interface CheckoutProps {
  sessionId?: string | null;
}

type PaymentRail = 'card' | 'upi';

// High-precision Card Network Badges
const VisaLogo = () => (
  <span className="inline-flex items-center justify-center font-sans font-black italic tracking-tighter text-[10px] text-[#0055FF] bg-white px-1.5 py-0.5 rounded border border-slate-200/80 shadow-2xs">
    VISA
  </span>
);

const MastercardLogo = () => (
  <span className="inline-flex items-center justify-center bg-white px-1 py-0.5 rounded border border-slate-200/80 shadow-2xs">
    <svg className="h-2.5 w-3.5" viewBox="0 0 24 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#EB001B" />
      <circle cx="16" cy="8" r="7" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  </span>
);

const AmexLogo = () => (
  <span className="inline-flex items-center justify-center text-[8px] font-black tracking-tight bg-[#006FCF] text-white px-1 py-0.5 rounded font-mono shadow-2xs">
    AMEX
  </span>
);

export const HostedCheckout: React.FC<CheckoutProps> = ({ sessionId }) => {
  const { setCurrentView, checkoutReturnTo } = useApp();
  const exitView: 'landing' | 'dashboard' = checkoutReturnTo === 'dashboard' ? 'dashboard' : 'landing';
  const exitLabel = checkoutReturnTo === 'dashboard' ? 'Back to Dashboard' : 'Return to store';
  const goToExit = () => setCurrentView(exitView);

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cashfreeEnvironment, setCashfreeEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentRail, setPaymentRail] = useState<PaymentRail>('card');
  const [indiaPaymentMode, setIndiaPaymentMode] = useState<'card' | 'upi'>('card');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cashfreePaymentStarted, setCashfreePaymentStarted] = useState(false);

  const cashfreeContainerRef = useRef<HTMLDivElement>(null);
  const cashfreePaymentMethodRef = useRef<any>(null);
  const cashfreeCardNumberRef = useRef<any>(null);
  const cashfreeCardHolderRef = useRef<any>(null);
  const cashfreeCardExpiryRef = useRef<any>(null);
  const cashfreeCardCvvRef = useRef<any>(null);
  const cashfreeCardReadyRef = useRef(false);

  // 1. Fetch and verify the server-authoritative checkout session
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const sid = String(sessionId || '');
        if (!sid) {
          setPaymentError('This checkout link is invalid or missing.');
          return;
        }

        // Check optimistic cached receipt (verified against server)
        let optimisticReceipt: any = null;
        try {
          const savedReceipt = localStorage.getItem(`qivropay:receipt:${sid}`);
          if (savedReceipt) {
            optimisticReceipt = JSON.parse(savedReceipt);
            setCompletedTx(optimisticReceipt);
          }
        } catch {}

        const discardUnverifiedReceipt = () => {
          if (!optimisticReceipt) return;
          setCompletedTx(null);
          try { localStorage.removeItem(`qivropay:receipt:${sid}`); } catch {}
        };

        const res = await fetch(`/api/v1/payments/session/${sid}`);
        const data = await res.json();
        if (data.success && data.session) {
          setSessionData(data.session);
          setCashfreeEnvironment(data.cashfreeEnvironment === 'production' ? 'production' : 'sandbox');
          const isCurrInr = String(data.session.currency || '').toUpperCase() === 'INR';

          if (isCurrInr) {
            setPaymentRail('card');
            setIndiaPaymentMode('card');
          } else {
            setPaymentRail('card');
            setIndiaPaymentMode('card');
          }

          if (data.session.customerEmail) setCustomerEmail(data.session.customerEmail);

          // Verify status on backend
          try {
            const restoreRes = await fetch(`/api/v1/india/cashfree/session/${encodeURIComponent(sid)}/status`);
            const restore = await restoreRes.json();
            if (restore.found && ['PAID', 'SUCCESS'].includes(restore.orderStatus)) {
              const verified = {
                id: restore.orderId,
                amount: Number(restore.orderAmount || data.session.amount || 0),
                currency: restore.orderCurrency || data.session.currency || 'USD',
                status: 'succeeded',
                customerEmail: restore.customerEmail || data.session.customerEmail || '',
                customerName: 'Customer',
                productName: data.session.title || 'QivroPay payment',
                credits: Number(data.session.credits || 0),
                paymentMethod: isCurrInr ? (paymentRail === 'upi' ? 'upi' : 'card') : 'card',
                createdAt: new Date().toISOString()
              };
              setCompletedTx(verified);
              try { localStorage.setItem(`qivropay:receipt:${sid}`, JSON.stringify(verified)); } catch {}
            } else {
              discardUnverifiedReceipt();
            }
          } catch {
            discardUnverifiedReceipt();
          }
        } else {
          setPaymentError(data.error || 'This checkout session is invalid or expired.');
          discardUnverifiedReceipt();
        }
      } catch (err) {
        console.error('Session load error', err);
        setPaymentError('Unable to load checkout details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Derived session attributes
  const basePrice = Number(sessionData?.amount || 0);
  const sessionCurrency = String(sessionData?.currency || 'USD').toUpperCase();
  const isInrSession = sessionCurrency === 'INR';
  const displayCurrency = sessionCurrency;
  const currencyMeta = (CURRENCY_METADATA as any)[displayCurrency] || { name: 'Currency', flag: '🌐' };
  const receiptCurrency = String(completedTx?.currency || displayCurrency).toUpperCase();
  const finalAmount = basePrice;
  const isSandboxCheckout = cashfreeEnvironment !== 'production';
  const merchantDisplayName = sessionData?.company || sessionData?.merchantName || 'Verified Merchant';

  // 2. Initialize and Mount Cashfree PCI-DSS Card Components
  useEffect(() => {
    if (loading || !sessionData || completedTx) return;
    if (paymentRail !== 'card') return;

    let timer: any = null;
    let cancelled = false;

    const initCashfree = () => {
      if (cancelled) return true;
      const cashfree = (window as any).Cashfree?.({ mode: cashfreeEnvironment });
      if (!cashfree) return false;

      const numEl = document.getElementById('qivropay-card-number');
      const holderEl = document.getElementById('qivropay-card-holder');
      const expiryEl = document.getElementById('qivropay-card-expiry');
      const cvvEl = document.getElementById('qivropay-card-cvv');

      if (!numEl || !holderEl || !expiryEl || !cvvEl) return false;

      try {
        const mountCard = (name: string, ref: React.MutableRefObject<any>, selector: string) => {
          const component = cashfree.create(name, {
            values: name === 'cardNumber' ? { placeholder: '•••• •••• •••• ••••' } :
                    name === 'cardExpiry' ? { placeholder: 'MM / YY' } :
                    name === 'cardCvv' ? { placeholder: 'CVC' } :
                    { placeholder: 'Name on card' }
          });
          component.mount(selector);
          ref.current = component;
          return component;
        };

        const number = mountCard('cardNumber', cashfreeCardNumberRef, '#qivropay-card-number');
        const holder = mountCard('cardHolder', cashfreeCardHolderRef, '#qivropay-card-holder');
        const expiry = mountCard('cardExpiry', cashfreeCardExpiryRef, '#qivropay-card-expiry');
        const cvv = mountCard('cardCvv', cashfreeCardCvvRef, '#qivropay-card-cvv');

        const markReady = () => { cashfreeCardReadyRef.current = true; };
        number.on('ready', markReady);
        holder.on('ready', markReady);
        expiry.on('ready', markReady);
        cvv.on('ready', markReady);
        return true;
      } catch (e) {
        console.warn('Cashfree card component mount skipped:', e);
        return false;
      }
    };

    const mounted = initCashfree();
    if (!mounted) {
      let retries = 0;
      timer = setInterval(() => {
        retries++;
        if (initCashfree() || retries > 15) {
          clearInterval(timer);
        }
      }, 250);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      cashfreeCardReadyRef.current = false;
    };
  }, [loading, sessionData?.sessionId, paymentRail, cashfreeEnvironment]);

  // 3. Handle Payment Submission
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setPaymentError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setPaymentError('Please enter a valid email address.');
      return;
    }

    const digitsOnly = customerPhone.replace(/\D/g, '');
    const cleanPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : (digitsOnly || '9876543210');
    if (cleanPhone.length < 10) {
      setPaymentError('Please enter a valid contact phone number.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const orderRes = await fetch('/api/v1/india/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderAmount: finalAmount,
          customerEmail: customerEmail.trim(),
          customerPhone: cleanPhone,
          orderNote: sessionData?.title || 'QivroPay payment',
          sessionToken: sessionId || ''
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success || !orderData.paymentSessionId) {
        throw new Error(orderData.error || 'Failed to initialize payment session with provider.');
      }

      const cashfree = (window as any).Cashfree?.({ mode: cashfreeEnvironment });
      if (!cashfree) throw new Error('Payment checkout SDK failed to load. Please refresh.');

      let paymentResult: any;

      if (paymentRail === 'card') {
        const card = cashfreeCardNumberRef.current;
        if (!card || !cashfreeCardReadyRef.current || !card.isComplete?.() || !cashfreeCardHolderRef.current?.isComplete?.() || !cashfreeCardExpiryRef.current?.isComplete?.() || !cashfreeCardCvvRef.current?.isComplete?.()) {
          throw new Error('Please enter complete and valid card details.');
        }
        cashfreePaymentMethodRef.current = card;
        paymentResult = await cashfree.pay({
          paymentMethod: card,
          paymentSessionId: orderData.paymentSessionId,
          redirect: 'if_required',
          returnUrl: `${window.location.origin}/checkout/${encodeURIComponent(sessionId || '')}`
        });
      } else {
        // UPI QR rail
        if (!cashfreeContainerRef.current) throw new Error('Payment container could not be opened.');
        const upiQr = cashfree.create('upiQr', { values: { size: '240px' } });
        const qrReady = new Promise<void>((resolve, reject) => {
          upiQr.on('ready', () => resolve());
          upiQr.on('loaderror', (data: any) => reject(new Error(data?.error || 'UPI QR load failed')));
        });
        cashfreeContainerRef.current.id = 'qivropay-upi-qr';
        upiQr.mount('#qivropay-upi-qr');
        cashfreePaymentMethodRef.current = upiQr;
        await Promise.race([
          qrReady,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('UPI QR load timeout')), 10000))
        ]);
        setCashfreePaymentStarted(true);
        paymentResult = await cashfree.pay({
          paymentMethod: upiQr,
          paymentSessionId: orderData.paymentSessionId,
          redirect: 'if_required',
          returnUrl: `${window.location.origin}/checkout/${encodeURIComponent(sessionId || '')}`
        });
      }

      if (paymentResult?.error) console.warn('Payment result notice:', paymentResult.error);
      setPaymentError(null);

      // Verify status server-to-server
      let settled = false;
      for (let attempt = 0; attempt < 24; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const statusRes = await fetch(
          `/api/v1/india/cashfree/orders/${encodeURIComponent(orderData.orderId)}/status?sessionToken=${encodeURIComponent(sessionId || '')}`
        );
        const statusData = await statusRes.json();
        if (statusData.orderStatus === 'PAID' || statusData.orderStatus === 'SUCCESS') {
          settled = true;
          const transaction = {
            id: orderData.orderId,
            amount: Number(statusData.orderAmount || finalAmount),
            currency: statusData.orderCurrency || displayCurrency,
            status: 'succeeded',
            customerEmail: customerEmail.trim(),
            customerName: customerName.trim(),
            productName: sessionData?.title || 'QivroPay payment',
            credits: Number(sessionData?.credits || 0),
            paymentMethod: paymentRail,
            createdAt: new Date().toISOString()
          };
          setCompletedTx(transaction);
          try { localStorage.setItem(`qivropay:receipt:${sessionId || 'checkout'}`, JSON.stringify(transaction)); } catch {}
          confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
          break;
        }
        if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(statusData.orderStatus)) {
          throw new Error('Payment was declined or cancelled. Please try again.');
        }
      }

      if (!settled && !cashfreePaymentStarted) {
        setPaymentError('Payment confirmation pending. Please check your bank or retry.');
      }
    } catch (err: any) {
      setPaymentError(err?.message || 'Could not complete payment. Please check your details and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between selection:bg-[#0055FF] selection:text-white">
      
      {/* Top Header: Focused, Trustworthy, Minimal */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink">
            <Logo onClick={goToExit} size="sm" />
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Secure Checkout</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSandboxCheckout ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Sandbox Test
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Secure
              </span>
            )}
            
            <button
              onClick={goToExit}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium ml-1 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{exitLabel}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 flex items-center justify-center">
        
        {loading ? (
          /* Sleek Skeleton Loading State */
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-pulse">
            <div className="lg:col-span-7 p-8 space-y-6">
              <div className="h-6 w-32 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="space-y-3 pt-4">
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
              <div className="h-12 bg-blue-100 rounded-xl mt-6" />
            </div>
            <div className="lg:col-span-5 bg-[#F8FAFC] border-t lg:border-t-0 lg:border-l border-slate-100 p-8 space-y-6">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-48 bg-slate-200 rounded-lg" />
              <div className="h-16 bg-slate-200 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          </div>

        ) : !sessionData ? (
          /* Invalid / Expired Checkout Card */
          <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Checkout Session Unavailable</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                {paymentError || 'This payment link has expired or is no longer valid. Please request a new checkout link from the merchant.'}
              </p>
            </div>
            <button
              onClick={goToExit}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {exitLabel}
            </button>
          </div>

        ) : completedTx ? (
          /* Success Receipt Card */
          <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.1)] space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Payment Successful
              </h2>
              {isSandboxCheckout ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Sandbox Test Payment • No real card was charged
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Confirmed & Settled
                </span>
              )}
              <p className="text-xs text-slate-400 font-mono pt-1">
                Ref ID: <span className="text-slate-700 font-semibold">{completedTx.id}</span>
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 text-left text-xs space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Product</span>
                <span className="text-slate-900 font-bold">{completedTx.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Amount Paid</span>
                <span className="text-[#0055FF] font-bold text-sm">{formatCurrency(completedTx.amount, receiptCurrency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Rail</span>
                <span className="text-slate-800 font-semibold uppercase">{completedTx.paymentMethod || 'Card'}</span>
              </div>
              {completedTx.credits > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Credits Delivered</span>
                  <span className="text-emerald-700 font-bold">+{completedTx.credits.toLocaleString()} Credits</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Receipt Email</span>
                <span className="text-slate-800">{completedTx.customerEmail}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                <span className="text-slate-400">Processed via</span>
                <span className="text-slate-600 font-medium">QivroPay (Cashfree Rails)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => printOrDownloadInvoice(completedTx)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Receipt (PDF)</span>
              </button>

              <button
                onClick={() => setCurrentView('portal', { customerEmail: completedTx.customerEmail })}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                View Past Receipts
              </button>

              <button
                onClick={goToExit}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors pt-2 block mx-auto cursor-pointer"
              >
                ← {exitLabel}
              </button>
            </div>
          </div>

        ) : (
          /* Premium AceCoinPay-Inspired 2-Column Checkout Shell */
          <div className="w-full max-w-4xl space-y-4">

            {/* Mobile-Only Compact Order Summary Banner */}
            <div className="lg:hidden bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
              <div 
                onClick={() => setMobileSummaryExpanded(!mobileSummaryExpanded)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0055FF] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{sessionData?.title || 'Order Payment'}</div>
                    <div className="text-[11px] text-slate-500">{merchantDisplayName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-[#0055FF]">
                    {formatCurrency(finalAmount, displayCurrency)}
                  </span>
                  {mobileSummaryExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {mobileSummaryExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 animate-fade-in">
                  {sessionData?.description && (
                    <p className="text-[11px] text-slate-500">{sessionData.description}</p>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span>{formatCurrency(basePrice, displayCurrency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Total:</span>
                    <span>{formatCurrency(finalAmount, displayCurrency)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Main Desktop Container */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              
              {/* ============================================================ */}
              {/* LEFT COLUMN (7 COLS): PAYMENT METHOD & FORM */}
              {/* ============================================================ */}
              <div className="lg:col-span-7 p-4 sm:p-8 space-y-6 flex flex-col justify-between">
                
                <div className="space-y-6">
                  
                  {/* Form Header */}
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Details</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Complete your transaction with a secure payment method.</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>256-bit SSL</span>
                    </div>
                  </div>

                  {/* Method Selector */}
                  {isInrSession ? (
                    <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => { setPaymentRail('card'); setIndiaPaymentMode('card'); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          paymentRail === 'card'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#0055FF]" />
                        <span>Credit / Debit / RuPay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPaymentRail('upi'); setIndiaPaymentMode('upi'); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          paymentRail === 'upi'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        <span>UPI (Instant QR) 🇮🇳</span>
                      </button>
                    </div>
                  ) : (
                    /* International Card Header Badge */
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-3.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0055FF] flex items-center justify-center border border-blue-100 shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">Credit or Debit Card</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">International card network</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <VisaLogo />
                        <MastercardLogo />
                        <AmexLogo />
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <form onSubmit={handlePay} className="space-y-4">
                    
                    {/* Customer Contact Information */}
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full name
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Sarah Miller"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#0055FF] focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Email address
                          </label>
                          <input
                            type="email"
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#0055FF] focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Phone number
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Contact phone number"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#0055FF] focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Elements — Cashfree PCI-DSS Level 1 Secure Mount Points */}
                    {paymentRail === 'card' && (
                      <div className="pt-2 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-700">
                            Card number
                          </label>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Encrypted</span>
                          </div>
                        </div>

                        {/* Cashfree Card Number Mount */}
                        <div
                          id="qivropay-card-number"
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white shadow-sm focus-within:border-[#0055FF] focus-within:ring-2 focus-within:ring-blue-50 transition-all"
                        />

                        {/* Cashfree Expiry and CVV Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Expiration date
                            </label>
                            <div
                              id="qivropay-card-expiry"
                              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white shadow-sm focus-within:border-[#0055FF] focus-within:ring-2 focus-within:ring-blue-50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between items-center">
                              <span>CVC / CVV</span>
                              <span className="text-[10px] text-slate-400">3-4 digits</span>
                            </label>
                            <div
                              id="qivropay-card-cvv"
                              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white shadow-sm focus-within:border-[#0055FF] focus-within:ring-2 focus-within:ring-blue-50 transition-all"
                            />
                          </div>
                        </div>

                        {/* Cashfree Cardholder Name Mount */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Name on card
                          </label>
                          <div
                            id="qivropay-card-holder"
                            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white shadow-sm focus-within:border-[#0055FF] focus-within:ring-2 focus-within:ring-blue-50 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* UPI QR Display (for INR sessions) */}
                    {paymentRail === 'upi' && (
                      <div className="pt-2 space-y-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 text-center">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 mb-3">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">Scan to Pay via UPI</h4>
                          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                            Pay directly with any UPI application including PhonePe, Google Pay, Paytm, or BHIM.
                          </p>
                          <div
                            ref={cashfreeContainerRef}
                            className="mx-auto mt-4 min-h-[100px] flex items-center justify-center rounded-xl bg-white p-2"
                          />
                          {cashfreePaymentStarted && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold animate-pulse">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Waiting for payment confirmation from bank…</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error Alert */}
                    {paymentError && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-shake" role="alert">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {/* Primary CTA */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 rounded-xl bg-[#0055FF] hover:bg-[#0045D6] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(0,85,255,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing with bank…</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 fill-white" />
                          <span>Pay {formatCurrency(finalAmount, displayCurrency)}</span>
                        </>
                      )}
                    </button>
                  </form>

                </div>

                {/* Bottom Security Note */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Card data encrypted via Cashfree PCI-DSS Level 1 certified rails</span>
                </div>

              </div>

              {/* ============================================================ */}
              {/* RIGHT COLUMN (5 COLS): ORDER SUMMARY (RECEIPT PANE) */}
              {/* ============================================================ */}
              <div className="lg:col-span-5 bg-[#F8FAFC] border-t lg:border-t-0 lg:border-l border-slate-200/70 p-4 sm:p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-6">
                  
                  {/* Summary Header */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                      Order Summary
                    </span>
                    <div className="text-xs font-semibold text-slate-600">
                      {merchantDisplayName}
                    </div>
                  </div>

                  {/* Product Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {sessionData?.title || 'Order Payment'}
                      </h3>
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0055FF] border border-blue-100 shrink-0">
                        {sessionData?.type || 'DIGITAL'}
                      </span>
                    </div>

                    {sessionData?.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {sessionData.description}
                      </p>
                    )}

                    {sessionData?.credits > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-emerald-700 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Delivers {sessionData.credits.toLocaleString()} API Credits</span>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formatCurrency(basePrice, displayCurrency)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-500">
                      <span>Billing Currency</span>
                      <span className="font-mono font-medium text-slate-700">
                        {currencyMeta.flag} {displayCurrency} ({currencyMeta.name})
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">Total Due</span>
                        <p className="text-[10px] text-slate-400 font-mono">Billed in {displayCurrency}</p>
                      </div>
                      <span className="text-2xl font-extrabold text-[#0055FF] font-sans">
                        {formatCurrency(finalAmount, displayCurrency)}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Environment Trust Badge & Cancel Link */}
                <div className="space-y-3 pt-6 border-t border-slate-200/70">
                  {isSandboxCheckout ? (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                      <strong>Sandbox Mode:</strong> This is a test payment session. No real money or card will be charged.
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed">
                      <strong>Live Secure Mode:</strong> Guaranteed SSL 256-bit encryption with bank clearing.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={goToExit}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium py-1 cursor-pointer"
                  >
                    ← Cancel and {exitLabel}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200/70 py-4 text-center text-xs text-slate-400">
        Powered by QivroPay • Regulated infrastructure via Cashfree{isSandboxCheckout ? ' (Sandbox)' : ' (Live)'}
      </footer>

    </div>
  );
};
