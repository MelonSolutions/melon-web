export type ProjectStatus = 'active' | 'completed' | 'draft' | 'paused';

export type ProjectSector = 
  | 'Health'
  | 'Education' 
  | 'Agriculture'
  | 'Energy'
  | 'Finance'
  | 'Infrastructure'
  | 'Environment';

export type ProjectRegion = 
  | 'Northern Region'
  | 'Eastern Region'
  | 'Central Region'
  | 'Western Region'
  | 'Southern Region'
  | 'Urban Areas';

export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
  startDate?: string;
  endDate?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  sector: ProjectSector;
  region: ProjectRegion;
  status: ProjectStatus;
  progress: number;
  impactScore: number;
  householdsReached: number;
  activeAgents: number;
  coverage: number; // in km²
  budget: {
    total: number;
    utilized: number;
    percentage: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
  };
  team: {
    projectLead: TeamMember;
    fieldCoordinator: TeamMember;
    members: TeamMember[];
  };
  phases: ProjectPhase[];
  tags: string[];
  attachments: ProjectAttachment[];
  reportCount: number;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  sector: ProjectSector;
  region: ProjectRegion;
  totalBudget: number;
  targetHouseholds: number;
  fundingSource: string;
  startDate: string;
  endDate: string;
  projectLead: string;
  fieldCoordinator: string;
  tags: string[];
  attachments?: File[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  sector?: ProjectSector;
  region?: ProjectRegion;
  status?: ProjectStatus;
  budget?: {
    total: number;
    utilized: number;
  };
  timeline?: {
    startDate: string;
    endDate: string;
  };
  team?: {
    projectLead: string;
    fieldCoordinator: string;
  };
  tags?: string[];
}

export interface PortfolioStats {
  totalProjects: number;
  activeProjects: number;
  totalReach: number; // in thousands
  coverageArea: number; // in thousands km²
  avgImpactScore: number;
}

export interface PortfolioFilters {
  search?: string;
  status?: ProjectStatus | '';
  sector?: ProjectSector | '';
  region?: ProjectRegion | '';
  pageSize?: number;
  currentPage?: number;
}