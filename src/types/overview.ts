export interface DashboardMetric {
  value: string;
  description: string;
}

export interface DashboardStats {
  totalPrograms: DashboardMetric;
  activeProjects: DashboardMetric;
  beneficiaries: DashboardMetric;
  verifiedUsers: DashboardMetric;
}

export interface ProgramProgress {
  label: string;
  value: number;
  sector: string;
  status: 'on-track' | 'needs-attention' | 'critical';
}

export interface RegionalDistribution {
  region: string;
  projects: number;
  beneficiaries: string;
  coverage: number;
}

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}
