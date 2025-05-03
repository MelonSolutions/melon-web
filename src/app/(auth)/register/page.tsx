"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (data: { 
    name: string;
    email: string; 
    password: string;
    organization: string;
  }) => {
    console.log('Register data:', data);
    
    localStorage.setItem('isAuthenticated', 'true');
    router.push('/overview');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create an Account</h1>
      <RegisterForm onSubmit={handleRegister} />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}