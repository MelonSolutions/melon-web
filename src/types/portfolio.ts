/* eslint-disable @typescript-eslint/no-empty-object-type */
// Enums matching backend
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type ProjectSector = 'HEALTH' | 'EDUCATION' | 'ENERGY' | 'AGRICULTURE' | 'FINANCE' | 'ENVIRONMENT' | 'TECHNOLOGY' | 'INFRASTRUCTURE' | 'SOCIAL_SERVICES' | 'ECONOMIC_DEVELOPMENT';
export type ProjectRegion = 'NORTHERN_REGION' | 'SOUTHERN_REGION' | 'EASTERN_REGION' | 'WESTERN_REGION' | 'CENTRAL_REGION' | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST';
export type FundingSource = 'GOVERNMENT' | 'PRIVATE_FOUNDATION' | 'INTERNATIONAL_DONOR' | 'CORPORATE_SPONSOR' | 'CROWDFUNDING' | 'BANK_LOAN' | 'VENTURE_CAPITAL' | 'GRANT' | 'INTERNAL_FUNDING' | 'MIXED_FUNDING';

// Backend response types
export interface TeamMember {
  name: string;
  role: string;
  responsibilities?: string;
  email?: string;
  phone?: string;
}

export interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  description?: string;
  uploadedAt: Date;
}

export interface ProjectTag {
  name: string;
  color?: string;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  sector: ProjectSector;
  region: ProjectRegion;
  status: ProjectStatus;
  priority: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  spentBudget: number;
  targetHouseholds?: number;
  actualHouseholds?: number;
  coverageArea?: number;
  fundingSource?: FundingSource;
  teamMembers: TeamMember[];
  tags: ProjectTag[];
  attachments: FileAttachment[];
  progressPercentage: number;
  impactScore: number;
  location?: string;
  objectives: string[];
  expectedOutcomes: string[];
  risks: string[];
  notes?: string;
  isActive: boolean;
  organization: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API request types
export interface CreateProjectRequest {
  title: string;
  description?: string;
  sector: ProjectSector;
  region: ProjectRegion;
  status?: ProjectStatus;
  priority?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  spentBudget?: number;
  targetHouseholds?: number;
  actualHouseholds?: number;
  coverageArea?: number;
  fundingSource?: FundingSource;
  teamMembers?: TeamMember[];
  tags?: ProjectTag[];
  progressPercentage?: number;
  impactScore?: number;
  location?: string;
  objectives?: string[];
  expectedOutcomes?: string[];
  risks?: string[];
  notes?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface PortfolioFilters {
  search?: string;
  status?: string;
  sector?: string;
  region?: string;
  pageSize?: number;
  currentPage?: number;
}

export interface PortfolioStats {
  totalProjects: number;
  activeProjects: number;
  totalReach: string;
  coverageArea: string;
  avgImpactScore: string;
  budgetUtilization?: string;
  avgProgress?: number;
  draftProjects?: number;
  completedProjects?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    nextPage?: number;
    hasPreviousPage: boolean;
    previousPage?: number;
  };
}

// Display helper types
export interface ProjectCardData {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  sector: ProjectSector;
  region: ProjectRegion;
  progressPercentage: number;
  impactScore: number;
  actualHouseholds: number;
  teamMembers: TeamMember[];
  tags: ProjectTag[];
  createdAt: string;
  updatedAt: string;
}

// Utility functions for display
export const getStatusDisplayName = (status: ProjectStatus): string => {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'ACTIVE': return 'Active';
    case 'COMPLETED': return 'Completed';
    case 'ON_HOLD': return 'On Hold';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

export const getSectorDisplayName = (sector: ProjectSector): string => {
  switch (sector) {
    case 'HEALTH': return 'Health';
    case 'EDUCATION': return 'Education';
    case 'ENERGY': return 'Energy';
    case 'AGRICULTURE': return 'Agriculture';
    case 'FINANCE': return 'Finance';
    case 'ENVIRONMENT': return 'Environment';
    case 'TECHNOLOGY': return 'Technology';
    case 'INFRASTRUCTURE': return 'Infrastructure';
    case 'SOCIAL_SERVICES': return 'Social Services';
    case 'ECONOMIC_DEVELOPMENT': return 'Economic Development';
    default: return sector;
  }
};

export const getRegionDisplayName = (region: ProjectRegion): string => {
  switch (region) {
    case 'NORTHERN_REGION': return 'Northern Region';
    case 'SOUTHERN_REGION': return 'Southern Region';
    case 'EASTERN_REGION': return 'Eastern Region';
    case 'WESTERN_REGION': return 'Western Region';
    case 'CENTRAL_REGION': return 'Central Region';
    case 'NORTH_EAST': return 'North East';
    case 'NORTH_WEST': return 'North West';
    case 'SOUTH_EAST': return 'South East';
    case 'SOUTH_WEST': return 'South West';
    default: return region;
  }
};

export const getStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'COMPLETED': return 'bg-blue-100 text-blue-800';
    case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
    case 'ON_HOLD': return 'bg-gray-100 text-gray-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};