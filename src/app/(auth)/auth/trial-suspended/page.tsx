"use client";

import React from 'react';
import { ShieldAlert, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrialSuspendedPage() {
  const router = useRouter();

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@melon.com?subject=Trial Account Suspended';
  };

  const handleLogout = () => {
    localStorage.removeItem('trialToken');
    router.push('/auth/trial-login');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Account Suspended
        </h1>
        <p className="text-sm text-gray-600">
          Your trial account has been suspended. Please contact support for assistance.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-900 mb-2">Why was my account suspended?</h3>
        <p className="text-sm text-red-800 mb-3">
          Trial accounts may be suspended for various reasons including:
        </p>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• Violation of terms of service</li>
          <li>• Payment issues or declined transactions</li>
          <li>• Suspicious activity detected</li>
          <li>• Administrative hold pending review</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleContactSupport}
          className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
        >
          Back to Login
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Our support team typically responds within 24 hours
        </p>
      </div>
    </div>
  );
}
