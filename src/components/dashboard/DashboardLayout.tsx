import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardThemeProvider, useDashboardTheme } from '../../hooks/useDashboardTheme';
import { Logo } from '../common/Logo';
import { OverviewTab } from './OverviewTab';
import { AnalyticsTab } from './AnalyticsTab';
import { PaymentsTab } from './PaymentsTab';
import { ProductsTab } from './ProductsTab';
import { PaymentLinksTab } from './PaymentLinksTab';
import { CustomersTab } from './CustomersTab';
import { DeveloperTab } from './DeveloperTab';
import { SettingsTab } from './SettingsTab';
import { PaymentSetupTab } from './PaymentSetupTab';
import { SettlementsTab } from './SettlementsTab';
import { SupportChat } from '../common/SupportChat';
import { LayoutDashboard, BarChart3, CreditCard, Package, Link2, Users, Code2, Settings, ShieldCheck, Landmark, ArrowLeft, LogOut, Moon, Sun, ShieldAlert, CheckCircle2 } from 'lucide-react';


type CoreTab = 'home' | 'analytics' | 'verification' | 'payments' | 'settlements' | 'products' | 'payment-links' | 'customers' | 'developer' | 'settings';

const nav: Array<{ id: CoreTab; label: string; icon: React.ElementType }> = [
  { id: 'home', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'verification', label: 'Set Up Payments', icon: ShieldCheck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'payment-links', label: 'Payment links', icon: Link2 },
  { id: 'settlements', label: 'Settlements', icon: Landmark },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'developer', label: 'Developers', icon: Code2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => (
  <DashboardThemeProvider>
    <DashboardLayoutShell />
  </DashboardThemeProvider>
);

const DashboardLayoutShell: React.FC = () => {
  const { dashboardTab, setDashboardTab, setCurrentView, activeEnvironment, switchEnvironment, isLiveEligible, liveEligibilityReason } = useApp();
  const { user, signOut } = useAuth();
  const { dark, toggleDark } = useDashboardTheme();
  const [showLiveEligibilityModal, setShowLiveEligibilityModal] = React.useState(false);
  const [showLiveConfirmModal, setShowLiveConfirmModal] = React.useState(false);
  const [switchingEnv, setSwitchingEnv] = React.useState(false);

  const active = (nav.some(item => item.id === dashboardTab) ? dashboardTab : 'home') as CoreTab;
  const title = nav.find(item => item.id === active)?.label || 'Overview';

  const logout = async () => {
    await signOut();
    setCurrentView('landing');
  };

  return (
    // The `dark` class lives only on this wrapper (never on <html>/<body>),
    // so Tailwind's `dark:` variant and the `.dark` rules in index.css only
    // ever match inside the authenticated dashboard shell — the public site
    // is a sibling subtree elsewhere in the app and never sees this class.
    <div className={dark ? 'dark' : undefined}>
    <div className="qp-dashboard min-h-screen flex bg-[#f5f5f7] dark:bg-[#07090e] text-[#1d1d1f] dark:text-slate-100">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white dark:bg-[#0c0f17] border-r border-black/10 dark:border-white/10">
        <div className="p-5 border-b border-black/5 dark:border-white/10"><Logo variant={dark ? 'white' : 'black'} /></div>
        <div className="px-4 pt-5 pb-3">
          <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400">Merchant workspace</div>
          <div className="mt-2 font-semibold truncate">{user?.company || 'Your business'}</div>
          <div className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</div>
        </div>
        <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
          {nav.map(item => {
            const Icon = item.icon;
            const selected = item.id === active;
            return <button key={item.id} onClick={() => setDashboardTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${selected ? 'bg-[#111827] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /><span>{item.label}</span>
            </button>;
          })}
        </nav>
        <div className="p-3 border-t border-black/5 dark:border-white/10 space-y-1">
          {/* Opens in a new tab rather than setCurrentView('docs') — docs uses
              the public site shell (Navbar/Footer), and switching this tab's
              currentView to 'docs' would unmount the dashboard and strand the
              merchant on the marketing site if they then clicked the docs
              Navbar's logo/Overview link. */}
          <button onClick={() => window.open('/docs', '_blank', 'noopener')} className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-left">Developer docs ↗</button>
          <button onClick={() => setCurrentView('landing')} className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 text-left flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> QivroPay home</button>
          <button onClick={logout} className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 bg-white dark:bg-[#0c0f17] border-b border-black/10 dark:border-white/10 px-4 sm:px-7 flex items-center justify-between">
          <div><div className="text-lg font-bold">{title}</div><div className="text-xs text-slate-500 hidden sm:block">Global payments & checkout infrastructure</div></div>
          <div className="flex items-center gap-3">
            {/* Mode Switcher: TEST / LIVE */}
            <div className="flex items-center bg-slate-100 dark:bg-white/10 p-1 rounded-xl text-xs font-bold" role="group" aria-label="Environment switcher">
              <button
                type="button"
                onClick={() => {
                  if (activeEnvironment === 'live') {
                    switchEnvironment('test');
                  }
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeEnvironment === 'test'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeEnvironment === 'test' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
                TEST
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeEnvironment === 'test') {
                    if (!isLiveEligible) {
                      setShowLiveEligibilityModal(true);
                    } else {
                      setShowLiveConfirmModal(true);
                    }
                  }
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeEnvironment === 'live'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeEnvironment === 'live' ? 'bg-white' : 'bg-slate-400'}`} />
                LIVE
              </button>
            </div>

            <button onClick={toggleDark} className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5" aria-label="Toggle theme">{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <button onClick={() => setDashboardTab('payment-links' as any)} className="hidden sm:flex px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-bold">Create payment link</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-7 lg:p-9">
          {active === 'home' && <OverviewTab onNavigateTab={(tab) => setDashboardTab(tab as any)} />}
          {active === 'analytics' && <AnalyticsTab />}
          {active === 'verification' && <PaymentSetupTab />}
          {active === 'payments' && <PaymentsTab />}
          {active === 'settlements' && <SettlementsTab />}
          {active === 'products' && <ProductsTab />}
          {active === 'payment-links' && <PaymentLinksTab />}
          {active === 'customers' && <CustomersTab />}
          {active === 'developer' && <DeveloperTab />}
          {active === 'settings' && <SettingsTab />}
        </main>

        <nav className="md:hidden sticky bottom-0 z-20 bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur border-t border-black/10 dark:border-white/10 px-2 py-2 overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-[4.75rem] gap-1 min-w-max">
            {nav.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setDashboardTab(item.id as any)} className={`min-h-12 py-2 px-1 rounded-xl text-[10px] leading-tight font-bold flex flex-col items-center justify-center gap-1 ${active === item.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' : 'text-slate-500'}`}><Icon className="w-4 h-4 shrink-0" /><span className="block truncate max-w-full">{item.label}</span></button>; })}
          </div>
        </nav>
      </div>
      <SupportChat />

      {/* Ineligible for Live Payments Modal */}
      {showLiveEligibilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#12161f] border border-black/10 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Complete Verification for Live Payments</h3>
                <p className="text-xs text-slate-500">Live mode requires Cashfree production onboarding</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-semibold">Verification Status:</div>
              <div>{liveEligibilityReason || 'Cashfree Partner account is not yet verified or active for live processing.'}</div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Live payments require:</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Cashfree Partner sub-merchant account created</li>
                <li>Minimum KYC approved by Cashfree risk & compliance</li>
                <li>Active payment processing status with full transaction access</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowLiveEligibilityModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Stay in Test Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLiveEligibilityModal(false);
                  setDashboardTab('verification' as any);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                Go to Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Switch to Live Mode Modal */}
      {showLiveConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#12161f] border border-black/10 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Switch to Live Mode</h3>
                <p className="text-xs text-slate-500">Real payment processing via Cashfree</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are switching to <strong>Live Production mode</strong>. All customer payments, checkout sessions, and API transactions will process real funds through Cashfree production rails.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
              <button
                type="button"
                disabled={switchingEnv}
                onClick={() => setShowLiveConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={switchingEnv}
                onClick={async () => {
                  setSwitchingEnv(true);
                  const res = await switchEnvironment('live');
                  setSwitchingEnv(false);
                  if (res.success) {
                    setShowLiveConfirmModal(false);
                  } else {
                    alert(res.error || 'Failed to switch to Live mode');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
              >
                {switchingEnv ? 'Switching...' : 'Confirm Live Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
