/**
 * KYC-specific visualization types and configurations
 */

/**
 * Chart types supported for KYC visualization
 */
export enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  DOUGHNUT = 'DOUGHNUT',
  AREA = 'AREA',
  SCATTER = 'SCATTER',
  HEATMAP = 'HEATMAP',
  TABLE = 'TABLE',
  MAP = 'MAP',
}

/**
 * Aggregation methods for numerical data
 */
export enum AggregationType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  UNIQUE = 'UNIQUE',
}

/**
 * Available KYC fields for visualization
 */
export enum KYCVisualizationField {
  // Status fields
  STATUS = 'status',
  LOAN_TYPE = 'loanType',
  REJECTION_REASON = 'rejectionReason',

  // Geographic fields
  STATE = 'state',
  LGA = 'lga',
  CITY = 'city',
  COUNTRY = 'country',

  // Temporal fields
  SUBMITTED_DATE = 'submittedAt',
  VERIFICATION_DATE = 'verificationDate',
  CREATED_DATE = 'createdAt',
  ASSIGNED_DATE = 'assignedAt',

  // Demographic fields
  OCCUPATION = 'occupation',

  // Metadata fields
  DEVICE = 'requestMetadata.device',
  BROWSER = 'requestMetadata.browser',
  OS = 'requestMetadata.os',
  REQUEST_CITY = 'requestMetadata.location.city',
  REQUEST_REGION = 'requestMetadata.location.region',
  REQUEST_COUNTRY = 'requestMetadata.location.country',

  // Agent fields
  ASSIGNED_AGENT = 'assignedAgent',

  // Geospatial
  LATITUDE = 'latitude',
  LONGITUDE = 'longitude',
}

/**
 * Filter operator types
 */
export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  BETWEEN = 'BETWEEN',
  CONTAINS = 'CONTAINS',
  EXISTS = 'EXISTS',
  NOT_EXISTS = 'NOT_EXISTS',
}

/**
 * Time grouping options for temporal data
 */
export enum TimeGrouping {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

/**
 * Export format options
 */
export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  PDF = 'PDF',
  JSON = 'JSON',
  PNG = 'PNG',
}

/**
 * Filter definition for query
 */
export interface VisualizationFilter {
  field: KYCVisualizationField;
  operator: FilterOperator;
  value?: any;
  values?: any[];
}

/**
 * Dimension configuration for visualization
 */
export interface VisualizationDimension {
  field: KYCVisualizationField;
  label?: string;
  timeGrouping?: TimeGrouping;
  limit?: number;
}

/**
 * Metric configuration for visualization
 */
export interface VisualizationMetric {
  aggregation: AggregationType;
  field?: KYCVisualizationField;
  label?: string;
}

/**
 * Query configuration for creating visualizations
 */
export interface CreateVisualizationQuery {
  chartType: ChartType;
  xAxis: VisualizationDimension;
  yAxis?: VisualizationDimension;
  metric: VisualizationMetric;
  groupBy?: VisualizationDimension;
  filters?: VisualizationFilter[];
  dateRange?: {
    start: string;
    end: string;
  };
  organizationId?: string;
}

/**
 * Saved visualization configuration
 */
