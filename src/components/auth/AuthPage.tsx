import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { setCurrentView, authMode } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>(authMode);
  const [name, setName] = useState(''); const [company, setCompany] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setBusy(true);
    const result = mode === 'signup' ? await signUp({ name, company, email, password }) : await signIn(email, password);
    setBusy(false); if (!result.success) { setError(result.error || 'Please try again'); return; }
    setCurrentView('dashboard');
  };
  const submitGoogle = async (credential: string) => {
    setError(''); setBusy(true);
    const result = await signInWithGoogle(credential);
    setBusy(false); if (!result.success) { setError(result.error || 'Please try again'); return; }
    setCurrentView('dashboard');
  };
  return <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] bg-white rounded-[28px] overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.12)] border border-black/[0.06]">
      <div className="hidden lg:flex bg-[#08111f] text-white p-12 flex-col justify-between">
        <div><Logo onClick={() => setCurrentView('landing')} /><div className="mt-20 max-w-md"><p className="text-sm text-emerald-300 font-semibold">India-first payments infrastructure</p><h1 className="mt-4 text-5xl font-semibold tracking-tight leading-[1.06]">Run every payment from one calm workspace.</h1><p className="mt-6 text-white/65 text-lg leading-8">Create your merchant account, connect Cashfree, and manage UPI payments, cards, payouts and invoices securely.</p></div></div>
        <div className="space-y-3 text-sm text-white/75"><div className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-300" /> Secure merchant sessions</div><div className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-300" /> INR checkout and webhook verification</div></div>
      </div>
      <div className="p-7 sm:p-12"><div className="lg:hidden mb-10"><Logo onClick={() => setCurrentView('landing')} /></div><div className="flex gap-6 border-b border-black/10"><button onClick={() => setMode('signup')} className={`pb-3 text-sm font-semibold ${mode === 'signup' ? 'text-[#08111f] border-b-2 border-[#08111f]' : 'text-gray-400'}`}>Create account</button><button onClick={() => setMode('login')} className={`pb-3 text-sm font-semibold ${mode === 'login' ? 'text-[#08111f] border-b-2 border-[#08111f]' : 'text-gray-400'}`}>Sign in</button></div><h2 className="mt-9 text-3xl font-semibold tracking-tight">{mode === 'signup' ? 'Start with QivroPay' : 'Welcome back'}</h2><p className="mt-2 text-sm text-gray-500">{mode === 'signup' ? 'Your account and merchant data are stored securely.' : 'Sign in to your merchant dashboard.'}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === 'signup' && (
            <>
              <label className="block text-sm font-medium">Full name<input required value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#0b6bcb]" placeholder="Aarav Sharma" /></label>
              <label className="block text-sm font-medium">Company / business name<input required value={company} onChange={e => setCompany(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#0b6bcb]" placeholder="Acme Software Pvt Ltd" /></label>
            </>
          )}
          <label className="block text-sm font-medium">Work email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#0b6bcb]" placeholder="you@company.com" /></label>
          <label className="block text-sm font-medium">Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#0b6bcb]" placeholder="At least 8 characters" /></label>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-[#08111f] text-white py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create merchant account' : 'Sign in'} {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
        <div className="mt-6 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-black/10" />or<span className="h-px flex-1 bg-black/10" /></div>
        <div className="mt-6"><GoogleSignInButton onCredential={submitGoogle} /></div>
        <div className="mt-7 flex items-center gap-2 text-xs text-gray-500"><LockKeyhole className="w-4 h-4" /> Passwords are encrypted; sessions use secure HttpOnly cookies.</div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Payments remain on Cashfree’s PCI-compliant rails.</div>
      </div>
    </div>
  </div>;
};
