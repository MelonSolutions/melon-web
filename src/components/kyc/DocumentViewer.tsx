/* eslint-disable @next/next/no-img-element */

'use client';

import { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  IdentityType, 
  IdentityVerificationRequest,
  IdentityVerificationResponse,
  IDENTITY_TYPE_DISPLAY_NAMES 
} from '@/types/kyc';
import { verifyIdentity, ApiError } from '@/lib/api/kyc';

interface IdentityVerificationProps {
  identityType: IdentityType;
  identityNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  onVerificationComplete?: (result: IdentityVerificationResponse) => void;
  compact?: boolean;
}

export function IdentityVerification({
  identityType,
  identityNumber,
  firstName,
  lastName,
  dateOfBirth,
  onVerificationComplete,
  compact = false,
}: IdentityVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<IdentityVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!identityNumber || !firstName || !lastName) {
      setError('Please provide all required information');
      return;
    }

    try {
      setVerifying(true);
      setError(null);
      setResult(null);

      const request: IdentityVerificationRequest = {
        identityType,
        identityNumber,
        firstName,
        lastName,
        ...(dateOfBirth && { dateOfBirth }),
      };

      const response = await verifyIdentity(request);
      setResult(response);
      
      if (onVerificationComplete) {
        onVerificationComplete(response);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to verify identity. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const getProviderName = (type: IdentityType): string => {
    const providers: Record<IdentityType, string> = {
      NIN: 'NIMC',
      BVN: 'CBN',
      VOTER_CARD: 'INEC',
      DRIVERS_LICENSE: 'FRSC',
      PASSPORT: 'Immigration',
    };
    return providers[type];
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <button
          onClick={handleVerify}
          disabled={verifying || !identityNumber}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#5B94E5] rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying with {getProviderName(identityType)}...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Verify with {getProviderName(identityType)}
            </>
          )}
        </button>

        {result && (
          <div className={`p-3 rounded-lg border ${
            result.verified 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {result.verified ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                result.verified ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.verified ? 'Identity Verified' : 'Verification Failed'}
              </span>
            </div>
            {result.message && (
              <p className={`text-xs mt-1 ${
                result.verified ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Error</span>
            </div>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Identity Verification
          </h3>
          <p className="text-sm text-gray-500">
            Verify identity using {IDENTITY_TYPE_DISPLAY_NAMES[identityType]} via {getProviderName(identityType)} API
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
          <Shield className="w-6 h-6 text-[#5B94E5]" />
        </div>
      </div>

      {/* Verification Details */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Identity Type</div>
            <div className="font-medium text-gray-900">
              {IDENTITY_TYPE_DISPLAY_NAMES[identityType]}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Provider</div>
            <div className="font-medium text-gray-900">{getProviderName(identityType)}</div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Identity Number</div>
          <div className="font-medium text-gray-900 font-mono">{identityNumber || 'Not provided'}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">First Name</div>
            <div className="font-medium text-gray-900">{firstName || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Last Name</div>
            <div className="font-medium text-gray-900">{lastName || 'Not provided'}</div>
          </div>
        </div>

        {dateOfBirth && (
          <div>
            <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
            <div className="font-medium text-gray-900">{dateOfBirth}</div>
          </div>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={verifying || !identityNumber}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-[#5B94E5] rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {verifying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verifying with {getProviderName(identityType)} API...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Verify Identity
          </>
        )}
      </button>

      {/* Result Display */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${
          result.verified 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {result.verified ? (
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                result.verified ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.verified ? 'Identity Verified Successfully' : 'Verification Failed'}
              </h4>
              {result.message && (
                <p className={`text-sm mb-3 ${
                  result.verified ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
              )}

              {result.verified && result.data && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-900">Verified Information:</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {result.data.firstName && (
                      <div>
                        <span className="text-green-600">First Name:</span>
                        <span className="ml-2 text-green-900">{result.data.firstName}</span>
                      </div>
                    )}
                    {result.data.lastName && (
                      <div>
                        <span className="text-green-600">Last Name:</span>
                        <span className="ml-2 text-green-900">{result.data.lastName}</span>
                      </div>
                    )}
                    {result.data.dateOfBirth && (
                      <div>
                        <span className="text-green-600">Date of Birth:</span>
                        <span className="ml-2 text-green-900">{result.data.dateOfBirth}</span>
                      </div>
                    )}
                    {result.data.phone && (
                      <div>
                        <span className="text-green-600">Phone:</span>
                        <span className="ml-2 text-green-900">{result.data.phone}</span>
                      </div>
                    )}
                    {result.data.email && (
                      <div>
                        <span className="text-green-600">Email:</span>
                        <span className="ml-2 text-green-900">{result.data.email}</span>
                      </div>
                    )}
                  </div>

                  {result.data.photo && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-green-900 mb-2">Photo:</div>
                      <img 
                        src={result.data.photo} 
                        alt="Verified Identity" 
                        className="w-32 h-32 rounded-lg object-cover border-2 border-green-300"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Verification Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">About Identity Verification</p>
            <p className="text-blue-700">
              This verification connects to the official {getProviderName(identityType)} database 
              to validate the provided identity information. The process is secure and compliant 
              with data protection regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
