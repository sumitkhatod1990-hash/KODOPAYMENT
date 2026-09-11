export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'AUD' | 'CAD' | 'SGD' | 'JPY';

export interface CurrencyMeta {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}

export interface RegionOption {
  code: string;
  name: string;
  flag: string;
  defaultCurrency: SupportedCurrency;
  currencyDisplay: string;
}

export const SUPPORTED_CURRENCIES: readonly string[];
export const CURRENCY_METADATA: Record<string, CurrencyMeta>;
export const SUPPORTED_REGIONS: readonly RegionOption[];
export const DEFAULT_REGION_CODE: string;
export const DEFAULT_CURRENCY: SupportedCurrency;

export function isSupportedCurrency(currency: any): boolean;
export function getCurrencySymbol(currency?: string): string;
export function getCurrencyDecimals(currency?: string): number;
export function formatCurrency(amount: number | string | undefined | null, currency?: string): string;
export function formatCurrencyWithCode(amount: number | string | undefined | null, currency?: string): string;
export function validateAmount(amount: number | string | undefined | null, currency?: string): { valid: boolean; error?: string; normalizedAmount?: number };
export function getRegionByCode(code?: string | null): RegionOption;
export function getDefaultCurrencyForRegion(regionCode?: string | null): SupportedCurrency;

