import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { DynamicTestimonials } from '@/components/auth/DynamicTestimonials';

export const metadata: Metadata = {
  title: 'Authentication | Melon',
  description: 'Sign in to unlock geospatial intelligence for emerging markets'
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/signup.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-gray-900/70"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Image
              src="/images/melon-logo-white.png"
              alt="Melon"
              width={100}
              height={28}
              className="mb-8"
              priority
            />
          </div>

          <div className="text-white max-w-lg">
            <h1 className="text-4xl text-[#FFFFFF] font-semibold mb-10 leading-tight">
              Transform Data into Measurable Impact
            </h1>

            <DynamicTestimonials />
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mt-12 shadow-xl border border-white/20">
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-6 font-bold">
              LEADING CLIENTS
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
              <Image
                src="/images/leading-clients/R.jpg"
                alt="Remote Gravity"
                width={120}
                height={40}
                className="h-8 w-auto object-contain transition-all duration-300"
              />
              <Image
                src="/images/leading-clients/Sycamore-3.png"
                alt="Sycamore"
                width={120}
                height={40}
                className="h-8 w-auto object-contain transition-all duration-300"
              />
              <Image
                src="/images/leading-clients/images-13.jpeg"
                alt="Client 3"
                width={120}
                height={40}
                className="h-8 w-auto object-contain transition-all duration-300"
              />
              <Image
                src="/images/leading-clients/images-23.png"
                alt="Client 4"
                width={120}
                height={40}
                className="h-8 w-auto object-contain transition-all duration-300"
              />
              <Image
                src="/images/leading-clients/images-31.png"
                alt="Client 5"
                width={120}
                height={40}
                className="h-8 w-auto object-contain transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
