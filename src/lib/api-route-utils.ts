/**
 * Shared utilities for Next.js API routes (Client → API pattern).
 * Use in GET handlers that return { success, data } or { success, error }.
 *
 * @see CLIENT_TO_API_PATTERN.md
 */

import { NextRequest, NextResponse } from 'next/server'

/** Standard API success shape */
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
}

/** Standard API error shape */
export interface ApiError {
  success: false
  error: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

type RequiredQueryParamResult =
  | { ok: true; value: string }
  | { ok: false; response: NextResponse }

/**
 * Require a query parameter. Returns either the value or a 400 NextResponse.
 * Use in GET handlers: if (!requireQueryParam(...)) return response
 */
export function requireQueryParam(
  searchParams: URLSearchParams,
  name: string
): RequiredQueryParamResult {
  const value = searchParams.get(name)
  if (value == null || value.trim() === '') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: `${name} is required` } satisfies ApiError,
        { status: 400 }
      ),
    }
  }
  return { ok: true, value: value.trim() }
}

/**
 * Get optional query param with default.
 */
export function getQueryParam(
  searchParams: URLSearchParams,
  name: string,
  defaultValue: string
): string {
  const v = searchParams.get(name)
  return (v != null && v.trim() !== '') ? v.trim() : defaultValue
}

/**
 * Return 200 JSON { success: true, data }.
 */
export function successJson<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, { status })
}

/**
 * Return JSON { success: false, error }. Default status 500.
 */
export function errorJson(message: string, status = 500): NextResponse {
  return NextResponse.json(
    { success: false, error: message } satisfies ApiError,
    { status }
  )
}

/**
 * Wrap an API handler with try/catch. On throw, returns 500 errorJson.
 * Use for GET routes that use admin client and return successJson.
 *
 * @example
 * export const GET = withApiHandler(async (request) => {
 *   const { searchParams } = new URL(request.url)
 *   const r = requireQueryParam(searchParams, 'userId')
 *   if (!r.ok) return r.response
 *   const data = await fetchFromSupabase(r.value)
 *   return successJson(data)
 * })
 */
export function withApiHandler(
  handler: (request: NextRequest | Request) => Promise<NextResponse>,
  logLabel = 'API'
) {
  return async (request: NextRequest | Request): Promise<NextResponse> => {
    try {
      return await handler(request)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[${logLabel}] Unexpected error:`, err)
      return errorJson(message, 500)
    }
  }
}
