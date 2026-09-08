import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, AlertCircle, Clock, ChevronLeft, ChevronRight, Key } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '25');

      const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: Your administrative role cannot access audit logs.');
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotal(json.pagination.total || 0);
        }
      } else {
        throw new Error(json.error || 'Failed to parse audit logs.');
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Unable to connect to audit store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionBadge = (action: string) => {
    const a = (action || '').toUpperCase();
    if (a.includes('LOGIN')) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (a.includes('LOGOUT')) return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    if (a.includes('SYNC')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (a.includes('UPDATE')) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (a.includes('REPLY')) return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            Platform Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable cryptographic records of all administrative actions and security events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Logs
        </button>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="text-xs text-rose-300">{error}</div>
          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg border border-slate-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No audit records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Zero administrative events logged in this range.
          </p>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <>
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#0A0E1A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {log.adminEmail}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {log.adminRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                      {log.targetType}: {log.targetId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Total: <strong className="text-white">{total}</strong> audit events</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40"
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
