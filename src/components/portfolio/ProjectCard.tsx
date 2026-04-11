'use client';

import { useState } from 'react';
import { Project, getStatusColor, getStatusDisplayName, getSectorDisplayName } from '@/types/portfolio';
import { 
  MoreHorizontal, 
  Calendar, 
  Users, 
  DollarSign,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useModal } from '@/components/ui/Modal';

interface ProjectCardProps {
  project: Project;
  onRefetch: () => void;
}

export function ProjectCard({ project, onRefetch }: ProjectCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { openConfirmModal } = useModal();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const budgetUtilization = project.totalBudget > 0 
    ? Math.round((project.spentBudget / project.totalBudget) * 100) 
    : 0;

  const handleDelete = () => {
    openConfirmModal({
      title: 'Delete Project',
      description: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setLoading(true);
          // Add your delete API call here
          // await deleteProject(project._id);
          onRefetch();
        } catch (error) {
          console.error('Error deleting project:', error);
        } finally {
          setLoading(false);
        }
      }
    });
    setShowDropdown(false);
  };

  return (
    <div className="bg-surface rounded-xl border border-border hover:border-primary/30 transition-all relative group shadow-sm">
      <Link href={`/portfolio/${project._id}`} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-1 mb-1">
              {project.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-surface-secondary rounded-lg transition-colors flex-shrink-0 border border-transparent hover:border-border"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreHorizontal className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Status and Sector */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
            {getStatusDisplayName(project.status)}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-secondary text-gray-600 dark:text-gray-400 border border-border">
            {getSectorDisplayName(project.sector)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Progress</span>
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{project.progressPercentage}%</span>
          </div>
          <div className="w-full bg-surface-secondary rounded-full h-1.5 border border-border/50">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(91,148,229,0.3)]"
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Impact Score</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.impactScore}%</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Households</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {project.actualHouseholds?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="font-medium">{formatBudget(project.totalBudget)} • {budgetUtilization}% used</span>
          </div>

          {project.teamMembers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Users className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="font-medium">{project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-secondary text-gray-600 dark:text-gray-400 border border-border"
              >
                {tag.name}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 dark:text-gray-500">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-6 top-16 w-48 bg-surface rounded-xl border border-border shadow-xl z-20 overflow-hidden">
            <div className="py-1">
              <Link
                href={`/portfolio/${project._id}`}
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary transition-colors"
              >
                View Details
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={loading}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-error hover:bg-error/5 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
