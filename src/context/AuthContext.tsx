"use client";

import React, { createContext, useContext } from 'react';
import { useAuth, AuthActions, AuthState } from '@/hooks/useAuth';
import { useTrialAuth, TrialAuthState, TrialAuthActions } from '@/hooks/useTrialAuth';

type ExtendedAuthContext = AuthState & AuthActions & TrialAuthState & TrialAuthActions & {
  isTrial: boolean;
  isOrg: boolean;
  logout: () => void; // Unified logout
};

const AuthContext = createContext<ExtendedAuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const orgAuth = useAuth();
  const trialAuth = useTrialAuth();

  // Prioritize org user over trial user
  const isTrial = !!trialAuth.trialUser && !orgAuth.user;
  const isOrg = !!orgAuth.user;

  // Unified logout function
  const unifiedLogout = () => {
    if (isOrg) {
      orgAuth.logout();
    } else if (isTrial) {
      trialAuth.logout();
    }
  };

  const value: ExtendedAuthContext = {
    // Org auth state
    ...orgAuth,
    // Trial auth state
    trialUser: trialAuth.trialUser,
    // Trial actions (but override logout)
    refreshTrialUser: trialAuth.refreshTrialUser,
    // Unified state
    isTrial,
    isOrg,
    isLoading: orgAuth.isLoading || trialAuth.isLoading,
    // Override logout with unified version
    logout: unifiedLogout,
    // Override getters for trial users
    getInitials: () => {
      if (isTrial && trialAuth.trialUser) {
        return (trialAuth.trialUser.email.charAt(0) || 'T').toUpperCase();
      }
      return orgAuth.getInitials();
    },
    getFullName: () => {
      if (isTrial && trialAuth.trialUser) {
        return trialAuth.trialUser.email.split('@')[0];
      }
      return orgAuth.getFullName();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}