# Client → API Pattern: Avoid Direct Supabase from the Browser

## The Problem

When the **web app** (browser) calls **Supabase directly** via the anon client (`getSupabaseClient()`):

- **RLS (Row Level Security)** runs on every query. Complex policies or joins can make queries slow.
- The client ↔ Supabase connection can be slower or less reliable than **server ↔ Supabase** (e.g. cold starts, network variability).
- Queries often **time out** (e.g. 8–15 seconds) with errors like:
  - `Query timeout after 15s`
  - `Token transactions query timeout`
  - `Token balance stats query timeout`
- This looks like “REST never reaches the backend.” In reality, the **backend** in that path is **Supabase**; requests are slow or failing before they finish.

## The Fix: API-First, Supabase Fallback

1. **Add a Next.js API route** (e.g. `GET /api/token-transactions`, `GET /api/token-balance-stats`).
2. **Use the Supabase admin client** (`getSupabaseAdminClient()`) in the route. This bypasses RLS and runs server-side, which is faster and more reliable.
3. **Call the API from the client** when `typeof window !== 'undefined'` (browser). Keep **direct Supabase as a fallback** for server-side or when the API fails.

### Pattern (pseudo-code)

**Client (lib):** use `fetchApiData` from `@/lib/client-api-utils`, then fall back to Supabase.

```ts
// In lib/foo-queries.ts

import { fetchApiData } from './client-api-utils'
import { getSupabaseClient } from './supabase'

export async function getFoo(userId: string): Promise<Foo[]> {
  const data = await fetchApiData<Foo[]>('/api/foo', { userId }, 'Foo')
  if (data != null) return data

  const supabase = getSupabaseClient()
  const { data: rows, error } = await supabase.from('foo').select('*').eq('user_id', userId)
  if (error) throw new Error(error.message)
  return rows ?? []
}
```

**API route:** use `api-route-utils` — `requireQueryParam`, `getQueryParam`, `successJson`, `errorJson`, `withApiHandler`.

```ts
// In app/api/foo/route.ts

import { NextRequest } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { requireQueryParam, successJson, errorJson, withApiHandler } from '@/lib/api-route-utils'

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const r = requireQueryParam(searchParams, 'userId')
  if (!r.ok) return r.response
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.from('foo').select('*').eq('user_id', r.value)
  if (error) return errorJson(error.message, 500)
  return successJson(data ?? [])
}

export const GET = withApiHandler(handler, 'API Foo')
```

- **`fetchApiData`**: GET from `origin + path`, parses `{ success, data }`; returns `data` or `null`. Only runs in browser; otherwise returns `null` (fallback to Supabase).
- **`requireQueryParam`**: Validates required query param; returns `{ ok, value }` or `{ ok: false, response }` (400).
- **`successJson` / `errorJson`**: Return `NextResponse.json({ success, data })` or `{ success, error }`.
- **`withApiHandler`**: Wraps handler in try/catch; on throw, returns 500 `errorJson`.

## What’s Done (API-First)

| Flow | API Route | Lib | Notes |
|------|-----------|-----|-------|
| **Dashboard** (token balance, upcoming bookings, user stats) | `GET /api/dashboard?userId=` | `dashboard-queries.ts` | Single aggregated endpoint. |
| **Token transactions** | `GET /api/token-transactions?userId=&filter=` | `token-transactions-queries.ts` | Filter: `all` \| `purchase` \| `used` \| `refund` \| `bonus` \| `expired`. |
| **Token balance stats** (available, pending, used, expired) | `GET /api/token-balance-stats?userId=` | `token-transactions-queries.ts` | Used by Tokens page, book-class flow. |
| **Classes** (upcoming, filters) | `GET /api/classes?...` | `classes-queries.ts` | `getUpcomingClasses` uses API first. |
| **Packages** | `GET /api/packages?type=` | `packages-queries.ts` | Uses API first, then Supabase fallback. |
| **Instructor profiles** (avatars, etc.) | `GET /api/instructors/profiles?ids=&names=` | `classes-queries.ts`, `class-detail-queries.ts` | Used when processing classes / class detail. |
| **User bookings** (my bookings list) | `GET /api/bookings?userId=&filter=` | `bookings-queries.ts` | Filter: `all` \| `upcoming` \| `past`. |

## What’s Still Direct Supabase (Candidates to Fix)

| Flow | Lib | Current Timeout | Notes |
|------|-----|-----------------|-------|
| **Class detail** (single class + booking count) | `class-detail-queries.ts` | 15s | `getClassDetail` only. Instructor avatar already uses API. Add `GET /api/classes/[classId]` or similar. |
| **Booking settings** (system_settings) | `booking-settings.ts` | — | Rare, low traffic. Can add `/api/booking-settings` later if needed. |

## Checklist for New or Migrated Flows

- [ ] **Never** call `getSupabaseClient()` from browser-only code paths for data that can timeout (lists, stats, etc.). Use an API route instead.
- [ ] Add **`GET /api/...`** that uses `getSupabaseAdminClient()`, validates input, returns `{ success, data }` or `{ success, error }`.
- [ ] In the **lib** (query layer),** use **API-first when `typeof window !== 'undefined'`**, then **direct Supabase fallback**.
- [ ] Add **timeout handling** in the fallback path (e.g. `Promise.race` with 8–15s) so slow Supabase doesn’t hang the app.
- [ ] **Log** API failures and fallbacks (e.g. `[Foo] API fetch failed, falling back to Supabase`) to debug.

## References

- **Utils (server):** `src/lib/api-route-utils.ts` — `requireQueryParam`, `getQueryParam`, `successJson`, `errorJson`, `withApiHandler`
- **Utils (client):** `src/lib/client-api-utils.ts` — `fetchApiData`
- **Token transactions API:** `src/app/api/token-transactions/route.ts`
- **Token balance stats API:** `src/app/api/token-balance-stats/route.ts`
- **Dashboard API:** `src/app/api/dashboard/route.ts`
- **User bookings API (GET):** `src/app/api/bookings/route.ts` — `GET /api/bookings?userId=&filter=`
- **Token transactions lib (API-first + fallback):** `src/lib/token-transactions-queries.ts`
- **Dashboard lib (API-first + fallback):** `src/lib/dashboard-queries.ts`
- **Bookings lib (API-first + fallback):** `src/lib/bookings-queries.ts`

## Summary

**Avoid direct Supabase from the browser for reads that can be slow.** Use **Next.js API routes + admin client** and call them from the client. Keep **Supabase as fallback** only. This reduces timeouts and “requests not reaching the backend” issues across the web app.
