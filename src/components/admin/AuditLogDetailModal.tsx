'use client';

import { X, Calendar, User, Building2, Shield, Activity, Monitor, Globe, Info } from 'lucide-react';
import { AuditLogEntry, OrganizationStatus } from '@/lib/api/admin';

interface AuditLogDetailModalProps {
  log: AuditLogEntry;
  onClose: () => void;
}

export default function AuditLogDetailModal({ log, onClose }: AuditLogDetailModalProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  const getAccessLevelBadge = (level: string) => {
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${style}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Audit Event Details</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">ID: {log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all hover:shadow-md active:scale-90 text-gray-400 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] p-8 space-y-8">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Change Event</span>
              </div>
              <div className="flex items-center gap-3">
                {getAccessLevelBadge(log.oldValue)}
                <span className="text-blue-300 font-bold">→</span>
                {getAccessLevelBadge(log.newValue)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Timestamp</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{formatTimestamp(log.timestamp)}</p>
            </div>
          </div>

          {/* Affected Organization */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Organization</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <Building2 className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-gray-900">{log.organizationId.name}</span>
                <span className="text-xs text-gray-500 font-mono">{log.organizationId.domain}</span>
              </div>
            </div>
          </div>

          {/* Admin Context */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Administrator Context</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{log.adminUserId.firstName} {log.adminUserId.lastName}</span>
                  <span className="text-[10px] text-gray-500">{log.adminUserId.email}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <Globe className="w-3 h-3" /> IP Address
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-700">{log.ipAddress || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <Monitor className="w-3 h-3" /> Source
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 truncate max-w-[140px]" title={log.userAgent}>
                    {log.userAgent || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Change Reason</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 text-gray-900 leading-relaxed text-sm font-medium border border-gray-200 shadow-inner">
              {log.reason}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/80 transition-all shadow-lg active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
