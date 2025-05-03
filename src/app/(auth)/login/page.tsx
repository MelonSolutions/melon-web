"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: { email: string; password: string }) => {
    console.log('Login data:', data);
  
    localStorage.setItem('isAuthenticated', 'true');
    router.push('/overview');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <LoginForm onSubmit={handleLogin} />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          New here? <Link href="/register" className="text-blue-600 hover:underline">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}