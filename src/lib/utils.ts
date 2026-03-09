import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('Failed to fetch');
  }
  return false;
}

export function isDuplicateError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('already exists') ||
           error.message.toLowerCase().includes('duplicate');
  }
  return false;
}

export function getUserId(user: any): string {
  if (!user) return '';
  // Try id first, then _id
  const idValue = user.id || user._id;
  if (!idValue) return '';
  
  if (typeof idValue === 'string') return idValue;
  
  // Handle cases where it might be a Mongoose-like object with its own _id or id
  if (typeof idValue === 'object') {
    return idValue._id?.toString() || idValue.id?.toString() || idValue.toString() || '';
  }
  
  return String(idValue);
}