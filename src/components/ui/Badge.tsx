import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'neutral',
      size = 'md',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center gap-1.5 font-medium rounded-md whitespace-nowrap';

    const variants = {
      success: 'bg-success-light text-[#047857] border border-[#A7F3D0]',
      warning: 'bg-warning-light text-[#92400E] border border-[#FCD34D]',
      error: 'bg-error-light text-[#991B1B] border border-[#FCA5A5]',
      info: 'bg-info-light text-[#1E40AF] border border-[#93C5FD]',
      neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
      primary: 'bg-primary-light text-[#1E40AF] border border-[#93C5FD]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    const dotColors = {
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
      info: 'bg-info',
      neutral: 'bg-gray-500',
      primary: 'bg-primary',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {dot && (
          <span
            className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
