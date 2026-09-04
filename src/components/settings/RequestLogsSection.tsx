'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Clock, Activity, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RefreshCw, FileText, ExternalLink
} from 'lucide-react';
import { getApiLogs, ApiLog, ApiLogsResponse } from '@/lib/api/api-keys';

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  PATCH: 'bg-purple-100 text-purple-700',
  DELETE: 'bg-red-100 text-red-700',
};

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-green-100 text-green-700';
  if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-700';
  if (code >= 400 && code < 500) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function getResponseTimeBadge(ms: number): string {
  if (ms < 200) return 'text-green-600';
  if (ms < 1000) return 'text-amber-600';
  return 'text-red-600';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function JsonViewer({ data, label }: { data: any; label: string }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!data) {
    return (
      <div className="text-xs text-gray-400 italic py-2">No {label.toLowerCase()} recorded</div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors"
      >
        <span>{label}</span>
        {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
      {!collapsed && (
        <pre className="px-3 py-2 text-[11px] leading-relaxed font-mono text-gray-700 bg-gray-50/50 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap break-all">
          {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function RequestLogsSection() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filters
  const [envFilter, setEnvFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (envFilter) params.environment = envFilter;
      if (methodFilter) params.method = methodFilter;
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const data = await getApiLogs(params);
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // Silent fail — logs are non-critical
    } finally {
      setIsLoading(false);
    }
  }, [page, envFilter, methodFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [envFilter, methodFilter, statusFilter, debouncedSearch]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              Request Logs
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {total} total
              </span>
            </h2>
            <p className="text-sm text-gray-500">View a history of API requests and their responses</p>
          </div>
        </div>
        <button
          onClick={() => fetchLogs()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        {/* Environment Filter */}
        <select
          value={envFilter}
          onChange={(e) => setEnvFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        >
          <option value="">All Environments</option>
          <option value="live">🟢 Live</option>
          <option value="sandbox">🟡 Sandbox</option>
        </select>

        {/* Method Filter */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        >
          <option value="">All Status Codes</option>
          <option value="200">2xx Success</option>
          <option value="400">4xx Client Error</option>
          <option value="500">5xx Server Error</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by path or request ID..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Log Table */}
      {isLoading && logs.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Loading request logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">No API requests found</p>
          <p className="text-xs text-gray-400">
            {envFilter || methodFilter || statusFilter || debouncedSearch
              ? 'Try adjusting your filters to see more results.'
              : 'Make your first API call using one of your API keys to see request logs here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[100px_70px_1fr_70px_80px_80px] gap-3 px-3 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <span>Timestamp</span>
            <span>Method</span>
            <span>Path</span>
            <span>Status</span>
            <span>Duration</span>
            <span>Env</span>
          </div>

          {/* Log Rows */}
          {logs.map((log) => {
            const isExpanded = expandedLogId === log._id;

            return (
              <div key={log._id} className="border-b border-gray-50 last:border-0">
                <button
                  onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                  className={`w-full grid grid-cols-1 sm:grid-cols-[100px_70px_1fr_70px_80px_80px] gap-2 sm:gap-3 px-3 py-2.5 text-left hover:bg-gray-50/80 transition-colors ${
                    isExpanded ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {/* Timestamp */}
                  <span className="text-[11px] text-gray-500 font-mono tabular-nums">
                    {formatTimestamp(log.createdAt)}
                  </span>

                  {/* Method */}
                  <span>
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${METHOD_COLORS[log.method] || 'bg-gray-100 text-gray-600'}`}>
                      {log.method}
                    </span>
                  </span>

                  {/* Path */}
                  <span className="text-xs text-gray-700 font-mono truncate" title={log.url || log.path}>
                    {log.url || log.path}
                  </span>

                  {/* Status */}
                  <span>
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${getStatusColor(log.statusCode)}`}>
                      {log.statusCode}
                    </span>
                  </span>

                  {/* Duration */}
                  <span className={`text-xs font-mono tabular-nums ${getResponseTimeBadge(log.responseTime)}`}>
                    {log.responseTime}ms
                  </span>

                  {/* Environment */}
                  <span>
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      log.environment === 'live'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.environment}
                    </span>
                  </span>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-3 pb-4 pt-1 bg-gray-50/30 space-y-3">
                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-gray-500">
                      {log.requestId && (
                        <span>
                          <span className="text-gray-400">Request ID:</span>{' '}
                          <span className="font-mono text-gray-600">{log.requestId}</span>
                        </span>
                      )}
                      {log.ipAddress && (
                        <span>
                          <span className="text-gray-400">IP:</span>{' '}
                          <span className="font-mono text-gray-600">{log.ipAddress}</span>
                        </span>
                      )}
                      {log.userAgent && (
                        <span className="max-w-md truncate">
                          <span className="text-gray-400">User-Agent:</span>{' '}
                          <span className="font-mono text-gray-600">{log.userAgent}</span>
                        </span>
                      )}
                      {log.errorCode && (
                        <span>
                          <span className="text-gray-400">Error:</span>{' '}
                          <span className="font-mono text-red-600">{log.errorCode}</span>
                        </span>
                      )}
                    </div>

                    {/* Request/Response Bodies */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <JsonViewer data={log.requestBody} label="Request Body" />
                      <JsonViewer data={log.responseBody} label="Response Body" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} logs
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 text-xs rounded transition-colors ${
                    pageNum === page
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
