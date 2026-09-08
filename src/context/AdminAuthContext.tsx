import React, { createContext, useContext, useEffect, useState } from 'react';
import { navigateAdmin } from '../utils/adminDomain';

export type AdminRole = 'super_admin' | 'compliance_officer' | 'support_agent' | 'read_only';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: 'active' | 'suspended' | string;
  createdAt?: string;
}

interface AdminAuthContextValue {
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/v1/admin/auth/me', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.admin) {
          setAdminUser(json.admin);
          setError(null);
          return;
        }
      }

      if (res.status === 403) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || 'Administrative access forbidden or account suspended.');
      }

      setAdminUser(null);
    } catch (err) {
      console.error('Session check error:', err);
      setAdminUser(null);
      setError('Unable to reach operations authentication service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.admin) {
        setAdminUser(data.admin);
        setError(null);
        return { success: true };
      }

      if (res.status === 401) {
        return { success: false, error: 'The email or password entered is incorrect.' };
      }

      if (res.status === 403) {
        return {
          success: false,
          error: data.error || 'This administrative account is suspended or unauthorized.'
        };
      }

      if (res.status === 429) {
        return {
          success: false,
          error: 'Too many failed login attempts. Please wait a moment and try again.'
        };
      }

      return {
        success: false,
        error: data.error || 'Authentication service error. Please try again.'
      };
    } catch (err) {
      console.error('Admin login network failure:', err);
      return {
        success: false,
        error: 'Network error: could not connect to operations authentication endpoint.'
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Admin logout error:', err);
    } finally {
      setAdminUser(null);
      setError(null);
      navigateAdmin('/login');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        loading,
        error,
        login,
        logout,
        refreshSession: checkSession
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextValue => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};
