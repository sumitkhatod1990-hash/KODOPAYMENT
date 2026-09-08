import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { FileCheck, RefreshCw, AlertCircle, Clock, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

export const AdminOnboardingPage: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const canSync = adminUser?.role === 'super_admin' || adminUser?.role === 'compliance_officer';

  const fetchOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/v1/admin/onboarding?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: Your administrative role cannot access the onboarding queue.');
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setQueue(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse onboarding queue.');
      }
    } catch (err: any) {
      console.error('Failed to load onboarding:', err);
      setError(err.message || 'Unable to connect to onboarding store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboarding();
  }, [statusFilter]);

  const handleSyncKyc = async (merchantId: string) => {
    if (!canSync || syncingId) return;
    setSyncingId(merchantId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/v1/admin/onboarding/${merchantId}/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setActionMessage(`KYC re-synced successfully for merchant ${merchantId}.`);
        fetchOnboarding();
      } else {
        setActionMessage(`Sync failed: ${json.error || 'Could not reach partner API'}`);
      }
    } catch (err) {
      setActionMessage('Network error during partner KYC sync.');
    } finally {
      setSyncingId(null);
    }
  };

  const getStatusPill = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'APPROVED') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (s === 'SUBMITTED' || s === 'PENDING') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            Onboarding &amp; KYC Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Partner verification oversight, merchant KYC statuses, and bank activation controls.
          </p>
        </div>

        <button
          onClick={fetchOnboarding}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter onboarding records by status"
          className="py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
        >
          <option value="all">All Verification Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="SUBMITTED">Submitted / In Review</option>
          <option value="PENDING">Pending Documents</option>
        </select>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="text-xs text-rose-300">{error}</div>
          <button
            onClick={fetchOnboarding}
            className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg border border-slate-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && queue.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-center space-y-3">
          <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No onboarding records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All merchant KYC verifications are up to date.
          </p>
        </div>
      )}

      {!loading && !error && queue.length > 0 && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#0A0E1A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Merchant / Company</th>
                <th className="py-3 px-4">Partner CF ID</th>
                <th className="py-3 px-4">Onboarding Status</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">Transactions</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {queue.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{m.company || m.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {m.cfMerchantId || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusPill(m.onboardingStatus)}`}>
                      {m.onboardingStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusPill(m.kycStatus)}`}>
                      {m.kycStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    {m.transactionAccess || 'ALLOWED'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {canSync && (
                      <button
                        onClick={() => handleSyncKyc(m.id)}
                        disabled={syncingId === m.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg border border-slate-700 disabled:opacity-50 transition-colors"
                      >
                        {syncingId === m.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Sync
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
