import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import './globals.css';
import { ModalProvider } from '@/components/ui/Modal';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';

// Brand typeface (Brand Identity Manual, Typography): Metropolis for all web copy.
// Self-hosted latin subset so builds never fetch from Google Fonts.
const metropolis = localFont({
  variable: '--font-metropolis',
  src: [
    { path: '../../public/fonts/metropolis/metropolis-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/metropolis/metropolis-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../public/fonts/metropolis/metropolis-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/metropolis/metropolis-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../public/fonts/metropolis/metropolis-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/metropolis/metropolis-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/metropolis/metropolis-latin-800-normal.woff2', weight: '800', style: 'normal' },
    { path: '../../public/fonts/metropolis/metropolis-latin-900-normal.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Melon Impact Platform',
  description: 'Transform data into measurable impact with intelligent analytics',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render per request so Next.js can attach the CSP nonce from src/proxy.ts
  await connection();

  return (
    <html lang="en" className={metropolis.variable}>
      <head>
        <link rel="icon" href="/favicon.ico?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=3" />
      </head>
      <body className={`${metropolis.className} antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
