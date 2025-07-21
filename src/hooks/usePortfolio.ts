'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProjects, getPortfolioStats, getProject } from '@/lib/api/portfolio';
import { Project, PortfolioStats, PortfolioFilters } from '@/types/portfolio';

export function usePortfolio(filters: PortfolioFilters = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalReach: 0,
    coverageArea: 0,
    avgImpactScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsData, statsData] = await Promise.all([
        getProjects(filters),
        getPortfolioStats(),
      ]);

      setProjects(projectsData.data || projectsData);
      setPortfolioStats(statsData);

      // Handle pagination if present
      if (projectsData.pagination) {
        setPagination(projectsData.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const refetch = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    portfolioStats,
    loading,
    error,
    pagination,
    refetch,
  };
}

// Hook for single project
export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const projectData = await getProject(id);
      setProject(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const refetch = useCallback(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refetch,
  };
}