import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { deriveOnboardingState, describeOnboardingState } from '../../lib/cashfreeOnboardingState';
import type { OnboardingState } from '../../lib/cashfreeOnboardingState';
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Clock,
  XCircle,
  HelpCircle,
  Circle,
  Settings as SettingsIcon
} from 'lucide-react';

// Phase 10.8E. This screen stays as conservative about what it claims as
// Phase 10.8D was: the state machine driving it (src/lib/cashfreeOnboardingState.js)
// only ever reads Cashfree's documented onboarding_status/kyc_status fields
// literally, and treats the undocumented full_kyc_status/activation_status/
// transaction_access fields the same way — never inventing a meaning
// Cashfree hasn't itself spelled out. Whether payment functionality is
// actually available is governed entirely by QivroPay's own separate
// live-activation gate (server/index.js requireLiveActivationIfProduction) —
// this screen never claims otherwise, no matter what Cashfree's own
// "ACTIVE"/"full" fields say.
const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100',
  amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200',
  rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
};

const TONE_ICON: Record<string, React.ElementType> = {
  neutral: HelpCircle,
  amber: Clock,
  emerald: CheckCircle2,
  rose: XCircle
};

type StepStatus = 'pending' | 'active' | 'done' | 'attention';

const STEP_BADGE: Record<StepStatus, { label: string; className: string; Icon: React.ElementType }> = {
  pending: { label: 'Not started', className: 'text-[#8C90A0] bg-slate-100', Icon: Circle },
  active: { label: 'In progress', className: 'text-amber-700 bg-amber-50', Icon: Clock },
  done: { label: 'Complete', className: 'text-emerald-700 bg-emerald-50', Icon: CheckCircle2 },
  attention: { label: 'Needs attention', className: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30', Icon: XCircle }
};

function ProgressStep({ label, status }: { label: string; status: StepStatus }) {
  const badge = STEP_BADGE[status];
  const Icon = badge.Icon;
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs font-semibold text-[#0A0D14]">{label}</span>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    </div>
  );
}

export const PaymentSetupTab: React.FC = () => {
  const {
    merchantProfile,
    cashfreePartnerStatus,
    cashfreePartnerStatusLoading,
    refreshCashfreePartnerStatus,
    startCashfreePartnerOnboarding,
    launchCashfreePartnerOnboardingLink,
    cashfreeOnboardingReturnPending,
    acknowledgeCashfreeOnboardingReturn,
    setDashboardTab
  } = useApp();
  const { user } = useAuth();

  const [pocPhone, setPocPhone] = useState('');
  const [merchantSiteUrl, setMerchantSiteUrl] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const derived = useMemo(() => deriveOnboardingState(cashfreePartnerStatus), [cashfreePartnerStatus]);
  const copy = useMemo(() => describeOnboardingState(derived), [derived]);
  const { state, raw } = derived;

  // Phase 10.8E — bounded status-refresh sequence after returning from
  // Cashfree's hosted onboarding link (AppContext detects
  // ?cashfreeOnboarding=return and sets cashfreeOnboardingReturnPending).
  // Exactly 4 refreshes, front-loaded, then stops — never indefinite
  // polling, and it only ever runs once per return trip since
  // acknowledgeCashfreeOnboardingReturn() clears the flag afterward.
  const [polling, setPolling] = useState(false);
  useEffect(() => {
    if (!cashfreeOnboardingReturnPending) return;
    let cancelled = false;
    setPolling(true);
    const delays = [0, 3000, 6000, 12000];
    (async () => {
      for (const delay of delays) {
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
        if (cancelled) return;
        await refreshCashfreePartnerStatus();
      }
      if (!cancelled) {
        setPolling(false);
        acknowledgeCashfreeOnboardingReturn();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashfreeOnboardingReturnPending]);

  const businessName = (merchantProfile?.businessName || user?.company || '').trim();
  const profileReady = Boolean(businessName);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (starting) return;
    setStartError('');
    if (!/^[0-9+\-\s()]{7,20}$/.test(pocPhone.trim())) { setStartError('Enter a valid contact phone number'); return; }
    if (!/^https?:\/\/\S+\.\S+/i.test(merchantSiteUrl.trim())) { setStartError('Enter a valid business website URL, including https://'); return; }
    setStarting(true);
    const result = await startCashfreePartnerOnboarding({ pocPhone: pocPhone.trim(), merchantSiteUrl: merchantSiteUrl.trim() });
    setStarting(false);
    if (!result.success) {
      setStartError(result.error || 'Could not start payment setup. Please try again.');
      // A 409 here means either a creation attempt is already mid-flight, or
      // an earlier attempt already succeeded elsewhere — refresh so the
      // screen reflects whatever is actually true rather than staying on a
      // stale "not started" view.
      if (result.errorCode === 'creation_in_progress' || result.errorCode === 'unresolved_conflict') {
        refreshCashfreePartnerStatus();
      }
    }
  };

  const handleLaunch = async () => {
    if (launching) return;
    setLaunchError('');
    setLaunching(true);
    const result = await launchCashfreePartnerOnboardingLink();
    setLaunching(false);
    if (!result.success || !result.onboardingLink) {
      setLaunchError(result.error || 'Could not open Cashfree verification right now. Please try again.');
      return;
    }
    // Opened in a new tab, not an iframe: Cashfree documents this link as
    // embeddable, but embedding third-party KYC forms cross-origin has
    // framing/cookie behavior this integration has not verified end-to-end
    // (see the Phase 10.8D report — unchanged in 10.8E). A new tab keeps the
    // merchant inside a real Cashfree-hosted page for the sensitive KYC
    // step; Cashfree's own return_url brings them back here afterward and
    // the bounded refresh sequence above picks up the new status.
    window.open(result.onboardingLink, '_blank', 'noopener');
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await refreshCashfreePartnerStatus();
    setRefreshing(false);
  };

  if (cashfreePartnerStatusLoading) {
    return <div className="max-w-3xl font-sans text-sm text-[#8C90A0]">Loading payment setup status…</div>;
  }

  const tone = copy.tone;
  const ToneIcon = TONE_ICON[tone];
  const canLaunchVerification = raw.started && state !== 'ACTIVE' && state !== 'ERROR_STALE';

  const businessStep: StepStatus = profileReady ? 'done' : 'attention';
  const accountStep: StepStatus = raw.started ? 'done' : 'pending';
  const verificationStep: StepStatus = !raw.started
    ? 'pending'
    : state === 'MIN_KYC_REJECTED' || (state === 'UNKNOWN' && derived.reason === 'conflicting_fields')
    ? 'attention'
    : (['MIN_KYC_APPROVED', 'FULL_KYC_PENDING', 'ACTIVE', 'ACCESS_RESTRICTED'] as OnboardingState[]).includes(state)
    ? 'done'
    : 'active';
  const accessStep: StepStatus = state === 'ACTIVE' ? 'done' : state === 'ACCESS_RESTRICTED' ? 'attention' : 'pending';

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl font-sans">
      <div>
        <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#0055FF]" />
          <span>Set Up Payments</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#8C90A0]">
          Complete your payment setup to start accepting payments. QivroPay uses Cashfree to verify your business and enable payment collection — this is separate from your QivroPay account and store profile.
        </p>
      </div>

      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 divide-y divide-black/[0.06] border border-black/[0.06] rounded-2xl px-4">
          <ProgressStep label="Business details" status={businessStep} />
          <ProgressStep label="Payment account" status={accountStep} />
          <ProgressStep label="Verification" status={verificationStep} />
          <ProgressStep label="Payment access" status={accessStep} />
        </div>

        {!profileReady ? (
          <div className={`p-4 rounded-2xl border ${TONE_CLASSES.rose}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <div className="font-bold text-sm">Add your business details</div>
                <div className="text-xs leading-relaxed opacity-90">Add your business name before starting payment setup.</div>
                <button
                  type="button"
                  onClick={() => setDashboardTab('settings')}
                  className="opp-btn-primary px-4 py-2 text-xs gap-2 inline-flex items-center"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  Update business details
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-2xl border ${TONE_CLASSES[tone]}`}>
              <div className="flex items-start gap-3">
                <ToneIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm">{copy.title}</div>
                  <div className="text-xs leading-relaxed opacity-90">{copy.detail}</div>
                  {state === 'ERROR_STALE' && (
                    <div className="text-xs font-semibold mt-2">
                      Could not reach Cashfree just now — showing the last known status{raw.updatedAt ? ` as of ${new Date(raw.updatedAt).toLocaleString()}` : ''}.
                      {raw.errorMessage && <span className="block font-normal opacity-80 mt-1">{raw.errorMessage}</span>}
                    </div>
                  )}
                  {polling && (
                    <div className="text-xs font-semibold mt-2 flex items-center gap-1.5 opacity-80">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Checking for updates after verification…
                    </div>
                  )}
                </div>
              </div>
            </div>

            {raw.started && (raw.fullKycStatus || raw.activationStatus || raw.transactionAccess || (state === 'UNKNOWN' && raw.kycStatus)) && (
              <div className="text-xs text-[#8C90A0] border border-black/[0.06] rounded-xl p-3 space-y-1">
                <div className="font-semibold text-[#0A0D14]">Additional details reported by Cashfree</div>
                <div className="opacity-80">These fields are not part of Cashfree's published API reference — shown exactly as reported, without an implied meaning.</div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 font-mono">
                  {raw.onboardingStatus && <span>onboarding_status: {raw.onboardingStatus}</span>}
                  {raw.kycStatus && <span>kyc_status: {raw.kycStatus}</span>}
                  {raw.fullKycStatus && <span>full_kyc_status: {raw.fullKycStatus}</span>}
                  {raw.activationStatus && <span>activation_status: {raw.activationStatus}</span>}
                  {raw.transactionAccess && <span>transaction_access: {raw.transactionAccess}</span>}
                </div>
              </div>
            )}

            {!raw.started && (
              <form onSubmit={handleStart} className="space-y-4 pt-2 border-t border-black/[0.06]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label htmlFor="poc-phone" className="font-semibold text-[#0A0D14]">Contact phone number</label>
                    <input
                      id="poc-phone"
                      type="tel"
                      value={pocPhone}
                      onChange={(e) => setPocPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="site-url" className="font-semibold text-[#0A0D14]">Business website URL</label>
                    <input
                      id="site-url"
                      type="url"
                      value={merchantSiteUrl}
                      onChange={(e) => setMerchantSiteUrl(e.target.value)}
                      placeholder="https://yourbusiness.com"
                      className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#8C90A0]">Sent to Cashfree, our verification partner, to create your merchant account. Your business name ({businessName}) and email ({user?.email}) come from your QivroPay account.</p>
                {startError && <p role="alert" className="text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{startError}</p>}
                <div className="flex justify-end">
                  <button type="submit" disabled={starting} className="opp-btn-primary px-6 py-2.5 text-xs disabled:opacity-50">
                    {starting ? 'Starting…' : copy.action || 'Start payment setup'}
                  </button>
                </div>
              </form>
            )}

            {raw.started && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-black/[0.06]">
                {canLaunchVerification && (
                  <button type="button" onClick={handleLaunch} disabled={launching} className="opp-btn-primary px-5 py-2.5 text-xs gap-2 disabled:opacity-50">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{launching ? 'Opening…' : copy.action || 'Continue verification'}</span>
                  </button>
                )}
                <button type="button" onClick={handleRefresh} disabled={refreshing} className="opp-btn-secondary px-5 py-2.5 text-xs gap-2 disabled:opacity-50">
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing…' : 'Refresh status'}</span>
                </button>
              </div>
            )}

            {launchError && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {launchError}
              </p>
            )}
          </>
        )}
      </div>

      <p className="text-[11px] text-[#8C90A0] max-w-xl">
        This screen tracks your Cashfree merchant verification status. Whether payment collection is actually enabled on your QivroPay account is determined separately by QivroPay, and is not automatically granted by Cashfree reporting full transaction access here.
      </p>
    </div>
  );
};
