'use client';

import { useState } from 'react';
import { X, Mail, Plus, Trash2, Send } from 'lucide-react';

interface EmailSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    _id: string;
    title: string;
    shareToken?: string;
  };
  shareUrl: string;
}

export function EmailSharingModal({ isOpen, onClose, report, shareUrl }: EmailSharingModalProps) {
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [subject, setSubject] = useState(`Please fill out: ${report.title}`);
  const [message, setMessage] = useState(
    `Hi,\n\nI'd like you to fill out this form: ${report.title}\n\n${shareUrl}\n\nThank you!`
  );
  const [sending, setSending] = useState(false);

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

  const handleSend = async () => {
    const validEmails = recipients.filter(email => email.trim() !== '');
    
    if (validEmails.length === 0) {
      alert('Please add at least one email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validEmails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      alert(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    try {
      setSending(true);
      
      // Create mailto link for now (you can replace this with actual email sending)
      const emailData = {
        to: validEmails.join(','),
        subject: encodeURIComponent(subject),
        body: encodeURIComponent(message),
      };
      
      const mailtoLink = `mailto:${emailData.to}?subject=${emailData.subject}&body=${emailData.body}`;
      window.open(mailtoLink);
      
      // TODO: Replace with actual email sending API call
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     recipients: validEmails,
      //     subject,
      //     message,
      //     reportId: report._id,
      //   }),
      // });
      
      onClose();
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-[#5B94E5]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Share via Email</h2>
              <p className="text-sm text-gray-500">Send form link to recipients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Recipients
              </label>
              <div className="space-y-2">
                {recipients.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                    />
                    {recipients.length > 1 && (
                      <button
                        onClick={() => removeRecipient(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addRecipient}
                className="mt-2 flex items-center gap-2 text-[#5B94E5] hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add recipient</span>
              </button>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                The form link will be automatically included in your message.
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preview</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>To:</strong> {recipients.filter(e => e.trim()).join(', ') || 'No recipients added'}</div>
                <div><strong>Subject:</strong> {subject}</div>
                <div className="mt-3">
                  <strong>Message:</strong>
                  <div className="mt-1 whitespace-pre-wrap bg-white p-3 rounded border text-gray-700">
                    {message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            This will open your default email client
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Emails
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}