'use client';

import { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { KYCUser, UpdateKYCUserRequest, LoanType } from '@/types/kyc';
import { updateKYCUser, ApiError } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface EditKYCModalProps {
    user: KYCUser;
    onClose: () => void;
    onSuccess: () => void;
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

export function EditKYCModal({ user, onClose, onSuccess }: EditKYCModalProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<UpdateKYCUserRequest>({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        loanId: user.loanId,
        loanType: user.loanType,
        bvn: user.bvn,
        nin: user.nin,
        passportNumber: user.passportNumber,
        addresses: user.addresses || [],
    });

    const handleInputChange = (field: keyof UpdateKYCUserRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (index: number, field: string, value: any) => {
        const updatedAddresses = [...(formData.addresses || [])];
        updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
        setFormData((prev) => ({ ...prev, addresses: updatedAddresses }));
    };

    const addAddress = () => {
        const updatedAddresses = [...(formData.addresses || [])];
        updatedAddresses.push({
            label: ADDRESS_LABELS[updatedAddresses.length] || 'Other',
            country: 'Nigeria',
        });
        setFormData((prev) => ({ ...prev, addresses: updatedAddresses }));
    };

    const removeAddress = (index: number) => {
        const updatedAddresses = [...(formData.addresses || [])];
        updatedAddresses.splice(index, 1);
        setFormData((prev) => ({ ...prev, addresses: updatedAddresses }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.id && !user._id) return;

        try {
            setLoading(true);
            await updateKYCUser((user.id || user._id)!, formData);
            addToast({
                type: 'success',
                title: 'Success',
                message: 'KYC request updated successfully.',
            });
            onSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                addToast({
                    type: 'error',
                    title: 'Update Failed',
                    message: error.message,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Edit KYC Request</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                        />
                        <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required
                            helperText="Format: +234... or 080..."
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Loan Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Loan ID"
                            value={formData.loanId}
                            onChange={(e) => handleInputChange('loanId', e.target.value)}
                        />
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-900">Loan Type</label>
                            <CustomSelect
                                value={formData.loanType || ''}
                                onChange={(val) => handleInputChange('loanType', val)}
                                options={LOAN_TYPES}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Addresses</h4>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addAddress}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Add Address
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {(formData.addresses || []).map((address, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-4 relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                        {address.label}
                                    </span>
                                    {(formData.addresses?.length || 0) > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAddress(index)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove address"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Street Number"
                                        value={address.streetNumber}
                                        onChange={(e) => handleAddressChange(index, 'streetNumber', e.target.value)}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Street Name"
                                            value={address.streetName}
                                            onChange={(e) => handleAddressChange(index, 'streetName', e.target.value)}
                                        />
                                    </div>
                                    <Input
                                        label="Landmark"
                                        value={address.landmark}
                                        onChange={(e) => handleAddressChange(index, 'landmark', e.target.value)}
                                    />
                                    <Input
                                        label="City"
                                        value={address.city}
                                        onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                    />
                                    <Input
                                        label="LGA"
                                        value={address.lga}
                                        onChange={(e) => handleAddressChange(index, 'lga', e.target.value)}
                                    />
                                    <Input
                                        label="State"
                                        value={address.state}
                                        onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                                    />
                                    <Input
                                        label="Country"
                                        value={address.country}
                                        onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={<Save className="w-4 h-4" />}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
