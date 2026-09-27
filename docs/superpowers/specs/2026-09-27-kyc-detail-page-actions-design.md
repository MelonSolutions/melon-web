# KYC Detail Page - Add Action Buttons to Summary Card

**Date:** 2026-09-27
**Status:** Approved
**Implementation:** Inline in detail page component

## Overview

Add action buttons to the Summary card on the KYC detail page, allowing users to perform common actions (Download Report, View on Map, Documents, Delete) without returning to the main KYC table.

## Requirements

### Action Buttons to Add

1. **Download Report** - Everyone
2. **View on Map** - Everyone (when coordinates available)
3. **Documents** - Everyone
4. **Delete** - Melon admin only + pending requests only

### Placement

- Location: Summary card in right sidebar (after existing stats, before Submission Information card)
- Layout: Two-column grid (2 buttons per row)
- Responsive: Stack to single column on mobile (<640px)

### Button Configuration

**Grid Layout:**
```
Row 1: [Download Report] [View on Map]
Row 2: [Documents]       [Delete]
```

**Button Specs:**
- Component: Existing `Button` component
- Variant: `outline`
- Size: `sm`
- Each button has icon + text label
- Icons: Download, MapPin, FileText, Trash2 (lucide-react)

## Implementation Details

### 1. Download Report Button

**Handler Logic:**
```typescript
const [downloading, setDownloading] = useState(false);

const handleDownloadReport = async () => {
  try {
    setDownloading(true);
    await downloadKYCReport(userId);
    addToast({
      type: 'success',
      title: 'Report Downloaded',
      message: 'The verification report has been downloaded successfully.',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      addToast({ type: 'error', title: 'Download Failed', message: error.message });
    } else {
      addToast({ type: 'error', title: 'Download Failed', message: 'Failed to download the report. Please try again.' });
    }
  } finally {
    setDownloading(false);
  }
};
```

**Button:**
- Shows loading spinner when `downloading` is true
- Disabled while downloading
- No confirmation needed

### 2. View on Map Button

**Handler Logic:**
```typescript
const userLat = user.latitude || user.addresses?.[0]?.latitude;
const userLng = user.longitude || user.addresses?.[0]?.longitude;

const handleViewOnMap = () => {
  router.push(`/map-view?layer=kyc&focus=${userId}&lat=${userLat}&lng=${userLng}`);
};
```

**Visibility:**
- Only render if `userLat && userLng` exist
- Completely hidden if no coordinates (not just disabled)

### 3. Documents Button

**Handler Logic:**
```typescript
const handleViewDocuments = () => {
  router.push(`/kyc/${userId}/documents`);
};
```

**Button:**
- Simple navigation, no confirmation

### 4. Delete Button

**Handler Logic:**
```typescript
const [deleting, setDeleting] = useState(false);
const canDelete = user.status === 'PENDING';
const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');

const handleDelete = () => {
  openConfirmModal({
    title: 'Delete Verification Request',
    description: `Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: async () => {
      try {
        setDeleting(true);
        await deleteKYCUser(userId);
        addToast({
          type: 'success',
          title: 'Request Deleted',
          message: 'The verification request has been deleted successfully.',
        });
        router.push('/kyc');
      } catch (error) {
        if (error instanceof ApiError) {
          addToast({ type: 'error', title: 'Delete Failed', message: error.message });
        } else {
          addToast({ type: 'error', title: 'Delete Failed', message: 'Failed to delete the request. Please try again.' });
        }
      } finally {
        setDeleting(false);
      }
    },
  });
};
```

**Visibility:**
- Only render if `isMelonAdmin && canDelete`
- Both conditions must be true
- Completely hidden if conditions not met

**Button:**
- Variant: `danger` (red styling)
- Shows loading state when deleting
- After successful delete, navigates to `/kyc`

## Code Changes

### File: `/src/app/(dashboard)/kyc/[id]/page.tsx`

**Imports to add:**
```typescript
import { Download, MapPin, FileText, Trash2 } from 'lucide-react';
import { downloadKYCReport, deleteKYCUser, ApiError } from '@/lib/api/kyc';
import { useRouter } from 'next/navigation';
```

**State to add:**
```typescript
const [downloading, setDownloading] = useState(false);
const [deleting, setDeleting] = useState(false);
```

**Computed values:**
```typescript
const userLat = user.latitude || user.addresses?.[0]?.latitude;
const userLng = user.longitude || user.addresses?.[0]?.longitude;
const canDelete = user.status === 'PENDING';
const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');
```

**Location in JSX:**
Insert new "Actions" section in the Summary card, after the existing stats (Total Addresses, Documents, Overall Status) and before the closing `</Card>` tag.

**New JSX structure:**
```tsx
<div className="border-t border-gray-200 pt-4 mt-4">
  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Actions</h4>
  <div className="grid grid-cols-2 gap-2">
    {/* Download Report */}
    <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleDownloadReport} loading={downloading} disabled={downloading} className="w-full">
      Download
    </Button>

    {/* View on Map - conditional */}
    {userLat && userLng && (
      <Button variant="outline" size="sm" icon={<MapPin className="w-4 h-4" />} onClick={handleViewOnMap} className="w-full">
        View Map
      </Button>
    )}

    {/* Documents */}
    <Button variant="outline" size="sm" icon={<FileText className="w-4 h-4" />} onClick={handleViewDocuments} className="w-full">
      Documents
    </Button>

    {/* Delete - conditional */}
    {isMelonAdmin && canDelete && (
      <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete} loading={deleting} disabled={deleting} className="w-full">
        Delete
      </Button>
    )}
  </div>
</div>
```

## Responsive Behavior

**Desktop (≥640px):**
- 2-column grid
- Buttons side-by-side

**Mobile (<640px):**
- Automatically stacks to single column via Tailwind's responsive classes
- Each button takes full width
- If using explicit responsive classes: `grid-cols-1 sm:grid-cols-2`

## API Functions Used

All functions already exist and are imported from `@/lib/api/kyc`:
- `downloadKYCReport(userId: string): Promise<void>`
- `deleteKYCUser(userId: string): Promise<void>`
- `ApiError` class for error handling

## Dependencies

**No new dependencies required.** All components, hooks, and utilities already exist:
- Button component
- useModal hook (already in use)
- useToast hook (already in use)
- useRouter from Next.js (need to import)
- useAuthContext (already in use)
- API functions (need to import)

## Testing Checklist

1. Download Report button works and shows loading state
2. Download Report shows success/error toasts appropriately
3. View on Map button only appears when coordinates exist
4. View on Map navigates to correct URL with proper parameters
5. Documents button navigates to documents page
6. Delete button only appears for Melon admins on pending requests
7. Delete confirmation modal appears with correct message
8. Delete action works and navigates back to list on success
9. Delete shows error toast on failure
10. Responsive layout works on mobile (stacks to single column)
11. All buttons are properly disabled during their loading states
12. Button icons render correctly
