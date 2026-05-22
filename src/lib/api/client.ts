/**
 * Shared API client utilities
 */

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

  // Check for org token first (higher priority)
  const authToken = localStorage.getItem('authToken');
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
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';
