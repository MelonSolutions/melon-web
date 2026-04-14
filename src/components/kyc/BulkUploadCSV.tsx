'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { bulkUploadKYC, downloadKYCTemplate, BulkUploadResult } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { useAuthContext } from '@/context/AuthContext';
import { apiClient } from '@/lib/api/auth';
import { CustomSelect } from '@/components/ui/CustomSelect';

export function BulkUploadCSV() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const { user } = useAuthContext();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>('');

  const isMelonAdmin = user?.email?.endsWith('@melon.ng') || user?.organization?.name?.toLowerCase().includes('melon');

  useEffect(() => {
    if (!isMelonAdmin) return;

    const fetchOrgs = async () => {
      try {
        setLoadingOrgs(true);
        const data = await apiClient.getOrganizations();
        const orgList = Array.isArray(data) ? data : (data as any)?.data || [];
        setOrganizations(orgList);
        
        const chotaOrg = orgList.find((org: any) => org.name.toLowerCase().includes('chota'));
        if (chotaOrg) {
          setOrganizationId(chotaOrg._id || chotaOrg.id);
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, [isMelonAdmin]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      addToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload a CSV file',
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const uploadResult = await bulkUploadKYC(file, organizationId);
      setResult(uploadResult);

      if (uploadResult.failed === 0) {
        addToast({
          type: 'success',
          title: 'Upload Successful',
          message: `Successfully created ${uploadResult.successful} KYC requests`,
        });
      } else if (uploadResult.successful === 0) {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: `All ${uploadResult.failed} records failed. Please check the errors below.`,
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Partial Success',
          message: `${uploadResult.successful} succeeded, ${uploadResult.failed} failed`,
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload CSV file',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bulk Upload KYC Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload a CSV file to create multiple KYC requests at once
          </p>
        </div>
        <button
          onClick={downloadKYCTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#5B94E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {isMelonAdmin && organizations.length > 0 && (
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Organization <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={organizationId}
            onChange={setOrganizationId}
            options={organizations.map(org => ({ value: org._id || org.id, label: org.name }))}
            placeholder="Select organization for this bulk upload"
          />
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#5B94E5] bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>

          {uploading ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-4 border-[#5B94E5] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading and processing CSV...</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-base font-medium text-gray-900 mb-1">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-500">or</p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
              >
                Browse Files
              </button>

              <p className="text-xs text-gray-500">
                Only CSV files are accepted. Maximum file size: 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Upload Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{result.successful}</p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </div>

          {/* Successful Records */}
          {result.successfulRecords.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Successfully Created ({result.successfulRecords.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.successfulRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.firstName} {record.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{record.phone}</p>
                    </div>
                    <span className="text-xs text-gray-500">Row {record.row}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Records */}
          {result.failedRecords.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Failed Records ({result.failedRecords.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {result.failedRecords.map((record, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        Row {record.row}
                      </p>
                      <span className="text-xs text-gray-500">
                        {record.data.firstName} {record.data.lastName}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {record.errors.map((error, errorIndex) => (
                        <p key={errorIndex} className="text-xs text-red-600">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
