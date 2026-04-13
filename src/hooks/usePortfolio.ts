/* eslint-disable @typescript-eslint/no-unused-vars */
// src/hooks/usePortfolio.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProjects,
  getPortfolioStats,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject
} from '@/lib/api/portfolio';
import {
  getReportsByProject,
  getUnlinkedReports,
  linkReportToProject,
  unlinkReportFromProject,
} from '@/lib/api/reports';
import { 
  Project, 
  PortfolioStats, 
  PortfolioFilters, 
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedResponse 
} from '@/types/portfolio';

// Main portfolio hook
export function usePortfolio(filters: PortfolioFilters = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalReach: '0',
    coverageArea: '0',
    avgImpactScore: '0%',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both projects and stats in parallel
      const [projectsResponse, statsData] = await Promise.all([
        getProjects({
          ...filters,
          pageSize: filters.pageSize || 10,
          currentPage: filters.currentPage || 1,
        }),
        getPortfolioStats(),
      ]);

      setProjects(projectsResponse.data);
      setPortfolioStats(statsData);
      
      if (projectsResponse.pagination) {
        setPagination(projectsResponse.pagination);
      }
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    projects,
    portfolioStats,
    loading,
    error,
    pagination,
    refetch,
  };
}

// Single project hook
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
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
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

// Project actions hook
export function useProjectActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewProject = useCallback(async (data: CreateProjectRequest): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);

      const project = await createProject(data);
      return project;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingProject = useCallback(async (id: string, data: UpdateProjectRequest): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);

      const project = await updateProject(id, data);
      return project;
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateExistingProject = useCallback(async (id: string): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);

      const project = await duplicateProject(id);
      return project;
    } catch (err) {
      console.error('Error duplicating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate project');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExistingProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await deleteProject(id);
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createProject: createNewProject,
    updateProject: updateExistingProject,
    duplicateProject: duplicateExistingProject,
    deleteProject: deleteExistingProject,
  };
}

// Project reports hook
export function useProjectReports(projectId: string) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const reportsData = await getReportsByProject(projectId);
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching project reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const refetch = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    refetch,
  };
}

// Unlinked reports hook
export function useUnlinkedReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnlinkedReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const reportsData = await getUnlinkedReports();
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching unlinked reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load unlinked reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchUnlinkedReports();
  }, [fetchUnlinkedReports]);

  return {
    reports,
    loading,
    error,
    fetch: fetchUnlinkedReports,
    refetch,
  };
}

// Project report actions hook
export function useProjectReportActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkReport = useCallback(async (reportId: string, projectId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await linkReportToProject(reportId, projectId);
      return true;
    } catch (err) {
      console.error('Error linking report to project:', err);
      setError(err instanceof Error ? err.message : 'Failed to link report');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unlinkReport = useCallback(async (reportId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await unlinkReportFromProject(reportId);
      return true;
    } catch (err) {
      console.error('Error unlinking report from project:', err);
      setError(err instanceof Error ? err.message : 'Failed to unlink report');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    linkReport,
    unlinkReport,
  };
}