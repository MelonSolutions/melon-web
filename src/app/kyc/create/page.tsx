'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createKYCUser, ApiError } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface CreateKYCFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetNumber: string;
  streetName: string;
  landmark: string;
  city: string;
  lga: string;
  state: string;
  country: string;
}

export default function AddKYCUserPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<CreateKYCFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetNumber: '',
    streetName: '',
    landmark: '',
    city: '',
    lga: '',
    state: '',
    country: 'Nigeria',
  });

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
    },
    onSubmit: async () => {
      // Handled in handleSave
    }
  });

  const handleSave = async () => {
    try {
      await handleSubmit(formData);
      
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        streetNumber: formData.streetNumber || undefined,
        streetName: formData.streetName || undefined,
        landmark: formData.landmark || undefined,
        city: formData.city || undefined,
        lga: formData.lga || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
      };
      
      const result = await createKYCUser(requestData);
      
      addToast({
        type: 'success',
        title: 'Request Created',
        message: 'The verification request has been created and will be sent to nearby agents.',
      });
      
      router.push(`/kyc/${result._id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'DUPLICATE_USER' || error.message.includes('already exists')) {
          addToast({
            type: 'error',
            title: 'User Already Exists',
            message: 'A user with this email already exists in your organization.',
          });
        } else if (error.status === 403) {
          addToast({
            type: 'error',
            title: 'Permission Denied',
            message: 'You do not have permission to create a new request.',
          });
        } else if (error.status >= 500) {
          addToast({
            type: 'error',
            title: 'Server Error',
            message: 'Something went wrong. Please try again.',
          });
        } else {
          addToast({
            type: 'error',
            title: 'Failed to Create Request',
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

  const handleFieldUpdate = (field: keyof CreateKYCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    handleFieldChange(field, value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/kyc" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Create Verification Request</h1>
              <p className="text-sm text-gray-500">Enter customer details for address verification</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/kyc">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button 
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
            >
              Create Request
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => handleFieldUpdate('firstName', e.target.value)}
                onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                error={getFieldError('firstName')}
                placeholder="Enter first name"
              />

              <Input
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => handleFieldUpdate('lastName', e.target.value)}
                onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                error={getFieldError('lastName')}
                placeholder="Enter last name"
              />

              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleFieldUpdate('email', e.target.value)}
                onBlur={(e) => handleFieldBlur('email', e.target.value)}
                error={getFieldError('email')}
                placeholder="user@example.com"
              />

              <Input
                label="Phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleFieldUpdate('phone', e.target.value)}
                onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                error={getFieldError('phone')}
                placeholder="+234xxxxxxxxxx"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Enter the address details below. GPS coordinates will be automatically generated from the address and sent to nearby agents for verification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Street Number"
                  value={formData.streetNumber}
                  onChange={(e) => handleFieldUpdate('streetNumber', e.target.value)}
                  placeholder="e.g., 45"
                />

                <Input
                  label="Street Name"
                  value={formData.streetName}
                  onChange={(e) => handleFieldUpdate('streetName', e.target.value)}
                  placeholder="e.g., Adeniran Ogunsanya"
                />
              </div>

              <Input
                label="Landmark or Nearest Bus Stop"
                value={formData.landmark}
                onChange={(e) => handleFieldUpdate('landmark', e.target.value)}
                placeholder="e.g., Opposite Shoprite"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="City/Town"
                  value={formData.city}
                  onChange={(e) => handleFieldUpdate('city', e.target.value)}
                  placeholder="e.g., Surulere"
                />

                <Input
                  label="LGA"
                  value={formData.lga}
                  onChange={(e) => handleFieldUpdate('lga', e.target.value)}
                  placeholder="e.g., Surulere"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleFieldUpdate('state', e.target.value)}
                  placeholder="e.g., Lagos"
                />

                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleFieldUpdate('country', e.target.value)}
                  placeholder="e.g., Nigeria"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
