import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Server
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsTab: React.FC = () => {
  const { merchantProfile, saveMerchantProfile } = useApp();

  // Store profile — real, merchant-scoped, persisted server-side.
  const [businessName, setBusinessName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (merchantProfile) {
      setBusinessName(merchantProfile.businessName);
      setSupportEmail(merchantProfile.supportEmail);
    }
  }, [merchantProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) { setProfileError('Store / business name is required'); return; }
    setProfileError('');
    setProfileSaving(true);
    const result = await saveMerchantProfile({ businessName: businessName.trim(), supportEmail: supportEmail.trim() });
    setProfileSaving(false);
    if (!result.success) { setProfileError(result.error || 'Could not save your details. Please try again.'); return; }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Payment infrastructure status — QivroPay manages Cashfree connectivity
  // centrally in this version; there is no per-merchant gateway credential
  // to configure. This checks the platform's own connection, truthfully.
  const [checking, setChecking] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);

  const handleCheckInfrastructure = async () => {
    setChecking(true);
    setStatusResult(null);
    try {
      const res = await fetch('/api/v1/india/cashfree/verify-credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      setStatusResult(data);
      if (data.success) confetti({ particleCount: 40, spread: 55, origin: { y: 0.8 } });
    } catch {
      setStatusResult({ success: false, error: 'Could not reach QivroPay’s payment infrastructure.' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl font-sans">

      <div>
        <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
          <Building className="w-6 h-6 text-[#0055FF]" />
          <span>Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#8C90A0]">
          Your store profile and payment infrastructure status.
        </p>
      </div>

      {/* 1. Store Profile — real, persisted */}
      <form onSubmit={handleSaveProfile} className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-black/[0.06]">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#0A0D14] text-base font-sans">Store Profile</h3>
            <p className="text-xs text-[#8C90A0]">Shown on your checkout pages and customer receipts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="store-name" className="font-semibold text-[#0A0D14]">Store / business name</label>
            <input
              id="store-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="support-email" className="font-semibold text-[#0A0D14]">Support email <span className="font-normal text-[#8C90A0]">(optional)</span></label>
            <input
              id="support-email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-black/[0.08] bg-[#FAFBFD] text-[#0A0D14] focus:border-[#0055FF] outline-none"
            />
          </div>
        </div>

        {profileError && <p role="alert" className="text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{profileError}</p>}

        <div className="flex justify-end gap-3 items-center pt-2">
          {profileSaved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
          <button type="submit" disabled={profileSaving} className="opp-btn-primary px-6 py-2.5 text-xs disabled:opacity-50">
            {profileSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* 2. Payment Infrastructure — truthful, managed-infrastructure status */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-black/[0.06]">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0055FF] flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#0A0D14] text-base font-sans">Payment Infrastructure</h3>
            <p className="text-xs text-[#8C90A0]">How your account connects to UPI and card payments</p>
          </div>
        </div>

        <p className="text-xs text-[#6E717D] leading-relaxed">
          QivroPay currently manages the payment infrastructure for your account, built on Cashfree.
          Merchant-specific gateway credentials are not configurable in this version — there is nothing
          to enter here, and nothing is stored in your browser.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCheckInfrastructure}
            disabled={checking}
            className="opp-btn-secondary px-5 py-2.5 text-xs gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking…' : 'Check Payment Infrastructure'}</span>
          </button>
        </div>

        {statusResult && (
          <div className={`p-4 rounded-2xl border text-xs font-mono ${
            statusResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {statusResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Payment infrastructure is connected ({statusResult.environment})</span>
                </>
              ) : (
                <span>⚠️ {statusResult.error || 'Could not reach the payment infrastructure right now.'}</span>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
