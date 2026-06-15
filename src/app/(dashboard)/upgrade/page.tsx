"use client";

import React, { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UpgradePage() {
  const { isTrial, trialUser } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isTrial) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You are already upgraded!</h2>
        <p className="text-gray-600 mb-6">Your organization has full access to the platform.</p>
        <Button onClick={() => router.push('/overview')} variant="primary">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // If the user is already on Pay-Per-Use (status === UPGRADED)
  if (trialUser?.status === 'UPGRADED') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
          Convert to Full Organization
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          You are currently on the <strong>Pay-Per-Use</strong> plan. While this gives you unlimited survey creation and responses, the rest of the platform (Portfolio, KYC, Impact Metrics, API Integrations, and Team Management) remains locked.
        </p>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to scale your impact?</h3>
          <p className="text-gray-500 mb-6">
            Contact our sales team to discuss converting your Pay-Per-Use account into a Full Organization account.
          </p>
          <Button 
            onClick={() => window.location.href = 'mailto:sales@melon.com'}
            variant="primary"
            className="w-full h-12 text-lg"
          >
            Contact Sales to Upgrade
          </Button>
        </div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    if (!trialUser?.email) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('trialToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trials/initialize-payment-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: trialUser.email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to initialize payment setup');
      }

      const data = await res.json();
      
      // Store reference to verify after redirect
      sessionStorage.setItem('paymentSetupRef', data.reference);
      
      // Redirect to Paystack
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError(err.message || 'An error occurred while setting up payment.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Upgrade your Trial Account
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Unlock the full potential of Melon for your organization.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
        <div className="px-6 py-8 sm:p-10 lg:w-1/2 bg-blue-50">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">What you get</h3>
          <ul className="space-y-4">
            {[
              'Unlimited responses for your surveys',
              'Advanced Analytics and Visualizations',
              'Impact Metrics tracking and scoring',
              'Portfolio management for projects',
              'Full KYC management features',
              'Geospatial Map Views'
            ].map((feature, i) => (
              <li key={i} className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">{feature}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-8 sm:p-10 lg:w-1/2 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pay As You Go</h3>
            <p className="text-gray-600">
              Only pay for the responses you collect. A temporary ₦50 authorization hold will be placed on your card to verify it.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-12 text-lg"
              variant="primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Initializing Setup...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Add Payment Method
                </div>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-gray-500 text-sm mt-4">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Secure Payment
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Instant Setup
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
