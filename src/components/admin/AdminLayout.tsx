import React, { useState } from 'react';
import { useAdminAuth, AdminRole } from '../../context/AdminAuthContext';
import { navigateAdmin } from '../../utils/adminDomain';
import {
  LayoutDashboard,
  Users,
  LifeBuoy,
  MessageSquare,
  CreditCard,
  FileCheck,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Shield,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/',
    icon: LayoutDashboard,
    allowedRoles: ['super_admin', 'compliance_officer', 'support_agent', 'read_only']
  },
  {
    id: 'clients',
    label: 'Clients',
    path: '/clients',
    icon: Users,
    allowedRoles: ['super_admin', 'compliance_officer', 'support_agent', 'read_only']
  },
  {
    id: 'tickets',
    label: 'Tickets',
    path: '/tickets',
    icon: LifeBuoy,
    allowedRoles: ['super_admin', 'support_agent']
  },
  {
    id: 'chat',
    label: 'Chat Logs',
    path: '/chat',
    icon: MessageSquare,
    allowedRoles: ['super_admin', 'support_agent']
  },
  {
    id: 'payments',
    label: 'Payments',
    path: '/payments',
    icon: CreditCard,
    allowedRoles: ['super_admin', 'compliance_officer', 'support_agent', 'read_only']
  },
  {
    id: 'onboarding',
    label: 'Onboarding / KYC',
    path: '/onboarding',
    icon: FileCheck,
    allowedRoles: ['super_admin', 'compliance_officer', 'read_only']
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: ShieldAlert,
    allowedRoles: ['super_admin', 'compliance_officer', 'read_only']
  }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, children }) => {
  const { adminUser, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const role = adminUser?.role || 'read_only';

  // Filter navigation items by role
  const visibleNav = NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    navigateAdmin(path);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case 'super_admin':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'compliance_officer':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'support_agent':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'read_only':
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  };

  const formatRoleName = (r: string) => {
    switch (r) {
      case 'super_admin':
        return 'Super Admin';
      case 'compliance_officer':
        return 'Compliance Officer';
      case 'support_agent':
        return 'Support Agent';
      case 'read_only':
        return 'Read Only';
      default:
        return r;
    }
  };

  // Find active nav title for breadcrumb
  const currentNav = visibleNav.find((n) => {
    if (n.path === '/' && (currentPath === '/' || currentPath === '/overview')) return true;
    if (n.path !== '/' && currentPath.startsWith(n.path)) return true;
    return false;
  }) || { label: 'Console' };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0D1322] border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Open operations menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">QivroPay</span>
            <span className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider rounded bg-blue-500/20 text-blue-400 font-semibold">
              Ops
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-400 font-mono">client.qivropay.com</span>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0D1322] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">QivroPay</span>
                <span className="text-[9px] px-1.5 py-0.2 uppercase tracking-wider font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Ops
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-tight">
                client.qivropay.com
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Platform Management
          </div>

          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? currentPath === '/' || currentPath === '/overview'
                : currentPath.startsWith(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile & Logout Section */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090D16]/50">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {adminUser?.name || 'Administrator'}
                </div>
                <div className="text-[11px] text-slate-400 truncate font-mono">
                  {adminUser?.email || ''}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span
                className={`inline-flex items-center text-[10px] px-2 py-0.5 font-medium rounded-md border ${getRoleBadgeColor(
                  role
                )}`}
              >
                {formatRoleName(role)}
              </span>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 py-1 px-1.5 rounded hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                title="Sign out of operations"
              >
                <LogOut className="w-3 h-3" />
                <span>{isLoggingOut ? '...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Operational Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#0D1322] border-b border-slate-800/80 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Operations Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <h2 className="text-sm font-semibold text-white">{currentNav.label}</h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">PROD HOST: client.qivropay.com</span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh console"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main View Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
