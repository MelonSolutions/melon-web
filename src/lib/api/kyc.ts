import { 
  KYCUser, 
  CreateKYCUserRequest, 
  UpdateKYCUserRequest,
  KYCDashboardStats,
  AuditLog,
} from '@/types/kyc';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://melon-core.onrender.com';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.code;
    } catch {
      errorMessage = response.statusText;
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

export async function getKYCUsers(filters?: {
  search?: string;
  status?: string;
  identityType?: string;
}): Promise<KYCUser[]> {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.identityType) params.append('identityType', filters.identityType);

  const url = `${API_BASE_URL}/kyc/all${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchWithAuth(url);
  return response.data || response;
}

export async function getKYCUser(id: string): Promise<KYCUser> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/details/${id}`);
}

export async function getKYCDashboardStats(): Promise<KYCDashboardStats> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/stats`);
}

export async function createKYCUser(data: CreateKYCUserRequest): Promise<KYCUser> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateKYCUser(
  id: string, 
  data: UpdateKYCUserRequest
): Promise<KYCUser> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function makeVerificationDecision(
  id: string,
  approved: boolean,
  rejectionReason?: string
): Promise<{ message: string }> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/${id}/verify-decision`, {
    method: 'PATCH',
    body: JSON.stringify({
      approved: approved.toString(),
      rejectionReason,
    }),
  });
}

export async function deleteKYCUser(id: string): Promise<void> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/delete/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadDocument(
  userId: string,
  file: File,
  documentType: string
): Promise<KYCUser> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const response = await fetch(`${API_BASE_URL}/kyc/${userId}/documents`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to upload document';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export async function deleteDocument(
  userId: string,
  documentId: string
): Promise<KYCUser> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/${userId}/documents/${documentId}`, {
    method: 'DELETE',
  });
}

export async function getAuditLogs(userId: string): Promise<AuditLog[]> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/${userId}/audit-logs`);
}

export async function assignFieldAgent(
  userId: string,
  agentId: string
): Promise<KYCUser> {
  return fetchWithAuth(`${API_BASE_URL}/kyc/${userId}/assign-agent`, {
    method: 'POST',
    body: JSON.stringify({ agentId }),
  });
}

export async function exportKYCData(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const response = await fetch(
    `${API_BASE_URL}/kyc/export${params.toString() ? `?${params.toString()}` : ''}`,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to export data', response.status);
  }

  return response.blob();
}

export async function downloadKYCReport(userId: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const response = await fetch(`${API_BASE_URL}/kyc/${userId}/report`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to download report', response.status);
  }

  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `KYC-Report-${userId}.pdf`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  // Download the PDF
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
