# Reloading Fix

Date: 2026-03-12

## Problem
Browse Classes sometimes stayed on spinner or showed stale data until manual refresh.

## Root Cause
- The classes query did extra post-processing after `/api/classes` response.
- A secondary instructor-profile step could stall and keep query in loading state.
- Remount behavior could reuse stale route/query state in some flows.

## Fix Applied
- Added API fetch timeouts in classes data flow.
- Added overall timeout guard in `useUpcomingClasses` query.
- Simplified API-success path to avoid blocking client-side enrichment chain.
- Added explicit error + retry UI instead of infinite spinner.
- Forced remount refetch for classes/dashboard paths.
- Disabled browser caching on critical classes/dashboard GET fetches.

## Expected Result
- No hard refresh needed after waiting before booking.
- If backend fails, user sees error/retry state instead of endless spinner.

## My Packages Follow-up Fix
- Added request timeout + `no-store` for `GET /api/my-packages` calls in hook.
- Changed My Packages refetch on mount from `always` to `true` (refetch stale data only).
- Added visible error message + Retry button on My Packages page.

### My Packages Files
- `src/hooks/useMyPackages.ts`
- `src/app/(authenticated)/my-packages/page.tsx`

## Buy Tokens Follow-up Fix
- Packages page now always refreshes promo eligibility from authenticated API on mount (replaced debug endpoint usage).
- Payment modal now prices and submits using fresh promo state (not only initial server-provided promo prop).
- Added timeout + no-store behavior on payment request submission to avoid silent/hanging client state.
- Package list loading now includes active refetch state so stale package values are not shown while fresh data is loading.

### Buy Tokens Files
- `src/app/(authenticated)/packages/PackagesClient.tsx`
- `src/components/Payment/PaymentModal.tsx`
- `src/hooks/usePackages.ts`

## Payment Click Freeze Fix
- Root cause: shared authenticated fetch wrapper could hang on `supabase.auth.getSession()` before making any network request.
- Added hard timeout guards for auth session and refresh calls in API wrapper.
- Result: payment click now either sends API request quickly or fails fast with a visible timeout error (no infinite "Redirecting..." state).

## Logged-In But Unauthorized Fix
- Root cause: auth helper timeout happened before token was attached, so requests were sent without Authorization header and returned 401.
- Increased auth helper timeout and added browser localStorage token fallback in shared API fetch layer.
- Removed extra auth-required promo eligibility call inside payment modal open effect (reduces unnecessary token checks and duplicate 401 noise). Promo eligibility is refreshed in packages page and passed into modal.
- Increased payment route token verification timeout to reduce false Unauthorized during transient latency.
- Added explicit HitPay upstream timeout handling in payment API (returns clear 504 instead of hanging until client abort).

### Unauthorized Fix Files
- `src/lib/api-fetch.ts`
- `src/components/Payment/PaymentModal.tsx`
- `src/app/api/payments/route.ts`

### Payment Freeze File
- `src/lib/api-fetch.ts`

## Key Files
- `src/lib/classes-queries.ts`
- `src/hooks/useClasses.ts`
- `src/hooks/useDashboard.ts`
- `src/lib/dashboard-queries.ts`
- `src/app/(authenticated)/book-classes/page.tsx`
