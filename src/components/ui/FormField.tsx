'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  description?: string;
  children: ReactNode;
}

export function FormField({ 
  label, 
  error, 
  required, 
  helperText,
  description,
  children 
}: FormFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {!error && description && (
        <p className="text-xs text-gray-600 mb-2">{description}</p>
      )}
      
      {children}
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {!error && !description && helperText && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
