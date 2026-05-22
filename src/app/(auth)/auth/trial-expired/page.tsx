"use client";

import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrialExpiredPage() {
  const router = useRouter();

  const handleUpgrade = () => {
    // Redirect to upgrade/subscription page (to be implemented)
    router.push('/payments/subscribe?source=trial-expired');
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@melon.com?subject=Trial Upgrade Inquiry';
  };

  const handleLogout = () => {
    localStorage.removeItem('trialToken');
    router.push('/auth/trial-login');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Trial Period Ended
        </h1>
        <p className="text-sm text-gray-600">
          Your free trial has expired. Upgrade to continue using Melon.
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-medium text-orange-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Your data is safely stored and ready when you upgrade</li>
          <li>• Choose a plan that fits your organization&apos;s needs</li>
          <li>• Get access to advanced features and unlimited responses</li>
          <li>• Dedicated support for paid customers</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleUpgrade}
          className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Upgrade Now
        </button>

        <button
          onClick={handleContactSales}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
        >
          Contact Sales
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm transition-colors"
        >
          Back to Login
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Questions?{' '}
          <a href="mailto:support@melon.com" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
