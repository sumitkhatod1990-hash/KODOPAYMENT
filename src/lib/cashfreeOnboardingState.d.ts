import { CashfreePartnerStatus } from '../types';

export type OnboardingState =
  | 'NOT_STARTED'
  | 'MERCHANT_CREATION_PENDING'
  | 'EMAIL_VERIFICATION'
  | 'MIN_KYC_PENDING'
  | 'MIN_KYC_SUBMITTED'
  | 'MIN_KYC_REJECTED'
  | 'MIN_KYC_APPROVED'
  | 'FULL_KYC_PENDING'
  | 'ACTIVE'
  | 'ACCESS_RESTRICTED'
  | 'UNKNOWN'
  | 'ERROR_STALE';

export type OnboardingStateReason =
  | 'stale_status'
  | 'conflicting_fields'
  | 'unrecognized_kyc_status'
  | 'unrecognized_onboarding_status'
  | null;

export interface OnboardingStateResult {
  state: OnboardingState;
  reason: OnboardingStateReason;
  raw: {
    started: boolean;
    stale: boolean;
    cfMerchantId: string | null;
    onboardingStatus: string | null;
    kycStatus: string | null;
    fullKycStatus: string | null;
    activationStatus: string | null;
    transactionAccess: string | null;
    updatedAt: string | null;
    errorMessage: string | null;
  };
}

export interface OnboardingStateCopy {
  title: string;
  detail: string;
  tone: 'neutral' | 'amber' | 'emerald' | 'rose';
  action: string | null;
}

export declare const ONBOARDING_STATES: readonly OnboardingState[];
export declare const STATE_COPY: Record<OnboardingState, OnboardingStateCopy>;
export declare const REASON_COPY: Partial<Record<NonNullable<OnboardingStateReason>, Partial<OnboardingStateCopy>>>;

export declare function deriveOnboardingState(status: CashfreePartnerStatus | null | undefined): OnboardingStateResult;
export declare function describeOnboardingState(result: Pick<OnboardingStateResult, 'state' | 'reason'>): OnboardingStateCopy;
