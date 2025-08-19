/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, SigninResponse, User, OrganizationDetails } from '@/lib/api/auth';

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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          try {
            // Get fresh user data
            const [userData, orgData] = await Promise.all([
              apiClient.getCurrentUser(),
              apiClient.getOrganization()
            ]);
            
            localStorage.setItem('userData', JSON.stringify(userData));
            
            setState({
              user: userData,
              organization: orgData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // If token is invalid, logout
            console.error('Token refresh failed:', error);
            logout();
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
      
      // Get full organization data
      const orgData = await apiClient.getOrganization();
      
      setState({
        user: response.user as User,
        organization: orgData,
        isAuthenticated: true,
        isLoading: false,
      });

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