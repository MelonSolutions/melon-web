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
  Users
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
      title: 'Create New Report',
      description: 'Set up a new data collection form',
      href: '/reports/create',
      icon: FileText,
    },
    {
      title: 'New Project',
      description: 'Start a new program or initiative',
      href: '/portfolio/create',
      icon: Target,
    },
    {
      title: 'Add KYC Request',
      description: 'Verify a new customer',
      href: '/kyc/create',
      icon: Users,
    },
    {
      title: 'View Map Data',
      description: 'Explore geospatial insights',
      href: '/map-view',
      icon: MapPin,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Failed to load dashboard</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and monitor your program performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={dashboardStats.totalPrograms.description}
            value={dashboardStats.totalPrograms.value}
          />
          <StatCard
            label={dashboardStats.activeProjects.description}
            value={dashboardStats.activeProjects.value}
          />
          <StatCard
            label={dashboardStats.beneficiaries.description}
            value={dashboardStats.beneficiaries.value}
          />
          <StatCard
            label={dashboardStats.verifiedUsers.description}
            value={dashboardStats.verifiedUsers.value}
          />
        </div>
      )}

      {/* Empty State - No Projects */}
      {!hasProjects && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Programs Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by creating your first program to begin tracking impact and managing projects.
              </p>
              <Link href="/portfolio/create">
                <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                  Create Your First Program
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content - Only show when has projects */}
      {hasProjects && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Program Progress */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Program Progress</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Key performance indicators
                    </p>
                  </div>
                  {hasMetrics && (
                    <Link href="/impact-metrics">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {hasMetrics ? (
                  <div className="space-y-6">
                    {programProgress.map((metric, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {metric.label}
                          </span>
                          <span className="text-sm text-gray-600">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(metric.value)}`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 mb-4">
                      No impact metrics tracked yet
                    </p>
                    <Link href="/impact-metrics/create">
                      <Button variant="secondary" size="sm">
                        Add Impact Metric
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} href={action.href}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors group">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-light transition-colors">
                          <Icon className="w-4 h-4 text-gray-600 group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{action.title}</p>
                          <p className="text-xs text-gray-500 truncate">{action.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Regional Distribution</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Program coverage across regions
                </p>
              </div>
              <Link href="/map-view">
                <Button variant="primary" size="md" icon={<MapPin className="w-4 h-4" />}>
                  View Map
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {regionalDistribution.map((region, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{region.region}</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-primary">{region.projects}</p>
                      <p className="text-xs text-gray-500">Projects</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{region.beneficiaries}</p>
                      <p className="text-xs text-gray-500">Beneficiaries</p>
                    </div>
                    {region.coverage > 0 && (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                          <div 
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${region.coverage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{region.coverage}% coverage</p>
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