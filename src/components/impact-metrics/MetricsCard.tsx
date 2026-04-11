/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { 
  ImpactMetric, 
  getTrackingStatusColor, 
  getTrackingStatusDisplayName,
  formatMetricValue,
  calculateProgress 
} from '@/types/impact-metrics';
import { MoreHorizontal, Calendar, TrendingUp, Target, User, ChevronRight } from 'lucide-react';
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
    <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border dark:border-white/10 overflow-hidden shadow-sm group hover:border-primary/30 transition-all duration-500 font-sans flex flex-col h-full">
      <div className="p-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/impact-metrics/${metric._id}`}
              className="text-lg font-black text-gray-900 dark:text-gray-100 hover:text-primary transition-colors flex items-center gap-2 group/title tracking-tight uppercase"
            >
              {metric.name}
              <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-primary" />
            </Link>
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 leading-relaxed tracking-wide uppercase opacity-70">
              {metric.description}
            </p>
          </div>
          <button className="ml-4 p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/10">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Status and Type */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getTrackingStatusColor(metric.trackingStatus)}`}>
            {getTrackingStatusDisplayName(metric.trackingStatus)}
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-surface-secondary/50 dark:bg-white/5 text-gray-500 border border-border dark:border-white/10">
            Weight: {metric.scoringWeight}%
          </span>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Progress</span>
            <span className={`text-[11px] font-black uppercase tracking-tighter ${isOverTarget ? 'text-emerald-500' : 'text-primary'}`}>{progress}%</span>
          </div>
          <div className="w-full bg-surface-secondary/50 dark:bg-white/5 rounded-full h-3 border border-border dark:border-white/10 shadow-inner overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${
                isOverTarget ? 'bg-emerald-500 shadow-emerald-500/20' :
                progress >= 75 ? 'bg-primary shadow-primary/20' :
                progress >= 50 ? 'bg-amber-500' : 'bg-error'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {isOverTarget && (
            <div className="flex items-center gap-1.5 mt-3 animate-pulse">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Target Exceeded</span>
            </div>
          )}
        </div>

        {/* Metric Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-surface-secondary/20 dark:bg-white/5 border border-border/50 dark:border-white/10">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5">Current Value</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              {formatMetricValue(metric.actualValue, metric.metricType)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mb-1.5">Target Value</p>
            <p className="text-xl font-black text-primary tracking-tight">
              {formatMetricValue(metric.target, metric.metricType)}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 mb-8 flex-1">
          <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Period: {formatDate(metric.startDate)} — {formatDate(metric.endDate)}</span>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            <Target className="w-4 h-4 text-primary" />
            <span>Goal: {formatMetricValue(metric.target, metric.metricType)}</span>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between pt-6 border-t border-border/40 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-surface-secondary dark:bg-white/5 flex items-center justify-center border border-border dark:border-white/10">
                <User className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                Owner: {metric.createdBy?.firstName}
            </span>
          </div>
          <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em]">
            ID: {metric._id.substring(0, 8)}
          </span>
        </div>
      </div>
    </div>
  );
}
