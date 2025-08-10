/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, mappings: any) => void;
}

interface ColumnMapping {
  original: string;
  mapped: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export function CSVImportModal({ isOpen, onClose, onImport }: CSVImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
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
        original: header,
        mapped: header.toLowerCase().replace(/\s+/g, '_'),
        type: detectColumnType(data.map(row => row[header]))
      }));
      
      setColumnMappings(mappings);
      setStep('preview');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const detectColumnType = (values: any[]): 'string' | 'number' | 'date' | 'boolean' => {
    // Simple type detection logic
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

  const handleImport = () => {
    if (file && columnMappings.length > 0) {
      onImport(file, columnMappings);
      onClose();
      resetModal();
    }
  };

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMappings([]);
    setIsProcessing(false);
  };

  const downloadSample = () => {
    const sampleCSV = `region,rating,feedback,timestamp
North,4.2,"Great app, very useful",2024-08-01T10:00:00Z
South,3.8,"Good but could be better",2024-08-01T11:15:00Z
East,4.5,"Excellent features",2024-08-01T12:30:00Z
West,3.5,"Average experience",2024-08-01T13:45:00Z
Central,4.1,"Very satisfied",2024-08-01T14:00:00Z`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Import CSV Data</h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload your CSV file to create visualizations
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Sample Download */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900">
                      Need a sample CSV format?
                    </h4>
                    <p className="text-sm text-blue-700">
                      Download our sample CSV to see the expected format
                    </p>
                  </div>
                  <button
                    onClick={downloadSample}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
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
                <button className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B94E5] mx-auto mb-2"></div>
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
                      {file?.name} • {headers.length} columns • ~{csvData.length} sample rows shown
                    </p>
                  </div>
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
                          value={mapping.original}
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
                          value={mapping.mapped}
                          onChange={(e) => updateMapping(index, 'mapped', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Data Type
                        </label>
                        <select
                          value={mapping.type}
                          onChange={(e) => updateMapping(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5]"
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
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            {step === 'preview' && (
              <span>✓ Ready to import {file?.name}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                resetModal();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            {step === 'preview' && (
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm font-medium text-white bg-[#5B94E5] rounded hover:bg-blue-600 transition-colors"
              >
                Import Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}