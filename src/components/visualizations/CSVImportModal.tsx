/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileText, Download, Loader } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, mappings: any) => Promise<{ success: boolean; error?: string }>;
  isUploading?: boolean;
}

interface ColumnMapping {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  displayName: string;
}

export function CSVImportModal({ isOpen, onClose, onImport, isUploading = false }: CSVImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importConfig, setImportConfig] = useState({
    name: '',
    description: '',
    hasHeader: true,
    delimiter: ','
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setImportError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    setImportError(null);
    setImportConfig(prev => ({ ...prev, name: selectedFile.name.replace('.csv', '') }));

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(importConfig.delimiter).map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(importConfig.delimiter).map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setHeaders(headers);
      setCsvData(data);
      
      // Auto-detect column types and create mappings
      const mappings: ColumnMapping[] = headers.map(header => ({
        name: header,
        displayName: header.toLowerCase().replace(/\s+/g, '_'),
        type: detectColumnType(data.map(row => row[header]))
      }));
      
      setColumnMappings(mappings);
      setStep('preview');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setImportError('Error parsing CSV file. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const detectColumnType = (values: any[]): 'string' | 'number' | 'date' | 'boolean' => {
    const nonEmptyValues = values.filter(v => v && v.toString().trim());
    
    if (nonEmptyValues.length === 0) return 'string';
    
    // Check if all values are numbers
    if (nonEmptyValues.every(v => !isNaN(Number(v)) && !isNaN(parseFloat(v)))) {
      return 'number';
    }
    
    // Check if values look like dates
    if (nonEmptyValues.every(v => !isNaN(Date.parse(v)))) {
      return 'date';
    }
    
    // Check if values are boolean-like
    if (nonEmptyValues.every(v => 
      ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toString().toLowerCase())
    )) {
      return 'boolean';
    }
    
    return 'string';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const updateMapping = (index: number, field: keyof ColumnMapping, value: any) => {
    const updated = [...columnMappings];
    updated[index] = { ...updated[index], [field]: value };
    setColumnMappings(updated);
  };

  const handleImport = async () => {
    if (!file || columnMappings.length === 0 || !importConfig.name.trim()) {
      setImportError('Please fill in all required fields');
      return;
    }

    try {
      setImportError(null);
      
      // Prepare the mapping data in the format expected by backend
      const mappings = {
        name: importConfig.name.trim(),
        description: importConfig.description.trim(),
        fileName: file.name,
        columnMappings: columnMappings.map(mapping => ({
          name: mapping.name,
          displayName: mapping.displayName,
          type: mapping.type
        })),
        hasHeader: importConfig.hasHeader,
        delimiter: importConfig.delimiter,
        // Add total row count from the actual file
        totalRows: csvData.length, // This is just the preview, backend should count actual rows
      };

      console.log('🔄 Importing CSV with mappings:', mappings);
      console.log('📁 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      const result = await onImport(file, mappings);
      
      if (result.success) {
        console.log('✅ CSV imported successfully!');
        resetModal();
        onClose(); // This should close the modal
      } else {
        console.error('❌ Import failed:', result.error);
        setImportError(result.error || 'Failed to import CSV');
      }
    } catch (error) {
      console.error('❌ Import error:', error);
      setImportError(error instanceof Error ? error.message : 'Failed to import CSV');
    }
  };

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMappings([]);
    setImportConfig({
      name: '',
      description: '',
      hasHeader: true,
      delimiter: ','
    });
    setIsProcessing(false);
    setImportError(null);
  };

  const handleDownloadSample = async () => {
    try {
      // Create properly formatted sample CSV content with commas
      const sampleContent = `region,rating,feedback,timestamp,satisfaction_score
North America,4.5,"Great app, very useful",2024-08-01T10:00:00Z,9
Europe,4.2,"Good but could be better",2024-08-01T11:15:00Z,7
Asia,4.7,"Excellent features",2024-08-01T12:30:00Z,9
South America,3.8,"Average experience",2024-08-01T13:45:00Z,6
Africa,4.1,"Very satisfied",2024-08-01T14:00:00Z,8
North America,4.0,"User-friendly interface",2024-08-02T09:30:00Z,8
Europe,3.9,"Fast and reliable",2024-08-02T10:45:00Z,7
Asia,4.3,"Love the new features",2024-08-02T11:20:00Z,9
South America,3.7,"Could use improvements",2024-08-02T12:15:00Z,7
Africa,4.4,"Outstanding performance",2024-08-02T13:30:00Z,9`;

      const blob = new Blob([sampleContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download sample:', error);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Import CSV Data</h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload your CSV file to create visualizations
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading || isProcessing}
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          {step !== 'upload' && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex items-center text-green-600">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-600">
                    ✓
                  </div>
                  <span className="ml-2 text-sm font-medium">File Upload</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-1 rounded-full bg-green-200"></div>
                </div>
                <div className="flex items-center text-blue-600">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Configure Import</span>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Error Display */}
            {importError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Import Error</h4>
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                </div>
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-6">
                {/* Sample Download */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Need a sample CSV format?
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Download our sample CSV to see the expected format
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadSample}
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Sample
                    </button>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Upload CSV File
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <button className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors">
                    Choose File
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />

                {isProcessing && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Processing CSV file...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                {/* File Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">
                        File uploaded successfully
                      </h4>
                      <p className="text-sm text-green-700">
                        {file?.name} • {headers.length} columns • {csvData.length} sample rows shown
                      </p>
                    </div>
                  </div>
                </div>

                {/* Import Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Source Name *
                    </label>
                    <input
                      type="text"
                      value={importConfig.name}
                      onChange={(e) => setImportConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter data source name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={importConfig.description}
                      onChange={(e) => setImportConfig(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                {/* Data Preview */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Data Preview</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {headers.map((header, index) => (
                              <th
                                key={index}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {headers.map((header, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {row[header] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Column Mappings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Column Configuration</h4>
                  <div className="space-y-3">
                    {columnMappings.map((mapping, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Original Column
                          </label>
                          <input
                            type="text"
                            value={mapping.name}
                            readOnly
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={mapping.displayName}
                            onChange={(e) => updateMapping(index, 'displayName', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Data Type
                          </label>
                          <select
                            value={mapping.type}
                            onChange={(e) => updateMapping(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="string">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="boolean">Boolean</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center text-sm text-gray-500">
              {step === 'preview' && file && (
                <span>✓ Ready to import {file.name}</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={isUploading || isProcessing}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              {step === 'preview' && (
                <button
                  onClick={handleImport}
                  disabled={isUploading || isProcessing || !importConfig.name.trim()}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading || isProcessing ? (
                    <div className="flex items-center">
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Importing...
                    </div>
                  ) : (
                    'Import Data'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}