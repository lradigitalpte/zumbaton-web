/**
 * React Query hooks for user notifications
 * Handles fetching, marking as read, and real-time updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getSupabaseClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { handleApiResponse, handleMutationError } from '@/lib/toast-helper'

export interface Notification {
  id: string
  userId: string
  templateId: string | null
  type: string
  channel: 'email' | 'push' | 'sms' | 'in_app'
  subject: string | null
  body: string
  data: Record<string, unknown>
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  sentAt: string | null
  readAt: string | null
  errorMessage: string | null
  createdAt: string
}

export interface NotificationsResponse {
  data: Notification[]
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean; channel?: string }) =>
    [...notificationKeys.lists(), params] as const,
  unreadCount: (userId: string) => [...notificationKeys.all, 'unread-count', userId] as const,
}

/**
 * Fetch user notifications via API
 */
async function fetchNotifications(params?: {
  page?: number
  limit?: number
  unreadOnly?: boolean
  channel?: 'email' | 'push' | 'sms' | 'in_app'
}): Promise<NotificationsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.unreadOnly) searchParams.set('unreadOnly', 'true')
  if (params?.channel) searchParams.set('channel', params.channel)

  const { apiFetchJson } = await import('@/lib/api-fetch')
  
  const url = `/api/notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const result = await apiFetchJson<{
    success: true
    data: NotificationsResponse
    error?: { message: string; code: string }
  }>(url, {
    method: 'GET',
    requireAuth: true,
  })

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch notifications')
  }

  return result.data
}

/**
 * Mark notification as read via API
 */
async function markNotificationRead(notificationId: string): Promise<void> {
  const { apiFetchJson } = await import('@/lib/api-fetch')
  
  const result = await apiFetchJson(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    requireAuth: true,
  })

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to mark notification as read')
  }
}

/**
 * Mark all notifications as read via API
 */
async function markAllNotificationsRead(): Promise<void> {
  const { apiFetchJson } = await import('@/lib/api-fetch')
  
  const result = await apiFetchJson('/api/notifications/read-all', {
    method: 'POST',
    requireAuth: true,
  })

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to mark all notifications as read')
  }
}

/**
 * Hook to fetch user notifications
 */
export function useNotifications(params?: {
  page?: number
  limit?: number
  unreadOnly?: boolean
  channel?: 'email' | 'push' | 'sms' | 'in_app'
}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: 30 * 1000, // 30 seconds - notifications should be fresh
    gcTime: 2 * 60 * 1000, // 2 minutes cache retention
    // Uses global retry logic from providers.tsx
  })
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  const { user } = useAuth()
  
  const { data: notificationsData } = useNotifications({
    limit: 1, // We only need the count
    unreadOnly: true,
    channel: 'in_app', // Only count in-app notifications for UI badge
  })

  return notificationsData?.unreadCount || 0
}

/**
 * Hook to mark single notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      // Invalidate all notification queries to refresh counts and read status
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Mark as Read')
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      
      handleApiResponse(
        { success: true, message: 'All notifications marked as read' },
        toast,
        { successTitle: 'Notifications Updated' }
      )
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Mark All as Read')
    },
  })
}

/**
 * Hook for real-time notification updates via Supabase
 */
export function useNotificationsRealtime() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id) return

    const supabase = getSupabaseClient()
    
    // Subscribe to notifications for current user
    const subscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Notifications] Real-time update:', payload)
          
          // Invalidate notification queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user?.id, queryClient])
}