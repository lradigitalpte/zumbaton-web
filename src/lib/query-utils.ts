/**
 * React Query utility functions
 * Provides timeout protection and error handling for queries
 * 
 * NOTE: Most timeout/retry logic is now centralized in providers.tsx
 * These utilities are available for custom use cases
 */

export const QUERY_TIMEOUT = 30000 // 30 seconds max for any query
export const MAX_RETRIES = 2 // Maximum retry attempts (matches providers.tsx)

/**
 * Checks if an error is non-retryable (timeout, network, abort)
 * Used by the global retry logic in providers.tsx
 */
export function isNonRetryableError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || ''
  return (
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('abort') ||
    errorMessage.includes('cancelled') ||
    errorMessage.includes('failed to fetch') ||
    error?.name === 'AbortError' ||
    error?.name === 'TimeoutError'
  )
}

/**
 * Wraps a query function with a timeout to prevent infinite loading
 * @param queryFn The original query function
 * @param timeout Timeout in milliseconds (default: 30 seconds)
 * @returns Promise that rejects with timeout error if query takes too long
 */
export function withQueryTimeout<T>(
  queryFn: () => Promise<T>,
  timeout: number = QUERY_TIMEOUT
): Promise<T> {
  let timeoutId: NodeJS.Timeout
  
  return Promise.race([
    queryFn().finally(() => {
      if (timeoutId) clearTimeout(timeoutId)
    }),
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Query timeout after ${timeout}ms`))
      }, timeout)
    }),
  ])
}

/**
 * Creates a query function with timeout protection
 * Use this in your React Query hooks to add automatic timeout
 * 
 * @example
 * ```ts
 * useQuery({
 *   queryKey: ['data'],
 *   queryFn: createQueryFn(() => fetchData(), 30000)
 * })
 * ```
 */
export function createQueryFn<T>(
  queryFn: () => Promise<T>,
  timeout: number = QUERY_TIMEOUT
): () => Promise<T> {
  return () => withQueryTimeout(queryFn, timeout)
}

