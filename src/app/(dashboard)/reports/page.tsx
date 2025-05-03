"use client";

import React from 'react';

export default function ReportsPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Reports
      </h2>
      <p className="text-gray-600">
        This is the reports page. Here you&rsquo;ll be able to generate and view reports about program performance, impact metrics, and more.
      </p>
      <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">
          Report content will be implemented soon
        </p>
      </div>
    </div>
  );
}