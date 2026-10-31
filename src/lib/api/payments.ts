/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InitializePaymentResponse,
  VerifyPaymentResponse,
  PaymentStatusResponse,
} from '@/types/payments';
import { authFetch, getAccessToken } from '@/lib/auth/session';
import { userMessage } from './user-message';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melon.ng';

export class PaymentApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'PaymentApiError';
  }
}

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await authFetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = userMessage(response.status, errorData);
      errorCode = errorData.code;
    } catch {
      errorMessage = userMessage(response.status);
    }

    console.error(`Payment API Error [${response.status}] ${url}:`, errorMessage);
    throw new PaymentApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

export async function initializePaymentSetup(
  organizationId: string
): Promise<InitializePaymentResponse> {
  return fetchWithAuth(`${API_BASE_URL}/payments/initialize-setup`, {
    method: 'POST',
    body: JSON.stringify({ organizationId }),
  });
}

export async function verifyPaymentSetup(
  reference: string
): Promise<VerifyPaymentResponse> {
  const params = new URLSearchParams({ reference });
  return fetchWithAuth(`${API_BASE_URL}/payments/verify-setup?${params.toString()}`);
}

export async function getPaymentStatus(
  organizationId: string
): Promise<PaymentStatusResponse> {
  return fetchWithAuth(`${API_BASE_URL}/payments/status/${organizationId}`);
}
