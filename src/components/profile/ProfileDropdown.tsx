'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  HelpCircle, 
  Shield,
  CreditCard,
  Download,
  ChevronRight
} from 'lucide-react';

export function ProfileDropdown() {
  const { user, logout, getInitials, getFullName } = useAuth();
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
          icon: CreditCard,
          label: 'Billing',
          href: '/billing',
          description: 'Manage subscription and billing'
        },
        {
          icon: Download,
          label: 'Export Data',
          href: '/export',
          description: 'Download your data'
        },
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
        className="flex items-center space-x-3 focus:outline-none cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="bg-[#5B94E5] text-white flex-shrink-0 rounded-full h-10 w-10 flex items-center justify-center hover:bg-blue-600 transition-colors">
          <span className="text-sm font-medium">{getInitials()}</span>
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* User Info Header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-[#5B94E5] text-white flex-shrink-0 rounded-full h-12 w-12 flex items-center justify-center">
                <span className="text-lg font-medium">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 truncate">{getFullName()}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((section, sectionIndex) => (
              <div key={section.section}>
                {sectionIndex > 0 && <div className="border-t border-gray-100 my-2"></div>}
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.section}
                  </p>
                </div>
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100">
            <button 
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}