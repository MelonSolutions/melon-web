'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Share2,
  Settings,
  BarChart3,
  Globe,
  Lock,
  Loader2,
  FileText,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';
import { duplicateReport, deleteReport } from '@/lib/api/reports';
import { EmailSharingModal } from '@/components/reports/EmailSharingModal';

interface Report {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  shareToken?: string;
}

interface ReportCardProps {
  report: Report;
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function ReportCard({ report, view, onRefetch }: ReportCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const reportId = report._id;

  if (!reportId) {
    console.error('Report missing ID:', report);
    return null;
  }

  const handleDuplicate = async () => {
    try {
      setLoading(true);
      await duplicateReport(reportId);
      onRefetch();
    } catch (error) {
      console.error('Error duplicating report:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${report.title}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteReport(reportId);
      onRefetch();
    } catch (error) {
      console.error('Error deleting report:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

const handleShare = async () => {
  if (report.status !== 'PUBLISHED') {
    alert('Only published reports can be shared.');
    return;
  }

  const shareUrl = `${window.location.origin}/reports/public/${report.shareToken || reportId}`;
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy link:', error);
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Share link copied to clipboard!');
  }
  setShowDropdown(false);
};

  const handleNavigate = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.location.href = path;
    setShowDropdown(false);
  };

  const statusConfig = {
    PUBLISHED: {
      label: 'Live Protocol',
      color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
      icon: report.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />
    },
    DRAFT: {
      label: 'Staging Phase',
      color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
      icon: <Edit3 className="w-3.5 h-3.5" />
    },
    CLOSED: {
      label: 'Protocol Terminated',
      color: 'text-error border-error/20 bg-error/5',
      icon: <Lock className="w-3.5 h-3.5" />
    },
    ARCHIVED: {
      label: 'Legacy Record',
      color: 'text-gray-400 border-border bg-surface-secondary/50',
      icon: <FileText className="w-3.5 h-3.5" />
    }
  };

  const config = statusConfig[report.status] || statusConfig.DRAFT;

  const getCategoryTheme = (category: string) => {
    const themes = {
      'Impact Assessment': 'text-blue-500 bg-blue-500/5 border-blue-500/20',
      'Feedback': 'text-purple-500 bg-purple-500/5 border-purple-500/20',
      'Health': 'text-red-500 bg-red-500/5 border-red-500/20',
      'Education': 'text-indigo-500 bg-indigo-500/5 border-indigo-500/20',
      'Agriculture': 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20',
      'Community': 'text-orange-500 bg-orange-500/5 border-orange-500/20',
    };
    return themes[category as keyof typeof themes] || 'text-gray-500 bg-gray-500/5 border-gray-500/20';
  };

  // Grid Matrix View
  if (view === 'grid') {
    return (
      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm group hover:border-primary/30 transition-all duration-500 font-sans flex flex-col h-full relative">
        <Link href={`/reports/${reportId}`} className="flex flex-col h-full flex-1">
          {/* Header Identity */}
          <div className="p-8 pb-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.color}`}>
                     {config.icon}
                     {config.label}
                   </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors tracking-tight flex items-center gap-2">
                  {report.title}
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                {report.description && (
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 leading-relaxed tracking-wide opacity-80">
                    {report.description}
                  </p>
                )}
              </div>

              <div className="relative ml-4 shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="p-2.5 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/20 text-gray-400 hover:text-primary transition-all z-10"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-5 h-5" />
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border shadow-2xl z-20 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={(e) => handleNavigate(`/reports/${reportId}`, e)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left"
                      >
                        <Edit3 className="w-4 h-4" />
                        Modify Protocol
                      </button>
                      <button
                        onClick={(e) => handleNavigate(`/reports/${reportId}/responses`, e)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Intelligence Feed
                      </button>
                      <button
                        onClick={(e) => handleNavigate(`/reports/${reportId}/settings`, e)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left"
                      >
                        <Settings className="w-4 h-4" />
                        System Config
                      </button>
                      
                      <div className="border-t border-border/40 my-1 mx-2"></div>

                      {report.status === 'PUBLISHED' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`/reports/public/${report.shareToken || reportId}`, '_blank');
                              setShowDropdown(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left"
                          >
                            <Eye className="w-4 h-4" />
                            Live Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShare();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left"
                          >
                            <Share2 className="w-4 h-4" />
                            Digital Share
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDuplicate();
                        }}
                        disabled={loading}
                        className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left disabled:opacity-30"
                      >
                        <Copy className="w-4 h-4" />
                        Clone Record
                      </button>
                      
                      <div className="border-t border-border/40 my-1 mx-2"></div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={loading}
                        className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all rounded-xl text-left disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excision
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Context Insights */}
            <div className="mt-auto pt-6 border-t border-border/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${getCategoryTheme(report.category)}`}>
                  {report.category}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-40"></span>
                  SY_VOL: {reportId.substring(reportId.length - 6)}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Footer */}
          <div className="px-8 py-5 bg-surface-secondary/20 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border shadow-sm">
                   <Users className="w-3 h-3 text-primary" />
                   <span className="text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">
                     {report.responseCount} Nodes
                   </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                   {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/30 transition-all">
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </Link>

        {/* Click overlay to close dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(false);
            }}
          />
        )}
      </div>
    );
  }

  // Audit List Item View
  return (
    <div className="group font-sans hover:bg-surface-secondary/30 transition-all cursor-pointer border-l-4 border-transparent hover:border-primary">
      <div className="grid grid-cols-12 gap-6 px-8 py-6 items-center relative">
        {/* Entity Identity */}
        <div className="col-span-4 min-w-0">
          <Link 
            href={`/reports/${reportId}`}
            className="block group/title"
          >
            <div className="text-sm font-black text-gray-900 dark:text-gray-100 group-hover/title:text-primary transition-colors truncate tracking-tight flex items-center gap-2">
              {report.title}
              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
            </div>
            {report.description && (
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-600 truncate mt-1 tracking-wide">
                {report.description}
              </div>
            )}
          </Link>
        </div>

        {/* Protocol Status */}
        <div className="col-span-2 flex justify-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* Context Domain */}
        <div className="col-span-2 flex justify-center">
          <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${getCategoryTheme(report.category)}`}>
            {report.category}
          </span>
        </div>

        {/* Payload Matrix */}
        <div className="col-span-2 flex justify-center items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-secondary/50 border border-border">
             <Users className="w-3 h-3 text-primary" />
             <span className="text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">{report.responseCount} Nodes</span>
          </div>
        </div>

        {/* Temporal Sync */}
        <div className="col-span-1 text-right">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
            {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Command Matrix */}
        <div className="col-span-1 flex justify-end relative z-20">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-2 hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border shadow-2xl z-30 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleNavigate(`/reports/${reportId}`)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modify
                  </button>
                  <button
                    onClick={() => handleNavigate(`/reports/${reportId}/responses`)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Intelligence
                  </button>
                  
                  <div className="border-t border-border/40 my-1 mx-2"></div>

                  <button
                    onClick={handleDuplicate}
                    disabled={loading}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-left disabled:opacity-30"
                  >
                    <Copy className="w-4 h-4" />
                    Clone
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all rounded-xl text-left disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excision
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Click Shield */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(false);
            }}
          />
        )}
        
        {showEmailModal && (
          <EmailSharingModal
            isOpen={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            report={report}
            shareUrl={`${window.location.origin}/reports/public/${report.shareToken || reportId}`}
          />
        )}
      </div>
    </div>
  );
}
