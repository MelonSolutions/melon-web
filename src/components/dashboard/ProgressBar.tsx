import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  label: string;
  category?: string;
  value: number;
  max?: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  category,
  value,
  max = 100,
  color = 'blue',
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600',
    teal: 'bg-teal-500',
  };
  
  const bgColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  
  return (
    <div className="py-3">
      <div className="flex justify-between mb-1">
        <div className="flex items-center">
          {category && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2',
              color === 'blue' && 'bg-blue-100 text-blue-800',
              color === 'green' && 'bg-green-100 text-green-800',
              color === 'red' && 'bg-red-100 text-red-800',
              color === 'yellow' && 'bg-yellow-100 text-yellow-800',
              color === 'purple' && 'bg-purple-100 text-purple-800',
              color === 'indigo' && 'bg-indigo-100 text-indigo-800',
              color === 'teal' && 'bg-teal-100 text-teal-800',
            )}>
              {category}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {value}%
        </span>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <div
          style={{ width: `${percentage}%` }}
          className={cn(
            'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500',
            bgColor
          )}
        />
      </div>
    </div>
  );
};

export default ProgressBar;