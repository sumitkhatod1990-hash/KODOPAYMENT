import React, { useMemo } from 'react';
import { BarChart3, Globe2, Receipt, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useGlobalCurrency } from '../../context/GlobalCurrencyContext';

export const AnalyticsTab: React.FC = () => {
  const { transactions, customers } = useApp();
  const { format } = useGlobalCurrency();
  const stats = useMemo(() => {
    const succeeded = transactions.filter(t => t.status === 'succeeded');
    const gross = succeeded.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const refunds = transactions.filter(t => t.status === 'refunded' || t.status === 'partially_refunded')
      .reduce((sum, t) => sum + Number(t.refundedAmount || 0), 0);
    const countries = new Set(succeeded.map(t => t.country).filter(Boolean));
    const avg = succeeded.length ? gross / succeeded.length : 0;
    return { gross, refunds, avg, countries: countries.size, customers: customers.length, success: transactions.length ? (succeeded.length / transactions.length) * 100 : 0 };
  }, [transactions, customers]);

  const cards = [
    ['Gross volume', format(stats.gross), TrendingUp],
    ['Refunds', format(stats.refunds), Receipt],
    ['New customers', String(stats.customers), Users],
    ['Average order value', format(stats.avg), BarChart3],
    ['Payment success rate', `${stats.success.toFixed(1)}%`, TrendingUp],
    ['Revenue countries', String(stats.countries), Globe2],
  ] as const;
  return <div className="space-y-7 animate-fade-in">
    <div><h2 className="text-2xl font-extrabold">Analytics</h2><p className="text-sm text-slate-500 mt-1">Payment performance from your QivroPay activity.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map(([label, value, Icon]) => <div key={label} className="p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-black/10 dark:border-white/10 shadow-sm"><div className="flex justify-between text-xs text-slate-500"><span>{label}</span><Icon className="w-4 h-4 text-blue-600" /></div><div className="mt-3 text-3xl font-extrabold">{value}</div></div>)}
    </div>
    <div className="p-7 rounded-3xl bg-white dark:bg-[#0c0f17] border border-black/10 dark:border-white/10 shadow-sm"><h3 className="font-bold">Revenue by country</h3><p className="text-sm text-slate-500 mt-1">Countries are derived from successful payments.</p><div className="mt-5 space-y-3">{Array.from(new Set(transactions.filter(t => t.status === 'succeeded').map(t => t.country).filter(Boolean))).map(country => <div key={country} className="flex justify-between text-sm"><span>{country}</span><span className="font-semibold">{format(transactions.filter(t => t.status === 'succeeded' && t.country === country).reduce((s, t) => s + Number(t.amount || 0), 0))}</span></div>)}{stats.countries === 0 && <p className="text-sm text-slate-500">No payment data yet.</p>}</div></div>
  </div>;
};
