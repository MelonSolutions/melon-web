/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, AuthError, SigninResponse, User, OrganizationDetails, AcceptInvitationRequest } from '@/lib/api/auth';
import { endSession, initSession, onSessionExpired, startSession } from '@/lib/auth/session';

export interface AuthState {
  user: User | null;
  organization: OrganizationDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  signin: (email: string, password: string) => Promise<void>;
  acceptInvitation: (data: AcceptInvitationRequest) => Promise<void>;
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

  // Dynamic theming: inject CSS variables if white-labeling is enabled
  useEffect(() => {
    if (state.organization?.isWhiteLabel && state.organization?.brandColor) {
      const color = state.organization.brandColor;
      const hoverColor = darkenHex(color, 15);
      const lightColor = `${color}1A`; // Add 10% opacity for light background

      document.documentElement.style.setProperty('--color-primary', color);
      document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
      document.documentElement.style.setProperty('--color-primary-light', lightColor);
    } else {
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-primary-hover');
      document.documentElement.style.removeProperty('--color-primary-light');
    }
  }, [state.organization]);

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
        // Restore the session from the httpOnly refresh cookie
        const session = await initSession();

        if (session === 'unauthenticated') {
          localStorage.removeItem('userData');
          setState({
            user: null,
            organization: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Optimistically hydrate cached user data so user is not blocked on a blank loading screen
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
          try {
            const parsedUser = JSON.parse(cachedUserData) as User;
            setState(prev => ({
              ...prev,
              user: parsedUser,
              isAuthenticated: true,
              isLoading: false,
            }));
          } catch {
            // Ignore parse error and proceed to network fetch
          }
        }

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
        } catch (error: unknown) {
          console.error('Auth refresh failed:', error);

          // Handle 401 explicitly
          const status = (error as { status?: number } | null)?.status;
          if (status === 401 || (error instanceof AuthError && error.status === 401)) {
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
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    };

    checkAuth();

    // A 401 that a refresh can't fix means the session is over
    return onSessionExpired(() => logout());
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      const response: SigninResponse = await apiClient.signin({ email, password });
      
      startSession(response.token);
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

  // Accepting an invitation activates the account and signs the person in
  const acceptInvitation = async (data: AcceptInvitationRequest) => {
    const response: SigninResponse = await apiClient.acceptInvitation(data);
    startSession(response.token);
    localStorage.setItem('userData', JSON.stringify(response.user));
    setState({
      user: response.user as User,
      organization: null,
      isAuthenticated: true,
      isLoading: false,
    });
    try {
      const orgData = await apiClient.getOrganization();
      setState((prev) => ({ ...prev, organization: orgData }));
    } catch (orgError) {
      console.error('Failed to fetch organization data:', orgError);
    }
    router.push('/overview');
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
    // Revokes the refresh cookie server-side; UI doesn't wait for it
    void endSession();
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
    acceptInvitation,
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

/**
 * Darken a hex color by a specified percentage.
 */
function darkenHex(hex: string, percent: number): string {
  let cleanHex = hex.replace(/^\s*#|\s*$/g, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.replace(/(.)/g, '$1$1');
  }
  let r = parseInt(cleanHex.substr(0, 2), 16),
      g = parseInt(cleanHex.substr(2, 2), 16),
      b = parseInt(cleanHex.substr(4, 2), 16);

  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent / 100))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent / 100))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent / 100))));

  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}