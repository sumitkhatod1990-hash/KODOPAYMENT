import React from 'react';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { SupportChat } from '../common/SupportChat';
import { ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#1d1d1f] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full" style={{ paddingTop: 'var(--qp-navbar-height, 4.5rem)' }}>
        {/* Header Section */}
        <div className="border-b border-black/5 bg-[#fafafc]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0071e3] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Legal &amp; Compliance
            </div>
            <h1 className="text-3xl sm:text-[2.25rem] sm:leading-tight font-bold text-[#1d1d1f] font-heading tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              Effective Date: September 4, 2026 &nbsp;|&nbsp; Last Updated: September 4, 2026
            </p>
          </div>
        </div>

        {/* Policy Content Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">

          {/* Intro Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#fafafc] border border-black/5 space-y-3">
            <h2 className="text-lg font-bold text-[#1d1d1f] font-heading">
              1. Overview &amp; Scope
            </h2>
            <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              QivroPay (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates a merchant payment software and checkout platform designed for businesses in India. QivroPay provides software tools, API infrastructure, checkout session generation, and merchant dashboard management. Payment processing, acquiring, and financial settlements are executed through authorized third-party payment infrastructure partners, including Cashfree Payments India Private Limited.
            </p>
            <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              This Privacy Policy explains how QivroPay collects, uses, stores, and protects personal and business information when you visit our website (qivropay.com), register for an account, integrate our API, or authenticate using third-party identity providers such as Google Sign-In.
            </p>
          </div>

          {/* Section: Information Collected */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              2. Information We Collect
            </h2>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              We collect information to provide, maintain, and secure our payment infrastructure services:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm space-y-2">
                <div className="font-bold text-xs sm:text-sm text-[#1d1d1f] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#0071e3]" />
                  Direct Account Information
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  When you sign up using email and password, we collect your full name, business or company name, email address, and a securely salted password hash.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm space-y-2">
                <div className="font-bold text-xs sm:text-sm text-[#1d1d1f] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0071e3]" />
                  Payment &amp; Transaction Metadata
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Transaction titles, amounts, currency (INR), customer billing emails, checkout session statuses, and order IDs created through your account.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Google Sign-In Data */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0071e3]/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold text-xs">
                G
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
                3. Google Sign-In &amp; Google User Data
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              QivroPay allows merchants and users to register or log in using Google Sign-In via Google Identity Services (GIS).
            </p>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]">
                A. Data Received from Google
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#3a3a3c]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Google Account Email Address:</strong> Used as your primary account identifier.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Google Profile Name:</strong> Used to personalize your QivroPay merchant dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Profile Picture URL:</strong> Used optionally for avatar display if provided by Google.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Google Subject Identifier (Google sub):</strong> A stable numeric ID provided by Google to securely link your Google account with existing QivroPay credentials.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]">
                B. How We Use Google User Data
              </h3>
              <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
                Google user data is used exclusively to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#6e6e73]">
                <li>Authenticate your identity and grant access to your QivroPay account.</li>
                <li>Automatically match and link your verified Google email address to your existing QivroPay account to prevent duplicate accounts.</li>
                <li>Maintain active web session authentication cookies (<code className="font-mono text-[11px]">qivropay_session</code>).</li>
                <li>Send transactional notifications such as welcome information and account security alerts.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]">
                C. Explicit Limitations on Google Service Access
              </h3>
              <div className="p-4 rounded-2xl bg-[#fafafc] border border-black/5 text-xs text-[#3a3a3c] leading-relaxed space-y-2">
                <p>
                  <strong>No Access to Other Google Services:</strong> QivroPay only requests basic identity scopes (<code className="font-mono text-[11px]">openid</code>, <code className="font-mono text-[11px]">email</code>, <code className="font-mono text-[11px]">profile</code>). QivroPay <strong>does not request or access</strong> your Google Drive, Gmail messages, Google Calendar, Google Contacts, photos, or any other sensitive Google APIs.
                </p>
                <p>
                  <strong>No Data Sale:</strong> QivroPay <strong>does not sell, rent, or trade</strong> your Google account data, personal information, or user details to third-party data brokers, advertising networks, or marketing partners.
                </p>
              </div>
            </div>
          </div>

          {/* Section: How Data is Used & Shared */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              4. How We Use &amp; Share Information
            </h2>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              We process personal and transaction data solely to operate QivroPay securely:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              <li><strong>Service Operations:</strong> Managing merchant accounts, processing payment links, rendering checkout interfaces, and providing developer API access.</li>
              <li><strong>Payment Infrastructure Partners:</strong> Sharing necessary merchant onboarding and transaction data with our licensed payment acquiring partners (such as Cashfree Payments India Private Limited) to complete payment processing, KYC verification, and settlements.</li>
              <li><strong>Transactional Email Services:</strong> Using transaction email delivery infrastructure (such as Brevo) to dispatch essential merchant communications.</li>
              <li><strong>Legal Compliance:</strong> Disclosing information only when required by law, regulation, subpoena, or law enforcement authority under Indian jurisdiction.</li>
            </ul>
          </div>

          {/* Section: Security & Storage */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              5. Data Storage &amp; Security Practices
            </h2>
            <div className="p-6 rounded-3xl bg-[#fafafc] border border-black/5 space-y-3 text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              <p>
                QivroPay implements technical safeguards appropriate for payment software platforms:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6e6e73]">
                <li><strong>Encryption in Transit:</strong> All web traffic and API communications are encrypted using Transport Layer Security (TLS/HTTPS).</li>
                <li><strong>Session Security:</strong> User sessions are managed via secure, HttpOnly, SameSite cookies to protect against cross-site scripting (XSS) and token theft.</li>
                <li><strong>Database Infrastructure:</strong> Account details and metadata are stored in managed PostgreSQL database infrastructure (Neon) with access controls and audit logging.</li>
                <li><strong>Credential Protection:</strong> Passwords are protected using scrypt-based password hashing before storage. Google OAuth ID tokens are verified server-side using standard cryptographic techniques and are never stored in plain text.</li>
              </ul>
            </div>
          </div>

          {/* Section: User Rights */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              6. Your Rights &amp; Choices
            </h2>
            <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              You have the right to access, update, or request deletion of your QivroPay merchant account information at any time. You may also revoke QivroPay&apos;s access to your Google account at any time via your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] underline">Google Account Security Settings</a>.
            </p>
          </div>

          {/* Contact Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#f5f5f7] border border-black/5 space-y-3">
            <div className="font-bold text-[#1d1d1f] text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0071e3]" />
              7. Contact Information
            </div>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact our support team at:
            </p>
            <div className="pt-1">
              <a href="mailto:info@qivropay.com" className="text-xs sm:text-sm font-bold text-[#0071e3] hover:underline">
                info@qivropay.com
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <SupportChat />
    </div>
  );
};
