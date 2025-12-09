"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  useDashboardTokenBalance,
  useDashboardUpcomingBookings,
  useDashboardUserStats,
} from "@/hooks/useDashboard";

const DashboardPage = () => {
  const { user } = useAuth();

  // React Query hooks with caching
  const { data: tokenBalance = { available: 0, pending: 0, total: 0 }, isLoading: isLoadingBalance } = useDashboardTokenBalance(user?.id);
  const { data: upcomingBookings = [], isLoading: isLoadingBookings } = useDashboardUpcomingBookings(user?.id);
  const { data: stats = { totalClassesAttended: 0, tokensUsed: 0, currentStreak: 0 }, isLoading: isLoadingStats } = useDashboardUserStats(user?.id);

  const isDataLoading = isLoadingBalance || isLoadingBookings || isLoadingStats;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
          Welcome back, {user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-body-color dark:text-gray-400">
          Here&apos;s what&apos;s happening with your Zumbathon account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Token Balance Card */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white mb-1">
            {tokenBalance.available}
          </p>
          <p className="text-body-color dark:text-gray-400 text-sm">
            Available Tokens
          </p>
          {tokenBalance.pending > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              +{tokenBalance.pending} pending
            </p>
          )}
        </div>

        {/* Classes Attended Card */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white mb-1">
            {stats.totalClassesAttended}
          </p>
          <p className="text-body-color dark:text-gray-400 text-sm">
            Classes Attended
          </p>
        </div>

        {/* Current Streak Card */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white mb-1">
            {stats.currentStreak} <span className="text-lg font-normal text-body-color">days</span>
          </p>
          <p className="text-body-color dark:text-gray-400 text-sm">
            {stats.currentStreak > 0 ? "Current Streak" : "Start your streak!"}
          </p>
        </div>

        {/* Tokens Used Card */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white mb-1">
            {stats.tokensUsed}
          </p>
          <p className="text-body-color dark:text-gray-400 text-sm">
            Tokens Used
          </p>
        </div>
      </div>

      {/* Quick Actions & Upcoming Classes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="xl:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-dark dark:text-white mb-4">Quick Actions</h2>
          
          <Link
            href="/book-classes"
            className="flex items-center gap-4 p-4 bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-dark dark:text-white group-hover:text-primary transition-colors">
                Book a Class
              </h3>
              <p className="text-sm text-body-color dark:text-gray-400">
                Browse available classes
              </p>
            </div>
          </Link>

          <Link
            href="/my-bookings"
            className="flex items-center gap-4 p-4 bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-dark dark:text-white group-hover:text-primary transition-colors">
                My Bookings
              </h3>
              <p className="text-sm text-body-color dark:text-gray-400">
                View your reservations
              </p>
            </div>
          </Link>

          <Link
            href="/packages"
            className="flex items-center gap-4 p-4 bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-dark dark:text-white group-hover:text-primary transition-colors">
                Buy Tokens
              </h3>
              <p className="text-sm text-body-color dark:text-gray-400">
                Purchase token packages
              </p>
            </div>
          </Link>
        </div>

        {/* Upcoming Classes */}
        <div className="xl:col-span-2 bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Upcoming Classes
            </h2>
            <Link
              href="/my-bookings"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all →
            </Link>
          </div>

          {isDataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-body-color dark:text-gray-400 mb-4">No upcoming classes booked</p>
              <Link
                href="/book-classes"
                className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Book Your First Class
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-dark dark:text-white">
                        {booking.class_name}
                      </h4>
                      <p className="text-sm text-body-color dark:text-gray-400">
                        with {booking.instructor_name} • {booking.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-dark dark:text-white text-sm">
                      {formatDate(booking.scheduled_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
