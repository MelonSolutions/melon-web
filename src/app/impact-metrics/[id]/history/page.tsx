/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface HistoryEntry {
  id: string;
  date: string;
  actualValue: number;
  targetValue: number;
  progress: number;
  status: 'achieved' | 'on-track' | 'failed';
  source: 'manual' | 'auto' | 'report';
  notes?: string;
  updatedBy?: string;
}

export default function MetricHistoryPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<any>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch metric and history data
    setTimeout(() => {
      setMetric({
        id: params.id,
        label: 'Households Reached',
        unit: 'households',
        sector: 'Health',
        targetValue: 1000,
        currentValue: 850,
        currentProgress: 85,
        currentStatus: 'on-track',
      });

      setHistory([
        {
          id: '1',
          date: '2024-01-15',
          actualValue: 150,
          targetValue: 1000,
          progress: 15,
          status: 'on-track',
          source: 'manual',
          updatedBy: 'Dr. Sarah Johnson',
          notes: 'Initial launch phase completed'
        },
        {
          id: '2',
          date: '2024-02-15',
          actualValue: 320,
          targetValue: 1000,
          progress: 32,
          status: 'on-track',
          source: 'auto',
          notes: 'Auto-updated from February report submissions'
        },
        {
          id: '3',
          date: '2024-03-15',
          actualValue: 480,
          targetValue: 1000,
          progress: 48,
          status: 'on-track',
          source: 'report',
          notes: 'Monthly report integration'
        },
        {
          id: '4',
          date: '2024-04-15',
          actualValue: 650,
          targetValue: 1000,
          progress: 65,
          status: 'failed',
          source: 'manual',
          updatedBy: 'Michael Chen',
          notes: 'Manual adjustment due to data verification'
        },
        {
          id: '5',
          date: '2024-05-15',
          actualValue: 850,
          targetValue: 1000,
          progress: 85,
          status: 'on-track',
          source: 'auto',
          notes: 'Strong progress in May campaigns'
        },
      ]);

      setLoading(false);
    }, 1000);
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-100 text-green-800';
      case 'on-track':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'auto':
        return 'bg-purple-100 text-purple-800';
      case 'report':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'auto':
        return 'Auto-Updated';
      case 'report':
        return 'Report Integration';
      case 'manual':
        return 'Manual Entry';
      default:
        return source;
    }
  };

  const getChangeIcon = (current: number, previous?: number) => {
    if (!previous) return null;
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/impact-metrics/${params.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Metric Details
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{metric?.label} - History</h1>
              <p className="text-gray-600 mt-1">
                Track changes and progress over time for this metric
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent cursor-pointer text-sm"
              >
                <option value="all">All Time</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
              </select>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Current Metric Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metric?.currentValue?.toLocaleString()} {metric?.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Target Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metric?.targetValue?.toLocaleString()} {metric?.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{metric?.currentProgress}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(metric?.currentStatus)}`}>
                {metric?.currentStatus === 'on-track' ? 'On Track' : 
                 metric?.currentStatus === 'achieved' ? 'Achieved' : 'Failed'}
              </span>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">History Timeline</h3>
            <p className="text-sm text-gray-500">Chronological record of all metric updates</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {history.map((entry, index) => (
              <div key={entry.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceBadge(entry.source)}`}>
                        {getSourceText(entry.source)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status === 'on-track' ? 'On Track' : 
                         entry.status === 'achieved' ? 'Achieved' : 'Failed'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Actual Value</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-gray-900">
                            {entry.actualValue.toLocaleString()} {metric?.unit}
                          </p>
                          {index < history.length - 1 && getChangeIcon(entry.actualValue, history[index + 1]?.actualValue)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="text-lg font-semibold text-gray-900">{entry.progress}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Updated By</p>
                        <p className="text-sm text-gray-900">{entry.updatedBy || 'System'}</p>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}