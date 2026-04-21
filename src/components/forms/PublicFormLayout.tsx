'use client';

import React from 'react';

interface PublicFormLayoutProps {
  children: React.ReactNode;
}

/**
 * Minimal layout wrapper for public-facing form pages.
 * Provides a centered, responsive container with Melon branding.
 */
export const PublicFormLayout: React.FC<PublicFormLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#5B94E5] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800 tracking-tight">
            Melon Survey
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto py-8 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 pb-8">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <span className="font-medium text-gray-500">
              Melon Impact Platform
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};
