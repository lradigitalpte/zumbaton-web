"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { useState } from "react";

// Create a client with timeout protection
export const QUERY_TIMEOUT = 10000 // 10 seconds max for any query

// Wrapper to add timeout to query functions
export function withQueryTimeout<T>(
  queryFn: () => Promise<T>,
  timeout: number = QUERY_TIMEOUT
): Promise<T> {
  let timeoutId: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Query timeout after ${timeout}ms`))
    }, timeout)
  })
  
  return Promise.race([
    queryFn().finally(() => {
      if (timeoutId) clearTimeout(timeoutId)
    }),
    timeoutPromise,
  ])
}

// Circuit breaker constants
const MAX_RETRIES = 2 // Maximum retry attempts per query

// Helper to check if an error is a non-retryable error
function isNonRetryableError(error: any): boolean {
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

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds for live data
      gcTime: 5 * 60 * 1000, // 5 minutes cache retention
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: true, // Refetch when component mounts if data is stale
      refetchOnReconnect: true, // Refetch when internet reconnects
      // Show fresh data immediately, don't keep stale UI
      // placeholderData: (previousData: unknown) => previousData,
      // Circuit breaker retry logic - HARD LIMIT on retries
      retry: (failureCount: number, error: any) => {
        // HARD LIMIT: Never retry more than MAX_RETRIES times
        if (failureCount >= MAX_RETRIES) {
          console.warn(`[Query] Max retries (${MAX_RETRIES}) reached, stopping`)
          return false
        }
        // Don't retry non-retryable errors (timeout, network, etc.)
        if (isNonRetryableError(error)) {
          console.warn('[Query] Non-retryable error, stopping:', error?.message)
          return false
        }
        // Allow retry for other errors
        return true
      },
      retryDelay: (attemptIndex: number) => {
        // Exponential backoff with max of 30 seconds
        const delay = Math.min(1000 * 2 ** attemptIndex, 30000)
        console.log(`[Query] Retry attempt ${attemptIndex + 1}, waiting ${delay}ms`)
        return delay
      },
      // Network mode - only fetch when online
      networkMode: 'online' as const,
      // Don't throw errors - let components handle them gracefully
      throwOnError: false,
      // Share data between queries with same structure
      structuralSharing: true,
    },
    mutations: {
      retry: 1, // Retry failed mutations once
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
