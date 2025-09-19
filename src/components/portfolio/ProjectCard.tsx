'use client';

import { useState } from 'react';
import { Project, getStatusColor, getStatusDisplayName, getSectorDisplayName } from '@/types/portfolio';
import { 
  MoreHorizontal, 
  Calendar, 
  Users, 
  DollarSign, 
  Edit3,
  Eye,
  Copy,
  Trash2,
  Settings,
  BarChart3,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onRefetch: () => void;
}

export function ProjectCard({ project, onRefetch }: ProjectCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleNavigate = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.location.href = path;
    setShowDropdown(false);
  };

  const handleDuplicate = async () => {
    try {
      setLoading(true);
      onRefetch();
    } catch (error) {
      console.error('Error duplicating project:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      setLoading(true);
      onRefetch();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow relative flex flex-col h-full cursor-pointer group">
      <Link href={`/portfolio/${project._id}`} className="flex flex-col h-full">
        <div className="p-6 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 hover:text-[#5B94E5] transition-colors line-clamp-1 group-hover:text-[#5B94E5]">
                {project.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {project.description}
              </p>
            </div>

            <div className="relative ml-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors z-10"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={(e) => handleNavigate(`/portfolio/${project._id}`, e)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleNavigate(`/portfolio/${project._id}/analytics`, e)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <button
                      onClick={(e) => handleNavigate(`/portfolio/${project._id}/settings`, e)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`/portfolio/${project._id}`, '_blank');
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDuplicate();
                      }}
                      disabled={loading}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-left"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={loading}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status and Sector */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusDisplayName(project.status)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {getSectorDisplayName(project.sector)}
            </span>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-900">{project.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#5B94E5] h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-medium text-gray-500">Impact Score</p>
              <p className="text-xl font-semibold text-gray-900">{project.impactScore}%</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Households</p>
              <p className="text-xl font-semibold text-gray-900">
                {project.actualHouseholds?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>{formatBudget(project.totalBudget)} • {budgetUtilization}% utilized</span>
            </div>

            {project.teamMembers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                >
                  {tag.name}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                  +{project.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 mt-auto">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Updated {formatDate(project.updatedAt)}
            </div>
            <div className="text-xs text-gray-500">
              {project.createdBy?.firstName} {project.createdBy?.lastName}
            </div>
          </div>
        </div>
      </Link>

      {showDropdown && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}