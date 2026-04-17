'use client';

import { KYCUser } from '@/types/kyc';

export function exportKYCToCSV(users: KYCUser[], filename?: string) {
  const csvRows = [];
  
  // CSV Headers
  const headers = [
    'ID',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Loan ID',
    'Loan Type',
    'Source Organization',
    'Status',
    'Street Number',
    'Street Name',
    'Landmark',
    'City',
    'LGA',
    'State',
    'Country',
    'Original Latitude',
    'Original Longitude',
    'Verified Latitude',
    'Verified Longitude',
    'Verified Address',
    'Distance (meters)',
    'Agent Notes',
    'Address Notes',
    'Verification Photos',
    'Documents Count',
    'Document URLs',
    'Rejection Evidence URLs',
    'Assigned Agent',
    'Rejection Reason',
    'Submitted At',
    'Verified At',
    'Mobile Job ID',
  ];
  csvRows.push(headers.join(','));

  // CSV Data Rows
  users.forEach(user => {
    const userId = user.id || user._id;
    const assignedAgent = user.assignedAgent && typeof user.assignedAgent !== 'string'
      ? `${user.assignedAgent.firstName} ${user.assignedAgent.lastName} (${user.assignedAgent.email})`
      : '';

    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      user.verificationData?.verifiedLatitude,
      user.verificationData?.verifiedLongitude,
    );

    // Get photos from either top-level verificationData or from the first address if multi-address is used
    const verificationPhotos = user.verificationData?.verificationPhotos || 
                             user.addresses?.[0]?.verificationData?.verificationPhotos || 
                             [];

    const row = [
      escapeCSV(userId || ''),
      escapeCSV(user.firstName),
      escapeCSV(user.lastName),
      escapeCSV(user.email),
      escapeCSV(user.phone),
      escapeCSV(user.loanId || ''),
      escapeCSV(user.loanType || ''),
      escapeCSV(user.organization?.name || ''),
      escapeCSV(user.status),
      escapeCSV(user.streetNumber || ''),
      escapeCSV(user.streetName || ''),
      escapeCSV(user.landmark || ''),
      escapeCSV(user.city || ''),
      escapeCSV(user.lga || ''),
      escapeCSV(user.state || ''),
      escapeCSV(user.country || ''),
      user.latitude?.toFixed(6) || '',
      user.longitude?.toFixed(6) || '',
      user.verificationData?.verifiedLatitude?.toFixed(6) || '',
      user.verificationData?.verifiedLongitude?.toFixed(6) || '',
      escapeCSV(user.verificationData?.verifiedAddress || ''),
      distance,
      escapeCSV(user.verificationData?.agentNotes || ''),
      escapeCSV(user.notes || ''),
      escapeCSV(extractUrls(verificationPhotos)),
      user.documents?.length || 0,
      escapeCSV(extractUrls(user.documents?.map(doc => doc.fileUrl) || [])),
      escapeCSV(extractUrls(user.rejectionEvidence || [])),
      escapeCSV(assignedAgent),
      escapeCSV(user.rejectionReason || ''),
      new Date(user.submittedAt).toISOString(),
      user.verificationData?.verifiedAt
        ? new Date(user.verificationData.verifiedAt).toISOString()
        : '',
      escapeCSV(user.mobileJobId || ''),
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `kyc-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Extracts URLs from an array that may contain strings or objects with a url property
 */
function extractUrls(items: any[] | undefined | null): string {
  if (!items || !Array.isArray(items)) return '';
  
  return items
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        if (item.url) return item.url;
        if (item.fileUrl) return item.fileUrl;
        // Handle potential character-by-character mangled objects seen in some parts of the code
        if (item['0']) {
          return Object.keys(item)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .filter(key => !isNaN(parseInt(key)))
            .map(key => item[key])
            .join('');
        }
      }
      return '';
    })
    .filter(url => typeof url === 'string' && url.length > 0)
    .join(' | ');
}

function escapeCSV(value: string | number): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function calculateDistance(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number,
): string {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return '';
  }

  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance.toFixed(2);
}
