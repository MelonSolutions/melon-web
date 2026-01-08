/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  UserPlus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { createKYCUser, verifyIdentity, ApiError } from '@/lib/api/kyc';
import { 
  CreateKYCUserRequest, 
  IdentityType,
  IDENTITY_TYPE_DISPLAY_NAMES
} from '@/types/kyc';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { useFormValidation } from '@/hooks/useFormValidation';

export default function AddKYCUserPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<CreateKYCUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityType: 'NIN',
    identityNumber: '',
    address: '',
    city: '',
    state: '',
  });

  const [verifyingIdentity, setVerifyingIdentity] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);

  const identityTypes: IdentityType[] = [
    'NIN',
    'BVN',
    'VOTER_CARD',
    'DRIVERS_LICENSE',
    'PASSPORT',
  ];

  // Form validation
  const { handleSubmit, isSubmitting, getFieldError, handleFieldChange, handleFieldBlur } = useFormValidation({
    schema: {
      firstName: { 
        required: true, 
        minLength: 2, 
        maxLength: 50 
      },
      lastName: { 
        required: true, 
        minLength: 2, 
        maxLength: 50 
      },
      email: { 
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      phone: { 
        required: true,
        pattern: /^\+?[1-9]\d{1,14}$/
      },
      identityNumber: { 
        required: true,
        minLength: 8,
        maxLength: 20
      },
    },
    onSubmit: async (data) => {
      // This will be called by handleSave
    }
  });

  const handleSave = async () => {
    try {
      await handleSubmit(formData);
      
      const result = await createKYCUser(formData);
      
      addToast({
        type: 'success',
        title: 'User Added!',
        message: 'The user has been added to KYC verification.',
      });
      
      router.push(`/kyc/${result._id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'DUPLICATE_USER' || error.message.includes('already exists')) {
          addToast({
            type: 'error',
            title: 'User Already Exists',
            message: 'A user with this email or identity number already exists.',
          });
        } else if (error.status === 403) {
          addToast({
            type: 'error',
            title: 'Permission Denied',
            message: 'You do not have permission to add users.',
          });
        } else if (error.status >= 500) {
          addToast({
            type: 'error',
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again in a moment.',
          });
        } else {
          addToast({
            type: 'error',
            title: 'Failed to Add User',
            message: error.message,
          });
        }
      } else {
        addToast({
          type: 'error',
          title: 'Unexpected Error',
          message: 'Something went wrong. Please try again.',
        });
      }
    }
  };

  const handleVerifyIdentity = async () => {
    if (!formData.identityNumber || !formData.firstName || !formData.lastName) {
      addToast({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in name and identity number before verifying.',
      });
      return;
    }

    try {
      setVerifyingIdentity(true);
      const result = await verifyIdentity({
        identityType: formData.identityType,
        identityNumber: formData.identityNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (result.verified) {
        setIdentityVerified(true);
        
        // Auto-fill data if available
        if (result.data) {
          setFormData(prev => ({
            ...prev,
            ...(result.data?.phone && { phone: result.data.phone }),
            ...(result.data?.email && { email: result.data.email }),
          }));
        }
        
        addToast({
          type: 'success',
          title: 'Identity Verified',
          message: 'The identity has been verified successfully.',
        });
      } else {
        setIdentityVerified(false);
        addToast({
          type: 'warning',
          title: 'Verification Failed',
          message: result.message || 'Could not verify identity with external API.',
        });
      }
    } catch (error) {
      setIdentityVerified(false);
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Verification Error',
          message: error.message,
        });
      }
    } finally {
      setVerifyingIdentity(false);
    }
  };

  const handleFieldUpdate = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    handleFieldChange(field, value);
    
    // Reset identity verification if identity details change
    if (field === 'identityType' || field === 'identityNumber') {
      setIdentityVerified(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/kyc" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-900">Add New User</h1>
              <p className="text-sm text-gray-500">Enter user details for KYC verification</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/kyc"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add User
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="First Name" 
                required 
                error={getFieldError('firstName')}
              >
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleFieldUpdate('firstName', e.target.value)}
                  onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors ${
                    getFieldError('firstName') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
              </FormField>

              <FormField 
                label="Last Name" 
                required 
                error={getFieldError('lastName')}
              >
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleFieldUpdate('lastName', e.target.value)}
                  onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors ${
                    getFieldError('lastName') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
              </FormField>

              <FormField 
                label="Email" 
                required 
                error={getFieldError('email')}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleFieldUpdate('email', e.target.value)}
                  onBlur={(e) => handleFieldBlur('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors ${
                    getFieldError('email') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
              </FormField>

              <FormField 
                label="Phone" 
                required 
                error={getFieldError('phone')}
              >
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleFieldUpdate('phone', e.target.value)}
                  onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors ${
                    getFieldError('phone') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+234xxxxxxxxxx"
                />
              </FormField>
            </div>
          </div>

          {/* Identity Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Identity Verification
              </h2>
              {identityVerified && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Identity Type" required>
                  <select
                    value={formData.identityType}
                    onChange={(e) => handleFieldUpdate('identityType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  >
                    {identityTypes.map(type => (
                      <option key={type} value={type}>
                        {IDENTITY_TYPE_DISPLAY_NAMES[type]}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField 
                  label="Identity Number" 
                  required 
                  error={getFieldError('identityNumber')}
                >
                  <input
                    type="text"
                    name="identityNumber"
                    value={formData.identityNumber}
                    onChange={(e) => handleFieldUpdate('identityNumber', e.target.value)}
                    onBlur={(e) => handleFieldBlur('identityNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors ${
                      getFieldError('identityNumber') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter identity number"
                  />
                </FormField>
              </div>

              <button
                onClick={handleVerifyIdentity}
                disabled={verifyingIdentity || !formData.identityNumber}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#5B94E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {verifyingIdentity ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying with API...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Verify Identity with {formData.identityType} API
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Address Information
            </h2>
            
            <div className="space-y-4">
              <FormField label="Address">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFieldUpdate('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  placeholder="Enter street address"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="City">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldUpdate('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                    placeholder="Enter city"
                  />
                </FormField>

                <FormField label="State">
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleFieldUpdate('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                    placeholder="Enter state"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">What happens next?</h4>
                <p className="text-sm text-blue-700">
                  After adding the user, you can upload their documents and track the verification process. 
                  The system will maintain an audit trail of all changes for compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
