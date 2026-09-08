import React, { useEffect, useState } from 'react';
import { formatINR, navigateAdmin } from '../../utils/adminDomain';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  CreditCard,
  ArrowLeft,
  Clock,
  Shield,
  ShieldCheck,
  User,
  ExternalLink,
  LifeBuoy,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Calendar,
  Layers,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  Scale,
  Activity,
  Loader2
} from 'lucide-react';

interface Props {
  paymentId: string;
}

interface MerchantInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface CustomerInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface ProcessingInfo {
  cfOrderId: string | null;
  cfPaymentId: string | null;
  paymentMethod: string;
  gatewayStatus: string | null;
  bankReference: string | null;
}

interface RefundInfo {
  hasRefund: boolean;
  refundId: string | null;
  amount: number;
  status: string;
  note: string | null;
  refundedAt: string | null;
}

interface SettlementInfo {
  cfSettlementId: string;
  status: string;
  settlementUtr: string | null;
  settlementCurrency: string;
  settlementType: string | null;
  settlementInitiatedOn: string | null;
  settlementProcessedOn: string | null;
  updatedAt: string | null;
}

interface ReconciliationInfo {
  state: 'MATCHED' | 'PENDING_SETTLEMENT' | 'UNMATCHED' | 'DISCREPANCY' | 'UNKNOWN' | string;
  discrepancy: string | null;
  lastCheckedAt: string | null;
}

interface RelatedTicketInfo {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface PaymentDetail {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  isStale?: boolean;
  staleReason?: string | null;
  environment: 'sandbox' | 'production' | string;
  merchant: MerchantInfo;
  customer: CustomerInfo;
  processing: ProcessingInfo;
  refund: RefundInfo | null;
  settlement: SettlementInfo | null;
  reconciliation: ReconciliationInfo | null;
  relatedTicket: RelatedTicketInfo | null;
}

export const AdminPaymentDetailPage: React.FC<Props> = ({ paymentId }) => {
  const { adminUser } = useAdminAuth();
  const canOperate = adminUser?.role === 'super_admin' || adminUser?.role === 'compliance_officer';

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [refreshingStatus, setRefreshingStatus] = useState<boolean>(false);
  const [refreshingRecon, setRefreshingRecon] = useState<boolean>(false);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const fetchPaymentDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/payments/${encodeURIComponent(paymentId)}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 404) {
        throw new Error('Payment record not found in platform ledger.');
      }

