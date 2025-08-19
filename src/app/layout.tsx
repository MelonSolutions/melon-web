import localFont from 'next/font/local';
import { Karla } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { ModalProvider } from '@/components/ui/Modal';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';

const mabryPro = localFont({
  variable: '--font-mabry',
  src: [
    {
      path: '../../public/fonts/mabry-pro/MabryPro-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/mabry-pro/MabryPro-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/mabry-pro/MabryPro-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/mabry-pro/MabryPro-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/mabry-pro/MabryPro-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
});

const karla = Karla({ subsets: ['latin'], variable: '--font-karla' });

export const metadata: Metadata = {
  title: 'Melon Impact Platform',
  description: 'Transform data into measurable impact with intelligent analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=3" />
      </head>
      <body className={`${karla.variable} ${mabryPro.variable} antialiased`}>
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