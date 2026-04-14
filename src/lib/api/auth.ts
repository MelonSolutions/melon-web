/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username?: string;
  phoneNumber?: string;
  organizationName?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
  organizationId: string;
}

export interface SigninResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    organization: {
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
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  status: string;
  emailVerified: boolean;
  organization: {
    id: string;
    name: string;
    plan: string;
    status: string;
    userCount: number;
    userLimit: number;
    trialEndsAt?: string;
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

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      
      throw new AuthError(errorData.message || `HTTP error! status: ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout - please try again');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }

    if (error.message === 'Failed to fetch') {
      console.error(`Network Error: Failed to fetch ${url}. Online: ${navigator.onLine}`);
      const networkError = new Error('Connection failed. Please check your internet and try again.');
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    console.error(`API request failed [${url}]:`, error);
    throw error;
  }
}

  // Auth endpoints
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signin(data: SigninRequest): Promise<SigninResponse> {
    return this.request<SigninResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
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

  // Legacy method for backwards compatibility  
  async register(data: SignupRequest): Promise<SignupResponse> {
    return this.signup(data);
  }

  async requestDemo(data: { email: string; organizationName: string; message?: string }): Promise<{ message: string }> {
    return this.request('/auth/request-demo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);