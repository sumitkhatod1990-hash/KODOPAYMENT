import React, { useEffect, useState, useMemo } from 'react';
import { navigateAdmin } from '../../utils/adminDomain';
import {
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Globe,
  Search,
  Calendar,
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  User,
  ExternalLink,
  MessageCircle,
  Users
} from 'lucide-react';

interface ChatSessionRecord {
  id: string;
  merchantId: string | null;
  clientName?: string | null;
  clientCompany?: string | null;
  clientEmail?: string | null;
  mode: 'authenticated' | 'public' | string;
  messageCount: number;
  createdAt: string;
  lastActivityAt: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const AdminChatLogsPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSessionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 20,
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

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [modeFilter, fromDate, toDate]);

  const fetchChatLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '20');
      if (modeFilter !== 'all') params.set('mode', modeFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const res = await fetch(`/api/v1/admin/support/chat-logs?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access Restricted: Your administrative role cannot access chat transcripts.');
        }
        throw new Error(`Server responded with HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSessions(json.data);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } else {
        throw new Error(json.error || 'Failed to parse chat logs response');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load support chat logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatLogs();
  }, [page, debouncedSearch, modeFilter, fromDate, toDate]);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setModeFilter('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch ||
    modeFilter !== 'all' ||
    fromDate ||
    toDate
  );

  // Derived metrics from current dataset
  const metrics = useMemo(() => {
    const total = pagination.total || sessions.length;
    const authenticated = sessions.filter(s => s.mode === 'authenticated').length;
    const publicSessions = sessions.filter(s => s.mode === 'public').length;
    const totalMessages = sessions.reduce((acc, s) => acc + (s.messageCount || 0), 0);
    return { total, authenticated, publicSessions, totalMessages };
  }, [sessions, pagination]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 font-mono">
              CHAT LOGS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-medium">Support conversations</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Support Chat Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Review chatbot conversations to understand customer and merchant support activity.
          </p>
        </div>

        <button
          onClick={fetchChatLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Metric Chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Total Conversations</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {metrics.total}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Authenticated</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {metrics.authenticated}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Public Visitors</span>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {metrics.publicSessions}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Messages in View</span>
            <MessageCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {metrics.totalMessages}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by session ID, merchant ID, or client..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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

          {/* Mode Selector */}
          <div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              aria-label="Filter by session mode"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Modes</option>
              <option value="authenticated">Authenticated Merchant</option>
              <option value="public">Public Visitor</option>
            </select>
          </div>

          {/* Date Range or Reset */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="From date"
                className="w-full py-2 px-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
                title="Clear all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="text-xs text-rose-300 font-medium">{error}</div>
          <button
            onClick={fetchChatLogs}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl border border-slate-700 transition-colors"
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

      {/* Empty States */}
      {!loading && !error && sessions.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            {hasActiveFilters ? 'No conversations match your filters' : 'No chat sessions found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'Try widening your search terms or clearing your mode and date range filters.'
              : 'Zero support chat conversations have been recorded on the platform.'}
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

      {/* Desktop Table View (1024px+) */}
      {!loading && !error && sessions.length > 0 && (
        <>
          <div className="hidden lg:block rounded-2xl bg-[#0F172A] border border-slate-800/80 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-center">Messages</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {sessions.map((s) => {
                  const isAuth = s.mode === 'authenticated';
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigateAdmin(`/chat-logs/${s.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Session ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-white font-medium group-hover:text-blue-400 transition-colors">
                            {s.id}
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(s.id, e)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy session ID"
                          >
                            {copiedId === s.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        {isAuth && s.merchantId ? (
                          <div>
                            <div className="font-medium text-white">
                              {s.clientName || s.clientCompany || 'Merchant'}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
                              {s.clientEmail || s.merchantId}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Globe className="w-3 h-3 text-slate-500" />
                            Public Visitor
                          </span>
                        )}
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isAuth
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-slate-700/30 text-slate-300 border-slate-600/30'
                          }`}
                        >
                          {isAuth ? (
                            <ShieldCheck className="w-3 h-3 text-blue-400" />
                          ) : (
                            <Globe className="w-3 h-3 text-slate-400" />
                          )}
                          <span className="capitalize">{s.mode}</span>
                        </span>
                      </td>

                      {/* Messages */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] border border-slate-700/50">
                          {s.messageCount || 0}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] font-mono">
                        {s.lastActivityAt ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(s.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-slate-500 text-[10px]">({new Date(s.lastActivityAt).toLocaleDateString()})</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center text-[11px] text-blue-400 group-hover:translate-x-0.5 transition-transform font-medium">
                          Inspect →
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
            {sessions.map((s) => {
              const isAuth = s.mode === 'authenticated';
              return (
                <div
                  key={s.id}
                  onClick={() => navigateAdmin(`/chat-logs/${s.id}`)}
                  className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 active:bg-slate-800/60 transition-colors space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white truncate max-w-[180px]">
                        {s.id}
                      </span>
                      <button
                        onClick={(e) => copyToClipboard(s.id, e)}
                        className="p-1 text-slate-500"
                        title="Copy session ID"
                      >
                        {copiedId === s.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isAuth
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-slate-700/30 text-slate-300 border-slate-600/30'
                      }`}
                    >
                      {isAuth ? <ShieldCheck className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      <span className="capitalize">{s.mode}</span>
                    </span>
                  </div>

                  {/* Client line */}
                  <div className="text-xs text-slate-300">
                    {isAuth && s.merchantId ? (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-blue-400" />
                        <span className="font-medium text-white">{s.clientName || s.clientCompany || 'Merchant'}</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate">({s.merchantId})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>Public Visitor</span>
                      </div>
                    )}
                  </div>

                  {/* Message count and timestamp */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60 text-slate-400">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-slate-500" />
                      Messages: <strong className="text-slate-200 font-mono">{s.messageCount || 0}</strong>
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {s.lastActivityAt ? new Date(s.lastActivityAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
              <div>
                Page <span className="text-white font-mono">{pagination.page}</span> of{' '}
                <span className="text-white font-mono">{pagination.totalPages}</span> ({pagination.total} total sessions)
              </div>
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
            </div>
          )}
        </>
      )}
    </div>
  );
};
