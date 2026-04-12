/**
 * CSV Import types for frontend
 */

export interface CSVColumnMetadata {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  nullable: boolean;
  unique: boolean;
  sampleValues: any[];
  nullCount: number;
  uniqueCount: number;
}

export interface CSVDataSource {
  _id: string;
  name: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  columns: CSVColumnMetadata[];
  rowCount: number;
  preview: Record<string, any>[];
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  organization: string;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  // Map view specific fields
  latitudeColumn?: string;
  longitudeColumn?: string;
  labelColumn?: string;
  categoryColumn?: string;
  isMapDataSource: boolean;
}

export interface UploadCSVRequest {
  file: File;
  name: string;
  description?: string;
  isMapDataSource?: boolean;
  latitudeColumn?: string;
  longitudeColumn?: string;
  labelColumn?: string;
  categoryColumn?: string;
}

export interface UpdateCSVDataSourceRequest {
  name?: string;
  description?: string;
  latitudeColumn?: string;
  longitudeColumn?: string;
  labelColumn?: string;
  categoryColumn?: string;
}

export interface CSVFormatExample {
  requiredColumns: string[];
  optionalColumns: string[];
  example: string;
  notes: string[];
}

export interface CSVFormatRequirements {
  mapView: CSVFormatExample;
  visualization: CSVFormatExample;
}

export interface CSVQueryResult {
  rows: Record<string, any>[];
  total: number;
}

export interface MapDataPoint {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  sector: string;
  status: string;
  data: Record<string, any>;
}
