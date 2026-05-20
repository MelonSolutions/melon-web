export enum PaymentStatus {
  ACTIVE = 'ACTIVE',
  SETUP_REQUIRED = 'SETUP_REQUIRED',
  SUSPENDED = 'SUSPENDED',
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: 'processing' | 'failed';
  message: string;
}

export interface PaymentStatusResponse {
  hasPaymentMethod: boolean;
  status: PaymentStatus;
  suspendedAt?: string;
  failedAttempts: number;
  lastBillingDate?: string;
}
