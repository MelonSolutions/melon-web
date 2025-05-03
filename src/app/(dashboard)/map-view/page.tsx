"use client";

import React from 'react';

export default function MapViewPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Map View
      </h2>
      <p className="text-gray-600">
        This is the map view page. Here you&rsquo;ll be able to visualize the geographic distribution of your programs and their impact.
      </p>
      <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-gray-500">
          Map visualization tools will be implemented soon
        </p>
      </div>
    </div>
  );
}