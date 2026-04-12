/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'report' | 'api' | 'kyc';
  fileName?: string;
  reportId?: string;
  columns: DataColumn[];
  rowCount: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  preview?: Record<string, any>[];
}

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  nullable: boolean;
  unique: boolean;
  sample?: any[];
}

export interface ChartConfig {
  id: string;
  name: string;
  type: ChartType;
  dataSourceId: string;
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  aggregation: AggregationType;
  filters: ChartFilter[];
  styling: ChartStyling;
  createdAt: string;
  updatedAt: string;
}

export interface ChartFilter {
  column: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

export interface ChartStyling {
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
}

export type ChartType = 
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter';

export type AggregationType = 
  | 'count'
  | 'sum'
  | 'average'
  | 'min'
  | 'max';

export interface VisualizationStats {
  totalDataSources: number;
  totalRecords: number;
  activeCharts: number;
  sharedCharts: number;
}

export interface ReportIntegration {
  reportId: string;
  reportTitle: string;
  responseCount: number;
  lastResponse: string;
  availableFields: string[];
}

export const CHART_TYPES: Record<ChartType, { 
  name: string; 
  description: string;
  requiredAxes: ('x' | 'y' | 'groupBy')[];
}> = {
  bar: {
    name: 'Bar Chart',
    description: 'Compare values across categories',
    requiredAxes: ['x', 'y']
  },
  line: {
    name: 'Line Chart', 
    description: 'Show trends over time',
    requiredAxes: ['x', 'y']
  },
  pie: {
    name: 'Pie Chart',
    description: 'Show parts of a whole',
    requiredAxes: ['groupBy']
  },
  doughnut: {
    name: 'Doughnut Chart',
    description: 'Modern pie chart variant',
    requiredAxes: ['groupBy'] 
  },
  area: {
    name: 'Area Chart',
    description: 'Show volume over time',
    requiredAxes: ['x', 'y']
  },
  scatter: {
    name: 'Scatter Plot',
    description: 'Show correlation between variables',
    requiredAxes: ['x', 'y']
  }
};

export const AGGREGATION_TYPES: Record<AggregationType, {
  name: string;
  description: string;
}> = {
  count: {
    name: 'Count',
    description: 'Number of records'
  },
  sum: {
    name: 'Sum',
    description: 'Total of all values'
  },
  average: {
    name: 'Average',
    description: 'Mean of all values'
  },
  min: {
    name: 'Minimum',
    description: 'Smallest value'
  },
  max: {
    name: 'Maximum', 
    description: 'Largest value'
  }
};