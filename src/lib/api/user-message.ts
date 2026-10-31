/**
 * Plain-language messages for failed requests. Users never see status codes,
 * HTTP reason phrases or raw server errors.
 */

export const NETWORK_ERROR_MESSAGE =
  "We couldn't reach Melon. Check your internet connection and try again.";

const BY_STATUS: Record<number, string> = {
  401: 'Your session has ended. Please sign in again.',
  403: "You don't have access to this. Contact your administrator if you think you should.",
  404: "We couldn't find what you were looking for. It may have been moved or deleted.",
  408: 'This is taking longer than usual. Please try again.',
  413: 'That file is too large. Please choose a smaller one.',
  429: "You're going a bit fast. Please wait a moment and try again.",
};
const SERVER_ERROR = 'Something went wrong on our side. Please try again in a moment.';
const GENERIC = 'Something went wrong. Please try again.';

/**
 * Pick the message to show for a failed response. 4xx messages from the API
 * are written for people and are shown as-is; 5xx details never are.
 */
export function userMessage(status: number, body?: unknown): string {
  if (status >= 500) return SERVER_ERROR;

  const raw = (body as { message?: unknown } | null | undefined)?.message;
  const message = Array.isArray(raw) ? raw[0] : raw;
  if (typeof message === 'string' && message.trim()) return message;

  return BY_STATUS[status] ?? GENERIC;
}
