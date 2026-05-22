# Trial User Limited Access - Manual Testing Checklist

**Date:** 2026-05-22
**Feature:** Trial User Limited Access to melon-web
**Status:** Ready for Testing

---

## Prerequisites

- [ ] Backend (melon-core) deployed and running
- [ ] Frontend (melon-web) deployed and running
- [ ] MongoDB accessible
- [ ] Trial user created in melon-landing with UPGRADED status

---

## Test Environment Setup

### Create Test Users

1. **Trial User (UPGRADED status)**
   ```bash
   # Create via melon-landing OR directly via API
   POST /trials/initiate
   {
     "email": "trial-test@example.com"
   }

   # Update to UPGRADED status
   # Via MongoDB or admin endpoint
   ```

2. **Organization User**
   ```bash
   # Create via regular signup flow
   POST /auth/signup
   {
     "email": "org-test@example.com",
     "password": "Test123!",
     "organizationName": "Test Org"
   }
   ```

---

## Test Suite 1: Trial User Authentication Flow

### 1.1 Trial Login - Magic Link Flow
- [ ] Navigate to `/auth/trial-login`
- [ ] Page displays "Trial Access" heading
- [ ] Enter trial email: `trial-test@example.com`
- [ ] Click "Continue" button
- [ ] Verify API call to `POST /trials/initiate`
- [ ] Verify trial token stored in `localStorage.trialToken`
- [ ] Verify redirected to `/reports`

**Expected Result:** Trial user successfully authenticated and redirected.

---

### 1.2 Trial Status Validation - UPGRADED
- [ ] Clear browser data
- [ ] Set `localStorage.trialToken` to valid UPGRADED trial token
- [ ] Refresh page
- [ ] Verify no redirect (stays on current page)
- [ ] Verify `useTrialAuth` hook loads user data

**Expected Result:** UPGRADED trial users can access melon-web.

---

### 1.3 Trial Status Validation - TRIAL (Free Trial)
- [ ] Create trial user with status: `TRIAL`
- [ ] Set `localStorage.trialToken` to TRIAL token
- [ ] Navigate to `/reports`
- [ ] Verify redirected to `/auth/trial-upgrade?reason=payment_required`
- [ ] Verify upgrade page displays correctly
- [ ] Verify "Add Payment Method" button visible

**Expected Result:** Free trial users redirected to upgrade page.

---

### 1.4 Trial Status Validation - EXPIRED
- [ ] Create trial user with status: `EXPIRED`
- [ ] Set `localStorage.trialToken` to expired token
- [ ] Navigate to `/reports`
- [ ] Verify redirected to `/auth/trial-expired`
- [ ] Verify expired page displays correctly
- [ ] Verify "Upgrade Now" button visible

**Expected Result:** Expired trial users redirected to expired page.

---

### 1.5 Trial Status Validation - SUSPENDED
- [ ] Create trial user with status: `SUSPENDED`
- [ ] Set `localStorage.trialToken` to suspended token
- [ ] Navigate to `/reports`
- [ ] Verify redirected to `/auth/trial-suspended`
- [ ] Verify suspended page displays correctly
- [ ] Verify "Contact Support" button visible

**Expected Result:** Suspended trial users redirected to suspended page.

---

### 1.6 Invalid Trial Token
- [ ] Set `localStorage.trialToken` to `"invalid-token-12345"`
- [ ] Navigate to `/reports`
- [ ] Verify API call fails with 401
- [ ] Verify token removed from localStorage
- [ ] Verify user logged out

**Expected Result:** Invalid tokens handled gracefully and removed.

---

## Test Suite 2: Trial User Navigation & UI

### 2.1 Limited Navigation Menu
- [ ] Log in as trial user (UPGRADED status)
- [ ] Verify sidebar navigation shows ONLY:
  - Reports
- [ ] Verify sidebar does NOT show:
  - Overview
  - Portfolio
  - KYC
  - Impact Metrics
  - Visualizations
  - Map View
  - AI Reporting

**Expected Result:** Trial users see limited navigation (Reports only).

---

### 2.2 Trial Badge in User Profile
- [ ] Log in as trial user
- [ ] Check user profile section in sidebar (bottom)
- [ ] Verify blue "Trial" badge displayed next to name
- [ ] Verify displays trial user email
- [ ] Verify displays first letter of email as avatar initial

**Expected Result:** Trial badge and trial user info displayed correctly.

---

### 2.3 Page Title Display
- [ ] Navigate to `/reports`
- [ ] Verify header shows "Reports"

**Expected Result:** Correct page title displayed for trial users.

---

## Test Suite 3: Trial User Route Protection

