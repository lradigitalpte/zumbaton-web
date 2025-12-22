# Authentication & Token Refresh Fix Plan

## Overview
This document outlines the fix for authentication refresh loops, token expiration issues, and API call failures in the web application.

**Fix Size:** Medium (3-4 hours)  
**Risk Level:** Low-Medium  
**Priority:** Critical

---

## Issues Identified

### 1. Refresh Token Not Found Error (CRITICAL)
- **Severity:** Critical
- **Impact:** Causes refresh loops, stuck states, failed API calls
- **Error:** `{code: "refresh_token_not_found", message: "Invalid Refresh Token: Refresh Token Not Found"}`
- **Root Cause:** Supabase auto-refresh fails but app doesn't handle it gracefully

### 2. Signin Page Redirect Loop (HIGH)
- **Severity:** High
- **Impact:** Infinite redirects, poor UX
- **Root Cause:** Multiple `useEffect` hooks triggering redirects simultaneously

### 3. Missing 401 Handling in API Calls (HIGH)
- **Severity:** High
- **Impact:** API calls fail silently when token expires
- **Root Cause:** No retry logic or token refresh on 401 responses

### 4. Unnecessary checkSession Re-initialization (MEDIUM)
- **Severity:** Medium
- **Impact:** Potential refresh loops
- **Root Cause:** `checkSession()` calls `initializeAuth()` unnecessarily

---

## Fix Phases

### Phase 1: Critical - Refresh Token Error Handling ⚠️
**Time:** 30 minutes  
**Priority:** CRITICAL  
**Risk:** Low

#### Files to Modify:
1. `src/context/AuthContext.tsx`
2. `src/lib/session.ts`

#### Changes:
- Add error detection in `onAuthStateChange` listener
- Handle `SIGNED_OUT` event (fires when refresh fails)
- Clear session state and redirect to signin on refresh failure
- Add proper error logging for refresh failures

#### Implementation Steps:
1. Update `onAuthStateChange` to handle refresh failures
2. Add `SIGNED_OUT` event handler that clears user state
3. Improve error handling in `refreshSessionIfNeeded()`
4. Add error boundary for auth failures

---

### Phase 2: High - Signin Redirect Loop Fix
**Time:** 20 minutes  
**Priority:** HIGH  
**Risk:** Low

#### Files to Modify:
1. `src/app/(public)/signin/page.tsx`

#### Changes:
- Remove 3 separate `useEffect` hooks (lines 33-60, 63-67, 70-74)
- Create single consolidated `useEffect` with redirect guard
- Add `hasRedirectedRef` to prevent multiple redirects
- Keep session check but make it non-blocking

#### Implementation Steps:
1. Consolidate all redirect logic into one `useEffect`
2. Add `useRef` guard to prevent multiple redirects
3. Remove redundant session checks
4. Test redirect behavior

---

### Phase 3: High - 401 Handling & API Wrapper
**Time:** 2 hours  
**Priority:** HIGH  
**Risk:** Medium

#### Step 3.1: Create Centralized API Wrapper (45 min)
**New File:** `src/lib/api-fetch.ts`

**Functionality:**
- Create `apiFetch` function that:
  - Gets fresh token before each request
  - Detects 401 responses
  - Attempts token refresh once
  - Retries request with new token
  - Falls back to signout if refresh fails

#### Step 3.2: Enhance Existing ApiClient (30 min)
**File:** `src/api/client.ts`

**Changes:**
- Add 401 detection and retry logic
- Integrate with Supabase token refresh
- Call `onUnauthorized` callback on persistent 401

#### Step 3.3: Replace Direct Fetch Calls (45 min)
**Files to Update:**
1. `src/hooks/usePackages.ts` (line 50)
2. `src/components/Payment/PaymentModal.tsx` (line 66)
3. `src/components/Dashboard/DashboardHeader.tsx` (line 67)
4. `src/app/notifications/page.tsx` (line 37)

**Pattern to Replace:**
```typescript
// OLD
const { data: { session } } = await supabase.auth.getSession()
const response = await fetch('/api/...', {
  headers: { 'Authorization': `Bearer ${session.access_token}` }
})

// NEW
import { apiFetch } from '@/lib/api-fetch'
const response = await apiFetch('/api/...', { method: 'GET' })
```

---

### Phase 4: Medium - Remove Unnecessary Re-init
**Time:** 15 minutes  
**Priority:** MEDIUM  
**Risk:** Low

#### Files to Modify:
1. `src/context/AuthContext.tsx`

#### Changes:
- Modify `checkSession()` function (line 255)
- Remove `await initializeAuth()` call (line 261)
- Return boolean based on session existence only
- Let Supabase auto-refresh handle token updates

---

## Files Summary

### Files to Modify: 8
1. ✅ `src/context/AuthContext.tsx` (2 changes: error handler + checkSession)
2. ✅ `src/lib/session.ts` (verify error handling)
3. ✅ `src/app/(public)/signin/page.tsx` (consolidate redirects)
4. ✅ `src/api/client.ts` (enhance 401 handling)
5. ✅ `src/hooks/usePackages.ts` (use apiFetch)
6. ✅ `src/components/Payment/PaymentModal.tsx` (use apiFetch)
7. ✅ `src/components/Dashboard/DashboardHeader.tsx` (use apiFetch)
8. ✅ `src/app/notifications/page.tsx` (use apiFetch)

### Files to Create: 1
1. ✅ `src/lib/api-fetch.ts` (new centralized wrapper)

---

## Testing Checklist

After fixes, verify:
- [ ] Sign in → no redirect loop
- [ ] Token expires → auto-refresh works
- [ ] Refresh token invalid → graceful signout
- [ ] API calls with expired token → auto-retry after refresh
- [ ] Multiple API calls → no race conditions
- [ ] Network errors → proper error handling
- [ ] Console → no refresh token errors

---

## Risk Assessment

- **Low Risk:** Phase 1, 2, 4 (isolated changes)
- **Medium Risk:** Phase 3 (touches multiple files, needs testing)

**Mitigation:**
- Test each phase independently
- Keep old code commented for quick rollback
- Add error logging for debugging

---

## Estimated Time

- Phase 1: 30 min
- Phase 2: 20 min
- Phase 3: 2 hours
- Phase 4: 15 min
- Testing: 1 hour
- **Total: ~4 hours**

---

## Priority Order

1. **Phase 1** (CRITICAL) - Stops refresh loops immediately
2. **Phase 2** (HIGH) - Fixes redirect loops
3. **Phase 3** (HIGH) - Fixes API failures
4. **Phase 4** (MEDIUM) - Optimization

---

## Implementation Status

- [x] Phase 1: Critical - Refresh Token Error Handling ✅
- [x] Phase 2: High - Signin Redirect Loop Fix ✅
- [x] Phase 3: High - 401 Handling & API Wrapper ✅
- [x] Phase 4: Medium - Remove Unnecessary Re-init ✅
- [ ] Testing Complete

---

## Notes

- All changes maintain backward compatibility
- Supabase auto-refresh is still primary mechanism
- Fixes add graceful fallbacks and error handling
- No breaking changes to existing API contracts
