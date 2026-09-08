import React, { useEffect, useState } from 'react';
import { navigateAdmin } from '../../utils/adminDomain';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  FileCheck,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  LifeBuoy,
  CreditCard,
  User,
  Activity,
  Layers,
  Info
} from 'lucide-react';

interface Props {
  merchantId: string;
}

interface OnboardingDetailResponse {
  merchant: {
    id: string;
    name: string;
    email: string;
    company: string;
    phone: string | null;
    signupDate: string | null;
    profileStatus: string;
  };
  partner: {
    hasMapping: boolean;
    cfMerchantId: string | null;
    onboardingStatus: string | null;
    activationStatus: string | null;
    transactionAccess: string | null;
    createdAt: string | null;
    lastSyncedAt: string | null;
  };
  kyc: {
    onboardingState: string;
    stateReason: string | null;
    stateTitle: string;
    stateDetail: string;
    stateTone: 'emerald' | 'amber' | 'rose' | 'neutral' | string;
    minKycStatus: string | null;
    fullKycStatus: string | null;
    isMinKycApproved: boolean;
    isFullKycApproved: boolean;
    isPaymentActive: boolean;
  };
  timeline: Array<{
    event: string;
    label: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  relatedTickets: Array<{
    id: string;
    ticketId: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
  }>;
  links: {
    client360: string;
    payments: string;
    tickets: string;
  };
}

export const AdminOnboardingDetailPage: React.FC<Props> = ({ merchantId }) => {
  const { adminUser } = useAdminAuth();
  const [data, setData] = useState<OnboardingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const canSync = adminUser?.role === 'super_admin' || adminUser?.role === 'compliance_officer';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/onboarding/${encodeURIComponent(merchantId)}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error('Merchant onboarding record not found.');
        if (res.status === 403) throw new Error('Access denied: You do not have permission to view onboarding details.');
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse onboarding detail.');
      }
    } catch (err: any) {
      console.error('Failed to load onboarding detail:', err);
      setError(err.message || 'Unable to connect to onboarding service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [merchantId]);

  const handleSyncStatus = async () => {
    if (!canSync || syncing) return;
    setSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch(`/api/v1/admin/onboarding/${encodeURIComponent(merchantId)}/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setSyncNotice({
          type: 'success',
          message: `Authoritative Cashfree status re-synchronized successfully. Resulting state: ${json.data?.onboardingState || 'UPDATED'}.`
        });
        if (json.data?.detail) {
          setData(json.data.detail);
        } else {
          fetchDetail();
        }
      } else {
        setSyncNotice({
          type: 'error',
          message: json.error || 'Failed to synchronize with Cashfree Partner API.'
        });
      }
    } catch (err: any) {
      setSyncNotice({
        type: 'error',
        message: 'Network failure during Cashfree status sync.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStateBadgeColor = (tone: string) => {
    switch (tone) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: string | null) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE' || s === 'MIN_KYC_APPROVED' || s === 'FULL_KYC_APPROVED' || s === 'APPROVED' || s === 'FULL') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (s.includes('PENDING') || s.includes('SUBMITTED') || s === 'CREATED' || s === 'EMAIL VERIFIED') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (s.includes('REJECTED') || s.includes('RESTRICTED') || s === 'SUSPENDED' || s === 'UNKNOWN' || s === 'ERROR_STALE') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateAdmin('/onboarding')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
            <div className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigateAdmin('/onboarding')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Onboarding Queue
        </button>

        <div className="p-8 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-4 max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-800">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Unable to Load Onboarding Detail</h3>
            <p className="text-xs text-rose-300/80 mt-1">{error || 'Record not found'}</p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigateAdmin('/onboarding')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            >
              Return to Queue
            </button>
            <button
              onClick={fetchDetail}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { merchant, partner, kyc, timeline, relatedTickets } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Operational Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateAdmin('/onboarding')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors hover:border-slate-700"
            title="Back to Onboarding Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                {merchant.company || merchant.name}
              </h1>
              <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getStateBadgeColor(kyc.stateTone)}`}>
                {kyc.onboardingState}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Merchant ID:</span>
              <span className="font-mono text-slate-300">{merchant.id}</span>
              <button
                onClick={() => copyToClipboard(merchant.id, 'merchantId')}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Copy Merchant ID"
              >
                {copiedKey === 'merchantId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigateAdmin(`/clients/${merchant.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            Client 360 &rarr;
          </button>

          <button
            onClick={() => navigateAdmin(`/payments?search=${encodeURIComponent(merchant.id)}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            Payments &rarr;
          </button>

          {canSync ? (
            <button
              onClick={handleSyncStatus}
              disabled={syncing || !partner.hasMapping}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              title={!partner.hasMapping ? 'Cannot sync without Cashfree Partner mapping' : 'Synchronize status from Cashfree Partner API'}
            >
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {syncing ? 'Syncing...' : 'Sync Cashfree Status'}
            </button>
          ) : (
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800/60 text-slate-500 text-xs font-medium rounded-xl border border-slate-800 cursor-not-allowed"
              title="Sync requires Super Admin or Compliance Officer role"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Cashfree Status (Restricted)
            </div>
          )}
        </div>
      </div>

      {/* Sync Alert Banner */}
      {syncNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            syncNotice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{syncNotice.message}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-slate-400 hover:text-white text-base leading-none ml-3"
          >
            &times;
          </button>
        </div>
      )}

      {/* Operational State Guidance Hero Banner */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Onboarding State:</span>
              <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-lg border font-bold ${getStateBadgeColor(kyc.stateTone)}`}>
                {kyc.onboardingState}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-white">
              {kyc.stateTitle}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {kyc.stateDetail}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-[11px] text-slate-400 shrink-0">
            <div>
              Last Synced: <span className="text-slate-200 font-medium">{partner.lastSyncedAt ? new Date(partner.lastSyncedAt).toLocaleString() : 'Never Synced'}</span>
            </div>
            <div>
              Partner Status: <span className={`font-semibold ${partner.hasMapping ? 'text-emerald-400' : 'text-amber-400'}`}>{partner.hasMapping ? 'Partner Mapped' : 'Unmapped'}</span>
            </div>
          </div>
        </div>

        {kyc.onboardingState === 'UNKNOWN' && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Contradictory or Unrecognized Provider Data: </span>
              Cashfree returned status combinations that conflict or cannot be safely resolved (Reason: {kyc.stateReason || 'conflicting_fields'}). This state is strictly preserved as UNKNOWN without optimistic assumptions.
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Merchant Account & Business Profile */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Merchant Account Information
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {merchant.profileStatus || 'Configured'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Business / Company Name</label>
                <div className="font-semibold text-white mt-0.5">{merchant.company || '—'}</div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Primary Contact Name</label>
                <div className="font-medium text-slate-200 mt-0.5">{merchant.name || '—'}</div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Registered Email</label>
                <div className="font-mono text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  {merchant.email}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="font-mono text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {merchant.phone || 'Not provided'}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Signup Date</label>
                <div className="text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {merchant.signupDate ? new Date(merchant.signupDate).toLocaleDateString() : '—'}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">QivroPay Merchant ID</label>
                <div className="font-mono text-slate-300 mt-0.5 truncate">{merchant.id}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Cashfree Partner & Payment Access */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Cashfree Partner Integration &amp; Payment Access
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${partner.hasMapping ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {partner.hasMapping ? 'Mapped' : 'Unmapped'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Cashfree Merchant ID</label>
                <div className="font-mono text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <span>{partner.cfMerchantId || '—'}</span>
                  {partner.cfMerchantId && (
                    <button
                      onClick={() => copyToClipboard(partner.cfMerchantId!, 'cfId')}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copy Cashfree Merchant ID"
                    >
                      {copiedKey === 'cfId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Cashfree Onboarding Status</label>
                <div className="mt-0.5">
                  <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(partner.onboardingStatus)}`}>
                    {partner.onboardingStatus || 'NOT_STARTED'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Payment Gateway (PG) Activation</label>
                <div className="mt-0.5">
                  <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getStatusBadge(partner.activationStatus)}`}>
                    {partner.activationStatus || 'PENDING'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Transaction Access Mode</label>
                <div className="mt-0.5">
                  <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border font-medium ${getStatusBadge(partner.transactionAccess)}`}>
                    {partner.transactionAccess || 'RESTRICTED'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Partner Account Created</label>
                <div className="text-slate-300 mt-0.5">
                  {partner.createdAt ? new Date(partner.createdAt).toLocaleString() : '—'}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Last Cashfree Synchronized</label>
                <div className="text-slate-300 mt-0.5">
                  {partner.lastSyncedAt ? new Date(partner.lastSyncedAt).toLocaleString() : 'Never Synced'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Payment Access Separation: </span>
              Payment access is governed authoritatively by Cashfree Embedded PG activation. Minimum KYC approval alone does not imply live transaction access until Cashfree sets PG activation to ACTIVE.
            </div>
          </div>

          {/* Card 3: Truthful KYC Breakdown */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                KYC Verification Status Breakdown
              </h3>
              <span className="text-[10px] text-slate-400">Authoritative Cashfree Data</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Minimum KYC</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getStatusBadge(kyc.minKycStatus)}`}>
                    {kyc.minKycStatus || 'PENDING'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Basic entity verification required by Cashfree for initial account association.
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Status: <span className="font-medium text-slate-300">{kyc.isMinKycApproved ? 'Approved by Cashfree' : 'Not Approved'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Full KYC</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getStatusBadge(kyc.fullKycStatus)}`}>
                    {kyc.fullKycStatus || 'PENDING'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Complete documentation and bank account compliance verification evaluated by Cashfree.
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Status: <span className="font-medium text-slate-300">{kyc.isFullKycApproved ? 'Approved by Cashfree' : 'Pending or Review'}</span>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Data Privacy &amp; Non-Exposure Guarantee
              </div>
              <p className="text-slate-400 leading-relaxed">
                In adherence to data protection standards, QivroPay never stores, displays, or transfers KYC document contents, Aadhaar, PAN, bank account numbers, or authentication secrets. Only authoritative verification statuses reported by Cashfree are monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Timeline & Support Connection */}
        <div className="space-y-6">
          {/* Card 4: Verified Onboarding Timeline */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Verifiable Event Timeline
            </h3>

            {timeline.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No verified milestone timestamps recorded.
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-1">
                    <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-500 text-blue-400 flex items-center justify-center shrink-0 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">{event.label}</div>
                      <p className="text-[11px] text-slate-400">{event.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-500 shrink-0" />
              <span>Only events with actual stored timestamps are displayed.</span>
            </div>
          </div>

          {/* Card 5: Related Support Tickets */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <LifeBuoy className="w-3.5 h-3.5 text-blue-400" />
                Related Support Tickets
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {relatedTickets.length}
              </span>
            </div>

            {relatedTickets.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No support tickets on record for this merchant.
              </div>
            ) : (
              <div className="space-y-2.5">
                {relatedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => navigateAdmin(`/tickets/${ticket.ticketId || ticket.id}`)}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-blue-400 truncate">
                        {ticket.ticketId || ticket.id}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white truncate">
                      {ticket.subject}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                      <span>Priority: <span className="capitalize text-slate-300">{ticket.priority}</span></span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
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
