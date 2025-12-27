"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTokenTransactions, useTokenBalanceStats } from "@/hooks/useTokenTransactions";
import { useDashboardUpcomingBookings } from "@/hooks/useDashboard";
import { apiFetchJson } from "@/lib/api-fetch";
import { useToast } from "@/components/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/hooks/useDashboard";

type FilterType = "all" | "purchase" | "used" | "refund" | "bonus" | "expired";

const TokensPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  // React Query hooks
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTokenTransactions(
    user?.id,
    filter === "all" ? undefined : filter
  );
  const { data: tokenBalance, isLoading: isLoadingBalance } = useTokenBalanceStats(user?.id);
  const { data: upcomingBookings = [], isLoading: isLoadingBookings } = useDashboardUpcomingBookings(user?.id);

  const handleCheckIn = async (bookingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (checkingIn) return;
    
    setCheckingIn(bookingId);
    
    try {
      const result = await apiFetchJson<{
        success: boolean;
        data?: any;
        error?: { code?: string; message?: string };
      }>("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({
          bookingId,
        }),
        requireAuth: true,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to check in");
      }

      toast.success("Checked in successfully!", "Your attendance has been marked.");
      
      // Invalidate dashboard and token queries to refresh data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ['tokenTransactions'] });
      
      // Reset checking in state after a short delay
      setTimeout(() => setCheckingIn(null), 1000);
    } catch (error: any) {
      console.error("[Tokens] Check-in error:", error);
      toast.error("Check-in failed", error?.message || "Failed to check in. Please try again.");
      setCheckingIn(null);
    }
  };

  const canCheckIn = (scheduledAt: string) => {
    const classTime = new Date(scheduledAt);
    const now = new Date();
    // Can check in 30 minutes before class starts
    const thirtyMinutesBefore = new Date(classTime.getTime() - 30 * 60 * 1000);
    return now >= thirtyMinutesBefore && now <= new Date(classTime.getTime() + 2 * 60 * 60 * 1000); // Allow up to 2 hours after class start
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return (
          <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 xl:w-5 xl:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case "attendance-consume":
      case "no-show-consume":
      case "late-cancel-consume":
        return (
          <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        );
      case "booking-release":
        return (
          <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
        );
      case "admin-adjust":
        return (
          <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 xl:w-5 xl:h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        );
      case "expire":
        return (
          <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 xl:w-5 xl:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      purchase: "purchase",
      "attendance-consume": "used",
      "no-show-consume": "used",
      "late-cancel-consume": "used",
      "booking-release": "refund",
      "admin-adjust": "bonus",
      expire: "expired",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="pb-6">
      {/* Mobile-First Page Header */}
      <div className="mb-4 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-bold text-dark dark:text-white mb-1">
          Token History
        </h1>
        <p className="text-sm xl:text-base text-body-color dark:text-gray-400">
          Track your token purchases, usage, and balance
        </p>
      </div>

      {/* Balance Cards - Compact on mobile */}
      {isLoadingBalance ? (
        <div className="flex items-center justify-center py-12 mb-6 xl:mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 mb-6 xl:mb-8">
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
            <div className="flex items-center gap-2 xl:gap-3 mb-2 xl:mb-3">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <span className="text-[9px] xl:text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-full">
                Available
              </span>
            </div>
            <p className="text-2xl xl:text-3xl font-bold text-dark dark:text-white">{tokenBalance?.available || 0}</p>
            <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Ready to use</p>
          </div>

          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
            <div className="flex items-center gap-2 xl:gap-3 mb-2 xl:mb-3">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[9px] xl:text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-2xl xl:text-3xl font-bold text-dark dark:text-white">{tokenBalance?.pending || 0}</p>
            <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">In booked classes</p>
          </div>

          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
            <div className="flex items-center gap-2 xl:gap-3 mb-2 xl:mb-3">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl xl:text-3xl font-bold text-dark dark:text-white">{tokenBalance?.used || 0}</p>
            <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Tokens used</p>
          </div>

          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
            <div className="flex items-center gap-2 xl:gap-3 mb-2 xl:mb-3">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 xl:w-5 xl:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-2xl xl:text-3xl font-bold text-dark dark:text-white">{tokenBalance?.expired || 0}</p>
            <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Tokens expired</p>
          </div>
        </div>
      )}

      {/* CTA Banner - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl xl:rounded-xl rounded-2xl p-3 xl:p-6 mb-4 xl:mb-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2.5 xl:gap-0">
        <div className="text-white flex-1 min-w-0">
          <h3 className="text-sm xl:text-lg font-bold xl:font-semibold mb-0.5 xl:mb-1">Need more tokens?</h3>
          <p className="opacity-90 xl:opacity-80 text-xs xl:text-sm leading-relaxed">Purchase a package and save with bulk discounts.</p>
        </div>
        <Link
          href="/packages"
          className="w-full xl:w-auto px-4 xl:px-6 py-2 xl:py-3 bg-white text-primary font-bold xl:font-medium rounded-lg xl:rounded-lg rounded-xl hover:bg-gray-100 transition-all active:scale-95 xl:active:scale-100 text-center text-xs xl:text-base shadow-md xl:shadow-none shrink-0"
        >
          Buy Tokens
        </Link>
      </div>

      {/* Transaction History - Mobile Optimized */}
      <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800">
        {/* Header & Filters - Mobile Optimized */}
        <div className="p-4 xl:p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-3 xl:gap-4">
            <h2 className="text-base xl:text-lg font-semibold text-dark dark:text-white">
              Transaction History
            </h2>
            <div className="flex items-center gap-1.5 xl:gap-2 overflow-x-auto pb-1 xl:pb-0 -mx-1 px-1 xl:mx-0 xl:px-0 scrollbar-hide">
              {(["all", "purchase", "used", "refund", "bonus", "expired"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg xl:rounded-lg rounded-xl whitespace-nowrap transition-colors active:scale-95 xl:active:scale-100 shrink-0 ${
                    filter === f
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-body-color dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction List - Mobile Card Layout */}
        {isLoadingTransactions ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 xl:p-12 text-center">
            <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 xl:mb-4">
              <svg className="w-6 h-6 xl:w-8 xl:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm xl:text-base text-body-color dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-3 xl:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:scale-[0.98] xl:active:scale-100"
              >
                {/* Mobile: Stacked layout, Desktop: Horizontal */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 xl:gap-0">
                  <div className="flex items-center gap-2 xl:gap-4 flex-1 min-w-0">
                    {getTypeIcon(transaction.transaction_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm xl:text-base font-medium text-dark dark:text-white line-clamp-2 xl:line-clamp-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 mt-0.5">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between xl:justify-end xl:flex-col xl:items-end gap-2 xl:gap-1">
                    <p
                      className={`text-sm xl:text-base font-semibold ${
                        transaction.tokens_change > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.tokens_change > 0 ? "+" : ""}
                      {transaction.tokens_change} token{Math.abs(transaction.tokens_change) !== 1 ? "s" : ""}
                    </p>
                    <span className="text-[10px] xl:text-xs text-body-color dark:text-gray-400 capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full xl:bg-transparent xl:px-0 xl:py-0">
                      {getTransactionTypeLabel(transaction.transaction_type)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Classes with Check-In - Mobile Optimized */}
      {!isLoadingBookings && upcomingBookings.length > 0 && (
        <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 mt-6 xl:mt-8">
          <div className="p-4 xl:p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base xl:text-lg font-semibold text-dark dark:text-white">
                Upcoming Classes
              </h2>
              <Link
                href="/my-bookings"
                className="text-primary text-xs xl:text-sm font-semibold hover:underline"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {upcomingBookings.slice(0, 5).map((booking) => {
              const isCheckingIn = checkingIn === booking.id;
              const showCheckIn = canCheckIn(booking.scheduled_at);
              
              return (
                <div
                  key={booking.id}
                  className="p-3 xl:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 xl:gap-4">
                    <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 xl:w-6 xl:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <Link href={`/my-bookings`} className="flex-1 min-w-0">
                      <h4 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-0.5 xl:mb-1 truncate">
                        {booking.class_name}
                      </h4>
                      <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 truncate">
                        {booking.instructor_name} • {booking.location}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 xl:gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs xl:text-sm font-semibold text-dark dark:text-white mb-0.5">
                          {new Date(booking.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <p className="text-[10px] xl:text-xs text-body-color dark:text-gray-400">
                          {new Date(booking.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {showCheckIn && (
                        <button
                          onClick={(e) => handleCheckIn(booking.id, e)}
                          disabled={isCheckingIn}
                          className="px-3 xl:px-4 py-1.5 xl:py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-not-allowed text-white text-xs xl:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 xl:gap-2 whitespace-nowrap"
                        >
                          {isCheckingIn ? (
                            <>
                              <svg className="animate-spin h-3 w-3 xl:h-4 xl:w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="hidden xl:inline">Checking In...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 xl:w-4 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Check In</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokensPage;
