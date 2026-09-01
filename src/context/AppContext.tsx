import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Transaction, 
  Subscription,
  Customer, 
  Discount,
  License,
  Payout,
  UsageMeter,
  ApiKey, 
  Webhook, 
  Brand,
  Analytics, 
  Affiliate,
  AgentWallet,
  TeamMember,
  AuditLog,
  DashboardTabType,
  CurrentViewType 
} from '../types';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Navigation
  currentView: CurrentViewType;
  setCurrentView: (view: CurrentViewType, params?: any) => void;
  dashboardTab: DashboardTabType;
  setDashboardTab: (tab: DashboardTabType) => void;
  activeSessionId: string | null;
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
  payouts: Payout[];
  meters: UsageMeter[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  brands: Brand[];
  affiliates: Affiliate[];
  agentWallets: AgentWallet[];
  teamMembers: TeamMember[];
  auditLogs: AuditLog[];
  analytics: Analytics | null;
  loading: boolean;

  // Actions
  refreshData: () => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  createDiscount: (disc: Partial<Discount>) => Promise<Discount | null>;
  deleteDiscount: (id: string) => Promise<void>;
  generateLicense: (productName: string, customerEmail: string, maxActivations?: number) => Promise<License | null>;
  revokeLicense: (id: string) => Promise<void>;
  requestPayout: (amount: number) => Promise<Payout | null>;
  trackMeterEvent: (eventName: string, units: number, customerId?: string) => Promise<void>;
  generateApiKey: (name: string, environment: 'live' | 'test') => Promise<ApiKey | null>;
  revokeApiKey: (id: string) => Promise<void>;
  createAffiliate: (data: any) => Promise<Affiliate | null>;
  settleAffiliatePayout: (id: string) => Promise<void>;
  createAgentWallet: (data: any) => Promise<AgentWallet | null>;
  topupAgentWallet: (id: string, amount: number) => Promise<void>;
  inviteTeamMember: (data: any) => Promise<TeamMember | null>;
  createCheckoutSession: (params: { productId?: string; amount?: number; title?: string; currency?: string; customerEmail?: string }) => Promise<string | null>;
  processPayment: (params: any) => Promise<{ success: boolean; transaction?: Transaction; error?: string }>;
  processRefund: (transactionId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const initialCheckoutId = typeof window !== 'undefined' ? window.location.pathname.match(/^\/checkout\/([^/]+)/)?.[1] : null;
  const savedView = typeof window !== 'undefined' ? window.localStorage.getItem('qivropay_last_view') : null;
  const [currentView, setCurrentViewInternal] = useState<CurrentViewType>(initialCheckoutId ? 'checkout' : savedView === 'dashboard' ? 'dashboard' : 'landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTabType>('home');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialCheckoutId ? decodeURIComponent(initialCheckoutId) : null);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [meters, setMeters] = useState<UsageMeter[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [agentWallets, setAgentWallets] = useState<AgentWallet[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setCurrentView = (view: CurrentViewType, params?: any) => {
    if (view === 'checkout' && params?.sessionId) {
      setActiveSessionId(params.sessionId);
    }
    if (view === 'dashboard' && params?.tab) {
      setDashboardTab(params.tab);
    }
    setCurrentViewInternal(view);
    if (typeof window !== 'undefined') window.localStorage.setItem('qivropay_last_view', view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshData = async () => {
    // The bundled db.json contains the review/demo workspace. New merchants
    // must start with an empty workspace until their own records are created.
    // This prevents demo data from leaking across accounts in the dashboard.
    if (user && user.email !== 'demo@qivropay.com') {
      setProducts([]); setTransactions([]); setSubscriptions([]); setCustomers([]);
      setDiscounts([]); setLicenses([]); setPayouts([]); setMeters([]); setApiKeys([]);
      setWebhooks([]); setBrands([]); setAffiliates([]); setAgentWallets([]); setTeamMembers([]);
      setAuditLogs([]); setAnalytics({ totalVolume: 0, totalFees: 0, totalNet: 0, mrr: 0, activeSubscriptions: 0, activeCustomers: 0, conversionRate: '0%', chargebackRate: '0%' });
      setLoading(false);
      return;
    }
    try {
      const [
        prodsRes, txsRes, subsRes, custsRes, discsRes, 
        licsRes, posRes, mtrsRes, keysRes, whsRes, brsRes, 
        affRes, walRes, teamRes, auditRes, analRes
      ] = await Promise.all([
        fetch('/api/v1/products'),
        fetch('/api/v1/transactions'),
        fetch('/api/v1/subscriptions'),
        fetch('/api/v1/customers'),
        fetch('/api/v1/discounts'),
        fetch('/api/v1/licenses'),
        fetch('/api/v1/payouts'),
        fetch('/api/v1/meters'),
        fetch('/api/v1/keys'),
        fetch('/api/v1/webhooks'),
        fetch('/api/v1/brands'),
        fetch('/api/v1/affiliates'),
        fetch('/api/v1/wallets'),
        fetch('/api/v1/team'),
        fetch('/api/v1/audit-logs'),
        fetch('/api/v1/analytics')
      ]);

      const [
        prods, txs, subs, custs, discs, 
        lics, pos, mtrs, keys, whs, brs, 
        aff, wal, team, audit, anal
      ] = await Promise.all([
        prodsRes.json(), txsRes.json(), subsRes.json(), custsRes.json(), discsRes.json(),
        licsRes.json(), posRes.json(), mtrsRes.json(), keysRes.json(), whsRes.json(), brsRes.json(),
        affRes.json(), walRes.json(), teamRes.json(), auditRes.json(), analRes.json()
      ]);

      if (prods.success) setProducts(prods.products);
      if (txs.success) setTransactions(txs.transactions);
      if (subs.success) setSubscriptions(subs.subscriptions);
      if (custs.success) setCustomers(custs.customers);
      if (discs.success) setDiscounts(discs.discounts);
      if (lics.success) setLicenses(lics.licenses);
      if (pos.success) setPayouts(pos.payouts);
      if (mtrs.success) setMeters(mtrs.meters);
      if (keys.success) setApiKeys(keys.apiKeys);
      if (whs.success) setWebhooks(whs.webhooks);
      if (aff.success) setAffiliates(aff.affiliates);
      if (wal.success) setAgentWallets(wal.agentWallets);
      if (team.success) setTeamMembers(team.teamMembers);
      if (audit.success) setAuditLogs(audit.auditLogs);
      if (brs.success) {
        setBrands(brs.brands);
        if (!currentBrand && brs.brands.length > 0) {
          setCurrentBrand(brs.brands[0]);
        }
      }
      if (anal.success) setAnalytics(anal.analytics);
    } catch (err) {
      console.error('Error fetching data from KODO API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

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

  const requestPayout = async (amount: number) => {
    try {
      const res = await fetch('/api/v1/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return data.payout;
      }
    } catch (err) {
      console.error('Failed to request payout', err);
    }
    return null;
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
        await refreshData();
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
      await fetch('/api/v1/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to process refund', err);
    }
  };

  const createAffiliate = async (data: any) => {
    try {
      const res = await fetch('/api/v1/affiliates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        return json.affiliate;
      }
    } catch (err) {
      console.error('Failed to create affiliate', err);
    }
    return null;
  };

  const settleAffiliatePayout = async (affiliateId: string) => {
    try {
      await fetch('/api/v1/affiliates/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to settle affiliate payout', err);
    }
  };

  const createAgentWallet = async (data: any) => {
    try {
      const res = await fetch('/api/v1/wallets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        return json.wallet;
      }
    } catch (err) {
      console.error('Failed to create agent wallet', err);
    }
    return null;
  };

  const topupAgentWallet = async (walletId: string, amount: number) => {
    try {
      await fetch('/api/v1/wallets/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, amount })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to topup wallet', err);
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
        payouts,
        meters,
        apiKeys,
        webhooks,
        brands,
        affiliates,
        agentWallets,
        teamMembers,
        auditLogs,
        analytics,
        loading,
        refreshData,
        createProduct,
        deleteProduct,
        cancelSubscription,
        createDiscount,
        deleteDiscount,
        generateLicense,
        revokeLicense,
        requestPayout,
        trackMeterEvent,
        generateApiKey,
        revokeApiKey,
        createAffiliate,
        settleAffiliatePayout,
        createAgentWallet,
        topupAgentWallet,
        inviteTeamMember,
        createCheckoutSession,
        processPayment,
        processRefund
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
