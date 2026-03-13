/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createKYCUser, ApiError } from '@/lib/api/kyc';
import { apiClient } from '@/lib/api/auth';
import { useAuthContext } from '@/context/AuthContext';
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
  notes: string;
}

interface CreateKYCFormData {
  loanId: string;
  loanType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bvn: string;
  nin: string;
  passportNumber: string;
  addresses: AddressData[];
  organizationId: string;
  relogReason: string;
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

const LOAN_TYPES = [
  { value: 'PERSONAL', label: 'Personal Loan' },
  { value: 'BUSINESS', label: 'Business Loan' },
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
  notes: '',
});

const validatePhoneNumber = (phone: string): string | null => {
  const trimmed = phone.trim();

  if (!trimmed) {
    return 'Phone number is required';
  }

  if (!trimmed.startsWith('+234')) {
    return 'Phone number must start with +234';
  }

  const digitsAfterCode = trimmed.slice(4);

  if (!/^\d+$/.test(digitsAfterCode)) {
    return 'Phone number can only contain digits after +234';
  }

  if (digitsAfterCode.length !== 10) {
    return 'Phone number must be exactly 10 digits after +234';
  }

  return null;
};

export default function AddKYCUserPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [needsRelog, setNeedsRelog] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const isMelonAdmin = user?.email?.endsWith('@melon.ng') || user?.organization?.name?.toLowerCase().includes('melon');

  useEffect(() => {
    if (!isMelonAdmin) return;

    const fetchOrgs = async () => {
      try {
        setLoadingOrgs(true);
        const data = await apiClient.getOrganizations();
        // Handle both direct array and { data: [...] } responses
        const orgList = Array.isArray(data) ? data : (data as any)?.data || [];
        setOrganizations(orgList);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, [isMelonAdmin]);

  const [formData, setFormData] = useState<CreateKYCFormData>({
    loanId: '',
    loanType: 'PERSONAL',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bvn: '',
    nin: '',
    passportNumber: '',
    addresses: [createEmptyAddress(0)],
    organizationId: '',
    relogReason: '',
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
        required: false,
        pattern: formData.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/ : undefined
      },
    },
    onSubmit: async () => {
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

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));

    if (value.trim()) {
      const error = validatePhoneNumber(value);
      setPhoneError(error);
    } else {
      setPhoneError(null);
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phone.trim()) {
      const error = validatePhoneNumber(formData.phone);
      setPhoneError(error);
    }
  };

  const handleSave = async () => {
    if (creating) return;

    const phoneValidationError = validatePhoneNumber(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      addToast({
        type: 'error',
        title: 'Invalid Phone Number',
        message: phoneValidationError,
      });
      return;
    }

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
        loanId: formData.loanId || undefined,
        loanType: formData.loanType as any,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        bvn: formData.bvn || undefined,
        nin: formData.nin || undefined,
        passportNumber: formData.passportNumber || undefined,
        organizationId: formData.organizationId || undefined,
        relogReason: formData.relogReason || undefined,
        addresses: formData.addresses.map(addr => ({
          label: addr.label,
          streetNumber: addr.streetNumber || undefined,
          streetName: addr.streetName || undefined,
          landmark: addr.landmark || undefined,
          city: addr.city || undefined,
          lga: addr.lga || undefined,
          state: addr.state || undefined,
          country: addr.country || undefined,
          notes: addr.notes || undefined,
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

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, '');

    if (!value.startsWith('+234')) {
      if (cleaned.startsWith('234')) {
        cleaned = cleaned.slice(3);
      } else if (cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1);
      }
      return '+234' + cleaned.slice(0, 10);
    }

    return value.slice(0, 14);
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
              disabled={creating || !!phoneError}
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
            <div className={`grid grid-cols-1 md:grid-cols-${organizations.length > 0 ? '3' : '2'} gap-6 mb-6 pb-6 border-b border-gray-100`}>
              <Input
                label="Loan ID (Optional)"
                value={formData.loanId}
                onChange={(e) => handleFieldUpdate('loanId', e.target.value)}
                placeholder="e.g. LN-12345"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Request Category (Optional)
                </label>
                <CustomSelect
                  value={formData.loanType}
                  onChange={(value) => handleFieldUpdate('loanType', value)}
                  options={LOAN_TYPES}
                  placeholder="Select category"
                />
              </div>

              {isMelonAdmin && organizations.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Source Organization <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={formData.organizationId}
                    onChange={(value) => handleFieldUpdate('organizationId', value)}
                    options={organizations.map(org => ({ value: org._id || org.id, label: org.name }))}
                    placeholder="Select source"
                  />
                </div>
              )}
            </div>

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

              <div className="space-y-4">
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleFieldUpdate('email', e.target.value);
                    if (needsRelog) setNeedsRelog(false);
                  }}
                  onBlur={(e) => handleFieldBlur('email', e.target.value)}
                  error={getFieldError('email')}
                  placeholder="user@example.com"
                />

                {needsRelog && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg space-y-3 animate-in fade-in zoom-in duration-200">
                    <div>
                      <h4 className="text-sm font-semibold text-orange-800">Existing Job Detected</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        An active KYC request with this email already exists. To force re-creation, provide a solid relogging reason.
                      </p>
                    </div>
                    <textarea
                      placeholder="e.g. Rejecting old job due to unreadable images..."
                      required
                      value={formData.relogReason}
                      onChange={(e) => handleFieldUpdate('relogReason', e.target.value)}
                      className="w-full text-sm rounded-md border-orange-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(formatPhoneNumber(e.target.value))}
                  onBlur={handlePhoneBlur}
                  error={phoneError || undefined}
                  placeholder="+234XXXXXXXXXX"
                  maxLength={14}
                />
                {!phoneError && formData.phone && (
                  <p className="text-xs text-gray-500 mt-1">
                    Format: +234 followed by 10 digits (e.g., +2348012345678)
                  </p>
                )}
              </div>

              <Input
                label="BVN (Optional)"
                value={formData.bvn}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleFieldUpdate('bvn', value);
                }}
                placeholder="Enter 11-digit BVN"
                maxLength={11}
              />

              <Input
                label="NIN (Optional)"
                value={formData.nin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleFieldUpdate('nin', value);
                }}
                placeholder="Enter 11-digit NIN"
                maxLength={11}
              />

              <Input
                label="Passport Number (Optional)"
                value={formData.passportNumber}
                onChange={(e) => handleFieldUpdate('passportNumber', e.target.value.toUpperCase())}
                placeholder="A12345678"
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions for Agent (Optional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                      placeholder="e.g. Call before coming, The building has a blue gate..."
                      value={address.notes}
                      onChange={(e) => handleAddressFieldUpdate(address.id, 'notes', e.target.value)}
                    />
                  </div>
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
