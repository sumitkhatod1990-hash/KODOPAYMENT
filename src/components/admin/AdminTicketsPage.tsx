import React, { useEffect, useState } from 'react';
import { navigateAdmin } from '../../utils/adminDomain';
import {
  LifeBuoy,
  RefreshCw,
  AlertCircle,
  Search,
  Clock,
  Tag,
  ChevronRight,
  Filter,
  X,
  Users,
  ChevronLeft,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Inbox
} from 'lucide-react';

interface TicketItem {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | string;
  priority: 'urgent' | 'high' | 'normal' | 'low' | string;
  replies?: Array<any>;
  created_at: string;
  updated_at: string;
}

export const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (fromDate) params.set('from', new Date(fromDate).toISOString());
      if (toDate) params.set('to', new Date(toDate).toISOString());

      const res = await fetch(`/api/v1/admin/support/tickets?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: Your administrative role is not authorized to access support tickets.');
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTickets(json.data);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalCount(json.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotalCount(json.data.length);
        }
      } else {
        throw new Error(json.error || 'Failed to parse support tickets.');
      }
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
      setError(err.message || 'Unable to connect to support ticket queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, pageSize, searchQuery, statusFilter, priorityFilter, fromDate, toDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  // Safe metrics derived from loaded tickets
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgent').length;
  const highCount = tickets.filter(t => t.priority === 'high').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Extract unique categories for category filter
  const availableCategories = Array.from(
    new Set(tickets.map(t => t.category).filter(Boolean))
  );

  // Client-side category filtering if active
  const displayedTickets = categoryFilter === 'all'
    ? tickets
    : tickets.filter(t => (t.category || '').toLowerCase() === categoryFilter.toLowerCase());

  const getPriorityBadge = (p: string) => {
    const s = (p || '').toLowerCase();
    if (s === 'urgent') return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
    if (s === 'high') return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium';
    if (s === 'normal') return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

  const getStatusBadge = (st: string) => {
    const s = (st || '').toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium';
    if (s === 'in_progress') return 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium';
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-medium';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
            SUPPORT OPERATIONS
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
            Support Tickets
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal queue for merchant inquiries, compliance reviews, and API technical assistance.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* 2. Operational Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Inbox className="w-3 h-3 text-blue-400" />
            Open
          </div>
          <div className="text-lg font-bold text-white font-sans">
            {openCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            In Progress
          </div>
          <div className="text-lg font-bold text-amber-400 font-sans">
            {inProgressCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" />
            Urgent
          </div>
          <div className="text-lg font-bold text-rose-400 font-sans">
            {urgentCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            High Priority
          </div>
          <div className="text-lg font-bold text-amber-300 font-sans">
            {highCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </div>
          <div className="text-lg font-bold text-emerald-400 font-sans">
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by ticket ID, subject, merchant email, or name..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter tickets by status"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="w-full md:w-36">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter tickets by priority"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div className="w-full md:w-40">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter tickets by category"
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filter: From */}
          <div className="w-full md:w-36">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              title="Filter from creation date"
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
                setPage(1);
              }}
              title="Filter to creation date"
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

        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || fromDate || toDate) && (
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 flex-wrap">
            <span>Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px]">
                Search: "{searchQuery}"
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px]">
                Status: {statusFilter}
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px]">
                Priority: {priorityFilter}
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px]">
                Category: {categoryFilter}
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
            onClick={fetchTickets}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg border border-slate-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && displayedTickets.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-center space-y-3">
          <LifeBuoy className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
              ? 'No tickets match your current filters.'
              : 'No support tickets found.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Zero support tickets currently match the selected criteria.
          </p>
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || fromDate || toDate) && (
            <button
              onClick={handleClearFilters}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* 4. Desktop Ticket Table */}
      {!loading && !error && displayedTickets.length > 0 && (
        <>
          <div className="hidden lg:block rounded-2xl bg-[#0F172A] border border-slate-800/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0E1A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Ticket ID</th>
                  <th className="py-3 px-4 font-semibold">Client / Merchant</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                  <th className="py-3 px-4 font-semibold">Updated</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigateAdmin(`/tickets/${t.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-white group-hover:text-blue-400 transition-colors">
                      {t.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{t.name || 'Merchant'}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{t.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {t.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(t.updated_at || t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center text-blue-400 group-hover:text-blue-300 p-1 rounded hover:bg-slate-700/50">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Mobile Ticket Cards */}
          <div className="lg:hidden space-y-3">
            {displayedTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => navigateAdmin(`/tickets/${t.id}`)}
                className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-2.5 cursor-pointer hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white leading-snug">{t.subject}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">{t.name || 'Merchant'} &bull; <span className="font-mono text-[11px]">{t.email}</span></div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border shrink-0 ${getPriorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{t.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(t.updated_at || t.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Total: <span className="font-semibold text-white">{totalCount}</span> tickets
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="Tickets per page"
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
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 text-slate-300 font-mono">
                {page} / {totalPages || 1}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
