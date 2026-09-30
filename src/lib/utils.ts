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

export function formatPhotoTag(tag?: string): string {
  if (!tag) return '';

  const KNOWN_TAGS: Record<string, string> = {
    'C________INSIDE_H_____P_______': 'Customer Inside House Premises',
    'C___________FRONT____H_____G__': 'Customer in Front of House Gate',
    'HOUSE_NUMBER_______________': 'House Number',
    'RIGHT_V_______H____': 'Right View of House',
    'LEFT_V_______H____': 'Left View of House',
    'OPPOSITE_V___': 'Opposite View',
    'STREET_SIGN_______________': 'Street Sign',
    'LANDMARK': 'Landmark',
    'OTHER_V____________I_____': 'Other Verification Images',
    'C________INSIDE_T_____S____B__': 'Inside Shop / Business',
    'C___________FRONT____T_____S__': 'In Front of Shop',
    'RIGHT_V_______B_______': 'Right View of Business',
    'LEFT_V_______B_______': 'Left View of Business',
    'ADDITIONAL_VIEW': 'Additional View',
    'AGENT_SELFIE': 'Agent Selfie',
    'BUSINESS_FRONT': 'Business Front',
    'FRONT_GATE': 'Front Gate',
    'FRONT_VIEW': 'Front View',
    'INSIDE_PREMISES': 'Inside Premises',
    'LEFT_SIDE': 'Left Side',
    'LEFT_VIEW': 'Left View',
    'OPPOSITE_STREET': 'Opposite Street',
    'OPPOSITE_VIEW': 'Opposite View',
    'RIGHT_SIDE': 'Right Side',
    'RIGHT_VIEW': 'Right View',
    'STOREFRONT': 'Storefront',
    'STREET_LOCATION': 'Street Location',
    'STREET_SIGN': 'Street Sign',
    'SURROUNDINGS': 'Surroundings',
    'VERIFICATION_IMAGES': 'Verification Images',
    'VERIFICATION_PHOTO': 'Verification Photo',
  };

  if (KNOWN_TAGS[tag]) {
    return KNOWN_TAGS[tag];
  }

  // Fallback: strip leading underscores, replace multiple underscores with single space
  return tag
    .replace(/^_+/, '')
    .replace(/_+/g, ' ')
    .trim();
}