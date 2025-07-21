/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, Edit3, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';
import { useProject } from '@/hooks/usePortfolio';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { project, loading } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'team' | 'reports' | 'files'>('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link href="/portfolio" className="text-blue-600 hover:text-blue-700">
          Back to Portfolio
        </Link>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/portfolio" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current mr-1"></div>
                {project.status === 'active' ? 'Active' : 
                 project.status === 'completed' ? 'Completed' : 
                 project.status === 'draft' ? 'Draft' : 'Paused'}
              </span>
            </div>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Project
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Impact Score */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Impact Score</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{project.impactScore}%</p>
              <p className="text-sm text-green-600">+5% from last month</p>
            </div>
            <div className="ml-4">
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Households Reached */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Households Reached</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{project.householdsReached.toLocaleString()}</p>
              <p className="text-sm text-green-600">+12% from target</p>
            </div>
            <div className="ml-4">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Budget Utilization</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{project.budget.percentage}%</p>
              <p className="text-sm text-gray-600">${project.budget.utilized.toLocaleString()} of ${project.budget.total.toLocaleString()}</p>
            </div>
            <div className="ml-4">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Active Agents */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Active Agents</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{project.activeAgents}</p>
              <p className="text-sm text-gray-600">Across {project.coverage} km²</p>
            </div>
            <div className="ml-4">
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'team', label: 'Team' },
            { id: 'reports', label: 'Reports' },
            { id: 'files', label: 'Files' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Progress</h3>
              <p className="text-sm text-gray-600 mb-6">Overall completion and milestone tracking</p>
              
              {/* Overall Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-black h-3 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Phases */}
              <div className="space-y-4">
                {project.phases.map((phase) => (
                  <div key={phase.id} className={`p-4 rounded-lg ${
                    phase.status === 'completed' ? 'bg-green-50' : 
                    phase.status === 'in_progress' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{phase.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {phase.status === 'completed' ? 'Completed' :
                         phase.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              phase.status === 'completed' ? 'bg-green-500' :
                              phase.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{phase.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">📍</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.region}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">📅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(project.timeline.startDate).toLocaleDateString()} - {new Date(project.timeline.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">💰</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">${project.budget.total.toLocaleString()} budget</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.reportCount} reports</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">📎</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.fileCount} attachments</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Impact Score</span>
                <span className="text-sm font-medium">{project.impactScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Households Reached</span>
                <span className="text-sm font-medium">{project.householdsReached.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coverage Area</span>
                <span className="text-sm font-medium">{project.coverage} km²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Agents</span>
                <span className="text-sm font-medium">{project.activeAgents}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Budget</span>
                <span className="text-sm font-medium">${project.budget.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Utilized</span>
                <span className="text-sm font-medium">${project.budget.utilized.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="text-sm font-medium">${(project.budget.total - project.budget.utilized).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Utilization Rate</span>
                <span className="text-sm font-medium">{project.budget.percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Lead */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {project.team.projectLead.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{project.team.projectLead.name}</p>
                <p className="text-sm text-gray-600">{project.team.projectLead.role}</p>
                <p className="text-sm text-gray-500">{project.team.projectLead.email}</p>
              </div>
            </div>

            {/* Field Coordinator */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {project.team.fieldCoordinator.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{project.team.fieldCoordinator.name}</p>
                <p className="text-sm text-gray-600">{project.team.fieldCoordinator.role}</p>
                <p className="text-sm text-gray-500">{project.team.fieldCoordinator.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Reports & Analytics</h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No reports available yet</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Generate Report
            </button>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">File Attachments</h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No files attached yet</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Upload Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}