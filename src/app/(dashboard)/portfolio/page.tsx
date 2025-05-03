"use client";

import React from 'react';

export default function PortfolioPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Portfolio
      </h2>
      <p className="text-gray-600">
        This is the portfolio page. Here you&rsquo;ll be able to manage your program and project portfolio across different sectors and regions.
      </p>
      <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-gray-500">
          Portfolio management tools will be implemented soon
        </p>
      </div>
    </div>
  );
}