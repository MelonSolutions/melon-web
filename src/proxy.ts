import { NextRequest, NextResponse } from 'next/server';

// Every origin the browser may call for data. Keep in sync with NEXT_PUBLIC_API_URL.
const API_ORIGINS = [
  process.env.NEXT_PUBLIC_API_URL,
  'https://api.melon.ng',
  'https://melon-core.onrender.com',
]
  .filter(Boolean)
  .map((url) => new URL(url as string).origin);

/**
 * Per-request nonce CSP. Next.js reads the nonce from the request's CSP header
 * and attaches it to its own scripts, so only scripts we ship can run.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // React renders style={{}} as inline style attributes, which a nonce can't cover
    "style-src 'self' 'unsafe-inline'",
    // Map tiles (4 providers), marker icons and KYC documents come from many hosts
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${API_ORIGINS.join(' ')}${isDev ? ' ws:' : ''}`,
    // PDF previews use the Google Docs viewer
    `frame-src 'self' https://docs.google.com ${API_ORIGINS.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|fonts/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
