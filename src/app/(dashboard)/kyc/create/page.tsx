/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, User, Phone, Mail, MapPin, Building2, Briefcase, Contact, Info, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createKYCUser, ApiError, getOrganizations } from '@/lib/api/kyc';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button } from '@/components/ui/Button';
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
  occupation: string;
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

const validatePhoneNumber = (phone: string): string | undefined => {
  const trimmed = phone.trim();
  if (!trimmed) return 'Phone number is required';
  if (!trimmed.startsWith('+234')) return 'Phone number must start with +234';
  const digitsAfterCode = trimmed.slice(4);
  if (!/^\d+$/.test(digitsAfterCode)) return 'Phone number can only contain digits';
  if (digitsAfterCode.length !== 10) return 'Phone number must be exactly 10 digits after +234';
  return undefined;
};

export default function CreateKYCPage() {
  const router = useRouter();
  const { user, organization: userOrg } = useAuthContext();
  const { addToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [needsRelog, setNeedsRelog] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const isMelonAdmin = userOrg?.name?.toLowerCase().includes('melon');

  const [formData, setFormData] = useState<CreateKYCFormData>({
    loanId: '',
    loanType: 'PERSONAL',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    bvn: '',
    nin: '',
    passportNumber: '',
    addresses: [createEmptyAddress(0)],
    organizationId: '',
    relogReason: '',
  });

  useEffect(() => {
    if (!isMelonAdmin) return;
    const fetchOrgs = async () => {
      try {
        setLoadingOrgs(true);
        const data = await getOrganizations();
        setOrganizations(data || []);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, [isMelonAdmin]);

  const { handleSubmit, isSubmitting, getFieldError, handleFieldChange, handleFieldBlur } = useFormValidation({
    schema: {
      firstName: { required: true, minLength: 2 },
      lastName: { required: true, minLength: 2 },
      occupation: { required: true },
    },
    onSubmit: async () => {}
  });

  const handleAddAddress = () => {
    if (formData.addresses.length >= 5) {
      addToast({ type: 'warning', title: 'Limit Reached', message: 'Maximum 5 addresses allowed.' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, createEmptyAddress(prev.addresses.length)],
    }));
  };

  const handleRemoveAddress = (addressId: string) => {
    if (formData.addresses.length === 1) {
      addToast({ type: 'error', title: 'Request Error', message: 'At least one address is required.' });
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
    if (needsRelog) setNeedsRelog(false);
    if (value.trim()) {
      setPhoneError(validatePhoneNumber(value));
    } else {
      setPhoneError(undefined);
    }
  };

  const handleSave = async () => {
    if (creating) return;
    const phoneValError = validatePhoneNumber(formData.phone);
    if (phoneValError) {
      setPhoneError(phoneValError);
      addToast({ type: 'error', title: 'Invalid Phone', message: phoneValError });
      return;
    }

    try {
      setCreating(true);
      const isValid = await handleSubmit(formData);
      if (!isValid) {
        setCreating(false);
        return;
      }

      const hasValidAddress = formData.addresses.some(addr => addr.city || addr.state || addr.streetName);
      if (!hasValidAddress) {
        addToast({ type: 'error', title: 'Address Missing', message: 'Provide at least one valid address.' });
        setCreating(false);
        return;
      }

      const result = await createKYCUser({
        ...formData,
        loanId: formData.loanId || undefined,
        bvn: formData.bvn || undefined,
        nin: formData.nin || undefined,
        passportNumber: formData.passportNumber || undefined,
        organizationId: formData.organizationId || undefined,
        relogReason: formData.relogReason || undefined,
      } as any);

      addToast({ type: 'success', title: 'Success', message: 'Verification request created.' });
      router.push(`/kyc/${result._id}`);
    } catch (error: any) {
      setCreating(false);
      if (error instanceof ApiError && (error.message.includes('NEEDS_REASON') || error.message.includes('DUPLICATE'))) {
        setNeedsRelog(true);
        addToast({ type: 'warning', title: 'Existing Record', message: 'A reason is required for re-verifying this user.' });
      } else {
        addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create request.' });
      }
    }
  };

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (!value.startsWith('+234')) {
      if (cleaned.startsWith('234')) cleaned = cleaned.slice(3);
      else if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
      return '+234' + cleaned.slice(0, 10);
    }
    return value.slice(0, 14);
  };

  const inputClasses = "w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none text-[11px] font-black uppercase tracking-widest hover:border-primary/20 placeholder:text-gray-400 dark:placeholder:text-gray-600";
  const labelClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-2";

  return (
    <div className="min-h-screen font-sans pb-20">
      {/* Header */}
      <div className="border-b border-border/60 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/kyc" className="p-3 hover:bg-surface-secondary dark:hover:bg-white/5 rounded-xl border border-border transition-all group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Create Verification Request</h1>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-70">Enter customer details for address verification</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/kyc')}
              className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] border-border/60"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleSave}
              disabled={creating}
              className="rounded-xl px-12 py-4 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
              icon={creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            >
              Create Request
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-10 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Personal Information */}
        <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <User className="w-48 h-48 text-primary" />
          </div>
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Contact className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClasses}>Loan ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.loanId}
                    onChange={(e) => setFormData(prev => ({ ...prev, loanId: e.target.value }))}
                    className={inputClasses}
                    placeholder="e.g. LN-123456"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>Request Category (Optional)</label>
                  <div className="relative">
                    <select
                      value={formData.loanType}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanType: e.target.value }))}
                      className={inputClasses + " appearance-none cursor-pointer"}
                    >
                      {LOAN_TYPES.map(type => (
                        <option key={type.value} value={type.value} className="dark:bg-gray-900">{type.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
             </div>

             {isMelonAdmin && organizations.length > 0 && (
                <div className="space-y-2">
                  <label className={labelClasses}>Source Organization <span className="text-primary">*</span></label>
                  <div className="relative">
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizationId: e.target.value }))}
                      className={inputClasses + " appearance-none cursor-pointer"}
                    >
                      <option value="" className="dark:bg-gray-900">Select Source</option>
                      {organizations.map(org => (
                        <option key={org._id || org.id} value={org._id || org.id} className="dark:bg-gray-900">{org.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClasses}>First Name <span className="text-primary">*</span></label>
                  <input 
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={inputClasses}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>Last Name <span className="text-primary">*</span></label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={inputClasses}
                    placeholder="Enter last name"
                    required
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClasses}>Phone Number <span className="text-primary">*</span></label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(formatPhoneNumber(e.target.value))}
                    className={inputClasses + (phoneError ? " border-error" : "")}
                    placeholder="+234..."
                    required
                  />
                  {phoneError && <p className="text-[9px] font-black text-error uppercase tracking-widest mt-1">{phoneError}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={inputClasses}
                    placeholder="user@example.com"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className={labelClasses}>Occupation or Business Type <span className="text-primary">*</span></label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  className={inputClasses}
                  placeholder="e.g. Civil Servant, Banker, Business Owner..."
                  required
                />
             </div>

             {needsRelog && (
                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-amber-500" />
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Previous Record Detected - Reason Required</p>
                  </div>
                  <textarea
                    value={formData.relogReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, relogReason: e.target.value }))}
                    className={inputClasses + " bg-white/50 dark:bg-black/20 h-24"}
                    placeholder="Provide a reason for re-running this verification..."
                  />
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                <div className="space-y-2">
                   <label className={labelClasses}>BVN (Optional)</label>
                   <input
                     type="text"
                     value={formData.bvn}
                     onChange={(e) => setFormData(prev => ({ ...prev, bvn: e.target.value.replace(/\D/g, '') }))}
                     className={inputClasses}
                     maxLength={11}
                     placeholder="Enter 11-digit BVN"
                   />
                </div>
                <div className="space-y-2">
                   <label className={labelClasses}>NIN (Optional)</label>
                   <input
                     type="text"
                     value={formData.nin}
                     onChange={(e) => setFormData(prev => ({ ...prev, nin: e.target.value.replace(/\D/g, '') }))}
                     className={inputClasses}
                     maxLength={11}
                     placeholder="Enter 11-digit NIN"
                   />
                </div>
                <div className="space-y-2">
                   <label className={labelClasses}>Passport Number (Optional)</label>
                   <input
                     type="text"
                     value={formData.passportNumber}
                     onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value.toUpperCase() }))}
                     className={inputClasses}
                     placeholder="A12345678"
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-8">
           {formData.addresses.map((address, index) => (
             <div key={address.id} className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <MapPin className="w-48 h-48 text-primary" />
                </div>

                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Address {index + 1}</h3>
                  </div>
                  {index > 0 && (
                    <button 
                      onClick={() => handleRemoveAddress(address.id)}
                      className="p-3 text-error hover:bg-error/10 rounded-xl transition-all border border-transparent hover:border-error/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-8 relative z-10">
                   <div className="space-y-2">
                      <label className={labelClasses}>Address Label</label>
                      <div className="relative">
                        <select
                          value={address.label}
                          onChange={(e) => handleAddressFieldUpdate(address.id, 'label', e.target.value)}
                          className={inputClasses + " appearance-none cursor-pointer"}
                        >
                          {ADDRESS_LABELS.map(lbl => <option key={lbl} value={lbl} className="dark:bg-gray-900">{lbl}</option>)}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={labelClasses}>Street Number</label>
                        <input
                          type="text"
                          value={address.streetNumber}
                          onChange={(e) => handleAddressFieldUpdate(address.id, 'streetNumber', e.target.value)}
                          className={inputClasses}
                          placeholder="e.g., 45"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClasses}>Street Name</label>
                        <input
                          type="text"
                          value={address.streetName}
                          onChange={(e) => handleAddressFieldUpdate(address.id, 'streetName', e.target.value)}
                          className={inputClasses}
                          placeholder="e.g., Adeniran Ogunsanya"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className={labelClasses}>Landmark or Nearest Bus Stop</label>
                      <input
                        type="text"
                        value={address.landmark}
                        onChange={(e) => handleAddressFieldUpdate(address.id, 'landmark', e.target.value)}
                        className={inputClasses}
                        placeholder="e.g., Opposite Shoprite"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={labelClasses}>City/Town</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => handleAddressFieldUpdate(address.id, 'city', e.target.value)}
                          className={inputClasses}
                          placeholder="e.g., Surulere"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClasses}>State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => handleAddressFieldUpdate(address.id, 'state', e.target.value)}
                          className={inputClasses}
                          placeholder="e.g., Lagos"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className={labelClasses}>Instructions for Agent (Optional)</label>
                      <textarea
                        value={address.notes}
                        onChange={(e) => handleAddressFieldUpdate(address.id, 'notes', e.target.value)}
                        className={inputClasses + " h-24 resize-none"}
                        placeholder="e.g. Call before arrival, Building has a blue gate..."
                      />
                   </div>
                </div>
             </div>
           ))}
        </div>

        <button 
           onClick={handleAddAddress}
           className="w-full py-8 border-2 border-dashed border-border dark:border-white/10 rounded-[2.5rem] hover:border-primary/40 hover:bg-primary/5 transition-all group flex flex-col items-center justify-center gap-4 bg-surface/30"
        >
           <div className="p-4 bg-surface-secondary dark:bg-white/5 rounded-2xl border border-border dark:border-white/10 group-hover:scale-110 transition-transform">
             <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
           </div>
           <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 uppercase tracking-[0.25em] transition-colors">Add Another Address ({formData.addresses.length}/5)</span>
        </button>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-10 bg-surface-secondary/20 dark:bg-white/5 rounded-[2.5rem] border border-border border-dashed font-sans">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] max-w-sm leading-loose">
            Review all customer details before submission. Verification will be assigned to an agent immediately.
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={creating}
            className="rounded-xl px-12 py-5 shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
          >
            Create Request
          </Button>
        </div>
      </div>
    </div>
  );
}
