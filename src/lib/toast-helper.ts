/**
 * Toast Helper - Unified notification handling for API responses
 * Provides consistent toast messages across the app
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code?: string
    message?: string
  }
  message?: string
}

export interface ToastService {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
}

/**
 * Handle API response and show appropriate toast
 * @param response - API response object
 * @param toast - Toast service instance
 * @param options - Custom messages (optional)
 * @returns The response for chaining
 */
export function handleApiResponse<T = any>(
  response: ApiResponse<T>,
  toast: ToastService,
  options?: {
    successTitle?: string
    successMessage?: string
    errorTitle?: string
    errorMessage?: string
  }
) {
  if (response.success) {
    const title = options?.successTitle || 'Success'
    const message = options?.successMessage || response.message || (response.data as any)?.message || ''
    toast.success(title, message)
  } else {
    const title = options?.errorTitle || 'Error'
    const message = options?.errorMessage || response.error?.message || 'An error occurred'
    toast.error(title, message)
  }
  return response
}

/**
 * Handle batch API response with count feedback
 * @param response - Batch API response
 * @param toast - Toast service instance
 * @param itemCount - Number of items being booked
 * @returns The response for chaining
 */
export function handleBatchResponse<T>(
  response: ApiResponse<T>,
  toast: ToastService,
  itemCount: number
) {
  if (response.success) {
    const itemWord = itemCount === 1 ? 'session' : 'sessions'
    toast.success(
      'Bookings Confirmed!',
      `Successfully booked ${itemCount} ${itemWord}`
    )
  } else {
    toast.error(
      'Booking Failed',
      response.error?.message || 'Unable to complete your bookings'
    )
  }
  return response
}

/**
 * Handle mutation error with consistent formatting
 * @param error - Error object
 * @param toast - Toast service instance
 * @param context - Context for the error (e.g., "booking", "cancellation")
 */
export function handleMutationError(
  error: any,
  toast: ToastService,
  context = 'Operation'
) {
  const message =
    error?.message ||
    error?.error?.message ||
    (typeof error === 'string' ? error : `${context} failed`)

  toast.error(`${context} Failed`, message)
}

/**
 * Show loading toast (returns function to dismiss)
 * Note: Most toasts auto-dismiss, but this documents the pattern
 */
export function showLoadingToast(toast: ToastService, title: string, message?: string) {
  // Most toast implementations don't have explicit loading state
  // This is a placeholder for future enhancement
  return () => {
    // dismiss function
  }
}
