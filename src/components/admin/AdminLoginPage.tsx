import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { navigateAdmin } from '../../utils/adminDomain';
import { Shield, Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, Terminal } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim()) {
      setErrorMessage('Please enter your administrative email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your administrative password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigateAdmin('/');
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white">
      {/* Background grid accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              QivroPay
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Operations
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Internal Management &amp; Platform Oversight Console
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl shadow-2xl p-7 backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              client.qivropay.com
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@qivropay.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Operations</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-500 text-center leading-relaxed">
            Restricted access platform. All authentication attempts and operational actions are cryptographically recorded in the platform audit log.
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-600">
          QivroPay Core Platform Architecture &bull; ISO/IEC 27001 &bull; SOC2 Type II
        </div>
      </div>
    </div>
  );
};
