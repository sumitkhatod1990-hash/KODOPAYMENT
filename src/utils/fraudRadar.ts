export interface FraudAssessment {
  riskScore: number; // 0 - 100
  riskLevel: 'low' | 'elevated' | 'high';
  requires3DS: boolean;
  reasons: string[];
  recommendation: 'allow' | 'challenge_3ds' | 'block';
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'trashmail.com', 'sharklasers.com'
]);

export function evaluateTransactionRisk(params: {
  amount: number;
  customerEmail: string;
  country: string;
  paymentMethod: string;
  ipProxy?: boolean;
}): FraudAssessment {
  let score = 5; // Base clean score
  const reasons: string[] = [];

  const domain = params.customerEmail.split('@')[1]?.toLowerCase() || '';

  // 1. Check disposable email
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    score += 45;
    reasons.push('Disposable / Temporary email domain detected');
  }

  // 2. Check high transaction velocity / amount
  if (params.amount > 2000) {
    score += 25;
    reasons.push('High transaction value anomaly (> ₹2,000)');
  } else if (params.amount > 500) {
    score += 10;
  }

  // 3. Check Proxy / VPN
  if (params.ipProxy) {
    score += 30;
    reasons.push('Anonymous datacenter / VPN IP detected');
  }

  // 4. Crypto / High Risk Rail Check
  if (params.paymentMethod === 'crypto' && params.amount > 1000) {
    score += 15;
    reasons.push('Large volume on-chain settlement');
  }

  // Clamp 0 - 100
  score = Math.min(100, Math.max(0, score));

  let riskLevel: 'low' | 'elevated' | 'high' = 'low';
  let requires3DS = false;
  let recommendation: 'allow' | 'challenge_3ds' | 'block' = 'allow';

  if (score >= 70) {
    riskLevel = 'high';
    requires3DS = true;
    recommendation = 'challenge_3ds';
  } else if (score >= 35) {
    riskLevel = 'elevated';
    requires3DS = true;
    recommendation = 'challenge_3ds';
  }

  return {
    riskScore: score,
    riskLevel,
    requires3DS,
    reasons,
    recommendation
  };
}
