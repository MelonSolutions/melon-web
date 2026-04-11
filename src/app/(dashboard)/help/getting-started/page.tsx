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
  ChevronRight,
  Rocket,
  Zap
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
        { label: 'Edit Profile', href: '/profile', exists: true },
        { label: 'Organization Settings', href: '/settings', exists: true }
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
        { label: 'Create Project', href: '/portfolio/create', exists: true },
        { label: 'Project Templates', href: '/help/templates', exists: false }
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
        { label: 'Create Metric', href: '/impact-metrics/create', exists: true },
        { label: 'Metric Examples', href: '/help/metric-examples', exists: false }
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
        { label: 'Create Report', href: '/reports/create', exists: true },
        { label: 'Form Builder Guide', href: '/help/form-builder', exists: false }
      ]
    }
  ];

  const quickWins = [
    {
      title: 'Import Sample Data',
      description: 'Load example projects and metrics to explore the platform',
      action: 'Import Now',
      href: '/help/sample-data',
      exists: false
    },
    {
      title: 'Watch Tutorial Videos',
      description: 'Learn through step-by-step video demonstrations',
      action: 'Watch Videos',
      href: '/help/tutorials',
      exists: false
    },
    {
      title: 'Join Community',
      description: 'Connect with other impact measurement professionals',
      action: 'Join Forum',
      href: 'https://community.melon.com',
      exists: true,
      external: true
    }
  ];

  const resources = [
    {
      title: 'Video Tutorials',
      description: 'Watch guided walkthroughs',
      icon: Play,
      href: '/help/tutorials',
      exists: false
    },
    {
      title: 'Best Practices',
      description: 'Learn from experts',
      icon: CheckCircle,
      href: '/help/best-practices',
      exists: false
    },
    {
      title: 'API Documentation',
      description: 'Technical integration guide',
      icon: FileText,
      href: '/help/api-docs',
      exists: true
    },
    {
      title: 'Live Training',
      description: 'Join weekly sessions',
      icon: Users,
      href: '/help/training',
      exists: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 font-sans px-4 sm:px-8">
      {/* Header */}
      <div className="pt-6">
        <Link
          href="/help"
          className="inline-flex items-center gap-3 text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary mb-10 cursor-pointer uppercase tracking-[0.2em] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to neural hub
        </Link>

        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-emerald-500/5 to-violet-500/10 rounded-[3rem] border border-primary/20 p-12 shadow-2xl shadow-primary/10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -mr-36 -mt-36 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/10 border border-primary/30 rounded-full mb-8 shadow-lg shadow-primary/5">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Protocol Initialization</span>
            </div>

            <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight leading-tight mb-6">
              Welcome to Melon
            </h1>
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-10 max-w-3xl leading-relaxed">
              Get started with impact measurement in just a few steps. We&rsquo;ll guide you through
              setting up your first project, creating metrics, and collecting data.
            </p>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3 text-sm font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                <div className="p-2 bg-surface rounded-lg border border-border shadow-sm">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span>45 min protocol</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                <div className="p-2 bg-surface rounded-lg border border-border shadow-sm">
                  <Zap className="w-4 h-4 text-emerald-500" />
                </div>
                <span>Zero expertise req</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-surface rounded-[2rem] border border-border/60 p-10 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">System Integration Progress</h2>
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4 py-2 bg-surface-secondary rounded-xl border border-border">1 of 4 protocols active</span>
        </div>
        <div className="w-full bg-surface-secondary rounded-full h-3 overflow-hidden border border-border/40">
          <div className="bg-gradient-to-r from-primary to-emerald-500 h-3 rounded-full transition-all duration-700 shadow-lg shadow-primary/30" style={{ width: '25%' }}></div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Deployment Sequence</h2>
        </div>

        {steps.map((step, index) => (
          <div key={step.id} className={`bg-surface rounded-[2.5rem] border p-10 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden ${
            step.completed ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-border/60 hover:border-primary/30'
          }`}>
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110 blur-3xl ${
              step.completed ? 'bg-emerald-500/5' : 'bg-primary/5'
            }`}></div>

            <div className="flex items-start gap-8 relative z-10">
              <div className={`p-5 rounded-2xl border-2 shadow-xl transition-all duration-500 group-hover:scale-110 ${
                step.completed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-surface-secondary border-border text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <step.icon className="w-8 h-8" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">
                    Protocol {step.id}: {step.title}
                  </h3>
                  {step.completed && (
                    <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-500/5">
                      Operational
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 leading-relaxed italic opacity-80">&ldquo;{step.description}&rdquo;</p>

                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <div className="p-2 bg-surface-secondary rounded-lg border border-border">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{step.timeEstimate}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {step.actions.map((action, actionIndex) => (
                      action.exists ? (
                        <Link
                          key={actionIndex}
                          href={action.href}
                          className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 cursor-pointer shadow-lg ${
                            actionIndex === 0
                              ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
                              : 'text-primary border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40'
                          }`}
                        >
                          {action.label}
                        </Link>
                      ) : (
                        <button
                          key={actionIndex}
                          disabled
                          className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 cursor-not-allowed opacity-40 bg-gray-200 dark:bg-gray-800 text-gray-400"
                        >
                          {action.label} (Soon)
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Wins */}
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Rapid Execution Protocols</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickWins.map((item, index) => (
            <div key={index} className="bg-surface rounded-[2rem] border border-border/60 p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-1000 blur-2xl"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{item.description}</p>
                {item.exists ? (
                  item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-[0.15em] cursor-pointer transition-all group/link"
                    >
                      {item.action}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-[0.15em] cursor-pointer transition-all group/link"
                    >
                      {item.action}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  )
                ) : (
                  <span className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] cursor-not-allowed opacity-50">
                    {item.action} (Soon)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-violet-500 rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Knowledge Matrix</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resources.map((resource, index) => (
            resource.exists ? (
              <Link
                key={index}
                href={resource.href}
                className="bg-surface rounded-[2rem] border border-border/60 p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-125 duration-1000 blur-2xl"></div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-lg shadow-primary/5">
                    <resource.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors uppercase tracking-tight mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{resource.description}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-2" />
                </div>
              </Link>
            ) : (
              <div
                key={index}
                className="bg-surface rounded-[2rem] border border-border/60 p-8 transition-all duration-500 cursor-not-allowed opacity-50 relative overflow-hidden"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700">
                    <resource.icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400">{resource.description} (Coming Soon)</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Need Help */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-violet-500/5 to-emerald-500/10 rounded-[3rem] border border-primary/20 p-12 shadow-2xl shadow-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>

        <div className="relative z-10">
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-tight">Mission Critical Support Required?</h3>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
            Our team is here to help you succeed. Schedule a personalized onboarding session
            or reach out with any questions.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <button
              disabled
              className="px-8 py-4 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 cursor-not-allowed opacity-50"
            >
              Contact Support (Soon)
            </button>
            <button
              disabled
              className="px-8 py-4 text-gray-400 border-2 border-gray-300 dark:border-gray-700 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 cursor-not-allowed opacity-50"
            >
              Schedule Onboarding (Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}