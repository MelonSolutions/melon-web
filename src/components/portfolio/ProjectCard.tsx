'use client';

import { Project, getStatusColor, getStatusDisplayName, getSectorDisplayName } from '@/types/portfolio';
import { MoreHorizontal, Calendar, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onRefetch: () => void;
}

export function ProjectCard({ project }: ProjectCardProps) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/portfolio/${project._id}`}
              className="text-lg font-medium text-gray-900 hover:text-[#5B94E5] transition-colors line-clamp-1"
            >
              {project.title}
            </Link>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <button className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Updated {formatDate(project.updatedAt)}
          </div>
          <div className="text-xs text-gray-500">
            {project.createdBy?.firstName} {project.createdBy?.lastName}
          </div>
        </div>
      </div>
    </div>
  );
}