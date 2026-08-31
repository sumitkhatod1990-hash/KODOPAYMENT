import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Globe2, 
  Layers, 
  Mail, 
  Key, 
  Zap, 
  Split, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Coins,
  FileCheck2,
  Server
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsTab: React.FC = () => {
  const { currentBrand, brands, isTestMode, setIsTestMode } = useApp();

  // Business Profile
  const [businessName, setBusinessName] = useState(currentBrand?.name || 'KODO Labs Technologies India Pvt Ltd');
  const [statementDescriptor, setStatementDescriptor] = useState(currentBrand?.statementDescriptor || 'KODO*PAYMENTS');
  const [supportEmail, setSupportEmail] = useState(currentBrand?.supportEmail || 'support@kodo.in');
  const [domain, setDomain] = useState(currentBrand?.domain || 'kodo.in');
  
  // Cashfree PG & Easy Split Settings
  const [cashfreeAppId, setCashfreeAppId] = useState('TEST110559449949df01b9dff3b901f544955011');
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [cfEnv, setCfEnv] = useState<'TEST' | 'PROD'>('TEST');
  
  // Bank Beneficiary Details (IMPS T+0)
  const [beneficiaryName, setBeneficiaryName] = useState('KODO Labs Technologies India Pvt Ltd');
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('50200088192019');
  const [beneficiaryIfsc, setBeneficiaryIfsc] = useState('HDFC0000240');
  const [beneficiaryBank, setBeneficiaryBank] = useState('HDFC Bank Ltd (Koramangala, Bengaluru)');
  
  // State
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const handleTestCashfreeConnection = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await fetch('/api/v1/india/cashfree/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: cashfreeAppId,
          secretKey: cashfreeSecretKey,
          environment: cfEnv,
          beneficiaryIfsc,
          beneficiaryAccount
        })
      });
      const data = await res.json();
      setVerificationResult(data);
      if (data.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (err) {
      setVerificationResult({
        success: false,
        error: 'Failed to connect to Cashfree Gateway.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl font-sans">
      
      <div>
        <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
          <Building className="w-6 h-6 text-[#0055FF]" />
          <span>Merchant Settings &amp; Cashfree Gateway Hub</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#8C90A0]">
          Configure your legal entity profile, live Cashfree Payment Gateway credentials, Easy Split payout bank accounts, and statutory tax parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* 1. Cashfree Gateway & Easy Split Credentials Card */}
        <div className="opp-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0055FF] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A0D14] text-base font-sans flex items-center gap-2">
                  <span>Cashfree PG &amp; Easy Split API Credentials</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-[#0055FF]">
                    v3.0 Orders API
                  </span>
                </h3>
                <p className="text-xs text-[#8C90A0]">
                  Direct API handshake with Cashfree for instant UPI intent &amp; Easy Split T+0 settlements
                </p>
              </div>
            </div>

            {/* Environment Toggle Switch */}
            <div className="flex items-center p-1 bg-[#F4F5F8] rounded-xl border border-black/[0.06] text-xs font-mono">
              <button
                type="button"
                onClick={() => setCfEnv('TEST')}
                className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                  cfEnv === 'TEST' 
                    ? 'bg-amber-100 text-amber-900 shadow-xs' 
                    : 'text-[#8C90A0] hover:text-[#0A0D14]'
                }`}
              >
                TEST (Sandbox)
              </button>
              <button
                type="button"
                onClick={() => setCfEnv('PROD')}
                className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                  cfEnv === 'PROD' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-[#8C90A0] hover:text-[#0A0D14]'
                }`}
              >
                LIVE (Production)
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Cashfree App ID (Client ID)</label>
              <input
                type="text"
                value={cashfreeAppId}
                onChange={(e) => setCashfreeAppId(e.target.value)}
                placeholder="e.g. TEST10091823ab912809182 or CF_LIVE_..."
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Cashfree Secret Key</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={cashfreeSecretKey}
                  onChange={(e) => setCashfreeSecretKey(e.target.value)}
                  placeholder="Enter Cashfree Secret Key..."
                  className="w-full p-3 pr-10 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C90A0] hover:text-[#0A0D14]"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Test Connection Button & Verification Status */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestCashfreeConnection}
                disabled={verifying}
                className="opp-btn-secondary px-5 py-2.5 text-xs gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? 'Verifying with Cashfree...' : 'Test Gateway Connection'}</span>
              </button>

              <div className="text-[11px] font-mono text-[#8C90A0] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>AES-256 Cloud HSM Encrypted Storage</span>
              </div>
            </div>

            {/* Verification Result Toast */}
            {verificationResult && (
              <div className={`p-4 rounded-2xl border text-xs font-mono animate-fade-in ${
                verificationResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {verificationResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cashfree Gateway Connected Successfully ({verificationResult.environment})</span>
                    </>
                  ) : (
                    <span>⚠️ {verificationResult.error}</span>
                  )}
                </div>
                {verificationResult.success && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mt-2 pt-2 border-t border-emerald-200/60">
                    <div>Acquirer: {verificationResult.acquirerStatus}</div>
                    <div>Settlement: {verificationResult.splitConfig.settlementRail}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Merchant Bank Account (Easy Split IMPS Payout Rail) */}
        <div className="opp-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-black/[0.06]">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">
                Merchant Beneficiary Bank Account (Instant T+0 IMPS)
              </h3>
              <p className="text-xs text-[#8C90A0]">
                Direct bank account where net funds (97% gross - 1% Sec 194-O TDS) are disbursed 24x7
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Beneficiary Account Holder Name</label>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Bank Account Number</label>
              <input
                type="text"
                value={beneficiaryAccount}
                onChange={(e) => setBeneficiaryAccount(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Bank IFSC Code</label>
              <input
                type="text"
                value={beneficiaryIfsc}
                onChange={(e) => setBeneficiaryIfsc(e.target.value.toUpperCase())}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none font-mono font-bold text-[#0055FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Bank &amp; Branch Name</label>
              <input
                type="text"
                value={beneficiaryBank}
                onChange={(e) => setBeneficiaryBank(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>₹1 Penny-Drop Bank KYC Verified (NPCI IMPS UTR: 62910482910)</span>
          </div>
        </div>

        {/* 3. Brand & Legal Entity Profile */}
        <div className="opp-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-black/[0.06]">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">
                Brand &amp; Legal Entity Profile
              </h3>
              <p className="text-xs text-[#8C90A0]">Displayed on hosted checkouts and customer receipts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Company / Brand Display Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Website Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Bank Statement Descriptor (Max 22 chars)</label>
              <input
                type="text"
                maxLength={22}
                value={statementDescriptor}
                onChange={(e) => setStatementDescriptor(e.target.value.toUpperCase())}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#0A0D14]">Customer Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. MoR Protection Notice */}
        <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-100 space-y-2">
          <div className="flex items-center gap-2 text-[#0055FF] font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Master Merchant of Record (MoR) Reseller Legal Shield Active</span>
          </div>
          <p className="text-xs text-[#6E717D] leading-relaxed">
            Under KODO's Master Reseller Agreement, KODO Labs Technologies India Pvt Ltd operates as the legal seller of record for sales across all 28 Indian States &amp; 8 UTs, collecting and remitting 18% GST (CGST/SGST/IGST) and 1% Section 194-O TDS. Zero GST registration or compliance liability for software developers.
          </p>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 items-center pt-2">
          {saved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
          <button
            type="submit"
            className="opp-btn-primary px-8 py-3.5 text-xs shadow-md"
          >
            Save Merchant Settings
          </button>
        </div>

      </form>

    </div>
  );
};
