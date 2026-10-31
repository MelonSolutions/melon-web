/**
 * Dashboard session.
 *
 * The access token lives only in memory (never localStorage), so injected
 * scripts can't lift a long-lived credential. The refresh token is an httpOnly
 * cookie set by the API; `refreshSession()` trades it for a new access token.
 */

import { NETWORK_ERROR_MESSAGE } from '@/lib/api/user-message';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melon.ng';
// Refresh slightly before expiry so in-flight requests don't race it
const EXPIRY_SKEW_MS = 30_000;
const LEGACY_TOKEN_KEY = 'authToken';

export type RefreshResult = 'ok' | 'unauthenticated' | 'error';

let accessToken: string | null = null;
let expiresAt = 0;
let initPromise: Promise<RefreshResult> | null = null;
let refreshPromise: Promise<RefreshResult> | null = null;
const expiredListeners = new Set<() => void>();

function decodeExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
  expiresAt = decodeExpiry(token);
}

export function clearSession(): void {
  accessToken = null;
  expiresAt = 0;
}

/** Called when the session can't be renewed, so the UI can sign the user out. */
export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

/** Trade the refresh cookie for a new access token. Concurrent calls share one request. */
export function refreshSession(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res): Promise<RefreshResult> => {
        if (!res.ok) {
          clearSession();
          return 'unauthenticated';
        }
        const data = await res.json();
        setAccessToken(data.token);
        return 'ok';
      })
      .catch((): RefreshResult => 'error')
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/** Restore the session once per page load. Safe to call from anywhere. */
export function initSession(): Promise<RefreshResult> {
  if (!initPromise) {
    try {
      // Tokens from before cookie sessions; never read them again
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch {
      // Storage unavailable (private mode); nothing to clean up
    }
    initPromise = refreshSession();
  }
  return initPromise;
}

/** Mark the session as established after sign-in (skips the boot-time refresh). */
export function startSession(token: string): void {
  setAccessToken(token);
  initPromise = Promise.resolve('ok');
}

export async function endSession(): Promise<void> {
  clearSession();
  initPromise = Promise.resolve('unauthenticated');
  await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(
    () => undefined,
  );
}

/** fetch() whose connection failures carry a message people can act on. */
async function send(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    // Timeouts (AbortError) are reported by the caller that set them
    if ((error as Error)?.name === 'AbortError') throw error;
    const networkError = new Error(NETWORK_ERROR_MESSAGE);
    networkError.name = 'NetworkError';
    throw networkError;
  }
}

function withAccessToken(init: RequestInit): RequestInit {
  if (!accessToken) return init;
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  return { ...init, headers };
}

/**
 * Drop-in `fetch` for Melon API calls. Attaches the dashboard access token,
 * renews it when close to expiry, and retries once after a 401. Without a
 * dashboard session it leaves headers alone, so trial tokens pass through.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  if (typeof window === 'undefined') return send(input, init);

  await initSession();
  if (accessToken && expiresAt - Date.now() < EXPIRY_SKEW_MS) {
    await refreshSession();
  }

  const hadSession = !!accessToken;
  const response = await send(input, withAccessToken(init));
  if (response.status !== 401 || !hadSession) return response;

  const result = await refreshSession();
  if (result !== 'ok') {
    if (result === 'unauthenticated') expiredListeners.forEach((listener) => listener());
    return response;
  }
  return send(input, withAccessToken(init));
}
