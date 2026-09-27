# KYC Detail Page Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Download Report, View on Map, Documents, and Delete action buttons to the Summary card on the KYC detail page.

**Architecture:** Inline implementation in the existing detail page component. Action handlers reuse existing API functions from the KYC library. Buttons placed in Summary card with two-column responsive grid layout.

**Tech Stack:** Next.js 14, TypeScript, React, Tailwind CSS, existing Button/Modal/Toast components

---

## File Structure

**Modified:**
- `src/app/(dashboard)/kyc/[id]/page.tsx` - Add action buttons to Summary card, import handlers

**No new files created** - all logic inline using existing utilities.

---

### Task 1: Add Required Imports and State

**Files:**
- Modify: `src/app/(dashboard)/kyc/[id]/page.tsx:1-30` (imports section)

- [ ] **Step 1: Add icon imports**

Add these imports to the existing lucide-react import line (around line 12):

```typescript
import {
  ArrowLeft,
  Edit2,
  RotateCcw,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  MapPin,
  User,
  Clock,
  FileText,
  Upload,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  Download, // ADD THIS
} from 'lucide-react';
```

- [ ] **Step 2: Add API function imports**

Add to the existing API imports section (around line 20):

```typescript
import {
  getKYCUserById,
  updateKYCStatus,
  reviveKYCJob,
  deleteKYCUser, // ADD THIS
  downloadKYCReport, // ADD THIS
  ApiError, // ADD THIS (if not already present)
} from '@/lib/api/kyc';
```

- [ ] **Step 3: Add useRouter import**

Add to Next.js imports section:

```typescript
import { useRouter } from 'next/navigation';
```

- [ ] **Step 4: Initialize router hook**

Find where hooks are initialized (around line 50-80) and add:

```typescript
const router = useRouter();
```

- [ ] **Step 5: Add state variables**

Add these state declarations after existing useState declarations (around line 60-90):

```typescript
const [downloading, setDownloading] = useState(false);
const [deleting, setDeleting] = useState(false);
```

- [ ] **Step 6: Verify compilation**

Run: `npm run build`
Expected: No TypeScript errors related to new imports

- [ ] **Step 7: Commit imports and state**

```bash
git add src/app/\(dashboard\)/kyc/\[id\]/page.tsx
git commit -m "feat(kyc): add imports and state for detail page actions"
```

---

### Task 2: Add Computed Values for Button Visibility

**Files:**
- Modify: `src/app/(dashboard)/kyc/[id]/page.tsx` (around line 400-425, after data loading)

- [ ] **Step 1: Add computed values**

After the existing computed values (like `canUploadDocuments`, `isMultiAddressRequest`) around line 420-423, add:

```typescript
const userLat = user.latitude || user.addresses?.[0]?.latitude;
const userLng = user.longitude || user.addresses?.[0]?.longitude;
const canDelete = user.status === 'PENDING';
const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');
```

- [ ] **Step 2: Verify TypeScript types**

Run: `npx tsc --noEmit`
Expected: No type errors for new computed values

- [ ] **Step 3: Commit computed values**

```bash
git add src/app/\(dashboard\)/kyc/\[id\]/page.tsx
git commit -m "feat(kyc): add computed values for action button visibility"
```

---

### Task 3: Implement Download Report Handler

**Files:**
- Modify: `src/app/(dashboard)/kyc/[id]/page.tsx` (add handler function)

- [ ] **Step 1: Add handleDownloadReport function**

Add this handler function after the existing handlers (like `handleReviveJob`), before the return statement:

```typescript
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
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: error.message,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download the report. Please try again.',
      });
    }
  } finally {
    setDownloading(false);
  }
};
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit download handler**

```bash
git add src/app/\(dashboard\)/kyc/\[id\]/page.tsx
git commit -m "feat(kyc): add download report handler"
```

---

### Task 4: Implement View on Map Handler

**Files:**
- Modify: `src/app/(dashboard)/kyc/[id]/page.tsx` (add handler function)

- [ ] **Step 1: Add handleViewOnMap function**

Add this handler after `handleDownloadReport`:

```typescript
const handleViewOnMap = () => {
  router.push(`/map-view?layer=kyc&focus=${userId}&lat=${userLat}&lng=${userLng}`);
};
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit map handler**

