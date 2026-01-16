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
    <Card padding="md" className={cn('', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-error'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-sm text-gray-500">from last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-2.5 bg-gray-50 rounded-lg text-gray-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

StatCard.displayName = 'StatCard';