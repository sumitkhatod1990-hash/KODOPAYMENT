import React, { useEffect, useState } from 'react';
import { formatINR, navigateAdmin } from '../../utils/adminDomain';
import {
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  LifeBuoy,
  FileCheck,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface OverviewStats {
  totalMerchants: number;
  activeMerchants: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalPaymentVolume: number;
  pendingKyc: number;
  openSupportTickets: number;
  activeChatSessions: number;
  recentSignups: Array<{
    id: string;
    email: string;
    company: string;
    createdAt: string;
    onboardingStatus: string;
    kycStatus: string;
  }>;
  recentTransactions: Array<{
    id: string;
    merchantId?: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail?: string;
    createdAt: string;
  }>;
  recentSupportActivity: Array<{
    id: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    email: string;
    createdAt: string;
  }>;
}

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/overview/stats', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse overview metrics.');
      }
    } catch (err: any) {
      console.error('Failed to load admin overview:', err);
      setError('Unable to load overview statistics from operations database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusPill = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'succeeded' || s === 'completed' || s === 'approved' || s === 'resolved') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (s === 'pending' || s === 'submitted' || s === 'in_progress') {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (s === 'failed' || s === 'rejected' || s === 'suspended') {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (s === 'refunded' || s === 'partially_refunded') {
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    }
    return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
  };

  const getPriorityPill = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'urgent') return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
    if (p === 'high') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (p === 'normal') return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-24 bg-slate-800 rounded animate-pulse" />
        </div>

        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse space-y-3">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-7 w-32 bg-slate-700 rounded" />
            </div>
          ))}
        </div>

        {/* Skeleton Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse h-64" />
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/40">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Failed to Load Overview</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Clients',
      value: stats?.totalMerchants ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Active Clients',
      value: stats?.activeMerchants ?? 0,
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Transactions',
      value: stats?.totalTransactions ?? 0,
      icon: CreditCard,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Payment Volume',
      value: formatINR(stats?.totalPaymentVolume ?? 0),
      icon: TrendingUp,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Open Tickets',
      value: stats?.openSupportTickets ?? 0,
      icon: LifeBuoy,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Pending KYC',
      value: stats?.pendingKyc ?? 0,
      icon: FileCheck,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20'
    },
    {
      title: 'Successful Payments',
      value: stats?.successfulTransactions ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Refunded Payments',
      value: stats?.refundedTransactions ?? 0,
      icon: RotateCcw,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Platform Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated metrics derived live from the platform database.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl border ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-white font-sans">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Recent Signups
            </h3>
            <button
              onClick={() => navigateAdmin('/clients')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-80">
            {(!stats?.recentSignups || stats.recentSignups.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent signups recorded.
              </div>
            ) : (
              stats.recentSignups.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigateAdmin(`/clients/${s.id}`)}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/60 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[150px]">
                      {s.company || 'Unnamed Company'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusPill(s.onboardingStatus)}`}>
                      {s.onboardingStatus || 'PENDING'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-mono">
                    {s.email}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              Recent Transactions
            </h3>
            <button
              onClick={() => navigateAdmin('/payments')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-80">
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No transactions recorded yet.
              </div>
            ) : (
              stats.recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      {formatINR(t.amount)}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusPill(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-mono">
                    {t.customerEmail || t.id}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Support Activity */}
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              Recent Support Activity
            </h3>
            <button
              onClick={() => navigateAdmin('/tickets')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-80">
            {(!stats?.recentSupportActivity || stats.recentSupportActivity.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No support tickets logged.
              </div>
            ) : (
              stats.recentSupportActivity.map((tk) => (
                <div
                  key={tk.id}
                  onClick={() => navigateAdmin('/tickets')}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/60 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white truncate max-w-[160px]">
                      {tk.subject}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityPill(tk.priority)}`}>
                      {tk.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px] font-mono">{tk.email}</span>
                    <span className={`text-[10px] px-1 rounded border ${getStatusPill(tk.status)}`}>
                      {tk.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(tk.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
