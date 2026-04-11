/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { X, Database, CheckCircle, Info, ChevronRight, Activity } from 'lucide-react';
import { useReportsIntegration } from '@/hooks/useVisualizations';
import { Button } from '@/components/ui/Button';

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
    const allSelected = allFieldNames.every((name: string) => connectionData.selectedFields.includes(name));
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

  const inputClasses = "w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-primary/20";
  const labelClasses = "text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2 mb-3";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="relative bg-surface dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-border dark:border-white/10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Connect Report Data</h3>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 opacity-70">Create a data source from existing reports</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2.5 hover:bg-surface dark:hover:bg-white/10 rounded-xl transition-all">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8 space-y-8">
            {step === 'select' && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-1.5">Select a Report</h4>
                  <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest opacity-80 leading-relaxed">Choose a report to sync data from.</p>
                </div>

                {reportsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading reports...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-20 bg-surface-secondary/20 dark:bg-white/5 rounded-[2rem] border border-border border-dashed">
                    <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-2">No Reports Found</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60">You haven&apos;t published any reports yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {reports.map((report, index) => (
                      <div
                        key={report._id || `report-${index}`}
                        className="group border border-border dark:border-white/10 rounded-[2rem] p-8 hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => handleReportSelect(report)}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h5 className="text-[13px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{report.title}</h5>
                              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Published</span>
                            </div>
                            {report.description && <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest line-clamp-1 mb-4 opacity-70">{report.description}</p>}
                            <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                               <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> {report.responseCount || 0} Responses</div>
                               <div className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full"></div> {report.questions?.length || 0} Fields</div>
                            </div>
                          </div>
                          <div className="ml-6 p-4 bg-surface-secondary/50 dark:bg-white/5 rounded-2xl border border-border dark:border-white/10 group-hover:border-primary/20 transition-all">
                             <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 'configure' && selectedReport && reportFields && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[2rem] p-8 flex items-center gap-6">
                   <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                     <CheckCircle className="w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="text-[13px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Connected Report: {selectedReport.title}</h4>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 opacity-70">
                       {reportFields.responseCount} Responses • {reportFields.fields.length} Fields Available
                     </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={labelClasses}>Data Source Name</label>
                    <input type="text" value={connectionData.name} onChange={(e) => setConnectionData(prev => ({ ...prev, name: e.target.value }))} className={inputClasses} placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>Date Range</label>
                    <select value={connectionData.dateRange} onChange={(e) => setConnectionData(prev => ({ ...prev, dateRange: e.target.value }))} className={inputClasses}>
                      <option value="all" className="dark:bg-gray-900">All responses</option>
                      <option value="last_week" className="dark:bg-gray-900">Last week</option>
                      <option value="last_month" className="dark:bg-gray-900">Last month</option>
                      <option value="last_quarter" className="dark:bg-gray-900">Last quarter</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClasses}>Description (Optional)</label>
                  <textarea value={connectionData.description} onChange={(e) => setConnectionData(prev => ({ ...prev, description: e.target.value }))} rows={3} className={inputClasses + " h-32 pt-4 px-6"} placeholder="Describe this data source" />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className={labelClasses}>Select Fields to Include</label>
                    <button onClick={handleSelectAllFields} className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                      {reportFields.fields.every((field: any) => connectionData.selectedFields.includes(field.name)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportFields.fields.map((field: any, index: number) => (
                      <label key={field.name || `field-${index}`} className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer ${connectionData.selectedFields.includes(field.name) ? 'bg-primary/5 border-primary/40 shadow-sm' : 'bg-surface-secondary/20 dark:bg-white/5 border-border dark:border-white/10 opacity-70 hover:opacity-100 hover:border-gray-400'}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${connectionData.selectedFields.includes(field.name) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-700'}`}>
                           {connectionData.selectedFields.includes(field.name) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <input type="checkbox" checked={connectionData.selectedFields.includes(field.name)} onChange={() => handleFieldToggle(field.name)} className="hidden" />
                        <div className="flex-1">
                          <span className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{field.displayName || field.name}</span>
                          <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest opacity-60 font-mono">TYPE: {field.type.toUpperCase()}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-10 py-8 border-t border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {step === 'configure' && <span>{connectionData.selectedFields.length} Fields Selected</span>}
            </div>
            
            <div className="flex items-center gap-4">
              {step === 'configure' && (
                <Button variant="secondary" onClick={() => setStep('select')} disabled={isConnecting} className="rounded-xl px-6 py-4 font-black uppercase tracking-widest text-[10px]">
                  Back
                </Button>
              )}
              <Button variant="secondary" onClick={handleClose} disabled={isConnecting} className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] border-border/60">
                Cancel
              </Button>
              {step === 'configure' && (
                <Button onClick={handleConnect} disabled={isConnecting || !connectionData.name.trim() || connectionData.selectedFields.length === 0} className="rounded-xl px-10 py-4 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]">
                  {isConnecting ? 'Connecting...' : 'Connect Report'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}