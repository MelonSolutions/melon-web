/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileText, Download, Loader, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    if (nonEmptyValues.every(v => !isNaN(Number(v)) && !isNaN(parseFloat(v)))) return 'number';
    if (nonEmptyValues.every(v => !isNaN(Date.parse(v)))) return 'date';
    if (nonEmptyValues.every(v => ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toString().toLowerCase()))) return 'boolean';
    return 'string';
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
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
        totalRows: csvData.length,
      };
      
      const result = await onImport(file, mappings);
      if (result.success) {
        resetModal();
        onClose();
      } else {
        setImportError(result.error || 'Failed to import CSV');
      }
    } catch (error) {
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
      const sampleContent = `region,rating,feedback,timestamp,satisfaction_score\nNorth America,4.5,"Great app, very useful",2024-08-01T10:00:00Z,9\nEurope,4.2,"Good but could be better",2024-08-01T11:15:00Z,7\nAsia,4.7,"Excellent features",2024-08-01T12:30:00Z,9`;
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

  const inputClasses = "w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-primary/20";
  const labelClasses = "text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2 mb-3";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="relative bg-surface dark:bg-gray-900 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-border dark:border-white/10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Import CSV Data</h3>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 opacity-70">Create data source from CSV file</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 hover:bg-surface dark:hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8 space-y-8">
            {importError && (
              <div className="p-5 bg-error/5 border border-error/20 rounded-2xl animate-in shake duration-500">
                <div className="flex items-center gap-4 text-error">
                  <AlertCircle className="w-4 h-4" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Import Error</h4>
                    <p className="text-[9px] font-bold mt-0.5 uppercase opacity-80">{importError}</p>
                  </div>
                </div>
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-8">
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Sample Template</h4>
                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 opacity-70">Download a sample CSV to see the recommended structure</p>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={handleDownloadSample}
                    className="rounded-xl px-6 py-3 font-black uppercase tracking-widest text-[8px] border-border/60"
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download
                  </Button>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border dark:border-white/10 rounded-[2rem] p-12 text-center hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-primary/5 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-surface-secondary/50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-500 border border-border dark:border-white/10">
                    <Upload className="w-8 h-8 text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-[15px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-1.5">
                    Select CSV File
                  </h4>
                  <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
                    Drag and drop or click to browse
                  </p>
                  <Button variant="primary" className="rounded-xl px-8 py-3.5 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20">
                    Choose File
                  </Button>
                </div>

                <input ref={fileInputRef} type="file" accept=".csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} className="hidden" />
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-10">
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 flex items-center gap-6">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[13px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">File Loaded</h4>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 opacity-70">
                      {file?.name} • {headers.length} Columns detected
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      Data Source Name
                    </label>
                    <input type="text" value={importConfig.name} onChange={(e) => setImportConfig(prev => ({ ...prev, name: e.target.value }))} className={inputClasses} placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      Description (Optional)
                    </label>
                    <input type="text" value={importConfig.description} onChange={(e) => setImportConfig(prev => ({ ...prev, description: e.target.value }))} className={inputClasses} placeholder="Enter description" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className={labelClasses}>
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    Data Preview
                  </h4>
                  <div className="bg-surface-secondary/20 dark:bg-white/5 rounded-[2rem] border border-border dark:border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border/30 dark:divide-white/10">
                        <thead className="bg-surface-secondary/30 dark:bg-white/10">
                          <tr>
                            {headers.map((header, index) => (
                              <th key={index} className="px-6 py-4 text-left text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 dark:divide-white/10">
                          {csvData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-primary/[0.01]">
                              {headers.map((header, colIndex) => (
                                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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

                <div className="space-y-6">
                  <h4 className={labelClasses}>
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    Column Mapping
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {columnMappings.map((mapping, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-surface-secondary/20 dark:bg-white/5 rounded-2xl border border-border dark:border-white/10">
                        <div>
                          <label className="block text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">CSV Column</label>
                          <input type="text" value={mapping.name} readOnly className="w-full px-4 py-3 text-[10px] font-black bg-surface-secondary/40 dark:bg-white/5 border border-border/40 dark:border-white/10 rounded-xl text-gray-500 uppercase" />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Field Name</label>
                          <input type="text" value={mapping.displayName} onChange={(e) => updateMapping(index, 'displayName', e.target.value)} className={inputClasses.replace('py-4', 'py-3')} />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Data Type</label>
                          <select value={mapping.type} onChange={(e) => updateMapping(index, 'type', e.target.value as any)} className={inputClasses.replace('py-4', 'py-3')}>
                            <option value="string" className="dark:bg-gray-900">Text</option>
                            <option value="number" className="dark:bg-gray-900">Number</option>
                            <option value="date" className="dark:bg-gray-900">Date</option>
                            <option value="boolean" className="dark:bg-gray-900">Boolean</option>
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
          <div className="flex items-center justify-between px-10 py-8 border-t border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {step === 'preview' && file && (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Ready to import
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isUploading || isProcessing}
                className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] border-border/60"
              >
                Cancel
              </Button>
              
              {step === 'preview' && (
                <Button
                  onClick={handleImport}
                  disabled={isUploading || isProcessing || !importConfig.name.trim()}
                  className="rounded-xl px-12 py-4 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
                >
                  {isUploading || isProcessing ? 'Processing...' : 'Import Data'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}