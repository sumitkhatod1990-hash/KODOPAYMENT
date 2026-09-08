import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { formatINR, navigateAdmin } from '../../utils/adminDomain';
import {
  Users,
  ArrowLeft,
  Shield,
  Clock,
  CreditCard,
  FileCheck,
  LifeBuoy,
  MessageSquare,
  Package,
  Link as LinkIcon,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  Calendar,
  Lock,
  Tag,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface Props {
  merchantId: string;
}

interface Client360Data {
  account: {
    merchantId: string;
    name: string;
    email: string;
    company: string;
    phone: string | null;
    website: string | null;
    signupDate: string;
    lastLoginAt: string | null;
    authProvider: 'email' | 'google' | string;
  };
  onboarding: {
    hasMapping: boolean;
    cfMerchantId: string | null;
    onboardingStatus: string;
    kycStatus: string | null;
    fullKycStatus: string | null;
    activationStatus: string | null;
    transactionAccess: string | null;
    updatedAt: string | null;
  };
  payments: {
    summary: {
      totalCount: number;
      totalVolume: number;
      successfulCount: number;
      failedCount: number;
      refundedCount: number;
      refundPendingCount: number;
    };
    recentTransactions: Array<{
      id: string;
      orderId: string;
      amount: number;
      currency: string;
      status: string;
      customerEmail: string;
      customerName: string;
      paymentMethod: string;
      refundedAmount: number;
      createdAt: string;
    }>;
  };
  products?: Array<{
    id: string;
    name: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string | null;
  }>;
  paymentLinks: Array<{
    sessionId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    expiresAt: string | null;
  }>;
  customers: {
    totalCustomers: number;
    recentCustomers: Array<{
      id: string;
      name: string;
      email: string;
      totalSpent: number;
      lastActive: string | null;
    }>;
  };
  support: {
    totalTickets: number;
    openTickets: number;
    recentTickets: Array<{
      id: string;
      subject: string;
      status: string;
      priority: string;
      category: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  chat: {
    totalSessions: number;
    recentSessions: Array<{
      id: string;
      mode: string;
      messageCount: number;
      createdAt: string;
      lastActivityAt?: string;
    }>;
  };
  activity: Array<{
    timestamp: string;
    type: 'account' | 'onboarding' | 'payment' | 'support' | string;
    title: string;
    description: string;
  }>;
}

export const AdminClient360Page: React.FC<Props> = ({ merchantId }) => {
  const { adminUser } = useAdminAuth();
  const [data, setData] = useState<Client360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [syncingKyc, setSyncingKyc] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const canSyncKyc = adminUser?.role === 'super_admin' || adminUser?.role === 'compliance_officer';

  const fetchClient360 = async () => {
    setLoading(true);
    setError(null);
    setIsNotFound(false);
    try {
      const res = await fetch(`/api/v1/admin/clients/${encodeURIComponent(merchantId)}/360`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 404) {
        setIsNotFound(true);
        setData(null);
        return;
      }

      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: Your administrative role is not authorized to view Client 360.');
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse Client 360 payload.');
      }
    } catch (err: any) {
      console.error('Failed to load Client 360:', err);
      setError(err.message || 'Unable to connect to client 360 store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient360();
  }, [merchantId]);

  const handleSyncKyc = async () => {
    if (!canSyncKyc || syncingKyc) return;
    setSyncingKyc(true);
    setSyncNotice(null);
    try {
      const res = await fetch(`/api/v1/admin/onboarding/${encodeURIComponent(merchantId)}/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setSyncNotice('Cashfree partner KYC & onboarding status successfully re-synchronized.');
        await fetchClient360();
      } else {
        setSyncNotice(`Sync failed: ${json.error || 'Could not re-sync partner record.'}`);
      }
    } catch {
      setSyncNotice('Network error: partner re-sync could not complete.');
    } finally {
      setSyncingKyc(false);
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'APPROVED' || s === 'ACTIVE' || s === 'ALLOWED' || s === 'SUCCEEDED') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (s === 'PENDING' || s === 'SUBMITTED' || s === 'IN_PROGRESS') {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (s === 'RESTRICTED' || s === 'FAILED' || s === 'REJECTED' || s === 'SUSPENDED') {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (s === 'REFUNDED' || s === 'PARTIALLY_REFUNDED') {
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    }
    return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

  const getPriorityPill = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'urgent') return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
    if (p === 'high') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (p === 'normal') return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'account':
        return <Users className="w-3.5 h-3.5 text-blue-400" />;
      case 'onboarding':
        return <FileCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-teal-400" />;
      case 'support':
        return <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />

        {/* Header Skeleton */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-64 bg-slate-700 rounded" />
              <div className="h-4 w-40 bg-slate-800 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-800 rounded" />
          </div>
          <div className="h-4 w-96 bg-slate-800 rounded" />
        </div>

        {/* Summary Row Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 animate-pulse space-y-2">
              <div className="h-3 w-16 bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-700 rounded" />
            </div>
          ))}
        </div>

        {/* Body 2-Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse" />
          <div className="h-80 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  // 404 Not Found
  if (isNotFound) {
    return (
      <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Client Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">
            No merchant record matches ID: <span className="font-mono text-slate-300">{merchantId}</span>
          </p>
        </div>
        <button
          onClick={() => navigateAdmin('/clients')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client Directory
        </button>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/40">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Failed to Load Client 360</h3>
          <p className="text-xs text-slate-400 mt-1">{error || 'An unexpected error occurred.'}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigateAdmin('/clients')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Back to Clients
          </button>
          <button
            onClick={fetchClient360}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { account, onboarding, payments, products, paymentLinks, customers, support, chat, activity } = data;

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateAdmin('/clients')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client Directory</span>
        </button>

        <button
          onClick={fetchClient360}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh 360</span>
        </button>
      </div>

      {/* Sync Status Alert */}
      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200 flex items-center justify-between animate-in fade-in">
          <span>{syncNotice}</span>
          <button onClick={() => setSyncNotice(null)} className="text-slate-400 hover:text-white text-sm">&times;</button>
        </div>
      )}

      {/* 2. Client Header */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">CLIENT</span>
              <span className="text-slate-600">&bull;</span>
              <span className="font-mono text-xs text-slate-400">{account.merchantId}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getStatusBadge(onboarding.activationStatus || 'ACTIVE')}`}>
                {onboarding.activationStatus || 'ACTIVE'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              {account.company || account.name || 'Unnamed Merchant'}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] text-slate-400">Auth Method:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-200 font-mono">
              <Lock className="w-3 h-3 text-slate-400" />
              {account.authProvider === 'google' ? 'Google OAuth' : 'Email & Password'}
            </span>
          </div>
        </div>

        {/* Metadata Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono truncate">{account.email}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{account.phone || 'No phone recorded'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {account.website ? (
              <a
                href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 truncate flex items-center gap-1"
              >
                {account.website} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-slate-500">No website registered</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              Joined: {new Date(account.signupDate).toLocaleDateString()}
              {account.lastLoginAt && (
                <span className="text-slate-500 font-mono text-[11px] ml-1.5">
                  &bull; Last Login: {new Date(account.lastLoginAt).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Top Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Payment Volume</div>
          <div className="text-base font-bold text-white font-sans truncate">
            {formatINR(payments.summary.totalVolume)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Successful</div>
          <div className="text-base font-bold text-emerald-400">
            {payments.summary.successfulCount} <span className="text-xs text-slate-500 font-normal">/ {payments.summary.totalCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Failed Txs</div>
          <div className="text-base font-bold text-rose-400">
            {payments.summary.failedCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Refunds</div>
          <div className="text-base font-bold text-indigo-400">
            {payments.summary.refundedCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Customers</div>
          <div className="text-base font-bold text-white">
            {customers.totalCustomers}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Open Tickets</div>
          <div className={`text-base font-bold ${support.openTickets > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {support.openTickets}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">KYC Status</div>
          <div className="truncate">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getStatusBadge(onboarding.kycStatus || onboarding.onboardingStatus)}`}>
              {onboarding.kycStatus || onboarding.onboardingStatus || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payments & Transactions (2 spans on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 4. Payment / Transaction Section */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Recent Transactions
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Last {payments.recentTransactions.length} of {payments.summary.totalCount} payment events
                </p>
              </div>

              <button
                onClick={() => navigateAdmin(`/payments`)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                View all payments <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {payments.recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No transactions recorded for this merchant yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Order / Tx ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {payments.recentTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        onClick={() => navigateAdmin(`/payments/${tx.id}`)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-medium text-white">
                          <div>{tx.orderId || tx.id}</div>
                          {tx.orderId !== tx.id && (
                            <div className="text-[10px] text-slate-500">{tx.id}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <div className="truncate max-w-[150px] font-mono">{tx.customerEmail || '—'}</div>
                          {tx.customerName && (
                            <div className="text-[10px] text-slate-500">{tx.customerName}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white font-sans">
                          {formatINR(tx.amount)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 6. Products & Payment Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Products Card */}
            <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-400" />
                  Products
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {products ? products.length : 0} items
                </span>
              </div>

              {(!products || products.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No products created yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {products.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.id}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatINR(p.amount)}</div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Links Card */}
            <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-teal-400" />
                  Payment Links
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {paymentLinks.length} sessions
                </span>
              </div>

              {paymentLinks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No payment links created yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {paymentLinks.map((pl) => (
                    <div key={pl.sessionId} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-mono text-slate-300 truncate text-[11px]">{pl.sessionId}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(pl.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-white">{formatINR(pl.amount)}</div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${getStatusBadge(pl.status)}`}>
                          {pl.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 7. Customers Section */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Customers
                </h3>
                <p className="text-[11px] text-slate-400">
                  {customers.totalCustomers} registered customers
                </p>
              </div>
            </div>

            {customers.recentCustomers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No customer records logged for this merchant.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {customers.recentCustomers.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="font-bold text-emerald-400">{formatINR(c.totalSpent)}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 truncate">{c.email}</div>
                    {c.lastActive && (
                      <div className="text-[10px] text-slate-500">
                        Active: {new Date(c.lastActive).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Onboarding & Support & Activity (1 span on desktop) */}
        <div className="space-y-6">
          {/* 5. Cashfree Partner / Onboarding Panel */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Onboarding &amp; KYC
              </h3>
              {canSyncKyc && (
                <button
                  onClick={handleSyncKyc}
                  disabled={syncingKyc}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg border border-slate-700 disabled:opacity-50 transition-colors"
                  title="Re-synchronize partner KYC status"
                >
                  {syncingKyc ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Sync status</span>
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cashfree Merchant ID</span>
                <span className="font-mono font-medium text-slate-200">
                  {onboarding.cfMerchantId || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Onboarding Status</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(onboarding.onboardingStatus)}`}>
                  {onboarding.onboardingStatus || 'NOT_STARTED'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Minimum KYC</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(onboarding.kycStatus)}`}>
                  {onboarding.kycStatus || 'PENDING'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Full KYC</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(onboarding.fullKycStatus)}`}>
                  {onboarding.fullKycStatus || 'PENDING'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Activation State</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(onboarding.activationStatus)}`}>
                  {onboarding.activationStatus || 'PENDING'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction Access</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(onboarding.transactionAccess)}`}>
                  {onboarding.transactionAccess || 'RESTRICTED'}
                </span>
              </div>

              {onboarding.updatedAt && (
                <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Last Synced</span>
                  <span>{new Date(onboarding.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* 8. Support & Chat Section */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-amber-400" />
                Support &amp; Chat
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {support.totalTickets} tickets / {chat.totalSessions} chats
              </span>
            </div>

            {/* Tickets */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Recent Tickets</div>
              {support.recentTickets.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">No support tickets submitted.</div>
              ) : (
                <div className="space-y-2">
                  {support.recentTickets.slice(0, 3).map((tk) => (
                    <div
                      key={tk.id}
                      onClick={() => navigateAdmin(`/tickets/${tk.id}`)}
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/60 cursor-pointer transition-colors space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white truncate max-w-[170px]">{tk.subject}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getPriorityPill(tk.priority)}`}>
                          {tk.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono">{tk.id}</span>
                        <span className={`px-1 rounded border ${getStatusBadge(tk.status)}`}>
                          {tk.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Sessions */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Recent Chat Logs</div>
              {chat.recentSessions.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">No chat sessions on record.</div>
              ) : (
                <div className="space-y-2">
                  {chat.recentSessions.slice(0, 2).map((cs) => (
                    <div
                      key={cs.id}
                      onClick={() => navigateAdmin(`/chat-logs/${cs.id}`)}
                      className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/60 cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-mono text-slate-300 truncate text-[11px]">{cs.id}</div>
                        <div className="text-[10px] text-slate-500">{cs.mode} mode &bull; {cs.messageCount} msgs</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 9. Activity Timeline */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Activity Timeline
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {activity.length} events
              </span>
            </div>

            {activity.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No activity recorded yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {activity.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="font-semibold text-white leading-snug">{act.title}</div>
                      <div className="text-[11px] text-slate-400 leading-relaxed break-words">{act.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
