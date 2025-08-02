/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, Loader, AlertCircle, Download } from 'lucide-react';

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

  // Generate sample CSV data for download
  const generateSampleCSV = () => {
    const sampleData = [
      'id,title,description,lat,lng,sector,status,impactScore,beneficiaries,coverage,activeAgents',
      '1,Lagos Malaria Control Center,Community-based malaria prevention initiative,6.5244,3.3792,Health,active,87,15000,25,12',
      '2,Kano Health Initiative,Integrated malaria case management program,12.0022,8.5920,Health,active,92,18000,30,15',
      '3,Abuja Federal Program,Advanced malaria diagnosis and treatment,9.0765,7.3986,Health,active,85,12000,20,10',
      '4,Port Harcourt Campaign,Coastal malaria prevention program,4.8156,7.0498,Health,active,89,22000,35,18',
      '5,Ibadan Research Center,Research-focused malaria intervention,7.3775,3.9470,Health,active,94,8500,15,8'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_malaria_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setImportName(selectedFile.name.replace('.csv', ''));
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(0, 6).filter(line => line.trim());
        if (lines.length === 0) return;
        
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map((h, index) => {
          const cleaned = h.trim().replace(/"/g, '');
          return cleaned || `Column_${index + 1}`;
        });
        
        const uniqueHeaders = headers.map((header, index) => {
          const duplicateCount = headers.slice(0, index).filter(h => h === header).length;
          return duplicateCount > 0 ? `${header}_${duplicateCount + 1}` : header;
        });
        
        const rows = lines.slice(1).map(line => 
          line.split(delimiter).map(cell => cell.trim().replace(/"/g, ''))
        ).filter(row => row.length > 1 && row.some(cell => cell.trim()));
        
        setCsvPreview({ headers: uniqueHeaders, rows });
        
        // Auto-detect mappings
        const detectedMappings = { ...mappings };
        uniqueHeaders.forEach((header, index) => {
          const lower = header.toLowerCase();
          
          if ((lower.includes('lat') && !lower.includes('long')) || lower === 'latitude') {
            detectedMappings.latitude = header;
          } else if (lower.includes('lng') || lower.includes('lon') || lower === 'longitude') {
            detectedMappings.longitude = header;
          } else if (lower.includes('geometry') || lower.includes('point')) {
            const sampleValue = rows[0] && rows[0][index];
            if (sampleValue && sampleValue.includes('POINT')) {
              detectedMappings.latitude = header + '_lat';
              detectedMappings.longitude = header + '_lng';
            }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
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
      const processedData = csvPreview.rows.map((row, index) => {
        let lat, lng;
        
        if (mappings.latitude.includes('_lat') && mappings.longitude.includes('_lng')) {
          const geometryColumnName = mappings.latitude.replace('_lat', '');
          const geometryIndex = csvPreview.headers.indexOf(geometryColumnName);
          
          if (geometryIndex >= 0) {
            const geometryValue = row[geometryIndex];
            const pointMatch = geometryValue.match(/POINT\s*\(\s*([^)]+)\s*\)/);
            if (pointMatch) {
              const coords = pointMatch[1].split(/\s+/);
              if (coords.length >= 2) {
                lng = parseFloat(coords[0]);
                lat = parseFloat(coords[1]);
              }
            }
          }
        } else {
          const latIndex = csvPreview.headers.indexOf(mappings.latitude);
          const lngIndex = csvPreview.headers.indexOf(mappings.longitude);
          
          if (latIndex >= 0 && lngIndex >= 0) {
            lat = parseFloat(row[latIndex]);
            lng = parseFloat(row[lngIndex]);
          }
        }
        
        if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
          return null;
        }

        const labelIndex = mappings.label ? csvPreview.headers.indexOf(mappings.label) : -1;
        const regionIndex = mappings.region ? csvPreview.headers.indexOf(mappings.region) : -1;

        const label = labelIndex >= 0 ? row[labelIndex] : `Point ${index + 1}`;
        const region = regionIndex >= 0 ? row[regionIndex] : 'Unknown';

        const malariaIncidenceIndex = csvPreview.headers.findIndex(h => 
          h.toLowerCase().includes('incidence') || h.toLowerCase().includes('malaria')
        );
        
        const malariaIncidence = malariaIncidenceIndex >= 0 ? parseFloat(row[malariaIncidenceIndex]) || 0 : 0;
        const impactScore = Math.min(100, Math.max(0, 100 - (malariaIncidence / 10)));

        return {
          id: `imported-${Date.now()}-${index}`,
          title: label,
          description: `Imported from ${file.name} - ${region}`,
          lat,
          lng,
          sector: 'Health' as const,
          status: 'active' as const,
          impactScore: Math.floor(impactScore),
          beneficiaries: Math.floor(Math.random() * 50000) + 10000,
          coverage: Math.floor(Math.random() * 25) + 5,
          activeAgents: Math.floor(Math.random() * 15) + 3,
          region,
          source: 'import' as const,
          rawData: row
        };
      }).filter(item => item !== null);

      if (processedData.length === 0) {
        throw new Error('No valid coordinate data found.');
      }

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
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Please check your CSV format.'}`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/30" 
        onClick={handleClose} 
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Import CSV Data</h3>
            <p className="text-sm text-gray-600 mt-1">Upload files with geographic coordinates</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-6 p-4 bg-[#5B94E5]/5 border border-[#5B94E5]/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Need a sample format?</h4>
                <p className="text-sm text-gray-600">Download our sample CSV to see the correct format</p>
              </div>
              <button
                onClick={generateSampleCSV}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
                disabled={isProcessing}
              >
                <Download className="w-4 h-4" />
                Sample CSV
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-[#5B94E5] bg-[#5B94E5]/5' 
                  : file 
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
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
                className="hidden"
                disabled={isProcessing}
              />
              
              {file ? (
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <div className="font-medium text-green-700">{file.name}</div>
                  <div className="text-sm text-green-600">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="text-gray-600">
                    {isDragOver ? 'Drop your CSV file here' : 'Choose CSV file or drag and drop'}
                  </div>
                  <p className="text-xs text-gray-500">CSV files up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {file && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset Name
              </label>
              <input
                type="text"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] outline-none"
                placeholder="Enter name for this dataset"
                disabled={isProcessing}
              />
            </div>
          )}

          {csvPreview && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Column Mappings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitude Column *
                  </label>
                  <select
                    value={mappings.latitude}
                    onChange={(e) => setMappings(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] outline-none"
                    disabled={isProcessing}
                  >
                    <option value="">Select column...</option>
                    {csvPreview.headers.map((header, index) => (
                      <option key={`lat-${index}`} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitude Column *
                  </label>
                  <select
                    value={mappings.longitude}
                    onChange={(e) => setMappings(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] outline-none"
                    disabled={isProcessing}
                  >
                    <option value="">Select column...</option>
                    {csvPreview.headers.map((header, index) => (
                      <option key={`lng-${index}`} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Label Column
                  </label>
                  <select
                    value={mappings.label}
                    onChange={(e) => setMappings(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] outline-none"
                    disabled={isProcessing}
                  >
                    <option value="">Select column...</option>
                    {csvPreview.headers.map((header, index) => (
                      <option key={`label-${index}`} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Region Column
                  </label>
                  <select
                    value={mappings.region}
                    onChange={(e) => setMappings(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] outline-none"
                    disabled={isProcessing}
                  >
                    <option value="">Select column...</option>
                    {csvPreview.headers.map((header, index) => (
                      <option key={`region-${index}`} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-lg border">
                {mappings.latitude && mappings.longitude ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ready to import {csvPreview.rows.length} rows
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Please select latitude and longitude columns
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Data Preview</h5>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-32">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {csvPreview.headers.slice(0, 5).map((header, i) => (
                            <th key={i} className="px-2 py-2 text-left font-medium text-gray-700 border-b">
                              {header}
                            </th>
                          ))}
                          {csvPreview.headers.length > 5 && (
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">
                              +{csvPreview.headers.length - 5} more
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.rows.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-b-0">
                            {row.slice(0, 5).map((cell, j) => (
                              <td key={j} className="px-2 py-2 text-gray-600">
                                {String(cell || '').substring(0, 20)}
                                {String(cell || '').length > 20 && '...'}
                              </td>
                            ))}
                            {row.length > 5 && (
                              <td className="px-2 py-2 text-gray-400">...</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {csvPreview && (
              <>
                {csvPreview.rows.length} rows detected
                {mappings.latitude && mappings.longitude && ' • Ready to import'}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || !mappings.latitude || !mappings.longitude || isProcessing}
              className="cursor-pointer px-6 py-2 text-sm font-medium text-white bg-[#5B94E5] rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}