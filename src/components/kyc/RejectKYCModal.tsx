'use client';

import { useState } from 'react';
import { X, Upload, Trash2, ShieldAlert } from 'lucide-react';
import { KYCUser, UpdateKYCUserRequest } from '@/types/kyc';
import { updateKYCUser, ApiError, uploadDocument, uploadImageToCloudinary } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Image from 'next/image';

interface RejectKYCModalProps {
    user: KYCUser;
    onClose: () => void;
    onSuccess: () => void;
}

export function RejectKYCModal({ user, onClose, onSuccess }: RejectKYCModalProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<{ url: string; tag?: string; }[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadImageToCloudinary(file);
            setEvidenceFiles(prev => [...prev, { url, tag: file.name }]);

            addToast({
                type: 'success',
                title: 'Upload Successful',
                message: 'Evidence image added.',
            });
        } catch (error: any) {
            addToast({
                type: 'error',
                title: 'Upload Failed',
                message: error.message || 'Failed to upload image.',
            });
        } finally {
            setUploading(false);
            if (e.target) {
                e.target.value = '';
            }
        }
    };

    const removeEvidence = (index: number) => {
        setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.id && !user._id) return;
        if (!reason.trim()) {
            addToast({
                type: 'error',
                title: 'Validation Error',
                message: 'A rejection reason is required.',
            });
            return;
        }

        if (!note.trim()) {
            addToast({
                type: 'error',
                title: 'Validation Error',
                message: 'Detailed notes are mandatory.',
            });
            return;
        }

        try {
            setLoading(true);

            const payload: UpdateKYCUserRequest = {
                status: 'REJECTED',
                rejectionReason: reason,
                rejectionNote: note,
                rejectionEvidence: evidenceFiles
            };

            await updateKYCUser((user.id || user._id)!, payload);

            addToast({
                type: 'success',
                title: 'Request Rejected',
                message: 'The verification request has been successfully rejected.',
            });

            onSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                addToast({
                    type: 'error',
                    title: 'Rejection Failed',
                    message: error.message,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-error-light/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-error-light/30 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-error" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-error">Reject Verification</h3>
                        <p className="text-sm text-error/80 mt-0.5">
                            Super Admin Override Action
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        You are about to reject the verification request for <span className="font-semibold text-gray-900">{user.firstName} {user.lastName}</span>.
                        Please provide detail regarding the rejection so the client can understand why it failed or address the issues.
                    </p>

                    <Input
                        label="Rejection Reason"
                        placeholder="e.g. Invalid Address, Unreachable Customer"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        autoFocus
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-900">
                            Detailed Notes <span className="text-error">*</span>
                        </label>
                        <textarea
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 min-h-[120px] resize-y"
                            placeholder="Provide detail on the rejection, agent activity logs, or call issues. This note is mandatory."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-900">
                            Evidence / Screenshots (Optional)
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {evidenceFiles.map((file, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video">
                                    <Image
                                        src={file.url}
                                        alt={`Evidence ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                        <button
                                            type="button"
                                            onClick={() => removeEvidence(index)}
                                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            title="Remove image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {file.tag && (
                                            <span className="text-white text-xs truncate w-full text-center mt-2 bg-black/50 px-1 rounded">
                                                {file.tag}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50/50 transition-colors cursor-pointer aspect-video">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
                                        <span className="text-xs text-primary-600 font-medium">Uploading...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500">
                                        <Upload className="w-6 h-6 mb-2" />
                                        <span className="text-xs font-medium text-center">Add Image</span>
                                    </div>
                                )}
                            </label>
                        </div>

                    </div>
                </div>
            </form>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500 italic">This action will immediately set the status to REJECTED.</span>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={loading || uploading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="danger"
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={uploading}
                    >
                        Confirm Rejection
                    </Button>
                </div>
            </div>
        </div>
    );
}
