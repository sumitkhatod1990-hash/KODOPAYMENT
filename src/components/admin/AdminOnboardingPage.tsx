import React, { useEffect, useState, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { navigateAdmin } from '../../utils/adminDomain';
import {
  FileCheck,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Building2,
  CreditCard,
  Users,
  Copy,
  Check
} from 'lucide-react';

interface OnboardingRecord {
  merchantId: string;
  merchantName: string;
  company: string;
  merchantEmail: string;
  cfMerchantId: string | null;
  onboardingState: string;
  onboardingStatus: string | null;
  rawOnboardingStatus: string | null;
  kycStatus: string | null;
  fullKycStatus: string | null;
  activationStatus: string | null;
  transactionAccess: string | null;
  stateReason: string | null;
  stateTitle: string;
  stateDetail: string;
  stateTone: 'emerald' | 'amber' | 'rose' | 'neutral' | string;
  createdAt: string;
  updatedAt: string | null;
  lastSyncedAt: string | null;
  hasPartnerMapping: boolean;
}

export const AdminOnboardingPage: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [queue, setQueue] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [activationFilter, setActivationFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sync state
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const canSync = adminUser?.role === 'super_admin' || adminUser?.role === 'compliance_officer';

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Compute date range from preset
  const dateRange = useMemo(() => {
    if (datePreset === 'all') return { from: null, to: null };
    const now = new Date();
    let fromDate: Date | null = null;
    if (datePreset === '24h') {
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (datePreset === '7d') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (datePreset === '30d') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return {
      from: fromDate ? fromDate.toISOString() : null,
      to: now.toISOString()
    };
  }, [datePreset]);

  const copyToClipboard = (e: React.MouseEvent, text: string, key: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (stateFilter !== 'all') params.set('onboardingStatus', stateFilter);
      if (kycFilter !== 'all') params.set('kycStatus', kycFilter);
      if (activationFilter !== 'all') params.set('activationStatus', activationFilter);
      if (dateRange.from) params.set('from', dateRange.from);
      if (dateRange.to) params.set('to', dateRange.to);

      const res = await fetch(`/api/v1/admin/onboarding?${params.toString()}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: Your role cannot access the onboarding queue.');
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setQueue(json.data);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalRecords(json.pagination.total || json.data.length);
        }
      } else {
        throw new Error(json.error || 'Failed to parse onboarding queue.');
      }
    } catch (err: any) {
      console.error('Failed to load onboarding queue:', err);
      setError(err.message || 'Unable to connect to onboarding store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboarding();
  }, [page, debouncedSearch, stateFilter, kycFilter, activationFilter, datePreset]);

  const handleSyncKyc = async (e: React.MouseEvent, merchantId: string) => {
    e.stopPropagation();
    if (!canSync || syncingId) return;
    setSyncingId(merchantId);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/v1/admin/onboarding/${encodeURIComponent(merchantId)}/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setActionNotice({
          type: 'success',
          message: `Status synced for merchant ${merchantId}. Resulting state: ${json.data?.onboardingState || 'UPDATED'}.`
        });
        fetchOnboarding();
      } else {
        setActionNotice({
          type: 'error',
          message: `Sync failed: ${json.error || 'Could not reach Cashfree Partner API'}`
        });
      }
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: 'Network error during Cashfree status sync.'
      });
    } finally {
      setSyncingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStateFilter('all');
    setKycFilter('all');
    setActivationFilter('all');
    setDatePreset('all');
    setPage(1);
  };

  const hasActiveFilters = search || stateFilter !== 'all' || kycFilter !== 'all' || activationFilter !== 'all' || datePreset !== 'all';

  // KPI Metrics derived from queue
  const kpis = useMemo(() => {
    const active = queue.filter(r => r.onboardingState === 'ACTIVE').length;
    const minApproved = queue.filter(r => r.kycStatus === 'MIN_KYC_APPROVED').length;
    const pending = queue.filter(r => r.onboardingState.includes('PENDING') || r.onboardingState.includes('SUBMITTED')).length;
    const attention = queue.filter(r => r.onboardingState.includes('REJECTED') || r.onboardingState.includes('RESTRICTED') || r.onboardingState === 'UNKNOWN' || r.onboardingState === 'ERROR_STALE').length;
    return { active, minApproved, pending, attention };
  }, [queue]);

  const getStatePill = (state: string, tone?: string) => {
    switch (tone) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        break;
    }
    const s = (state || '').toUpperCase();
    if (s === 'ACTIVE' || s === 'MIN_KYC_APPROVED') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (s.includes('PENDING') || s.includes('SUBMITTED') || s === 'EMAIL_VERIFICATION') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (s.includes('REJECTED') || s.includes('RESTRICTED') || s === 'UNKNOWN' || s === 'ERROR_STALE') return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getKycPill = (status: string | null) => {
    if (!status) return 'bg-slate-800/80 text-slate-500 border-slate-700';
    const s = status.toUpperCase();
    if (s === 'MIN_KYC_APPROVED' || s === 'FULL_KYC_APPROVED' || s === 'APPROVED') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (s.includes('PENDING') || s.includes('SUBMITTED')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (s.includes('REJECTED')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getActivationPill = (status: string | null) => {
    if (!status) return 'bg-slate-800/80 text-slate-500 border-slate-700';
    const s = status.toUpperCase();
    if (s === 'ACTIVE') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (s === 'SUSPENDED' || s === 'INACTIVE' || s === 'RESTRICTED') return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            Merchant Onboarding &amp; KYC Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authoritative Cashfree Partner onboarding lifecycle, KYC verification, and PG payment access tracking.
          </p>
        </div>

        <button
          onClick={fetchOnboarding}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Total in View
          </div>
          <div className="text-lg font-bold text-white mt-1">{totalRecords}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Database merchants</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Active (Full Access)
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{kpis.active}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">PG active &amp; ready</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Verification Pending
          </div>
          <div className="text-lg font-bold text-amber-400 mt-1">{kpis.pending}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Under Cashfree review</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Action Needed
          </div>
          <div className="text-lg font-bold text-rose-400 mt-1">{kpis.attention}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Restricted / rejected / conflict</div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white text-base leading-none ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Company, Email, Merchant ID, CF ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Onboarding State Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
              aria-label="Filter by Onboarding State"
              className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Onboarding States</option>
              <option value="ACTIVE">ACTIVE (Full Access)</option>
              <option value="MIN_KYC_PENDING">MIN_KYC_PENDING</option>
              <option value="MIN_KYC_SUBMITTED">MIN_KYC_SUBMITTED</option>
              <option value="MIN_KYC_APPROVED">MIN_KYC_APPROVED</option>
              <option value="MIN_KYC_REJECTED">MIN_KYC_REJECTED</option>
              <option value="FULL_KYC_PENDING">FULL_KYC_PENDING</option>
              <option value="EMAIL_VERIFICATION">EMAIL_VERIFICATION</option>
              <option value="MERCHANT_CREATION_PENDING">MERCHANT_CREATION_PENDING</option>
              <option value="ACCESS_RESTRICTED">ACCESS_RESTRICTED</option>
              <option value="UNKNOWN">UNKNOWN (Contradiction)</option>
              <option value="ERROR_STALE">ERROR_STALE</option>
              <option value="NOT_STARTED">NOT_STARTED</option>
            </select>
          </div>

          {/* Minimum KYC Filter */}
          <div>
            <select
              value={kycFilter}
              onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
              aria-label="Filter by KYC Status"
              className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Cashfree KYC Statuses</option>
              <option value="MIN_KYC_APPROVED">MIN_KYC_APPROVED</option>
              <option value="MIN_KYC_PENDING">MIN_KYC_PENDING</option>
              <option value="MIN_KYC_SUBMITTED">MIN_KYC_SUBMITTED</option>
              <option value="MIN_KYC_REJECTED">MIN_KYC_REJECTED</option>
            </select>
          </div>

          {/* Activation Filter */}
          <div>
            <select
              value={activationFilter}
              onChange={(e) => { setActivationFilter(e.target.value); setPage(1); }}
              aria-label="Filter by PG Activation"
              className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All PG Activation Modes</option>
              <option value="ACTIVE">ACTIVE (Payment Gateway Live)</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        {/* Date presets & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px] text-slate-500">Created Date:</span>
            {['all', '24h', '7d', '30d'].map((preset) => (
              <button
                key={preset}
                onClick={() => { setDatePreset(preset); setPage(1); }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  datePreset === preset
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {preset === 'all' ? 'All Time' : preset === '24h' ? 'Last 24 Hours' : preset === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors ml-auto"
            >
              <X className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="text-xs text-rose-300">{error}</div>
          <button
            onClick={fetchOnboarding}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && queue.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-center space-y-3">
          <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No onboarding records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No merchants matched your specific filter criteria. Try adjusting or resetting your filters.'
              : 'There are currently no merchant accounts stored in the platform.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && !error && queue.length > 0 && (
        <>
          <div className="hidden md:block rounded-2xl bg-[#0F172A] border border-slate-800/80 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-[#0A0E1A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Merchant / Business</th>
                  <th className="py-3 px-4">Cashfree Partner ID</th>
                  <th className="py-3 px-4">Onboarding State</th>
                  <th className="py-3 px-4">Cashfree KYC Status</th>
                  <th className="py-3 px-4">PG Activation</th>
                  <th className="py-3 px-4">Last Synced</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {queue.map((m) => (
                  <tr
                    key={m.merchantId}
                    onClick={() => navigateAdmin(`/onboarding/${m.merchantId}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* Merchant & Business */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-[200px]">
                        {m.company || m.merchantName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                        {m.merchantEmail}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                        <span>ID: {m.merchantId}</span>
                        <button
                          onClick={(e) => copyToClipboard(e, m.merchantId, `m-${m.merchantId}`)}
                          className="text-slate-500 hover:text-slate-300"
                          title="Copy Merchant ID"
                        >
                          {copiedKey === `m-${m.merchantId}` ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Cashfree Partner ID */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {m.cfMerchantId ? (
                        <span className="text-slate-200">{m.cfMerchantId}</span>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">Unmapped</span>
                      )}
                    </td>

                    {/* Onboarding State */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getStatePill(m.onboardingState, m.stateTone)}`}>
                        {m.onboardingState}
                      </span>
                    </td>

                    {/* Cashfree KYC Status */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex text-[9px] px-1.5 py-0.5 rounded border font-medium ${getKycPill(m.kycStatus)}`}>
                          {m.kycStatus || 'PENDING'}
                        </span>
                        {m.fullKycStatus && (
                          <div className="text-[9px] text-slate-400 font-mono">
                            Full: {m.fullKycStatus}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* PG Activation */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getActivationPill(m.activationStatus)}`}>
                        {m.activationStatus || 'PENDING'}
                      </span>
                    </td>

                    {/* Last Synced */}
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {m.lastSyncedAt ? (
                        <span>{new Date(m.lastSyncedAt).toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-500 italic">Never Synced</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigateAdmin(`/onboarding/${m.merchantId}`)}
                          className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg border border-slate-700 transition-colors"
                          title="View detailed onboarding workspace"
                        >
                          Details &rarr;
                        </button>

                        {canSync && m.hasPartnerMapping && (
                          <button
                            onClick={(e) => handleSyncKyc(e, m.merchantId)}
                            disabled={syncingId === m.merchantId}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 disabled:opacity-50 transition-colors"
                            title="Re-synchronize authoritative Cashfree status"
                          >
                            {syncingId === m.merchantId ? (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden space-y-3">
            {queue.map((m) => (
              <div
                key={m.merchantId}
                onClick={() => navigateAdmin(`/onboarding/${m.merchantId}`)}
                className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold text-white">{m.company || m.merchantName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.merchantEmail}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">ID: {m.merchantId}</p>
                  </div>
                  <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-semibold shrink-0 ${getStatePill(m.onboardingState, m.stateTone)}`}>
                    {m.onboardingState}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cashfree Partner ID</span>
                    <span className="font-mono text-slate-300">{m.cfMerchantId || 'Unmapped'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">PG Activation</span>
                    <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded border font-medium ${getActivationPill(m.activationStatus)}`}>
                      {m.activationStatus || 'PENDING'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cashfree KYC</span>
                    <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded border font-medium ${getKycPill(m.kycStatus)}`}>
                      {m.kycStatus || 'PENDING'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Last Synced</span>
                    <span className="text-slate-400">{m.lastSyncedAt ? new Date(m.lastSyncedAt).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigateAdmin(`/onboarding/${m.merchantId}`)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View Workspace &rarr;
                  </button>

                  {canSync && m.hasPartnerMapping && (
                    <button
                      onClick={(e) => handleSyncKyc(e, m.merchantId)}
                      disabled={syncingId === m.merchantId}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
                    >
                      {syncingId === m.merchantId ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      Sync Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <div>
              Showing Page <span className="text-white font-medium">{page}</span> of{' '}
              <span className="text-white font-medium">{totalPages}</span> ({totalRecords} total merchants)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-medium rounded-xl border border-slate-800 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-medium rounded-xl border border-slate-800 transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
