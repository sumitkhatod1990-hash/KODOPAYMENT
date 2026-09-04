import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Package,
  Link2,
  Landmark,
  Users,
  Code2,
  Settings,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Copy,
  Eye,
  EyeOff,
  X,
  TrendingUp,
} from 'lucide-react';
import { PaymentMarquee } from './PaymentMarquee';

// ---------------------------------------------------------------------------
// Marketing-only demo dashboard. Everything below is fabricated preview data
// (names, amounts, references) — deliberately isolated from AppContext's real
// merchant data so this component never touches authenticated state and can
// render identically for every visitor, logged in or not. Do not wire this
// up to live data.
// ---------------------------------------------------------------------------

type PreviewTab =
  | 'overview'
  | 'verification'
  | 'payments'
  | 'products'
  | 'payment-links'
  | 'settlements'
  | 'customers'
  | 'developer'
  | 'settings';

const NAV: Array<{ id: PreviewTab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'verification', label: 'Set Up Payments', icon: ShieldCheck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'payment-links', label: 'Payment Links', icon: Link2 },
  { id: 'settlements', label: 'Settlements', icon: Landmark },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'developer', label: 'Developers', icon: Code2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

type DemoStatus = 'Succeeded' | 'Pending' | 'Failed' | 'Refunded';

interface DemoTxn {
  ref: string;
  customerName: string;
  customerEmail: string;
  product: string;
  amount: string;
  method: string;
  status: DemoStatus;
  date: string;
}

const DEMO_TRANSACTIONS: DemoTxn[] = [
  { ref: 'pay_qp_7f3a91', customerName: 'Ananya Sharma', customerEmail: 'ananya.sharma@example.com', product: 'Pro Plan · Monthly', amount: '₹2,499.00', method: 'UPI', status: 'Succeeded', date: '3 Sep 2026 · 4:12 PM' },
  { ref: 'pay_qp_5c18e4', customerName: 'Rohan Verma', customerEmail: 'rohan.verma@example.com', product: 'Website Design Package', amount: '₹18,000.00', method: 'Card · Visa', status: 'Succeeded', date: '3 Sep 2026 · 11:47 AM' },
  { ref: 'pay_qp_9d22b7', customerName: 'Priya Iyer', customerEmail: 'priya.iyer@example.com', product: '1:1 Consulting Session', amount: '₹4,500.00', method: 'UPI', status: 'Pending', date: '2 Sep 2026 · 6:03 PM' },
  { ref: 'pay_qp_3a67f0', customerName: 'Vikram Nair', customerEmail: 'vikram.nair@example.com', product: 'E-book Bundle', amount: '₹799.00', method: 'Card · RuPay', status: 'Failed', date: '2 Sep 2026 · 2:15 PM' },
  { ref: 'pay_qp_8e41c2', customerName: 'Kavya Reddy', customerEmail: 'kavya.reddy@example.com', product: 'Pro Plan · Monthly', amount: '₹2,499.00', method: 'UPI', status: 'Refunded', date: '1 Sep 2026 · 9:28 AM' },
  { ref: 'pay_qp_1b95d6', customerName: 'Arjun Menon', customerEmail: 'arjun.menon@example.com', product: 'Brand Strategy Package', amount: '₹32,000.00', method: 'Card · Mastercard', status: 'Succeeded', date: '31 Aug 2026 · 8:02 AM' },
  { ref: 'pay_qp_6f04a8', customerName: 'Neha Kapoor', customerEmail: 'neha.kapoor@example.com', product: 'Website Design Package', amount: '₹18,000.00', method: 'UPI', status: 'Succeeded', date: '30 Aug 2026 · 5:44 PM' },
];

