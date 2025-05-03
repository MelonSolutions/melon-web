import React, { useState } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

interface RegisterFormProps {
  onSubmit: (data: { 
    name: string;
    email: string; 
    password: string;
    organization: string;
  }) => void;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      await onSubmit({ name, email, password, organization });
    } catch (err) {
      setError('Registration failed. Please try again.');
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
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        required
      />
      
      <div className="mt-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@organization.com"
          required
        />
      </div>
      
      <div className="mt-4">
        <Input
          label="Organization"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Your Organization"
          required
        />
      </div>
      
      <div className="mt-4">
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Must be at least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6" 
        isLoading={isLoading}
      >
        Create Account
      </Button>
    </form>
  );
}