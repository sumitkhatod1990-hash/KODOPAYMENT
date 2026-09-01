export interface PPPRule {
  countryCode: string;
  countryName: string;
  discountPercentage: number;
  currency: 'INR';
  rateVsINR: number;
  symbol: '₹';
}

// QivroPay currently supports India-only payments. This prevents a fallback
// country rule from ever surfacing a foreign currency at checkout.
export const PPP_DATABASE: Record<string, PPPRule> = {
  IN: { countryCode: 'IN', countryName: 'India', discountPercentage: 0, currency: 'INR', rateVsINR: 1, symbol: '₹' }
};

export function getPPPRule(): PPPRule {
  return PPP_DATABASE.IN;
}

export function calculatePPPPrice(baseInrPrice: number) {
  const rule = getPPPRule();
  const localizedAmount = baseInrPrice;

  return {
    ...rule,
    originalInr: baseInrPrice,
    discountedInr: baseInrPrice,
    localizedAmount,
    formattedLocal: `₹${localizedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR`
  };
}
