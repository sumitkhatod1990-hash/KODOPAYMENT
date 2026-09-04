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
  status: 'succeeded' | 'processing' | 'failed' | 'refunded' | 'partially_refunded' | 'refund_pending';
  customerEmail: string;
  customerName: string;
  productName: string;
  paymentMethod: string;
  cardLast4?: string;
  fee: number;
  net: number;
  country: string;
  createdAt: string;
  refundedAmount?: number;
  refundId?: string;
  refundStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | string;
  refundRequestedAt?: string;
  refundConfirmedAt?: string;
  refundFailedAt?: string;
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
  lastUsed: string | null;
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

export interface MerchantProfile {
  businessName: string;
  supportEmail: string;
  onboardingCompletedAt: string | null;
}

// Phase 10.8D. Mirrors the sanitized shape returned by
// GET /api/v1/merchant/cashfree-partner-status (and the same status fields
// echoed back by POST /api/v1/merchant/cashfree-partner/onboard) — kept as
// distinct fields on purpose, never collapsed into a single "approved"
// boolean, and never assumed to enumerate every value Cashfree can ever
// return (see PaymentSetupTab.tsx for how an unrecognized value is shown
// rather than mis-mapped).
export interface CashfreePartnerStatus {
  started: boolean;
  stale: boolean;
  cfMerchantId: string | null;
  onboardingStatus: string | null;
  kycStatus: string | null;
  fullKycStatus: string | null;
  activationStatus: string | null;
  transactionAccess: string | null;
  updatedAt: string | null;
  errorMessage: string | null;
}

// Phase 10.8F. Mirrors GET /api/v1/merchant/settlements — a real Cashfree
// cf_settlement_id this merchant has been reported, never a fabricated row.
export interface CashfreeSettlement {
  cfSettlementId: string;
  status: string | null;
  settlementUtr: string | null;
  settlementCurrency: string | null;
  settlementType: string | null;
  settlementInitiatedOn: string | null;
  settlementProcessedOn: string | null;
  updatedAt: string | null;
}

// Mirrors GET /api/v1/merchant/reconciliation / POST .../reconciliation/refresh.
// `state` is one of the five states server/paymentReconciliation.js derives
// — kept as the exact string from the server, never re-mapped client-side,
// so an unrecognized future value still renders (see PaymentReconciliationTab)
// rather than silently disappearing.
export interface PaymentReconciliation {
  orderId: string;
  state: 'MATCHED' | 'PENDING_SETTLEMENT' | 'UNMATCHED' | 'DISCREPANCY' | 'UNKNOWN' | string;
  discrepancy: string | null;
  reason: string | null;
  cfSettlementId: string | null;
  lastCheckedAt: string;
  stale: boolean;
  error: { status: number | null; code: string | null; message: string | null } | null;
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
  | 'verification'
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
  | 'mobile-pos'
  | 'b2b-invoices'
  | 'purchase-orders'
  | 'einvoicing'
  | 'contract-signing'
  | 'sow-generator'
  | 'gift-cards'
  | 'ab-testing'
  | 'qivropay-elements'
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
  | 'card-issuing'
  | 'voice-agent'
  | 'discounts'
  | 'licenses'
  | 'capital-advances'
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
  | 'fx-hedging'
  | 'multi-entity'
  | 'tax-nexus'
  | 'tax-exemptions'
  | 'tax-filings'
  | 'reverse-charge-vault'
  | 'zk-receipts'
  | 'invoice-batch-export'
  | 'credit-notes'
  | 'webhook-dlq'
  | 'workflows'
  | 'migration'
  | 'developer'
  | 'team-audit'
  | 'settlements'
  | 'settings';

export type CurrentViewType = 'landing' | 'auth' | 'dashboard' | 'checkout' | 'docs' | 'portal';
