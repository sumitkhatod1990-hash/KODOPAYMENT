// Shared ISO 4217 Currency Support for QivroPay Global Payments
// Pure, framework-free module usable in both Node.js (backend) and browser (frontend).

export const SUPPORTED_CURRENCIES = Object.freeze([
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'AUD',
  'CAD',
  'SGD',
  'JPY'
]);

export const CURRENCY_METADATA = Object.freeze({
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', flag: '🇦🇪', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', decimals: 0 }
});

export function isSupportedCurrency(currency) {
  if (!currency || typeof currency !== 'string') return false;
  return SUPPORTED_CURRENCIES.includes(currency.trim().toUpperCase());
}

export const SUPPORTED_REGIONS = Object.freeze([
  {
    code: 'US',
    name: 'United States',
    flag: '🌎',
    defaultCurrency: 'USD',
    currencyDisplay: 'USD — $'
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    defaultCurrency: 'INR',
    currencyDisplay: 'INR — ₹'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    defaultCurrency: 'GBP',
    currencyDisplay: 'GBP — £'
  },
  {
    code: 'EU',
    name: 'Europe',
    flag: '🇪🇺',
    defaultCurrency: 'EUR',
    currencyDisplay: 'EUR — €'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    defaultCurrency: 'AED',
    currencyDisplay: 'AED — د.إ'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    defaultCurrency: 'AUD',
    currencyDisplay: 'AUD — A$'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    defaultCurrency: 'CAD',
    currencyDisplay: 'CAD — C$'
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    defaultCurrency: 'SGD',
    currencyDisplay: 'SGD — S$'
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    defaultCurrency: 'JPY',
    currencyDisplay: 'JPY — ¥'
  }
]);

export const DEFAULT_REGION_CODE = 'US';
export const DEFAULT_CURRENCY = 'USD';

export function getRegionByCode(code) {
  if (!code || typeof code !== 'string') return SUPPORTED_REGIONS[0];
  const upper = code.trim().toUpperCase();
  return SUPPORTED_REGIONS.find(r => r.code === upper) || SUPPORTED_REGIONS[0];
}

export function getDefaultCurrencyForRegion(regionCode) {
  const region = getRegionByCode(regionCode);
  return region.defaultCurrency;
}

export function getCurrencySymbol(currency = 'USD') {
  const code = String(currency || 'USD').trim().toUpperCase();
  return CURRENCY_METADATA[code]?.symbol || `${code} `;
}

export function getCurrencyDecimals(currency = 'USD') {
  const code = String(currency || 'USD').trim().toUpperCase();
  return CURRENCY_METADATA[code]?.decimals ?? 2;
}

export function formatCurrency(amount, currency = 'USD') {
  const code = String(currency || 'USD').trim().toUpperCase();
  const meta = CURRENCY_METADATA[code] || { decimals: 2 };
  const num = Number(amount || 0);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: meta.decimals,
      minimumFractionDigits: meta.decimals
    }).format(num);
  } catch {
    const sym = getCurrencySymbol(code);
    return `${sym}${num.toFixed(meta.decimals)}`;
  }
}

export function formatCurrencyWithCode(amount, currency = 'USD') {
  const code = String(currency || 'USD').trim().toUpperCase();
  const formatted = formatCurrency(amount, code);
  return `${formatted} ${code}`;
}

export function validateAmount(amount, currency = 'USD') {
  const code = String(currency || 'USD').trim().toUpperCase();
  if (!isSupportedCurrency(code)) {
    return { valid: false, error: `Unsupported currency '${currency}'. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}` };
  }
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    return { valid: false, error: 'A positive amount is required' };
  }
  const decimals = getCurrencyDecimals(code);
  const factor = Math.pow(10, decimals);
  if (Math.abs(num - Math.round(num * factor) / factor) > 1e-9) {
    return {
      valid: false,
      error: decimals === 0
        ? `${code} does not support fractional amounts (zero decimals)`
        : `Amount for ${code} must have at most ${decimals} decimal places`
    };
  }
  return { valid: true, normalizedAmount: Number(num.toFixed(decimals)) };
}

