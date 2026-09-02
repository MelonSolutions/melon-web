'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNigeriaLocations, NigeriaLocationsData } from '@/lib/api/kyc';

let memoryCache: NigeriaLocationsData | null = null;
let activeFetchPromise: Promise<NigeriaLocationsData> | null = null;

const CACHE_KEY = 'melon_nigeria_locations_v1';

export function normalizeStateName(state: string): string {
  const clean = state.toLowerCase().trim().replace(/[-_]/g, ' ');
  if (
    clean === 'fct' ||
    clean === 'abuja' ||
    clean === 'fct abuja' ||
    clean === 'federal capital territory abuja' ||
    clean === 'federal capital territory'
  ) {
    return 'federal capital territory';
  }
  return clean;
}

/**
 * Hook to consume Nigeria States, LGAs, and City mapping dynamically
 * from the backend single source of truth (cached locally for 0ms latency).
 */
export function useNigeriaLocations() {
  const [data, setData] = useState<NigeriaLocationsData>(() => {
    if (memoryCache) return memoryCache;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          memoryCache = parsed;
          return parsed;
        }
      } catch {}
    }
    return { states: [], stateLgas: {}, cityStateMap: {} };
  });

  const [loading, setLoading] = useState<boolean>(!memoryCache && data.states.length === 0);

  useEffect(() => {
    if (memoryCache && data.states.length > 0) {
      return;
    }

    if (!activeFetchPromise) {
      activeFetchPromise = getNigeriaLocations()
        .then((locations) => {
          memoryCache = locations;
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(locations));
            } catch {}
          }
          return locations;
        })
        .catch((err) => {
          console.error('Failed to load Nigeria locations from backend:', err);
          activeFetchPromise = null;
          throw err;
        });
    }

    activeFetchPromise
      .then((locations) => {
        setData(locations);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [data.states.length]);

  const validateCityState = useCallback(
    (city?: string, state?: string): string | undefined => {
      if (!city || !state || !data.cityStateMap) return undefined;

      const normalizedCity = city.toLowerCase().trim();
      const normalizedState = normalizeStateName(state);

      const expectedState = data.cityStateMap[normalizedCity];
      if (expectedState) {
        const normalizedExpected = normalizeStateName(expectedState);
        if (normalizedExpected !== normalizedState) {
          return `"${city.trim()}" is typically located in ${expectedState}, not ${state.trim()}. Please verify.`;
        }
      }

      return undefined;
    },
    [data.cityStateMap],
  );

  return {
    states: data.states,
    stateLgas: data.stateLgas,
    cityStateMap: data.cityStateMap,
    validateCityState,
    loading,
  };
}