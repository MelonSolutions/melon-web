"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset password for:', email);
    setIsSubmitted(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      
      {!isSubmitted ? (
        <>
          <p className="text-gray-600 mb-6">
            Enter your email address and we&rsquo;ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              required
            />
            <Button type="submit" className="w-full mt-4">
              Send Reset Link
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-4 text-green-600 font-medium">
            Check your email
          </div>
          <p className="text-gray-600 mb-6">
            We&rsquo;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
            Try another email
          </Button>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Remember your password? <Link href="/login" className="text-blue-600 hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}