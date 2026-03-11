/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, AuthError, SigninResponse, User, OrganizationDetails } from '@/lib/api/auth';

export interface AuthState {
  user: User | null;
  organization: OrganizationDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  signin: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    username?: string;
    phoneNumber?: string;
    organizationName?: string;
  }) => Promise<{ message: string; userId: string; organizationId: string }>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
  getInitials: () => string;
  getFullName: () => string;
  canInviteUsers: () => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  getTrialDaysLeft: () => number | null;
  login: (email: string, password: string) => Promise<void>; // Added for backwards compatibility
}

export function useAuth(): AuthState & AuthActions {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const fetchAuthData = async (): Promise<{ userData: User; orgData: OrganizationDetails }> => {
      const [userData, orgData] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getOrganization()
      ]);
      return { userData, orgData };
    };

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          try {
            // Get fresh user data
            const { userData, orgData } = await fetchAuthData();
            
            localStorage.setItem('userData', JSON.stringify(userData));
            
            setState({
              user: userData,
              organization: orgData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: any) {
            // Only logout if the server explicitly says the token is invalid (401)
            if (error instanceof AuthError && error.status === 401) {
              console.error('Token invalid (401), logging out.');
              logout();
              return;
            }

            // For timeouts or network errors, retry once
            console.warn('Auth check failed (non-401), retrying...', error?.message);
            try {
              const { userData, orgData } = await fetchAuthData();
              localStorage.setItem('userData', JSON.stringify(userData));
              setState({
                user: userData,
                organization: orgData,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (retryError: any) {
              // If retry also fails, check if it's a 401
              if (retryError instanceof AuthError && retryError.status === 401) {
                console.error('Token invalid on retry (401), logging out.');
                logout();
                return;
              }

              // Still not a 401 — fall back to cached data so user stays logged in
              console.warn('Retry failed, falling back to cached user data.');
              const cachedUserData = localStorage.getItem('userData');
              if (cachedUserData) {
                try {
                  const parsedUser = JSON.parse(cachedUserData) as User;
                  setState({
                    user: parsedUser,
                    organization: null,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                } catch {
                  // Corrupted cache — no choice but to logout
                  logout();
                }
              } else {
                // No cached data and can't reach server — logout
                logout();
              }
            }
          }
        } else {
          setState({
            user: null,
            organization: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    };

    checkAuth();
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      const response: SigninResponse = await apiClient.signin({ email, password });
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      setState({
        user: response.user as User,
        organization: null, 
        isAuthenticated: true,
        isLoading: false,
      });

      try {
        const orgData = await apiClient.getOrganization();
        setState(prev => ({
          ...prev,
          organization: orgData,
        }));
      } catch (orgError) {
        console.error('Failed to fetch organization data:', orgError);
      }

      router.push('/overview');
    } catch (error) {
      console.error('Signin failed:', error);
      throw error;
    }
  };

  const signup = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    username?: string;
    phoneNumber?: string;
    organizationName?: string;
  }) => {
    try {
      const response = await apiClient.signup(data);
      // Don't auto-login, user needs to verify email first
      return response;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await apiClient.verifyEmail(token);
      // After verification, redirect to login
      router.push('/login?verified=true');
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setState({
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      localStorage.setItem('userData', JSON.stringify(userData));
      setState(prev => ({
        ...prev,
        user: userData,
      }));
    } catch (error) {
      console.error('User refresh failed:', error);
      throw error;
    }
  };

  const refreshOrganization = async () => {
    try {
      const orgData = await apiClient.getOrganization();
      setState(prev => ({
        ...prev,
        organization: orgData,
      }));
    } catch (error) {
      console.error('Organization refresh failed:', error);
      throw error;
    }
  };

  // Helper functions
  const getInitials = (): string => {
    if (!state.user) return 'U';
    const { firstName, lastName } = state.user;
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getFullName = (): string => {
    if (!state.user) return 'User';
    const { firstName, lastName } = state.user;
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  const canInviteUsers = (): boolean => {
    if (!state.user || !state.organization) return false;
    return (state.user.role === 'OWNER' || state.user.role === 'ADMIN') && 
           state.organization.usage.canAddUsers;
  };

  const isOwner = (): boolean => {
    return state.user?.role === 'OWNER';
  };

  const isAdmin = (): boolean => {
    return state.user?.role === 'ADMIN' || state.user?.role === 'OWNER';
  };

  const getTrialDaysLeft = (): number | null => {
    if (!state.organization?.trialEndsAt) return null;
    
    const trialEnd = new Date(state.organization.trialEndsAt);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysLeft);
  };

  return {
    ...state,
    signin,
    signup,
    verifyEmail,
    logout,
    refreshUser,
    refreshOrganization,
    getInitials,
    getFullName,
    canInviteUsers,
    isOwner,
    isAdmin,
    getTrialDaysLeft,
    // Legacy methods for backwards compatibility
    login: signin,
  };
}