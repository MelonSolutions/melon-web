/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { X, Mail, Plus, Trash2, Send, Loader2, CheckCircle } from 'lucide-react';

interface EmailSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    _id: string;
    title: string;
    description?: string;
    status: string;
  };
  shareUrl: string;
}

export function EmailSharingModal({ isOpen, onClose, report, shareUrl }: EmailSharingModalProps) {
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [personalMessage, setPersonalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const updateRecipient = (index: number, email: string) => {
    const updated = [...recipients];
    updated[index] = email;
    setRecipients(updated);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    const validEmails = recipients.filter(email => 
      email.trim() !== '' && validateEmail(email.trim())
    );
    
    if (validEmails.length === 0) {
      alert('Please add at least one valid email address');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/reports/${report._id}/share-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients: validEmails,
          personalMessage: personalMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send emails' }));
        throw new Error(errorData.message || 'Failed to send emails');
      }

      const result = await response.json();
      console.log('Emails sent successfully:', result);
      
      setSent(true);
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setRecipients(['']);
        setPersonalMessage('');
        setSent(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error sending emails:', error);
      alert(error instanceof Error ? error.message : 'Failed to send emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRecipients(['']);
      setPersonalMessage('');
      setSent(false);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-white/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-[#5B94E5]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Share Report</h2>
                <p className="text-sm text-gray-500">Send via email</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            {sent ? (
              // Success State
              <div className="text-center py-8">
                <div className="p-3 bg-green-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sent Successfully!</h3>
                <p className="text-sm text-gray-500">
                  Your report has been shared with all recipients.
                </p>
              </div>
            ) : (
              // Form State
              <div className="space-y-6">
                {/* Report Preview */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">Sharing:</h3>
                  <p className="text-gray-700 font-medium">{report.title}</p>
                  {report.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                  )}
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Email Recipients
                  </label>
                  <div className="space-y-2">
                    {recipients.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => updateRecipient(index, e.target.value)}
                          placeholder="Enter email address"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                          disabled={loading}
                        />
                        {recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(index)}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={addRecipient}
                    disabled={loading}
                    className="mt-2 flex items-center gap-2 text-sm text-[#5B94E5] hover:text-blue-600 font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add recipient
                  </button>
                </div>

                {/* Personal Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
                    disabled={loading}
                    maxLength={300}
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {personalMessage.length}/300
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!sent && (
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSend}
                disabled={loading || recipients.every(email => !email.trim())}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#5B94E5] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}