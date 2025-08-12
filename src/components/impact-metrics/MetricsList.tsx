'use client';

import { MoreHorizontal, Link2, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Metric {
  id: string;
  label: string;
  unit: string;
  sector: string;
  actualValue: number;
  targetValue: number;
  status: 'achieved' | 'on-track' | 'failed';
  progress: number;
  weight: number;
  lastUpdated: string;
  isAutoUpdated: boolean;
  linkedToReport: boolean;
}

interface MetricsListProps {
  metrics: Metric[];
  onRefetch: () => void;
}

export function MetricsList({ metrics, onRefetch }: MetricsListProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <div className="w-3 h-3 bg-green-600 rounded-full"></div>;
      case 'on-track':
        return <div className="w-3 h-3 bg-[#5B94E5] rounded-full"></div>;
      case 'failed':
        return <div className="w-3 h-3 bg-red-600 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-600 rounded-full"></div>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'Achieved';
      case 'on-track':
        return 'On Track';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-600';
      case 'on-track':
        return 'bg-[#5B94E5]';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const MenuDropdown = ({ metricId }: { metricId: string }) => (
    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20" ref={menuRef}>
      <Link
        href={`/impact-metrics/${metricId}`}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setShowMenu(null)}
      >
        <Eye className="w-4 h-4" />
        View Details
      </Link>
      <Link
        href={`/impact-metrics/${metricId}/edit`}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setShowMenu(null)}
      >
        <Edit className="w-4 h-4" />
        Edit Metric
      </Link>
      <Link
        href={`/impact-metrics/${metricId}/history`}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setShowMenu(null)}
      >
        <BarChart3 className="w-4 h-4" />
        View History
      </Link>
      <div className="border-t border-gray-100 my-1"></div>
      <button
        onClick={() => {
          setShowMenu(null);
          if (confirm('Are you sure you want to delete this metric?')) {
            console.log('Delete metric:', metricId);
            onRefetch();
          }
        }}
        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                {getStatusIcon(metric.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-medium text-gray-900">{metric.label}</h3>
                  {metric.linkedToReport && (
                    <Link2 className="w-4 h-4 text-[#5B94E5]" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{metric.sector}</span>
                  <span>Weight: {metric.weight}%</span>
                  <span>{metric.lastUpdated}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                {getStatusText(metric.status)}
              </span>
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(showMenu === metric.id ? null : metric.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu === metric.id && <MenuDropdown metricId={metric.id} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {metric.actualValue.toLocaleString()} {metric.unit}
              </p>
              <p className="text-sm text-gray-500">
                Target: {metric.targetValue.toLocaleString()} {metric.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{metric.progress}% of target</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metric.status)}`}
                style={{ width: `${Math.min(metric.progress, 100)}%` }}
              />
            </div>
          </div>

          {metric.isAutoUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link2 className="w-4 h-4" />
              <span>Auto-updated from report responses</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}