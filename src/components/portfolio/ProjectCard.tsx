'use client';

import { Project } from '@/types/portfolio';
import { MoreHorizontal, MapPin, FileText, Paperclip } from 'lucide-react';
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

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'Health':
        return 'bg-red-100 text-red-800';
      case 'Education':
        return 'bg-purple-100 text-purple-800';
      case 'Agriculture':
        return 'bg-orange-100 text-orange-800';
      case 'Energy':
        return 'bg-yellow-100 text-yellow-800';
      case 'Finance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <Link 
            href={`/portfolio/${project._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {project.title}
          </Link>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {project.description}
          </p>
        </div>
        <button className="ml-2 p-1 text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Status and Sector Tags */}
      <div className="flex gap-2 mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current mr-1"></div>
          {project.status === 'active' ? 'Active' : 
           project.status === 'completed' ? 'Completed' : 
           project.status === 'draft' ? 'Draft' : 'Paused'}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSectorColor(project.sector)}`}>
          {project.sector}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-black h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Impact Score</p>
          <p className="text-lg font-bold text-gray-900">{project.impactScore}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Households</p>
          <p className="text-lg font-bold text-gray-900">{project.householdsReached.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Active Agents</p>
          <p className="text-lg font-bold text-gray-900">{project.activeAgents}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Coverage</p>
          <p className="text-lg font-bold text-gray-900">{project.coverage} km²</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center justify-center mb-4 text-gray-500">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="text-sm">{project.region}</span>
      </div>

      {/* Tags */}
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            {project.reportCount} reports
          </div>
          <div className="flex items-center">
            <Paperclip className="w-4 h-4 mr-1" />
            {project.fileCount} files
          </div>
        </div>
        <span className="text-xs text-gray-500">Updated {project.lastUpdated}</span>
      </div>
    </div>
  );
}