      if (res.status === 403) {
        throw new Error('Access Restricted: Your administrative role cannot access payment details.');
      }

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setPayment(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse payment details.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load payment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetail();
  }, [paymentId]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefreshStatus = async () => {
    if (!payment || refreshingStatus || refreshingRecon) return;
    setRefreshingStatus(true);
    setOperationSuccess(null);
    setOperationError(null);
    try {
      const res = await fetch(`/api/v1/admin/payments/${encodeURIComponent(payment.id)}/refresh-status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to refresh status (HTTP ${res.status})`);
      }
      if (json.data) {
        setPayment(json.data);
      }
      setOperationSuccess(json.message || 'Payment status refreshed successfully from Cashfree gateway.');
    } catch (err: any) {
      setOperationError(err.message || 'Failed to refresh payment status.');
    } finally {
      setRefreshingStatus(false);
    }
  };

  const handleRefreshReconciliation = async () => {
    if (!payment || refreshingStatus || refreshingRecon) return;
    if (payment.status !== 'succeeded') {
      setOperationError('Only succeeded payments can be reconciled against Cashfree settlements.');
      return;
    }
    setRefreshingRecon(true);
    setOperationSuccess(null);
    setOperationError(null);
    try {
      const res = await fetch(`/api/v1/admin/payments/${encodeURIComponent(payment.id)}/refresh-reconciliation`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to refresh reconciliation (HTTP ${res.status})`);
      }
      if (json.data) {
        setPayment(json.data);
      }
      setOperationSuccess(json.message || 'Reconciliation refreshed successfully from Cashfree.');
    } catch (err: any) {
      setOperationError(err.message || 'Failed to refresh settlement reconciliation.');
    } finally {
      setRefreshingRecon(false);
    }
  };

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

  const getReconBadge = (state: string) => {
    switch (state) {
      case 'MATCHED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'PENDING_SETTLEMENT':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'UNMATCHED':
      case 'DISCREPANCY':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  };

  // Loading Skeleton
  if (loading && !payment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-5 bg-slate-800 rounded animate-pulse" />
            <div className="w-32 h-3 bg-slate-850 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-44 bg-[#0F172A] rounded-2xl border border-slate-800/80 animate-pulse" />
            <div className="h-44 bg-[#0F172A] rounded-2xl border border-slate-800/80 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-44 bg-[#0F172A] rounded-2xl border border-slate-800/80 animate-pulse" />
            <div className="h-44 bg-[#0F172A] rounded-2xl border border-slate-800/80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !payment) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Payment Record Unavailable</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigateAdmin('/payments')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Payments
          </button>
          <button
            onClick={fetchPaymentDetail}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const isProd = payment.environment.toLowerCase() === 'production';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="space-y-1">
          <button
            onClick={() => navigateAdmin('/payments')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Global Payments Ledger
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 font-mono">
              PAYMENT INVESTIGATION
            </span>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold text-white">{payment.orderId || payment.id}</span>
              <button
                onClick={() => copyToClipboard(payment.orderId || payment.id, 'order_id')}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                title="Copy Order ID"
              >
                {copiedField === 'order_id' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Status badge */}
            <span className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusPill(payment.status)}`}>
              {payment.status}
            </span>

            {/* Environment badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isProd
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              <span className="capitalize">{payment.environment}</span>
            </span>

            {/* Operations / Read-Only Badge */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              {canOperate ? 'Operations Console' : 'Read-Only'}
            </span>
          </div>

          <div className="text-xs text-slate-400 pt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Processed: {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '—'}</span>
          </div>
        </div>

        {/* Amount & Refresh */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-white font-mono tracking-tight">
              {formatINR(payment.amount)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Gross Transaction Volume</div>
          </div>

          <button
            onClick={fetchPaymentDetail}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Summary, Merchant, Customer */}
        <div className="space-y-6">
          {/* 1. Payment Summary Card */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">QivroPay Order ID</span>
                <span className="font-mono text-white font-medium">{payment.orderId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-slate-300">{payment.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gross Amount</span>
                <span className="font-bold text-white font-mono text-sm">{formatINR(payment.amount)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Currency</span>
                <span className="font-mono text-slate-200">{payment.currency}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Status</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusPill(payment.status)}`}>
                  {payment.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-mono text-slate-300 capitalize">{payment.processing?.paymentMethod || 'Cashfree'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Environment</span>
                <span className="capitalize text-slate-200 font-medium">{payment.environment}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Timestamp</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Merchant / Client Profile Card */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Merchant / Client
              </h3>
              {payment.merchant?.id && (
                <button
                  onClick={() => navigateAdmin(`/clients/${payment.merchant.id}`)}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  View Client 360
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="font-bold text-white text-sm">
                  {payment.merchant?.name || 'Merchant Account'}
                </div>
                {payment.merchant?.company && (
                  <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    {payment.merchant.company}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500" />
                    Merchant Email
                  </span>
                  <span className="text-slate-200 font-mono">{payment.merchant?.email || '—'}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Merchant ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-300 text-[10px]">{payment.merchant?.id}</span>
                    <button
                      onClick={() => copyToClipboard(payment.merchant.id, 'merchant_id')}
                      className="p-1 text-slate-500 hover:text-slate-300"
                      title="Copy Merchant ID"
                    >
                      {copiedField === 'merchant_id' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {payment.merchant?.id && (
                <button
                  onClick={() => navigateAdmin(`/clients/${payment.merchant.id}`)}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Client 360 Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Customer Details Card */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <User className="w-4 h-4 text-purple-400" />
              Customer Information
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Customer Name</span>
                <span className="font-medium text-white">{payment.customer?.name || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Customer Email</span>
                <span className="font-mono text-slate-300">{payment.customer?.email || '—'}</span>
              </div>

              {payment.customer?.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Customer Phone</span>
                  <span className="font-mono text-slate-300">{payment.customer.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Processing Reference, Refund, Settlement, Reconciliation, Support */}
        <div className="space-y-6">
          {/* 4. Cashfree & Processing Reference Card */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Layers className="w-4 h-4 text-cyan-400" />
              Gateway Processing Reference
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Gateway</span>
                <span className="font-semibold text-white uppercase">{payment.processing?.paymentMethod || 'Cashfree'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cashfree Order ID</span>
                <span className="font-mono text-slate-200">{payment.processing?.cfOrderId || payment.orderId || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cashfree Payment ID</span>
                <span className="font-mono text-slate-300">{payment.processing?.cfPaymentId || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gateway Status</span>
                <span className="font-mono text-slate-300">{payment.processing?.gatewayStatus || payment.status}</span>
              </div>

              {payment.processing?.bankReference && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bank Reference (UTR)</span>
                  <span className="font-mono text-slate-200 font-semibold">{payment.processing.bankReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Payment Operations */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Payment Operations
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {payment.orderId}
              </span>
            </div>

            {/* Status & Health Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Authoritative Status</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusPill(payment.status)}`}>
                    {payment.status}
                  </span>
                  {payment.isStale && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/30 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Potentially Stale
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Reconciliation Verdict</div>
                <div className="flex items-center gap-2">
                  {payment.reconciliation ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getReconBadge(payment.reconciliation.state)}`}>
                      {payment.reconciliation.state}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-800 text-slate-400 border-slate-700 font-mono">
                      NOT_RECONCILED
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Last Status Update</div>
                <div className="font-mono text-slate-300 text-[11px]">
                  {payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : (payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '—')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Settlement Status</div>
                <div className="font-mono text-slate-300 text-[11px]">
                  {payment.settlement ? (
                    <span className="text-emerald-400 font-semibold">{payment.settlement.status || 'SETTLED'}</span>
                  ) : (
                    <span className="text-slate-500">Pending settlement</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stale warning banner if applicable */}
            {payment.isStale && payment.staleReason && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold">Staleness Note: </span>
                  {payment.staleReason}
                </div>
              </div>
            )}

            {/* Success / Error Feedback */}
            {operationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{operationSuccess}</span>
                </div>
                <button onClick={() => setOperationSuccess(null)} className="text-emerald-400 hover:text-emerald-200 text-xs font-bold px-1">✕</button>
              </div>
            )}

            {operationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{operationError}</span>
                </div>
                <button onClick={() => setOperationError(null)} className="text-rose-400 hover:text-rose-200 text-xs font-bold px-1">✕</button>
              </div>
            )}

            {/* Operational Controls / Buttons */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleRefreshStatus}
                  disabled={!canOperate || refreshingStatus || refreshingRecon}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 border ${
                    canOperate
                      ? 'bg-blue-600/90 hover:bg-blue-600 text-white border-blue-500/40 shadow-lg shadow-blue-500/10 disabled:opacity-50'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {refreshingStatus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Querying Cashfree Gateway...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Payment Status</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRefreshReconciliation}
                  disabled={!canOperate || payment.status !== 'succeeded' || refreshingStatus || refreshingRecon}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 border ${
                    canOperate && payment.status === 'succeeded'
                      ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-500/40 shadow-lg shadow-emerald-500/10 disabled:opacity-50'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                  title={payment.status !== 'succeeded' ? 'Reconciliation applies only to succeeded payments' : 'Query and reconcile Cashfree settlement status'}
                >
                  {refreshingRecon ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reconciling Settlement...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-3.5 h-3.5" />
                      <span>Refresh Reconciliation</span>
                    </>
                  )}
                </button>
              </div>

              {!canOperate && (
                <div className="text-[11px] text-slate-500 italic pt-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-slate-600" />
                  Payment status & reconciliation operations are restricted to Super Admin and Compliance Officer roles.
                </div>
              )}
            </div>
          </div>

          {/* 6. Refund Information (Read-Only) */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              Refund Information
            </h3>

            {payment.refund && payment.refund.hasRefund ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Refund Status</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-indigo-500/15 text-indigo-400 border-indigo-500/30 font-semibold uppercase">
                    {payment.refund.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Refunded Amount</span>
                  <span className="font-bold text-indigo-300 font-mono text-sm">
                    {formatINR(payment.refund.amount)}
                  </span>
                </div>

                {payment.refund.refundId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Refund Reference ID</span>
                    <span className="font-mono text-slate-300">{payment.refund.refundId}</span>
                  </div>
                )}

                {payment.refund.refundedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Refund Date</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {new Date(payment.refund.refundedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                {payment.refund.note && (
                  <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-medium">Reason/Note: </span>
                    {payment.refund.note}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-500">
                No refund records exist for this payment.
              </div>
            )}
          </div>

          {/* 7. Settlement & Reconciliation Card */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Scale className="w-4 h-4 text-emerald-400" />
              Settlement & Reconciliation
            </h3>

            {/* Reconciliation section */}
            <div className="space-y-2 pb-3 border-b border-slate-800/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reconciliation Verdict</span>
                {payment.reconciliation ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getReconBadge(payment.reconciliation.state)}`}>
                    {payment.reconciliation.state}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-800 text-slate-400 border-slate-700 font-mono">
                    PENDING
                  </span>
                )}
              </div>

              {payment.reconciliation?.discrepancy && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                  <span className="font-semibold text-rose-400">Discrepancy: </span>
                  {payment.reconciliation.discrepancy}
                </div>
              )}

              {payment.reconciliation?.lastCheckedAt && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Last Reconciled</span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    {new Date(payment.reconciliation.lastCheckedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Settlement section */}
            {payment.settlement ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Settlement Status</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold uppercase">
                    {payment.settlement.status || 'SETTLED'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cashfree Settlement ID</span>
                  <span className="font-mono text-slate-300">{payment.settlement.cfSettlementId}</span>
                </div>

                {payment.settlement.settlementUtr && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Settlement UTR</span>
                    <span className="font-mono text-white font-bold">{payment.settlement.settlementUtr}</span>
                  </div>
                )}

                {payment.settlement.settlementType && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Settlement Type</span>
                    <span className="font-mono text-slate-300">{payment.settlement.settlementType}</span>
                  </div>
                )}

                {payment.settlement.settlementProcessedOn && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Processed Date</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {new Date(payment.settlement.settlementProcessedOn).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-500">
                Settlement information is not available for this payment yet.
              </div>
            )}
          </div>

          {/* 8. Related Support Tickets Card */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <LifeBuoy className="w-4 h-4 text-purple-400" />
              Related Support
            </h3>

            {payment.relatedTicket ? (
              <div className="space-y-2.5 text-xs">
                <div className="font-semibold text-white">
                  {payment.relatedTicket.subject}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">{payment.relatedTicket.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold">
                      {payment.relatedTicket.status}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-purple-500/15 text-purple-400 border-purple-500/30 font-semibold">
                      {payment.relatedTicket.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigateAdmin(`/tickets/${payment.relatedTicket!.id}`)}
                  className="w-full mt-2 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold rounded-xl border border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Support Ticket Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-500">
                No related support ticket.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
