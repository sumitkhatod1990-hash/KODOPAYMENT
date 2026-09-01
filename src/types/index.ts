export type ProductType = 'credits' | 'subscription' | 'license_key' | 'one_time';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: ProductType;
  credits?: number;
  billingType?: 'one_time' | 'recurring_monthly' | 'recurring_yearly';
  interval?: 'month' | 'year' | 'one_time';
  active: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'failed' | 'refunded';
  customerEmail: string;
  customerName: string;
  productName: string;
  paymentMethod: string;
  cardLast4?: string;
  fee: number;
  net: number;
  country: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  status: 'active' | 'past_due' | 'cancelled' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  totalSpent: number;
  subscriptions: number;
  lastActive: string;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  amount: number;
  duration: 'forever' | 'once' | 'repeating';
  redemptionCount: number;
  maxRedemptions: number;
  active: boolean;
  createdAt: string;
}

export interface License {
  id: string;
  productName: string;
  customerEmail: string;
  key: string;
  activations: number;
  maxActivations: number;
  status: 'active' | 'revoked';
  createdAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'in_transit' | 'pending';
  destination: string;
  arrivalDate: string;
  createdAt: string;
}

export interface UsageMeter {
  id: string;
  name: string;
  eventName: string;
  aggregation: string;
  currentUsage: number;
  unit: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  environment: 'live' | 'test';
  createdAt: string;
  lastUsed: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  domain: string;
  statementDescriptor: string;
  supportEmail: string;
  default: boolean;
}

export interface Analytics {
  totalVolume: number;
  totalFees: number;
  totalNet: number;
  mrr: number;
  activeSubscriptions: number;
  activeCustomers: number;
  conversionRate: string;
  chargebackRate: string;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  commissionRate: number;
  clicks: number;
  conversions: number;
  referredVolume: number;
  unpaidCommissions: number;
  status: string;
}

export interface AgentWallet {
  id: string;
  agentName: string;
  balance: number;
  currency: string;
  autoRefillThreshold: number;
  autoRefillAmount: number;
  status: string;
  totalConsumed: number;
  lastRefill: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Developer' | 'Accountant' | 'Support' | 'Admin';
  status: string;
  lastActive: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}

export type DashboardTabType = 
  | 'home'
  | 'copilot'
  | 'payments'
  | 'smart-routing'
  | 'smart-3ds'
  | 'network-tokens'
  | 'revenue-forecast'
  | 'revenue-leakage'
  | 'subscriptions'
  | 'subscription-pause'
  | 'cohort-analytics'
  | 'nrr-radar'
  | 'annual-switcher'
  | 'products'
  | 'dynamic-pricing'
  | 'volume-pricing'
  | 'theme-studio'
  | 'proration'
  | 'payment-links'
  | 'custom-domains'
  | 'marketplace'
  | 'milestone-escrow'
  | 'mobile-pos'
  | 'b2b-invoices'
  | 'purchase-orders'
  | 'einvoicing'
  | 'contract-signing'
  | 'sow-generator'
  | 'gift-cards'
  | 'ab-testing'
  | 'kodo-elements'
  | 'web-component'
  | 'one-pass'
  | 'green-checkout'
  | 'localization'
  | 'open-banking'
  | 'india-upi-autopay'
  | 'india-rupay-upi'
  | 'india-enach'
  | 'india-bbps'
  | 'india-eway-bill'
  | 'india-account-aggregator'
  | 'india-lrs-tcs'
  | 'india-ondc'
  | 'india-digital-rupee'
  | 'india-whatsapp'
  | 'india-mca-roc'
  | 'india-upi-lite'
  | 'india-gstr2b'
  | 'india-creator-splits'
  | 'india-cashfree-split'
  | 'india-startup-india'
  | 'india-ckyc'
  | 'india-fastag'
  | 'india-sez-lut'
  | 'india-gift-city'
  | 'india-treds'
  | 'india-gem-pfms'
  | 'india-epfo-esic'
  | 'india-trai-dlt'
  | 'india-ocen'
  | 'india-cloud-hsm-dsc'
  | 'india-advance-tax'
  | 'india-b2c-qr'
  | 'india-dpdp-consent'
  | 'india-icegate'
  | 'india-upms'
  | 'india-nclt-defaulter'
  | 'india-equalisation-levy'
  | 'india-pacb-ebrc'
  | 'india-corporate-csr'
  | 'india-data-residency'
  | 'india-nlp-marine'
  | 'india-sebi-aif'
  | 'india-enam-agri'
  | 'india-quantum-safe'
  | 'india-upi-circle'
  | 'india-rbi-cims'
  | 'india-mfi-shg'
  | 'india-pm-edrive'
  | 'india-inspace'
  | 'india-idex-defense'
  | 'india-patent-box'
  | 'india-semiconductor-dli'
  | 'india-india-ai-compute'
  | 'india-rail-freight'
  | 'india-mines-khanij'
  | 'india-abdm-health'
  | 'india-bee-carbon'
  | 'india-digital-bharat-nidhi'
  | 'india-digiyatra-commerce'
  | 'india-jjm-water'
  | 'india-whatsapp-commerce'
  | 'india-cashfree-enach'
  | 'india-sdk-playground'
  | 'india-multi-gstin'
  | 'india-gst-invoicing'
  | 'india-tds-desk'
  | 'india-penny-drop'
  | 'customers'
  | 'customer-signals'
  | 'spend-limits'
  | 'referrals'
  | 'churn-interceptor'
  | 'win-back-downsell'
  | 'abandoned-checkouts'
  | 'affiliates'
  | 'agent-wallets'
  | 'card-issuing'
  | 'voice-agent'
  | 'discounts'
  | 'licenses'
  | 'payouts'
  | 'instant-payouts'
  | 'capital-advances'
  | 'equity-waterfall'
  | 'meters'
  | 'metered-overages'
  | 'disputes'
  | 'dispute-analytics'
  | 'pre-dispute-alerts'
  | 'dispute-rebuttal'
  | 'chargeback-insurance'
  | 'fraud-shield'
  | 'dunning'
  | 'sla-credits'
  | 'treasury'
  | 'treasury-yield'
  | 'fx-hedging'
  | 'multi-entity'
  | 'tax-nexus'
  | 'tax-exemptions'
  | 'tax-filings'
  | 'vendor-tax-forms'
  | 'reverse-charge-vault'
  | 'zk-receipts'
  | 'invoice-batch-export'
  | 'credit-notes'
  | 'webhook-dlq'
  | 'workflows'
  | 'migration'
  | 'developer'
  | 'team-audit'
  | 'settings';

export type CurrentViewType = 'landing' | 'auth' | 'dashboard' | 'checkout' | 'docs' | 'portal';
