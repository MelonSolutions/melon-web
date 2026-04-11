'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import {
  User,
  Settings,
  Bell,
  LogOut,
  HelpCircle,
  Shield,
  ChevronRight
} from 'lucide-react';

export function ProfileDropdown() {
  const { user, logout, getInitials, getFullName } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      section: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile Settings',
          href: '/profile',
          description: 'Manage your account details'
        },
        {
          icon: Settings,
          label: 'Preferences',
          href: '/settings',
          description: 'App settings and notifications'
        },
        {
          icon: Bell,
          label: 'Notifications',
          href: '/settings/notifications',
          description: 'Manage notification settings'
        }
      ]
    },
    {
      section: 'Billing & Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          href: '/help',
          description: 'Get help and documentation'
        },
        {
          icon: Shield,
          label: 'Privacy & Security',
          href: '/settings/privacy',
          description: 'Security and privacy settings'
        }
      ]
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center space-x-3 focus:outline-none cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="bg-primary text-white flex-shrink-0 rounded-full h-10 w-10 flex items-center justify-center group-hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105">
          <span className="text-sm font-black">{getInitials()}</span>
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-3 w-80 rounded-[1.5rem] shadow-2xl bg-surface border border-border/60 focus:outline-none z-50 flex flex-col max-h-[calc(100vh-100px)] animate-in fade-in zoom-in duration-300 overflow-hidden">
          {/* User Info Header - Fixed at top */}
          <div className="flex-shrink-0 px-6 py-5 border-b border-border/40 bg-surface-secondary/20">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-white flex-shrink-0 rounded-full h-12 w-12 flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="text-lg font-black">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate tracking-wide">{getFullName()}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-bold">{user?.email}</p>
                <div className="flex items-center mt-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items - ONLY THIS SECTION SCROLLS */}
          <div className="flex-1 overflow-y-auto py-3">
            {menuItems.map((section, sectionIndex) => (
              <div key={section.section}>
                {sectionIndex > 0 && <div className="border-t border-border/40 my-3 mx-4"></div>}
                <div className="px-5 py-2">
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                    {section.section}
                  </p>
                </div>
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center mx-2 px-4 py-3.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-secondary/50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/40"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="mr-3 p-2 bg-surface rounded-lg border border-border/40 group-hover:border-primary/30 transition-all duration-300">
                      <item.icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors tracking-wide uppercase">{item.label}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold">{item.description}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Logout - Fixed at bottom, ALWAYS VISIBLE */}
          <div className="flex-shrink-0 border-t border-border/40">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-6 py-4 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 cursor-pointer group"
            >
              <div className="mr-3 p-2 bg-red-50 dark:bg-red-500/5 rounded-lg border border-red-100 dark:border-red-500/20 group-hover:border-red-200 dark:group-hover:border-red-500/30 transition-all duration-300">
                <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
