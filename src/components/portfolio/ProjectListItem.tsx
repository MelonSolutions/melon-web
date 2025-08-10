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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="min-w-0 flex-1">
            <Link 
              href={`/portfolio/${project._id}`}
              className="text-sm font-medium text-gray-900 hover:text-[#5B94E5] transition-colors"
            >
              {project.title}
            </Link>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {project.description}
            </p>
            <div className="flex gap-1 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {project.sector}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
            <div 
              className="bg-[#5B94E5] h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-900 font-medium">{project.progress}%</span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {project.impactScore}%
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {project.householdsReached.toLocaleString()}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {project.lastUpdated}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}