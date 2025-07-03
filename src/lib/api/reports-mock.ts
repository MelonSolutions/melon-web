/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api/reports-mock.ts
// Mock API functions for development without backend

export interface CreateReportData {
  title: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published' | 'closed';
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  questions?: any[];
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published' | 'closed';
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  questions?: any[];
}

export interface ReportsFilters {
  search?: string;
  status?: string;
  category?: string;
  pageSize?: number;
  currentPage?: number;
}

// Mock data
const mockReports = [
  {
    _id: '1',
    title: 'Program Impact Assessment',
    description: 'Quarterly assessment form for measuring program effectiveness',
    category: 'Impact Assessment',
    status: 'published' as const,
    responseCount: 45,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastResponseAt: '2024-01-15T09:45:00Z',
  },
  {
    _id: '2',
    title: 'Beneficiary Feedback Survey',
    description: 'Collecting feedback from program beneficiaries',
    category: 'Feedback',
    status: 'draft' as const,
    responseCount: 0,
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-12T14:20:00Z',
  },
  {
    _id: '3',
    title: 'Health Program Monitoring',
    description: 'Monthly monitoring form for health initiatives',
    category: 'Health',
    status: 'published' as const,
    responseCount: 128,
    createdAt: '2024-01-08T11:15:00Z',
    updatedAt: '2024-01-14T16:22:00Z',
    lastResponseAt: '2024-01-14T15:30:00Z',
  },
  {
    _id: '4',
    title: 'Education Outcome Tracker',
    description: 'Tracking educational outcomes and progress',
    category: 'Education',
    status: 'published' as const,
    responseCount: 89,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-13T12:45:00Z',
    lastResponseAt: '2024-01-13T11:20:00Z',
  },
  {
    _id: '5',
    title: 'Community Engagement Survey',
    description: 'Measuring community engagement levels',
    category: 'Community',
    status: 'closed' as const,
    responseCount: 203,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-10T18:30:00Z',
    lastResponseAt: '2024-01-09T14:15:00Z',
  },
];

const mockStats = {
  totalReports: 12,
  activeReports: 8,
  totalResponses: 474,
  avgResponseRate: '73%',
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const createReport = async (data: CreateReportData) => {
  await delay(800);
  
  const newReport = {
    _id: Date.now().toString(),
    ...data,
    category: data.category || 'Impact Assessment',
    status: data.status || 'draft',
    responseCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return newReport;
};

export const getReports = async (filters: ReportsFilters = {}) => {
  await delay(600);
  
  let filteredReports = [...mockReports];
  
  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredReports = filteredReports.filter(report => 
      report.title.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.status) {
    filteredReports = filteredReports.filter(report => report.status === filters.status);
  }
  
  if (filters.category) {
    filteredReports = filteredReports.filter(report => report.category === filters.category);
  }
  
  return {
    data: filteredReports,
    pagination: {
      currentPage: 1,
      pageSize: filteredReports.length,
      totalCount: filteredReports.length,
      totalPages: 1,
    },
  };
};

export const getDashboardStats = async () => {
  await delay(400);
  return mockStats;
};

export const getReport = async (id: string) => {
  await delay(500);
  
  const report = mockReports.find(r => r._id === id);
  if (!report) {
    throw new Error('Report not found');
  }
  
  return {
    ...report,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'What is the primary sector of your program?',
        description: '',
        required: false,
        options: ['Health', 'Education', 'Agriculture'],
      },
      {
        id: '2',
        type: 'short_answer',
        title: 'How many beneficiaries has your program reached?',
        description: '',
        required: false,
      },
    ],
  };
};

export const updateReport = async (id: string, data: UpdateReportData) => {
  await delay(700);
  
  const report = mockReports.find(r => r._id === id);
  if (!report) {
    throw new Error('Report not found');
  }
  
  return {
    ...report,
    ...data,
    updatedAt: new Date().toISOString(),
  };
};

export const deleteReport = async (id: string) => {
  await delay(500);
  return { message: 'Report deleted successfully' };
};

export const publishReport = async (id: string) => {
  await delay(600);
  
  const report = mockReports.find(r => r._id === id);
  if (!report) {
    throw new Error('Report not found');
  }
  
  return {
    ...report,
    status: 'published' as const,
    updatedAt: new Date().toISOString(),
  };
};

export const duplicateReport = async (id: string) => {
  await delay(800);
  
  const report = mockReports.find(r => r._id === id);
  if (!report) {
    throw new Error('Report not found');
  }
  
  return {
    ...report,
    _id: Date.now().toString(),
    title: `${report.title} (Copy)`,
    status: 'draft' as const,
    responseCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const getShareLink = async (id: string) => {
  await delay(300);
  
  return {
    shareToken: `mock-token-${id}`,
    shareUrl: `http://localhost:3002/reports/public/mock-token-${id}`,
  };
};

export const getPublicReport = async (shareToken: string) => {
  await delay(500);
  
  // Extract ID from token for mock purposes
  const id = shareToken.replace('mock-token-', '');
  return getReport(id);
};