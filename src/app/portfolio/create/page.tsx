/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Upload, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useProjectActions } from '@/hooks/usePortfolio';
import { 
  CreateProjectRequest, 
  ProjectSector, 
  ProjectRegion, 
  FundingSource,
  getSectorDisplayName,
  getRegionDisplayName 
} from '@/types/portfolio';

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject, loading } = useProjectActions();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: '',
    description: '',
    sector: 'HEALTH',
    region: 'NORTHERN_REGION',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    targetHouseholds: 0,
    fundingSource: undefined,
    teamMembers: [],
    tags: [],
  });

  const sectors: { value: ProjectSector; label: string }[] = [
    { value: 'HEALTH', label: 'Health' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'ENERGY', label: 'Energy' },
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'ENVIRONMENT', label: 'Environment' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'SOCIAL_SERVICES', label: 'Social Services' },
    { value: 'ECONOMIC_DEVELOPMENT', label: 'Economic Development' },
  ];

  const regions: { value: ProjectRegion; label: string }[] = [
    { value: 'NORTHERN_REGION', label: 'Northern Region' },
    { value: 'SOUTHERN_REGION', label: 'Southern Region' },
    { value: 'EASTERN_REGION', label: 'Eastern Region' },
    { value: 'WESTERN_REGION', label: 'Western Region' },
    { value: 'CENTRAL_REGION', label: 'Central Region' },
    { value: 'NORTH_EAST', label: 'North East' },
    { value: 'NORTH_WEST', label: 'North West' },
    { value: 'SOUTH_EAST', label: 'South East' },
    { value: 'SOUTH_WEST', label: 'South West' },
  ];

  const fundingSources: { value: FundingSource; label: string }[] = [
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'PRIVATE_FOUNDATION', label: 'Private Foundation' },
    { value: 'INTERNATIONAL_DONOR', label: 'International Donor' },
    { value: 'CORPORATE_SPONSOR', label: 'Corporate Sponsor' },
    { value: 'CROWDFUNDING', label: 'Crowdfunding' },
    { value: 'BANK_LOAN', label: 'Bank Loan' },
    { value: 'VENTURE_CAPITAL', label: 'Venture Capital' },
    { value: 'GRANT', label: 'Grant' },
    { value: 'INTERNAL_FUNDING', label: 'Internal Funding' },
    { value: 'MIXED_FUNDING', label: 'Mixed Funding' },
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setFormData(prev => ({ 
        ...prev, 
        tags: updatedTags.map(name => ({ name, color: '#3B82F6' }))
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setFormData(prev => ({ 
      ...prev, 
      tags: updatedTags.map(name => ({ name, color: '#3B82F6' }))
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      // Validation
      if (!formData.title.trim()) {
        alert('Please enter a project title');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        alert('Please select start and end dates');
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        alert('End date must be after start date');
        return;
      }

      if (formData.totalBudget <= 0) {
        alert('Please enter a valid budget amount');
        return;
      }

      const projectData: CreateProjectRequest = {
        ...formData,
        status: isDraft ? 'DRAFT' : 'ACTIVE',
        progressPercentage: 0,
        impactScore: 0,
        spentBudget: 0,
        actualHouseholds: 0,
      };
      
      const result = await createProject(projectData);
      
      if (result) {
        router.push(`/portfolio/${result._id}?created=true`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portfolio" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Create New Project</h1>
              <p className="text-sm text-gray-500">Set up a new project for your portfolio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/portfolio')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Project
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Describe your project objectives and scope"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value as ProjectSector }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors"
                  required
                >
                  {sectors.map(sector => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as ProjectRegion }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors"
                  required
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Resources */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Budget & Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Budget *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={formData.totalBudget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: Number(e.target.value) }))}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  placeholder="Enter total budget"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Households
              </label>
              <input
                type="number"
                value={formData.targetHouseholds || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetHouseholds: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Number of households"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Area (km²)
              </label>
              <input
                type="number"
                value={formData.coverageArea || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coverageArea: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Coverage area in km²"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Source
              </label>
              <select
                value={formData.fundingSource || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fundingSource: e.target.value as FundingSource }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors"
              >
                <option value="">Select funding source</option>
                {fundingSources.map(source => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Specific location or address"
              />
            </div>
          </div>
        </div>

        {/* Project Goals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Project Goals</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectives
              </label>
              <textarea
                value={formData.objectives?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  objectives: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Enter project objectives (one per line)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter each objective on a new line</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Outcomes
              </label>
              <textarea
                value={formData.expectedOutcomes?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expectedOutcomes: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Enter expected outcomes (one per line)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter each expected outcome on a new line</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potential Risks
              </label>
              <textarea
                value={formData.risks?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  risks: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Enter potential risks (one per line)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter each risk on a new line</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Any additional notes or comments"
              />
            </div>
          </div>
        </div>

        {/* Tags & Classification */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Tags & Classification</h2>
          
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-[#4A7BC8] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Team Members</h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Add team members who will be working on this project. You can add their contact information and role details.
            </p>
            
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">Team member management coming soon</p>
              <p className="text-xs text-gray-400">You&rsquo;ll be able to add team members after creating the project</p>
            </div>
          </div>
        </div>

        {/* File Attachments */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">File Attachments</h2>
          <p className="text-sm text-gray-500 mb-6">Upload project documents, images, and other files</p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">File attachments coming soon</p>
            <p className="text-xs text-gray-500">You&rsquo;ll be able to upload files after creating the project</p>
          </div>
        </div>
      </div>
    </div>
  );
}