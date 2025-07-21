/* eslint-disable @typescript-eslint/no-unused-vars */
import { Project, CreateProjectRequest, UpdateProjectRequest, PortfolioStats, PortfolioFilters } from '@/types/portfolio';

const mockProjects: Project[] = [
  {
    _id: '1',
    title: 'Rural Health Initiative 2024',
    description: 'Comprehensive healthcare delivery program for remote communities',
    sector: 'Health',
    region: 'Northern Region',
    status: 'active',
    progress: 78,
    impactScore: 87,
    householdsReached: 2450,
    activeAgents: 8,
    coverage: 450,
    budget: {
      total: 125000,
      utilized: 97500,
      percentage: 78
    },
    timeline: {
      startDate: '2024-01-15',
      endDate: '2024-12-31'
    },
    team: {
      projectLead: {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'Project Lead'
      },
      fieldCoordinator: {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        role: 'Field Coordinator'
      },
      members: []
    },
    phases: [
      {
        id: '1',
        name: 'Community Mapping',
        status: 'completed',
        progress: 100
      },
      {
        id: '2',
        name: 'Service Delivery',
        status: 'in_progress',
        progress: 78
      },
      {
        id: '3',
        name: 'Impact Assessment',
        status: 'pending',
        progress: 0
      }
    ],
    tags: ['Rural Health 2024', 'Priority', 'WHO Partnership', 'Maternal Care', 'Vaccination'],
    attachments: [],
    reportCount: 12,
    fileCount: 5,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    lastUpdated: '2 hours ago'
  },
  {
    _id: '2',
    title: 'Clean Energy Access Program',
    description: 'Solar power installation and maintenance in off-grid areas',
    sector: 'Energy',
    region: 'Eastern Region',
    status: 'active',
    progress: 65,
    impactScore: 92,
    householdsReached: 1850,
    activeAgents: 12,
    coverage: 680,
    budget: {
      total: 200000,
      utilized: 130000,
      percentage: 65
    },
    timeline: {
      startDate: '2024-02-01',
      endDate: '2024-11-30'
    },
    team: {
      projectLead: {
        id: '3',
        name: 'James Wilson',
        email: 'james.wilson@example.com',
        role: 'Project Lead'
      },
      fieldCoordinator: {
        id: '4',
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        role: 'Field Coordinator'
      },
      members: []
    },
    phases: [],
    tags: ['Clean Energy', 'SDG 7'],
    attachments: [],
    reportCount: 8,
    fileCount: 8,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-01-20T15:00:00Z',
    lastUpdated: '5 hours ago'
  },
  {
    _id: '3',
    title: 'Financial Inclusion Initiative',
    description: 'Mobile banking and financial literacy program',
    sector: 'Finance',
    region: 'Central Region',
    status: 'draft',
    progress: 15,
    impactScore: 0,
    householdsReached: 0,
    activeAgents: 0,
    coverage: 320,
    budget: {
      total: 80000,
      utilized: 12000,
      percentage: 15
    },
    timeline: {
      startDate: '2024-03-01',
      endDate: '2024-10-31'
    },
    team: {
      projectLead: {
        id: '5',
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        role: 'Project Lead'
      },
      fieldCoordinator: {
        id: '6',
        name: 'David Kim',
        email: 'david.kim@example.com',
        role: 'Field Coordinator'
      },
      members: []
    },
    phases: [],
    tags: ['FinTech', 'Mobile Banking'],
    attachments: [],
    reportCount: 3,
    fileCount: 2,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-19T09:00:00Z',
    lastUpdated: '1 day ago'
  },
  {
    _id: '4',
    title: 'Maternal Health Support',
    description: 'Prenatal and postnatal care services expansion',
    sector: 'Health',
    region: 'Western Region',
    status: 'active',
    progress: 89,
    impactScore: 94,
    householdsReached: 1920,
    activeAgents: 6,
    coverage: 380,
    budget: {
      total: 95000,
      utilized: 84550,
      percentage: 89
    },
    timeline: {
      startDate: '2024-01-01',
      endDate: '2024-09-30'
    },
    team: {
      projectLead: {
        id: '7',
        name: 'Dr. Jennifer Lee',
        email: 'jennifer.lee@example.com',
        role: 'Project Lead'
      },
      fieldCoordinator: {
        id: '8',
        name: 'Robert Taylor',
        email: 'robert.taylor@example.com',
        role: 'Field Coordinator'
      },
      members: []
    },
    phases: [],
    tags: ['Maternal Health', 'UNICEF'],
    attachments: [],
    reportCount: 15,
    fileCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T08:30:00Z',
    lastUpdated: '30 minutes ago'
  },
  {
    _id: '5',
    title: 'Agricultural Productivity Enhancement',
    description: 'Modern farming techniques and crop yield improvement',
    sector: 'Agriculture',
    region: 'Southern Region',
    status: 'completed',
    progress: 100,
    impactScore: 88,
    householdsReached: 3200,
    activeAgents: 0,
    coverage: 520,
    budget: {
      total: 150000,
      utilized: 150000,
      percentage: 100
    },
    timeline: {
      startDate: '2023-06-01',
      endDate: '2024-01-15'
    },
    team: {
      projectLead: {
        id: '9',
        name: 'Thomas Anderson',
        email: 'thomas.anderson@example.com',
        role: 'Project Lead'
      },
      fieldCoordinator: {
        id: '10',
        name: 'Lisa Wang',
        email: 'lisa.wang@example.com',
        role: 'Field Coordinator'
      },
      members: []
    },
    phases: [],
    tags: ['Agriculture', 'Food Security'],
    attachments: [],
    reportCount: 20,
    fileCount: 15,
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
    lastUpdated: '2 weeks ago'
  },
  {
    _id: '6',
    title: 'Digital Literacy Program',
    description: 'Computer skills and internet access training',
    sector: 'Education',
    region: 'Urban Areas',
    status: 'active',
    progress: 55,
    impactScore: 76,
    householdsReached: 980,
    activeAgents: 4,
    coverage: 160,
    budget: {
      total: 60000,
      utilized: 33000,
      percentage: 55
    },
    timeline: {
      startDate: '2024-02-15',
      endDate: '2024-08-15'
    },
    team: {
      projectLead: {
        id: '11',
        name: 'Rachel Green',
        email: 'rachel.green@example.com',
        role: 'Project Lead'
      },
      fieldCoordinator: {
        id: '12',
        name: 'Kevin Park',
        email: 'kevin.park@example.com',
        role: 'Field Coordinator'
      },
      members: []
    },
    phases: [],
    tags: ['Digital Skills', 'Youth'],
    attachments: [],
    reportCount: 9,
    fileCount: 6,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
    lastUpdated: '4 hours ago'
  }
];

