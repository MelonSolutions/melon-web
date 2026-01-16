import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, disabled, ...props }, ref) => {
    const id = props.id || props.name || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              id={id}
              type="checkbox"
              disabled={disabled}
              className={cn(
                'w-4 h-4 rounded border-gray-300 text-primary transition-colors',
                'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                error && 'border-error',
                className
              )}
              ref={ref}
              {...props}
            />
          </div>

          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={id}
                  className={cn(
                    'block text-sm font-medium text-gray-900 cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 ml-7 text-sm text-error flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
