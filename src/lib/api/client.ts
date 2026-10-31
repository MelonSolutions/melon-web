/**
 * Shared API client utilities
 */
import { getAccessToken } from '@/lib/auth/session';

/**
 * Gets authentication headers, supporting both organization and trial tokens.
 * Priority: authToken > trialToken
 */
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window === 'undefined') {
    return headers;
  }

  // Dashboard session first (higher priority); it lives in memory only
  const authToken = getAccessToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
    return headers;
  }

  // Fall back to trial token
  const trialToken = localStorage.getItem('trialToken');
  if (trialToken) {
    headers.Authorization = `Bearer ${trialToken}`;
  }

  return headers;
};

/**
 * Base API configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melon.ng';
