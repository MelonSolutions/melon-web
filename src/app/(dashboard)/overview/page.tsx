'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  FileText,
  BarChart3,
  MapPin,
  ArrowRight,
  Plus,
  Users,
  Activity,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { useOverview } from '@/hooks/useOverview';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

export default function OverviewPage() {
  const [timeframe, setTimeframe] = useState('6months');
  const {
    dashboardStats,
    programProgress,
    regionalDistribution,
    loading,
    error
  } = useOverview(timeframe);

  const quickActions: QuickAction[] = [
    {
      title: 'New Report',
      description: 'Create a new data collection form',
      href: '/reports/create',
      icon: FileText,
    },
    {
      title: 'New Project',
      description: 'Set up a new project entry',
      href: '/portfolio/create',
      icon: Target,
    },
    {
      title: 'KYC Verification',
      description: 'Submit or verify identity details',
      href: '/kyc/create',
      icon: Shield,
    },
    {
      title: 'Map View',
      description: 'View project distributions on the map',
      href: '/map-view',
      icon: MapPin,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-10 font-sans animate-pulse px-2">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-border/40 rounded-full"></div>
              <div className="h-10 w-48 bg-border/40 rounded-xl"></div>
            </div>
            <div className="h-4 w-72 bg-border/20 rounded-lg ml-5"></div>
          </div>
          <div className="h-12 w-32 bg-border/40 rounded-2xl"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
              <div className="w-10 h-10 bg-border/30 rounded-2xl mb-4"></div>
              <div className="h-3 w-28 bg-border/20 rounded-full mb-2"></div>
              <div className="h-8 w-20 bg-border/40 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-border h-96 shadow-sm"></div>
          <div className="bg-surface rounded-[2.5rem] border border-border h-96 shadow-sm"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <div className="w-20 h-20 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center mb-6">
          <Activity className="w-10 h-10 text-error" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-2">Connection Error</h3>
        <p className="text-sm font-medium text-gray-500 mb-10">Failed to establish connection with the server.</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="px-12 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const hasProjects = dashboardStats?.totalPrograms?.value !== '0';
  const hasRegionalData = regionalDistribution && regionalDistribution.length > 0;
  const hasMetrics = programProgress && programProgress.length > 0;

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-success';
    if (value >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="space-y-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Dashboard</h1>
          </div>
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-5">
            Welcome back to your project overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="h-12 pl-12 pr-6 min-w-[200px] text-[11px] font-black uppercase tracking-widest border border-border bg-surface text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer outline-none appearance-none hover:border-primary/20"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label={dashboardStats.totalPrograms.description}
            value={dashboardStats.totalPrograms.value}
            className="rounded-3xl border-2 hover:border-primary/20 transition-all group"
          />
          <StatCard
            label={dashboardStats.activeProjects.description}
            value={dashboardStats.activeProjects.value}
            className="rounded-3xl border-2 hover:border-primary/20 transition-all group"
          />
          <StatCard
            label={dashboardStats.beneficiaries.description}
            value={dashboardStats.beneficiaries.value}
            className="rounded-3xl border-2 hover:border-primary/20 transition-all group"
          />
          <StatCard
            label={dashboardStats.verifiedUsers.description}
            value={dashboardStats.verifiedUsers.value}
            className="rounded-3xl border-2 hover:border-primary/20 transition-all group"
          />
        </div>
      )}

      {!hasProjects && (
        <div className="bg-surface rounded-[3.5rem] border-2 border-dashed border-border p-24 text-center group transition-all hover:bg-surface-secondary/20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-surface-secondary mb-8 border border-border group-hover:rotate-12 transition-transform duration-700">
            <Target className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-4">
            No active projects
          </h3>
          <p className="text-sm font-medium text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
            No active projects detected. Create your first project to begin tracking data.
          </p>
          <Link href="/portfolio/create">
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-4 h-4" />}
              className="px-12 py-5 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
            >
              New Project
            </Button>
          </Link>
        </div>
      )}

      {hasProjects && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Program Progress Tracking */}
          <div className="lg:col-span-2">
            <Card className="rounded-[2.5rem] border-border overflow-hidden bg-surface group relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Activity className="w-48 h-48" />
              </div>
              <CardHeader className="px-10 py-8 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] mb-1">Program Progress</CardTitle>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall progress across active programs</p>
                  </div>
                  {hasMetrics && (
                    <Link href="/impact-metrics">
                      <Button variant="secondary" className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] border-border/60">
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-10">
                {hasMetrics ? (
                  <div className="space-y-10">
                    {programProgress.map((metric, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${getProgressColor(metric.value)}`}></div>
                            {metric.label}
                          </span>
                          <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{metric.value}% Complete</span>
                        </div>
                        <div className="w-full bg-surface-secondary rounded-full h-3 overflow-hidden p-[3px] border border-border/40">
                          <div
                            className={`h-full rounded-full ${getProgressColor(metric.value)} shadow-sm transition-all duration-1000 ease-out`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-800 mb-6 animate-pulse" />
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">
                      No program progress data available
                    </p>
                    <Link href="/impact-metrics/create">
                      <Button variant="secondary" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] border-border/60">
                        Add Metric
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="rounded-[2.5rem] border-border bg-surface flex flex-col">
            <CardHeader className="px-10 py-8 border-b border-border/60">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} href={action.href}>
                      <div className="flex items-center gap-5 p-5 rounded-3xl border border-border bg-surface-secondary/20 hover:border-primary hover:bg-surface transition-all group role-button">
                        <div className="p-3 bg-surface rounded-2xl border border-border group-hover:bg-primary/5 transition-all group-hover:scale-110 shadow-sm">
                          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-600 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{action.title}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-wide truncate">{action.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regional Distribution */}
      {hasRegionalData && (
        <Card className="rounded-[3rem] border-border overflow-hidden bg-surface group">
          <CardHeader className="px-10 py-8 border-b border-border/60 bg-surface-secondary/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] mb-1">Regional Distribution</CardTitle>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Project distribution across geographic regions</p>
              </div>
              <Link href="/map-view">
                <Button
                  variant="primary"
                  className="px-10 py-4 rounded-xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[9px]"
                  icon={<MapPin className="w-4 h-4" />}
                >
                  Map view
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {regionalDistribution.map((region, index) => (
                <div key={index} className="p-8 rounded-[2rem] border border-border bg-surface-secondary/20 hover:bg-surface hover:border-primary/20 transition-all group/node shadow-sm flex flex-col">
                  <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/node:bg-primary transition-colors"></div>
                    {region.region}
                  </h4>
                  <div className="space-y-6 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Projects</span>
                      <p className="text-2xl font-black text-primary tracking-tighter">{region.projects}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Beneficiaries</span>
                      <p className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tighter">{region.beneficiaries}</p>
                    </div>
                    {region.coverage > 0 && (
                      <div className="pt-4 border-t border-border/60">
                        <div className="w-full bg-surface-secondary rounded-full h-1.5 mb-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full group-hover/node:scale-x-105 transition-transform origin-left duration-1000"
                            style={{ width: `${region.coverage}%` }}
                          />
                        </div>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{region.coverage}% Coverage</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}