/* eslint-disable @typescript-eslint/no-explicit-any */
import { authFetch } from '@/lib/auth/session';
import { userMessage } from './user-message';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melon.ng';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    organizationId: string;
    organizationName: string;
    organization?: {
      id: string;
      name: string;
      plan: 'TRIAL' | 'STARTER' | 'REGULAR' | 'PREMIUM';
      status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
    };
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  status: string;
  emailVerified: boolean;
  organizationId: string;
  organizationName: string;
  organization?: {
    id: string;
    name: string;
    plan: string;
    status: string;
    userCount: number;
    userLimit: number;
    trialEndsAt?: string;
  };
  title?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  preferences?: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    theme: string;
  };
  notifications?: {
    emailReports: boolean;
    metricAlerts: boolean;
    deadlineReminders: boolean;
    weeklyDigest: boolean;
    projectUpdates: boolean;
    systemMaintenance: boolean;
  };
  privacy?: {
    profileVisibility: string;
    dataSharing: boolean;
    analyticsOptOut: boolean;
    twoFactorAuth: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: string;
  userCount: number;
  userLimit: number;
  trialEndsAt?: string;
  paymentStatus?: string;
  isWhiteLabel?: boolean;
  brandColor?: string;
  brandName?: string;
  logoUrl?: string;
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    lastLoginAt?: string;
  }>;
  planConfig: {
    name: string;
    userLimit: number;
    price: number;
    features: string[];
  };
  usage: {
    currentUsers: number;
    userLimit: number;
    canAddUsers: boolean;
  };
}

export interface InviteUserRequest {
  email: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface InvitationDetails {
  email: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${this.baseURL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  const config: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    // authFetch attaches the session token and renews it on 401
    const response = await authFetch(url, config);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      throw new AuthError(userMessage(response.status, errorData), response.status);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      const timeoutError = new Error('This is taking longer than usual. Please try again.');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }

    if (error.name === 'NetworkError') {
      console.error(`Network Error: Failed to fetch ${url}. Online: ${navigator.onLine}`);
    }
    
    console.error(`API request failed [${url}]:`, error);
    throw error;
  }
}

  // Auth endpoints (accounts are created by Melon onboarding or invitation)
  async signin(data: SigninRequest): Promise<SigninResponse> {
    return this.request<SigninResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
      // Lets the browser store the httpOnly refresh cookie from the response
      credentials: 'include',
    });
  }

  async getInvitation(token: string): Promise<InvitationDetails> {
    return this.request<InvitationDetails>(`/auth/invitations/${encodeURIComponent(token)}`);
  }

  async acceptInvitation(data: AcceptInvitationRequest): Promise<SigninResponse> {
    return this.request<SigninResponse>('/auth/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(data),
      // Lets the browser store the httpOnly refresh cookie from the response
      credentials: 'include',
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async updateProfile(data: any): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async getOrganization(): Promise<OrganizationDetails> {
    return this.request<OrganizationDetails>('/auth/organization');
  }

  async inviteUser(data: InviteUserRequest): Promise<{ message: string; invitedUserId: string }> {
    return this.request('/auth/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async upgradePlan(plan: 'STARTER' | 'REGULAR' | 'PREMIUM'): Promise<{ message: string }> {
    return this.request(`/auth/organization/upgrade/${plan}`, {
      method: 'PATCH',
    });
  }

  async removeUser(userId: string): Promise<{ message: string }> {
    return this.request(`/auth/organization/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getOrganizations(): Promise<any[]> {
    return this.request<any[]>('/auth/organizations');
  }

  // Legacy method for backwards compatibility
  async login(data: SigninRequest): Promise<SigninResponse> {
    return this.signin(data);
  }

  async updateBranding(data: { brandColor?: string; brandName?: string; logoUrl?: string }): Promise<any> {
    return this.request('/auth/organization/branding', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async requestDemo(data: { email: string; organizationName: string; message?: string }): Promise<{ message: string }> {
    return this.request('/auth/request-demo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);