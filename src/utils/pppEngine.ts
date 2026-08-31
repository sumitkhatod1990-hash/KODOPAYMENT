export interface PPPRule {
  countryCode: string;
  countryName: string;
  discountPercentage: number;
  currency: string;
  rateVsUSD: number;
  symbol: string;
}

export const PPP_DATABASE: Record<string, PPPRule> = {
  IN: { countryCode: 'IN', countryName: 'India', discountPercentage: 50, currency: 'INR', rateVsUSD: 83.5, symbol: '₹' },
  BR: { countryCode: 'BR', countryName: 'Brazil', discountPercentage: 45, currency: 'BRL', rateVsUSD: 5.4, symbol: 'R$' },
  NG: { countryCode: 'NG', countryName: 'Nigeria', discountPercentage: 60, currency: 'NGN', rateVsUSD: 1600, symbol: '₦' },
  ID: { countryCode: 'ID', countryName: 'Indonesia', discountPercentage: 50, currency: 'IDR', rateVsUSD: 16200, symbol: 'Rp' },
  TR: { countryCode: 'TR', countryName: 'Turkey', discountPercentage: 50, currency: 'TRY', rateVsUSD: 33.2, symbol: '₺' },
  VN: { countryCode: 'VN', countryName: 'Vietnam', discountPercentage: 50, currency: 'VND', rateVsUSD: 25400, symbol: '₫' },
  PK: { countryCode: 'PK', countryName: 'Pakistan', discountPercentage: 60, currency: 'PKR', rateVsUSD: 278.5, symbol: '₨' },
  EG: { countryCode: 'EG', countryName: 'Egypt', discountPercentage: 50, currency: 'EGP', rateVsUSD: 48.5, symbol: 'E£' },
  PH: { countryCode: 'PH', countryName: 'Philippines', discountPercentage: 45, currency: 'PHP', rateVsUSD: 57.5, symbol: '₱' },
  ZA: { countryCode: 'ZA', countryName: 'South Africa', discountPercentage: 40, currency: 'ZAR', rateVsUSD: 18.2, symbol: 'R' },
  // Developed Economies (Standard 0% discount)
  US: { countryCode: 'US', countryName: 'United States', discountPercentage: 0, currency: 'USD', rateVsUSD: 1.0, symbol: '$' },
  GB: { countryCode: 'GB', countryName: 'United Kingdom', discountPercentage: 0, currency: 'GBP', rateVsUSD: 0.78, symbol: '£' },
  DE: { countryCode: 'DE', countryName: 'Germany', discountPercentage: 0, currency: 'EUR', rateVsUSD: 0.92, symbol: '€' },
  FR: { countryCode: 'FR', countryName: 'France', discountPercentage: 0, currency: 'EUR', rateVsUSD: 0.92, symbol: '€' },
  NL: { countryCode: 'NL', countryName: 'Netherlands', discountPercentage: 0, currency: 'EUR', rateVsUSD: 0.92, symbol: '€' },
  JP: { countryCode: 'JP', countryName: 'Japan', discountPercentage: 0, currency: 'JPY', rateVsUSD: 155.0, symbol: '¥' },
  CA: { countryCode: 'CA', countryName: 'Canada', discountPercentage: 0, currency: 'CAD', rateVsUSD: 1.36, symbol: 'C$' },
  AU: { countryCode: 'AU', countryName: 'Australia', discountPercentage: 0, currency: 'AUD', rateVsUSD: 1.52, symbol: 'A$' }
};

export function getPPPRule(countryCode: string): PPPRule {
  const code = (countryCode || 'US').toUpperCase();
  return PPP_DATABASE[code] || {
    countryCode: code,
    countryName: 'International',
    discountPercentage: 0,
    currency: 'USD',
    rateVsUSD: 1.0,
    symbol: '$'
  };
}

export function calculatePPPPrice(baseUsdPrice: number, countryCode: string) {
  const rule = getPPPRule(countryCode);
  const discountedUsd = baseUsdPrice * (1 - rule.discountPercentage / 100);
  const localizedAmount = discountedUsd * rule.rateVsUSD;

  return {
    ...rule,
    originalUsd: baseUsdPrice,
    discountedUsd,
    localizedAmount,
    formattedLocal: `${rule.symbol}${localizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${rule.currency}`
  };
}
