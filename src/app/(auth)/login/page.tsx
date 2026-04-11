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

      if (err.name === 'NetworkError') {
        setError('Connection failed. Please check your internet connection or try again later.');
      } else if (err.message?.includes('verify your email')) {
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_12px_rgba(91,148,229,0.5)]"></div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">
            Welcome Back
          </h1>
        </div>
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-5">
          Sign in to access your dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex items-center gap-3 animate-in shake duration-500">
            <div className="w-1 h-6 bg-error rounded-full"></div>
            <p className="text-error text-[11px] font-black uppercase tracking-wider">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 animate-in zoom-in duration-300">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <p className="text-primary text-[11px] font-black uppercase tracking-wider">{message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="group">
            <label htmlFor="email" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">
              Email <span className="text-primary opacity-50">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="system@melon.ng"
                className={`w-full pl-12 pr-4 py-4 text-xs font-bold border rounded-2xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm ${error ? 'border-error/50' : 'border-border'
                  }`}
                required
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">
              Password <span className="text-primary opacity-50">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full pl-12 pr-12 py-4 text-xs font-bold border rounded-2xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm ${error ? 'border-error/50' : 'border-border'
                  }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Login</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors"></div>
            </div>
          )}
        </button>
      </form>

      <div className="text-center pt-4">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => openModal(<DemoRequestModal />, { size: 'sm' })}
            className="text-primary hover:text-primary/80 font-black"
          >
            Request Demo
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="h-3 w-10 bg-surface-secondary rounded animate-pulse"></div>
          <div className="h-10 w-full bg-surface-secondary rounded-lg animate-pulse"></div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-14 bg-surface-secondary rounded animate-pulse"></div>
          <div className="h-10 w-full bg-surface-secondary rounded-lg animate-pulse"></div>
        </div>
        <div className="h-10 w-full bg-surface-secondary rounded-lg animate-pulse"></div>
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
