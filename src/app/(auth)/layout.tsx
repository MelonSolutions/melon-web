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
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative"
        style={{
          background: 'linear-gradient(135deg, #7aa6ea 10%, #5b92e5 40%, #6175d1 70%, #6659bc 90%)'
        }}
      >

        <div className="text-center text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Transform Data into Impact
          </h1>
          
          <blockquote className="text-xl mb-8 opacity-90 italic">
            &rdquo;Melon&rsquo;s geospatial intelligence helped us identify underserved communities, 
            allowing iWello to extend health coverage to places we would have otherwise overlooked. 
            Data guides us, and Melon makes that data visible.&rdquo;
          </blockquote>

          <div className="flex items-center justify-center space-x-4">
            <div className="text-left">
              <div className="font-semibold">Adejonwo Ismail</div>
              <div className="text-white/80 text-sm">Founder, iWello Inc</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-8 right-8">
          <p className="text-white/60 text-sm text-center mb-4 uppercase tracking-wider">
            Trusted by leading organizations
          </p>
          <div className="flex items-center justify-center space-x-6 opacity-80">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <Image
                src="/images/iwello.png"
                alt="iWello"
                width={60}
                height={30}
                className="object-contain filter brightness-0 invert"
                style={{ maxHeight: '24px', width: 'auto' }}
              />
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <Image
                src="/images/fairmoney.png"
                alt="FairMoney"
                width={80}
                height={30}
                className="object-contain filter brightness-0 invert"
                style={{ maxHeight: '24px', width: 'auto' }}
              />
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <Image
                src="/images/remote-gravity.png"
                alt="Remote Gravity"
                width={60}
                height={30}
                className="object-contain filter brightness-0 invert"
                style={{ maxHeight: '24px', width: 'auto' }}
              />
            </div>
          </div>
        </div>

        <div className="absolute top-20 right-20 w-64 h-64 opacity-10">
          <div className="w-full h-full border border-white rounded-full"></div>
        </div>
        <div className="absolute bottom-32 right-32 w-32 h-32 opacity-5">
          <div className="w-full h-full border border-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}