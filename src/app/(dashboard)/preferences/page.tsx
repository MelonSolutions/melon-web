'use client';

import React from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  ShieldAlert,
  CreditCard,
  Building2
} from 'lucide-react';

export default function PreferencesPage() {
  const { isTrial, trialUser, isLoading } = useAuthContext();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B94E5]"></div>
      </div>
    );
  }

  // Double check the user is actually a trial user. If not, redirect.
  if (!isTrial || !trialUser) {
    router.replace('/settings');
    return null;
  }

  const calculatePercentage = (used: number, remaining: number) => {
    const total = used + remaining;
    if (total === 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  const responsePercentage = calculatePercentage(trialUser.responsesUsed, trialUser.responsesRemaining);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Trial Preferences</h1>
            <p className="text-gray-600 mt-1">Manage your Pay-Per-Use trial and view your usage metrics</p>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
            Status: {trialUser.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Surveys */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-medium">Active Surveys</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-gray-900">{trialUser.surveysCreated}</span>
              <span className="text-gray-500 text-sm">created</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600">Unlimited survey creation allowed</span>
          </div>
        </div>

        {/* Card 2: Responses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-medium">Response Usage</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900">{trialUser.responsesUsed}</span>
                <span className="text-gray-500 text-sm">used</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{trialUser.responsesRemaining}</span>
                <span className="text-sm text-gray-500 ml-1">remaining</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${responsePercentage}%` }}
                  className="h-full bg-[#5B94E5] rounded-full transition-all duration-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">{responsePercentage}% of limit used</p>
            </div>
          </div>
        </div>

        {/* Card 3: Time Remaining */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between md:col-span-3">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-50 rounded-full shrink-0">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium mb-1">Time Remaining</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900">{trialUser.daysRemaining}</span>
                <span className="text-gray-500">days left until trial expiration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Banner */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden md:col-span-3">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#5B94E5]" />
              <h3 className="text-lg font-medium text-gray-900">Upgrade to Full Organization</h3>
            </div>
          </div>
          
          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <p className="text-sm text-gray-600 leading-relaxed">
                Convert your Pay-Per-Use trial to a Full Organization account to unlock Portfolio management, KYC verification, infinite data retention, API integrations, and multiple team members.
              </p>
            </div>
            
            <button 
              onClick={() => window.location.href = 'mailto:sales@melon.com'}
              className="shrink-0 bg-[#5B94E5] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
