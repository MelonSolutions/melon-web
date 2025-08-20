'use client';

import { Project, getStatusColor, getStatusDisplayName, getSectorDisplayName } from '@/types/portfolio';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface ProjectListItemProps {
  project: Project;
  onRefetch: () => void;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
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

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-start">
          <div className="min-w-0 flex-1">
            <Link
              href={`/portfolio/${project._id}`}
              className="text-sm font-medium text-gray-900 hover:text-[#5B94E5] transition-colors"
            >
              {project.title}
            </Link>
            <p className="text-sm text-gray-500 truncate max-w-md mt-1">
              {project.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {getSectorDisplayName(project.sector)}
              </span>
              {project.tags.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                  {project.tags[0].name}
                </span>
              )}
              {project.tags.length > 1 && (
                <span className="text-xs text-gray-500">
                  +{project.tags.length - 1} more
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {getStatusDisplayName(project.status)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
            <div
              className="bg-[#5B94E5] h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-900 font-medium">{project.progressPercentage}%</span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{project.impactScore}%</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {project.actualHouseholds?.toLocaleString() || '0'}
        </div>
        {project.targetHouseholds && (
          <div className="text-xs text-gray-500">
            of {project.targetHouseholds.toLocaleString()} target
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatBudget(project.totalBudget)}
        </div>
        <div className="text-xs text-gray-500">
          {Math.round((project.spentBudget / project.totalBudget) * 100)}% used
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(project.updatedAt)}</div>
        <div className="text-xs text-gray-500">
          by {project.createdBy?.firstName} {project.createdBy?.lastName}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}