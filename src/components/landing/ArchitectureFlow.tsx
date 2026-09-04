import React, { useState } from 'react';
import {
  Globe2,
  CreditCard,
  Building,
  CheckCircle2,
  Smartphone,
  Coins,
  Layers,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

export const ArchitectureFlow: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<'checkout' | 'billing' | 'ledger' | 'rails' | 'settlement'>('ledger');

  const nodeDetails = {
    checkout: {
      title: 'Customer Checkout',
      badge: 'UPI & Cards',
      desc: 'UPI QR and card checkout hosted by Cashfree, embedded in your branded QivroPay checkout page so the customer never leaves it.',
      metrics: ['UPI QR checkout', 'Visa / Mastercard / RuPay', 'Signed checkout sessions']
    },
    billing: {
      title: 'Products & Payment Links',
      badge: 'Checkout Links',
      desc: 'Create one-time products or credit packs, then generate a shareable payment link for each.',
      metrics: ['One-time products', 'Credit packs', 'Shareable checkout links']
    },
    ledger: {
      title: 'Payments Ledger',
      badge: 'Real-Time',
      desc: 'Payments are recorded in your dashboard as soon as Cashfree confirms them via a signed webhook. Status is never trusted from the browser alone.',
      metrics: ['Signature-verified webhooks', 'Idempotent recording', 'Live status updates']
    },
    rails: {
      title: 'Payment Rails',
      badge: 'India',
      desc: 'Secure server-side order creation with Cashfree checkout and payment-status verification across UPI and cards.',
      metrics: ['UPI QR', 'Visa / Mastercard / RuPay', 'Signed order creation']
    },
    settlement: {
      title: 'Settlement',
      badge: 'Handled by Cashfree',
      desc: 'Settlement is handled by Cashfree. QivroPay does not yet offer merchant-configurable payout routing in this version.',
      metrics: ['Settlement via Cashfree', 'No manual reconciliation', 'Visible in your ledger']
    }
  };

  const topRow: { key: 'checkout' | 'billing' | 'ledger'; step: string; icon: React.ReactNode; accent: string; ring: string; title: string; desc: string }[] = [
    {
      key: 'checkout',
      step: '01 · CHECKOUT',
      icon: <Smartphone className="w-4 h-4" />,
      accent: 'text-[#0071e3] border-[#0071e3]',
      ring: 'ring-[#0071e3]/20',
      title: 'Customer → Payment',
      desc: 'UPI QR and card checkout via Cashfree.'
    },
    {
      key: 'billing',
      step: '02 · PAYMENT / PRODUCTS',
      icon: <Coins className="w-4 h-4" />,
      accent: 'text-purple-600 border-purple-600',
      ring: 'ring-purple-600/20',
      title: 'Products & Payment Links',
      desc: 'One-time products and credit packs, with shareable checkout links.'
    },
    {
      key: 'ledger',
      step: '03 · PAYMENTS LEDGER',
      icon: <Globe2 className="w-4 h-4" />,
      accent: 'text-emerald-600 border-emerald-600',
      ring: 'ring-emerald-600/20',
      title: 'Payments Ledger',
      desc: 'Payments are recorded automatically once Cashfree confirms them.'
    }
  ];

  const bottomRow: { key: 'rails' | 'ledger' | 'settlement'; label: string; sub: string; icon: React.ReactNode; accent: string; ring: string }[] = [
    {
      key: 'rails',
      label: 'PAYMENT RAILS',
      sub: 'UPI · Visa · Mastercard · RuPay',
      icon: <CreditCard className="w-5 h-5" />,
      accent: 'text-[#0071e3] border-[#0071e3]',
      ring: 'ring-[#0071e3]/20'
    },
    {
      key: 'ledger',
      label: 'PAYMENTS LEDGER',
      sub: 'Recorded from Cashfree webhooks',
      icon: <Layers className="w-5 h-5" />,
      accent: 'text-[#0071e3] border-[#0071e3]',
      ring: 'ring-[#0071e3]/20'
    },
    {
      key: 'settlement',
      label: 'SETTLEMENT',
      sub: 'Handled by Cashfree',
      icon: <Building className="w-5 h-5" />,
      accent: 'text-emerald-600 border-emerald-600',
      ring: 'ring-emerald-600/20'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-14 space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#0055FF]">
            How QivroPay Works As Your Payment Infrastructure
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A0D14] tracking-tight">
            The Complete End-to-End Flow.
          </h2>
          <p className="text-base sm:text-lg text-[#6E717D] max-w-2xl mx-auto">
            From customer checkout to your payments ledger, powered by Cashfree.
          </p>
        </div>

        {/* Row 1: Customer-facing flow */}
        <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0">
          {topRow.map((node, idx) => (
            <React.Fragment key={node.key}>
              <button
                type="button"
                onClick={() => setSelectedNode(node.key)}
                className={`flex-1 text-left p-5 sm:p-6 rounded-2xl border bg-white transition-all space-y-3 ${
                  selectedNode === node.key
                    ? `shadow-md ring-2 ${node.ring} ${node.accent.split(' ')[1]}`
                    : 'border-black/10 hover:border-black/20'
                }`}
              >
                <div className={`flex items-center justify-between ${node.accent.split(' ')[0]}`}>
                  <span className="text-[11px] font-mono uppercase font-bold">
                    {node.step}
                  </span>
                  {node.icon}
                </div>
                <div className="font-bold text-[#1d1d1f] text-sm sm:text-base">
                  {node.title}
                </div>
                <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  {node.desc}
                </p>
              </button>

              {idx < topRow.length - 1 && (
                <div className="flex items-center justify-center py-1 lg:py-0 lg:px-3 shrink-0">
                  <ArrowDown className="w-5 h-5 text-black/20 lg:hidden" />
                  <ArrowRight className="w-6 h-6 text-black/20 hidden lg:block" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Connector between rows */}
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#8C90A0]">
            <span className="w-8 h-px bg-black/15" />
            settles into
            <span className="w-8 h-px bg-black/15" />
          </div>
        </div>

        {/* Row 2: Downstream flow */}
        <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0">
          {bottomRow.map((node, idx) => (
            <React.Fragment key={`${node.key}-${idx}`}>
              <button
                type="button"
                onClick={() => setSelectedNode(node.key)}
                className={`flex-1 text-left p-4 sm:p-5 rounded-2xl border bg-white transition-all flex items-center gap-3 ${
                  selectedNode === node.key
                    ? `shadow-md ring-2 ${node.ring} ${node.accent.split(' ')[1]}`
                    : 'border-black/10 hover:border-black/20'
                }`}
              >
                <div className={`p-2.5 rounded-xl bg-black/[0.03] border border-black/5 ${node.accent.split(' ')[0]}`}>
                  {node.icon}
                </div>
                <div>
                  <div className="font-bold text-[#1d1d1f] text-xs uppercase tracking-wider">
                    {node.label}
                  </div>
                  <div className="text-[11px] text-[#86868b] font-mono">
                    {node.sub}
                  </div>
                </div>
              </button>

              {idx < bottomRow.length - 1 && (
                <div className="flex items-center justify-center py-1 lg:py-0 lg:px-3 shrink-0">
                  <ArrowDown className="w-5 h-5 text-black/20 lg:hidden" />
                  <ArrowRight className="w-6 h-6 text-black/20 hidden lg:block" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Interactive detail panel */}
        <div className="mt-10 max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#FAFAFC] border border-black/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
              <h4 className="font-bold text-[#1d1d1f] text-base font-sans">
                {nodeDetails[selectedNode].title}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] text-xs font-mono font-bold border border-blue-100">
              {nodeDetails[selectedNode].badge}
            </span>
          </div>

          <p className="text-sm text-[#6e6e73] leading-relaxed">
            {nodeDetails[selectedNode].desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {nodeDetails[selectedNode].metrics.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-black/5 text-xs text-[#1d1d1f] font-semibold flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