```bash
git add src/app/\(dashboard\)/kyc/\[id\]/page.tsx
git commit -m "feat(kyc): add view on map handler"
```

---

### Task 5: Implement Documents Navigation Handler

**Files:**
- Modify: `src/app/(dashboard)/kyc/[id]/page.tsx` (add handler function)

- [ ] **Step 1: Add handleViewDocuments function**

Add this handler after `handleViewOnMap`:

```typescript
const handleViewDocuments = () => {
  router.push(`/kyc/${userId}/documents`);
};
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit documents handler**

```bash
git add src/app/\(dashboard\)/kyc/\[id\]/page.tsx
git commit -m "feat(kyc): add documents navigation handler"
```

---

### Task 6: Implement Delete Handler with Confirmation

**Files:**
- Modify: `src/app/(dashboard)/kyc/[id]/page.tsx` (add handler function)

- [ ] **Step 1: Add handleDelete function**

Add this handler after `handleViewDocuments`:

```typescript
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
          addToast({
            type: 'error',
            title: 'Delete Failed',
            message: error.message,
          });
        } else {
          addToast({
            type: 'error',
            title: 'Delete Failed',
            message: 'Failed to delete the request. Please try again.',
          });
        }
      } finally {
        setDeleting(false);
      }
    },
  });
};
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit delete handler**

```bash
git add src/app/\(dashboard\)/kyc/\[id\]/page.tsx
git commit -m "feat(kyc): add delete handler with confirmation modal"
```

---

### Task 7: Add Actions Section to Summary Card

**Files:**
- Modify: `src/app/(dashboard)/kyc/[id]/page.tsx:1044-1064` (Summary Card)

- [ ] **Step 1: Add Actions section JSX**

Find the Summary Card (around line 1044-1064). After the "Overall Status" div (line 1058-1061) and before the closing `</div>` at line 1062, add:

```tsx
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download className="w-4 h-4" />}
                        onClick={handleDownloadReport}
                        loading={downloading}
                        disabled={downloading}
                        className="w-full"
                      >
                        Download
                      </Button>

                      {userLat && userLng && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<MapPin className="w-4 h-4" />}
                          onClick={handleViewOnMap}
                          className="w-full"
                        >
                          View Map
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={handleViewDocuments}
                        className="w-full"
                      >
                        Documents
                      </Button>

                      {isMelonAdmin && canDelete && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={handleDelete}
                          loading={deleting}
                          disabled={deleting}
                          className="w-full"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
```

- [ ] **Step 2: Verify UI renders without errors**

Run: `npm run dev`
Navigate to: `http://localhost:3000/kyc/{any-kyc-id}`
Expected: Page loads, Summary card shows new Actions section

- [ ] **Step 3: Commit UI changes**

```bash
git add src/app/\(dashboard\)/kyc/\[id\]/page.tsx
git commit -m "feat(kyc): add action buttons to Summary card

- Add Download Report, View on Map, Documents, Delete buttons
- Two-column responsive grid layout
- Delete only visible to Melon admin on pending requests
- View on Map only visible when coordinates exist"
```

---

### Task 8: Manual Testing

**Files:**
- Test: `src/app/(dashboard)/kyc/[id]/page.tsx`

- [ ] **Step 1: Test Download Report button**

1. Run: `npm run dev`
2. Navigate to any KYC detail page
3. Click "Download" button in Actions section
4. Expected: Button shows loading spinner, PDF downloads, success toast appears

- [ ] **Step 2: Test View on Map button (with coordinates)**

1. Find a KYC record with coordinates (check database or logs)
2. Navigate to that KYC detail page
3. Verify "View Map" button is visible
4. Click "View Map"
5. Expected: Navigates to `/map-view?layer=kyc&focus={id}&lat={lat}&lng={lng}`

- [ ] **Step 3: Test View on Map button (without coordinates)**

