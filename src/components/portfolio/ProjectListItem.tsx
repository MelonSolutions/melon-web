'use client';

import { Project, getStatusColor, getStatusDisplayName, getSectorDisplayName } from '@/types/portfolio';
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

  const budgetUtilization = project.totalBudget > 0 
    ? Math.round((project.spentBudget / project.totalBudget) * 100) 
    : 0;

  return (
    <tr className="hover:bg-surface-secondary/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-start">
          <div className="min-w-0 flex-1">
            <Link
              href={`/portfolio/${project._id}`}
              className="text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
            >
              {project.title}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md mt-1 italic font-medium">
              {project.description}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-secondary text-gray-600 dark:text-gray-400 border border-border">
                {getSectorDisplayName(project.sector)}
              </span>
              {project.tags.length > 0 && (
                <>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-secondary text-gray-600 dark:text-gray-400 border border-border">
                    {project.tags[0].name}
                  </span>
                  {project.tags.length > 1 && (
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500">
                      +{project.tags.length - 1}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
          {getStatusDisplayName(project.status)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-20 bg-surface-secondary rounded-full h-1.5 border border-border/50">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-900 dark:text-gray-100 font-bold w-8">{project.progressPercentage}%</span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{project.impactScore}%</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {project.actualHouseholds?.toLocaleString() || '0'}
        </div>
        {project.targetHouseholds && (
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
            of {project.targetHouseholds.toLocaleString()}
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {formatBudget(project.totalBudget)}
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {budgetUtilization}% used
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatDate(project.updatedAt)}</div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {project.createdBy?.firstName} {project.createdBy?.lastName}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <Link
          href={`/portfolio/${project._id}`}
          className="inline-flex items-center px-4 py-2 bg-surface-secondary hover:bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg border border-border transition-all"
        >
          View Details
        </Link>
      </td>
    </tr>
  );
}
