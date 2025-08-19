/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Handle URL parameters for messages
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
      // Navigation handled by useAuth hook
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error cases
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
    <div className="space-y-8">
      {/* Logo */}
      <div className="text-center">
        <Image
          src="/images/melon-logo.svg"
          alt="Melon"
          width={120}
          height={32}
          className="mx-auto mb-8"
          priority
        />
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#1c2331] mb-3">
          Welcome Back
        </h1>
        <p className="text-gray-600 font-normal">
          Sign in to access your impact measurement dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-600 text-sm">{message}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1c2331] mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent transition-all ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1c2331] mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent transition-all ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#5B94E5] hover:bg-[#4A7ABF] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Sign up link */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Don&rsquo;t have an account?{' '}
          <button 
            onClick={() => router.push('/signup')}
            className="text-[#5B94E5] hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}