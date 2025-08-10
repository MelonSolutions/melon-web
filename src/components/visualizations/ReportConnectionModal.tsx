/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { X, Database, CheckCircle, Loader, AlertCircle, Users, Calendar, FileText } from 'lucide-react';
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
      console.log('🔄 Modal opened - fetching reports...');
      fetchReports();
    }
  }, [isOpen, reports.length, fetchReports]);

  useEffect(() => {
    if (selectedReport) {
      setConnectionData(prev => ({
        ...prev,
        name: `${selectedReport.title} Data`,
        description: `Data source created from ${selectedReport.title} report responses`
      }));
    }
  }, [selectedReport]);

  const handleReportSelect = async (report: any) => {
    console.log('Report selected, fetching fields...');
    setSelectedReport(report);
    
    // Fetch report fields
    const result = await getReportFields(report._id);
    if (result.success) {
      setReportFields(result.data);
      setConnectionData(prev => ({
        ...prev,
        selectedFields: result.data.fields.map((field: any) => field.name)
      }));
      setStep('configure');
    } else {
      alert('Failed to fetch report fields: ' + result.error);
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
        console.log('Report connected successfully!');
      } else {
        alert('Failed to connect report: ' + result.error);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return '🔢';
      case 'date':
        return '📅';
      case 'boolean':
        return '✓';
      default:
        return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Connect Report Data</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create a data source from your report responses for visualization
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            disabled={isConnecting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`flex items-center ${step === 'select' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'select' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select Report</span>
            </div>
            <div className="flex-1 mx-4">
              <div className={`h-1 rounded-full ${step === 'configure' ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`flex items-center ${step === 'configure' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'configure' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Configure Data Source</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">
                  Select a Report
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  Choose a published report with responses to create a data source for visualization.
                </p>
              </div>

              {reportsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">Loading your reports...</p>
                    <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
                  </div>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    No Published Reports Found
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    You need to create and publish a report with responses before you can use it as a data source.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg text-left">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">How to create a report:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Go to the Reports section</li>
                      <li>• Create a new report with questions</li>
                      <li>• Publish the report</li>
                      <li>• Collect responses from users</li>
                      <li>• Return here to visualize the data</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Found {reports.length} report{reports.length !== 1 ? 's' : ''} available for visualization:
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                      <div
                        key={report._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200"
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
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                            )}
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{report.responseCount || 0} responses</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Database className="w-4 h-4" />
                                <span>{report.questions?.length || 0} fields</span>
                              </div>
                              {report.lastResponseAt && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Last response: {formatDate(report.lastResponseAt)}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Category if available */}
                            {report.category && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                  {report.category}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4 flex flex-col items-end">
                            {report.responseCount > 0 ? (
                              <div className="text-lg font-semibold text-green-600">
                                {report.responseCount}
                              </div>
                            ) : (
                              <div className="text-sm text-orange-600 font-medium">
                                No responses
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {report.responseCount > 0 ? 'Ready to visualize' : 'Needs responses'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Warning for reports with no responses */}
                        {report.responseCount === 0 && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-orange-700">
                                This report has no responses yet. You won&rsquo;t be able to create meaningful visualizations until people submit responses.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'configure' && selectedReport && reportFields && (
            <div className="space-y-6">
              {/* Selected Report Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900">
                      Report Selected: {selectedReport.title}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {reportFields.responseCount} responses • {reportFields.fields.length} fields available
                    </p>
                    {selectedReport.description && (
                      <p className="text-sm text-blue-600 mt-2 italic">
                        &rdquo;{selectedReport.description}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Source Configuration */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-4">
                    Configure Data Source
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Source Name *
                    </label>
                    <input
                      type="text"
                      value={connectionData.name}
                      onChange={(e) => setConnectionData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Describe what this data source contains and how it will be used..."
                  />
                </div>

                {/* Field Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Fields to Include *
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
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {reportFields.fields.map((field: any) => (
                        <label 
                          key={field.name} 
                          className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={connectionData.selectedFields.includes(field.name)}
                            onChange={() => handleFieldToggle(field.name)}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {field.displayName || field.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Type: {field.type} • Field: {field.name}
                            </div>
                            {field.description && (
                              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {field.description}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      {connectionData.selectedFields.length} of {reportFields.fields.length} fields selected
                    </div>
                  </div>
                </div>

                {/* Preview Info */}
                {connectionData.selectedFields.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium text-green-900">
                          Data Source Preview
                        </h5>
                        <p className="text-sm text-green-700 mt-1">
                          This will create a data source with {connectionData.selectedFields.length} columns 
                          and approximately {reportFields.responseCount} rows from the selected date range.
                        </p>
                        <div className="mt-2 text-xs text-green-600">
                          Selected fields: {connectionData.selectedFields.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {step === 'select' && (
              <span>
                {reportsLoading ? 'Loading...' : `${reports.length} report${reports.length !== 1 ? 's' : ''} available`}
              </span>
            )}
            {step === 'configure' && (
              <span>
                {connectionData.selectedFields.length} field{connectionData.selectedFields.length !== 1 ? 's' : ''} selected 
                • ~{reportFields?.responseCount || 0} rows
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {step === 'configure' && (
              <button
                onClick={() => setStep('select')}
                disabled={isConnecting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            <button
              onClick={() => {
                onClose();
                resetModal();
              }}
              disabled={isConnecting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            {step === 'configure' && (
              <button
                onClick={handleConnect}
                disabled={isConnecting || !connectionData.name.trim() || connectionData.selectedFields.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Connecting...
                  </div>
                ) : (
                  'Connect Report'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}