import React from 'react';
import {
  Coins,
  Globe,
  BarChart3,
  Sparkles,
  CircleDollarSign,
  Repeat2,
  Gauge,
  Smartphone,
  CreditCard,
  WalletCards,
  Landmark,
  TrendingUp,
  Activity,
  Boxes,
  Users
} from 'lucide-react';

interface FeatureCardItem {
  title: string;
  copy: string;
  icon: React.ElementType;
  tone: string;
  detail: [string, React.ElementType][];
  accent: string;
}

const FEATURE_CARDS: FeatureCardItem[] = [
  {
    title: 'Credits, Usage & Subscriptions',
    copy: 'Credit-based billing, usage metering, subscriptions with addons, and one-time payments, all built in.',
    icon: Coins,
    tone: 'from-emerald-50 to-white',
    detail: [
      ['Single payment', CircleDollarSign],
      ['Subscription', Repeat2],
      ['Usage based billing', Gauge]
    ],
    accent: 'text-emerald-600'
  },
  {
    title: 'Global Merchant of Record',
    copy: 'Collect payments from 190+ countries with 80+ currencies and popular payment methods.',
    icon: Globe,
    tone: 'from-blue-50 to-white',
    detail: [
      ['UPI', Smartphone],
      ['Cards', CreditCard],
      ['Wallets', WalletCards],
      ['Net banking', Landmark]
    ],
    accent: 'text-blue-600'
  },
  {
    title: 'Faster Monetisation',
    copy: 'Start collecting revenue in minutes, not weeks.',
    icon: BarChart3,
    tone: 'from-violet-50 to-white',
    detail: [
      ['New MRR  ₹600', TrendingUp],
      ['Expansion MRR  ₹200', BarChart3],
      ['↑ 88% vs last month', Activity]
    ],
    accent: 'text-violet-600'
  },
  {
    title: 'Built for AI & SaaS',
    copy: 'Issue credits, meter tokens, track API calls, and bill overages. Designed for how AI companies monetize.',
    icon: Sparkles,
    tone: 'from-amber-50 to-white',
    detail: [
      ['CREDITS', Coins],
      ['TOKENS', Boxes],
      ['SEATS', Users],
      ['USAGE', Gauge]
    ],
    accent: 'text-amber-600'
  }
];

export const FeatureCards: React.FC = () => {
  return (
    <section className="bg-[#f7f6f2] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#7054E8]">
            More ways to grow
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-[#151a4a] sm:text-6xl">
            Everything your payment business needs.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURE_CARDS.map(({ title, copy, icon: Icon, tone, detail, accent }) => (
            <article
              key={title}
              className={`rounded-[2rem] border border-black/[0.06] bg-gradient-to-br ${tone} p-7 shadow-[0_20px_60px_-45px_rgba(21,26,74,.35)] sm:p-10`}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#151a4a]">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-[#59617f]">
                    {copy}
                  </p>
                </div>
                <div className={`rounded-2xl bg-white p-3 shadow-sm ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 grid gap-2 sm:grid-cols-3">
                {detail.map(([label, DetailIcon]) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white/80 px-4 py-3 text-xs font-semibold text-[#39415f]"
                  >
                    <DetailIcon className={`h-4 w-4 shrink-0 ${accent}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
