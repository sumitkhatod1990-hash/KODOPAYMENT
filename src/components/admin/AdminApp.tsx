import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminPath, navigateAdmin } from '../../utils/adminDomain';
import { AdminLayout } from './AdminLayout';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminOverviewPage } from './AdminOverviewPage';
import { AdminClientsPage } from './AdminClientsPage';
import { AdminClient360Page } from './AdminClient360Page';
import { AdminTicketsPage } from './AdminTicketsPage';
import { AdminTicketDetailPage } from './AdminTicketDetailPage';
import { AdminChatLogsPage } from './AdminChatLogsPage';
import { AdminChatLogDetailPage } from './AdminChatLogDetailPage';
import { AdminPaymentsPage } from './AdminPaymentsPage';
import { AdminPaymentDetailPage } from './AdminPaymentDetailPage';
import { AdminOnboardingPage } from './AdminOnboardingPage';
import { AdminOnboardingDetailPage } from './AdminOnboardingDetailPage';
import { AdminAuditLogsPage } from './AdminAuditLogsPage';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { adminUser, loading, error } = useAdminAuth();
  const [currentPath, setCurrentPath] = useState<string>(getAdminPath());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getAdminPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle route protections
  useEffect(() => {
    if (loading) return;

    if (!adminUser && currentPath !== '/login') {
      try {
        sessionStorage.setItem('qivropay_admin_redirect', currentPath);
      } catch {}
      navigateAdmin('/login');
      setCurrentPath('/login');
    } else if (adminUser && currentPath === '/login') {
      let target = '/';
      try {
        target = sessionStorage.getItem('qivropay_admin_redirect') || '/';
        sessionStorage.removeItem('qivropay_admin_redirect');
      } catch {}
      navigateAdmin(target);
      setCurrentPath(target);
    }
  }, [adminUser, loading, currentPath]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
          <span>Connecting to QivroPay Operations Gateway...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> Login View
  if (!adminUser) {
    return <AdminLoginPage />;
  }

  // Suspended Account Check
  if (adminUser.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0F172A] border border-rose-900/60 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-800">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Administrative Access Suspended</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your administrative profile ({adminUser.email}) has been marked as suspended by platform security.
          </p>
          <button
            onClick={() => {
              fetch('/api/v1/admin/auth/logout', { method: 'POST', credentials: 'include' }).finally(() => {
                window.location.href = '/login';
              });
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // RBAC Permission Check
  const role = adminUser.role;
  const isSuperAdmin = role === 'super_admin';
  const isCompliance = role === 'compliance_officer';
  const isSupport = role === 'support_agent';
  const isReadOnly = role === 'read_only';

  const renderContent = () => {
    // Client 360 route: /clients/:merchantId
    const clientDetailMatch = currentPath.match(/^\/clients\/([^/]+)\/?$/);
    if (clientDetailMatch) {
      const merchantId = decodeURIComponent(clientDetailMatch[1]);
      return <AdminClient360Page merchantId={merchantId} />;
    }

    if (currentPath === '/clients' || currentPath === '/clients/') {
      return <AdminClientsPage />;
    }

    // Ticket Detail route: /tickets/:ticketId
    const ticketDetailMatch = currentPath.match(/^\/tickets\/([^/]+)\/?$/);
    if (ticketDetailMatch) {
      const ticketId = decodeURIComponent(ticketDetailMatch[1]);
      if (!isSuperAdmin && !isSupport) {
        return <AccessRestrictedModule module="Support Ticket Detail" requiredRoles={['super_admin', 'support_agent']} />;
      }
      return <AdminTicketDetailPage ticketId={ticketId} />;
    }

    if (currentPath === '/tickets' || currentPath === '/tickets/') {
      if (!isSuperAdmin && !isSupport) {
        return <AccessRestrictedModule module="Support Tickets" requiredRoles={['super_admin', 'support_agent']} />;
      }
      return <AdminTicketsPage />;
    }

    // Chat Log Detail route: /chat-logs/:sessionId or /chat/:sessionId
    const chatDetailMatch = currentPath.match(/^\/(?:chat-logs|chat)\/([^/]+)\/?$/);
    if (chatDetailMatch) {
      const sessionId = decodeURIComponent(chatDetailMatch[1]);
      if (!isSuperAdmin && !isSupport) {
        return <AccessRestrictedModule module="Chat Transcripts" requiredRoles={['super_admin', 'support_agent']} />;
      }
      return <AdminChatLogDetailPage sessionId={sessionId} />;
    }

    if (currentPath === '/chat' || currentPath === '/chat-logs' || currentPath === '/chat/' || currentPath === '/chat-logs/') {
      if (!isSuperAdmin && !isSupport) {
        return <AccessRestrictedModule module="Chat Transcripts" requiredRoles={['super_admin', 'support_agent']} />;
      }
      return <AdminChatLogsPage />;
    }

    // Payment Detail route: /payments/:paymentId
    const paymentDetailMatch = currentPath.match(/^\/payments\/([^/]+)\/?$/);
    if (paymentDetailMatch) {
      const paymentId = decodeURIComponent(paymentDetailMatch[1]);
      return <AdminPaymentDetailPage paymentId={paymentId} />;
    }

    if (currentPath === '/payments' || currentPath === '/payments/') {
      return <AdminPaymentsPage />;
    }

    // Onboarding Detail route: /onboarding/:merchantId
    const onboardingDetailMatch = currentPath.match(/^\/onboarding\/([^/]+)\/?$/);
    if (onboardingDetailMatch) {
      const merchantId = decodeURIComponent(onboardingDetailMatch[1]);
      return <AdminOnboardingDetailPage merchantId={merchantId} />;
    }

    if (currentPath === '/onboarding' || currentPath === '/onboarding/') {
      return <AdminOnboardingPage />;
    }

    if (currentPath === '/audit-logs' || currentPath === '/audit-logs/') {
      if (!isSuperAdmin && !isCompliance && !isReadOnly) {
        return <AccessRestrictedModule module="Platform Audit Logs" requiredRoles={['super_admin', 'compliance_officer', 'read_only']} />;
      }
      return <AdminAuditLogsPage />;
    }

    // Default to Overview (root / or /overview)
    return <AdminOverviewPage />;
  };

  return (
    <AdminLayout currentPath={currentPath}>
      {renderContent()}
    </AdminLayout>
  );
};

interface AccessRestrictedProps {
  module: string;
  requiredRoles: string[];
}

const AccessRestrictedModule: React.FC<AccessRestrictedProps> = ({ module, requiredRoles }) => {
  return (
    <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Access Restricted</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Your administrative account role does not have authorization to access the <strong className="text-slate-200">{module}</strong> module.
        </p>
      </div>
      <button
        onClick={() => navigateAdmin('/')}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
      >
        Return to Overview
      </button>
    </div>
  );
};
