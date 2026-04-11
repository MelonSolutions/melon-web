'use client';

import React, { useState } from 'react';
import { Mail, Building2, Send, User } from 'lucide-react';
import { apiClient } from '@/lib/api/auth';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';

export default function DemoRequestModal() {
    const { addToast } = useToast();
    const { closeModal } = useModal();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        organizationName: '',
        message: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await apiClient.requestDemo(formData);
            addToast({
                type: 'success',
                title: 'Request Sent',
                message: "Thank you! We've received your request and will be in touch shortly to schedule a demo."
            });
            closeModal();
        } catch (error: any) {
            addToast({
                type: 'error',
                title: 'Submission Failed',
                message: error.message || 'Something went wrong. Please try again or contact support.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5 shadow-lg shadow-primary/10 border border-primary/20">
                    <Send className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Request Demo</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 font-bold max-w-md mx-auto leading-relaxed">
                    Experience how Melon transforms data into measurable impact.
                    Tell us about your organization and we&apos;ll set up a personalized tour.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="firstName" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2">
                            First Name
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-surface-secondary rounded-lg border border-border/40">
                                <User className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. John"
                                className="w-full pl-12 pr-4 py-3.5 text-[11px] font-bold border border-border/60 rounded-xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:border-primary/30"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2">
                            Last Name
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-surface-secondary rounded-lg border border-border/40">
                                <User className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. Doe"
                                className="w-full pl-12 pr-4 py-3.5 text-[11px] font-bold border border-border/60 rounded-xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:border-primary/30"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2">
                        Work Email
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-surface-secondary rounded-lg border border-border/40">
                            <Mail className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. name@company.com"
                            className="w-full pl-12 pr-4 py-3.5 text-[11px] font-bold border border-border/60 rounded-xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:border-primary/30"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="organizationName" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2">
                        Organization Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-surface-secondary rounded-lg border border-border/40">
                            <Building2 className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            type="text"
                            id="organizationName"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Acme Corp"
                            className="w-full pl-12 pr-4 py-3.5 text-[11px] font-bold border border-border/60 rounded-xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:border-primary/30"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="message" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2">
                        How can we help? <span className="text-gray-500 dark:text-gray-600 font-bold normal-case tracking-normal">(Optional)</span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Tell us about your goals..."
                        className="w-full px-4 py-3.5 text-[11px] font-bold border border-border/60 rounded-xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-300 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:border-primary/30"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2.5 group disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:shadow-none mt-8"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Send Request
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
