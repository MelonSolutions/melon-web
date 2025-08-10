'use client';

import { Project } from '@/types/portfolio';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onRefetch: () => void;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'draft':
        return 'Draft';
      case 'paused':
        return 'Paused';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/portfolio/${project._id}`}
              className="text-base font-medium text-gray-900 hover:text-[#5B94E5] transition-colors"
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
        <div className="flex gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {project.sector}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#5B94E5] h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Impact Score</p>
            <p className="text-lg font-semibold text-gray-900">{project.impactScore}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Households</p>
            <p className="text-lg font-semibold text-gray-900">{project.householdsReached.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Agents</p>
            <p className="text-lg font-semibold text-gray-900">{project.activeAgents}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Coverage</p>
            <p className="text-lg font-semibold text-gray-900">{project.coverage} km²</p>
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">{project.region}</p>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                {tag}
              </span>
            ))}
            {project.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                +{project.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500 gap-4">
            <span>{project.reportCount} reports</span>
            <span>{project.fileCount} files</span>
          </div>
          <span className="text-xs text-gray-500">{project.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}