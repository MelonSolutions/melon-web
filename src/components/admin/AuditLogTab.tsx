'use client';

import { useState, useEffect } from 'react';
import {
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Shield,
  X,
  Building2,
  Eye,
} from 'lucide-react';
import { adminApiClient, AuditLogEntry, FeatureName, OrganizationStatus } from '@/lib/api/admin';
import AuditLogDetailModal from './AuditLogDetailModal';

const featureOptions = [
  { value: 'kyc', label: 'KYC Management' },
  { value: 'portfolio', label: 'Portfolio Management' },
  { value: 'reports', label: 'Reports' },
  { value: 'impactMetrics', label: 'Impact Metrics' },
  { value: 'visualizations', label: 'Visualizations' },
  { value: 'responses', label: 'Responses' },
  { value: 'overview', label: 'Overview Dashboard' },
  { value: 'status', label: 'Organization Status' },
];

export default function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const pageSize = 20;

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    organizationId: '',
    feature: '' as string,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (filters.organizationId) params.organizationId = filters.organizationId;
      if (filters.feature) params.feature = filters.feature;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await adminApiClient.getAuditLog(params);

      setLogs(response.logs || []);
      setTotalPages(response.totalPages || 0);
      setTotalLogs(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const params: any = {};
      if (filters.organizationId) params.organizationId = filters.organizationId;
      if (filters.feature) params.feature = filters.feature;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const blob = await adminApiClient.exportAuditLog(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting audit log:', err);
      setError(err.message || 'Failed to export audit log');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      organizationId: '',
      feature: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getAccessLevelBadge = (level: string) => {
    // Check if it's an OrganizationStatus
    const statusStyles: Record<string, string> = {
      [OrganizationStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      [OrganizationStatus.TRIAL]: 'bg-amber-100 text-amber-800 border-amber-200',
      [OrganizationStatus.SUSPENDED]: 'bg-rose-100 text-rose-800 border-rose-200',
      [OrganizationStatus.EXPIRED]: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const restrictionStyles: Record<string, string> = {
      full: 'bg-green-100 text-green-800 border-green-200',
      'read-only': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blocked: 'bg-red-100 text-red-800 border-red-200',
    };

    const style = statusStyles[level] || restrictionStyles[level] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${style}`}>
        {level}
      </span>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5B94E5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-900">Error Loading Audit Logs</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchAuditLogs}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-[#5B94E5] bg-blue-50 text-[#5B94E5]'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-[#5B94E5] text-white text-xs font-medium rounded-full">
                {Object.values(filters).filter((v) => v !== '').length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}

          <div className="text-sm text-gray-600">
            {totalLogs} {totalLogs === 1 ? 'entry' : 'entries'} found
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || logs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Audit Logs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feature</label>
              <select
                value={filters.feature}
                onChange={(e) => handleFilterChange('feature', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent"
              >
                <option value="">All Features</option>
                {featureOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID</label>
              <input
                type="text"
                value={filters.organizationId}
                onChange={(e) => handleFilterChange('organizationId', e.target.value)}
                placeholder="Filter by org ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      {logs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-gray-600">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results'
              : 'No restriction changes have been recorded yet'}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Timestamp
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Organization
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Feature
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Change
                  </th>
                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer not-italic"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap max-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-gray-900 truncate">{log.organizationId.name}</span>
                          <span className="text-[10px] text-gray-500 font-mono truncate">{log.organizationId.domain}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter bg-blue-50 text-blue-700 border border-blue-100">
                        {featureOptions.find((f) => f.value === log.feature)?.label || log.feature}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getAccessLevelBadge(log.oldValue)}
                        <span className="text-gray-300 text-xs">→</span>
                        {getAccessLevelBadge(log.newValue)}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button 
                        className="p-2 hover:bg-white rounded-lg transition-all hover:shadow-md active:scale-95 text-gray-400 group-hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-xl">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-gray-900 text-white rounded-lg hover:bg-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-md"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </div>
  );
}
