import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Transaction, 
  Subscription,
  Customer, 
  Discount,
  License,
  UsageMeter,
  ApiKey,
  Webhook,
  Brand,
  Analytics,
  TeamMember,
  AuditLog,
  DashboardTabType,
  CurrentViewType,
  MerchantProfile,
  CashfreePartnerStatus,
  CashfreeSettlement,
  PaymentReconciliation
} from '../types';
import { useAuth } from './AuthContext';

// The app has no real router — this is the entire routing surface. Each
// top-level view maps to a real, bookmarkable URL so the browser Back/
// Forward buttons and page refreshes behave normally (see setCurrentView's
// history.pushState call and the popstate listener below). Only top-level
// views are synced; in-dashboard tab state intentionally stays out of the
// URL to keep this from turning into a full router rewrite.
type ParsedRoute = { view: CurrentViewType; sessionId?: string; authMode?: 'login' | 'signup' };

const parseRouteFromPath = (pathname: string): ParsedRoute | null => {
  const checkoutMatch = pathname.match(/^\/checkout\/([^/]+)/);
  if (checkoutMatch) return { view: 'checkout', sessionId: decodeURIComponent(checkoutMatch[1]) };
  if (pathname === '/docs' || pathname.startsWith('/docs/')) return { view: 'docs' };
  if (pathname === '/privacy') return { view: 'privacy' };
  if (pathname === '/terms') return { view: 'terms' };
  if (pathname === '/login') return { view: 'auth', authMode: 'login' };
  if (pathname === '/signup') return { view: 'auth', authMode: 'signup' };
  if (pathname === '/dashboard') return { view: 'dashboard' };
  if (pathname === '/portal') return { view: 'portal' };
  if (pathname === '/') return { view: 'landing' };
  return null;
};

const pathForView = (view: CurrentViewType, opts?: { sessionId?: string | null; authMode?: 'login' | 'signup' }): string => {
  switch (view) {
    case 'landing': return '/';
    case 'docs': return '/docs';
    case 'privacy': return '/privacy';
    case 'terms': return '/terms';
    case 'auth': return opts?.authMode === 'login' ? '/login' : '/signup';
    case 'dashboard': return '/dashboard';
    case 'portal': return '/portal';
    case 'checkout': return `/checkout/${encodeURIComponent(opts?.sessionId || '')}`;
    default: return '/';
  }
};

interface AppContextType {
  // Navigation
  currentView: CurrentViewType;
  setCurrentView: (view: CurrentViewType, params?: any) => void;
  dashboardTab: DashboardTabType;
  setDashboardTab: (tab: DashboardTabType) => void;
  activeSessionId: string | null;
  portalCustomerEmail: string | null;
  authMode: 'login' | 'signup';
  checkoutReturnTo: 'landing' | 'dashboard';
  isTestMode: boolean;
  setIsTestMode: (val: boolean) => void;
  currentBrand: Brand | null;
  setCurrentBrand: (b: Brand) => void;

