import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const GLOBAL_CURRENCIES = [
  { code: 'USD', label: 'United States', locale: 'en-US' },
  { code: 'INR', label: 'India', locale: 'en-IN' },
  { code: 'GBP', label: 'United Kingdom', locale: 'en-GB' },
  { code: 'EUR', label: 'Europe', locale: 'en-IE' },
  { code: 'AED', label: 'United Arab Emirates', locale: 'en-AE' },
  { code: 'AUD', label: 'Australia', locale: 'en-AU' },
  { code: 'CAD', label: 'Canada', locale: 'en-CA' },
  { code: 'SGD', label: 'Singapore', locale: 'en-SG' },
  { code: 'JPY', label: 'Japan', locale: 'ja-JP' },
] as const;

type CurrencyCode = typeof GLOBAL_CURRENCIES[number]['code'];
type CurrencyContextValue = { currency: CurrencyCode; setCurrency: (currency: CurrencyCode) => void; format: (value: number) => string; region: string };
const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const GlobalCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>(() => (localStorage.getItem('qivropay_display_currency') as CurrencyCode) || 'USD');
  useEffect(() => localStorage.setItem('qivropay_display_currency', currency), [currency]);
  const selected = GLOBAL_CURRENCIES.find(item => item.code === currency) || GLOBAL_CURRENCIES[0];
  const value = useMemo(() => ({
    currency,
    setCurrency,
    region: selected.label,
    // Presentation only: this does not convert amounts or change payment-provider currency.
    format: (amount: number) => new Intl.NumberFormat(selected.locale, { style: 'currency', currency, maximumFractionDigits: currency === 'JPY' ? 0 : 2 }).format(Number(amount) || 0),
  }), [currency, selected.label, selected.locale]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useGlobalCurrency = () => {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error('useGlobalCurrency must be used within GlobalCurrencyProvider');
  return value;
};
