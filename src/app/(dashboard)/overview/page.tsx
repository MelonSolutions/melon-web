'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Activity,
  Calendar,
  FileText,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'metric' | 'report' | 'project';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

export default function MainDashboard() {
  const [timeframe, setTimeframe] = useState('6months');

  const dashboardMetrics: DashboardMetric[] = [
    {
      label: 'Total Programs',
      value: '24',
      change: '+12% from last quarter',
      changeType: 'positive',
      icon: Target
    },
    {
      label: 'Active Projects',
      value: '86',
      change: '+8% from last quarter',
      changeType: 'positive',
      icon: Activity
    },
    {
      label: 'Beneficiaries',
      value: '12.5K',
      change: '+18% from last quarter',
      changeType: 'positive',
      icon: Users
    },
    {
      label: 'Impact Score',
      value: '87%',
      change: '-3% from target',
      changeType: 'negative',
      icon: TrendingUp
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Create New Report',
      description: 'Set up a new data collection form',
      href: '/reports/create',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Add Impact Metric',
      description: 'Define a new performance indicator',
      href: '/impact-metrics/create',
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      title: 'New Project',
      description: 'Start a new program or initiative',
      href: '/portfolio/create',
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      title: 'View Map Data',
      description: 'Explore geospatial insights',
      href: '/map-view',
      icon: MapPin,
      color: 'bg-orange-500'
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'metric',
      title: 'Households Reached metric updated',
      description: 'Auto-updated from report responses: 870 households reached',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'report',
      title: 'Q2 Health Program Assessment published',
      description: 'New report is now collecting responses',
      time: '5 hours ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'project',
      title: 'Rural Health Initiative 2024 milestone reached',
      description: 'Project progress updated to 78% completion',
      time: '1 day ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'metric',
      title: 'Energy Access Rate below target',
      description: 'Current progress at 65% - review needed',
      time: '2 days ago',
      status: 'warning'
    },
    {
      id: '5',
      type: 'report',
      title: 'Malaria Incidence Report reminder',
      description: 'Data collection deadline in 3 days',
      time: '3 days ago',
      status: 'warning'
    }
  ];

  const upcomingDeadlines = [
    {
      title: 'Q2 Impact Report',
      dueDate: 'Due in 5 days',
      type: 'report',
      priority: 'high'
    },
    {
      title: 'Donor Presentation',
      dueDate: 'Due in 12 days',
      type: 'presentation',
      priority: 'medium'
    },
    {
      title: 'Stakeholder Review',
      dueDate: 'Due in 18 days',
      type: 'review',
      priority: 'low'
    }
  ];

  const keyMetrics = [
    { label: 'Health Facility Coverage Rate', value: 78, sector: 'Healthcare', color: 'bg-green-500' },
    { label: 'Electricity Access Rate', value: 92, sector: 'Energy', color: 'bg-yellow-500' },
    { label: 'Crop Yield per Hectare', value: 65, sector: 'Agriculture', color: 'bg-blue-500' },
    { label: 'Road Accessibility Index', value: 45, sector: 'Infrastructure', color: 'bg-purple-500' }
  ];

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'positive') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (changeType === 'negative') {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Program Impact Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and monitor your program performance across all initiatives</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent cursor-pointer text-sm"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <metric.icon className="w-5 h-5 text-[#5B94E5]" />
                </div>
              </div>
              {getChangeIcon(metric.changeType)}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              <p className={`text-sm mt-1 ${
                metric.changeType === 'positive' ? 'text-green-600' : 
                metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {metric.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Program Progress */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Program Progress</h3>
              <p className="text-sm text-gray-500">Tracking key performance indicators across sectors</p>
            </div>
            <Link 
              href="/impact-metrics" 
              className="text-sm text-[#5B94E5] hover:text-blue-600 font-medium cursor-pointer"
            >
              View All Metrics
            </Link>
          </div>
          
          <div className="space-y-4">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{metric.label}</span>
                    <span className="text-sm text-gray-500">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${metric.color}`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{metric.sector}</span>
                    <span className={`text-xs ${
                      metric.value >= 80 ? 'text-green-600' : 
                      metric.value >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.value >= 80 ? 'On Track' : metric.value >= 60 ? 'Needs Attention' : 'Critical'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link 
              href="/overview" 
              className="inline-flex items-center text-sm text-[#5B94E5] hover:text-blue-600 font-medium cursor-pointer"
            >
              View detailed analytics
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#5B94E5] hover:bg-blue-50 transition-colors cursor-pointer group"
              >
                <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#5B94E5]">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#5B94E5]" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <Link 
              href="/activity" 
              className="text-sm text-[#5B94E5] hover:text-blue-600 font-medium cursor-pointer"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
            <Link 
              href="/calendar" 
              className="text-sm text-[#5B94E5] hover:text-blue-600 font-medium cursor-pointer"
            >
              View Calendar
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                    <p className="text-xs text-gray-500">{deadline.dueDate}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  deadline.priority === 'high' ? 'bg-red-100 text-red-800' :
                  deadline.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {deadline.priority}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link 
              href="/reports" 
              className="inline-flex items-center text-sm text-[#5B94E5] hover:text-blue-600 font-medium cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              View all reports
            </Link>
          </div>
        </div>
      </div>

      {/* Regional Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Regional Impact Distribution</h3>
            <p className="text-sm text-gray-500">Program coverage across different regions</p>
          </div>
          <Link 
            href="/map-view" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            View Map
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { region: 'Northern Region', projects: 8, beneficiaries: '3.2K', coverage: 78 },
            { region: 'Eastern Region', projects: 12, beneficiaries: '4.1K', coverage: 85 },
            { region: 'Central Region', projects: 6, beneficiaries: '2.1K', coverage: 62 },
            { region: 'Western Region', projects: 10, beneficiaries: '2.8K', coverage: 71 },
            { region: 'Southern Region', projects: 4, beneficiaries: '1.3K', coverage: 45 }
          ].map((region, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{region.region}</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-semibold text-[#5B94E5]">{region.projects}</p>
                  <p className="text-xs text-gray-500">Projects</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{region.beneficiaries}</p>
                  <p className="text-xs text-gray-500">Beneficiaries</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-[#5B94E5] h-1.5 rounded-full"
                    style={{ width: `${region.coverage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{region.coverage}% coverage</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}