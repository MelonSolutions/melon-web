/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = 'https://melon-core.onrender.com';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<LoginResponse['user']> {
    return this.request<LoginResponse['user']>('/auth/me');
  }

  // Reports endpoints
  async createReport(data: any) {
    return this.request('/reports/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReport(id: string) {
    return this.request(`/reports/details/${id}`);
  }

  async updateReport(id: string, data: any) {
    return this.request(`/reports/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReport(id: string) {
    return this.request(`/reports/delete/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);