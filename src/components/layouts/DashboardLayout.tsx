"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { SearchModal } from '@/components/layouts/SearchModal';
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
  Shield,
  CreditCard,
  HelpCircle,
  X
} from "lucide-react";
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
  const { user, getInitials, getFullName, isLoading } = useAuthContext();
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
    // {
    //   name: 'Billing',
    //   href: '/billing',
    //   icon: <CreditCard className="h-5 w-5" />,
    // },
    // {
    //   name: 'Help Center',
    //   href: '/help',
    //   icon: <HelpCircle className="h-5 w-5" />,
    // },
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2 border-primary/30"></div>
      </div>
    );
  }

  const UserProfile = ({ isMobile = false }) => (
    <div className="flex items-center w-full group/user cursor-pointer">
      <div className="flex-shrink-0 relative">
        <div className="bg-primary text-white rounded-xl h-10 w-10 flex items-center justify-center font-black text-xs shadow-lg shadow-primary/20 border border-primary/20 group-hover:scale-110 transition-transform">
          {getInitials()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full shadow-sm"></div>
      </div>
      <div className={cn("ml-3 transition-opacity", isMobile ? "flex-1" : "flex-grow")}>
        <p className={cn("font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-tight", isMobile ? "text-sm" : "text-xs")}>
          {getFullName()}
        </p>
        <p className={cn("text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-tight font-black mt-0.5", isMobile ? "text-[10px]" : "text-[8px]")}>
          {user?.email}
        </p>
      </div>
    </div>
  );

  const NavigationItem = ({ item, isMobile = false }: { item: NavItem; isMobile?: boolean; }) => {
    const isActive = pathname === item.href || (item.href !== '/overview' && pathname?.startsWith(item.href));

    const baseClasses = cn(
      'group flex items-center px-4 py-3.5 rounded-2xl transition-all relative overflow-hidden',
      isMobile ? 'text-sm font-black uppercase tracking-widest' : 'text-xs font-black uppercase tracking-widest'
    );

    if (item.disabled) {
      return (
        <div className={cn(baseClasses, 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-40')}>
          <span className="mr-3 flex-shrink-0">{item.icon}</span>
          <span className="flex-1 flex items-center justify-between">
            {item.name}
            {item.comingSoon && (
              <span className="text-[8px] font-black bg-surface-secondary px-1.5 py-0.5 rounded border border-border">COMING</span>
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
            ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary hover:text-white'
            : 'text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-primary/5'
        )}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <span className={cn('mr-3.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110', isActive ? 'text-white' : 'text-gray-400 dark:text-gray-600 group-hover:text-primary')}>
          {item.icon}
        </span>
        <span className="relative z-10">{item.name}</span>
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
        )}
      </Link>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background transition-colors duration-500 font-sans">
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface border-r border-border animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center">
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-surface-secondary transition-all">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-10 pb-4 overflow-y-auto">
              <div className="px-8 mb-10">
                <Image src="/images/melon-logo.svg" alt="Melon" width={110} height={30} priority />
              </div>
              <nav className="px-6 space-y-2">
                {navigation.map((item) => (
                  <NavigationItem key={item.name} item={item} isMobile={true} />
                ))}
              </nav>
            </div>

            <div className="p-6 border-t border-border bg-surface-secondary/30">
              <UserProfile isMobile={true} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-full border-r border-border bg-surface relative z-50">
            <div className="flex-1 flex flex-col pt-10 pb-6 overflow-y-auto">
              <div className="flex items-center px-8 mb-10">
                <Image src="/images/melon-logo.svg" alt="Melon" width={120} height={32} priority className="hover:opacity-80 transition-opacity" />
              </div>
              <nav className="flex-1 px-4 space-y-1.5">
                {navigation.map((item) => (
                  <NavigationItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-border bg-surface-secondary/20">
              <div className="p-3 rounded-2xl bg-surface border border-border shadow-sm hover:border-primary/20 transition-all">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <header className="bg-surface/70 dark:bg-surface/40 backdrop-blur-xl border-b border-border sticky top-0 z-40 transition-all duration-300">
          <div className="px-6 sm:px-8 flex items-center justify-between h-20">
            <div className="flex-1 flex items-center gap-4">
              <div className="md:hidden">
                <button
                  type="button"
                  className="h-10 w-10 inline-flex items-center justify-center text-gray-500 hover:bg-surface-secondary rounded-xl transition-all"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
              <div className="h-4 w-1 bg-primary rounded-full hidden md:block"></div>
              <h1 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em] hidden sm:block">
                {pathname === '/overview' && 'Program Impact Dashboard'}
                {pathname === '/reports' && 'Reports'}
                {pathname === '/visualizations' && 'Visualizations'}
                {pathname === '/dashboards' && 'Dashboards'}
                {pathname === '/impact-metrics' && 'Impact Metrics'}
                {pathname === '/portfolio' && 'Portfolio'}
                {pathname === '/map-view' && 'Map View'}
                {pathname === '/profile' && 'Profile'}
                {pathname === '/billing' && 'Billing'}
                {pathname === '/help' && 'Help'}
                {pathname === '/kyc' && 'KYC Management'}
                {pathname === '/settings' && 'Settings'}
              </h1>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative group hidden lg:block">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <button
                  type="button"
                  onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                  className="w-72 pl-12 pr-16 py-3 border border-border rounded-2xl bg-surface/50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-surface-secondary/50 hover:border-primary/20 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  Search
                </button>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <kbd className="inline-flex items-center px-2 py-1 text-[8px] font-black text-gray-400 bg-surface-secondary border border-border rounded-lg uppercase tracking-tighter">
                    ⌘K
                  </kbd>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <div className="relative group">
                  <button className="cursor-pointer p-2.5 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all focus:outline-none relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-primary ring-4 ring-surface"></span>
                  </button>
                </div>
              </div>

              <div className="h-10 w-[1px] bg-border mx-2 hidden sm:block"></div>
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <main className={cn(
          "flex-1 relative z-0 focus:outline-none bg-background/50",
          isMapView ? "overflow-hidden" : "overflow-y-auto"
        )}>
          <div className={cn(
            "h-full",
            isMapView ? "overflow-hidden" : "py-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12"
          )}>
            {children}
          </div>
        </main>
      </div>
      <SearchModal />
    </div>
  );
}