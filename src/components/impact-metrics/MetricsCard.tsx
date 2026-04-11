'use client';

import { 
  ImpactMetric, 
  getTrackingStatusColor, 
  getTrackingStatusDisplayName,
  formatMetricValue,
  calculateProgress 
} from '@/types/impact-metrics';
import { MoreHorizontal, Calendar, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

interface MetricCardProps {
  metric: ImpactMetric;
  onRefetch: () => void;
}

export function MetricCard({ metric }: MetricCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const progress = calculateProgress(metric.actualValue, metric.target);
  const isOverTarget = metric.actualValue > metric.target;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/impact-metrics/${metric._id}`}
              className="text-lg font-medium text-gray-900 hover:text-[#5B94E5] transition-colors line-clamp-1"
            >
              {metric.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {metric.description}
            </p>
          </div>
          <button className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Status and Type */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrackingStatusColor(metric.trackingStatus)}`}>
            {getTrackingStatusDisplayName(metric.trackingStatus)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Weight: {metric.scoringWeight}%
          </span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isOverTarget ? 'bg-green-500' :
                progress >= 75 ? 'bg-[#5B94E5]' :
                progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {isOverTarget && (
            <p className="text-xs text-green-600 mt-1">Exceeded target!</p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-medium text-gray-500">Current Value</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatMetricValue(metric.actualValue, metric.metricType)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Target</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatMetricValue(metric.target, metric.metricType)}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(metric.startDate)} - {formatDate(metric.endDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>Target: {formatMetricValue(metric.target, metric.metricType)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Progress: {progress}% complete</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Updated {formatDate(metric.updatedAt)}
          </div>
          <div className="text-xs text-gray-500">
            {metric.createdBy?.firstName} {metric.createdBy?.lastName}
          </div>
        </div>
      </div>
    </div>
  );
}