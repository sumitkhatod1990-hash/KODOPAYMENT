import React from 'react';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { SupportChat } from '../common/SupportChat';
import { FileText, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#1d1d1f] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full" style={{ paddingTop: 'var(--qp-navbar-height, 4.5rem)' }}>
        {/* Header Section */}
        <div className="border-b border-black/5 bg-[#fafafc]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0071e3] mb-3">
              <FileText className="w-3.5 h-3.5" />
              Legal &amp; Terms
            </div>
            <h1 className="text-3xl sm:text-[2.25rem] sm:leading-tight font-bold text-[#1d1d1f] font-heading tracking-tight">
              Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the QivroPay platform, website (qivropay.com), APIs, developer tools, and merchant checkout software (collectively, the &quot;Services&quot;). By creating a QivroPay account, accessing our site, or utilizing our software, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              If you are agreeing to these Terms on behalf of a company or legal entity, you represent that you have the authority to bind that entity to these Terms.
            </p>
          </div>

          {/* Section: Platform Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              2. Platform Architecture &amp; Role
            </h2>
            <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-3 text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              <p>
                <strong>Software &amp; Checkout Infrastructure:</strong> QivroPay is a software technology platform offering payment checkout session generation, merchant analytics, product link management, developer REST APIs, and billing software tools for Indian businesses.
              </p>
              <p>
                <strong>Payment Acquiring &amp; Settlement:</strong> Payment processing, banking gateway connectivity, card/UPI acquiring, and monetary settlements are facilitated through licensed payment infrastructure partners, including Cashfree Payments India Private Limited.
              </p>
              <p>
                <strong>Regulatory Clarification:</strong> QivroPay operates as a software technology platform and does not claim standalone banking licenses or independent central bank authorizations. All monetary funds and transaction settlements are handled directly through authorized payment acquiring partners in compliance with applicable Indian financial regulations.
              </p>
            </div>
          </div>

          {/* Section: Account & Verification */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              3. Account Registration &amp; Merchant Verification
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span><strong>Registration:</strong> You may register via standard email/password credentials or Google Sign-In. You must provide accurate, complete registration details and keep your login credentials secure.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span><strong>Sandbox vs. Live Mode:</strong> All new accounts receive access to a sandbox environment for integration testing. Activation of live payment processing requires completing merchant onboarding and KYC verification with our payment infrastructure partner (Cashfree Payments).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your session tokens, passwords, and generated API keys (<code className="font-mono text-[11px]">qivro_live_...</code> / <code className="font-mono text-[11px]">qivro_test_...</code>).</span>
              </li>
            </ul>
          </div>

          {/* Section: Acceptable Use */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              4. Acceptable Use &amp; Merchant Obligations
            </h2>
            <div className="p-6 rounded-3xl bg-[#fafafc] border border-black/5 space-y-3 text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              <p>
                When using QivroPay, you agree not to engage in or facilitate any of the following prohibited activities:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#6e6e73]">
                <li>Selling illegal products, prohibited goods, or unauthorized services under Indian law.</li>
                <li>Engaging in deceptive, fraudulent, or abusive merchant practices.</li>
                <li>Attempting to bypass platform security, reverse engineer backend APIs, or exploit system vulnerabilities.</li>
                <li>Initiating unauthorized transactions or facilitating money laundering.</li>
              </ul>
            </div>
          </div>

          {/* Section: Fees, Payments & Refunds */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              5. Pricing, Fees &amp; Customer Refunds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm space-y-2">
                <div className="font-bold text-xs sm:text-sm text-[#1d1d1f]">
                  Platform Pricing
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Fees for using QivroPay and acquiring rates are specified on our official Pricing section or agreed upon in writing. Fees may be updated with prior notice.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm space-y-2">
                <div className="font-bold text-xs sm:text-sm text-[#1d1d1f]">
                  Refund Management
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Merchants are solely responsible for setting clear refund policies for their customers and managing customer refund requests through the QivroPay API or dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Section: IP & Service Availability */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              6. Intellectual Property &amp; Availability
            </h2>
            <p className="text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              All rights, titles, and interests in and to QivroPay software, user interfaces, branding, API specifications, and code remain the exclusive property of QivroPay.
            </p>
            <div className="p-4 rounded-2xl bg-[#fafafc] border border-black/5 text-xs text-[#6e6e73] leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#1d1d1f]">Service Availability &amp; Disclaimer:</strong> The platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While we strive for 99.9% uptime, QivroPay makes no guarantees against occasional maintenance windows, network interruptions, or partner gateway outages.
              </div>
            </div>
          </div>

          {/* Section: Limitation of Liability & Termination */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] font-heading">
              7. Limitation of Liability &amp; Governing Law
            </h2>
            <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-3 text-xs sm:text-sm text-[#3a3a3c] leading-relaxed">
              <p>
                <strong>Limitation of Liability:</strong> To the maximum extent permitted by applicable law, QivroPay shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues arising out of or related to your use of the Services.
              </p>
              <p>
                <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of courts located in India.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#f5f5f7] border border-black/5 space-y-3">
            <div className="font-bold text-[#1d1d1f] text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0071e3]" />
              8. Contact Us
            </div>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              If you have any questions regarding these Terms of Service, please reach out to our team at:
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
