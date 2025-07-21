'use client';

import { Project } from '@/types/portfolio';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface ProjectListItemProps {
  project: Project;
  onRefetch: () => void;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
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
    <tr className="hover:bg-gray-50">
      {/* Project */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="min-w-0 flex-1">
            <Link 
              href={`/portfolio/${project._id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {project.title}
            </Link>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {project.description}
            </p>
            <div className="flex gap-1 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSectorColor(project.sector)}`}>
                {project.sector}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current mr-1"></div>
          {project.status === 'active' ? 'Active' : 
           project.status === 'completed' ? 'Completed' : 
           project.status === 'draft' ? 'Draft' : 'Paused'}
        </span>
      </td>

      {/* Progress */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
            <div 
              className="bg-black h-2 rounded-full"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-900 font-medium">{project.progress}%</span>
        </div>
      </td>

      {/* Impact Score */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="font-medium">{project.impactScore}%</span>
      </td>

      {/* Households */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="font-medium">{project.householdsReached.toLocaleString()}</span>
      </td>

      {/* Updated */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {project.lastUpdated}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}