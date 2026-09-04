import React, { createContext, useContext, useEffect, useState } from 'react';

// Dashboard-only theme preference. Deliberately NOT applied to
// document.documentElement/body — that would make the class a global
// ancestor of the public site too. Instead each authenticated-shell root
// (DashboardLayout, FirstMerchantOnboarding) puts the `dark` class on its
// own wrapper, so Tailwind's `dark:` variant and the `.dark` rules in
// index.css only ever match inside that subtree.
//
// This is a React Context, not a bare hook backed by independent useState:
// Modal.tsx renders via createPortal but stays mounted (just hidden) across
// open/close, so a plain per-call useState would go stale the moment
// DashboardLayout's own toggle changed localStorage without re-rendering
// Modal's separate state. Context ties every consumer under the same
// DashboardThemeProvider to one shared value instead.
const STORAGE_KEY = 'qivropay_dashboard_theme';

interface DashboardThemeContextValue {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDark: () => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

export const DashboardThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'dark'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const toggleDark = () => setDark((v) => !v);

  return (
    <DashboardThemeContext.Provider value={{ dark, setDark, toggleDark }}>
      {children}
    </DashboardThemeContext.Provider>
  );
};

export const useDashboardTheme = () => {
  const ctx = useContext(DashboardThemeContext);
  if (!ctx) throw new Error('useDashboardTheme must be used within DashboardThemeProvider');
  return ctx;
};
