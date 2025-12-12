"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useUserBookings, useCancelBooking } from "@/hooks/useBookings";
import { formatDate, formatTime } from "@/lib/utils";
import Modal from "@/components/Modal/Modal";

type FilterType = "upcoming" | "past" | "all";

const MyBookingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FilterType>("upcoming");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // React Query hooks
  const { data: bookings = [], isLoading } = useUserBookings(user?.id, filter);
  const cancelBookingMutation = useCancelBooking();

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
    const classTime = new Date(booking.scheduled_at);
    const now = new Date();
    const hoursUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilClass > 0;
  };

  const selectedBooking = bookings.find(b => b.id === cancelBookingId);

  return (
    <div className="pb-6">
      {/* Mobile-First Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white mb-1">
              My Bookings
            </h1>
            <p className="text-sm sm:text-base text-body-color dark:text-gray-400">
              Manage your class reservations
            </p>
          </div>
          <Link
            href="/book-classes"
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors active:scale-95 shadow-md text-sm sm:text-base shrink-0"
          >
            Book Class
          </Link>
        </div>
      </div>

      {/* Filter Tabs - Mobile App Style */}
      <div className="mb-4 sm:mb-6">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
          {(["upcoming", "past", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base capitalize transition-all active:scale-95 shrink-0 ${
                filter === tab
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white dark:bg-dark border-2 border-gray-200 dark:border-gray-700 text-body-color dark:text-gray-300 hover:border-primary/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List - Mobile App Style */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-dark rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-body-color dark:text-gray-400 text-base sm:text-lg mb-2 font-semibold">
            No {filter === "all" ? "" : filter} bookings found
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mb-6">
            {filter === "upcoming" ? "You don't have any upcoming classes booked" : "No bookings to display"}
          </p>
          <Link
            href="/book-classes"
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors active:scale-95 shadow-md"
          >
            Browse Classes
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5 xl:space-y-4">
          {bookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            const classDate = new Date(booking.scheduled_at);
            const isToday = classDate.toDateString() === new Date().toDateString();
            const isTomorrow = classDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
            const isCancelled = booking.status === "cancelled" || booking.status === "cancelled-late";

            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden ${
                  isCancelled ? "opacity-75" : ""
                } active:scale-[0.98] transition-transform`}
              >
                {/* Mobile App Style Card Layout */}
                <div className="flex">
                  {/* Left: Date/Time Badge - Very compact on mobile */}
                  <div className="w-14 xl:w-20 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-1.5 xl:p-3 shrink-0 border-r border-gray-100 dark:border-gray-800">
                    <div className="text-center">
                      <p className="text-lg xl:text-2xl font-bold text-primary mb-0.5">
                        {formatTime(booking.scheduled_at).split(":")[0]}
                      </p>
                      <p className="text-[9px] xl:text-xs text-primary/70 font-medium">
                        {formatTime(booking.scheduled_at).split(":")[1]}
                      </p>
                      <div className="mt-1 xl:mt-2 pt-1 xl:pt-2 border-t border-primary/20">
                        <p className="text-[9px] xl:text-xs font-bold text-primary/80 uppercase leading-tight">
                          {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(booking.scheduled_at).split(",")[0]}
                        </p>
                        <p className="text-[8px] xl:text-xs text-primary/60 mt-0.5 leading-tight">
                          {formatDate(booking.scheduled_at).split(",")[1]?.trim()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Booking Details - Very compact on mobile */}
                  <div className="flex-1 p-2.5 xl:p-4">
                    {/* Header: Class Name & Status */}
                    <div className="flex items-start justify-between mb-1 xl:mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm xl:text-lg font-bold text-dark dark:text-white mb-0.5 xl:mb-1.5 line-clamp-1">
                          {booking.class_name}
                        </h3>
                        <span className={`px-1.5 xl:px-2.5 py-0.5 xl:py-1 rounded-lg text-[9px] xl:text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Class Info - Very compact on mobile */}
                    <div className="space-y-0.5 xl:space-y-2 mb-2 xl:mb-4">
                      <div className="flex items-center gap-1 xl:gap-2 text-[11px] xl:text-sm text-body-color dark:text-gray-400">
                        <svg className="w-3 h-3 xl:w-4 xl:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{booking.instructor_name}</span>
                      </div>
                      <div className="flex items-center gap-1 xl:gap-2 text-[11px] xl:text-sm text-body-color dark:text-gray-400">
                        <svg className="w-3 h-3 xl:w-4 xl:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{booking.location}</span>
                      </div>
                    </div>

                    {/* Actions - Very compact on mobile */}
                    <div className="flex flex-col sm:flex-row gap-1.5 xl:gap-2 pt-1.5 xl:pt-3 border-t border-gray-100 dark:border-gray-800">
                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          disabled={cancelBookingMutation.isPending}
                          className="flex-1 px-2.5 xl:px-4 py-1.5 xl:py-2.5 rounded-lg xl:rounded-xl text-[10px] xl:text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 active:scale-95 xl:active:scale-100"
                        >
                          {cancelBookingMutation.isPending && cancelBookingId === booking.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      <Link
                        href={`/book-classes/${booking.class_id}`}
                        className="flex-1 px-2.5 xl:px-4 py-1.5 xl:py-2.5 rounded-lg xl:rounded-xl text-[10px] xl:text-sm font-bold text-primary bg-primary/10 dark:bg-primary/20 border-2 border-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors active:scale-95 xl:active:scale-100 text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelBookingId(null);
              }}
              disabled={cancelBookingMutation.isPending}
              className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-body-color dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={cancelBookingMutation.isPending}
              className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-red-600/20"
            >
              {cancelBookingMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
            </button>
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <h3 className="font-bold text-dark dark:text-white mb-2">{selectedBooking.class_name}</h3>
              <div className="space-y-1 text-sm text-body-color dark:text-gray-400">
                <p>{formatDate(selectedBooking.scheduled_at)} at {formatTime(selectedBooking.scheduled_at)}</p>
                <p>with {selectedBooking.instructor_name}</p>
                <p>{selectedBooking.location}</p>
              </div>
            </div>
            <p className="text-sm text-body-color dark:text-gray-400">
              Tokens will be refunded based on the cancellation policy.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
