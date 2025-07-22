'use client';

import { X, Eye, BarChart3 } from 'lucide-react';
import { ProjectLocation } from '@/types/geospatial';
import { getNearbyProjects } from '@/lib/api/geospatial-mock';

interface ProjectDetailsPanelProps {
  project: ProjectLocation | null;
  onClose: () => void;
}

export function ProjectDetailsPanel({ project, onClose }: ProjectDetailsPanelProps) {
  if (!project) return null;

  const nearbyProjects = getNearbyProjects(project.id);

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{project.title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">Project Details & Metrics</p>
        
        <div className="flex items-center space-x-2 mb-4">
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Location & Coverage */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {project.lat.toFixed(4)}°N
              </p>
              <p className="text-sm font-medium text-gray-900">
                {project.lng.toFixed(4)}°E
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Coverage</p>
              <p className="text-sm font-medium text-gray-900">{project.coverage} km²</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Beneficiaries</p>
              <p className="text-lg font-bold text-gray-900">{project.beneficiaries.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Active Agents</p>
              <p className="text-lg font-bold text-gray-900">{project.activeAgents}</p>
            </div>
          </div>
          
          {/* Impact Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Impact Score</span>
              <span className="text-lg font-bold text-gray-900">{project.impactScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.impactScore}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
            <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Phases */}
        {project.phases && project.phases.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Project Progress</h3>
            <div className="space-y-3">
              {project.phases.map((phase) => (
                <div key={phase.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      phase.status === 'completed' ? 'bg-green-500' :
                      phase.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-900">{phase.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{phase.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Projects */}
        {nearbyProjects.length > 0 && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Nearby Projects</h3>
            <p className="text-xs text-gray-600 mb-4">Projects in the same region</p>
            
            <div className="space-y-3">
              {nearbyProjects.map((nearby) => (
                <div key={nearby.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${
                      nearby.sector === 'Health' ? 'bg-red-500' :
                      nearby.sector === 'Energy' ? 'bg-yellow-500' :
                      nearby.sector === 'Finance' ? 'bg-green-500' :
                      nearby.sector === 'Education' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{nearby.title}</p>
                      <p className="text-xs text-gray-500">{nearby.sector}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">{nearby.distance} km</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}