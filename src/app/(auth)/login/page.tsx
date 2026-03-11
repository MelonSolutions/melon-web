/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useModal } from '@/components/ui/Modal';
import DemoRequestModal from '@/components/auth/DemoRequestModal';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signin } = useAuthContext();
  const { openModal } = useModal();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlMessage = searchParams.get('message');
    const verified = searchParams.get('verified');

    if (verified === 'true') {
      setMessage('Email verified successfully! You can now sign in.');
    } else if (urlMessage === 'check-email') {
      setMessage('Please check your email and verify your account before signing in.');
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await signin(formData.email, formData.password);
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.message?.includes('verify your email')) {
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
      } else if (err.message?.includes('not active')) {
        setError('Your account is not active. Please contact support.');
      } else if (err.message?.includes('expired')) {
        setError('Your trial has expired. Please contact your organization owner to upgrade.');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-600">
          Sign in to access your dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-600 text-sm">{message}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${error ? 'border-red-300' : 'border-gray-300'
                }`}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${error ? 'border-red-300' : 'border-gray-300'
                }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => openModal(<DemoRequestModal />, { size: 'sm' })}
            className="text-primary hover:underline font-medium"
          >
            Request a Demo
          </button>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-600">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="h-3 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-14 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
