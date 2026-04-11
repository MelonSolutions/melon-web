/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Camera, Save, X, Upload, User, Mail, Briefcase, Building2, Phone, MapPin, Globe, ShieldCheck, Activity } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
   const { user, getInitials, getFullName } = useAuthContext();
   const [isEditing, setIsEditing] = useState(false);
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
      firstName: user?.firstName || 'Victor',
      lastName: user?.lastName || 'Omoniyi',
      email: user?.email || 'vicodev@google.com',
      title: 'Program Director',
      organization: 'Melon Impact Solutions',
      phone: '+234 806 123 4567',
      location: 'Lagos, Nigeria',
      timezone: 'Africa/Lagos',
      bio: 'Experienced program director with 8+ years in impact measurement and development programs across West Africa.',
      skills: ['Impact Measurement', 'Program Management', 'Data Analysis', 'Strategic Planning'],
   });

   const handleSave = async () => {
      setLoading(true);
      try {
         // Simulate API call
         await new Promise(resolve => setTimeout(resolve, 1500));
         setIsEditing(false);
      } catch (error) {
         console.error('Error saving profile:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleCancel = () => {
      setIsEditing(false);
   };

   return (
      <div className="max-w-5xl mx-auto space-y-10 font-sans pb-20">
         {/* Header */}
         <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm relative overflow-hidden group transition-all duration-500 hover:border-primary/20">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <User className="w-32 h-32 text-primary" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
               <div className="text-center sm:text-left">
                  <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
                     <div className="w-2 h-8 bg-primary rounded-full"></div>
                     <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Profile Settings</h1>
                  </div>
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-5 opacity-70">Manage your account information and preferences</p>
               </div>
               <div className="flex items-center gap-3">
                  {isEditing ? (
                     <>
                        <Button
                           variant="secondary"
                           onClick={handleCancel}
                           className="rounded-xl font-black uppercase tracking-widest text-[10px] py-4 px-8 border-border/60"
                        >
                           Cancel
                        </Button>
                        <Button
                           variant="primary"
                           onClick={handleSave}
                           loading={loading}
                           icon={<Save className="w-4 h-4" />}
                           className="rounded-xl font-black uppercase tracking-widest text-[10px] py-4 px-8 shadow-xl shadow-primary/20"
                        >
                           Save Changes
                        </Button>
                     </>
                  ) : (
                     <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                        className="rounded-xl font-black uppercase tracking-widest text-[10px] py-4 px-10 shadow-xl shadow-primary/20"
                     >
                        Edit Profile
                     </Button>
                  )}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Identity Hub */}
            <div className="lg:col-span-1 space-y-10">
               <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm text-center relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
                  <div className="relative z-10">
                     <div className="relative mx-auto w-40 h-40 group-hover:scale-105 transition-transform duration-500">
                        <div className="w-full h-full bg-surface-secondary text-primary border-4 border-surface ring-4 ring-primary/10 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-2xl">
                           {getInitials()}
                        </div>
                        {isEditing && (
                           <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white border-4 border-surface rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all cursor-pointer">
                              <Camera className="w-5 h-5" />
                           </button>
                        )}
                     </div>
                     <div className="mt-8 space-y-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{formData.firstName} {formData.lastName}</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-full inline-block">
                           {formData.title}
                        </p>
                     </div>
                     <div className="mt-8 pt-8 border-t border-border/60 grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest italic opacity-60">
                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                           Verified Personnel
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm space-y-8 group hover:border-primary/20 transition-all duration-500">
                  <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-3">
                     <Briefcase className="w-4 h-4 text-primary" />
                     Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                     {formData.skills.map((skill, index) => (
                        <span
                           key={index}
                           className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black bg-surface-secondary/50 text-gray-600 dark:text-gray-400 border border-border/60 uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all cursor-default"
                        >
                           {skill}
                           {isEditing && (
                              <button
                                 onClick={() => {
                                    const newSkills = formData.skills.filter((_, i) => i !== index);
                                    setFormData(prev => ({ ...prev, skills: newSkills }));
                                 }}
                                 className="text-gray-400 hover:text-error transition-colors cursor-pointer"
                              >
                                 <X className="w-3.5 h-3.5" />
                              </button>
                           )}
                        </span>
                     ))}
                     {isEditing && (
                        <button className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-dashed border-border rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                           + Link Meta
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Field Matrix */}
            <div className="lg:col-span-2 space-y-10">
               <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm space-y-10 group hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center gap-3 border-b border-border/60 pb-6">
                     <User className="w-5 h-5 text-primary" />
                     <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Profile Picture & Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                     <DataField label="Primary Identity" value={formData.firstName} isEditing={isEditing} onChange={(val) => setFormData(p => ({ ...p, firstName: val }))} icon={<User className="w-4 h-4" />} />
                     <DataField label="Secondary Identity" value={formData.lastName} isEditing={isEditing} onChange={(val) => setFormData(p => ({ ...p, lastName: val }))} />
                     <DataField label="Transmission ID" value={formData.email} disabled icon={<Mail className="w-4 h-4" />} />
                     <DataField label="Operational Focus" value={formData.title} isEditing={isEditing} onChange={(val) => setFormData(p => ({ ...p, title: val }))} icon={<Briefcase className="w-4 h-4" />} />
                  </div>
               </div>

               <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm space-y-10 group hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center gap-3 border-b border-border/60 pb-6">
                     <Building2 className="w-5 h-5 text-primary" />
                     <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                     <DataField label="Organization" value={formData.organization} isEditing={isEditing} onChange={(val) => setFormData(p => ({ ...p, organization: val }))} icon={<Building2 className="w-4 h-4" />} />
                     <DataField label="Comms Vector" value={formData.phone} isEditing={isEditing} onChange={(val) => setFormData(p => ({ ...p, phone: val }))} icon={<Phone className="w-4 h-4" />} />
                     <DataField label="Geospatial Node" value={formData.location} isEditing={isEditing} onChange={(val) => setFormData(p => ({ ...p, location: val }))} icon={<MapPin className="w-4 h-4" />} />
                     <DataField label="Temporal Offset" value={formData.timezone} isEditing={isEditing} selects={['Africa/Lagos', 'UTC', 'America/New_York', 'Europe/London']} onChange={(val) => setFormData(p => ({ ...p, timezone: val }))} icon={<Globe className="w-4 h-4" />} />
                  </div>
               </div>

               <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm space-y-8 group hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center gap-3 border-b border-border/60 pb-6">
                     <Activity className="w-5 h-5 text-primary" />
                     <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Professional Information</h3>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Personnel Abstract</label>
                     {isEditing ? (
                        <textarea
                           value={formData.bio}
                           onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                           rows={4}
                           className="w-full px-6 py-5 bg-surface-secondary/20 border border-border rounded-2xl text-sm font-bold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none leading-relaxed"
                           placeholder="Synthesizing identity abstract..."
                        />
                     ) : (
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed bg-surface-secondary/20 p-6 rounded-2xl border border-border/40 italic">"{formData.bio}"</p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function DataField({ label, value, isEditing, disabled, selects, onChange, icon }: { label: string, value: string, isEditing?: boolean, disabled?: boolean, selects?: string[], onChange?: (v: string) => void, icon?: React.ReactNode; }) {
   return (
      <div className="space-y-3">
         <div className="flex items-center gap-2">
            {icon && <span className="opacity-40">{icon}</span>}
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
               {label}
            </label>
         </div>
         {isEditing && !disabled ? (
            selects ? (
               <select
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="w-full px-5 py-3.5 bg-surface-secondary/30 border border-border rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
               >
                  {selects.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            ) : (
               <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="w-full px-5 py-3.5 bg-surface-secondary/30 border border-border rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
               />
            )
         ) : (
            <p className={`text-xs font-black px-5 py-3.5 rounded-xl border transition-all ${disabled ? 'text-gray-400 dark:text-gray-600 bg-surface-secondary/10 border-border/20 cursor-not-allowed opacity-60' : 'text-gray-900 dark:text-gray-100 bg-surface-secondary/20 border-border/40'}`}>
               {value}
            </p>
         )}
      </div>
   );
}