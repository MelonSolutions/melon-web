/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      await onSubmit({ email, password });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@organization.com"
        required
      />
      
      <div className="mt-4">
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <div className="flex justify-end mt-1">
          <Link 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
          Remember me
        </label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6" 
        isLoading={isLoading}
      >
        Sign In
      </Button>
    </form>
  );
}