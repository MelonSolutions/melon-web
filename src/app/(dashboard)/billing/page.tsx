'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

export default function BillingDashboardPage() {
  const [loading, setLoading] = useState(false);

  const currentPlan = {
    name: 'Professional',
    price: 99,
    billing: 'monthly',
    nextBilling: '2024-02-15',
    status: 'active'
  };

  const usage = {
    projects: { current: 18, limit: 50 },
    metrics: { current: 35, limit: 100 },
    reports: { current: 28, limit: 75 },
    responses: { current: 2847, limit: 10000 },
    teamMembers: { current: 4, limit: 10 }
  };

  const paymentMethods = [
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expiry: '09/25',
      isDefault: false
    }
  ];

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - January 2024'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - December 2023'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - November 2023'
    }
  ];

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Handle cancellation
      } catch (error) {
        console.error('Error canceling subscription:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your subscription, payment methods, and billing history</p>
        </div>
        <Link
          href="/billing/plans"
          className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Upgrade Plan
        </Link>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold text-gray-900">${currentPlan.price}</span>
              <span className="text-gray-600">/{currentPlan.billing}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Next Billing Date</h4>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{new Date(currentPlan.nextBilling).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/billing/plans"
              className="px-4 py-2 text-[#5B94E5] border border-[#5B94E5] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Change Plan
            </Link>
            <button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Canceling...' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Usage Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(usage).map(([key, value]) => {
            const percentage = getUsagePercentage(value.current, value.limit);
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            
            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{label}</h3>
                  <span className={`text-sm font-medium ${getUsageColor(percentage)}`}>
                    {percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{value.current.toLocaleString()} used</span>
                  <span>{value.limit.toLocaleString()} limit</span>
                </div>
              </div>
            );
          })}
        </div>

        {Object.values(usage).some(u => getUsagePercentage(u.current, u.limit) >= 90) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900">Usage Limit Warning</h4>
                <p className="text-sm text-red-800 mt-1">
                  You&rsquo;re approaching your plan limits. Consider upgrading to avoid service interruptions.
                </p>
                <Link
                  href="/billing/plans"
                  className="inline-flex items-center gap-1 text-sm text-red-700 hover:text-red-900 font-medium mt-2 cursor-pointer"
                >
                  Upgrade Plan
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-[#5B94E5] border border-[#5B94E5] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              Add Method
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      •••• •••• •••• {method.last4}
                    </p>
                    <p className="text-xs text-gray-500">Expires {method.expiry}</p>
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Default
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
            <Link
              href="/billing/invoices"
              className="text-sm text-[#5B94E5] hover:text-blue-600 cursor-pointer"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.id}</p>
                  <p className="text-xs text-gray-500">{invoice.description}</p>
                  <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${invoice.amount}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {invoice.status}
                    </span>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Billing Information</h2>
          <button className="px-4 py-2 text-[#5B94E5] border border-[#5B94E5] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
            Edit Information
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Billing Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Melon Impact Solutions</p>
              <p>123 Innovation Drive</p>
              <p>Lagos, Nigeria 100001</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Tax Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>VAT ID: NG123456789</p>
              <p>Tax Rate: 7.5%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}