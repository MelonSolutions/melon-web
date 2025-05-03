import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
// import NotificationDropdown from '@/components/dashboard/NotificationDropdown';
// import { AuthProvider } from '@/context/AuthContext';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    // </AuthProvider>
  );
}