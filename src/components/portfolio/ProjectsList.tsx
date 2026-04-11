'use client';

import { Project } from '@/types/portfolio';
import { ProjectCard } from './ProjectCard';
import { ProjectListItem } from './ProjectListItem';

interface ProjectsListProps {
  projects: Project[];
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function ProjectsList({ projects, view, onRefetch }: ProjectsListProps) {
  if (view === 'list') {
    return (
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-secondary/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Impact
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Reach
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Budget
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Updated
                </th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {projects.map((project) => (
                <ProjectListItem
                  key={project._id}
                  project={project}
                  onRefetch={onRefetch}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onRefetch={onRefetch}
        />
      ))}
    </div>
  );
}
