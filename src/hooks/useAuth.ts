/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    organization: string;
  }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
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
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      
      if (isAuth) {
        // Mock user data
        setState({
          user: {
            id: '1',
            name: 'Jane Doe',
            email: 'jane@example.com',
            organization: 'Melon Demo',
            role: 'Program Manager',
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    
    localStorage.setItem('isAuthenticated', 'true');
    setState({
      user: {
        id: '1',
        name: 'Jane Doe',
        email,
        organization: 'Melon Demo',
        role: 'Program Manager',
      },
      isAuthenticated: true,
      isLoading: false,
    });
    
    router.push('/overview');
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    organization: string;
  }) => {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    
    localStorage.setItem('isAuthenticated', 'true');
    setState({
      user: {
        id: '1',
        name: userData.name,
        email: userData.email,
        organization: userData.organization,
        role: 'Program Manager',
      },
      isAuthenticated: true,
      isLoading: false,
    });
    
    router.push('/overview');
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    router.push('/login');
  };

  const forgotPassword = async (email: string) => {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`Password reset requested for ${email}`);
    
    return Promise.resolve();
  };

  return {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
  };
}