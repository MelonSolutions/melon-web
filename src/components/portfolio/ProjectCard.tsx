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
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all relative group">
      <Link href={`/portfolio/${project._id}`} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#5B94E5] transition-colors line-clamp-1 mb-1">
              {project.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
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
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusDisplayName(project.status)}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {getSectorDisplayName(project.sector)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-semibold text-gray-900">{project.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-[#5B94E5] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Impact Score</p>
            <p className="text-lg font-semibold text-gray-900">{project.impactScore}%</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Households</p>
            <p className="text-lg font-semibold text-gray-900">
              {project.actualHouseholds?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatBudget(project.totalBudget)} • {budgetUtilization}% used</span>
          </div>

          {project.teamMembers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
              >
                {tag.name}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-500">
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
          <div className="absolute right-6 top-16 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
            <div className="py-1">
              <Link
                href={`/portfolio/${project._id}`}
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
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
