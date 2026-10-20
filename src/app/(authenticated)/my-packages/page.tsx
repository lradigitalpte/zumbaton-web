"use client";



import { useState } from "react";

import Link from "next/link";

import MemberMobilePageShell from "@/components/Dashboard/MemberMobilePageShell";
import Modal from "@/components/Modal/Modal";

import { useAuth } from "@/context/AuthContext";

import { useTokenBalanceStats } from "@/hooks/useTokenTransactions";

import { useMyPackages, MyPackage, useDeletePackage } from "@/hooks/useMyPackages";



type StatusFilter = "all" | "active" | "expired" | "depleted";



const FILTERS: { id: StatusFilter; label: string }[] = [

  { id: "all", label: "All" },

  { id: "active", label: "Active" },

  { id: "expired", label: "Expired" },

  { id: "depleted", label: "Used up" },

];



const MyPackagesPage = () => {

  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [packageToDelete, setPackageToDelete] = useState<MyPackage | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useMyPackages(

    statusFilter === "all" ? undefined : statusFilter

  );

  const { data: tokenBalance, isLoading: isLoadingBalance } = useTokenBalanceStats(user?.id);

  const deletePackage = useDeletePackage();



  const formatDate = (dateString: string) =>

    new Date(dateString).toLocaleDateString("en-SG", {

      year: "numeric",

      month: "short",

      day: "numeric",

    });



  const formatPrice = (priceCents: number, currency: string) =>

    new Intl.NumberFormat("en-SG", {

      style: "currency",

      currency: currency || "SGD",

    }).format(priceCents / 100);



  const getStatusLabel = (pkg: MyPackage) => {

    if (pkg.status === "frozen") return { text: "Frozen", tone: "blue" as const };

    if (pkg.isExpired || pkg.status === "expired") return { text: "Expired", tone: "red" as const };

    if (pkg.isExpiringSoon) return { text: "Expiring soon", tone: "amber" as const };

    if (pkg.status === "depleted") return { text: "Used up", tone: "zinc" as const };

    return { text: "Active", tone: "lime" as const };

  };



  const statusPillClass = (tone: "lime" | "amber" | "red" | "blue" | "zinc") => {

    switch (tone) {

      case "lime":

        return "bg-lime-100 text-lime-900 dark:bg-lime-900/40 dark:text-lime-300";

      case "amber":

        return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300";

      case "red":

        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

      case "blue":

        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";

      default:

        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";

    }

  };



  const getExpiryMessage = (pkg: MyPackage) => {

    if (pkg.isExpired) return "Expired";

    if (pkg.daysUntilExpiry === 0) return "Expires today";

    if (pkg.daysUntilExpiry === 1) return "Expires tomorrow";

    if (pkg.daysUntilExpiry <= 7) return `${pkg.daysUntilExpiry} days left`;

    return `Until ${formatDate(pkg.expiresAt)}`;

  };



  const progressBarClass = (pkg: MyPackage) => {

    if (pkg.isExpired) return "bg-red-500";

    if (pkg.isExpiringSoon) return "bg-amber-500";

    if (pkg.status === "depleted") return "bg-zinc-400";

    return "bg-lime-500";

  };



  const stats = data?.stats;

  const packages = data?.packages ?? [];

  const hasAnyPackages = (stats?.total ?? 0) > 0;

  const showEmptyList = !isLoading && !error && packages.length === 0;



  return (

    <MemberMobilePageShell

      eyebrow="Tokens"

      title="My packages"

      description="Track token packs you’ve bought and when they expire."

      showDescriptionOnMobile

      maxWidthClass="md:max-w-5xl"

      action={

        <Link

          href="/packages"

          className="inline-flex shrink-0 items-center rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white active:scale-[0.98] dark:bg-lime-400 dark:text-zinc-900"

        >

          Buy tokens

        </Link>

      }

    >

      {!isLoadingBalance && (

        <div className="mb-5 flex items-center justify-between gap-3 rounded-[1.25rem] bg-zinc-900 p-4 text-white">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-400">

              Ready to book

            </p>

            <p className="text-3xl font-bold tabular-nums">{tokenBalance?.available ?? 0}</p>

            <p className="text-xs text-zinc-400">tokens across all active packs</p>

          </div>

          <Link

            href="/book-classes"

            className="shrink-0 rounded-full bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-900 active:scale-[0.98]"

          >

            Book class

          </Link>

        </div>

      )}



      {isLoading ? (

        <div className="flex items-center justify-center py-16">

          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-lime-400" />

        </div>

      ) : error ? (

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">

          <p className="text-sm text-red-800 dark:text-red-300">

            {(error as Error)?.message || "Failed to load packages. Please try again."}

          </p>

          <button

            type="button"

            onClick={() => refetch()}

            disabled={isFetching}

            className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"

          >

            {isFetching ? "Retrying…" : "Retry"}

          </button>

        </div>

      ) : (

        <>

          {hasAnyPackages && stats && (

            <div

              data-keep-cols

              className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:gap-3"

            >

              {[

                { label: "Active", value: stats.active, accent: "text-lime-600 dark:text-lime-400" },

                { label: "Expiring", value: stats.expiringSoon, accent: "text-amber-600 dark:text-amber-400" },

                { label: "Expired", value: stats.expired, accent: "text-red-600 dark:text-red-400" },

                { label: "Total", value: stats.total, accent: "text-zinc-900 dark:text-white" },

              ].map((item) => (

                <div

                  key={item.label}

                  className="rounded-2xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-dark"

                >

                  <p className={`text-2xl font-bold tabular-nums ${item.accent}`}>{item.value}</p>

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">

                    {item.label}

                  </p>

                </div>

              ))}

            </div>

          )}



          <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">

            {FILTERS.map((f) => (

              <button

                key={f.id}

                type="button"

                onClick={() => setStatusFilter(f.id)}

                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors active:scale-[0.98] ${

                  statusFilter === f.id

                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"

                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"

                }`}

              >

                {f.label}

              </button>

            ))}

          </div>



          {showEmptyList ? (

            <div className="overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-zinc-100 to-white p-8 text-center dark:from-zinc-900 dark:to-dark">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-2xl font-bold text-lime-400">

                0

              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">

                {statusFilter === "all" ? "No packages yet" : `No ${FILTERS.find((x) => x.id === statusFilter)?.label.toLowerCase()} packs`}

              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">

                {statusFilter === "all"

                  ? "When you buy a token pack, it will show up here with expiry and usage."

                  : "Try another filter or buy a new pack."}

              </p>

              <Link

                href="/packages"

                className="mt-6 inline-flex rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white active:scale-[0.98] dark:bg-lime-400 dark:text-zinc-900"

              >

                Browse token packs

              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {packages.map((pkg) => {

                const status = getStatusLabel(pkg);

                const remaining = pkg.tokensAvailable;

                const total = pkg.originalTokenCount;



                return (

                  <article

                    key={pkg.id}

                    className={`overflow-hidden rounded-[1.35rem] border bg-white shadow-[0_8px_28px_rgba(0,0,0,0.06)] dark:bg-dark ${

                      pkg.isExpiringSoon && !pkg.isExpired

                        ? "border-amber-200 dark:border-amber-800"

                        : pkg.isExpired

                          ? "border-red-200/80 dark:border-red-900"

                          : "border-zinc-100 dark:border-zinc-800"

                    }`}

                  >

                    <div className="p-4">

                      <div className="flex gap-3">

                        <div

                          className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${

                            pkg.isExpired || pkg.status === "depleted"

                              ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"

                              : "bg-zinc-900 text-lime-400"

                          }`}

                        >

                          <span className="text-xl font-bold leading-none tabular-nums">{remaining}</span>

                          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-80">

                            left

                          </span>

                        </div>



                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-start justify-between gap-2">

                            <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">

                              {pkg.packageName}

                            </h3>

                            <span

                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusPillClass(status.tone)}`}

                            >

                              {status.text}

                            </span>

                          </div>

                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">

                            {pkg.tokensUsed} of {total} used · {getExpiryMessage(pkg)}

                          </p>

                        </div>

                      </div>



                      <div className="mt-3">

                        <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-500">

                          <span>Usage</span>

                          <span>{pkg.usagePercentage}%</span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">

                          <div

                            className={`h-full rounded-full transition-all ${progressBarClass(pkg)}`}

                            style={{ width: `${Math.min(pkg.usagePercentage, 100)}%` }}

                          />

                        </div>

                      </div>



                      {pkg.tokensHeld > 0 && (

                        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">

                          {pkg.tokensHeld} token{pkg.tokensHeld !== 1 ? "s" : ""} held for upcoming bookings

                        </p>

                      )}



                      <div className="mt-3 flex flex-wrap gap-2">

                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">

                          Bought {formatDate(pkg.purchasedAt)}

                        </span>

                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">

                          {formatPrice(pkg.priceCents, pkg.currency)}

                        </span>

                      </div>



                      {pkg.status === "frozen" && pkg.frozenUntil && (

                        <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">

                          Frozen until {formatDate(pkg.frozenUntil)}

                        </p>

                      )}



                      {(pkg.isExpired || pkg.status === "expired" || pkg.status === "depleted") && (

                        <button

                          type="button"

                          onClick={() => setPackageToDelete(pkg)}

                          className="mt-4 w-full rounded-full border border-red-200 py-2.5 text-sm font-semibold text-red-600 active:scale-[0.99] dark:border-red-900 dark:text-red-400"

                        >

                          Remove from list

                        </button>

                      )}

                    </div>

                  </article>

                );

              })}

            </div>

          )}



          {hasAnyPackages && (stats?.active ?? 0) === 0 && statusFilter === "all" && (

            <div className="mt-6 flex flex-col gap-3 rounded-[1.25rem] bg-zinc-900 p-4 text-white sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-bold">Need more tokens?</p>

                <p className="text-xs text-zinc-400">Grab a pack and book your next class.</p>

              </div>

              <Link

                href="/packages"

                className="rounded-full bg-lime-400 px-5 py-2.5 text-center text-sm font-bold text-zinc-900 active:scale-[0.98]"

              >

                Buy tokens

              </Link>

            </div>

          )}

        </>

      )}



      <Modal
        isOpen={!!packageToDelete}
        onClose={() => !deletePackage.isPending && setPackageToDelete(null)}
        title="Remove package?"
        size="md"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPackageToDelete(null)}
              disabled={deletePackage.isPending}
              className="flex-1 rounded-full bg-zinc-100 py-2.5 text-sm font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!packageToDelete) return;
                try {
                  await deletePackage.mutateAsync(packageToDelete.id);
                  setPackageToDelete(null);
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Failed to remove package");
                }
              }}
              disabled={deletePackage.isPending}
              className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {deletePackage.isPending ? "Removing…" : "Remove"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {packageToDelete
            ? `“${packageToDelete.packageName}” will be removed from your list. This cannot be undone.`
            : ""}
        </p>
      </Modal>

    </MemberMobilePageShell>

  );

};



export default MyPackagesPage;


