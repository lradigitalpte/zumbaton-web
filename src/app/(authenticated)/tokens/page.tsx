"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTokenTransactions, useTokenBalanceStats } from "@/hooks/useTokenTransactions";

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case "attendance-consume":
      case "no-show-consume":
      case "late-cancel-consume":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        );
      case "booking-release":
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
        );
      case "admin-adjust":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        );
      case "expire":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
          Token History
        </h1>
        <p className="text-body-color dark:text-gray-400">
          Track your token purchases, usage, and balance
        </p>
      </div>

      {/* Balance Cards */}
      {isLoadingBalance ? (
        <div className="flex items-center justify-center py-12 mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                Available
              </span>
            </div>
            <p className="text-3xl font-bold text-dark dark:text-white">{tokenBalance?.available || 0}</p>
            <p className="text-sm text-body-color dark:text-gray-400">Ready to use</p>
          </div>

          <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-3xl font-bold text-dark dark:text-white">{tokenBalance?.pending || 0}</p>
            <p className="text-sm text-body-color dark:text-gray-400">In booked classes</p>
          </div>

          <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-dark dark:text-white">{tokenBalance?.used || 0}</p>
            <p className="text-sm text-body-color dark:text-gray-400">Tokens used</p>
          </div>

          <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-dark dark:text-white">{tokenBalance?.expired || 0}</p>
            <p className="text-sm text-body-color dark:text-gray-400">Tokens expired</p>
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 mb-8 flex items-center justify-between">
        <div className="text-white">
          <h3 className="text-lg font-semibold mb-1">Need more tokens?</h3>
          <p className="opacity-80 text-sm">Purchase a package and save with bulk discounts.</p>
        </div>
        <Link
          href="/packages"
          className="px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Buy Tokens
        </Link>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        {/* Header & Filters */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Transaction History
            </h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {(["all", "purchase", "used", "refund", "bonus", "expired"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
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

        {/* Transaction List */}
        {isLoadingTransactions ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-body-color dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getTypeIcon(transaction.transaction_type)}
                  <div>
                    <p className="font-medium text-dark dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-body-color dark:text-gray-400">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.tokens_change > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.tokens_change > 0 ? "+" : ""}
                    {transaction.tokens_change} token{Math.abs(transaction.tokens_change) !== 1 ? "s" : ""}
                  </p>
                  <span className="text-xs text-body-color dark:text-gray-400 capitalize">
                    {getTransactionTypeLabel(transaction.transaction_type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokensPage;
