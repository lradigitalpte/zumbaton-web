"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useClassDetail } from "@/hooks/useClassDetail";
import { useBookClass } from "@/hooks/useClasses";
import { useTokenBalanceStats } from "@/hooks/useTokenTransactions";
import BookingConfirmationModal from "@/components/BookingConfirmation/BookingConfirmationModal";
import { formatDate, formatTime } from "@/lib/utils";

const ClassDetailPage = () => {
  const params = useParams();
  const classId = params.classId as string;
  const { user } = useAuth();

  // React Query hooks
  const { data: classDetail, isLoading, error: classError } = useClassDetail(classId);
  const { data: tokenBalance } = useTokenBalanceStats(user?.id);
  const bookClassMutation = useBookClass();

  // Booking confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleBookClick = () => {
    if (classDetail) {
      setIsConfirmationModalOpen(true);
    }
  };

  const handleConfirmBooking = () => {
    if (!user?.id || !classDetail) {
      return;
    }

    bookClassMutation.mutate(
      { userId: user.id, classId: classDetail.id, className: classDetail.name || classDetail.title },
      {
        onSuccess: () => {
          setIsConfirmationModalOpen(false);
        },
      }
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (classError || !classDetail) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-4">Class Not Found</h1>
        <p className="text-body-color dark:text-gray-400 mb-6">
          The class you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/book-classes"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Browse Classes
        </Link>
      </div>
    );
  }

  const spotsLeft = classDetail.capacity - classDetail.booked_count;
  const isFull = spotsLeft <= 0;
  const userTokens = tokenBalance?.available || 0;
  const hasEnoughTokens = userTokens >= classDetail.tokens_required;

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/book-classes"
        className="inline-flex items-center gap-2 text-body-color dark:text-gray-400 hover:text-primary mb-6 lg:mb-8 active:scale-95 transition-transform xl:transition-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Classes</span>
      </Link>

      {/* Desktop: 2-column grid, Mobile: Stacked */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Desktop: 2 columns, Mobile: Full width */}
        <div className="xl:col-span-2 space-y-6">
          {/* Class Header */}
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="h-40 xl:h-48 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
              <svg className="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="p-4 xl:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl xl:text-2xl font-bold text-dark dark:text-white mb-2">
                    {classDetail.name}
                  </h1>
                  <span className={`inline-block px-3 py-1 rounded-full xl:rounded-full rounded-xl text-xs xl:text-sm font-medium ${getDifficultyColor(classDetail.difficulty_level)}`}>
                    {classDetail.difficulty_level}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-xl xl:text-2xl font-bold text-primary">
                    {classDetail.tokens_required}
                  </span>
                  <p className="text-xs text-body-color dark:text-gray-400 xl:hidden">token{classDetail.tokens_required > 1 ? "s" : ""}</p>
                  <span className="hidden xl:inline"> token{classDetail.tokens_required > 1 ? "s" : ""}</span>
                </div>
              </div>

              {classDetail.description && (
                <p className="text-body-color dark:text-gray-400 mb-6">
                  {classDetail.description}
                </p>
              )}

              {/* Class Details Grid - Desktop: 2x2, Mobile: 2x2 */}
              <div className="grid grid-cols-2 gap-3 xl:gap-4">
                <div className="flex items-start xl:items-center gap-2 xl:gap-3 p-3 xl:p-0 bg-gray-50 xl:bg-transparent dark:bg-gray-800/50 xl:dark:bg-transparent rounded-xl xl:rounded-none">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs xl:text-sm text-body-color dark:text-gray-400">Date</p>
                    <p className="text-sm xl:text-base font-semibold xl:font-medium text-dark dark:text-white truncate">
                      {formatDate(classDetail.scheduled_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start xl:items-center gap-2 xl:gap-3 p-3 xl:p-0 bg-gray-50 xl:bg-transparent dark:bg-gray-800/50 xl:dark:bg-transparent rounded-xl xl:rounded-none">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs xl:text-sm text-body-color dark:text-gray-400">Time</p>
                    <p className="text-sm xl:text-base font-semibold xl:font-medium text-dark dark:text-white truncate">
                      {formatTime(classDetail.scheduled_at)}
                    </p>
                    <p className="text-xs text-body-color dark:text-gray-400 xl:hidden">
                      ({classDetail.duration_minutes} min)
                    </p>
                    <span className="hidden xl:inline"> ({classDetail.duration_minutes} min)</span>
                  </div>
                </div>
                <div className="flex items-start xl:items-center gap-2 xl:gap-3 p-3 xl:p-0 bg-gray-50 xl:bg-transparent dark:bg-gray-800/50 xl:dark:bg-transparent rounded-xl xl:rounded-none">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs xl:text-sm text-body-color dark:text-gray-400">Location</p>
                    <p className="text-sm xl:text-base font-semibold xl:font-medium text-dark dark:text-white truncate">
                      {classDetail.location || "Studio"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start xl:items-center gap-2 xl:gap-3 p-3 xl:p-0 bg-gray-50 xl:bg-transparent dark:bg-gray-800/50 xl:dark:bg-transparent rounded-xl xl:rounded-none">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs xl:text-sm text-body-color dark:text-gray-400">Capacity</p>
                    <p className="text-sm xl:text-base font-semibold xl:font-medium text-dark dark:text-white">
                      {classDetail.booked_count}/{classDetail.capacity} booked
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Info */}
          {classDetail.instructor_name && (
            <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-6">
              <h2 className="text-lg font-bold text-dark dark:text-white mb-4">Your Instructor</h2>
              <div className="flex items-start gap-3 xl:gap-4">
                <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 xl:w-7 xl:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base xl:text-lg font-semibold text-dark dark:text-white">
                    {classDetail.instructor_name}
                  </h3>
                  <p className="text-sm xl:text-base text-body-color dark:text-gray-400 mt-1">
                    {classDetail.instructor_bio || "Experienced fitness instructor passionate about helping you reach your goals."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What to Bring */}
          {classDetail.what_to_bring && classDetail.what_to_bring.length > 0 && (
            <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-6">
              <h2 className="text-lg font-bold text-dark dark:text-white mb-4">What to Bring</h2>
              <div className="grid grid-cols-1 xl:grid-cols-1 gap-2 xl:gap-2">
                {classDetail.what_to_bring.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 xl:gap-2 p-2 xl:p-0 bg-gray-50 xl:bg-transparent dark:bg-gray-800/50 xl:dark:bg-transparent rounded-xl xl:rounded-none">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm xl:text-base text-body-color dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Sidebar - Desktop: Right column, Mobile: Below content, Sticky on mobile */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-6 sticky bottom-0 xl:sticky xl:top-24 z-10 xl:z-auto">
            <h2 className="text-lg font-bold text-dark dark:text-white mb-4">Book This Class</h2>

            <div className="space-y-3 mb-4 xl:mb-6">
              <div className="flex justify-between items-center py-2 xl:py-0 border-b xl:border-b-0 border-gray-100 dark:border-gray-800">
                <span className="text-sm xl:text-base text-body-color dark:text-gray-400">Cost</span>
                <span className="text-base xl:text-base font-bold xl:font-semibold text-dark dark:text-white">
                  {classDetail.tokens_required} token{classDetail.tokens_required > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 xl:py-0 border-b xl:border-b-0 border-gray-100 dark:border-gray-800">
                <span className="text-sm xl:text-base text-body-color dark:text-gray-400">Available Spots</span>
                <span className={`text-base xl:text-base font-bold xl:font-semibold ${isFull ? "text-red-500" : spotsLeft <= 3 ? "text-orange-500" : "text-green-500"}`}>
                  {isFull ? "Full" : `${spotsLeft} left`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 xl:pt-3 xl:border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm xl:text-base text-body-color dark:text-gray-400">Your Tokens</span>
                <span className={`text-base xl:text-base font-bold xl:font-semibold ${hasEnoughTokens ? "text-green-500" : "text-red-500"}`}>
                  {userTokens}
                </span>
              </div>
            </div>

            <button
              onClick={handleBookClick}
              disabled={isFull || !hasEnoughTokens || bookClassMutation.isPending}
              className={`w-full py-3.5 xl:py-3 rounded-xl xl:rounded-lg font-bold xl:font-medium text-base xl:text-base text-white transition-all mb-3 active:scale-95 xl:active:scale-100 shadow-md xl:shadow-none ${
                isFull || !hasEnoughTokens
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 shadow-primary/20 xl:shadow-none"
              } disabled:opacity-50`}
            >
              {bookClassMutation.isPending
                ? "Booking..."
                : isFull
                ? "Class Full"
                : !hasEnoughTokens
                ? "Not Enough Tokens"
                : "Book Now"}
            </button>

            {!hasEnoughTokens && (
              <Link
                href="/packages"
                className="block w-full text-center py-3 rounded-xl xl:rounded-lg border-2 xl:border border-primary text-primary font-semibold xl:font-medium hover:bg-primary hover:text-white transition-colors active:scale-95 xl:active:scale-100"
              >
                Buy More Tokens
              </Link>
            )}

            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 text-center mt-4">
              Free cancellation up to 4 hours before class
            </p>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmBooking}
        classItem={classDetail ? {
          id: classDetail.id,
          name: classDetail.name,
          title: classDetail.title,
          description: classDetail.description,
          instructor_name: classDetail.instructor_name,
          scheduled_at: classDetail.scheduled_at,
          duration_minutes: classDetail.duration_minutes,
          location: classDetail.location,
          capacity: classDetail.capacity,
          booked_count: classDetail.booked_count,
          token_cost: classDetail.token_cost,
          tokens_required: classDetail.tokens_required,
          class_type: classDetail.class_type,
          level: classDetail.level,
          difficulty_level: classDetail.difficulty_level,
          status: 'scheduled',
        } : null}
        isBooking={bookClassMutation.isPending}
      />
    </div>
  );
};

export default ClassDetailPage;
