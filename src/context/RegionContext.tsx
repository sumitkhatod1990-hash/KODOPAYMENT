import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SupportedCurrency,
  RegionOption,
  SUPPORTED_REGIONS,
  SUPPORTED_CURRENCIES,
  DEFAULT_REGION_CODE,
  DEFAULT_CURRENCY,
  getRegionByCode,
  getDefaultCurrencyForRegion,
  isSupportedCurrency,
  formatCurrency
} from '../lib/currency';

export const REGION_STORAGE_KEY = 'qivropay_region_preference';

export interface RegionPreference {
  regionCode: string;
  currency: SupportedCurrency;
}

export interface RegionContextType {
  region: RegionOption;
  currency: SupportedCurrency;
  setRegion: (regionCode: string) => void;
  setCurrency: (currency: string) => void;
  setRegionAndCurrency: (regionCode: string, currency?: string) => void;
  supportedRegions: readonly RegionOption[];
  supportedCurrencies: readonly string[];
  formatSample: (amount: number | string | undefined | null) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

function readInitialPreference(): RegionPreference {
  if (typeof window === 'undefined') {
    return { regionCode: DEFAULT_REGION_CODE, currency: DEFAULT_CURRENCY };
  }
  try {
    const raw = window.localStorage.getItem(REGION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validRegion = getRegionByCode(parsed.regionCode);
      const validCurrency = isSupportedCurrency(parsed.currency)
        ? (parsed.currency.trim().toUpperCase() as SupportedCurrency)
        : validRegion.defaultCurrency;
      return { regionCode: validRegion.code, currency: validCurrency };
    }
  } catch {}
  return { regionCode: DEFAULT_REGION_CODE, currency: DEFAULT_CURRENCY };
}

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<RegionPreference>(readInitialPreference);

  // Sync state if storage event happens in another tab
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === REGION_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const validRegion = getRegionByCode(parsed.regionCode);
          const validCurrency = isSupportedCurrency(parsed.currency)
            ? (parsed.currency.trim().toUpperCase() as SupportedCurrency)
            : validRegion.defaultCurrency;
          setPreference({ regionCode: validRegion.code, currency: validCurrency });
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistPreference = (next: RegionPreference) => {
    setPreference(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(next));
      } catch {}
    }
  };

  const setRegion = (regionCode: string) => {
    const nextRegion = getRegionByCode(regionCode);
    const nextCurrency = nextRegion.defaultCurrency;
    persistPreference({ regionCode: nextRegion.code, currency: nextCurrency });
  };

  const setCurrency = (currencyCode: string) => {
    if (!isSupportedCurrency(currencyCode)) return;
    const upper = currencyCode.trim().toUpperCase() as SupportedCurrency;
    persistPreference({ regionCode: preference.regionCode, currency: upper });
  };

  const setRegionAndCurrency = (regionCode: string, currencyCode?: string) => {
    const nextRegion = getRegionByCode(regionCode);
    const nextCurrency = currencyCode && isSupportedCurrency(currencyCode)
      ? (currencyCode.trim().toUpperCase() as SupportedCurrency)
      : nextRegion.defaultCurrency;
    persistPreference({ regionCode: nextRegion.code, currency: nextCurrency });
  };

  const currentRegion = getRegionByCode(preference.regionCode);
  const currentCurrency = preference.currency;

  const formatSample = (amount: number | string | undefined | null) => {
    return formatCurrency(amount, currentCurrency);
  };

  return (
    <RegionContext.Provider
      value={{
        region: currentRegion,
        currency: currentCurrency,
        setRegion,
        setCurrency,
        setRegionAndCurrency,
        supportedRegions: SUPPORTED_REGIONS,
        supportedCurrencies: SUPPORTED_CURRENCIES,
        formatSample
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextType => {
  const context = useContext(RegionContext);
  if (!context) {
    const fallbackRegion = getRegionByCode(DEFAULT_REGION_CODE);
    return {
      region: fallbackRegion,
      currency: DEFAULT_CURRENCY,
      setRegion: () => {},
      setCurrency: () => {},
      setRegionAndCurrency: () => {},
      supportedRegions: SUPPORTED_REGIONS,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      formatSample: (amt) => formatCurrency(amt, DEFAULT_CURRENCY)
    };
  }
  return context;
};
