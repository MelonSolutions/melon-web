// "use client";

// import React, { createContext, useContext } from 'react';
// import { useAuth, AuthState, AuthActions } from '@/hooks/useAuth';

// const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const auth = useAuth();
  
//   return (
//     <AuthContext.Provider value={auth}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuthContext() {
//   const context = useContext(AuthContext);
  
//   if (!context) {
//     throw new Error('useAuthContext must be used within an AuthProvider');
//   }
  
//   return context;
// }