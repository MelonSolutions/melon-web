/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, MapPin, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { VerificationData } from '@/types/kyc';
import { format } from 'date-fns';

interface VerificationApprovalProps {
  verificationData: VerificationData;
  originalLatitude?: number;
  originalLongitude?: number;
  onApprove: () => void;
  onReject: (reason: string) => void;
  loading?: boolean;
}

export function VerificationApproval({
  verificationData,
  originalLatitude,
  originalLongitude,
  onApprove,
  onReject,
  loading = false,
}: VerificationApprovalProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const calculateDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const distance = calculateDistance(
    originalLatitude,
    originalLongitude,
    verificationData.verifiedLatitude,
    verificationData.verifiedLongitude
  );

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  return (
    <>
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900 mb-1">Review Required</CardTitle>
                <p className="text-sm text-blue-700">
                  An agent has submitted verification results. Please review the information and photos below before making a decision.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="success"
                size="md"
                onClick={onApprove}
                disabled={loading}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                icon={<XCircle className="w-4 h-4" />}
              >
                Reject
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Verified GPS Coordinates</div>
                  <div className="text-gray-900 font-mono text-sm">
                    {verificationData.verifiedLatitude?.toFixed(6)}, {verificationData.verifiedLongitude?.toFixed(6)}
                  </div>
                </div>
              </div>

              {distance !== null && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Distance from Original Location</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        distance < 0.5 ? 'text-success' : distance < 2 ? 'text-warning' : 'text-error'
                      }`}>
                        {distance < 1 
                          ? `${(distance * 1000).toFixed(0)} meters` 
                          : `${distance.toFixed(2)} km`}
                      </span>
                      {distance < 0.5 && (
                        <span className="text-xs px-2 py-0.5 bg-success-light text-success rounded-full">
                          Within range
                        </span>
                      )}
                      {distance >= 2 && (
                        <span className="text-xs px-2 py-0.5 bg-error-light text-error rounded-full">
                          Far from original
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Verification Time</div>
                  <div className="text-gray-900">
                    {verificationData.verifiedAt && format(new Date(verificationData.verifiedAt), 'PPp')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                {verificationData.agentNotes ? (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {verificationData.agentNotes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No notes provided by the agent</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {verificationData.verificationPhotos && verificationData.verificationPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Photos ({verificationData.verificationPhotos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {verificationData.verificationPhotos.map((photo, index) => (
                <a
                  key={index}
                  href={photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-lg"
                >
                  <img
                    src={photo}
                    alt={`Verification photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium transition-opacity duration-200">
                      Click to view full size
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Photo {index + 1}
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-error-light rounded-lg">
                <XCircle className="w-5 h-5 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Reject Verification</h3>
                <p className="text-sm text-gray-600">
                  Please provide a detailed reason for rejecting this verification. The agent will receive this feedback.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Photos are unclear, location doesn't match, documents need verification..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleReject}
                loading={loading}
                fullWidth
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
