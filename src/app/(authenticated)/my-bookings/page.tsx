"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserBookings, useCancelBooking } from "@/hooks/useBookings";
import { SITE_IMAGES } from "@/data/site-images";
import { formatDate, formatTime, formatDateFull } from "@/lib/utils";
import Modal from "@/components/Modal/Modal";

type FilterType = "upcoming" | "past" | "all";

const MAX_LOADING_TIME = 10000; // 10 seconds max loading time

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const MyBookingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FilterType>("upcoming");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // React Query hooks
  const { data: bookings = [], isLoading, isError, error, refetch } = useUserBookings(user?.id, filter);
  const cancelBookingMutation = useCancelBooking();

  // Add timeout protection for loading state
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, MAX_LOADING_TIME);

      return () => clearTimeout(timeoutId);
    } else if (!isLoading) {
      setLoadingTimeout(false);
    }
  }, [isLoading, loadingTimeout]);

  const handleCancelClick = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!user?.id || !cancelBookingId) return;

    cancelBookingMutation.mutate(
      {
        userId: user.id,
        bookingId: cancelBookingId,
      },
      {
        onSuccess: () => {
          setShowCancelModal(false);
          setCancelBookingId(null);
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          bg: "bg-green-500/10",
          text: "text-green-600 dark:text-green-400",
          border: "border-green-500/20",
          label: "Confirmed"
        };
      case "cancelled":
      case "cancelled-late":
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-500/20",
          label: "Cancelled"
        };
      case "attended":
        return {
          bg: "bg-primary/10",
          text: "text-primary dark:text-primary",
          border: "border-primary/20",
          label: "Attended"
        };
      case "no-show":
      case "no_show":
        return {
          bg: "bg-red-500/10",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-500/20",
          label: "No Show"
        };
      case "waitlist":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-600 dark:text-yellow-400",
          border: "border-yellow-500/20",
          label: "Waitlist"
        };
      default:
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-500/20",
          label: status
        };
    }
  };

  const canCancel = (booking: any) => {
    if (booking.status !== "confirmed") return false;
    // Disallow cancellations on the same calendar day as the class.
    // Refunds are only valid if cancelled by 23:59 the previous day.
    const classDate = new Date(booking.scheduled_at);
    const today = new Date();
    classDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return classDate.getTime() !== today.getTime();
  };

  const selectedBooking = bookings.find(b => b.id === cancelBookingId);

  const bookingsByDate = useMemo(() => {
    const groups = new Map<string, typeof bookings>();
    for (const booking of bookings) {
      const key = new Date(booking.scheduled_at).toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
      });
      const list = groups.get(key) ?? [];
      list.push(booking);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) =>
      filter === "past" ? b.localeCompare(a) : a.localeCompare(b)
    );
  }, [bookings, filter]);

  return (
    <div className="mx-auto max-w-lg pb-6 md:max-w-3xl">
      <div className="mb-4 flex items-start justify-between gap-3 md:mb-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 md:hidden">
            Reservations
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
            My Bookings
          </h1>
          <p className="mt-1 hidden text-sm text-body-color dark:text-gray-400 md:block">
            Manage your class reservations
          </p>
        </div>
        <Link
          href="/book-classes"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] md:px-5"
        >
          <CalendarDays className="hidden h-4 w-4 text-lime-400 md:block" strokeWidth={2} />
          Book
        </Link>
      </div>

      <div className="mb-4 md:mb-6">
        <div
          data-keep-cols
          className="grid grid-cols-3 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800/80"
        >
          {(["upcoming", "past", "all"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-xl py-2.5 text-sm font-bold capitalize transition-all active:scale-[0.98] ${
                filter === tab
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-dark dark:text-white"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List - Mobile App Style */}
      {isLoading && !loadingTimeout ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (loadingTimeout || isError) ? (
        <div className="bg-white dark:bg-dark rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-body-color dark:text-gray-400 text-base sm:text-lg mb-2 font-semibold">
            {loadingTimeout ? "Loading is taking longer than expected" : "Failed to load bookings"}
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mb-6">
            {loadingTimeout 
              ? "Please check your internet connection and try again"
              : error?.message || "An error occurred while fetching your bookings"}
          </p>
          <button
            onClick={() => {
              setLoadingTimeout(false);
              refetch();
            }}
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors active:scale-95 shadow-md"
          >
            Try Again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <article className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-dark">
          <div className="relative h-36 w-full">
            <Image
              src={SITE_IMAGES.heroSecondary}
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/40 to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-sm font-medium leading-snug text-white">
              {filter === "upcoming"
                ? "No classes booked yet — find one on the schedule."
                : filter === "past"
                  ? "Past bookings will show up here after you attend."
                  : "When you book a class, it will appear here."}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-base font-bold text-zinc-900 dark:text-white">
              No {filter === "all" ? "" : `${filter} `}bookings
            </p>
            <Link
              href="/book-classes"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
            >
              <CalendarDays className="h-4 w-4 text-lime-400" strokeWidth={2} />
              Browse classes
            </Link>
          </div>
        </article>
      ) : (
        <div className="space-y-4">
          {bookingsByDate.map(([dateKey, bookingsOnDate]) => {
            const firstScheduled = bookingsOnDate[0].scheduled_at;
            const fullDateLabel = formatDateFull(firstScheduled);
            const sectionDate = new Date(firstScheduled);
            const isToday = sectionDate.toDateString() === new Date().toDateString();
            const isTomorrow =
              sectionDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
            const dayBadge = isToday ? "Today" : isTomorrow ? "Tomorrow" : null;

            return (
              <article
                key={dateKey}
                className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-dark"
              >
                <header className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <h2 className="text-base font-bold leading-snug text-zinc-900 dark:text-white">
                    {fullDateLabel}
                  </h2>
                  {dayBadge && (
                    <span className="shrink-0 rounded-full bg-lime-400/30 px-2.5 py-0.5 text-[11px] font-bold text-lime-900 dark:text-lime-300">
                      {dayBadge}
                    </span>
                  )}
                </header>
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {bookingsOnDate.map((booking) => {
                    const statusBadge = getStatusBadge(booking.status);
                    const isCancelled =
                      booking.status === "cancelled" || booking.status === "cancelled-late";
                    const initials = getInitials(booking.instructor_name);

                    return (
                      <li key={booking.id} className={isCancelled ? "opacity-70" : undefined}>
                        <div className="px-4 py-3.5">
                          <div className="flex items-start gap-3">
                            <div className="w-[4.5rem] shrink-0 pt-0.5">
                              <p className="text-base font-bold tabular-nums leading-tight text-zinc-900 dark:text-white">
                                {formatTime(booking.scheduled_at)}
                              </p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-xs font-bold text-lime-400">
                              {booking.instructor_avatar ? (
                                <img
                                  src={booking.instructor_avatar}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                initials
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start gap-2">
                                <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
                                  {booking.class_name}
                                </p>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge.bg} ${statusBadge.text}`}
                                >
                                  {statusBadge.label}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {booking.instructor_name} · {booking.location}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            {booking.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => handleCancelClick(booking.id)}
                                disabled={cancelBookingMutation.isPending || !canCancel(booking)}
                                title={
                                  !canCancel(booking)
                                    ? "Same-day cancellations are not allowed. Cancel by 23:59 the day before for a refund."
                                    : undefined
                                }
                                className={`flex-1 rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 dark:border-red-900/50 dark:text-red-400 ${
                                  !canCancel(booking) || cancelBookingMutation.isPending
                                    ? "cursor-not-allowed opacity-50"
                                    : "active:scale-[0.98]"
                                }`}
                              >
                                {cancelBookingMutation.isPending && cancelBookingId === booking.id
                                  ? "Cancelling..."
                                  : "Cancel"}
                              </button>
                            )}
                            <Link
                              href={`/book-classes/${booking.class_id}`}
                              className="flex-1 rounded-full bg-zinc-100 py-2 text-center text-xs font-bold text-zinc-900 active:scale-[0.98] dark:bg-zinc-800 dark:text-white"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelBookingId(null);
        }}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking?"
        size="sm"
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCancelModal(false);
                setCancelBookingId(null);
              }}
              disabled={cancelBookingMutation.isPending}
              className="w-full rounded-full border border-zinc-200 py-3.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 sm:flex-1 sm:rounded-xl sm:py-3 sm:bg-zinc-100 sm:dark:bg-zinc-800"
            >
              Keep booking
            </button>
            <button
              type="button"
              onClick={handleCancelConfirm}
              disabled={cancelBookingMutation.isPending}
              className="w-full rounded-full bg-red-600 py-3.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 sm:flex-1 sm:rounded-xl sm:py-3"
            >
              {cancelBookingMutation.isPending ? "Cancelling..." : "Yes, cancel"}
            </button>
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-zinc-900 px-4 py-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime-400">Class</p>
              <p className="mt-1 text-lg font-bold leading-snug">{selectedBooking.class_name}</p>
              <p className="mt-2 text-sm text-zinc-300">
                {formatDate(selectedBooking.scheduled_at)} · {formatTime(selectedBooking.scheduled_at)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {selectedBooking.instructor_name} · {selectedBooking.location}
              </p>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Tokens are refunded according to the cancellation policy.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
