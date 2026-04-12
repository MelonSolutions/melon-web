'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import Select from '@/components/ui/Select';

import {
  Upload,
  FileSpreadsheet,
  Info,
  Download,
  X,
} from 'lucide-react';
import { uploadCSV, getCSVFormatRequirements } from '@/lib/api/csv-import';
import type { CSVFormatRequirements, CSVDataSource } from '@/types/csv-import';
import { useToast } from '@/components/ui/Toast';

interface CSVUploaderProps {
  isMapDataSource?: boolean;
  onSuccess?: (dataSource: CSVDataSource) => void;
  onCancel?: () => void;
}

export function CSVUploader({ isMapDataSource = false, onSuccess, onCancel }: CSVUploaderProps) {
  const { addToast } = useToast();
  
  const toast = {
    error: (msg: string) => addToast({ type: 'error', title: 'Error', message: msg }),
    success: (msg: string) => addToast({ type: 'success', title: 'Success', message: msg })
  };

  const [activeTab, setActiveTab] = useState<'requirements' | 'example' | 'notes'>('requirements');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitudeColumn, setLatitudeColumn] = useState('');
  const [longitudeColumn, setLongitudeColumn] = useState('');
  const [labelColumn, setLabelColumn] = useState('');
  const [categoryColumn, setCategoryColumn] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formatRequirements, setFormatRequirements] = useState<CSVFormatRequirements | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFormatRequirements();
  }, []);

  const loadFormatRequirements = async () => {
    try {
      const requirements = await getCSVFormatRequirements();
      setFormatRequirements(requirements);
    } catch (error) {
      console.error('Failed to load format requirements:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);

    if (!name) {
      setName(selectedFile.name.replace('.csv', ''));
    }

    // Preview CSV
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const rows = lines.slice(0, 6).map(line => {
        // Simple CSV parsing (doesn't handle quoted commas)
        return line.split(',').map(cell => cell.trim());
      });

      setCsvPreview(rows);

      if (rows.length > 0) {
        const columns = rows[0];
        setDetectedColumns(columns);

        // Auto-detect common column names
        if (isMapDataSource) {
          const latCol = columns.find(c => /^(lat|latitude)$/i.test(c));
          const lngCol = columns.find(c => /^(lng|lon|long|longitude)$/i.test(c));
          const lblCol = columns.find(c => /^(label|name|title)$/i.test(c));
          const catCol = columns.find(c => /^(category|type|sector)$/i.test(c));

          if (latCol) setLatitudeColumn(latCol);
          if (lngCol) setLongitudeColumn(lngCol);
          if (lblCol) setLabelColumn(lblCol);
          if (catCol) setCategoryColumn(catCol);
        }
      }
    } catch (error) {
      console.error('Failed to preview CSV:', error);
      toast.error('Failed to preview CSV file');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setCsvPreview([]);
    setDetectedColumns([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      toast.error('Please provide a file and name');
      return;
    }

    if (isMapDataSource && (!latitudeColumn || !longitudeColumn)) {
      toast.error('Please specify latitude and longitude columns for map data');
      return;
    }

    try {
      setUploading(true);

      const dataSource = await uploadCSV({
        file,
        name: name.trim(),
        description: description.trim() || undefined,
        isMapDataSource,
        latitudeColumn: latitudeColumn || undefined,
        longitudeColumn: longitudeColumn || undefined,
        labelColumn: labelColumn || undefined,
        categoryColumn: categoryColumn || undefined,
      });

      toast.success('CSV uploaded successfully! Processing data...');

      if (onSuccess) {
        onSuccess(dataSource);
      }

      // Reset form
      setFile(null);
      setName('');
      setDescription('');
      setLatitudeColumn('');
      setLongitudeColumn('');
      setLabelColumn('');
      setCategoryColumn('');
      setCsvPreview([]);
      setDetectedColumns([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload CSV');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = isMapDataSource
      ? formatRequirements?.mapView.example
      : formatRequirements?.visualization.example;

    if (!template) return;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isMapDataSource ? 'map-data-template.csv' : 'visualization-data-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatExample = isMapDataSource
    ? formatRequirements?.mapView
    : formatRequirements?.visualization;

  return (
    <div className="space-y-6">
      {/* Format Guide */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-3 flex-1">
            <div>
              <h3 className="font-semibold text-blue-900">
                CSV Format Requirements{isMapDataSource ? ' for Map View' : ' for Visualizations'}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {isMapDataSource
                  ? 'Upload location data to display on the map'
                  : 'Upload any data you want to visualize with charts'}
              </p>
            </div>

            {formatExample && (
              <div className="w-full mt-4">
                <div className="flex space-x-1 border-b border-blue-200 mb-4">
                  <button
                    onClick={() => setActiveTab('requirements')}
                    className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === 'requirements'
                        ? 'border-blue-600 text-blue-800'
                        : 'border-transparent text-blue-600 hover:text-blue-800 hover:border-blue-300'
                    }`}
                  >
                    Requirements
                  </button>
                  <button
                    onClick={() => setActiveTab('example')}
                    className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === 'example'
                        ? 'border-blue-600 text-blue-800'
                        : 'border-transparent text-blue-600 hover:text-blue-800 hover:border-blue-300'
                    }`}
                  >
                    Example
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === 'notes'
                        ? 'border-blue-600 text-blue-800'
                        : 'border-transparent text-blue-600 hover:text-blue-800 hover:border-blue-300'
                    }`}
                  >
                    Notes
                  </button>
                </div>

                {activeTab === 'requirements' && (
                  <div className="space-y-4">
                    {formatExample.requiredColumns.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-blue-900 mb-2">
                          Required Columns:
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {formatExample.requiredColumns.map((col) => (
                            <Badge key={col} variant="error" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {formatExample.optionalColumns.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-blue-900 mb-2 mt-4">
                          Optional Columns:
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {formatExample.optionalColumns.map((col) => (
                            <Badge key={col} variant="neutral" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'example' && (
                  <div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <pre className="text-sm font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap">
                        {formatExample.example}
                      </pre>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={downloadTemplate}
                      className="mt-3"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <ul className="space-y-2 text-sm text-blue-800 bg-white/50 p-4 rounded-lg border border-blue-100">
                    {formatExample.notes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
             <label>Select CSV File *</label>
            <div className="mt-2">
              {!file ? (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CSV files only (Max 10MB, 50,000 rows)
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {csvPreview.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Preview (first 5 rows):</div>
                      <div className="border border-gray-200 rounded-lg overflow-x-auto relative">
                        <table className="w-full text-sm text-left text-gray-600">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                              {csvPreview[0]?.map((header, index) => (
                                <th key={index} className="px-4 py-3 font-medium whitespace-nowrap">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {csvPreview.slice(1, 6).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="px-4 py-3 whitespace-nowrap">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
             <label htmlFor="name">Data Source Name *</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My CSV Data"
              className="mt-1"
            />
          </div>

          <div>
             <label htmlFor="description">Description (Optional)</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this data contains..."
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Map Data Configuration */}
          {isMapDataSource && detectedColumns.length > 0 && (
            <Card className="p-4 bg-gray-50">
              <h4 className="font-semibold text-sm mb-3">Map Column Configuration</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label htmlFor="latitude" className="text-xs">
                    Latitude Column *
                  </label>
                  <Select 
                    id="latitude"
                    value={latitudeColumn} 
                    onChange={(e) => setLatitudeColumn(e.target.value)}
                    options={[
                      { value: '', label: 'Select column' },
                      ...detectedColumns.map(col => ({ value: col, label: col }))
                    ]}
                    className="mt-1"
                  />
                </div>

                <div>
                   <label htmlFor="longitude" className="text-xs">
                    Longitude Column *
                  </label>
                  <Select 
                    id="longitude"
                    value={longitudeColumn} 
                    onChange={(e) => setLongitudeColumn(e.target.value)}
                    options={[
                      { value: '', label: 'Select column' },
                      ...detectedColumns.map(col => ({ value: col, label: col }))
                    ]}
                    className="mt-1"
                  />
                </div>

                <div>
                   <label htmlFor="label" className="text-xs">
                    Label Column
                  </label>
                  <Select 
                    id="label"
                    value={labelColumn} 
                    onChange={(e) => setLabelColumn(e.target.value)}
                    options={[
                      { value: '', label: 'None' },
                      ...detectedColumns.map(col => ({ value: col, label: col }))
                    ]}
                    className="mt-1"
                  />
                </div>

                <div>
                   <label htmlFor="category" className="text-xs">
                    Category Column
                  </label>
                  <Select 
                    id="category"
                    value={categoryColumn} 
                    onChange={(e) => setCategoryColumn(e.target.value)}
                    options={[
                      { value: '', label: 'None' },
                      ...detectedColumns.map(col => ({ value: col, label: col }))
                    ]}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={handleUpload}
              disabled={!file || !name.trim() || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>

            {onCancel && (
              <Button variant="secondary" onClick={onCancel} disabled={uploading}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
