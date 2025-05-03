import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    const id = props.id || props.name || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            "w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500",
            error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;