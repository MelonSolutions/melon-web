/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import { 
  ArrowLeft,
  CheckCircle,
  Play,
  FileText,
  BarChart3,
  Users,
  Target,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function GettingStartedPage() {
  const steps = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description: 'Set up your account with organization details and preferences',
      timeEstimate: '5 minutes',
      icon: Users,
      completed: true,
      actions: [
        { label: 'Edit Profile', href: '/profile' },
        { label: 'Organization Settings', href: '/settings' }
      ]
    },
    {
      id: 2,
      title: 'Create Your First Project',
      description: 'Add a project to your portfolio to start tracking impact',
      timeEstimate: '10 minutes',
      icon: Target,
      completed: false,
      actions: [
        { label: 'Create Project', href: '/portfolio/create' },
        { label: 'Project Templates', href: '/help/templates' }
      ]
    },
    {
      id: 3,
      title: 'Set Up Impact Metrics',
      description: 'Define key performance indicators to measure your success',
      timeEstimate: '15 minutes',
      icon: BarChart3,
      completed: false,
      actions: [
        { label: 'Create Metric', href: '/impact-metrics/create' },
        { label: 'Metric Examples', href: '/help/metric-examples' }
      ]
    },
    {
      id: 4,
      title: 'Build Your First Report',
      description: 'Create data collection forms to gather information',
      timeEstimate: '20 minutes',
      icon: FileText,
      completed: false,
      actions: [
        { label: 'Create Report', href: '/reports/create' },
        { label: 'Form Builder Guide', href: '/help/form-builder' }
      ]
    }
  ];

  const quickWins = [
    {
      title: 'Import Sample Data',
      description: 'Load example projects and metrics to explore the platform',
      action: 'Import Now',
      href: '/help/sample-data'
    },
    {
      title: 'Watch Tutorial Videos',
      description: 'Learn through step-by-step video demonstrations',
      action: 'Watch Videos',
      href: '/help/tutorials'
    },
    {
      title: 'Join Community',
      description: 'Connect with other impact measurement professionals',
      action: 'Join Forum',
      href: 'https://community.melon.com'
    }
  ];

  const resources = [
    {
      title: 'Video Tutorials',
      description: 'Watch guided walkthroughs',
      icon: Play,
      href: '/help/tutorials'
    },
    {
      title: 'Best Practices',
      description: 'Learn from experts',
      icon: CheckCircle,
      href: '/help/best-practices'
    },
    {
      title: 'API Documentation',
      description: 'Technical integration guide',
      icon: FileText,
      href: '/help/api-docs'
    },
    {
      title: 'Live Training',
      description: 'Join weekly sessions',
      icon: Users,
      href: '/help/training'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Welcome to Melon! 👋
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Get started with impact measurement in just a few steps. We&rsquo;ll guide you through 
            setting up your first project, creating metrics, and collecting data.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>45 minutes to complete</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>No technical skills required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
          <span className="text-sm text-gray-500">1 of 4 steps completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[#5B94E5] h-2 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Setup Steps</h2>
        
        {steps.map((step, index) => (
          <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${step.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <step.icon className="w-6 h-6 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Step {step.id}: {step.title}
                  </h3>
                  {step.completed && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{step.timeEstimate}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {step.actions.map((action, actionIndex) => (
                      <Link
                        key={actionIndex}
                        href={action.href}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                          actionIndex === 0
                            ? 'bg-[#5B94E5] text-white hover:bg-blue-600'
                            : 'text-[#5B94E5] hover:text-blue-600'
                        }`}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Wins */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Wins</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickWins.map((item, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 text-[#5B94E5] hover:text-blue-600 font-medium cursor-pointer"
              >
                {item.action}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <Link
              key={index}
              href={resource.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <resource.icon className="w-6 h-6 text-[#5B94E5]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#5B94E5]">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600">{resource.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B94E5]" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help Getting Started?</h3>
        <p className="text-gray-600 mb-4">
          Our team is here to help you succeed. Schedule a personalized onboarding session 
          or reach out with any questions.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/help/contact"
            className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Contact Support
          </Link>
          <Link
            href="/help/onboarding"
            className="px-4 py-2 text-[#5B94E5] text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
          >
            Schedule Onboarding
          </Link>
        </div>
      </div>
    </div>
  );
}