import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { HomeTab } from './HomeTab';
import { OverviewTab } from './OverviewTab';
import { PaymentsTab } from './PaymentsTab';
import { SubscriptionsTab } from './SubscriptionsTab';
import { ProductsTab } from './ProductsTab';
import { PaymentLinksTab } from './PaymentLinksTab';
import { CustomersTab } from './CustomersTab';
import { DiscountsTab } from './DiscountsTab';
import { LicensesTab } from './LicensesTab';
import { PayoutsTab } from './PayoutsTab';
import { UsageMetersTab } from './UsageMetersTab';
import { DeveloperTab } from './DeveloperTab';
import { SettingsTab } from './SettingsTab';
import { AffiliatesTab } from './AffiliatesTab';
import { AgentWalletsTab } from './AgentWalletsTab';
import { TeamAuditTab } from './TeamAuditTab';
import { AbandonedCheckoutsTab } from './AbandonedCheckoutsTab';
import { MigrationTab } from './MigrationTab';
import { WorkflowsTab } from './WorkflowsTab';
import { DunningRadarTab } from './DunningRadarTab';
import { MarketplaceConnectTab } from './MarketplaceConnectTab';
import { MobilePOSTab } from './MobilePOSTab';
import { AICopilotTab } from './AICopilotTab';
import { DisputesTab } from './DisputesTab';
import { B2BInvoicesTab } from './B2BInvoicesTab';
import { GiftCardsTab } from './GiftCardsTab';
import { DynamicPricingTab } from './DynamicPricingTab';
import { ABTestingTab } from './ABTestingTab';
import { KodoElementsTab } from './KodoElementsTab';
import { ThemeStudioTab } from './ThemeStudioTab';
import { ProrationTab } from './ProrationTab';
import { TreasuryTab } from './TreasuryTab';
import { CohortAnalyticsTab } from './CohortAnalyticsTab';
import { ChurnInterceptorTab } from './ChurnInterceptorTab';
import { TaxExemptionsTab } from './TaxExemptionsTab';
import { MeteredOveragesTab } from './MeteredOveragesTab';
import { FraudShieldTab } from './FraudShieldTab';
import { CreditNotesTab } from './CreditNotesTab';
import { RevenueForecastTab } from './RevenueForecastTab';
import { InstantPayoutsTab } from './InstantPayoutsTab';
import { CustomDomainsTab } from './CustomDomainsTab';
import { MultiEntityTab } from './MultiEntityTab';
import { ContractSignTab } from './ContractSignTab';
import { VoiceAgentTab } from './VoiceAgentTab';
import { CardIssuingTab } from './CardIssuingTab';
import { WebComponentTab } from './WebComponentTab';
import { InsuranceTab } from './InsuranceTab';
import { WaterfallTab } from './WaterfallTab';
import { SmartRoutingTab } from './SmartRoutingTab';
import { OpenBankingTab } from './OpenBankingTab';
import { CapitalAdvanceTab } from './CapitalAdvanceTab';
import { TaxFilingsTab } from './TaxFilingsTab';
import { TreasuryYieldTab } from './TreasuryYieldTab';
import { EInvoicingTab } from './EInvoicingTab';
import { AnnualSwitcherTab } from './AnnualSwitcherTab';
import { CustomerSignalsTab } from './CustomerSignalsTab';
import { ZkReceiptsTab } from './ZkReceiptsTab';
import { ReferralEngineTab } from './ReferralEngineTab';
import { LocalizationTab } from './LocalizationTab';
import { DisputeAnalyticsTab } from './DisputeAnalyticsTab';
import { DisputeRebuttalTab } from './DisputeRebuttalTab';
import { SpendLimitsTab } from './SpendLimitsTab';
import { PurchaseOrdersTab } from './PurchaseOrdersTab';
import { RevenueLeakageTab } from './RevenueLeakageTab';
import { FxHedgingTab } from './FxHedgingTab';
import { SubscriptionPauseTab } from './SubscriptionPauseTab';
import { VolumePricingTab } from './VolumePricingTab';
import { SOWGeneratorTab } from './SOWGeneratorTab';
import { Smart3DSTab } from './Smart3DSTab';
import { NRRRadarTab } from './NRRRadarTab';
import { ReverseChargeVaultTab } from './ReverseChargeVaultTab';
import { InvoiceBatchExporterTab } from './InvoiceBatchExporterTab';
import { NetworkTokensTab } from './NetworkTokensTab';
import { VendorTaxFormsTab } from './VendorTaxFormsTab';
import { OnePassTab } from './OnePassTab';
import { SLACreditsTab } from './SLACreditsTab';
import { PreDisputeTab } from './PreDisputeTab';
import { MilestoneEscrowTab } from './MilestoneEscrowTab';
import { WinBackDownsellTab } from './WinBackDownsellTab';
import { GreenCheckoutTab } from './GreenCheckoutTab';
import { UPIAutoPayTab } from './UPIAutoPayTab';
import { IndianGSTTab } from './IndianGSTTab';
import { TDSWithholdingTab } from './TDSWithholdingTab';
import { PennyDropKYCTab } from './PennyDropKYCTab';
import { RuPayUPITab } from './RuPayUPITab';
import { ENACHNetBankingTab } from './ENACHNetBankingTab';
import { BBPSInvoicingTab } from './BBPSInvoicingTab';
import { EWayBillTab } from './EWayBillTab';
import { AccountAggregatorTab } from './AccountAggregatorTab';
import { LRSComplianceTab } from './LRSComplianceTab';
import { ONDCGatewayTab } from './ONDCGatewayTab';
import { DigitalRupeeTab } from './DigitalRupeeTab';
import { WhatsAppCheckoutTab } from './WhatsAppCheckoutTab';
import { MCARocFilingsTab } from './MCARocFilingsTab';
import { UPILiteTab } from './UPILiteTab';
import { GSTR2BReconTab } from './GSTR2BReconTab';
import { CreatorSplitPayoutsTab } from './CreatorSplitPayoutsTab';
import { StartupIndiaTaxTab } from './StartupIndiaTaxTab';
import { CKYCDigiLockerTab } from './CKYCDigiLockerTab';
import { FastagNETCTab } from './FastagNETCTab';
import { SEZExportLUTTab } from './SEZExportLUTTab';
import { GIFTCityIFSCTab } from './GIFTCityIFSCTab';
import { TReDSInvoiceDiscountingTab } from './TReDSInvoiceDiscountingTab';
import { GeMPFMSTreasuryTab } from './GeMPFMSTreasuryTab';
import { EPFOESICPayrollTab } from './EPFOESICPayrollTab';
import { TRAIDLTSMSTab } from './TRAIDLTSMSTab';
import { OCENCreditRailTab } from './OCENCreditRailTab';
import { CloudHSMDSCTab } from './CloudHSMDSCTab';
import { AdvanceTaxAISTISTab } from './AdvanceTaxAISTISTab';
import { B2CDynamicUPIQRTab } from './B2CDynamicUPIQRTab';
import { DPDPConsentVaultTab } from './DPDPConsentVaultTab';
import { ICEGATECustomsDeskTab } from './ICEGATECustomsDeskTab';
import { UPMSMandatesTab } from './UPMSMandatesTab';
import { NCLTDefaulterRadarTab } from './NCLTDefaulterRadarTab';
import { EqualisationLevyTab } from './EqualisationLevyTab';
import { PACBRCInwardTab } from './PACBRCInwardTab';
import { CorporateCSRVaultTab } from './CorporateCSRVaultTab';
import { DataResidencyAirGapTab } from './DataResidencyAirGapTab';
import { NLPMajorPortsTab } from './NLPMajorPortsTab';
import { SEBIAIFEscrowTab } from './SEBIAIFEscrowTab';
import { ENAMAgriTradeTab } from './ENAMAgriTradeTab';
import { QuantumSafeTokenTab } from './QuantumSafeTokenTab';
import { CashfreeEasySplitTab } from './CashfreeEasySplitTab';
import { UPICircleDelegationTab } from './UPICircleDelegationTab';
import { RBICIMSFilingTab } from './RBICIMSFilingTab';
import { MFISHGCollectionTab } from './MFISHGCollectionTab';
import { PMEDriveEVFleetTab } from './PMEDriveEVFleetTab';
import { INSpacePayloadEscrowTab } from './INSpacePayloadEscrowTab';
import { IDEXDefenseEscrowTab } from './IDEXDefenseEscrowTab';
import { PatentBoxTaxTab } from './PatentBoxTaxTab';
import { SemiconductorDLIEscrowTab } from './SemiconductorDLIEscrowTab';
import { IndiaAIComputeMarketplaceTab } from './IndiaAIComputeMarketplaceTab';
import { RailFreightFOISTab } from './RailFreightFOISTab';
import { MinesKhanijRoyaltyTab } from './MinesKhanijRoyaltyTab';
import { ABDMHealthcareClaimTab } from './ABDMHealthcareClaimTab';
import { BEECarbonMarketTab } from './BEECarbonMarketTab';
import { DigitalBharatNidhiEscrowTab } from './DigitalBharatNidhiEscrowTab';
import { DigiYatraCommerceTab } from './DigiYatraCommerceTab';
import { JJMSmartWaterTariffTab } from './JJMSmartWaterTariffTab';
import { WhatsAppCommerceBotTab } from './WhatsAppCommerceBotTab';
import { CashfreeENACHMandatesTab } from './CashfreeENACHMandatesTab';
import { SDKPlaygroundTab } from './SDKPlaygroundTab';
import { MultiGSTINCorporateTab } from './MultiGSTINCorporateTab';
import { TaxNexusTab } from './TaxNexusTab';
import { WebhookDLQTab } from './WebhookDLQTab';
import { NotificationsDrawer } from './NotificationsDrawer';
import { OnboardingWizard } from './OnboardingWizard';
import { OverlayCheckoutModal } from '../checkout/OverlayCheckoutModal';
import { 
  LayoutDashboard, 
  CreditCard,
  RefreshCw,
  Package, 
  Link2, 
  Users, 
  Tag,
  Key,
  Building,
  Building2,
  Cpu,
  Terminal, 
  Settings, 
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Sparkles,
  Plus,
  ShieldCheck,
  Zap,
  HelpCircle,
  Share2,
  Wallet,
  ShieldAlert,
  ShoppingCart,
  ArrowRightLeft,
  Workflow,
  Smartphone,
  Split,
  FileSpreadsheet,
  Bot,
  Landmark,
  Gift,
  Globe2,
  TrendingUp,
  Layers,
  AlertOctagon,
  Palette,
  Calculator,
  BarChart3,
  HeartHandshake,
  FileCheck2,
  Gauge,
  Bell,
  Receipt,
  LineChart,
  Globe,
  FileSignature,
  Mic,
  GitFork,
  Code2,
  Shield,
  Network,
  Coins,
  Percent,
  Calendar,
  Radio,
  Fingerprint,
  Languages,
  BrainCircuit,
  Sliders,
  Briefcase,
  Scan,
  FileText,
  PauseCircle,
  SmartphoneNfc,
  FolderDown,
  Activity,
  BellRing,
  Leaf,
  Unlock,
  Truck,
  MessageSquare,
  Award,
  QrCode,
  Anchor,
  Send,
  Lock,
  Ship,
  Sprout,
  Users2,
  BatteryCharging,
  Rocket,
  Train,
  Pickaxe,
  Plane,
  Droplets
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { 
    dashboardTab, 
    setDashboardTab, 
    setCurrentView, 
    isTestMode,
    setIsTestMode,
    brands,
    currentBrand,
    setCurrentBrand
  } = useApp();

  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Keep the primary navigation focused on the jobs merchants do every day.
  // The long India/feature catalogue remains routable for backwards
  // compatibility, but is intentionally not exposed as the main sidebar.
  const internalReferenceGroups = [
    {
      group: 'BHARAT (INDIA) SOVEREIGN STACK 🇮🇳',
      items: [
        { id: 'india-cashfree-split', label: 'Cashfree PG + Easy Split Rail', icon: Split },
        { id: 'india-whatsapp-commerce', label: 'WhatsApp 1-Click Pay & Invoice Bot', icon: MessageSquare },
        { id: 'india-cashfree-enach', label: 'Cashfree e-NACH Bank Mandates', icon: Landmark },
        { id: 'india-sdk-playground', label: 'Interactive SDK Playground', icon: Code2 },
        { id: 'india-multi-gstin', label: 'Multi-GSTIN Corporate Rail', icon: Building2 },
        { id: 'india-upi-autopay', label: 'UPI AutoPay 2.0 Mandates', icon: Smartphone },
        { id: 'india-rupay-upi', label: 'RuPay on UPI (0% MDR)', icon: CreditCard },
        { id: 'india-upi-circle', label: 'NPCI UPI Circle Delegation', icon: Users2 },
        { id: 'india-upi-lite', label: 'UPI Lite (Zero-PIN <₹500)', icon: Zap },
        { id: 'india-digital-rupee', label: 'RBI Digital Rupee (CBDC e₹)', icon: Coins },
        { id: 'india-whatsapp', label: 'WhatsApp UPI Checkout Bot', icon: MessageSquare },
        { id: 'india-ondc', label: 'ONDC Protocol Gateway', icon: Network },
        { id: 'india-bbps', label: 'Bharat BillPay (BBPS) Hub', icon: Receipt },
        { id: 'india-b2c-qr', label: 'B2C Dynamic UPI QR Engine', icon: QrCode },
        { id: 'india-enach', label: 'e-NACH & 55+ NetBanking', icon: Landmark },
        { id: 'india-gst-invoicing', label: 'GST & NIC e-Invoicing (IRN)', icon: FileCheck2 },
        { id: 'india-gstr2b', label: 'GSTR-2B vs Purchase AI Recon', icon: FileCheck2 },
        { id: 'india-eway-bill', label: 'NIC e-Way Bill Goods Pass', icon: Truck },
        { id: 'india-fastag', label: 'Fastag & NETC Fleet Tolls', icon: Truck },
        { id: 'india-icegate', label: 'ICEGATE Customs & BoE Desk', icon: Anchor },
        { id: 'india-nlp-marine', label: 'NLP Marine Cargo & e-BL', icon: Ship },
        { id: 'india-rail-freight', label: 'Indian Railways CRIS FOIS', icon: Train },
        { id: 'india-inspace', label: 'IN-SPACe SpaceTech Escrow', icon: Rocket },
        { id: 'india-idex-defense', label: 'MoD iDEX Defense Escrow', icon: Shield },
        { id: 'india-mines-khanij', label: 'Mines Khanij Online Royalty', icon: Pickaxe },
        { id: 'india-tds-desk', label: 'TDS Section 194-O Desk', icon: FileCheck2 },
        { id: 'india-advance-tax', label: 'Advance Tax (Sec 208) AI', icon: Calculator },
        { id: 'india-equalisation-levy', label: 'CBDT Equalisation Levy (2%)', icon: Percent },
        { id: 'india-patent-box', label: 'Sec 115BBF Patent Box 10%', icon: Award },
        { id: 'india-penny-drop', label: 'Penny-Drop Bank KYC (₹1)', icon: Coins },
        { id: 'india-ckyc', label: 'CKYC & DigiLocker 2.0', icon: Fingerprint },
        { id: 'india-dpdp-consent', label: 'DPDP Act & Sahamati AA', icon: ShieldCheck },
        { id: 'india-abdm-health', label: 'ABDM & Ayush Health Claim', icon: HeartHandshake },
        { id: 'india-creator-splits', label: 'Creator Instant Daily Splits', icon: Split },
        { id: 'india-account-aggregator', label: 'RBI Account Aggregator (AA)', icon: LineChart },
        { id: 'india-ocen', label: 'OCEN Embedded SME Credit', icon: CreditCard },
        { id: 'india-treds', label: 'TReDS MSME Invoice Factoring', icon: ArrowRightLeft },
        { id: 'india-enam-agri', label: 'e-NAM APMC Agri Mandi', icon: Sprout },
        { id: 'india-mfi-shg', label: 'MFI & SHG e-Kist Rail', icon: Users },
        { id: 'india-jjm-water', label: 'JJM Rural IoT Smart Water', icon: Droplets },
        { id: 'india-sez-lut', label: 'SEZ & STPI Zero-GST LUT', icon: Building2 },
        { id: 'india-gift-city', label: 'GIFT City (IFSC) USD Rail', icon: Landmark },
        { id: 'india-pacb-ebrc', label: 'RBI PA-CB & DGFT e-BRC', icon: Globe2 },
        { id: 'india-sebi-aif', label: 'SEBI AIF & Angel Capital', icon: Building2 },
        { id: 'india-semiconductor-dli', label: 'ISM Semiconductor DLI', icon: Cpu },
        { id: 'india-india-ai-compute', label: 'IndiaAI GPU Token Desk', icon: Cpu },
        { id: 'india-digiyatra-commerce', label: 'DigiYatra Airport Face-Pay', icon: Plane },
        { id: 'india-rbi-cims', label: 'RBI CIMS XBRL Auto-Filer', icon: FileSpreadsheet },
        { id: 'india-digital-bharat-nidhi', label: 'DoT Digital Bharat Nidhi', icon: Radio },
        { id: 'india-cloud-hsm-dsc', label: 'Cloud HSM Class-3 DSC Vault', icon: FileSignature },
        { id: 'india-epfo-esic', label: 'EPFO & ESIC Payroll Vault', icon: Users },
        { id: 'india-trai-dlt', label: 'TRAI DLT SMS Scrubbing', icon: Radio },
        { id: 'india-nclt-defaulter', label: 'NCLT Insolvency (IBC) Radar', icon: ShieldAlert },
        { id: 'india-corporate-csr', label: 'Section 135 CSR 2% Vault', icon: HeartHandshake },
        { id: 'india-pm-edrive', label: 'PM E-DRIVE EV Fleet Subsidy', icon: BatteryCharging },
        { id: 'india-bee-carbon', label: 'BEE National Carbon Market', icon: Leaf },
        { id: 'india-quantum-safe', label: 'Quantum-Safe Cryptography', icon: Cpu },
        { id: 'india-data-residency', label: 'MeitY 100% On-Soil Air-Gap', icon: Lock },
        { id: 'india-mca-roc', label: 'MCA Corporate ROC Vault', icon: Building },
        { id: 'india-startup-india', label: 'DPIIT Startup India Tax Vault', icon: Award },
        { id: 'india-lrs-tcs', label: 'LRS & Cloud Outbound TCS', icon: Globe2 },
      ]
    },
    {
      group: 'CORE',
      items: [
        { id: 'home', label: 'Home (Pulse)', icon: LayoutDashboard },
        { id: 'copilot', label: 'AI Checkout Copilot', icon: Sparkles },
        { id: 'payments', label: 'Payments & Ledger', icon: CreditCard },
        { id: 'smart-routing', label: 'Smart Acquirer Routing', icon: Network },
        { id: 'smart-3ds', label: 'Smart 3DS SCA Shield', icon: SmartphoneNfc },
        { id: 'network-tokens', label: 'Network Tokens & Updater', icon: CreditCard },
        { id: 'revenue-forecast', label: 'Revenue Forecast AI', icon: TrendingUp },
        { id: 'revenue-leakage', label: 'Revenue Leakage Audit', icon: Scan },
        { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
        { id: 'subscription-pause', label: 'Subscription Pause Mode', icon: PauseCircle },
        { id: 'cohort-analytics', label: 'Cohort Analytics', icon: BarChart3 },
        { id: 'nrr-radar', label: 'SaaS NRR Radar', icon: TrendingUp },
        { id: 'customers', label: 'Customers CRM', icon: Users },
        { id: 'customer-signals', label: 'Customer Churn Signals', icon: Radio },
        { id: 'spend-limits', label: 'Spend Soft-Cap Limits', icon: Sliders },
        { id: 'referrals', label: 'Viral Referrals Loop', icon: Share2 },
        { id: 'churn-interceptor', label: 'Churn Interceptor', icon: HeartHandshake },
        { id: 'win-back-downsell', label: 'AI Churn Win-Back', icon: HeartHandshake },
        { id: 'abandoned-checkouts', label: 'Abandoned Carts', icon: ShoppingCart },
      ]
    },
    {
      group: 'MONETIZATION & GROWTH',
      items: [
        { id: 'products', label: 'Products & Credits', icon: Package },
        { id: 'dynamic-pricing', label: 'AI Dynamic Pricing', icon: TrendingUp },
        { id: 'volume-pricing', label: 'Volume Discount Tiers', icon: Layers },
        { id: 'theme-studio', label: 'Theme Studio (Branding)', icon: Palette },
        { id: 'proration', label: 'Subscription Proration', icon: Calculator },
        { id: 'annual-switcher', label: 'Annual Upfront Switcher', icon: Calendar },
        { id: 'payment-links', label: 'Payment Links', icon: Link2 },
        { id: 'custom-domains', label: 'Custom Subdomains', icon: Globe },
        { id: 'marketplace', label: 'Marketplace Connect', icon: Building2 },
        { id: 'milestone-escrow', label: 'Milestone Escrow Trust', icon: Building2 },
        { id: 'mobile-pos', label: 'Mobile POS & QR', icon: Smartphone },
        { id: 'b2b-invoices', label: 'B2B Invoicing & vIBAN', icon: Landmark },
        { id: 'purchase-orders', label: 'Enterprise Purchase Orders', icon: Briefcase },
        { id: 'einvoicing', label: 'Mandatory e-Invoicing', icon: FileCheck2 },
        { id: 'contract-signing', label: 'Enterprise Contract E-Sign', icon: FileSignature },
        { id: 'sow-generator', label: 'Enterprise SOW AI', icon: FileSignature },
        { id: 'gift-cards', label: 'Gift Cards & Credits', icon: Gift },
        { id: 'ab-testing', label: 'A/B CRO Studio', icon: Split },
        { id: 'kodo-elements', label: 'KODO Elements SDK', icon: Layers },
        { id: 'web-component', label: '<kodo-checkout> Component', icon: Code2 },
        { id: 'one-pass', label: 'KODO One-Pass (1-Click)', icon: Fingerprint },
        { id: 'green-checkout', label: 'Green Carbon Checkout', icon: Leaf },
        { id: 'localization', label: '32-Language Localization', icon: Languages },
        { id: 'open-banking', label: 'Pay-by-Bank (0% Fees)', icon: Landmark },
        { id: 'affiliates', label: 'Affiliates & Partners', icon: Share2 },
        { id: 'agent-wallets', label: 'AI Agent Wallets', icon: Wallet },
        { id: 'card-issuing', label: 'Virtual Card Issuing', icon: CreditCard },
        { id: 'voice-agent', label: 'AI Voice Checkout', icon: Mic },
        { id: 'discounts', label: 'Discounts & Coupons', icon: Tag },
        { id: 'licenses', label: 'License Keys', icon: Key },
        { id: 'meters', label: 'Usage Meters', icon: Cpu },
        { id: 'metered-overages', label: 'Metered Overages', icon: Gauge },
      ]
    },
    {
      group: 'AUTOMATIONS & PROTECTION',
      items: [
        { id: 'disputes', label: 'Chargeback Defense AI', icon: ShieldCheck },
        { id: 'dispute-analytics', label: 'Root-Cause Loss Radar', icon: BrainCircuit },
        { id: 'pre-dispute-alerts', label: 'Ethoca / Verifi Early Alerts', icon: BellRing },
        { id: 'dispute-rebuttal', label: 'Dispute Rebuttal Pack AI', icon: FileText },
        { id: 'chargeback-insurance', label: '100% Fraud Insurance', icon: Shield },
        { id: 'fraud-shield', label: 'Fraud Velocity Shield', icon: ShieldAlert },
        { id: 'dunning', label: 'Smart Dunning Radar', icon: ShieldAlert },
        { id: 'sla-credits', label: 'Enterprise SLA Credits', icon: Activity },
        { id: 'treasury', label: 'Multi-Currency Treasury', icon: Landmark },
        { id: 'treasury-yield', label: 'Treasury Yield (4.8% APY)', icon: Percent },
        { id: 'fx-hedging', label: 'FX 90-Day Rate Lock', icon: ArrowRightLeft },
        { id: 'multi-entity', label: 'Multi-Entity Holding', icon: Building2 },
        { id: 'tax-nexus', label: 'Tax Nexus World Map', icon: Globe2 },
        { id: 'tax-exemptions', label: 'Tax Exemptions (501c3)', icon: FileCheck2 },
        { id: 'tax-filings', label: 'Global Tax Remittance Desk', icon: Building },
        { id: 'vendor-tax-forms', label: 'Vendor W-9 / W-8BEN Desk', icon: FileCheck2 },
        { id: 'reverse-charge-vault', label: 'Reverse-Charge Tax Vault', icon: FileCheck2 },
        { id: 'zk-receipts', label: 'ZK Proof Privacy Receipts', icon: Fingerprint },
        { id: 'invoice-batch-export', label: 'Invoice PDF Bulk Exporter', icon: FolderDown },
        { id: 'credit-notes', label: 'Credit Notes & VAT', icon: Receipt },
        { id: 'equity-waterfall', label: 'Equity Waterfall Splitter', icon: GitFork },
        { id: 'webhook-dlq', label: 'Webhook DLQ Queue', icon: AlertOctagon },
        { id: 'workflows', label: 'Payment Workflows', icon: Workflow },
        { id: 'migration', label: '1-Click Importer', icon: ArrowRightLeft },
        { id: 'payouts', label: 'Payouts & Settlement', icon: Building },
        { id: 'instant-payouts', label: 'Instant T+0 Payouts', icon: Zap },
        { id: 'capital-advances', label: 'Merchant Capital (RBF)', icon: Coins },
      ]
    },
    {
      group: 'DEVELOPERS & SECURITY',
      items: [
        { id: 'developer', label: 'Developer Hub', icon: Terminal },
        { id: 'team-audit', label: 'Team & Audit Logs', icon: ShieldCheck },
        { id: 'settings', label: 'Settings & Multi-Brand', icon: Settings },
      ]
    }
  ];

  const navigationGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'home', label: 'Overview', icon: LayoutDashboard },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'payouts', label: 'Payouts', icon: Building },
      ]
    },
    {
      group: 'REVENUE',
      items: [
        { id: 'payment-links', label: 'Payment Links', icon: Link2 },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
        { id: 'customers', label: 'Customers', icon: Users },
      ]
    },
    {
      group: 'OPERATIONS',
      items: [
        { id: 'disputes', label: 'Disputes & Refunds', icon: ShieldCheck },
        { id: 'invoice-batch-export', label: 'Invoices', icon: FileText },
      ]
    },
    {
      group: 'DEVELOPERS',
      items: [
        { id: 'developer', label: 'API & Webhooks', icon: Terminal },
        { id: 'team-audit', label: 'Team & Audit Logs', icon: Users2 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-black/10 bg-white flex flex-col justify-between shrink-0 shadow-sm">
        
        <div className="p-4 space-y-5">
          
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between">
            <Logo size="sm" onClick={() => setCurrentView('landing')} />
            <button
              onClick={() => setCurrentView('landing')}
              className="text-xs text-[#86868b] hover:text-[#1d1d1f] md:hidden font-medium"
            >
              Exit
            </button>
          </div>

          {/* Multi-Brand Switcher */}
          <div className="relative">
            <button
              onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
              className="w-full p-2 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-between text-xs hover:bg-[#e8e8ed] transition-colors"
            >
              <div className="flex items-center gap-2 text-left truncate">
                <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[10px]">
                  {currentBrand?.name.charAt(0) || 'Q'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#1d1d1f] truncate">{currentBrand?.name || 'QivroPay Labs'}</div>
                  <div className="text-[10px] text-[#86868b] font-mono">{currentBrand?.domain || 'qivropay.in'}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
            </button>

            {brandDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-white border border-black/10 shadow-xl z-50 text-xs space-y-1 animate-fade-in">
                {brands.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => { setCurrentBrand(b); setBrandDropdownOpen(false); }}
                    className={`p-2 rounded-xl flex items-center justify-between cursor-pointer ${
                      currentBrand?.id === b.id ? 'bg-[#f5f5f7] font-bold text-[#0071e3]' : 'text-[#6e6e73] hover:bg-[#fafafc]'
                    }`}
                  >
                    <span>{b.name}</span>
                    {b.default && <span className="text-[9px] px-1.5 py-0.5 rounded bg-black text-white">DEFAULT</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test / Live Mode Toggle */}
          <div className="p-2 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isTestMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-[11px] font-mono font-bold text-[#1d1d1f]">
                {isTestMode ? 'SANDBOX (TEST)' : 'LIVE RAILS'}
              </span>
            </div>
            <button
              onClick={() => setIsTestMode(!isTestMode)}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#6e6e73] hover:text-[#1d1d1f] border border-black/10 shadow-sm font-semibold"
            >
              Switch
            </button>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {navigationGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <div className="px-3 text-[9px] font-mono font-bold uppercase tracking-wider text-[#86868b]">
                  {grp.group}
                </div>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = dashboardTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setDashboardTab(item.id as any)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1d1d1f] text-white shadow-sm'
                          : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#6e6e73]'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-black/5 space-y-1.5">
          <button
            onClick={() => setCurrentView('docs')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] text-xs hover:bg-[#e8e8ed] transition-colors font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Developer Docs</span>
          </button>

          <button
            onClick={() => setCurrentView('landing')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[#86868b] hover:text-[#1d1d1f] text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>KODO Home</span>
          </button>
        </div>

      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* App Topbar Header */}
        <header className="h-16 border-b border-black/10 bg-white px-6 sm:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-[#1d1d1f] text-lg capitalize font-heading">
              {dashboardTab.replace('-', ' ')}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              KODO MoR Active
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setNotifDrawerOpen(true)}
              className="relative p-2 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] hover:border-black/20 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#0055FF]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <button
              onClick={() => setWizardOpen(true)}
              className="apple-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Setup Wizard</span>
            </button>

            <button
              onClick={() => setOverlayOpen(true)}
              className="apple-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 font-semibold"
            >
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>Test Overlay SDK</span>
            </button>

            <button
              onClick={() => setDashboardTab('payment-links')}
              className="apple-btn-black px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Payment Link</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Container */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
          {dashboardTab === 'home' && <OverviewTab onNavigateTab={setDashboardTab} />}
          {dashboardTab === 'copilot' && <AICopilotTab />}
          {dashboardTab === 'payments' && <PaymentsTab />}
          {dashboardTab === 'smart-routing' && <SmartRoutingTab />}
          {dashboardTab === 'smart-3ds' && <Smart3DSTab />}
          {dashboardTab === 'network-tokens' && <NetworkTokensTab />}
          {dashboardTab === 'revenue-forecast' && <RevenueForecastTab />}
          {dashboardTab === 'revenue-leakage' && <RevenueLeakageTab />}
          {dashboardTab === 'subscriptions' && <SubscriptionsTab />}
          {dashboardTab === 'subscription-pause' && <SubscriptionPauseTab />}
          {dashboardTab === 'cohort-analytics' && <CohortAnalyticsTab />}
          {dashboardTab === 'nrr-radar' && <NRRRadarTab />}
          {dashboardTab === 'annual-switcher' && <AnnualSwitcherTab />}
          {dashboardTab === 'products' && <ProductsTab />}
          {dashboardTab === 'dynamic-pricing' && <DynamicPricingTab />}
          {dashboardTab === 'volume-pricing' && <VolumePricingTab />}
          {dashboardTab === 'theme-studio' && <ThemeStudioTab />}
          {dashboardTab === 'proration' && <ProrationTab />}
          {dashboardTab === 'payment-links' && <PaymentLinksTab />}
          {dashboardTab === 'custom-domains' && <CustomDomainsTab />}
          {dashboardTab === 'marketplace' && <MarketplaceConnectTab />}
          {dashboardTab === 'milestone-escrow' && <MilestoneEscrowTab />}
          {dashboardTab === 'mobile-pos' && <MobilePOSTab />}
          {dashboardTab === 'b2b-invoices' && <B2BInvoicesTab />}
          {dashboardTab === 'purchase-orders' && <PurchaseOrdersTab />}
          {dashboardTab === 'einvoicing' && <EInvoicingTab />}
          {dashboardTab === 'contract-signing' && <ContractSignTab />}
          {dashboardTab === 'sow-generator' && <SOWGeneratorTab />}
          {dashboardTab === 'gift-cards' && <GiftCardsTab />}
          {dashboardTab === 'ab-testing' && <ABTestingTab />}
          {dashboardTab === 'kodo-elements' && <KodoElementsTab />}
          {dashboardTab === 'web-component' && <WebComponentTab />}
          {dashboardTab === 'one-pass' && <OnePassTab />}
          {dashboardTab === 'green-checkout' && <GreenCheckoutTab />}
          {dashboardTab === 'localization' && <LocalizationTab />}
          {dashboardTab === 'open-banking' && <OpenBankingTab />}
          {dashboardTab === 'india-cashfree-split' && <CashfreeEasySplitTab />}
          {dashboardTab === 'india-whatsapp-commerce' && <WhatsAppCommerceBotTab />}
          {dashboardTab === 'india-cashfree-enach' && <CashfreeENACHMandatesTab />}
          {dashboardTab === 'india-sdk-playground' && <SDKPlaygroundTab />}
          {dashboardTab === 'india-multi-gstin' && <MultiGSTINCorporateTab />}
          {dashboardTab === 'india-upi-autopay' && <UPIAutoPayTab />}
          {dashboardTab === 'india-rupay-upi' && <RuPayUPITab />}
          {dashboardTab === 'india-upi-circle' && <UPICircleDelegationTab />}
          {dashboardTab === 'india-upi-lite' && <UPILiteTab />}
          {dashboardTab === 'india-digital-rupee' && <DigitalRupeeTab />}
          {dashboardTab === 'india-whatsapp' && <WhatsAppCheckoutTab />}
          {dashboardTab === 'india-ondc' && <ONDCGatewayTab />}
          {dashboardTab === 'india-bbps' && <BBPSInvoicingTab />}
          {dashboardTab === 'india-b2c-qr' && <B2CDynamicUPIQRTab />}
          {dashboardTab === 'india-enach' && <ENACHNetBankingTab />}
          {dashboardTab === 'india-gst-invoicing' && <IndianGSTTab />}
          {dashboardTab === 'india-gstr2b' && <GSTR2BReconTab />}
          {dashboardTab === 'india-eway-bill' && <EWayBillTab />}
          {dashboardTab === 'india-fastag' && <FastagNETCTab />}
          {dashboardTab === 'india-icegate' && <ICEGATECustomsDeskTab />}
          {dashboardTab === 'india-nlp-marine' && <NLPMajorPortsTab />}
          {dashboardTab === 'india-rail-freight' && <RailFreightFOISTab />}
          {dashboardTab === 'india-inspace' && <INSpacePayloadEscrowTab />}
          {dashboardTab === 'india-idex-defense' && <IDEXDefenseEscrowTab />}
          {dashboardTab === 'india-mines-khanij' && <MinesKhanijRoyaltyTab />}
          {dashboardTab === 'india-tds-desk' && <TDSWithholdingTab />}
          {dashboardTab === 'india-advance-tax' && <AdvanceTaxAISTISTab />}
          {dashboardTab === 'india-equalisation-levy' && <EqualisationLevyTab />}
          {dashboardTab === 'india-patent-box' && <PatentBoxTaxTab />}
          {dashboardTab === 'india-penny-drop' && <PennyDropKYCTab />}
          {dashboardTab === 'india-ckyc' && <CKYCDigiLockerTab />}
          {dashboardTab === 'india-dpdp-consent' && <DPDPConsentVaultTab />}
          {dashboardTab === 'india-abdm-health' && <ABDMHealthcareClaimTab />}
          {dashboardTab === 'india-creator-splits' && <CreatorSplitPayoutsTab />}
          {dashboardTab === 'india-account-aggregator' && <AccountAggregatorTab />}
          {dashboardTab === 'india-ocen' && <OCENCreditRailTab />}
          {dashboardTab === 'india-treds' && <TReDSInvoiceDiscountingTab />}
          {dashboardTab === 'india-gem-pfms' && <GeMPFMSTreasuryTab />}
          {dashboardTab === 'india-upms' && <UPMSMandatesTab />}
          {dashboardTab === 'india-enam-agri' && <ENAMAgriTradeTab />}
          {dashboardTab === 'india-mfi-shg' && <MFISHGCollectionTab />}
          {dashboardTab === 'india-jjm-water' && <JJMSmartWaterTariffTab />}
          {dashboardTab === 'india-sez-lut' && <SEZExportLUTTab />}
          {dashboardTab === 'india-gift-city' && <GIFTCityIFSCTab />}
          {dashboardTab === 'india-pacb-ebrc' && <PACBRCInwardTab />}
          {dashboardTab === 'india-sebi-aif' && <SEBIAIFEscrowTab />}
          {dashboardTab === 'india-semiconductor-dli' && <SemiconductorDLIEscrowTab />}
          {dashboardTab === 'india-india-ai-compute' && <IndiaAIComputeMarketplaceTab />}
          {dashboardTab === 'india-digiyatra-commerce' && <DigiYatraCommerceTab />}
          {dashboardTab === 'india-rbi-cims' && <RBICIMSFilingTab />}
          {dashboardTab === 'india-digital-bharat-nidhi' && <DigitalBharatNidhiEscrowTab />}
          {dashboardTab === 'india-cloud-hsm-dsc' && <CloudHSMDSCTab />}
          {dashboardTab === 'india-epfo-esic' && <EPFOESICPayrollTab />}
          {dashboardTab === 'india-trai-dlt' && <TRAIDLTSMSTab />}
          {dashboardTab === 'india-nclt-defaulter' && <NCLTDefaulterRadarTab />}
          {dashboardTab === 'india-corporate-csr' && <CorporateCSRVaultTab />}
          {dashboardTab === 'india-pm-edrive' && <PMEDriveEVFleetTab />}
          {dashboardTab === 'india-bee-carbon' && <BEECarbonMarketTab />}
          {dashboardTab === 'india-quantum-safe' && <QuantumSafeTokenTab />}
          {dashboardTab === 'india-data-residency' && <DataResidencyAirGapTab />}
          {dashboardTab === 'india-mca-roc' && <MCARocFilingsTab />}
          {dashboardTab === 'india-startup-india' && <StartupIndiaTaxTab />}
          {dashboardTab === 'india-lrs-tcs' && <LRSComplianceTab />}
          {dashboardTab === 'customers' && <CustomersTab />}
          {dashboardTab === 'customer-signals' && <CustomerSignalsTab />}
          {dashboardTab === 'spend-limits' && <SpendLimitsTab />}
          {dashboardTab === 'referrals' && <ReferralEngineTab />}
          {dashboardTab === 'churn-interceptor' && <ChurnInterceptorTab />}
          {dashboardTab === 'win-back-downsell' && <WinBackDownsellTab />}
          {dashboardTab === 'abandoned-checkouts' && <AbandonedCheckoutsTab />}
          {dashboardTab === 'affiliates' && <AffiliatesTab />}
          {dashboardTab === 'agent-wallets' && <AgentWalletsTab />}
          {dashboardTab === 'card-issuing' && <CardIssuingTab />}
          {dashboardTab === 'voice-agent' && <VoiceAgentTab />}
          {dashboardTab === 'discounts' && <DiscountsTab />}
          {dashboardTab === 'licenses' && <LicensesTab />}
          {dashboardTab === 'payouts' && <PayoutsTab />}
          {dashboardTab === 'instant-payouts' && <InstantPayoutsTab />}
          {dashboardTab === 'capital-advances' && <CapitalAdvanceTab />}
          {dashboardTab === 'meters' && <UsageMetersTab />}
          {dashboardTab === 'metered-overages' && <MeteredOveragesTab />}
          {dashboardTab === 'disputes' && <DisputesTab />}
          {dashboardTab === 'dispute-analytics' && <DisputeAnalyticsTab />}
          {dashboardTab === 'pre-dispute-alerts' && <PreDisputeTab />}
          {dashboardTab === 'dispute-rebuttal' && <DisputeRebuttalTab />}
          {dashboardTab === 'chargeback-insurance' && <InsuranceTab />}
          {dashboardTab === 'fraud-shield' && <FraudShieldTab />}
          {dashboardTab === 'dunning' && <DunningRadarTab />}
          {dashboardTab === 'sla-credits' && <SLACreditsTab />}
          {dashboardTab === 'treasury' && <TreasuryTab />}
          {dashboardTab === 'treasury-yield' && <TreasuryYieldTab />}
          {dashboardTab === 'fx-hedging' && <FxHedgingTab />}
          {dashboardTab === 'multi-entity' && <MultiEntityTab />}
          {dashboardTab === 'tax-nexus' && <TaxNexusTab />}
          {dashboardTab === 'tax-exemptions' && <TaxExemptionsTab />}
          {dashboardTab === 'tax-filings' && <TaxFilingsTab />}
          {dashboardTab === 'vendor-tax-forms' && <VendorTaxFormsTab />}
          {dashboardTab === 'reverse-charge-vault' && <ReverseChargeVaultTab />}
          {dashboardTab === 'zk-receipts' && <ZkReceiptsTab />}
          {dashboardTab === 'invoice-batch-export' && <InvoiceBatchExporterTab />}
          {dashboardTab === 'credit-notes' && <CreditNotesTab />}
          {dashboardTab === 'equity-waterfall' && <WaterfallTab />}
          {dashboardTab === 'webhook-dlq' && <WebhookDLQTab />}
          {dashboardTab === 'workflows' && <WorkflowsTab />}
          {dashboardTab === 'migration' && <MigrationTab />}
          {dashboardTab === 'developer' && <DeveloperTab />}
          {dashboardTab === 'team-audit' && <TeamAuditTab />}
          {dashboardTab === 'settings' && <SettingsTab />}
        </main>

        {/* 4-Step Onboarding Wizard Modal */}
        <OnboardingWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />

        {/* Inline Overlay Checkout SDK Modal */}
        <OverlayCheckoutModal isOpen={overlayOpen} onClose={() => setOverlayOpen(false)} />

        {/* Floating In-App Notifications Drawer */}
        <NotificationsDrawer isOpen={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)} />

      </div>

    </div>
  );
};
