"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import SearchPanel from "./SearchPanel";
import { useProfile } from "@/hooks/useProfile";
import { 
  useNotifications, 
  useUnreadNotificationCount, 
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationsRealtime,
  type Notification
} from "@/hooks/useNotifications";

interface DashboardHeaderProps {
  sidebarCollapsed?: boolean;
  onMobileMenuClick?: () => void;
}

const DashboardHeader = ({ sidebarCollapsed = false, onMobileMenuClick }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Notification hooks - replace manual API calls
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({
    limit: 10,
    channel: 'in_app', // Only show in-app notifications in dropdown
  });
  const unreadCount = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  
  // Set up real-time notification updates
  useNotificationsRealtime();

  const notifications = notificationsData?.data || [];

  // Handle notification click - mark as read
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      markAsRead.mutate(notification.id);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead.mutate();
    }
  };

  // Memoize the close handler to prevent dependency array issues
  const handleCloseSearchPanel = useCallback(() => {
    setShowSearchPanel(false);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
      if (!target.closest('[data-notifications]')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchPanel(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Notification helper functions
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_REMINDER':
        return 'border-green-500';
      case 'BOOKING_CANCELLED':
        return 'border-red-500';
      case 'PAYMENT_SUCCESS':
        return 'border-blue-500';
      case 'PAYMENT_FAILED':
        return 'border-orange-500';
      case 'GENERAL':
        return 'border-primary';
      default:
        return 'border-gray-400';
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
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <header
      className={`fixed top-0 right-0 z-[40] h-16 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        sidebarCollapsed ? "lg:left-20" : "lg:left-64"
      } left-0`}
    >
      <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6 gap-2">
        {/* Left Side - Mobile Menu & Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Button - Desktop & Mobile */}
          <button
            onClick={() => setShowSearchPanel(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-1 max-w-xl min-w-0"
            aria-label="Search"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 flex-1 text-left truncate">
              Search classes, instructors...
            </span>
            <span className="hidden lg:inline-flex items-center gap-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400 shrink-0">
              <span>⌘</span>
              <span>K</span>
            </span>
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          <div className="relative" data-notifications>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-[400px] overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-dark z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-dark dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsRead.isPending}
                        className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                      >
                        {markAllAsRead.isPending ? 'Marking...' : 'Mark all read'}
                      </button>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
                {notificationsLoading ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-l-2 transition-colors ${
                          !notification.readAt 
                            ? `${getNotificationColor(notification.type)} border-l-2`
                            : "border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        } ${
                          markAsRead.isPending && markAsRead.variables === notification.id 
                            ? 'opacity-50' 
                            : ''
                        }`}
                      >
                        <p className="font-medium text-dark dark:text-white text-sm">
                          {notification.subject || getNotificationTitle(notification.type)}
                        </p>
                        <p className="text-body-color dark:text-gray-400 text-sm mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                          {!notification.readAt && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-dark">
                      <Link 
                        href="/notifications" 
                        className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" data-user-menu>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('span')) {
                        const span = document.createElement('span');
                        span.className = 'text-primary font-semibold text-sm';
                        span.textContent = user?.name?.charAt(0)?.toUpperCase() || "U";
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span className="text-primary font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 min-w-0 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 min-w-0">
                  <p className="font-medium text-dark dark:text-white truncate" title={user?.name || undefined}>{user?.name}</p>
                  <p className="text-sm text-body-color dark:text-gray-400 truncate" title={user?.email || undefined}>{user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-body-color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-body-color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Panel */}
      <SearchPanel isOpen={showSearchPanel} onClose={handleCloseSearchPanel} />
    </header>
  );
};

export default DashboardHeader;
