"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SITE_IMAGES } from "@/data/site-images";
import {
  useDashboardTokenBalance,
  useDashboardUpcomingBookings,
  useDashboardUserStats,
} from "@/hooks/useDashboard";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function singaporeWeekdayIndex(now = new Date()): number {
  const short = now.toLocaleDateString("en-US", { weekday: "short", timeZone: "Asia/Singapore" });
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[short] ?? 0;
}

const DashboardPage = () => {
  const { user } = useAuth();

  // React Query hooks with caching
  const { data: tokenBalance = { available: 0, pending: 0, total: 0 }, isLoading: isLoadingBalance } = useDashboardTokenBalance(user?.id);
  const { data: upcomingBookings = [], isLoading: isLoadingBookings } = useDashboardUpcomingBookings(user?.id);
  const { data: stats = { totalClassesAttended: 0, tokensUsed: 0, currentStreak: 0, longestStreak: 0, weekSecured: false }, isLoading: isLoadingStats } = useDashboardUserStats(user?.id);

  const isDataLoading = isLoadingBalance || isLoadingBookings || isLoadingStats;
  const streakLabel = stats.currentStreak === 1 ? "1 week" : `${stats.currentStreak} weeks`;

  const streakDetail = stats.weekSecured
    ? "You already came in this week."
    : stats.currentStreak > 0
      ? `${streakLabel} so far. Come once before Sunday or it resets.`
      : "Come once this week. One class is enough to start.";

  const todayIndex = singaporeWeekdayIndex();

  return (
    <>
    <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 md:hidden">
      <header className="col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Your week</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Hi, {user?.name?.split(" ")[0] || "there"}
        </h1>
      </header>

      <section className="col-span-2 overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-dark">
        <div className="relative h-32 w-full">
          <Image
            src={SITE_IMAGES.heroPrimary}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/35 to-zinc-950/10" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-lime-400" strokeWidth={2} />
                <span className="text-xs font-semibold uppercase tracking-wide text-lime-300">
                  {stats.currentStreak > 0 ? "Week streak" : "Start streak"}
                </span>
              </div>
              <p className="text-4xl font-bold leading-none text-white">{stats.currentStreak}</p>
            </div>
            {stats.longestStreak > 0 && (
              <div className="rounded-xl bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">Best</p>
                <p className="text-lg font-bold text-white">{stats.longestStreak}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3.5">
          <p className="text-sm leading-snug text-zinc-600 dark:text-zinc-300">{streakDetail}</p>

          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span>This week (Mon–Sun)</span>
              <span className={stats.weekSecured ? "text-lime-600 dark:text-lime-400" : "text-amber-600 dark:text-amber-400"}>
                {stats.weekSecured ? "Class done" : "Not yet"}
              </span>
            </div>
            <div data-keep-cols className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((label, i) => {
                const isToday = i === todayIndex;
                let cellClass =
                  "mx-auto flex h-8 w-full max-w-[2.5rem] items-center justify-center rounded-lg text-[11px] font-bold ";
                let content: string = label;

                if (stats.weekSecured) {
                  cellClass += "bg-lime-400 text-zinc-900";
                  content = "✓";
                } else if (isToday) {
                  cellClass += "bg-zinc-900 text-lime-400 ring-2 ring-lime-400/50";
                } else if (i < todayIndex) {
                  cellClass += "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400";
                } else {
                  cellClass += "bg-zinc-100 text-zinc-400 dark:bg-zinc-800";
                }

                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className={cellClass}>{content}</div>
                    {isToday && !stats.weekSecured && (
                      <span className="text-[8px] font-semibold text-lime-700 dark:text-lime-400">Now</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {stats.weekSecured ? (
            <span className="mt-4 flex w-full items-center justify-center rounded-full bg-lime-400 px-4 py-3 text-sm font-semibold text-zinc-900">
              This week secured
            </span>
          ) : (
            <Link
              href="/book-classes"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white active:scale-[0.98]"
            >
              <CalendarDays className="h-4 w-4 text-lime-400" strokeWidth={2} />
              Book a class this week
            </Link>
          )}
        </div>
      </section>

      <section className="col-span-2 rounded-[1.25rem] border border-zinc-200/80 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">At a glance</p>
        <div
          data-keep-cols
          className="grid grid-cols-3 gap-2"
        >
          <div className="rounded-2xl bg-white px-2 py-3 text-center shadow-sm dark:bg-dark">
            <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">{tokenBalance.available}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Tokens</p>
          </div>
          <div className="rounded-2xl bg-white px-2 py-3 text-center shadow-sm dark:bg-dark">
            <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">{stats.totalClassesAttended}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Classes</p>
          </div>
          <div className="rounded-2xl bg-white px-2 py-3 text-center shadow-sm dark:bg-dark">
            <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">{stats.tokensUsed}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Used</p>
          </div>
        </div>
        {tokenBalance.pending > 0 && (
          <p className="mt-2 text-center text-xs font-medium text-lime-700 dark:text-lime-400">
            +{tokenBalance.pending} tokens pending
          </p>
        )}
      </section>

      <section className="col-span-2 grid grid-cols-2 gap-2">
        <p className="col-span-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Quick links</p>
        <Link
          href="/book-classes"
          className="col-span-2 flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
        >
          <span>Browse classes</span>
          <CalendarDays className="h-5 w-5 text-lime-400" strokeWidth={2} />
        </Link>
        <Link
          href="/my-bookings"
          className="flex min-h-[5.5rem] flex-col justify-between rounded-2xl bg-white p-3 shadow-sm active:scale-[0.98] dark:bg-dark"
        >
          <CalendarDays className="h-5 w-5 text-zinc-800 dark:text-lime-400" strokeWidth={2} />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Bookings</span>
        </Link>
        <Link
          href="/packages"
          className="flex min-h-[5.5rem] flex-col justify-between rounded-2xl bg-white p-3 shadow-sm active:scale-[0.98] dark:bg-dark"
        >
          <svg className="h-5 w-5 text-zinc-800 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Buy tokens</span>
        </Link>
      </section>

      <section className="col-span-2 rounded-[1.35rem] bg-white p-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:bg-dark">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Upcoming</h2>
          {upcomingBookings.length > 0 && (
            <Link href="/my-bookings" className="text-xs font-semibold text-zinc-800 dark:text-lime-400">
              View all →
            </Link>
          )}
        </div>
        {isDataLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary" />
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div className="overflow-hidden rounded-xl">
            <div className="relative h-28">
              <Image src={SITE_IMAGES.heroSecondary} alt="" fill className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-zinc-950/50" />
              <p className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white">
                No class booked yet — pick one to start your streak.
              </p>
            </div>
            <Link
              href="/book-classes"
              className="mt-3 flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white active:scale-[0.98]"
            >
              Book your first class
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {upcomingBookings.slice(0, 4).map((booking) => (
              <Link
                key={booking.id}
                href="/my-bookings"
                className="flex gap-3 rounded-xl bg-zinc-50 p-2 active:scale-[0.99] dark:bg-zinc-800/80"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                  <Image src={SITE_IMAGES.heroTertiary} alt="" fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{booking.class_name}</p>
                  <p className="truncate text-xs text-zinc-500">{booking.instructor_name}</p>
                  <p className="mt-0.5 text-xs font-medium text-lime-700 dark:text-lime-400">
                    {new Date(booking.scheduled_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "Asia/Singapore",
                    })}{" "}
                    ·{" "}
                    {new Date(booking.scheduled_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Singapore",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>

    <div className="hidden pb-6 md:block">
      {/* Welcome Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-dark dark:text-white sm:text-3xl">
          Welcome back, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-body-color dark:text-gray-400 sm:text-base">
          One class a week keeps your streak going.
        </p>
      </div>

      <section className="mb-6 rounded-[1.75rem] bg-[#ececec] p-3 dark:bg-zinc-800/80 sm:mb-8 sm:p-4">
        <div className="flex flex-col gap-5 rounded-[1.35rem] bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:bg-dark sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-900/10 bg-zinc-900 shadow-lg">
              <Flame className="h-8 w-8 text-lime-400" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                {stats.currentStreak}
              </p>
              <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                {stats.currentStreak > 0 ? "Week streak" : "Start your streak"}
              </p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {stats.weekSecured
                  ? "You already came in this week."
                  : stats.currentStreak > 0
                    ? `${streakLabel} so far. Come once before Sunday or it resets.`
                    : "Come once this week. One class is enough to start."}
              </p>
              {stats.longestStreak > 0 && (
                <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Best {stats.longestStreak} {stats.longestStreak === 1 ? "week" : "weeks"}
                </p>
              )}
            </div>
          </div>
          {stats.weekSecured ? (
            <span className="inline-flex w-full items-center justify-center rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-900 sm:w-auto">
              This week secured
            </span>
          ) : (
            <Link
              href="/book-classes"
              className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-lime-400 dark:text-zinc-900 sm:w-auto"
            >
              Come once this week
            </Link>
          )}
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
        <div className="col-span-2 rounded-[1.35rem] bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:bg-dark sm:col-span-1 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900">
              <svg className="h-5 w-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Active
            </span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {tokenBalance.available}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Available Tokens
          </p>
          {tokenBalance.pending > 0 && (
            <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-500"></span>
              +{tokenBalance.pending} pending
            </p>
          )}
        </div>

        <div className="rounded-[1.35rem] bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:bg-dark sm:p-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900">
            <svg className="h-5 w-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {stats.totalClassesAttended}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">
            Classes Attended
          </p>
        </div>

        <div className="rounded-[1.35rem] bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:bg-dark sm:p-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900">
            <svg className="h-5 w-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {stats.tokensUsed}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">
            Tokens Used
          </p>
        </div>
      </div>

      {/* Quick Actions - Mobile App Style */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-dark dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/book-classes"
            className="group rounded-[1.35rem] bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.01] active:scale-[0.99] dark:bg-dark sm:p-6"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
              <svg className="h-7 w-7 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-bold tracking-tight text-dark dark:text-white">
              Book a Class
            </h3>
            <p className="text-sm text-body-color dark:text-gray-400">
              Browse available classes
            </p>
          </Link>

          <Link
            href="/my-bookings"
            className="rounded-[1.35rem] bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.01] active:scale-[0.99] dark:bg-dark sm:p-6"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
              <svg className="h-7 w-7 text-zinc-700 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-bold tracking-tight text-dark dark:text-white">
              My Bookings
            </h3>
            <p className="text-sm text-body-color dark:text-gray-400">
              View your reservations
            </p>
          </Link>

          <Link
            href="/packages"
            className="rounded-[1.35rem] bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.01] active:scale-[0.99] dark:bg-dark sm:p-6"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
              <svg className="h-7 w-7 text-zinc-700 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-bold tracking-tight text-dark dark:text-white">
              Buy Tokens
            </h3>
            <p className="text-sm text-body-color dark:text-gray-400">
              Purchase token packages
            </p>
          </Link>
        </div>
      </div>

      {/* Upcoming Classes - Mobile App Style */}
      <div className="rounded-[1.75rem] bg-[#ececec] p-3 dark:bg-zinc-800/80 sm:p-4">
        <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:bg-dark sm:p-6">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-dark dark:text-white">
            Upcoming Classes
          </h2>
          {upcomingBookings.length > 0 && (
            <Link
              href="/my-bookings"
              className="text-sm font-semibold text-zinc-800 underline dark:text-lime-400"
            >
              View all →
            </Link>
          )}
        </div>

        {isDataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 sm:h-20 sm:w-20">
              <svg className="h-8 w-8 text-lime-400 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-body-color dark:text-gray-400 mb-4 font-medium">No upcoming classes booked</p>
            <Link
              href="/book-classes"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-lime-400 dark:text-zinc-900"
            >
              Book Your First Class
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map((booking) => {
              
              return (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 rounded-[1.25rem] bg-[#ececec] p-4 transition-colors hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 sm:h-14 sm:w-14">
                    <svg className="h-6 w-6 text-lime-400 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <Link href={`/my-bookings`} className="flex-1 min-w-0">
                    <h4 className="font-semibold text-dark dark:text-white mb-1 truncate">
                      {booking.class_name}
                    </h4>
                    <p className="text-sm text-body-color dark:text-gray-400 truncate">
                      {booking.instructor_name} • {booking.location}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-dark dark:text-white text-sm mb-1">
                        {new Date(booking.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-body-color dark:text-gray-400">
                        {new Date(booking.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
    </>
  );
};

export default DashboardPage;
