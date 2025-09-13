/* eslint-disable @typescript-eslint/no-empty-object-type */
export type MetricType = 'NUMBER' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';
export type TrackingStatus = 'ON_TRACK' | 'ACHIEVED' | 'FAIL' | 'PAUSED';

export interface ImpactMetric {
  _id: string;
  name: string;
  description?: string;
  target: number;
  metricType: MetricType;
  startDate: string;
  endDate: string;
  scoringWeight: number;
  trackingStatus: TrackingStatus;
  actualValue: number;
  progressPercentage: number;
  organization: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    id: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    id: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API request types
export interface CreateImpactMetricRequest {
  name: string;
  description?: string;
  target: number;
  metricType: MetricType;
  startDate: string;
  endDate: string;
  scoringWeight: number;
  trackingStatus?: TrackingStatus;
  actualValue?: number;
}

export interface UpdateImpactMetricRequest extends Partial<CreateImpactMetricRequest> {}

export interface ImpactMetricsFilters {
  search?: string;
  status?: string;
  metricType?: string;
  startDate?: string;
  endDate?: string;
  pageSize?: number;
  currentPage?: number;
}

export interface ImpactMetricsStats {
  totalMetrics: number;
  activeMetrics: number;
  achieved: number;
  failed: number;
  avgPerformance: number;
  onTrackPercentage: string;
  achievedPercentage: string;
  failedPercentage: string;
}

export interface PaginatedMetricsResponse {
  data: ImpactMetric[];
  pagination: {
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage?: number;
    previousPage?: number;
  };
}

// Display helper functions
export const getTrackingStatusDisplayName = (status: TrackingStatus): string => {
  switch (status) {
    case 'ON_TRACK': return 'On Track';
    case 'ACHIEVED': return 'Achieved';
    case 'FAIL': return 'Failed';
    case 'PAUSED': return 'Paused';
    default: return status;
  }
};

export const getMetricTypeDisplayName = (type: MetricType): string => {
  switch (type) {
    case 'NUMBER': return 'Number';
    case 'PERCENTAGE': return 'Percentage';
    case 'CURRENCY': return 'Currency';
    case 'BOOLEAN': return 'Yes/No';
    default: return type;
  }
};

export const getTrackingStatusColor = (status: TrackingStatus): string => {
  switch (status) {
    case 'ON_TRACK': return 'bg-blue-100 text-blue-800';
    case 'ACHIEVED': return 'bg-green-100 text-green-800';
    case 'FAIL': return 'bg-red-100 text-red-800';
    case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const formatMetricValue = (value: number, type: MetricType): string => {
  switch (type) {
    case 'NUMBER':
      return value.toLocaleString();
    case 'PERCENTAGE':
      return `${value}%`;
    case 'CURRENCY':
      return `$${value.toLocaleString()}`;
    case 'BOOLEAN':
      return value > 0 ? 'Yes' : 'No';
    default:
      return value.toString();
  }
};

// Helper function to calculate progress percentage
export const calculateProgress = (actual: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((actual / target) * 100), 100);
};

// Helper function to determine status based on progress
export const getStatusFromProgress = (progress: number): TrackingStatus => {
  if (progress >= 100) return 'ACHIEVED';
  if (progress >= 75) return 'ON_TRACK';
  if (progress >= 25) return 'ON_TRACK';
  return 'FAIL';
};