### 3.1 Portfolio Page Protection
- [ ] Log in as trial user
- [ ] Manually navigate to `/portfolio` (type in URL bar)
- [ ] Verify immediately redirected to `/reports`
- [ ] Try clicking browser back button
- [ ] Verify cannot access portfolio

**Expected Result:** Trial users blocked from accessing portfolio.

---

### 3.2 Other Protected Pages
Test each URL manually:

- [ ] `/overview` → Should redirect to `/reports`
- [ ] `/impact-metrics` → Should redirect to `/reports`
- [ ] `/kyc` → Should redirect to `/reports`
- [ ] `/visualizations` → Should redirect to `/reports`
- [ ] `/map-view` → Should redirect to `/reports`

**Expected Result:** All non-Reports pages redirect trial users to `/reports`.

---

### 3.3 Allowed Pages
Verify trial users CAN access:

- [ ] `/reports` → Works
- [ ] `/reports/create` → Works (if feature enabled)
- [ ] `/reports/:id` → Works (own reports only)
- [ ] `/reports/:id/responses` → Works
- [ ] `/profile` → Works
- [ ] `/settings` → Works

**Expected Result:** Trial users can access Reports and account pages.

---

## Test Suite 4: Data Isolation

### 4.1 Trial User - Reports List
- [ ] Create 2 reports as organization user
- [ ] Create 2 reports as trial user A
- [ ] Create 2 reports as trial user B
- [ ] Log in as trial user A
- [ ] Navigate to `/reports`
- [ ] Verify sees ONLY trial user A's 2 reports
- [ ] Verify does NOT see:
  - Organization reports
  - Trial user B reports

**Expected Result:** Trial users see only their own reports.

---

### 4.2 Trial User - Direct Report Access (Unauthorized)
- [ ] Log in as trial user A
- [ ] Get report ID from organization user's report
- [ ] Navigate to `/reports/:orgReportId`
- [ ] Verify 403 error or access denied message
- [ ] Try API call directly: `GET /reports/details/:orgReportId`
- [ ] Verify API returns 403

**Expected Result:** Trial users cannot access other users' reports.

---

### 4.3 Organization User - No Trial Reports
- [ ] Create trial report as trial user
- [ ] Log in as organization user
- [ ] Navigate to `/reports`
- [ ] Verify organization reports displayed
- [ ] Verify trial reports NOT displayed
- [ ] Get trial report ID
- [ ] Navigate to `/reports/:trialReportId`
- [ ] Verify 403 error

**Expected Result:** Organization users cannot see trial reports.

---

## Test Suite 5: Trial User - Reports Functionality

### 5.1 View Reports List
- [ ] Log in as trial user with 5+ reports
- [ ] Navigate to `/reports`
- [ ] Verify reports list loads correctly
- [ ] Verify pagination works (if applicable)
- [ ] Verify search works
- [ ] Verify filters work

**Expected Result:** Reports list fully functional for trial users.

---

### 5.2 View Report Details
- [ ] Click on a report from the list
- [ ] Verify redirected to `/reports/:id`
- [ ] Verify report details displayed
- [ ] Verify questions shown
- [ ] Verify metadata shown (status, responses count, etc.)

**Expected Result:** Report details page works for trial users.

---

### 5.3 View Report Responses
- [ ] Navigate to report with responses
- [ ] Click "View Responses" or navigate to `/reports/:id/responses`
- [ ] Verify responses list loads
- [ ] Verify response data displayed correctly
- [ ] Verify export button works (if available)

**Expected Result:** Responses page fully functional.

---

### 5.4 Create New Report (if enabled)
- [ ] Navigate to `/reports/create`
- [ ] Fill in report details
- [ ] Add questions
- [ ] Click "Create Report"
- [ ] Verify report created successfully
- [ ] Verify report appears in reports list

**Expected Result:** Trial users can create reports (if feature enabled).

---

## Test Suite 6: API Authentication

### 6.1 Trial Token in API Requests
- [ ] Open browser DevTools → Network tab
- [ ] Log in as trial user
- [ ] Navigate to `/reports`
- [ ] Check API request to `GET /reports/all`
- [ ] Verify `Authorization: Bearer <trial-token>` header present
- [ ] Verify API returns 200 OK
- [ ] Verify only trial reports returned

**Expected Result:** Trial token correctly sent in API requests.

---

### 6.2 Shared API Client - Trial Token Priority
- [ ] Set both `localStorage.authToken` AND `localStorage.trialToken`
- [ ] Make API request
- [ ] Verify `authToken` used (higher priority)
- [ ] Remove `authToken`
- [ ] Make API request
- [ ] Verify `trialToken` used (fallback)

**Expected Result:** API client prioritizes authToken > trialToken.

