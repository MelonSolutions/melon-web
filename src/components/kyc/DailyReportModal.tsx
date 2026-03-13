'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, X, Download, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useToast } from '@/components/ui/Toast';
import { useAuthContext } from '@/context/AuthContext';
import { downloadDailyOrganizationReport } from '@/lib/api/kyc';
import { apiClient } from '@/lib/api/auth';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Organization {
  id: string;
  name: string;
}

export function DailyReportModal({ isOpen, onClose }: DailyReportModalProps) {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isMelonAdmin = user?.email?.endsWith('@melon.ng') || user?.organization?.name?.toLowerCase().includes('melon');

  useEffect(() => {
    if (isOpen && isMelonAdmin) {
      const fetchOrgs = async () => {
        try {
          setFetchingOrgs(true);
          const data = await apiClient.getOrganizations();
          // The API might return an array or an object with a data property
          const orgList = Array.isArray(data) ? data : (data as any).data || [];
          setOrganizations(orgList.map((o: any) => ({ id: o.id || o._id, name: o.name })));
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        } finally {
          setFetchingOrgs(false);
        }
      };
      fetchOrgs();
    }
  }, [isOpen, isMelonAdmin]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      await downloadDailyOrganizationReport(date, isMelonAdmin ? selectedOrgId : undefined);
      addToast({
        type: 'success',
        title: 'Report Generated',
        message: `Daily report for ${date} has been downloaded.`,
      });
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to generate daily report.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-md md:max-w-lg md:min-h-[520px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Daily Report</h3>
              <p className="text-xs text-gray-500 font-medium">KYC Activity Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-5">
            {/* Date Section */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                Select Report Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full !rounded-xl"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Organization Section for Melon Admins */}
            {isMelonAdmin && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 size={14} className="text-gray-400" />
                  Target Organization
                </label>
                <CustomSelect
                  options={[
                    { value: '', label: 'My Current Organization' },
                    ...organizations.map(org => ({ value: org.id, label: org.name }))
                  ]}
                  value={selectedOrgId}
                  onChange={setSelectedOrgId}
                  placeholder={fetchingOrgs ? 'Loading organizations...' : 'Select organization'}
                  disabled={fetchingOrgs}
                />
                <p className="text-[10px] text-gray-400 font-medium italic">
                  * Melon super-admins can pull reports for any active host.
                </p>
              </div>
            )}
            
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Report includes portal entry times, agent pick-up timestamps, and completion metrics for the selected day.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="!rounded-xl px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={loading || !date}
            icon={<Download className="w-4 h-4" />}
            className="!rounded-xl px-6 shadow-lg shadow-primary/20"
          >
            {loading ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