  // Data
  products: Product[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  customers: Customer[];
  discounts: Discount[];
  licenses: License[];
  meters: UsageMeter[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  brands: Brand[];
  teamMembers: TeamMember[];
  auditLogs: AuditLog[];
  analytics: Analytics | null;
  loading: boolean;
  merchantProfile: MerchantProfile | null;
  profileLoading: boolean;
  cashfreePartnerStatus: CashfreePartnerStatus | null;
  cashfreePartnerStatusLoading: boolean;
  // Phase 10.8E. True for the one render right after the merchant is sent
  // back here from Cashfree's hosted onboarding link (see the
  // ?cashfreeOnboarding=return handling below) — PaymentSetupTab consumes
  // this once, to run a short bounded status-refresh sequence, then clears
  // it via acknowledgeCashfreeOnboardingReturn() so it never fires again for
  // the same visit.
  cashfreeOnboardingReturnPending: boolean;
  acknowledgeCashfreeOnboardingReturn: () => void;
  // Phase 10.8F. Not fetched on login like cashfreePartnerStatus above —
  // only loaded on demand by the Settlements tab itself, since this data is
  // read-only-vs-Cashfree and not needed anywhere else in the dashboard.
  settlements: CashfreeSettlement[];
  reconciliations: PaymentReconciliation[];
  settlementsLoading: boolean;
  // The real, server-resolved CASHFREE_PARTNER_ENV this settlement data was
  // retrieved under ('sandbox' | 'production') — never guessed client-side.
  settlementsEnvironment: string | null;
  fetchSettlements: () => Promise<void>;
  refreshReconciliation: (orderId?: string) => Promise<{ success: boolean; error?: string }>;

  // Actions
  refreshData: () => Promise<void>;
  saveMerchantProfile: (fields: { businessName: string; supportEmail: string }) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: () => Promise<void>;
  refreshCashfreePartnerStatus: () => Promise<void>;
  startCashfreePartnerOnboarding: (fields: { pocPhone: string; merchantSiteUrl: string }) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  launchCashfreePartnerOnboardingLink: () => Promise<{ success: boolean; error?: string; errorCode?: string; onboardingLink?: string }>;
  createProduct: (product: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  createDiscount: (disc: Partial<Discount>) => Promise<Discount | null>;
  deleteDiscount: (id: string) => Promise<void>;
  generateLicense: (productName: string, customerEmail: string, maxActivations?: number) => Promise<License | null>;
  revokeLicense: (id: string) => Promise<void>;
  trackMeterEvent: (eventName: string, units: number, customerId?: string) => Promise<void>;
  generateApiKey: (name: string, environment: 'live' | 'test') => Promise<ApiKey | null>;
  revokeApiKey: (id: string) => Promise<void>;
  inviteTeamMember: (data: any) => Promise<TeamMember | null>;
  createCheckoutSession: (params: { productId?: string; amount?: number; title?: string; currency?: string; customerEmail?: string }) => Promise<string | null>;
  processPayment: (params: any) => Promise<{ success: boolean; transaction?: Transaction; error?: string }>;
  processRefund: (transactionId: string) => Promise<{ success: boolean; error?: string }>;
  checkRefundStatus: (transactionId: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const initialRoute = typeof window !== 'undefined' ? parseRouteFromPath(window.location.pathname) : null;
  const savedView = typeof window !== 'undefined' ? window.localStorage.getItem('qivropay_last_view') : null;
  const initialView: CurrentViewType = initialRoute?.view ?? (savedView === 'dashboard' ? 'dashboard' : 'landing');
  const [currentView, setCurrentViewInternal] = useState<CurrentViewType>(initialView);
  const [dashboardTab, setDashboardTab] = useState<DashboardTabType>('home');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialRoute?.sessionId ?? null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialRoute?.authMode ?? 'signup');
  const [checkoutReturnTo, setCheckoutReturnTo] = useState<'landing' | 'dashboard'>('landing');
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [meters, setMeters] = useState<UsageMeter[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [cashfreePartnerStatus, setCashfreePartnerStatus] = useState<CashfreePartnerStatus | null>(null);
  const [cashfreePartnerStatusLoading, setCashfreePartnerStatusLoading] = useState<boolean>(true);
  const [cashfreeOnboardingReturnPending, setCashfreeOnboardingReturnPending] = useState<boolean>(false);
  const [settlements, setSettlements] = useState<CashfreeSettlement[]>([]);
  const [reconciliations, setReconciliations] = useState<PaymentReconciliation[]>([]);
  const [settlementsLoading, setSettlementsLoading] = useState<boolean>(false);
  const [settlementsEnvironment, setSettlementsEnvironment] = useState<string | null>(null);
  // The customer identity the billing portal is currently scoped to — set
  // only from a real, just-completed transaction (see HostedCheckout's
  // "Open Customer Billing Portal" button). Never a hardcoded placeholder.
  const [portalCustomerEmail, setPortalCustomerEmail] = useState<string | null>(null);

  const setCurrentView = (view: CurrentViewType, params?: any) => {
    if (view === 'checkout' && params?.sessionId) {
      setActiveSessionId(params.sessionId);
    }
    if (view === 'checkout') {
      // Where "Return home" / "Cancel" inside checkout should go — 'dashboard'
      // when a merchant opened this as a preview from their own product/link,
      // 'landing' (default) for a real customer-facing checkout link.
      setCheckoutReturnTo(params?.returnTo === 'dashboard' ? 'dashboard' : 'landing');
    }
    if (view === 'dashboard' && params?.tab) {
      setDashboardTab(params.tab);
    }
    if (view === 'portal' && params?.customerEmail) {
      setPortalCustomerEmail(params.customerEmail);
    }
    if (view === 'auth' && params?.mode) {
      setAuthMode(params.mode);
    }
    setCurrentViewInternal(view);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('qivropay_last_view', view);
      const path = pathForView(view, { sessionId: params?.sessionId ?? activeSessionId, authMode: params?.mode ?? authMode });
      if (window.location.pathname !== path) {
        window.history.pushState({ qivropayView: view }, '', path);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keeps the app in sync with real browser Back/Forward navigation between
  // top-level views, without fighting or overriding history — this only
  // reads the URL the browser already navigated to and mirrors it into
  // state; it never itself calls pushState/back/forward.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const route = parseRouteFromPath(window.location.pathname);
      if (!route) return;
      if (route.sessionId) setActiveSessionId(route.sessionId);
      if (route.authMode) setAuthMode(route.authMode);
      setCurrentViewInternal(route.view);
      window.localStorage.setItem('qivropay_last_view', route.view);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Phase 10.8E. Cashfree's embeddable onboarding link (opened in a new tab —
  // see PaymentSetupTab) sends the merchant back to
  // /dashboard?cashfreeOnboarding=return (return_url is computed server-side
  // in POST /api/v1/merchant/cashfree-partner/onboarding-link). This only
  // reads that query string once on load and flags it via
  // cashfreeOnboardingReturnPending — it does not affect the top-level view
  // routing above (the path is still plain "/dashboard"), and the flag/query
  // string are cleared immediately via replaceState so a manual page refresh
  // afterward does not re-trigger the bounded status-poll this flag exists
  // to drive.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('cashfreeOnboarding') !== 'return') return;
    setDashboardTab('verification');
    setCashfreeOnboardingReturnPending(true);
    params.delete('cashfreeOnboarding');
    const search = params.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
  }, []);

  const acknowledgeCashfreeOnboardingReturn = () => setCashfreeOnboardingReturnPending(false);

  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const refreshData = async () => {
    try {
      const [
        prods, txs, subs, custs, discs,
        lics, mtrs, keys, whs, brs,
        team, audit, anal
      ] = await Promise.all([
        safeFetch('/api/v1/products'),
        safeFetch('/api/v1/transactions'),
        safeFetch('/api/v1/subscriptions'),
        safeFetch('/api/v1/customers'),
        safeFetch('/api/v1/discounts'),
        safeFetch('/api/v1/licenses'),
        safeFetch('/api/v1/meters'),
        safeFetch('/api/v1/keys'),
        safeFetch('/api/v1/webhooks'),
        safeFetch('/api/v1/brands'),
        safeFetch('/api/v1/team'),
        safeFetch('/api/v1/audit-logs'),
        safeFetch('/api/v1/analytics')
      ]);

      if (prods && prods.success && Array.isArray(prods.products)) setProducts(prods.products);
      if (txs && txs.success && Array.isArray(txs.transactions)) setTransactions(txs.transactions);
      if (subs && subs.success && Array.isArray(subs.subscriptions)) setSubscriptions(subs.subscriptions);
      if (custs && custs.success && Array.isArray(custs.customers)) setCustomers(custs.customers);
      if (discs && discs.success && Array.isArray(discs.discounts)) setDiscounts(discs.discounts);
      if (lics && lics.success && Array.isArray(lics.licenses)) setLicenses(lics.licenses);
      if (mtrs && mtrs.success && Array.isArray(mtrs.meters)) setMeters(mtrs.meters);
      if (keys && keys.success && Array.isArray(keys.apiKeys)) setApiKeys(keys.apiKeys);
      if (whs && whs.success && Array.isArray(whs.webhooks)) setWebhooks(whs.webhooks);
      if (team && team.success && Array.isArray(team.teamMembers)) setTeamMembers(team.teamMembers);
      if (audit && audit.success && Array.isArray(audit.auditLogs)) setAuditLogs(audit.auditLogs);
      if (brs && brs.success && Array.isArray(brs.brands)) {
        setBrands(brs.brands);
        if (!currentBrand && brs.brands.length > 0) {
          setCurrentBrand(brs.brands[0]);
        }
      }
      if (anal && anal.success && anal.analytics) setAnalytics(anal.analytics);
    } catch (err) {
      console.warn('Data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchantProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await safeFetch('/api/v1/merchant/profile');
      if (data && data.success && data.profile) setMerchantProfile(data.profile);
      else setMerchantProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    if (user) { fetchMerchantProfile(); fetchCashfreePartnerStatus(); }
    else { setMerchantProfile(null); setProfileLoading(false); setCashfreePartnerStatus(null); setCashfreePartnerStatusLoading(false); }
  }, [user?.id]);

  const saveMerchantProfile = async (fields: { businessName: string; supportEmail: string }) => {
    try {
      const res = await fetch('/api/v1/merchant/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (!res.ok || !data.success) return { success: false, error: data?.error || 'Could not save your details. Please try again.' };
      setMerchantProfile(data.profile);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const completeOnboarding = async () => {
    try {
      const res = await fetch('/api/v1/merchant/onboarding/complete', { method: 'POST' });
      const data = await res.json();
      if (data?.success && data.profile) setMerchantProfile(data.profile);
    } catch (err) {
      console.error('Failed to complete onboarding', err);
    }
  };

  // Phase 10.8D. Normalizes the two response shapes
  // GET /api/v1/merchant/cashfree-partner-status and
  // POST /api/v1/merchant/cashfree-partner/onboard can return (a flat
  // success body, or a { stale: true, lastKnownStatus, error } body when
  // Cashfree could not be reached) into one flat CashfreePartnerStatus —
  // never inventing a value for a field the server didn't actually send.
  const normalizeCashfreePartnerStatus = (data: any): CashfreePartnerStatus => {
    if (!data?.started) {
      return { started: false, stale: false, cfMerchantId: null, onboardingStatus: null, kycStatus: null, fullKycStatus: null, activationStatus: null, transactionAccess: null, updatedAt: null, errorMessage: null };
    }
    const source = data.stale ? data.lastKnownStatus : data;
    return {
      started: true,
      stale: Boolean(data.stale),
      cfMerchantId: source?.cfMerchantId ?? null,
      onboardingStatus: source?.onboardingStatus ?? null,
      kycStatus: source?.kycStatus ?? null,
      fullKycStatus: source?.fullKycStatus ?? null,
      activationStatus: source?.activationStatus ?? null,
      transactionAccess: source?.transactionAccess ?? null,
      updatedAt: source?.updatedAt ?? null,
      errorMessage: data.error?.message ?? null
    };
  };

  const fetchCashfreePartnerStatus = async () => {
    setCashfreePartnerStatusLoading(true);
    try {
      const data = await safeFetch('/api/v1/merchant/cashfree-partner-status');
      setCashfreePartnerStatus(data ? normalizeCashfreePartnerStatus(data) : null);
    } finally {
      setCashfreePartnerStatusLoading(false);
    }
  };

  const refreshCashfreePartnerStatus = async () => {
    await fetchCashfreePartnerStatus();
  };

  // Phase 10.8E error mapping: 400s are QivroPay's own validation messages
  // (safe to show as-is), 409s are QivroPay's own conflict messages (also
  // safe — "already in progress" / "could not be safely resolved", never raw
  // Cashfree text), and a 502 is Cashfree itself failing — that one always
  // gets a canned, non-raw message rather than forwarding whatever Cashfree
  // said (see server/index.js's onboard route for the exact status/errorCode
  // shapes this reads).
  const startCashfreePartnerOnboarding = async (fields: { pocPhone: string; merchantSiteUrl: string }) => {
    try {
      const res = await fetch('/api/v1/merchant/cashfree-partner/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 502) {
          return { success: false, errorCode: data?.errorCode, error: 'Cashfree payment onboarding is temporarily unavailable. Your existing setup has not been changed. Please try again.' };
        }
        return { success: false, errorCode: data?.errorCode, error: data?.error || 'Could not start Cashfree payment setup. Please try again.' };
      }
      setCashfreePartnerStatus(normalizeCashfreePartnerStatus(data));
      // Belt-and-suspenders beyond trusting this response body: re-fetch the
      // authoritative status route right after a successful creation, the
      // same "refresh authoritative Cashfree status" step section 5 of the
      // Phase 10.8E spec calls for. fetchCashfreePartnerStatus briefly
      // toggles cashfreePartnerStatusLoading, which PaymentSetupTab already
      // renders a loading state for, so this does not race visibly with the
      // setCashfreePartnerStatus call just above.
      fetchCashfreePartnerStatus();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const launchCashfreePartnerOnboardingLink = async () => {
    try {
      const res = await fetch('/api/v1/merchant/cashfree-partner/onboarding-link', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        const errorCode = data?.error?.code as string | undefined;
        return {
          success: false,
          errorCode,
          error: errorCode === 'feature_not_enabled'
            ? 'Verification is temporarily unavailable for this account. Payment onboarding has been created, but Cashfree verification needs to be enabled.'
            : 'Cashfree verification is temporarily unavailable right now. Please try again shortly.'
        };
      }
      if (!data?.success) return { success: false, error: 'Could not open Cashfree verification right now. Please try again.' };
      if (!data.started) return { success: false, error: 'Payment setup has not been created yet — start payment setup first.' };
      if (!data.link?.onboardingLink) return { success: false, error: 'Cashfree did not return a verification link.' };
      return { success: true, onboardingLink: data.link.onboardingLink as string };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Phase 10.8F. Loads both lists together — the Settlements tab always
  // needs both, and this is only ever called on-demand (tab mount / manual
  // refresh), never on a timer.
  const fetchSettlements = async () => {
    setSettlementsLoading(true);
    try {
      const [settlementsData, reconciliationData] = await Promise.all([
        safeFetch('/api/v1/merchant/settlements'),
        safeFetch('/api/v1/merchant/reconciliation')
      ]);
      setSettlements(settlementsData?.success ? settlementsData.settlements : []);
      setReconciliations(reconciliationData?.success ? reconciliationData.reconciliations : []);
      setSettlementsEnvironment(settlementsData?.environment ?? reconciliationData?.environment ?? null);
    } finally {
      setSettlementsLoading(false);
    }
  };

  // orderId omitted reconciles the merchant's recent succeeded payments
  // (bounded server-side); a specific orderId reconciles just that payment.
  // Always re-fetches both lists afterward so the screen reflects whatever
  // is now actually stored, not just what this one call returned.
  const refreshReconciliation = async (orderId?: string) => {
    try {
      const res = await fetch('/api/v1/merchant/reconciliation/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderId ? { orderId } : {})
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Could not refresh settlement data right now. Please try again.' };
      }
      // Uses this response's own reconciliation objects directly, rather
      // than discarding them and re-fetching GET /reconciliation — a
      // refresh that hit a Cashfree failure but had a last-known state to
      // fall back on returns stale:true/error here (see
      // paymentReconciliation.js reconcilePayment()), which is never
      // persisted back to the store (that would overwrite a real prior
      // result with a failure), so a plain re-fetch would silently lose
      // that "this refresh attempt itself failed" signal.
      const fresh: PaymentReconciliation[] = Array.isArray(data.reconciliations) ? data.reconciliations : [];
      setReconciliations((prev) => {
        const byOrderId = new Map(prev.map((r) => [r.orderId, r]));
        fresh.forEach((r) => byOrderId.set(r.orderId, r));
        return Array.from(byOrderId.values());
      });
      // Settlement rows themselves (distinct cf_settlement_ids) can only
      // grow from a refresh, so a plain re-fetch of that list is safe.
      const settlementsData = await safeFetch('/api/v1/merchant/settlements');
      if (settlementsData?.success) {
        setSettlements(settlementsData.settlements);
        setSettlementsEnvironment(settlementsData.environment ?? null);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const createProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return data.product;
      }
    } catch (err) {
      console.error('Failed to create product', err);
    }
    return null;
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      await fetch('/api/v1/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to cancel subscription', err);
    }
  };

  const createDiscount = async (discData: Partial<Discount>) => {
    try {
      const res = await fetch('/api/v1/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discData)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return data.discount;
      }
    } catch (err) {
      console.error('Failed to create discount', err);
    }
    return null;
  };

  const deleteDiscount = async (id: string) => {
    try {
      await fetch(`/api/v1/discounts/${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (err) {
      console.error('Failed to delete discount', err);
    }
  };

  const generateLicense = async (productName: string, customerEmail: string, maxActivations = 3) => {
    try {
      const res = await fetch('/api/v1/licenses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, customerEmail, maxActivations })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return data.license;
      }
    } catch (err) {
      console.error('Failed to generate license', err);
    }
    return null;
  };

  const revokeLicense = async (licenseId: string) => {
    try {
      await fetch('/api/v1/licenses/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to revoke license', err);
    }
  };

  const trackMeterEvent = async (eventName: string, units: number, customerId?: string) => {
    try {
      await fetch('/api/v1/meters/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, units, customerId })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to track meter', err);
    }
  };

  const generateApiKey = async (name: string, environment: 'live' | 'test') => {
    try {
      const res = await fetch('/api/v1/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, environment })
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => [{ ...data.apiKey }, ...prev]);
        return data.apiKey;
      }
    } catch (err) {
      console.error('Failed to generate API key', err);
    }
    return null;
  };

  const revokeApiKey = async (id: string) => {
    try {
      await fetch(`/api/v1/keys/${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (err) {
      console.error('Failed to revoke key', err);
    }
  };

  const createCheckoutSession = async (params: { productId?: string; amount?: number; title?: string; currency?: string; customerEmail?: string }) => {
    try {
      const res = await fetch('/api/v1/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success) {
        return data.sessionId;
      }
      if (data.errorCode === 'LIVE_PAYMENTS_NOT_ACTIVATED') {
        alert(data.error);
      } else {
        console.error('Failed to create checkout session:', data.error);
      }
    } catch (err) {
      console.error('Failed to create session', err);
    }
    return null;
  };

  const processPayment = async (params: any) => {
    try {
      const res = await fetch('/api/v1/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true, transaction: data.transaction };
      }
      return { success: false, error: data.error || 'Payment failed' };
    } catch (err) {
      return { success: false, error: 'Network error processing payment' };
    }
  };

  const processRefund = async (transactionId: string) => {
    try {
      const res = await fetch('/api/v1/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || 'Refund failed' };
    } catch (err) {
      return { success: false, error: 'Network error processing refund' };
    }
  };

  const checkRefundStatus = async (transactionId: string) => {
    try {
      const res = await fetch(`/api/v1/payments/refund-status/${encodeURIComponent(transactionId)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.reconciled) await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || 'Could not check refund status' };
    } catch (err) {
      return { success: false, error: 'Network error checking refund status' };
    }
  };

  const inviteTeamMember = async (data: any) => {
    try {
      const res = await fetch('/api/v1/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        return json.member;
      }
    } catch (err) {
      console.error('Failed to invite team member', err);
    }
    return null;
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        dashboardTab,
        setDashboardTab,
        activeSessionId,
        portalCustomerEmail,
        authMode,
        checkoutReturnTo,
        isTestMode,
        setIsTestMode,
        currentBrand,
        setCurrentBrand,
        products,
        transactions,
        subscriptions,
        customers,
        discounts,
        licenses,
        meters,
        apiKeys,
        webhooks,
        brands,
        teamMembers,
        auditLogs,
        analytics,
        loading,
        merchantProfile,
        profileLoading,
        cashfreePartnerStatus,
        cashfreePartnerStatusLoading,
        cashfreeOnboardingReturnPending,
        acknowledgeCashfreeOnboardingReturn,
        settlements,
        reconciliations,
        settlementsLoading,
        settlementsEnvironment,
        fetchSettlements,
        refreshReconciliation,
        refreshData,
        saveMerchantProfile,
        completeOnboarding,
        refreshCashfreePartnerStatus,
        startCashfreePartnerOnboarding,
        launchCashfreePartnerOnboardingLink,
        createProduct,
        deleteProduct,
        cancelSubscription,
        createDiscount,
        deleteDiscount,
        generateLicense,
        revokeLicense,
        trackMeterEvent,
        generateApiKey,
        revokeApiKey,
        inviteTeamMember,
        createCheckoutSession,
        processPayment,
        processRefund,
        checkRefundStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
