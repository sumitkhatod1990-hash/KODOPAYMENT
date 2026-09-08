import React, { useEffect, useState, useTransition } from 'react';
import { formatINR, navigateAdmin } from '../../utils/adminDomain';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Calendar,
  X,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface AdminClient {
  id: string;
  name: string;
  email: string;
  company: string;
  authProvider: string;
  createdAt: string;
  onboardingStatus: string;
  kycStatus: string;
  activationStatus: string;
  paymentCount: number;
  paymentVolume: number;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('pageSize', String(pageSize));
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (fromDate) params.set('from', new Date(fromDate).toISOString());
      if (toDate) params.set('to', new Date(toDate).toISOString());

      const res = await fetch(`/api/v1/admin/clients?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setClients(json.data);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } else {
        throw new Error(json.error || 'Failed to parse clients directory.');
      }
    } catch (err: any) {
      console.error('Failed to fetch admin clients:', err);
      setError('Unable to load client records from operations store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, pageSize, searchQuery, statusFilter, fromDate, toDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'ACTIVE') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (s === 'PENDING' || s === 'SUBMITTED') {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (s === 'RESTRICTED' || s === 'SUSPENDED' || s === 'FAILED') {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Client Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Platform merchants, KYC onboarding states, and aggregate payment volume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchClients}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by company, merchant name, email, or ID..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter merchants by onboarding status"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="RESTRICTED">Restricted</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>

          {/* Date Filter: From */}
          <div className="w-full md:w-36">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              title="Filter from registration date"
              className="w-full py-2 px-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Date Filter: To */}
          <div className="w-full md:w-36">
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              title="Filter to registration date"
              className="w-full py-2 px-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all shrink-0"
          >
            Apply
          </button>
        </form>

        {(searchQuery || statusFilter !== 'all' || fromDate || toDate) && (
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
            <span>Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px]">
                Query: "{searchQuery}"
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px]">
                Status: {statusFilter}
              </span>
            )}
            {(fromDate || toDate) && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px]">
                Date: {fromDate || 'Start'} &rarr; {toDate || 'End'}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-blue-400 hover:text-blue-300 text-[11px] underline ml-2"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Error View */}
      {error && (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="text-xs text-rose-300">{error}</div>
          <button
            onClick={fetchClients}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg border border-slate-700"
          >
            Retry Loading Clients
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clients.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No clients found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No merchant records match the current filter and search criteria.
          </p>
          {(searchQuery || statusFilter !== 'all' || fromDate || toDate) && (
            <button
              onClick={handleClearFilters}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && !error && clients.length > 0 && (
        <>
          <div className="hidden lg:block rounded-2xl bg-[#0F172A] border border-slate-800/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0E1A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Business</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Onboarding</th>
                  <th className="py-3 px-4 font-semibold text-right">Payments</th>
                  <th className="py-3 px-4 font-semibold text-right">Volume</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigateAdmin(`/clients/${c.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {c.name || 'Unnamed'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {c.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {c.company || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {c.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(c.activationStatus || 'ACTIVE')}`}>
                        {c.activationStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(c.onboardingStatus)}`}>
                        {c.onboardingStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {c.paymentCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-sans text-white">
                      {formatINR(c.paymentVolume)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center text-blue-400 group-hover:text-blue-300 p-1 rounded hover:bg-slate-700/50">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="lg:hidden space-y-3">
            {clients.map((c) => (
              <div
                key={c.id}
                onClick={() => navigateAdmin(`/clients/${c.id}`)}
                className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.name || 'Unnamed'}</h4>
                    <div className="text-xs text-slate-400">{c.company}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(c.onboardingStatus)}`}>
                    {c.onboardingStatus || 'PENDING'}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 truncate">
                  {c.email}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Payments</span>
                    <div className="font-semibold text-white">{c.paymentCount} txs</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Volume</span>
                    <div className="font-bold text-emerald-400">{formatINR(c.paymentVolume)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Joined: {new Date(c.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-400 flex items-center gap-1 font-medium">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <span className="font-semibold text-white">
                  {Math.min((currentPage - 1) * pageSize + 1, pagination.total)}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-white">
                  {Math.min(currentPage * pageSize, pagination.total)}
                </span>{' '}
                of <span className="font-semibold text-white">{pagination.total}</span> clients
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Clients per page"
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 text-slate-300 font-mono">
                {currentPage} / {pagination.totalPages || 1}
              </span>

              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