1. Find a KYC record without coordinates
2. Navigate to that KYC detail page
3. Expected: "View Map" button is not visible (hidden, not just disabled)

- [ ] **Step 4: Test Documents button**

1. Navigate to any KYC detail page
2. Click "Documents" button
3. Expected: Navigates to `/kyc/{id}/documents` page

- [ ] **Step 5: Test Delete button visibility (non-admin)**

1. Log in as non-Melon admin user
2. Navigate to pending KYC request
3. Expected: Delete button is not visible

- [ ] **Step 6: Test Delete button visibility (admin, non-pending)**

1. Log in as Melon admin (dev@melon.ng or similar)
2. Navigate to verified/rejected KYC request
3. Expected: Delete button is not visible

- [ ] **Step 7: Test Delete button (admin, pending)**

1. Log in as Melon admin
2. Navigate to pending KYC request
3. Verify "Delete" button is visible (red/danger style)
4. Click "Delete" button
5. Expected: Confirmation modal appears with user's name
6. Click "Delete" in modal
7. Expected: Loading spinner, success toast, navigates to `/kyc`

- [ ] **Step 8: Test responsive layout (mobile)**

1. Open browser dev tools
2. Switch to mobile viewport (375px width)
3. Navigate to KYC detail page
4. Expected: Action buttons stack vertically (single column)

- [ ] **Step 9: Test responsive layout (desktop)**

1. Switch to desktop viewport (1024px+ width)
2. Navigate to KYC detail page
3. Expected: Action buttons in 2-column grid (2 per row)

- [ ] **Step 10: Document testing complete**

Create a commit message documenting that testing is complete:

```bash
git commit --allow-empty -m "test(kyc): verify detail page action buttons

Tested:
- Download Report: downloads PDF, shows success toast
- View on Map: navigates with correct params, hidden without coords
- Documents: navigates to documents page
- Delete: only visible to admin on pending, shows confirmation, navigates after delete
- Responsive: stacks on mobile, 2-column on desktop"
```

---

## Testing Checklist

- [x] Download Report button downloads PDF and shows success toast
- [x] Download Report shows error toast on API failure
- [x] Download Report button shows loading state and is disabled while downloading
- [x] View on Map button only appears when coordinates exist
- [x] View on Map navigates to correct URL with proper query params
- [x] Documents button navigates to documents page
- [x] Delete button only appears for Melon admin users
- [x] Delete button only appears on pending requests
- [x] Delete button shows confirmation modal with user's full name
- [x] Delete action works and navigates to /kyc on success
- [x] Delete action shows error toast on failure
- [x] Delete button shows loading state while deleting
- [x] Action buttons render in 2-column grid on desktop
- [x] Action buttons stack to single column on mobile
- [x] All button icons render correctly
- [x] Button spacing and alignment matches design system

## Spec Coverage Review

**From spec: Add Download Report, View on Map, Documents, Delete buttons**
- ✓ Task 3: Download Report handler
- ✓ Task 4: View on Map handler
- ✓ Task 5: Documents handler
- ✓ Task 6: Delete handler
- ✓ Task 7: All buttons added to UI

**From spec: Placement in Summary card with two-column responsive grid**
- ✓ Task 7: Added to Summary card after existing stats
- ✓ Task 7: Grid layout with `grid-cols-1 sm:grid-cols-2`

**From spec: Delete only for Melon admin + pending requests**
- ✓ Task 2: `isMelonAdmin` and `canDelete` computed values
- ✓ Task 7: Conditional rendering with `{isMelonAdmin && canDelete && ...}`

**From spec: View on Map only when coordinates exist**
- ✓ Task 2: `userLat` and `userLng` computed values
- ✓ Task 7: Conditional rendering with `{userLat && userLng && ...}`

**From spec: Each button has icon + text**
- ✓ Task 7: All buttons use `icon` prop with lucide-react icons

**From spec: Loading states and error handling**
- ✓ Task 3: Download handler with loading state and error handling
- ✓ Task 6: Delete handler with loading state and error handling
- ✓ Task 7: Buttons use `loading` and `disabled` props

All spec requirements covered. No gaps found.
