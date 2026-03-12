# Class Booking Stale/Spinner Issue - Root Cause and Fix

Date: 2026-03-12

## Reported Symptoms
- Browse Classes sometimes kept spinning even when API seemed to have returned.
- Token/class data sometimes looked stale until a manual browser refresh.
- User was unsure whether this was Supabase serving two frontends.

## Confirmed Root Cause
This was **not** a Supabase multi-frontend limitation.

The main issue was in frontend query orchestration:

1. The classes flow did more work after `/api/classes` returned.
   - In `src/lib/classes-queries.ts`, class data was post-processed and then instructor profile data was fetched.
2. That secondary instructor-profile step could stall (no strict timeout in that path).
3. While that step was pending, React Query still considered the query loading.
4. UI showed spinner because query never cleanly settled to success/error quickly.

A second issue contributed to stale behavior:

5. Some page-level state and fetch paths could reuse stale values on route revisit.
6. Refetch/caching policy did not always force a fresh read on remount for this flow.

## Fixes Applied

### 1) Prevent spinner deadlocks
- Added fetch timeouts for class and instructor profile fetches in `src/lib/classes-queries.ts`.
- Added overall query timeout guard in `src/hooks/useClasses.ts`.

### 2) Reduce blocking post-processing
- Avoid redundant client-side direct instructor lookup when API profile data is already available in `src/lib/classes-queries.ts`.

### 3) Improve stale data behavior on remount
- Forced refetch-on-mount for classes and dashboard hooks:
  - `src/hooks/useClasses.ts`
  - `src/hooks/useDashboard.ts`
- Disabled browser caching for critical API GETs in:
  - `src/lib/classes-queries.ts`
  - `src/lib/dashboard-queries.ts`

### 4) Improve UI failure handling
- Added explicit error state + Retry button on classes page so users do not get stuck on indefinite loading:
  - `src/app/(authenticated)/book-classes/page.tsx`

## Expected Behavior Now
- If you wait 5 minutes before booking, the page should refetch and use fresh data when needed.
- You should no longer need a hard refresh to proceed in normal flow.
- If an API/sub-step is slow, you should see a proper error/retry state instead of endless spinner.

## Important Note
If backend endpoints actually return 500 repeatedly, UI cannot invent valid data. In that case you should see error/retry UI, not an infinite spinner.

## Quick Verification Steps
1. Open Browse Classes.
2. Leave it idle for 5+ minutes.
3. Try booking a class.
4. Confirm token balance/spots update without hard refresh.
5. Navigate away and back to Browse Classes; confirm it still refreshes correctly.

## If Issue Persists
Capture Network + Console for only these endpoints:
- `/api/classes`
- `/api/instructors/profiles`
- `/api/dashboard`

This will show whether it is now:
- an endpoint failure,
- a timeout,
- or a different UI edge case.