---

## Test Suite 7: Session Persistence

### 7.1 Page Refresh
- [ ] Log in as trial user
- [ ] Navigate to `/reports`
- [ ] Refresh page (F5)
- [ ] Verify still logged in
- [ ] Verify reports still visible

**Expected Result:** Session persists after refresh.

---

### 7.2 Browser Close/Reopen
- [ ] Log in as trial user
- [ ] Close browser completely
- [ ] Reopen browser
- [ ] Navigate to `http://localhost:3000/reports`
- [ ] Verify still logged in (token from localStorage)

**Expected Result:** Session persists across browser sessions.

---

### 7.3 Logout
- [ ] Log in as trial user
- [ ] Click profile dropdown
- [ ] Click "Logout"
- [ ] Verify redirected to `/auth/trial-login`
- [ ] Verify `localStorage.trialToken` removed
- [ ] Try navigating to `/reports`
- [ ] Verify redirected to login

**Expected Result:** Logout works correctly.

---

## Test Suite 8: Edge Cases & Error Handling

### 8.1 No Internet Connection
- [ ] Log in as trial user
- [ ] Disconnect internet
- [ ] Try navigating to `/reports`
- [ ] Verify error message displayed
- [ ] Reconnect internet
- [ ] Verify page recovers

**Expected Result:** Graceful error handling for network issues.

---

### 8.2 Backend Down
- [ ] Stop backend server
- [ ] Try logging in as trial user
- [ ] Verify error message: "Connection failed"
- [ ] Restart backend
- [ ] Retry login
- [ ] Verify works

**Expected Result:** Clear error messages when backend unavailable.

---

### 8.3 Expired Trial Token (Token Expiry)
- [ ] Log in with valid token
- [ ] Wait for token to expire (or manually set expired token)
- [ ] Make API request
- [ ] Verify 401 error
- [ ] Verify token removed from localStorage
- [ ] Verify redirected to login

**Expected Result:** Expired tokens handled gracefully.

---

## Test Suite 9: Organization User (Regression Testing)

### 9.1 Organization Login
- [ ] Log in as organization user
- [ ] Verify normal login flow works
- [ ] Verify no trial-related pages/redirects

**Expected Result:** Organization login unchanged.

---

### 9.2 Organization Navigation
- [ ] Log in as organization user
- [ ] Verify full navigation menu visible:
  - Overview
  - Portfolio
  - KYC
  - Impact Metrics
  - Reports
  - Visualizations
  - Map View
- [ ] Navigate to each page
- [ ] Verify all pages accessible

**Expected Result:** Organization users have full access.

---

### 9.3 Organization User Profile
- [ ] Check user profile in sidebar
- [ ] Verify NO "Trial" badge
- [ ] Verify organization user name displayed
- [ ] Verify organization email displayed

**Expected Result:** No trial UI elements for org users.

---

## Test Suite 10: Cross-User Scenarios

### 10.1 Switch from Org to Trial
- [ ] Log in as organization user
- [ ] Log out
- [ ] Log in as trial user
- [ ] Verify navigation changes to limited view
- [ ] Verify trial badge appears
- [ ] Verify only trial reports visible

**Expected Result:** Switching users works correctly.

---

### 10.2 Switch from Trial to Org
- [ ] Log in as trial user
- [ ] Log out
- [ ] Log in as organization user
- [ ] Verify navigation changes to full view
- [ ] Verify trial badge removed
- [ ] Verify organization reports visible

**Expected Result:** Switching users works correctly.

---

## Summary Checklist

After completing all tests above:

- [ ] All trial user authentication flows work
- [ ] Trial navigation is limited correctly
- [ ] Trial users cannot access protected pages
- [ ] Data isolation is enforced (trial cannot see org, org cannot see trial)
- [ ] Trial users have full Reports functionality
- [ ] API authentication works with trial tokens
- [ ] Session persistence works
- [ ] Error handling is graceful
- [ ] Organization user experience is unchanged (no regression)
- [ ] No security vulnerabilities found

---

## Known Issues / Notes

*Document any issues found during testing here:*

1.
2.
3.

---

## Sign-off

**Tested By:** ___________________
**Date:** ___________________
**Status:** [ ] PASS [ ] FAIL (with notes)
**Notes:**

---

## Automated Test Coverage (Backend)

For reference, the following automated tests exist in melon-core:

- `reports-flexible-auth.e2e-spec.ts` - Tests FlexibleAuthGuard integration
  - ✅ UPGRADED trial user can access GET /reports/all
  - ✅ Non-UPGRADED trial user receives 403
  - ✅ Unauthenticated requests receive 401

**Backend Test Coverage:** 28/28 tests passing (100%)