const DEMO_LINKS = [
  { id: 'wd', title: 'Website Design Package', amount: '₹18,000.00', slug: 'qivropay.com/pay/wd-package-x4k9', payments: 12 },
  { id: 'pro', title: 'Pro Plan · Monthly', amount: '₹2,499.00', slug: 'qivropay.com/pay/pro-monthly-7h2p', payments: 64 },
  { id: 'consult', title: '1:1 Consulting Session', amount: '₹4,500.00', slug: 'qivropay.com/pay/consult-q1z8', payments: 9 },
  { id: 'ebook', title: 'E-book Bundle', amount: '₹799.00', slug: 'qivropay.com/pay/ebook-bundle-m3v6', payments: 31 },
];

const DEMO_CUSTOMERS = [
  { name: 'Ananya Sharma', email: 'ananya.sharma@example.com', total: '₹12,450.00', orders: 5, status: 'Active' },
  { name: 'Arjun Menon', email: 'arjun.menon@example.com', total: '₹32,000.00', orders: 1, status: 'Active' },
  { name: 'Rohan Verma', email: 'rohan.verma@example.com', total: '₹18,000.00', orders: 1, status: 'Active' },
  { name: 'Neha Kapoor', email: 'neha.kapoor@example.com', total: '₹18,000.00', orders: 1, status: 'Active' },
  { name: 'Priya Iyer', email: 'priya.iyer@example.com', total: '₹4,500.00', orders: 1, status: 'Active' },
  { name: 'Kavya Reddy', email: 'kavya.reddy@example.com', total: '₹2,499.00', orders: 1, status: 'Refunded' },
];

const DEMO_PRODUCTS = [
  { name: 'Pro Plan · Monthly', type: 'Subscription', price: '₹2,499.00' },
  { name: 'Website Design Package', type: 'One-time', price: '₹18,000.00' },
  { name: '1:1 Consulting Session', type: 'One-time', price: '₹4,500.00' },
  { name: 'E-book Bundle', type: 'Digital download', price: '₹799.00' },
];

const DEMO_SETTLEMENTS = [
  { date: '5 Sep 2026', amount: '₹1,42,880.00', status: 'Expected' },
  { date: '27 Aug 2026', amount: '₹96,420.00', status: 'Settled' },
  { date: '20 Aug 2026', amount: '₹88,150.00', status: 'Settled' },
];

const ACTIVITY = [
  { day: 'Mon', value: 46 },
  { day: 'Tue', value: 68 },
  { day: 'Wed', value: 39 },
  { day: 'Thu', value: 82 },
  { day: 'Fri', value: 58 },
  { day: 'Sat', value: 71 },
  { day: 'Sun', value: 64 },
];

