'use client';

import { KYCUser, formatLoanType } from '@/types/kyc';

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
  // For each user, output one row per address (or a single row if no addresses exist)
  users.forEach(user => {
    const userId = user.id || user._id;
    const assignedAgent = user.assignedAgent && typeof user.assignedAgent !== 'string'
      ? `${user.assignedAgent.firstName} ${user.assignedAgent.lastName} (${user.assignedAgent.email})`
      : '';

    // Resolve addresses: use user.addresses if available, otherwise build a synthetic one from top-level fields
    const addresses = (user.addresses && user.addresses.length > 0)
      ? user.addresses
      : [
          {
            label: 'Primary',
            streetNumber: user.streetNumber,
            streetName: user.streetName,
            landmark: user.landmark,
            city: user.city,
            lga: user.lga,
            state: user.state,
            country: user.country,
            latitude: user.latitude,
            longitude: user.longitude,
            verificationData: user.verificationData,
            notes: user.notes,
          },
        ];

    addresses.forEach((addr) => {
      // Resolve verificationData: prefer address-level, fall back to top-level
      const vd = addr.verificationData || user.verificationData;

      const origLat = addr.latitude ?? user.latitude;
      const origLng = addr.longitude ?? user.longitude;

      const distance = calculateDistance(
        origLat,
        origLng,
        vd?.verifiedLatitude,
        vd?.verifiedLongitude,
      );

      // Get photos from either address-level or top-level verificationData
      const verificationPhotos = vd?.verificationPhotos || [];

      const row = [
        escapeCSV(userId || ''),
        escapeCSV(user.firstName),
        escapeCSV(user.lastName),
        escapeCSV(user.email),
        escapeCSV(user.phone),
        escapeCSV(user.loanId || ''),
        escapeCSV(formatLoanType(user.loanType) || ''),
        escapeCSV(user.organization?.name || ''),
        escapeCSV(addr.status || user.status),
        escapeCSV(addr.streetNumber || user.streetNumber || ''),
        escapeCSV(addr.streetName || user.streetName || ''),
        escapeCSV(addr.landmark || user.landmark || ''),
        escapeCSV(addr.city || user.city || ''),
        escapeCSV(addr.lga || user.lga || ''),
        escapeCSV(addr.state || user.state || ''),
        escapeCSV(addr.country || user.country || ''),
        origLat?.toFixed(6) || '',
        origLng?.toFixed(6) || '',
        vd?.verifiedLatitude?.toFixed(6) || '',
        vd?.verifiedLongitude?.toFixed(6) || '',
        escapeCSV(vd?.verifiedAddress || ''),
        distance,
        escapeCSV(vd?.agentNotes || user.verificationData?.agentNotes || ''),
        escapeCSV(addr.notes || user.notes || ''),
        escapeCSV(extractUrls(verificationPhotos)),
        user.documents?.length || 0,
        escapeCSV(extractUrls(user.documents?.map(doc => doc.fileUrl) || [])),
        escapeCSV(extractUrls(user.rejectionEvidence || addr.rejectionEvidence || [])),
        escapeCSV(assignedAgent),
        escapeCSV(addr.rejectionReason || user.rejectionReason || ''),
        new Date(user.submittedAt).toISOString(),
        vd?.verifiedAt
          ? new Date(vd.verifiedAt).toISOString()
          : '',
        escapeCSV(addr.mobileJobId || user.mobileJobId || ''),
      ];
      csvRows.push(row.join(','));
    });
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
