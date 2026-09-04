import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Landmark,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  AlertTriangle,
  FlaskConical
} from 'lucide-react';

// Phase 10.8F. This screen only ever renders rows this project actually
// retrieved from Cashfree's documented settlement APIs (see
// server/cashfreePartnerSettlement.js / server/paymentReconciliation.js) —
// never a fabricated settlement, amount, or UTR. An empty state always
// means exactly what its copy says, never "hidden" or "coming soon" demo
// data standing in for something real.
type ReconState = 'MATCHED' | 'PENDING_SETTLEMENT' | 'UNMATCHED' | 'DISCREPANCY' | 'UNKNOWN' | string;

const STATE_COPY: Record<string, { label: string; tone: 'neutral' | 'amber' | 'emerald' | 'rose'; detail: string }> = {
  MATCHED: { label: 'Matched', tone: 'emerald', detail: 'Cashfree confirms this payment settled for the amount QivroPay recorded.' },
  PENDING_SETTLEMENT: { label: 'Settlement pending', tone: 'amber', detail: 'Payment succeeded; Cashfree has not reported a completed settlement for it yet.' },
  UNMATCHED: { label: 'Unmatched', tone: 'neutral', detail: 'Cashfree has no settlement record for this order under this merchant account yet.' },
  DISCREPANCY: { label: 'Discrepancy', tone: 'rose', detail: 'Cashfree\'s reported amount or settlement outcome does not match QivroPay\'s record.' },
  UNKNOWN: { label: 'Status unavailable', tone: 'neutral', detail: 'Cashfree returned information this dashboard could not confidently interpret.' }
};

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900'
};

const TONE_ICON: Record<string, React.ElementType> = {
  neutral: HelpCircle,
  amber: Clock,
  emerald: CheckCircle2,
  rose: XCircle
};

function StateBadge({ state }: { state: ReconState }) {
  const copy = STATE_COPY[state] || { label: state, tone: 'neutral' as const, detail: 'Cashfree returned a reconciliation state this dashboard does not yet have specific guidance for.' };
  const Icon = TONE_ICON[copy.tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${TONE_CLASSES[copy.tone]}`} title={copy.detail}>
      <Icon className="w-3 h-3" />
      {copy.label}
    </span>
  );
}

export const SettlementsTab: React.FC = () => {
  const { settlements, reconciliations, settlementsLoading, settlementsEnvironment, fetchSettlements, refreshReconciliation, transactions } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [loadedOnce, setLoadedOnce] = useState(false);

  useEffect(() => {
    fetchSettlements().finally(() => setLoadedOnce(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settlementById = useMemo(() => {
    const map = new Map<string, typeof settlements[number]>();
    settlements.forEach((s) => map.set(s.cfSettlementId, s));
    return map;
  }, [settlements]);

  const transactionById = useMemo(() => {
    const map = new Map<string, typeof transactions[number]>();
    transactions.forEach((t) => map.set(t.id, t));
    return map;
  }, [transactions]);

  const succeededCount = useMemo(() => transactions.filter((t) => t.status === 'succeeded').length, [transactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshError('');
    const result = await refreshReconciliation();
    setRefreshing(false);
    if (!result.success) setRefreshError(result.error || 'Could not refresh settlement data right now.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl font-sans">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#0055FF]" />
            <span>Settlements</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            What Cashfree reports has settled for your successful payments, and whether it matches QivroPay's own records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {settlementsEnvironment && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-800 border-amber-200">
              <FlaskConical className="w-3.5 h-3.5" />
              {settlementsEnvironment === 'production' ? 'Production' : 'Sandbox / test data'}
            </span>
          )}
          <button type="button" onClick={handleRefresh} disabled={refreshing} className="opp-btn-secondary px-4 py-2 text-xs gap-2 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh settlements'}</span>
          </button>
        </div>
      </div>

      {settlementsEnvironment && settlementsEnvironment !== 'production' && (
        <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Every row below is real data from Cashfree's <strong>sandbox</strong> environment, not a live merchant settlement. Cashfree Partner production approval is still pending — this screen will show the same real fields once a production account is configured.
          </span>
        </div>
      )}

      {refreshError && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {refreshError}
        </p>
      )}

      <div className="opp-card p-0 overflow-hidden">
        {settlementsLoading && !loadedOnce ? (
          <div className="p-10 text-center text-sm text-[#8C90A0]">Loading settlement data…</div>
        ) : reconciliations.length === 0 ? (
          <div className="p-10 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] text-[#86868b] flex items-center justify-center mx-auto">
              <Landmark className="w-6 h-6" />
            </div>
            {succeededCount === 0 ? (
              <>
                <h3 className="font-bold text-[#0A0D14] text-base">No settlement data yet</h3>
                <p className="text-xs text-[#8C90A0] max-w-sm mx-auto">
                  Settlements are generated for successful payments. Once you have a successful payment, come back here and refresh to check its Cashfree settlement status.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-[#0A0D14] text-base">Settlement data unavailable in the current environment</h3>
                <p className="text-xs text-[#8C90A0] max-w-md mx-auto">
                  You have {succeededCount} successful payment{succeededCount === 1 ? '' : 's'}, but Cashfree has not reported settlement data for {succeededCount === 1 ? 'it' : 'them'} yet — check back after refreshing, or later once sandbox settlement has processed.
                </p>
                <button type="button" onClick={handleRefresh} disabled={refreshing} className="opp-btn-primary px-5 py-2.5 text-xs disabled:opacity-50">
                  {refreshing ? 'Checking…' : 'Check settlement status'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/10 text-[#8C90A0] font-mono uppercase text-[10px]">
                  <th className="py-3 px-5 font-semibold">Order</th>
                  <th className="py-3 px-5 font-semibold">Status</th>
                  <th className="py-3 px-5 font-semibold">Amount</th>
                  <th className="py-3 px-5 font-semibold">Settlement date</th>
                  <th className="py-3 px-5 font-semibold">UTR</th>
                  <th className="py-3 px-5 font-semibold">Last checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {reconciliations.map((r) => {
                  const settlement = r.cfSettlementId ? settlementById.get(r.cfSettlementId) : undefined;
                  const tx = transactionById.get(r.orderId);
                  return (
                    <tr key={r.orderId} className="hover:bg-[#f5f5f7] transition-colors align-top">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-semibold text-[#0A0D14]">{r.orderId}</div>
                        {tx?.productName && <div className="text-[11px] text-[#8C90A0]">{tx.productName}</div>}
                      </td>
                      <td className="py-3.5 px-5">
                        <StateBadge state={r.state} />
                        {r.discrepancy && <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 max-w-xs">{r.discrepancy}</div>}
                        {r.stale && <div className="text-[11px] text-amber-700 mt-1">Showing last known status — Cashfree could not be reached on the last refresh.</div>}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-semibold text-[#0A0D14]">
                        {tx ? `₹${Number(tx.amount).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-[#0A0D14]">
                        {settlement?.settlementProcessedOn ? new Date(settlement.settlementProcessedOn).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[#0A0D14]">
                        {settlement?.settlementUtr || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-[#8C90A0] font-mono">
                        {new Date(r.lastCheckedAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#8C90A0] max-w-2xl">
        Settlement amounts and UTRs shown here come directly from Cashfree's settlement reconciliation API for your Cashfree Partner sub-merchant account. A successful payment does not necessarily mean it has settled — "Settlement pending" is expected and normal until Cashfree completes its settlement cycle.
      </p>
    </div>
  );
};