export interface SavedVisualization {
  _id: string;
  name: string;
  description?: string;
  configuration: CreateVisualizationQuery;
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
  isPublic: boolean;
  isPinned: boolean;
  tags: string[];
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Visualization data point
 */
export interface VisualizationDataPoint {
  label: string;
  value: number;
  group?: string;
  metadata?: any;
}

/**
 * Visualization result
 */
export interface VisualizationResult {
  chartType: ChartType;
  data: VisualizationDataPoint[];
  summary: {
    totalRecords: number;
    uniqueValues?: number;
    average?: number;
    sum?: number;
    min?: number;
    max?: number;
  };
  labels: {
    xAxis: string;
    yAxis?: string;
    metric: string;
    groupBy?: string;
  };
}

/**
 * Field metadata for UI
 */
export interface FieldMetadata {
  value: KYCVisualizationField;
  label: string;
  category: 'Status' | 'Geographic' | 'Temporal' | 'Demographic' | 'Metadata' | 'Agent' | 'Geospatial';
  supportsTimeGrouping: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean';
}

/**
 * Available fields for visualization with metadata
 */
export const VISUALIZATION_FIELDS: FieldMetadata[] = [
  // Status fields
  { value: KYCVisualizationField.STATUS, label: 'Verification Status', category: 'Status', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.LOAN_TYPE, label: 'Loan Type', category: 'Status', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.REJECTION_REASON, label: 'Rejection Reason', category: 'Status', supportsTimeGrouping: false, dataType: 'string' },

  // Geographic fields
  { value: KYCVisualizationField.STATE, label: 'State', category: 'Geographic', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.LGA, label: 'Local Government Area', category: 'Geographic', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.CITY, label: 'City', category: 'Geographic', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.COUNTRY, label: 'Country', category: 'Geographic', supportsTimeGrouping: false, dataType: 'string' },

  // Temporal fields
  { value: KYCVisualizationField.SUBMITTED_DATE, label: 'Submission Date', category: 'Temporal', supportsTimeGrouping: true, dataType: 'date' },
  { value: KYCVisualizationField.VERIFICATION_DATE, label: 'Verification Date', category: 'Temporal', supportsTimeGrouping: true, dataType: 'date' },
  { value: KYCVisualizationField.CREATED_DATE, label: 'Created Date', category: 'Temporal', supportsTimeGrouping: true, dataType: 'date' },
  { value: KYCVisualizationField.ASSIGNED_DATE, label: 'Assignment Date', category: 'Temporal', supportsTimeGrouping: true, dataType: 'date' },

  // Demographic fields
  { value: KYCVisualizationField.OCCUPATION, label: 'Occupation', category: 'Demographic', supportsTimeGrouping: false, dataType: 'string' },

  // Metadata fields
  { value: KYCVisualizationField.DEVICE, label: 'Device Type', category: 'Metadata', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.BROWSER, label: 'Browser', category: 'Metadata', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.OS, label: 'Operating System', category: 'Metadata', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.REQUEST_CITY, label: 'Request City', category: 'Metadata', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.REQUEST_REGION, label: 'Request Region', category: 'Metadata', supportsTimeGrouping: false, dataType: 'string' },
  { value: KYCVisualizationField.REQUEST_COUNTRY, label: 'Request Country', category: 'Metadata', supportsTimeGrouping: false, dataType: 'string' },

  // Agent fields
  { value: KYCVisualizationField.ASSIGNED_AGENT, label: 'Assigned Agent', category: 'Agent', supportsTimeGrouping: false, dataType: 'string' },

  // Geospatial
  { value: KYCVisualizationField.LATITUDE, label: 'Latitude', category: 'Geospatial', supportsTimeGrouping: false, dataType: 'number' },
  { value: KYCVisualizationField.LONGITUDE, label: 'Longitude', category: 'Geospatial', supportsTimeGrouping: false, dataType: 'number' },
];

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: FieldMetadata['category']): FieldMetadata[] {
  return VISUALIZATION_FIELDS.filter(f => f.category === category);
}

/**
 * Get field metadata
 */
export function getFieldMetadata(field: KYCVisualizationField): FieldMetadata | undefined {
  return VISUALIZATION_FIELDS.find(f => f.value === field);
}

/**
 * Chart type metadata
 */
export const CHART_TYPE_METADATA: Record<ChartType, {
  name: string;
  description: string;
  icon: string;
  requiresYAxis: boolean;
  supportsGroupBy: boolean;
}> = {
  [ChartType.BAR]: {
    name: 'Bar Chart',
    description: 'Compare values across categories',
    icon: 'BarChart3',
    requiresYAxis: false,
    supportsGroupBy: true,
  },
  [ChartType.LINE]: {
    name: 'Line Chart',
    description: 'Show trends over time',
    icon: 'LineChart',
    requiresYAxis: false,
    supportsGroupBy: true,
  },
  [ChartType.PIE]: {
    name: 'Pie Chart',
    description: 'Show proportions of a whole',
    icon: 'PieChart',
    requiresYAxis: false,
    supportsGroupBy: false,
  },
  [ChartType.DOUGHNUT]: {
    name: 'Doughnut Chart',
    description: 'Modern variant of pie chart',
    icon: 'Donut',
    requiresYAxis: false,
    supportsGroupBy: false,
  },
  [ChartType.AREA]: {
    name: 'Area Chart',
    description: 'Show volume over time',
    icon: 'Activity',
    requiresYAxis: false,
    supportsGroupBy: true,
  },
  [ChartType.SCATTER]: {
    name: 'Scatter Plot',
    description: 'Show correlation between two variables',
    icon: 'Scatter',
    requiresYAxis: true,
    supportsGroupBy: false,
  },
  [ChartType.HEATMAP]: {
    name: 'Heatmap',
    description: 'Show intensity across two dimensions',
    icon: 'Grid',
    requiresYAxis: true,
    supportsGroupBy: false,
  },
  [ChartType.TABLE]: {
    name: 'Table',
    description: 'Display data in tabular format',
    icon: 'Table',
    requiresYAxis: false,
    supportsGroupBy: true,
  },
  [ChartType.MAP]: {
    name: 'Geographic Map',
    description: 'Visualize data on a map',
    icon: 'Map',
    requiresYAxis: false,
    supportsGroupBy: false,
  },
};
