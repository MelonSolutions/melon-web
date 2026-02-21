/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createKYCUser, ApiError } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface AddressData {
  id: string;
  label: string;
  streetNumber: string;
  streetName: string;
  landmark: string;
  city: string;
  lga: string;
  state: string;
  country: string;
}

interface CreateKYCFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bvn: string;
  nin: string;
  passportNumber: string;
  addresses: AddressData[];
}

const ADDRESS_LABELS = [
  'Home Address',
  'Work Address',
  'Guarantor 1 - Home',
  'Guarantor 1 - Work',
  'Guarantor 2 - Home',
  'Guarantor 2 - Work',
  'Other',
];

const createEmptyAddress = (index: number): AddressData => ({
  id: `address-${Date.now()}-${index}`,
  label: index === 0 ? 'Home Address' : ADDRESS_LABELS[index] || 'Other',
  streetNumber: '',
  streetName: '',
  landmark: '',
  city: '',
  lga: '',
  state: '',
  country: 'Nigeria',
});

export default function AddKYCUserPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateKYCFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bvn: '',
    nin: '',
    passportNumber: '',
    addresses: [createEmptyAddress(0)],
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

  const handleAddAddress = () => {
    if (formData.addresses.length >= 5) {
      addToast({
        type: 'warning',
        title: 'Maximum Addresses Reached',
        message: 'You can add up to 5 addresses per verification request.',
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, createEmptyAddress(prev.addresses.length)],
    }));
  };

  const handleRemoveAddress = (addressId: string) => {
    if (formData.addresses.length === 1) {
      addToast({
        type: 'error',
        title: 'Cannot Remove',
        message: 'At least one address is required.',
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== addressId),
    }));
  };

  const handleAddressFieldUpdate = (addressId: string, field: keyof AddressData, value: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr => 
        addr.id === addressId ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  const handleSave = async () => {
    if (creating) return;
    
    try {
      setCreating(true);
      await handleSubmit(formData);

      const hasValidAddress = formData.addresses.some(addr => 
        addr.city || addr.state || addr.streetName
      );

      if (!hasValidAddress) {
        addToast({
          type: 'error',
          title: 'Address Required',
          message: 'Please provide at least one address with city, state, or street name.',
        });
        setCreating(false);
        return;
      }
      
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        bvn: formData.bvn || undefined,
        nin: formData.nin || undefined,
        passportNumber: formData.passportNumber || undefined,
        addresses: formData.addresses.map(addr => ({
          label: addr.label,
          streetNumber: addr.streetNumber || undefined,
          streetName: addr.streetName || undefined,
          landmark: addr.landmark || undefined,
          city: addr.city || undefined,
          lga: addr.lga || undefined,
          state: addr.state || undefined,
          country: addr.country || undefined,
        })),
      };
      
      const result = await createKYCUser(requestData);
      
      addToast({
        type: 'success',
        title: 'Request Created',
        message: `Verification request created with ${formData.addresses.length} address${formData.addresses.length > 1 ? 'es' : ''}.`,
      });
      
      router.push(`/kyc/${result._id}`);
    } catch (error) {
      setCreating(false);
      
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

  const handleFieldUpdate = (field: keyof Omit<CreateKYCFormData, 'addresses'>, value: string) => {
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
              loading={creating}
              disabled={creating}
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

              <Input
                label="BVN (Optional)"
                value={formData.bvn}
                onChange={(e) => handleFieldUpdate('bvn', e.target.value)}
                placeholder="Enter Bank Verification Number"
                maxLength={11}
              />

              <Input
                label="NIN (Optional)"
                value={formData.nin}
                onChange={(e) => handleFieldUpdate('nin', e.target.value)}
                placeholder="Enter National ID Number"
                maxLength={11}
              />

              <Input
                label="Passport Number (Optional)"
                value={formData.passportNumber}
                onChange={(e) => handleFieldUpdate('passportNumber', e.target.value)}
                placeholder="Enter Passport Number"
              />
            </div>
          </CardContent>
        </Card>

        {formData.addresses.map((address, index) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Address {index + 1}
                  {index === 0 && <span className="text-sm font-normal text-gray-500 ml-2">(Required)</span>}
                </CardTitle>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAddress(address.id)}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {index === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Enter address details. GPS coordinates will be automatically generated and sent to nearby agents for verification.
                      {formData.addresses.length > 1 && ' Each address will be assigned to agents in its respective location.'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Label
                    </label>
                    <CustomSelect
                      value={address.label}
                      onChange={(value) => handleAddressFieldUpdate(address.id, 'label', value)}
                      options={ADDRESS_LABELS.map(label => ({
                        value: label,
                        label: label
                      }))}
                      placeholder="Select address type"
                    />
                  </div>
                  <Input
                    label="Street Number"
                    value={address.streetNumber}
                    onChange={(e) => handleAddressFieldUpdate(address.id, 'streetNumber', e.target.value)}
                    placeholder="e.g., 45"
                  />

                  <Input
                    label="Street Name"
                    value={address.streetName}
                    onChange={(e) => handleAddressFieldUpdate(address.id, 'streetName', e.target.value)}
                    placeholder="e.g., Adeniran Ogunsanya"
                  />
                </div>

                <Input
                  label="Landmark or Nearest Bus Stop"
                  value={address.landmark}
                  onChange={(e) => handleAddressFieldUpdate(address.id, 'landmark', e.target.value)}
                  placeholder="e.g., Opposite Shoprite"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="City/Town"
                    value={address.city}
                    onChange={(e) => handleAddressFieldUpdate(address.id, 'city', e.target.value)}
                    placeholder="e.g., Surulere"
                  />

                  <Input
                    label="LGA"
                    value={address.lga}
                    onChange={(e) => handleAddressFieldUpdate(address.id, 'lga', e.target.value)}
                    placeholder="e.g., Surulere"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="State"
                    value={address.state}
                    onChange={(e) => handleAddressFieldUpdate(address.id, 'state', e.target.value)}
                    placeholder="e.g., Lagos"
                  />

                  <Input
                    label="Country"
                    value={address.country}
                    onChange={(e) => handleAddressFieldUpdate(address.id, 'country', e.target.value)}
                    placeholder="e.g., Nigeria"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {formData.addresses.length < 5 && (
          <button
            onClick={handleAddAddress}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-primary"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Another Address ({formData.addresses.length}/5)</span>
          </button>
        )}
      </div>
    </div>
  );
}
