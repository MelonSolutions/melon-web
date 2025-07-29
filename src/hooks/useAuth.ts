/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, LoginResponse } from '@/lib/api/auth';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getInitials: () => string;
  getFullName: () => string;
}

export function useAuth(): AuthState & AuthActions {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          try {
            const freshUserData = await apiClient.getCurrentUser();
            localStorage.setItem('userData', JSON.stringify(freshUserData));
            setState({
              user: freshUserData,
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

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await apiClient.login({ email, password });
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push('/overview');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const freshUserData = await apiClient.getCurrentUser();
      localStorage.setItem('userData', JSON.stringify(freshUserData));
      setState(prev => ({
        ...prev,
        user: freshUserData,
      }));
    } catch (error) {
      console.error('User refresh failed:', error);
      throw error;
    }
  };

  // Helper function to get user initials
  const getInitials = (): string => {
    if (!state.user) return 'U';
    const { firstName, lastName } = state.user;
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Helper function to get full name
  const getFullName = (): string => {
    if (!state.user) return 'User';
    const { firstName, lastName } = state.user;
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  return {
    ...state,
    login,
    logout,
    refreshUser,
    getInitials,
    getFullName,
  };
}