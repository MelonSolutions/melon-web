"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import {
  Layers,
  FileText,
  BarChart3,
  Activity,
  MapIcon,
  Briefcase,
  Search,
  Bell,
  Menu,
  Bot,
  Shield
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, getInitials, getFullName, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isMapView = pathname === '/map-view';
  
  const navigation: NavItem[] = [
    {
      name: 'Overview',
      href: '/overview',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: <Briefcase className="h-5 w-5" />,
    },
        {
      name: 'KYC',
      href: '/kyc',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      name: 'Impact Metrics',
      href: '/impact-metrics',
      icon: <Activity className="h-5 w-5" />,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: 'Visualizations',
      href: '/visualizations',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Map View',
      href: '/map-view',
      icon: <MapIcon className="h-5 w-5" />,
    },
    {
      name: 'AI Reporting',
      href: '/ai-reporting',
      icon: <Bot className="h-5 w-5" />,
      disabled: true,
      comingSoon: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B94E5]"></div>
      </div>
    );
  }

  const UserProfile = ({ isMobile = false }) => (
    <div className="flex items-center w-full">
      <div className="flex-shrink-0">
        <div className="bg-[#5B94E5] text-white rounded-full h-10 w-10 flex items-center justify-center">
          <span className="text-sm font-medium">{getInitials()}</span>
        </div>
      </div>
      <div className={cn("ml-3", isMobile ? "flex-1" : "flex-grow")}>
        <p className={cn("font-medium text-gray-700", isMobile ? "text-base" : "text-sm")}>
          {getFullName()}
        </p>
        <p className={cn("text-gray-500", isMobile ? "text-sm" : "text-xs")}>
          {user?.email || 'User'}
        </p>
      </div>
    </div>
  );

  const NavigationItem = ({ item, isMobile = false }: { item: NavItem; isMobile?: boolean }) => {
    const isActive = pathname === item.href;
    const baseClasses = cn(
      'group flex items-center px-4 py-3 rounded-lg transition-colors relative',
      isMobile ? 'text-base font-medium' : 'text-sm font-medium'
    );

    if (item.disabled) {
      return (
        <div
          className={cn(
            baseClasses,
            'text-gray-400 cursor-not-allowed opacity-60'
          )}
        >
          <span className="mr-3 flex-shrink-0 text-gray-300">
            {item.icon}
          </span>
          <span className="flex-1 flex items-center">
            {item.name}
            {item.comingSoon && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full whitespace-nowrap">
                Coming Soon
              </span>
            )}
          </span>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          baseClasses,
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <span
          className={cn(
            isActive
              ? 'text-blue-600'
              : 'text-gray-400 group-hover:text-gray-500',
            'mr-3 flex-shrink-0'
          )}
        >
          {item.icon}
        </span>
        {item.name}
      </Link>
    );
  };
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 flex md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg 
                  className="h-6 w-6 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-6">
                <Image
                  src="/images/melon-logo.svg"
                  alt="Melon"
                  width={120}
                  height={32}
                  priority
                />
              </div>
              <nav className="mt-8 px-6 space-y-2">
                {navigation.map((item) => (
                  <NavigationItem key={item.name} item={item} isMobile={true} />
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <UserProfile isMobile={true} />
            </div>
          </div>
          
          <div className="flex-shrink-0 w-14" aria-hidden="true">
          </div>
        </div>
      )}

      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-4">
                <Image
                  src="/images/melon-logo.svg"
                  alt="Melon"
                  width={120}
                  height={32}
                  priority
                />
              </div>
              <nav className="mt-4 flex-1 px-4 bg-white space-y-2">
                {navigation.map((item) => (
                  <NavigationItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 md:px-8 flex items-center justify-between h-16">
            <div className="flex-1 flex">
              <div className="md:hidden">
                <button
                  type="button"
                  className="h-12 w-12 inline-flex items-center justify-center text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Menu className="h-6 w-6" />
                </button>
              </div>
              <h1 className="text-[20px] font-medium text-gray-900">
                {pathname === '/overview' && 'Program Impact Dashboard'}
                {pathname === '/reports' && 'Reports'}
                {pathname === '/visualizations' && 'Visualizations'}
                {pathname === '/dashboards' && 'Dashboards'}
                {pathname === '/impact-metrics' && 'Impact Metrics'}
                {pathname === '/portfolio' && 'Portfolio'}
                {pathname === '/map-view' && 'Map View'}
                {pathname === '/profile' && 'Profile'}
                {pathname === '/settings' && 'Settings'}
                {pathname === '/kyc' && 'KYC Management'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border text-black border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="relative">
                <button className="cursor-pointer p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
              </div>

              <ProfileDropdown />
            </div>
          </div>
        </header>  
        
        <main className={cn(
          "flex-1 relative z-0 focus:outline-none",
          isMapView ? "overflow-hidden" : "overflow-y-auto"
        )}>
          {isMapView ? (
            <div className="h-full overflow-hidden">
              {children}
            </div>
          ) : (
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}