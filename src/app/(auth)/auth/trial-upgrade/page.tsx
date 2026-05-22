"use client";

import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrialUpgradePage() {
  const router = useRouter();

  const handleAddPayment = () => {
    // Redirect to payment setup page (to be implemented)
    router.push('/payments/setup?source=trial');
  };

  const handleLogout = () => {
    localStorage.removeItem('trialToken');
    router.push('/auth/trial-login');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Add Payment Method
        </h1>
        <p className="text-sm text-gray-600">
          To continue using your trial, please add a payment method
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Why do I need to add payment?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Access the full dashboard and all features</li>
          <li>• No charges during your free trial period</li>
          <li>• Cancel anytime before trial ends</li>
          <li>• Seamless transition to paid plan if you choose to continue</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAddPayment}
          className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          Add Payment Method
          <ArrowRight className="w-4 h-4" />
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
          Need help?{' '}
          <a href="mailto:support@melon.com" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
