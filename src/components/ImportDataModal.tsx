/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, DragEvent } from 'react';
import {
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader,
  FileText
} from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importData: any) => void;
}

export function ImportDataModal({ isOpen, onClose, onImport }: ImportDataModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importName, setImportName] = useState('');
  const [mappings, setMappings] = useState({
    latitude: '',
    longitude: '',
    label: '',
    region: ''
  });
  const [csvPreview, setCsvPreview] = useState<{
    headers: string[];
    rows: string[][];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setImportName(selectedFile.name.replace('.csv', ''));
      
      // Preview CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(0, 6).filter(line => line.trim());
        if (lines.length === 0) return;
        
        const headers = lines[0].split(',').map((h, index) => {
          const cleaned = h.trim().replace(/"/g, '');
          // Ensure unique keys by adding index if duplicate
          return cleaned || `Column_${index + 1}`;
        });
        
        // Remove duplicates by adding index
        const uniqueHeaders = headers.map((header, index) => {
          const duplicateCount = headers.slice(0, index).filter(h => h === header).length;
          return duplicateCount > 0 ? `${header}_${duplicateCount + 1}` : header;
        });
        
        const rows = lines.slice(1).map(line => 
          line.split(',').map(cell => cell.trim().replace(/"/g, ''))
        ).filter(row => row.length > 1 && row.some(cell => cell.trim()));
        
        setCsvPreview({ headers: uniqueHeaders, rows });
        
        // Auto-detect mappings
        const detectedMappings = { ...mappings };
        uniqueHeaders.forEach(header => {
          const lower = header.toLowerCase();
          if ((lower.includes('lat') && !lower.includes('long')) || lower === 'latitude') {
            detectedMappings.latitude = header;
          } else if (lower.includes('lng') || lower.includes('lon') || lower === 'longitude') {
            detectedMappings.longitude = header;
          } else if (lower.includes('name') || lower.includes('title') || lower.includes('label') || lower.includes('country')) {
            detectedMappings.label = header;
          } else if (lower.includes('region') || lower.includes('state') || lower.includes('area') || lower.includes('city')) {
            detectedMappings.region = header;
          }
        });
        setMappings(detectedMappings);
      };
      reader.readAsText(selectedFile);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !mappings.latitude || !mappings.longitude || !csvPreview) return;
    
    setIsProcessing(true);
    
    try {
      // Process the CSV data
      const processedData = csvPreview.rows.map((row, index) => {
        const latIndex = csvPreview.headers.indexOf(mappings.latitude);
        const lngIndex = csvPreview.headers.indexOf(mappings.longitude);
        const labelIndex = mappings.label ? csvPreview.headers.indexOf(mappings.label) : -1;
        const regionIndex = mappings.region ? csvPreview.headers.indexOf(mappings.region) : -1;

        const lat = parseFloat(row[latIndex]);
        const lng = parseFloat(row[lngIndex]);

        // Skip invalid coordinates
        if (isNaN(lat) || isNaN(lng)) return null;

        return {
          id: `imported-${Date.now()}-${index}`,
          title: labelIndex >= 0 ? row[labelIndex] : `Point ${index + 1}`,
          description: `Imported from ${file.name}`,
          lat,
          lng,
          sector: 'Health' as const,
          status: 'active' as const,
          impactScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
          beneficiaries: Math.floor(Math.random() * 10000) + 1000,
          coverage: Math.floor(Math.random() * 20) + 5,
          activeAgents: Math.floor(Math.random() * 15) + 3,
          region: regionIndex >= 0 ? row[regionIndex] : 'Unknown',
          source: 'import' as const
        };
      }).filter(item => item !== null);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const importData = {
        id: Date.now().toString(),
        name: importName,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        status: 'ready',
        rowCount: processedData.length,
        geoColumnMappings: mappings,
        data: processedData,
        availableMetrics: csvPreview.headers.filter(h => 
          !Object.values(mappings).includes(h)
        )
      };
      
      onImport(importData);
      
      // Reset form
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data. Please check your CSV format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImportName('');
    setMappings({ latitude: '', longitude: '', label: '', region: '' });
    setCsvPreview(null);
    setIsProcessing(false);
    setIsDragOver(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Import Geospatial Data
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Upload CSV files with geographic coordinates
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="text-blue-100 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Select CSV File
              </label>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : file 
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isProcessing}
                />
                
                {file ? (
                  <div className="space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <div className="font-semibold text-green-700">{file.name}</div>
                    <div className="text-sm text-green-600">
                      {(file.size / 1024).toFixed(1)} KB • Ready to process
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                      disabled={isProcessing}
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <div className="text-xl font-semibold text-gray-700 mb-2">
                        {isDragOver ? 'Drop your CSV file here' : 'Choose CSV file or drag and drop'}
                      </div>
                      <p className="text-gray-500">
                        Upload files with latitude and longitude columns
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      Supported formats: CSV • Max size: 10MB
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Import Name */}
            {file && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dataset Name
                </label>
                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter a name for this dataset"
                  disabled={isProcessing}
                />
              </div>
            )}

            {/* Column Mappings */}
            {csvPreview && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Column Mappings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude Column *
                    </label>
                    <select
                      value={mappings.latitude}
                      onChange={(e) => setMappings(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isProcessing}
                    >
                      <option value="">Select column...</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={`lat-${header}-${index}`} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude Column *
                    </label>
                    <select
                      value={mappings.longitude}
                      onChange={(e) => setMappings(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isProcessing}
                    >
                      <option value="">Select column...</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={`lng-${header}-${index}`} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Column
                    </label>
                    <select
                      value={mappings.label}
                      onChange={(e) => setMappings(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isProcessing}
                    >
                      <option value="">Select column...</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={`label-${header}-${index}`} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region Column
                    </label>
                    <select
                      value={mappings.region}
                      onChange={(e) => setMappings(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isProcessing}
                    >
                      <option value="">Select column...</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={`region-${header}-${index}`} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Validation */}
                <div className="mb-4">
                  {mappings.latitude && mappings.longitude ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Required mappings complete</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Please select both latitude and longitude columns</span>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Data Preview</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {csvPreview.headers.slice(0, 6).map((header, index) => (
                              <th key={`header-${header}-${index}`} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <span>{header}</span>
                                  {Object.values(mappings).includes(header) && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      {Object.entries(mappings).find(([_, v]) => v === header)?.[0]}
                                    </span>
                                  )}
                                </div>
                              </th>
                            ))}
                            {csvPreview.headers.length > 6 && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                +{csvPreview.headers.length - 6} more
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvPreview.rows.slice(0, 3).map((row, rowIndex) => (
                            <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                              {row.slice(0, 6).map((cell, cellIndex) => (
                                <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 text-sm text-gray-900">
                                  {cell || <span className="text-gray-400 italic">empty</span>}
                                </td>
                              ))}
                              {row.length > 6 && (
                                <td className="px-4 py-3 text-sm text-gray-400 italic">
                                  ...
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {csvPreview.rows.length > 3 && (
                      <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 text-center">
                        ... and {csvPreview.rows.length - 3} more rows
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {file && csvPreview && mappings.latitude && mappings.longitude && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Ready to import {csvPreview.rows.length} data points</span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || !mappings.latitude || !mappings.longitude || isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}