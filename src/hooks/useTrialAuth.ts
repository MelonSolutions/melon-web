/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface TrialUser {
  email: string;
  status: 'TRIAL' | 'UPGRADED' | 'EXPIRED' | 'SUSPENDED';
  daysRemaining: number;
  responsesUsed: number;
  responsesRemaining: number;
  surveysCreated: number;
}

export interface TrialAuthState {
  trialUser: TrialUser | null;
  isLoading: boolean;
}

export interface TrialAuthActions {
  logout: () => void;
  refreshTrialUser: () => Promise<void>;
}

export function useTrialAuth(): TrialAuthState & TrialAuthActions {
  const router = useRouter();
  const [state, setState] = useState<TrialAuthState>({
    trialUser: null,
    isLoading: true,
  });

  // Check if trial user is authenticated on mount
  useEffect(() => {
    const checkTrialAuth = async () => {
      try {
        const token = localStorage.getItem('trialToken');

        if (!token) {
          setState({
            trialUser: null,
            isLoading: false,
          });
          return;
        }

        try {
          // Fetch trial status
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/trials/status`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              // Invalid token
              localStorage.removeItem('trialToken');
              setState({
                trialUser: null,
                isLoading: false,
              });
              return;
            }
            throw new Error('Failed to fetch trial status');
          }

          const data = await response.json();

          // Check trial status
          if (data.status !== 'UPGRADED') {
            // Only UPGRADED trial users can access melon-web
            if (data.status === 'TRIAL') {
              // Free trial needs to add payment method
              router.push('/auth/trial-upgrade?reason=payment_required');
            } else if (data.status === 'EXPIRED') {
              router.push('/auth/trial-expired');
            } else if (data.status === 'SUSPENDED') {
              router.push('/auth/trial-suspended');
            }
            setState({
              trialUser: null,
              isLoading: false,
            });
            return;
          }

          // Set trial user
          setState({
            trialUser: {
              email: data.email,
              status: data.status,
              daysRemaining: data.daysRemaining,
              responsesUsed: data.responsesUsed,
              responsesRemaining: data.responsesRemaining,
              surveysCreated: data.surveysCreated,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error('Trial auth check failed:', error);
          // Clear invalid token
          localStorage.removeItem('trialToken');
          setState({
            trialUser: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Trial auth initialization failed:', error);
        setState({
          trialUser: null,
          isLoading: false,
        });
      }
    };

    checkTrialAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('trialToken');
    setState({
      trialUser: null,
      isLoading: false,
    });
    router.push('/auth/trial-login');
  };

  const refreshTrialUser = async () => {
    try {
      const token = localStorage.getItem('trialToken');
      if (!token) {
        throw new Error('No trial token');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/trials/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh trial user');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        trialUser: {
          email: data.email,
          status: data.status,
          daysRemaining: data.daysRemaining,
          responsesUsed: data.responsesUsed,
          responsesRemaining: data.responsesRemaining,
          surveysCreated: data.surveysCreated,
        },
      }));
    } catch (error) {
      console.error('Trial user refresh failed:', error);
      throw error;
    }
  };

  return {
    ...state,
    logout,
    refreshTrialUser,
  };
}
