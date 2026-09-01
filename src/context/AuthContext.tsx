import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser { id: string; email: string; name: string; company: string; createdAt?: string; }
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: { name: string; company: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/v1/auth/me').then((res) => res.ok ? res.json() : null).then((data) => setUser(data?.user || null)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok || !data.success) return { success: false, error: data.error || 'Unable to sign in' };
      setUser(data.user); return { success: true };
    } catch { return { success: false, error: 'Network error. Please try again.' }; }
  };
  const signUp = async (details: { name: string; company: string; email: string; password: string }) => {
    try {
      const res = await fetch('/api/v1/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) });
      const data = await res.json();
      if (!res.ok || !data.success) return { success: false, error: data.error || 'Unable to create account' };
      setUser(data.user); return { success: true };
    } catch { return { success: false, error: 'Network error. Please try again.' }; }
  };
  const signOut = async () => { await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => undefined); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value; };
