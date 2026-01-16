import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const id = props.id || props.name || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const currentLength = value ? String(value).length : 0;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-medium text-gray-900"
            >
              {label}
              {props.required && <span className="text-error ml-1">*</span>}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className="text-xs text-gray-500">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          id={id}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-3 py-2.5 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200 resize-y',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            error
              ? 'border-error focus:ring-error'
              : 'border-gray-200 hover:border-gray-300',
            className
          )}
          ref={ref}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-sm text-error flex items-center gap-1">
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

        {!error && helperText && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
