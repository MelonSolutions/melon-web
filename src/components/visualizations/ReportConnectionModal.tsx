/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useReportsIntegration } from '@/hooks/useVisualizations';

interface ReportConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function ReportConnectionModal({ isOpen, onClose, onConnect }: ReportConnectionModalProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportFields, setReportFields] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionData, setConnectionData] = useState({
    name: '',
    description: '',
    selectedFields: [] as string[],
    dateRange: 'all'
  });

  const { reports, loading: reportsLoading, refetch: fetchReports, getReportFields } = useReportsIntegration();

  useEffect(() => {
    if (isOpen && reports.length === 0) {
      fetchReports();
    }
  }, [isOpen, reports.length, fetchReports]);

  useEffect(() => {
    if (selectedReport) {
      setConnectionData(prev => ({
        ...prev,
        name: `${selectedReport.title} Data`,
        description: `Data source from ${selectedReport.title} report`
      }));
    }
  }, [selectedReport]);

  const handleReportSelect = async (report: any) => {
    setSelectedReport(report);
    
    const result = await getReportFields(report._id);
    if (result.success) {
      setReportFields(result.data);
      setConnectionData(prev => ({
        ...prev,
        selectedFields: result.data.fields.map((field: any) => field.name)
      }));
      setStep('configure');
    }
  };

  const handleConnect = async () => {
    if (!selectedReport) return;

    setIsConnecting(true);
    try {
      const result = await onConnect({
        ...connectionData,
        reportId: selectedReport._id
      });

      if (result.success) {
        resetModal();
        onClose();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const resetModal = () => {
    setStep('select');
    setSelectedReport(null);
    setReportFields(null);
    setConnectionData({
      name: '',
      description: '',
      selectedFields: [],
      dateRange: 'all'
    });
  };

  const handleFieldToggle = (fieldName: string) => {
    setConnectionData(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldName)
        ? prev.selectedFields.filter(f => f !== fieldName)
        : [...prev.selectedFields, fieldName]
    }));
  };

  const handleSelectAllFields = () => {
    if (!reportFields) return;
    
    const allFieldNames = reportFields.fields.map((field: any) => field.name);
    const allSelected = allFieldNames.every((name: string) => 
      connectionData.selectedFields.includes(name)
    );
    
    setConnectionData(prev => ({
      ...prev,
      selectedFields: allSelected ? [] : allFieldNames
    }));
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Connect Survey Data</h3>
              <p className="text-sm text-gray-500 mt-1">
                Create a data source from your survey responses
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isConnecting}
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {step === 'select' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    Select a Report
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose a published report with responses to create a data source.
                  </p>
                </div>

                {reportsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">Loading reports...</p>
                    </div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-12">
                    <h4 className="text-base font-medium text-gray-900 mb-2">
                      No Published Reports Found
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      You need to create and publish a report with responses before you can use it as a data source.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <div
                        key={report._id || `report-${index}`}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                        onClick={() => handleReportSelect(report)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-gray-900">{report.title}</h5>
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                Published
                              </span>
                            </div>
                            
                            {report.description && (
                              <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                            )}
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span>{report.responseCount || 0} responses</span>
                              <span>{report.questions?.length || 0} fields</span>
                            </div>
                          </div>
                          
                          <div className="ml-4 text-right">
                            <div className="text-lg font-semibold text-green-600">
                              {report.responseCount || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              responses
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 'configure' && selectedReport && reportFields && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900">
                    Report: {selectedReport.title}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {reportFields.responseCount} responses • {reportFields.fields.length} fields available
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Source Name
                      </label>
                      <input
                        type="text"
                        value={connectionData.name}
                        onChange={(e) => setConnectionData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a descriptive name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <select
                        value={connectionData.dateRange}
                        onChange={(e) => setConnectionData(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All responses</option>
                        <option value="last_week">Last week</option>
                        <option value="last_month">Last month</option>
                        <option value="last_quarter">Last quarter</option>
                        <option value="last_year">Last year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={connectionData.description}
                      onChange={(e) => setConnectionData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this data source contains"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Fields to Include
                      </label>
                      <button
                        onClick={handleSelectAllFields}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {reportFields.fields.every((field: any) => connectionData.selectedFields.includes(field.name))
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {reportFields.fields.map((field: any, index: number) => (
                          <label 
                            key={field.name || `field-${index}`} 
                            className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={connectionData.selectedFields.includes(field.name)}
                              onChange={() => handleFieldToggle(field.name)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {field.displayName || field.name}
                              </span>
                              <div className="text-xs text-gray-500">
                                {field.type}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600">
                        {connectionData.selectedFields.length} of {reportFields.fields.length} fields selected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {step === 'select' && (
                <span>
                  {reportsLoading ? 'Loading...' : `${reports.length} reports available`}
                </span>
              )}
              {step === 'configure' && (
                <span>
                  {connectionData.selectedFields.length} fields selected
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {step === 'configure' && (
                <button
                  onClick={() => setStep('select')}
                  disabled={isConnecting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={handleClose}
                disabled={isConnecting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              
              {step === 'configure' && (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !connectionData.name.trim() || connectionData.selectedFields.length === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Survey'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}