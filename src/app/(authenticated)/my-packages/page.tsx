"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyPackages, MyPackage, useDeletePackage } from "@/hooks/useMyPackages";

type StatusFilter = "all" | "active" | "expired" | "depleted";

const MyPackagesPage = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [packageToDelete, setPackageToDelete] = useState<MyPackage | null>(null);
  const { data, isLoading, error } = useMyPackages(statusFilter === "all" ? undefined : statusFilter);
  const deletePackage = useDeletePackage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(priceCents / 100);
  };

  const getStatusBadge = (pkg: MyPackage) => {
    if (pkg.status === "frozen") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Frozen
        </span>
      );
    }
    if (pkg.isExpired || pkg.status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Expired
        </span>
      );
    }
    if (pkg.isExpiringSoon) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Expiring Soon
        </span>
      );
    }
    if (pkg.status === "depleted") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Depleted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Active
      </span>
    );
  };

  const getExpiryMessage = (pkg: MyPackage) => {
    if (pkg.isExpired) {
      return "Expired";
    }
    if (pkg.daysUntilExpiry === 0) {
      return "Expires today";
    }
    if (pkg.daysUntilExpiry === 1) {
      return "Expires tomorrow";
    }
    if (pkg.daysUntilExpiry <= 7) {
      return `Expires in ${pkg.daysUntilExpiry} days`;
    }
    return `Expires ${formatDate(pkg.expiresAt)}`;
  };

  return (
    <div className="pb-6">
      {/* Page Header */}
      <div className="mb-4 xl:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-dark dark:text-white mb-1">
            My Packages
          </h1>
          <p className="text-sm xl:text-base text-body-color dark:text-gray-400">
            View your purchased token packages and expiry dates
          </p>
        </div>
        <Link
          href="/packages"
          className="inline-flex items-center justify-center gap-2 px-4 xl:px-6 py-2 xl:py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4 xl:w-5 xl:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Buy Tokens</span>
        </Link>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 mb-6 xl:mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-800 dark:text-red-300 text-sm">
            Failed to load packages. Please try again.
          </p>
        </div>
      ) : (
        <>
          {data?.stats && (
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 xl:gap-4 mb-6 xl:mb-8">
              <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
                <p className="text-2xl xl:text-3xl font-bold text-dark dark:text-white">{data.stats.total}</p>
                <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Total Packages</p>
              </div>
              <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
                <p className="text-2xl xl:text-3xl font-bold text-green-600 dark:text-green-400">{data.stats.active}</p>
                <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Active</p>
              </div>
              <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
                <p className="text-2xl xl:text-3xl font-bold text-amber-600 dark:text-amber-400">{data.stats.expiringSoon}</p>
                <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Expiring Soon</p>
              </div>
              <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 xl:p-5">
                <p className="text-2xl xl:text-3xl font-bold text-red-600 dark:text-red-400">{data.stats.expired}</p>
                <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Expired</p>
              </div>
              <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 xl:p-5 col-span-2 xl:col-span-1">
                <p className="text-2xl xl:text-3xl font-bold text-blue-600 dark:text-blue-400">{data.stats.frozen}</p>
                <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400">Frozen</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-4 xl:mb-6">
            <div className="flex items-center gap-1.5 xl:gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(["all", "active", "expired", "depleted"] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 xl:px-4 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Packages List */}
          {data?.packages && data.packages.length === 0 ? (
            <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 xl:p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">No packages found</h3>
              <p className="text-sm text-body-color dark:text-gray-400 mb-6">
                {statusFilter === "all" 
                  ? "You haven't purchased any packages yet."
                  : `No ${statusFilter} packages found.`}
              </p>
              {statusFilter === "all" && (
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse Packages
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
              {data?.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white dark:bg-dark rounded-xl shadow-sm border ${
                    pkg.isExpiringSoon && !pkg.isExpired
                      ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
                      : pkg.isExpired
                      ? "border-red-200 dark:border-red-800"
                      : "border-gray-100 dark:border-gray-800"
                  } p-4 xl:p-6`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg xl:text-xl font-bold text-dark dark:text-white mb-1 line-clamp-1">
                        {pkg.packageName}
                      </h3>
                      {pkg.packageDescription && (
                        <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 line-clamp-2">
                          {pkg.packageDescription}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(pkg)}
                  </div>

                  {/* Token Info */}
                  <div className="grid grid-cols-2 gap-3 xl:gap-4 mb-4">
                    <div>
                      <p className="text-xs text-body-color dark:text-gray-400 mb-1">Tokens Available</p>
                      <p className="text-xl xl:text-2xl font-bold text-dark dark:text-white">
                        {pkg.tokensAvailable}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-body-color dark:text-gray-400 mb-1">Tokens Used</p>
                      <p className="text-xl xl:text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {pkg.tokensUsed} / {pkg.originalTokenCount}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-body-color dark:text-gray-400 mb-1">
                      <span>Usage</span>
                      <span>{pkg.usagePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(pkg.usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Held Tokens Warning */}
                  {pkg.tokensHeld > 0 && (
                    <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">
                        <span className="font-medium">{pkg.tokensHeld}</span> token{pkg.tokensHeld !== 1 ? "s" : ""} held for bookings
                      </p>
                    </div>
                  )}

                  {/* Expiry Info */}
                  <div className={`p-3 rounded-lg ${
                    pkg.isExpired
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      : pkg.isExpiringSoon
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                      : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-body-color dark:text-gray-400 mb-1">Expiry Date</p>
                        <p className="text-sm font-medium text-dark dark:text-white">
                          {formatDate(pkg.expiresAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-body-color dark:text-gray-400 mb-1">Status</p>
                        <p className={`text-sm font-medium ${
                          pkg.isExpired
                            ? "text-red-600 dark:text-red-400"
                            : pkg.isExpiringSoon
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                        }`}>
                          {getExpiryMessage(pkg)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-body-color dark:text-gray-400">
                    <span>Purchased: {formatDate(pkg.purchasedAt)}</span>
                    <span>{formatPrice(pkg.priceCents, pkg.currency)}</span>
                  </div>

                  {/* Frozen Info */}
                  {pkg.status === "frozen" && pkg.frozenUntil && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        Frozen until {formatDate(pkg.frozenUntil)}
                      </p>
                    </div>
                  )}

                  {/* Delete Button - Only for expired and depleted packages */}
                  {(pkg.isExpired || pkg.status === "expired" || pkg.status === "depleted") && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => setPackageToDelete(pkg)}
                        className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Package
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CTA Banner */}
          {statusFilter === "all" && data?.stats && data.stats.active === 0 && (
            <div className="mt-6 bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 xl:p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
              <div className="text-white flex-1">
                <h3 className="text-sm xl:text-lg font-bold mb-1">Need more tokens?</h3>
                <p className="text-xs xl:text-sm opacity-90">Purchase a package and start booking classes today.</p>
              </div>
              <Link
                href="/packages"
                className="w-full xl:w-auto px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Buy Tokens
              </Link>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-dark dark:text-white mb-2">Delete Package</h3>
            <p className="text-sm text-body-color dark:text-gray-400 mb-4">
              Are you sure you want to delete "{packageToDelete.packageName}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPackageToDelete(null)}
                disabled={deletePackage.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deletePackage.mutateAsync(packageToDelete.id)
                    setPackageToDelete(null)
                  } catch (error) {
                    console.error('Failed to delete package:', error)
                    alert(error instanceof Error ? error.message : 'Failed to delete package')
                  }
                }}
                disabled={deletePackage.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletePackage.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPackagesPage;

