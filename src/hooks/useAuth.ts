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
  isMelonAdmin: () => boolean;
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
            console.error('Auth refresh failed:', error);

            // Handle 401 explicitly
            if (error?.status === 401 || (error instanceof AuthError && error.status === 401)) {
              console.error('Session expired (401), logging out.');
              logout();
              return;
            }

            // For non-401 errors (network, 500, etc.), try to use cached data
            const cachedUserData = localStorage.getItem('userData');
            if (cachedUserData) {
              try {
                const parsedUser = JSON.parse(cachedUserData) as User;
                setState({
                  user: parsedUser,
                  organization: null,
                  isAuthenticated: true, // Optimistically keep them in
                  isLoading: false,
                });
                console.warn('Using cached user data due to server error (non-401).');
              } catch {
                logout();
              }
            } else {
              logout();
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

  const isMelonAdmin = (): boolean => {
    const melonOrgId = process.env.NEXT_PUBLIC_MELON_ORG_ID;
    if (!melonOrgId || !state.user) return false;
    
    // Check both top-level and nested organization IDs for robustness
    const userOrgId = state.user.organizationId || state.user.organization?.id;
    return userOrgId === melonOrgId;
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
    isMelonAdmin,
    getTrialDaysLeft,
    // Legacy methods for backwards compatibility
    login: signin,
  };
}