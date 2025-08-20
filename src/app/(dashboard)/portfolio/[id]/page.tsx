/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, Edit3, Calendar, DollarSign, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useProject } from '@/hooks/usePortfolio';
import { getStatusColor, getStatusDisplayName, getSectorDisplayName, getRegionDisplayName } from '@/types/portfolio';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { project, loading, error } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'team' | 'timeline' | 'files'>('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B94E5]"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-500 mb-4">{error || 'The project you are looking for does not exist.'}</p>
        <Link href="/portfolio" className="text-[#5B94E5] hover:text-[#4A7BC8] text-sm font-medium">
          Back to Portfolio
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  const householdProgress = project.targetHouseholds && project.targetHouseholds > 0
    ? Math.round(((project.actualHouseholds || 0) / project.targetHouseholds) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portfolio" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusDisplayName(project.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors">
            <Edit3 className="w-4 h-4" />
            Edit Project
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Impact Score</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{project.impactScore}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.impactScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Households Reached</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{(project.actualHouseholds || 0).toLocaleString()}</p>
          {project.targetHouseholds && (
            <>
              <p className="text-sm text-gray-500 mt-1">of {project.targetHouseholds.toLocaleString()} target</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(householdProgress, 100)}%` }}
                />
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{budgetUtilization}%</p>
          <p className="text-sm text-gray-500 mt-1">{formatBudget(project.spentBudget)} of {formatBudget(project.totalBudget)}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                budgetUtilization > 90 ? 'bg-red-500' : budgetUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Progress</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{project.progressPercentage}%</p>
          <p className="text-sm text-gray-500 mt-1">Overall completion</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-[#5B94E5] h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progressPercentage}%` }}
            />
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
            { id: 'timeline', label: 'Timeline' },
            { id: 'files', label: 'Files' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[#5B94E5] text-[#5B94E5]'
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
          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Project Details</h3>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Timeline</p>
                      <p className="text-sm text-gray-500">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Region</p>
                      <p className="text-sm text-gray-500">{getRegionDisplayName(project.region)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Budget</p>
                      <p className="text-sm text-gray-500">{formatBudget(project.totalBudget)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Team Size</p>
                      <p className="text-sm text-gray-500">{project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                {project.objectives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Objectives</h4>
                    <ul className="space-y-2">
                      {project.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#5B94E5] rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expected Outcomes */}
                {project.expectedOutcomes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Expected Outcomes</h4>
                    <ul className="space-y-2">
                      {project.expectedOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Information Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Project Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Sector</p>
                  <p className="text-sm text-gray-900 mt-1">{getSectorDisplayName(project.sector)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Funding Source</p>
                  <p className="text-sm text-gray-900 mt-1">{project.fundingSource || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Coverage Area</p>
                  <p className="text-sm text-gray-900 mt-1">{project.coverageArea ? `${project.coverageArea} km²` : 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Created By</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {project.createdBy?.firstName} {project.createdBy?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(project.updatedAt)}</p>
                </div>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-500 mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Team Members</h3>
          
          {project.teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-[#5B94E5] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    {member.email && (
                      <p className="text-sm text-gray-500">{member.email}</p>
                    )}
                    {member.responsibilities && (
                      <p className="text-xs text-gray-500 mt-1">{member.responsibilities}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No team members assigned yet</p>
            </div>
          )}
        </div>
      )}

      {['metrics', 'timeline', 'files'].includes(activeTab) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {activeTab === 'metrics' && 'Detailed Metrics'}
            {activeTab === 'timeline' && 'Project Timeline'}
            {activeTab === 'files' && 'File Attachments'}
          </h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {activeTab === 'metrics' && 'Detailed metrics and analytics coming soon'}
              {activeTab === 'timeline' && 'Project timeline and milestones coming soon'}
              {activeTab === 'files' && 'No files attached yet'}
            </p>
            <button className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors">
              {activeTab === 'files' ? 'Upload Files' : 'Learn More'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}