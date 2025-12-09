"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useUserBookings, useCancelBooking } from "@/hooks/useBookings";
import { formatDate, formatTime } from "@/lib/utils";

type FilterType = "upcoming" | "past" | "all";

const MyBookingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FilterType>("upcoming");

  // React Query hooks
  const { data: bookings = [], isLoading } = useUserBookings(user?.id, filter);
  const cancelBookingMutation = useCancelBooking();

  const handleCancelBooking = async (bookingId: string) => {
    if (!user?.id) return;
    
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    cancelBookingMutation.mutate({
      userId: user.id,
      bookingId,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
      case "cancelled-late":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "attended":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "no_show":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "waitlist":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancel = (booking: any) => {
    if (booking.status !== "confirmed") return false;
    const classTime = new Date(booking.scheduled_at);
    const now = new Date();
    const hoursUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilClass > 0; // Can cancel if class hasn't started
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">My Bookings</h1>
          <p className="text-body-color dark:text-gray-400">
            Manage your class reservations
          </p>
        </div>
        <Link
          href="/book-classes"
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Book a Class
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["upcoming", "past", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === tab
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-body-color dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-body-color dark:text-gray-400 text-lg mb-4">
            No {filter === "all" ? "" : filter} bookings found
          </p>
          <Link
            href="/book-classes"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Classes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 ${
                booking.status === "cancelled" || booking.status === "cancelled-late" ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-dark dark:text-white">
                        {booking.class_name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(booking.status)}`}>
                        {booking.status.replace("_", " ").replace("-", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-body-color dark:text-gray-400 mb-2">
                      with {booking.instructor_name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-body-color dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(booking.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(booking.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>{booking.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canCancel(booking) && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancelBookingMutation.isPending}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      {cancelBookingMutation.isPending ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                  <Link
                    href={`/book-classes/${booking.class_id}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
                  >
                    View Class
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
