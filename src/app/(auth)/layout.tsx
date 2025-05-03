import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Melon',
  description: 'Sign in to Africa\'s leading accountability platform'
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="hidden md:flex md:w-1/2 bg-[#5B94E5] flex-col justify-center items-start p-12">
        <div className="mb-8">
          <Image
            src="/images/melon-logo.svg"
            alt="Melon"
            width={150}
            height={40}
            priority
          />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Data-Driven<br />Impact</h1>
        <p className="text-white text-xl">Africa&rsquo;s leading accountability platform</p>
        <div className="absolute bottom-6 left-6 text-white text-sm opacity-80">
          © {new Date().getFullYear()} Melon. All rights reserved.
        </div>
      </div>
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <div className="w-full max-w-md px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}