const mockStats: PortfolioStats = {
  totalProjects: 23,
  activeProjects: 16,
  totalReach: 42, // 42K
  coverageArea: 2.5, // 2.5K km²
  avgImpactScore: 84
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const createProject = async (data: CreateProjectRequest) => {
  await delay(800);
  
  const newProject: Project = {
    _id: Date.now().toString(),
    title: data.title,
    description: data.description,
    sector: data.sector,
    region: data.region,
    status: 'draft',
    progress: 0,
    impactScore: 0,
    householdsReached: 0,
    activeAgents: 0,
    coverage: 0,
    budget: {
      total: data.totalBudget,
      utilized: 0,
      percentage: 0
    },
    timeline: {
      startDate: data.startDate,
      endDate: data.endDate
    },
    team: {
      projectLead: {
        id: 'temp-lead',
        name: data.projectLead,
        email: 'temp@example.com',
        role: 'Project Lead'
      },
      fieldCoordinator: {
        id: 'temp-coord',
        name: data.fieldCoordinator,
        email: 'temp@example.com',
        role: 'Field Coordinator'
      },
      members: []
    },
    phases: [],
    tags: data.tags,
    attachments: [],
    reportCount: 0,
    fileCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUpdated: 'Just now'
  };
  
  return newProject;
};

export const getProjects = async (filters: PortfolioFilters = {}) => {
  await delay(600);
  
  let filteredProjects = [...mockProjects];
  
  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProjects = filteredProjects.filter(project => 
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.status) {
    filteredProjects = filteredProjects.filter(project => project.status === filters.status);
  }
  
  if (filters.sector) {
    filteredProjects = filteredProjects.filter(project => project.sector === filters.sector);
  }
  
  if (filters.region) {
    filteredProjects = filteredProjects.filter(project => project.region === filters.region);
  }
  
  return {
    data: filteredProjects,
    pagination: {
      currentPage: 1,
      pageSize: filteredProjects.length,
      totalCount: filteredProjects.length,
      totalPages: 1,
    },
  };
};

export const getPortfolioStats = async () => {
  await delay(400);
  return mockStats;
};

export const getProject = async (id: string) => {
  await delay(500);
  
  const project = mockProjects.find(p => p._id === id);
  if (!project) {
    throw new Error('Project not found');
  }
  
  return project;
};

export const updateProject = async (id: string, data: UpdateProjectRequest) => {
  await delay(700);
  
  const project = mockProjects.find(p => p._id === id);
  if (!project) {
    throw new Error('Project not found');
  }
  
  return {
    ...project,
    ...data,
    updatedAt: new Date().toISOString(),
    lastUpdated: 'Just now'
  };
};

export const deleteProject = async (id: string) => {
  await delay(500);
  return { message: 'Project deleted successfully' };
};