import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';

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
            <h1 className="text-4xl text-[#FFFFFF] font-semibold mb-6 leading-tight">
              Transform Data into Measurable Impact
            </h1>
            
            <blockquote className="text-lg mb-8 opacity-90 leading-relaxed">
              &ldquo;Melon&apos;s geospatial intelligence helped us identify underserved communities, 
              allowing iWello to extend health coverage to places we would have otherwise overlooked.&rdquo;
            </blockquote>

            <div className="flex items-center space-x-4">
              <div className="text-left">
                <div className="font-semibold">Adejonwo Ismail</div>
                <div className="text-white/70 text-sm">Founder, iWello Inc</div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-4">
              Trusted by leading organizations
            </p>
            <div className="flex items-center space-x-6 opacity-70">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
                <Image
                  src="/images/iwello.png"
                  alt="iWello"
                  width={60}
                  height={24}
                  className="object-contain filter brightness-0 invert"
                  style={{ maxHeight: '20px', width: 'auto' }}
                />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
                <Image
                  src="/images/fairmoney.png"
                  alt="FairMoney"
                  width={70}
                  height={24}
                  className="object-contain filter brightness-0 invert"
                  style={{ maxHeight: '20px', width: 'auto' }}
                />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
                <Image
                  src="/images/remote-gravity.png"
                  alt="Remote Gravity"
                  width={60}
                  height={24}
                  className="object-contain filter brightness-0 invert"
                  style={{ maxHeight: '20px', width: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
