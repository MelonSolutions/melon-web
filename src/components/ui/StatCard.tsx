import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <Card
      padding="none"
      className={cn(
        'p-3 sm:p-3.5 rounded-xl border border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-sm transition-all flex flex-col justify-between min-h-[104px]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <span
          className="text-xs font-medium text-gray-600 leading-snug break-words"
          title={label}
        >
          {label}
        </span>
        {icon && (
          <div className="p-1 rounded-md bg-gray-50 text-gray-500 shrink-0 [&>svg]:w-4 [&>svg]:h-4 mt-0.5">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2 mt-auto pt-1">
        <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          </div>
        )}
      </div>
      {description && (
        <p className="text-[11px] text-gray-400 mt-1 leading-tight" title={description}>
          {description}
        </p>
      )}
    </Card>
  );
};

StatCard.displayName = 'StatCard';