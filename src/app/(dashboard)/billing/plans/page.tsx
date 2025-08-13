/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Check,
  X,
  Star,
  Users,
  BarChart3,
  FileText,
  Zap,
  Shield,
  Headphones
} from 'lucide-react';

export default function SubscriptionPlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small organizations getting started',
      monthlyPrice: 29,
      annualPrice: 290,
      popular: false,
      features: [
        { name: '5 Projects', included: true },
        { name: '25 Impact Metrics', included: true },
        { name: '10 Reports', included: true },
        { name: '1,000 Response Submissions', included: true },
        { name: '3 Team Members', included: true },
        { name: 'Basic Analytics', included: true },
        { name: 'Email Support', included: true },
        { name: 'API Access', included: false },
        { name: 'Custom Integrations', included: false },
        { name: 'Priority Support', included: false },
        { name: 'Advanced Security', included: false }
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing organizations with advanced needs',
      monthlyPrice: 99,
      annualPrice: 990,
      popular: true,
      features: [
        { name: '50 Projects', included: true },
        { name: '100 Impact Metrics', included: true },
        { name: '75 Reports', included: true },
        { name: '10,000 Response Submissions', included: true },
        { name: '10 Team Members', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Email & Chat Support', included: true },
        { name: 'API Access', included: true },
        { name: 'Basic Integrations', included: true },
        { name: 'Priority Support', included: false },
        { name: 'Advanced Security', included: false }
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with enterprise requirements',
      monthlyPrice: 299,
      annualPrice: 2990,
      popular: false,
      features: [
        { name: 'Unlimited Projects', included: true },
        { name: 'Unlimited Impact Metrics', included: true },
        { name: 'Unlimited Reports', included: true },
        { name: 'Unlimited Response Submissions', included: true },
        { name: 'Unlimited Team Members', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: '24/7 Phone & Chat Support', included: true },
        { name: 'Full API Access', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Advanced Security & SSO', included: true }
      ]
    }
  ];

  const features = [
    {
      category: 'Core Features',
      icon: BarChart3,
      items: [
        'Impact metrics tracking',
        'Project portfolio management',
        'Data collection & reports',
        'Real-time dashboard',
        'Progress visualization'
      ]
    },
    {
      category: 'Team Collaboration',
      icon: Users,
      items: [
        'Multi-user access',
        'Role-based permissions',
        'Team activity tracking',
        'Collaborative editing',
        'Comment system'
      ]
    },
    {
      category: 'Integrations',
      icon: Zap,
      items: [
        'REST API access',
        'Webhook support',
        'Google Sheets export',
        'Slack notifications',
        'Custom integrations'
      ]
    },
    {
      category: 'Security & Support',
      icon: Shield,
      items: [
        'Data encryption',
        'Regular backups',
        'GDPR compliance',
        'Expert support',
        'Training resources'
      ]
    }
  ];

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Redirect to checkout or success page
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setLoading(null);
    }
  };

  const getCurrentPrice = (plan: any) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavingsPercentage = (monthlyPrice: number, annualPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    return Math.round(((monthlyCost - annualPrice) / monthlyCost) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/billing"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 mb-8">
            Select the perfect plan for your organization&rsquo;s impact measurement needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const currentPrice = getCurrentPrice(plan);
          const savings = billingCycle === 'annual' ? getSavingsPercentage(plan.monthlyPrice, plan.annualPrice) : 0;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg border-2 p-8 ${
                plan.popular
                  ? 'border-[#5B94E5] shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-full">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${currentPrice}</span>
                  <span className="text-gray-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                
                {billingCycle === 'annual' && savings > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    Save {savings}% with annual billing
                  </p>
                )}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-6 ${
                  plan.popular
                    ? 'bg-[#5B94E5] text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 cursor-pointer`}
              >
                {loading === plan.id ? 'Processing...' : 'Get Started'}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          Everything You Need for Impact Measurement
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((category, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <category.icon className="w-6 h-6 text-[#5B94E5]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{category.category}</h3>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we&rsquo;ll prorate your billing accordingly.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              We offer a 14-day free trial for all paid plans. No credit card required to get started.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards (Visa, Mastercard, American Express) and bank transfers 
              for annual plans.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Do you offer discounts for nonprofits?</h3>
            <p className="text-gray-600">
              Yes, we offer special pricing for qualified nonprofit organizations. 
              Contact our sales team for more information.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center bg-white rounded-lg border border-gray-200 p-8">
        <Headphones className="w-12 h-12 text-[#5B94E5] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
        <p className="text-gray-600 mb-6">
          Our team is here to help you find the perfect plan for your organization&rsquo;s needs.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/help/contact"
            className="px-6 py-3 bg-[#5B94E5] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Contact Sales
          </Link>
          <Link
            href="/help"
            className="px-6 py-3 text-[#5B94E5] border border-[#5B94E5] font-medium rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}