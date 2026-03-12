"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import Link from "next/link";

interface NotificationFilters {
  type: 'all' | 'BOOKING_CONFIRMED' | 'BOOKING_REMINDER' | 'BOOKING_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'GENERAL';
  read: 'all' | 'read' | 'unread';
}

export default function NotificationsPage() {
  const [filters, setFilters] = useState<NotificationFilters>({ type: 'all', read: 'all' });
  const markAsRead = useMarkNotificationRead();
  
  const { data: notificationsResponse, isLoading } = useNotifications();
  const notifications = notificationsResponse?.data || [];

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    if (filters.read === 'read' && !notification.readAt) return false;
    if (filters.read === 'unread' && notification.readAt) return false;
    return true;
  });

  const handleNotificationClick = async (notification: any) => {
    if (!notification.readAt) {
      markAsRead.mutate(notification.id);
    }
    // You could add logic here to navigate to related pages based on notification type
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return (
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'BOOKING_REMINDER':
        return (
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'BOOKING_CANCELLED':
        return (
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'PAYMENT_SUCCESS':
        return (
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        );
      case 'PAYMENT_FAILED':
        return (
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return 'Class Booking Confirmed';
      case 'BOOKING_REMINDER':
        return 'Class Reminder';
      case 'BOOKING_CANCELLED':
        return 'Booking Cancelled';
      case 'PAYMENT_SUCCESS':
        return 'Payment Successful';
      case 'PAYMENT_FAILED':
        return 'Payment Failed';
      case 'GENERAL':
        return 'Notification';
      default:
        return 'Update';
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Notifications</h1>
            <p className="text-body-color dark:text-gray-400 mt-1">
              Stay updated with your bookings and account activity
            </p>
          </div>
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/dashboard" className="text-body-color hover:text-primary">
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-primary">Notifications</span>
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Notification Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="BOOKING_CONFIRMED">Booking Confirmations</option>
                <option value="BOOKING_REMINDER">Booking Reminders</option>
                <option value="BOOKING_CANCELLED">Booking Cancellations</option>
                <option value="PAYMENT_SUCCESS">Payment Success</option>
                <option value="PAYMENT_FAILED">Payment Failed</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Read Status
              </label>
              <select
                value={filters.read}
                onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-dark rounded-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-body-color dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-body-color dark:text-gray-400">
                {notifications.length === 0 
                  ? "You don't have any notifications yet." 
                  : "No notifications match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                    !notification.readAt ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-dark dark:text-white">
                            {notification.subject || getNotificationTitle(notification.type)}
                          </h3>
                          <p className="text-body-color dark:text-gray-400 mt-1 leading-relaxed">
                            {notification.body}
                          </p>
                        </div>
                        
                        {/* Status & Time */}
                        <div className="text-right shrink-0">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                          {!notification.readAt && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                              New
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
