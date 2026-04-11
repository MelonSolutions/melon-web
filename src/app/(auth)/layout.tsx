import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { DynamicTestimonials } from '@/components/auth/DynamicTestimonials';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
    <div className="min-h-screen flex relative selection:bg-primary/30">
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 lg:p-16 transition-colors duration-500 overflow-y-auto">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>

      {/* Visual Section */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/signup.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1115]/90 via-[#0F1115]/70 to-[#0F1115]/80 backdrop-blur-[2px]"></div>

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div>

            <Image
              src="/images/melon-logo-white.png"
              alt="Melon"
              width={120}
              height={32}
              className="mb-12 opacity-90 group-hover:opacity-100 transition-opacity"
              priority
            />
          </div>

          <div className="text-white max-w-xl animate-in slide-in-from-left-4 duration-1000 delay-300">
            <h1 className="text-4xl text-white font-black mb-12 leading-[1.05] uppercase tracking-tighter">
              Transform Data Into <br />
              <span className="text-primary italic">Measurable Impact</span>
            </h1>

            <div className="w-20 h-1 bg-primary mb-12 shadow-lg shadow-primary/20"></div>

            <DynamicTestimonials />
          </div>

          <div className="bg-surface/30 backdrop-blur-2xl rounded-[3rem] p-7 mt-16 shadow-2xl border border-white/10 w-fit max-w-full transition-all duration-500 hover:bg-surface/40 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <p className="text-white text-xs uppercase tracking-[0.3em] font-black">
                Leading Clients
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-12 gap-y-8 opacity-70 hover:opacity-100 transition-all duration-700">
              <Image
                src="/images/leading-clients/R.jpg"
                alt="Remote Gravity"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
              <Image
                src="/images/leading-clients/Sycamore-3.png"
                alt="Sycamore"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
              <Image
                src="/images/leading-clients/images-13.jpeg"
                alt="Client 3"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
              <Image
                src="/images/leading-clients/images-23.png"
                alt="Client 4"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
              <Image
                src="/images/leading-clients/images-31.png"
                alt="Client 5"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
