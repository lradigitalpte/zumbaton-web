"use client";

import { useState } from "react";
import Link from "next/link";
import MemberMobilePageShell from "@/components/Dashboard/MemberMobilePageShell";
import { useAuth } from "@/context/AuthContext";
import { useTokenTransactions, useTokenBalanceStats } from "@/hooks/useTokenTransactions";
import { useDashboardUpcomingBookings } from "@/hooks/useDashboard";

type FilterType = "all" | "purchase" | "used" | "refund" | "bonus" | "expired";

const TokensPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  // React Query hooks
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTokenTransactions(
    user?.id,
    filter === "all" ? undefined : filter
  );
  const { data: tokenBalance, isLoading: isLoadingBalance } = useTokenBalanceStats(user?.id);
  const { data: upcomingBookings = [], isLoading: isLoadingBookings } = useDashboardUpcomingBookings(user?.id);

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
      case "booking-consume":
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
      case "refund":
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
      "booking-consume": "used",
      "attendance-consume": "used",
      "no-show-consume": "used",
      "late-cancel-consume": "used",
      "refund": "refund",
      "booking-release": "refund",
      "admin-adjust": "bonus",
      expire: "expired",
    };
    return typeMap[type] || type;
  };

  return (
    <MemberMobilePageShell
      eyebrow="Tokens"
      title="Token history"
      description="Track purchases, usage, and balance"
      maxWidthClass="md:max-w-5xl"
    >
      {isLoadingBalance ? (
        <div className="flex items-center justify-center py-12 mb-6 xl:mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div data-keep-cols className="mb-6 grid grid-cols-2 gap-2 xl:mb-8 xl:grid-cols-4 xl:gap-4">
          {[
            { label: "Available", value: tokenBalance?.available || 0, hint: "Ready to book", highlight: true },
            { label: "Booked", value: tokenBalance?.pending || 0, hint: "Upcoming classes" },
            { label: "Used", value: tokenBalance?.used || 0, hint: "All time" },
            { label: "Expired", value: tokenBalance?.expired || 0, hint: "No longer valid" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl p-3 shadow-sm xl:p-5 ${
                stat.highlight
                  ? "col-span-2 bg-zinc-900 text-white xl:col-span-1 xl:bg-white xl:text-inherit dark:xl:bg-dark"
                  : "bg-white dark:bg-dark"
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  stat.highlight ? "text-lime-400 xl:text-zinc-500" : "text-zinc-500"
                }`}
              >
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums xl:text-3xl">{stat.value}</p>
              <p className={`mt-0.5 text-[10px] xl:text-sm ${stat.highlight ? "text-zinc-400 xl:text-body-color" : "text-zinc-500"}`}>
                {stat.hint}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-[1.25rem] bg-zinc-900 p-4 text-white xl:mb-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-bold">Need more tokens?</p>
          <p className="text-xs text-zinc-300">Save when you buy a larger pack.</p>
        </div>
        <Link
          href="/packages"
          className="rounded-full bg-white px-5 py-2.5 text-center text-sm font-bold text-zinc-900 active:scale-[0.98]"
        >
          Buy tokens
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-dark">
        {/* Header & Filters - Mobile Optimized */}
        <div className="p-4 xl:p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-3 xl:gap-4">
            <h2 className="text-base xl:text-lg font-semibold text-dark dark:text-white">
              Transaction History
            </h2>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {(["all", "purchase", "used", "refund", "bonus", "expired"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors active:scale-95 ${
                    filter === f
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {f}
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
        <div className="mt-6 overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-dark xl:mt-8">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </MemberMobilePageShell>
  );
};

export default TokensPage;