const STATUS_STYLES: Record<DemoStatus, { badge: string; icon: React.ElementType }> = {
  Succeeded: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  Pending: { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  Failed: { badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  Refunded: { badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: RotateCcw },
};

const StatusBadge: React.FC<{ status: DemoStatus }> = ({ status }) => {
  const s = STATUS_STYLES[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${s.badge}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const PreviewCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-5 sm:p-6 rounded-2xl bg-white border border-black/10 shadow-sm ${className}`}>{children}</div>
);

// ---------------------------------------------------------------------------
// Auto-playing demo cursor: drives the exact same tab/selection state as a
// real visitor would, via the `run` callbacks below — no separate fake
// animation state. It permanently stops the moment a visitor interacts with
// the preview themselves (see `userPaused`), and never starts at all when
// prefers-reduced-motion is set.
// ---------------------------------------------------------------------------
interface DemoStep {
  selector: string;
  run: () => void;
  hold: number;
}

export const ProductPreview: React.FC = () => {
  const [tab, setTab] = useState<PreviewTab>('overview');
  const [selectedTxn, setSelectedTxn] = useState<DemoTxn | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false, clicking: false });

  const frameRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = userPaused;
    if (userPaused) setCursor(c => ({ ...c, visible: false, clicking: false }));
  }, [userPaused]);

  useEffect(() => {
    if (!selectedTxn) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserPaused(true);
        setSelectedTxn(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedTxn]);

  // Auto-demo engine: Overview -> Payments -> open a transaction -> close ->
  // Payment Links -> Customers -> Settlements -> back to Overview -> repeat.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const steps: DemoStep[] = [
      { selector: '[data-demo="nav-payments"]', run: () => setTab('payments'), hold: 1400 },
      { selector: '[data-demo="txn-row-0"]', run: () => setSelectedTxn(DEMO_TRANSACTIONS[0]), hold: 2200 },
      { selector: '[data-demo="modal-close"]', run: () => setSelectedTxn(null), hold: 900 },
      { selector: '[data-demo="nav-payment-links"]', run: () => setTab('payment-links'), hold: 1700 },
      { selector: '[data-demo="nav-customers"]', run: () => setTab('customers'), hold: 1700 },
      { selector: '[data-demo="nav-settlements"]', run: () => setTab('settlements'), hold: 1700 },
      { selector: '[data-demo="nav-overview"]', run: () => setTab('overview'), hold: 2400 },
    ];

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
    };

    const findVisibleTarget = (selector: string): HTMLElement | null => {
      const frame = frameRef.current;
      if (!frame) return null;
      const matches = Array.from(frame.querySelectorAll<HTMLElement>(selector));
      return matches.find(el => el.offsetParent !== null) ?? null;
    };

    const moveCursorTo = (el: HTMLElement) => {
      const frame = frameRef.current;
      if (!frame) return;
      const frameRect = frame.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const x = elRect.left - frameRect.left + elRect.width * 0.3;
      const y = elRect.top - frameRect.top + elRect.height * 0.5;
      setCursor({ x, y, visible: true, clicking: false });
    };

    const runStep = (i: number) => {
      if (cancelled || pausedRef.current) return;
      const step = steps[i % steps.length];
      const target = findVisibleTarget(step.selector);

      if (!target) {
        later(() => {
          if (cancelled || pausedRef.current) return;
          step.run();
          runStep(i + 1);
        }, 400);
        return;
      }

      moveCursorTo(target);
      later(() => {
        if (cancelled || pausedRef.current) return;
        setCursor(c => ({ ...c, clicking: true }));
        later(() => {
          if (cancelled || pausedRef.current) return;
          setCursor(c => ({ ...c, clicking: false }));
          step.run();
          later(() => runStep(i + 1), step.hold);
        }, 220);
      }, 700);
    };

    later(() => runStep(0), 1200);

    return () => {
      cancelled = true;
      timers.forEach(id => window.clearTimeout(id));
    };
    // Intentionally runs once: the demo drives state itself and permanently
    // stops via pausedRef the moment a visitor interacts manually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = (id: string, slug: string) => {
    setUserPaused(true);
    navigator.clipboard?.writeText(`https://${slug}`).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 1800);
  };

  const copyKey = () => {
    setUserPaused(true);
    navigator.clipboard?.writeText('qivro_test_4d9f1c3a8b2e5f60').catch(() => {});
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 1800);
  };

  const selectTab = (id: PreviewTab) => {
    setUserPaused(true);
    setTab(id);
  };

  const selectTxn = (txn: DemoTxn) => {
    setUserPaused(true);
    setSelectedTxn(txn);
  };

  const closeTxn = () => {
    setUserPaused(true);
    setSelectedTxn(null);
  };

  const TxnRow: React.FC<{ txn: DemoTxn; compact?: boolean; demoId?: string }> = ({ txn, compact, demoId }) => (
    <tr
      data-demo={demoId}
      onClick={() => selectTxn(txn)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTxn(txn); } }}
      tabIndex={0}
      role="button"
      aria-label={`View transaction ${txn.ref} details`}
      className="cursor-pointer hover:bg-[#f5f5f7] focus:bg-[#f5f5f7] outline-none transition-colors"
    >
      <td className="py-3 pr-3 font-mono font-semibold text-[#1d1d1f] whitespace-nowrap">{txn.ref}</td>
      <td className="py-3 pr-3">
        <div className="font-semibold text-[#1d1d1f] whitespace-nowrap">{txn.customerName}</div>
        {!compact && <div className="text-[11px] text-[#86868b] font-mono">{txn.customerEmail}</div>}
      </td>
      {!compact && <td className="py-3 pr-3 text-[#1d1d1f] whitespace-nowrap">{txn.product}</td>}
      <td className="py-3 pr-3 font-bold font-mono text-[#1d1d1f] whitespace-nowrap">{txn.amount}</td>
      <td className="py-3 pr-3"><StatusBadge status={txn.status} /></td>
      <td className="py-3 text-[#86868b] font-mono whitespace-nowrap">{txn.date}</td>
    </tr>
  );

  return (
    <section id="product" className="relative pt-2 pb-16 md:pb-24 bg-[#FAFAFC] overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto motion-safe:animate-fade-in">
          <div ref={frameRef} className="relative rounded-[28px] sm:rounded-[32px] border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex h-[680px] sm:h-[620px] lg:h-[660px]">

              {/* Sidebar */}
              <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#fafafc] border-r border-black/10">
                <div className="p-5 border-b border-black/5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0055FF] to-[#7B2CBF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    Q
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#0A0D14] text-sm truncate">QivroPay</div>
                    <div className="text-[10px] text-[#8C90A0] font-mono truncate">Demo Workspace</div>
                  </div>
                </div>
                <nav className="px-3 py-3 space-y-1 flex-1 overflow-y-auto">
                  {NAV.map(item => {
                    const Icon = item.icon;
                    const selected = item.id === tab;
                    return (
                      <button
                        key={item.id}
                        data-demo={`nav-${item.id}`}
                        onClick={() => selectTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                          selected ? 'bg-[#111827] text-white' : 'text-slate-600 hover:bg-black/[0.04]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Main column */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <header className="h-14 sm:h-16 shrink-0 border-b border-black/10 px-4 sm:px-6 flex items-center justify-between gap-3 bg-white">
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-bold text-[#0A0D14] truncate">
                      {NAV.find(n => n.id === tab)?.label}
                    </div>
                    <div className="hidden sm:block text-[11px] text-[#86868b]">Preview Merchant Pvt Ltd</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-[#0055FF] text-[10px] font-mono font-bold border border-blue-100">
                      TEST MODE
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center text-[11px] font-bold">
                      PM
                    </div>
                  </div>
                </header>

                {/* Mobile tab strip */}
                <div className="md:hidden flex gap-1.5 overflow-x-auto px-3 py-2.5 border-b border-black/10 bg-[#fafafc]">
                  {NAV.map(item => {
                    const selected = item.id === tab;
                    return (
                      <button
                        key={item.id}
                        data-demo={`nav-${item.id}`}
                        onClick={() => selectTab(item.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                          selected ? 'bg-[#111827] text-white' : 'bg-white text-slate-600 border border-black/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#fafafc]">
                  <div key={tab} className="motion-safe:animate-fade-in">

                    {tab === 'overview' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <PreviewCard className="space-y-1.5">
                            <div className="text-xs text-[#86868b] font-medium">Gross Volume</div>
                            <div className="text-2xl font-extrabold text-[#1d1d1f]">₹1,84,650</div>
                          </PreviewCard>
                          <PreviewCard className="space-y-1.5">
                            <div className="text-xs text-[#86868b] font-medium">Net Payouts</div>
                            <div className="text-2xl font-extrabold text-[#1d1d1f]">₹1,79,115</div>
                          </PreviewCard>
                          <PreviewCard className="space-y-1.5">
                            <div className="text-xs text-[#86868b] font-medium">Total Customers</div>
                            <div className="text-2xl font-extrabold text-[#1d1d1f]">214</div>
                          </PreviewCard>
                        </div>

                        <PreviewCard>
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold text-[#1d1d1f] flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              Payment activity
                            </div>
                            <span className="text-[10px] text-[#86868b] font-mono">LAST 7 DAYS</span>
                          </div>
                          <div className="flex items-end justify-between gap-2 h-24">
                            {ACTIVITY.map((d, i) => (
                              <div key={d.day} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5" title={`${d.day}: ₹${d.value * 350}`}>
                                <div
                                  className={`w-full rounded-md ${i === ACTIVITY.length - 1 ? 'bg-[#0055FF]' : 'bg-blue-100'}`}
                                  style={{ height: `${d.value}%` }}
                                />
                                <span className="text-[9px] font-mono text-[#8C90A0]">{d.day}</span>
                              </div>
                            ))}
                          </div>
                        </PreviewCard>

                        <PreviewCard className="!p-0 overflow-hidden">
                          <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between">
                            <div className="text-xs font-bold text-[#1d1d1f]">Recent transactions</div>
                            <button onClick={() => selectTab('payments')} className="text-[11px] font-bold text-[#0055FF] hover:underline">
                              View all
                            </button>
                          </div>
                          <div className="overflow-x-auto px-5 sm:px-6 pb-5">
                            <table className="w-full text-left border-collapse text-xs min-w-[420px]">
                              <tbody className="divide-y divide-black/5">
                                {DEMO_TRANSACTIONS.slice(0, 4).map(txn => <TxnRow key={txn.ref} txn={txn} compact />)}
                              </tbody>
                            </table>
                          </div>
                        </PreviewCard>
                      </div>
                    )}

                    {tab === 'payments' && (
                      <PreviewCard className="!p-0 overflow-hidden">
                        <div className="px-5 sm:px-6 pt-5 pb-3">
                          <div className="text-xs font-bold text-[#1d1d1f]">All transactions</div>
                          <div className="text-[11px] text-[#86868b]">Click a row to see full details</div>
                        </div>
                        <div className="overflow-x-auto px-5 sm:px-6 pb-3">
                          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
                            <thead>
                              <tr className="border-b border-black/10 text-[#86868b] font-mono uppercase text-[10px]">
                                <th className="pb-2.5 font-semibold pr-3">Reference</th>
                                <th className="pb-2.5 font-semibold pr-3">Customer</th>
                                <th className="pb-2.5 font-semibold pr-3">Product</th>
                                <th className="pb-2.5 font-semibold pr-3">Amount</th>
                                <th className="pb-2.5 font-semibold pr-3">Status</th>
                                <th className="pb-2.5 font-semibold">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                              {DEMO_TRANSACTIONS.map((txn, i) => (
                                <TxnRow key={txn.ref} txn={txn} demoId={i === 0 ? 'txn-row-0' : undefined} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-5 sm:px-6 pb-5 pt-1 text-[11px] text-[#86868b]">
                          Showing 7 of 412 transactions in this preview.
                        </div>
                      </PreviewCard>
                    )}

                    {tab === 'payment-links' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {DEMO_LINKS.map(link => (
                            <PreviewCard key={link.id} className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-[#1d1d1f] text-sm">{link.title}</div>
                                <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Active</span>
                              </div>
                              <div className="text-xl font-extrabold font-mono text-[#1d1d1f]">{link.amount}</div>
                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5">
                                <span className="font-mono text-[11px] text-[#6E717D] truncate">{link.slug}</span>
                                <button
                                  onClick={() => copyLink(link.id, link.slug)}
                                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[10px] font-bold transition-colors"
                                >
                                  {copiedId === link.id ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  {copiedId === link.id ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <div className="text-[11px] text-[#86868b]">{link.payments} payments collected</div>
                            </PreviewCard>
                          ))}
                        </div>
                      </div>
                    )}

                    {tab === 'customers' && (
                      <PreviewCard className="!p-0 overflow-hidden">
                        <div className="px-5 sm:px-6 pt-5 pb-3 text-xs font-bold text-[#1d1d1f]">Customers</div>
                        <div className="overflow-x-auto px-5 sm:px-6 pb-3">
                          <table className="w-full text-left border-collapse text-xs min-w-[420px]">
                            <thead>
                              <tr className="border-b border-black/10 text-[#86868b] font-mono uppercase text-[10px]">
                                <th className="pb-2.5 font-semibold pr-3">Customer</th>
                                <th className="pb-2.5 font-semibold pr-3">Total paid</th>
                                <th className="pb-2.5 font-semibold pr-3">Orders</th>
                                <th className="pb-2.5 font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                              {DEMO_CUSTOMERS.map(c => (
                                <tr key={c.email}>
                                  <td className="py-3 pr-3">
                                    <div className="font-semibold text-[#1d1d1f] whitespace-nowrap">{c.name}</div>
                                    <div className="text-[11px] text-[#86868b] font-mono">{c.email}</div>
                                  </td>
                                  <td className="py-3 pr-3 font-bold font-mono text-[#1d1d1f] whitespace-nowrap">{c.total}</td>
                                  <td className="py-3 pr-3 text-[#1d1d1f]">{c.orders}</td>
                                  <td className="py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                      {c.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-5 sm:px-6 pb-5 pt-1 text-[11px] text-[#86868b]">
                          Showing 6 of 214 customers in this preview.
                        </div>
                      </PreviewCard>
                    )}

                    {tab === 'verification' && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="text-xs font-bold text-emerald-800">Payment setup complete, ready to accept live payments</div>
                        </div>
                        <PreviewCard className="space-y-3">
                          {['Business profile', 'Bank account verified', 'KYC documents verified', 'Cashfree merchant activated'].map(step => (
                            <div key={step} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                              <span className="text-xs font-semibold text-[#1d1d1f]">{step}</span>
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                              </span>
                            </div>
                          ))}
                        </PreviewCard>
                      </div>
                    )}

                    {tab === 'products' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {DEMO_PRODUCTS.map(p => (
                          <PreviewCard key={p.name} className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-[#1d1d1f] text-sm">{p.name}</div>
                              <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#f4f5f8] text-[#6E717D] text-[10px] font-bold border border-black/5">{p.type}</span>
                            </div>
                            <div className="text-lg font-extrabold font-mono text-[#1d1d1f]">{p.price}</div>
                          </PreviewCard>
                        ))}
                      </div>
                    )}

                    {tab === 'settlements' && (
                      <div className="space-y-4">
                        <PreviewCard className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <Landmark className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs text-[#86868b] font-medium">Next settlement</div>
                              <div className="text-xl font-extrabold text-[#1d1d1f] font-mono">₹1,42,880.00</div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">Expected 5 Sep 2026</span>
                        </PreviewCard>
                        <PreviewCard className="!p-0 overflow-hidden">
                          <div className="px-5 sm:px-6 pt-5 pb-3 text-xs font-bold text-[#1d1d1f]">Settlement history</div>
                          <div className="overflow-x-auto px-5 sm:px-6 pb-5">
                            <table className="w-full text-left border-collapse text-xs min-w-[360px]">
                              <tbody className="divide-y divide-black/5">
                                {DEMO_SETTLEMENTS.map(s => (
                                  <tr key={s.date}>
                                    <td className="py-3 pr-3 text-[#1d1d1f] font-mono whitespace-nowrap">{s.date}</td>
                                    <td className="py-3 pr-3 font-bold font-mono text-[#1d1d1f] whitespace-nowrap">{s.amount}</td>
                                    <td className="py-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.status === 'Settled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {s.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </PreviewCard>
                      </div>
                    )}

                    {tab === 'developer' && (
                      <div className="space-y-4">
                        <PreviewCard className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-[#1d1d1f]">Test secret key</div>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0055FF] text-[10px] font-bold border border-blue-100">Sandbox mode</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#f5f5f7] border border-black/5">
                            <span className="font-mono text-xs text-[#1d1d1f] truncate">
                              {keyRevealed ? 'qivro_test_4d9f1c3a8b2e5f60' : 'qivro_test_••••••••••••5f60'}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => { setUserPaused(true); setKeyRevealed(v => !v); }} aria-label={keyRevealed ? 'Hide key' : 'Reveal key'} className="p-1.5 rounded-lg hover:bg-black/5 text-[#6E717D]">
                                {keyRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={copyKey} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-[10px] font-bold text-[#1d1d1f]">
                                {keyCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                {keyCopied ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        </PreviewCard>
                        <div className="p-4 rounded-2xl bg-[#0A0D14] text-white font-mono text-[11px] space-y-2 overflow-x-auto">
                          <div className="text-neutral-400 text-[10px]">CREATE A CHECKOUT SESSION</div>
                          <pre className="text-emerald-300">{`POST /api/v1/payments/create-session
Authorization: Bearer qivro_test_...

{ "productId": "prod_web_design", "currency": "INR" }`}</pre>
                        </div>
                      </div>
                    )}

                    {tab === 'settings' && (
                      <PreviewCard className="space-y-3">
                        <div className="text-xs font-bold text-[#1d1d1f] mb-1">Business profile</div>
                        {[
                          ['Business name', 'Studio Nine Design Co.'],
                          ['Support email', 'support@studionine.example'],
                          ['Currency', 'INR · Indian Rupee'],
                          ['Payout account', '•••• 4821 (HDFC Bank)'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0 gap-3">
                            <span className="text-xs text-[#86868b]">{label}</span>
                            <span className="text-xs font-semibold text-[#1d1d1f] font-mono text-right truncate">{value}</span>
                          </div>
                        ))}
                      </PreviewCard>
                    )}

                  </div>
                </main>
              </div>
            </div>
          </div>

          {/* Transaction detail overlay */}
          {selectedTxn && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm motion-safe:animate-fade-in rounded-[28px] sm:rounded-[32px]"
              onClick={closeTxn}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Transaction details"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl bg-white border border-black/10 shadow-2xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-[#8C90A0]">TRANSACTION</div>
                    <div className="font-mono font-bold text-[#0A0D14] text-sm">{selectedTxn.ref}</div>
                  </div>
                  <button data-demo="modal-close" onClick={closeTxn} aria-label="Close" className="p-1.5 rounded-lg hover:bg-black/5 text-[#86868b]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-3xl font-extrabold font-mono text-[#0A0D14]">{selectedTxn.amount}</div>
                <StatusBadge status={selectedTxn.status} />

                <div className="pt-3 border-t border-black/5 space-y-2.5 text-xs">
                  <div className="flex justify-between"><span className="text-[#86868b]">Customer</span><span className="font-semibold text-[#1d1d1f]">{selectedTxn.customerName}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Email</span><span className="font-mono text-[#1d1d1f]">{selectedTxn.customerEmail}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Product</span><span className="font-semibold text-[#1d1d1f]">{selectedTxn.product}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Payment method</span><span className="font-semibold text-[#1d1d1f]">{selectedTxn.method}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Date</span><span className="font-mono text-[#1d1d1f]">{selectedTxn.date}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-demo cursor */}
          {cursor.visible && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-30 transition-transform duration-700 ease-out"
              style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] -translate-x-0.5 -translate-y-0.5">
                <path d="M2 1.5 L2 17.5 L6.2 13.8 L9.2 19.5 L12 18 L9 12.3 L15 12.3 Z" fill="#0A0D14" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              {cursor.clicking && (
                <span className="absolute left-[3px] top-[3px] w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0055FF]/50 animate-ping" />
              )}
            </div>
          )}
        </div>
      </div>

      <PaymentMarquee />
    </section>
  );
};
