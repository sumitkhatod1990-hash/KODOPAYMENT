import React, { useEffect, useState, useMemo } from 'react';
import { formatINR, navigateAdmin } from '../../utils/adminDomain';
import {
  CreditCard,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  X,
  Copy,
  Check,
  Building2,
  Globe,
  Layers,
  CheckCircle2,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderId: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  merchantCompany?: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  refundedAmount: number;
  refundStatus?: string | null;
  environment: 'production' | 'sandbox' | string;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [envFilter, setEnvFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle date preset change
  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (preset === '24h') {
      const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      setFromDate(past.toISOString());
      setToDate('');
    } else if (preset === '7d') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setFromDate(past.toISOString());
      setToDate('');
    } else if (preset === '30d') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setFromDate(past.toISOString());
      setToDate('');
    }
  };

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, envFilter, datePreset, fromDate, toDate]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '25');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (envFilter !== 'all') params.set('environment', envFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (fromDate) params.set('from', fromDate);
      if (toDate) {
        const toVal = toDate.length === 10 ? `${toDate}T23:59:59.999Z` : toDate;
        params.set('to', toVal);
      }

      const res = await fetch(`/api/v1/admin/payments?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access Restricted: Your administrative role cannot access payment records.');
        }
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayments(json.data);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } else {
        throw new Error(json.error || 'Failed to parse payments ledger.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to payments ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, debouncedSearch, statusFilter, envFilter, fromDate, toDate]);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setEnvFilter('all');
    setDatePreset('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch ||
    statusFilter !== 'all' ||
    envFilter !== 'all' ||
    datePreset !== 'all' ||
    fromDate ||
    toDate
  );

  const getStatusPill = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'succeeded' || s === 'success') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (s === 'failed') {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (s === 'refunded' || s === 'partially_refunded') {
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    }
    if (s === 'refund_pending') {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
  };

  // Metrics derived from visible dataset
  const metrics = useMemo(() => {
    const totalCount = pagination.total || payments.length;
    const totalVolume = payments.reduce((acc, p) => acc + (p.status === 'succeeded' ? p.amount : 0), 0);
    const succeededCount = payments.filter(p => p.status === 'succeeded').length;
    const refundedVolume = payments.reduce((acc, p) => acc + (p.refundedAmount || 0), 0);
    return { totalCount, totalVolume, succeededCount, refundedVolume };
  }, [payments, pagination]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 font-mono">
              PAYMENTS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-medium">Global payment ledger</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Global Payments Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Cross-merchant transaction records, payment states, and refund events across all environments.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Total Transactions</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {metrics.totalCount}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Payment Volume (In View)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {formatINR(metrics.totalVolume)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Succeeded Count</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {metrics.succeededCount}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Refunded Volume</span>
            <RotateCcw className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {formatINR(metrics.refundedVolume)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, transaction ID, customer, merchant..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter payments by status"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="refund_pending">Refund Pending</option>
            </select>
          </div>

          {/* Environment Dropdown */}
          <div>
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              aria-label="Filter by environment"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          {/* Date Range Preset */}
          <div className="flex items-center gap-2">
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              aria-label="Filter by date range"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range...</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={fromDate.slice(0, 10)}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="From date"
                className="py-1.5 px-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={toDate.slice(0, 10)}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="To date"
                className="py-1.5 px-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-xs text-slate-400 hover:text-white underline ml-1"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="text-xs text-rose-300 font-medium">{error}</div>
          <button
            onClick={fetchPayments}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl border border-slate-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-900/80 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && payments.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-center space-y-3 shadow-xl">
          <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            {hasActiveFilters ? 'No payments match your filter criteria' : 'No payments found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'Try widening your search terms, removing status restrictions, or adjusting your date range.'
              : 'Zero payment records have been processed on the platform.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Desktop Table (1024px+) */}
      {!loading && !error && payments.length > 0 && (
        <>
          <div className="hidden lg:block rounded-2xl bg-[#0F172A] border border-slate-800/80 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Order / Transaction</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {payments.map((p) => {
                  const isProd = (p.environment || '').toLowerCase() === 'production';
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigateAdmin(`/payments/${p.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Order / Transaction */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-white font-medium group-hover:text-emerald-400 transition-colors">
                            {p.orderId || p.id}
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(p.orderId || p.id, e)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy Order ID"
                          >
                            {copiedId === (p.orderId || p.id) ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {p.orderId && p.id !== p.orderId && (
                          <div className="font-mono text-[10px] text-slate-500">{p.id}</div>
                        )}
                      </td>

                      {/* Merchant */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">
                          {p.merchantCompany || p.merchantName || 'Merchant'}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 truncate max-w-[170px]">
                          {p.merchantEmail || p.merchantId}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        {p.customerEmail || p.customerName ? (
                          <div>
                            <div className="text-slate-200">{p.customerName || 'Customer'}</div>
                            <div className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">{p.customerEmail}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-white font-mono text-xs">
                        <div>{formatINR(p.amount)}</div>
                        {p.refundedAmount > 0 && (
                          <div className="text-[10px] text-indigo-400 font-normal">
                            Ref: {formatINR(p.refundedAmount)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${getStatusPill(p.status)}`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Environment */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isProd
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span className="capitalize">{p.environment || 'production'}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium">
                          Investigate →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards (below 1024px) */}
          <div className="lg:hidden space-y-3">
            {payments.map((p) => {
              const isProd = (p.environment || '').toLowerCase() === 'production';
              return (
                <div
                  key={p.id}
                  onClick={() => navigateAdmin(`/payments/${p.id}`)}
                  className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 active:bg-slate-800/60 transition-colors space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white truncate max-w-[180px]">
                        {p.orderId || p.id}
                      </span>
                      <button
                        onClick={(e) => copyToClipboard(p.orderId || p.id, e)}
                        className="p-1 text-slate-500"
                        title="Copy Order ID"
                      >
                        {copiedId === (p.orderId || p.id) ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${getStatusPill(p.status)}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-white">{p.merchantCompany || p.merchantName || 'Merchant'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.merchantEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono">{formatINR(p.amount)}</div>
                      <span
                        className={`inline-flex items-center text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                          isProd
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span className="capitalize">{p.environment}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60 text-slate-400">
                    <span className="font-mono truncate max-w-[170px]">
                      {p.customerEmail || 'No customer email'}
                    </span>
                    <span className="font-mono text-[10px]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
            <div>
              Showing <span className="text-white font-mono">{payments.length}</span> of{' '}
              <span className="text-white font-mono">{pagination.total}</span> payments
              {pagination.totalPages > 1 && (
                <span> (Page {pagination.page} of {pagination.totalPages})</span>
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
