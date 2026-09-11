export interface PPPRule {
  countryCode: string;
  countryName: string;
  discountPercentage: number;
  currency: 'INR';
  rateVsINR: number;
  symbol: '₹';
}

// Regional PPP rule definition for INR transactions.
// Checkout currency integrity is strictly preserved per session data.
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
