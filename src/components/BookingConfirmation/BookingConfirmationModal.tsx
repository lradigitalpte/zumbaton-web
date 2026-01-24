"use client";

import Modal from "@/components/Modal/Modal";
import { ClassWithAvailability } from "@/lib/classes-queries";
import { formatDate, formatTime } from "@/lib/utils";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  classItem: ClassWithAvailability | null;
  isBooking?: boolean;
  userTokenBalance?: number;
  isBookingWindowOpen?: boolean;
}

const BookingConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  classItem,
  isBooking = false,
  userTokenBalance = 0,
  isBookingWindowOpen = true,
}: BookingConfirmationModalProps) => {
  if (!classItem) return null;

  const isCourse = classItem._isParent && classItem.recurrence_type === 'course';
  const isRecurring = classItem._isParent && classItem.recurrence_type === 'recurring';
  const isParent = classItem._isParent || false;
  const totalSessions = classItem._totalSessions || 0;
  const childInstances = classItem._childInstances || [];
  const hasEnoughTokens = userTokenBalance >= (classItem.tokens_required || 0);

  const classDate = new Date(classItem.scheduled_at);
  const isToday = classDate.toDateString() === new Date().toDateString();
  const isTomorrow = classDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Booking"
      description="Review details and confirm"
      size="sm"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isBooking}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-body-color dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isBooking || !hasEnoughTokens || !isBookingWindowOpen}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-primary/20"
          >
            {isBooking ? "Booking..." : !isBookingWindowOpen ? "Booking Closed" : !hasEnoughTokens ? "Not Enough Tokens" : "Confirm"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Class Name & Type */}
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
            {classItem.name}
          </h3>
            {isCourse && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                Course
              </span>
            )}
            {isRecurring && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Series
              </span>
            )}
          </div>
          <p className="text-sm text-body-color dark:text-gray-400">
            {classItem.class_type}
          </p>
          {/* Show booking type info */}
          {isCourse && (
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
              Booking entire course • {totalSessions} session{totalSessions !== 1 ? 's' : ''}
            </p>
          )}
          {isRecurring && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
              Recurring series • Select individual sessions to book
            </p>
          )}
        </div>

        {/* Key Info - Mobile Optimized */}
        <div className="space-y-3">
          {/* Date & Time */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-body-color dark:text-gray-400 mb-0.5">
                {isCourse ? 'First Session' : 'Date & Time'}
              </p>
              <p className="font-semibold text-dark dark:text-white text-sm">
                {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(classItem.scheduled_at)} at {formatTime(classItem.scheduled_at)}
              </p>
              {isCourse && totalSessions > 0 && (
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  All {totalSessions} sessions will be booked
                </p>
              )}
              {isRecurring && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  View sessions panel to select individual sessions
                </p>
              )}
              {!isBookingWindowOpen && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">Bookings are allowed only between 08:00 and 22:00 SGT</p>
              )}
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-body-color dark:text-gray-400 mb-0.5">Instructor{classItem.instructors && classItem.instructors.length > 1 ? 's' : ''}</p>
              <p className="font-semibold text-dark dark:text-white text-sm">
                {classItem.instructors && classItem.instructors.length > 0
                  ? classItem.instructors.map((i: any) => i.name).join(', ')
                  : classItem.instructor_name || "TBA"}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-body-color dark:text-gray-400 mb-0.5">Location</p>
              <p className="font-semibold text-dark dark:text-white text-sm">
                {classItem.location || "Studio"}
              </p>
            </div>
          </div>
        </div>

        {/* Token Cost - Highlighted */}
        <div className={`rounded-xl p-4 border-2 ${
          isCourse
            ? 'bg-gradient-to-r from-purple-500/10 to-purple-400/5 dark:from-purple-500/20 dark:to-purple-400/10 border-purple-300/30 dark:border-purple-700/30'
            : isRecurring
            ? 'bg-gradient-to-r from-blue-500/10 to-blue-400/5 dark:from-blue-500/20 dark:to-blue-400/10 border-blue-300/30 dark:border-blue-700/30'
            : 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-body-color dark:text-gray-400 mb-1">
                {isCourse ? 'Total Token Cost' : 'Token Cost'}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold ${
                isCourse ? 'text-purple-600 dark:text-purple-400' : isRecurring ? 'text-blue-600 dark:text-blue-400' : 'text-primary'
              }`}>
                {classItem.tokens_required}
              </p>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                {isCourse
                  ? `token${classItem.tokens_required > 1 ? "s" : ""} total for all ${totalSessions} sessions`
                  : isRecurring
                  ? `token${classItem.tokens_required > 1 ? "s" : ""} per session (select sessions individually)`
                  : `token${classItem.tokens_required > 1 ? "s" : ""} will be reserved`}
              </p>
              {isCourse && totalSessions > 0 && (
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                  {Math.round(classItem.tokens_required / totalSessions)} token{Math.round(classItem.tokens_required / totalSessions) !== 1 ? 's' : ''} per session
                </p>
              )}
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isCourse ? 'bg-purple-500/20' : isRecurring ? 'bg-blue-500/20' : 'bg-primary/20'
            }`}>
              <svg className={`w-8 h-8 ${
                isCourse ? 'text-purple-600 dark:text-purple-400' : isRecurring ? 'text-blue-600 dark:text-blue-400' : 'text-primary'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Your Balance & Warning */}
      <div className={`rounded-xl p-4 border-2 ${
        userTokenBalance >= (classItem.tokens_required || 0)
          ? 'bg-green-500/10 border-green-300/30 dark:bg-green-500/20 dark:border-green-700/30'
          : 'bg-red-500/10 border-red-300/30 dark:bg-red-500/20 dark:border-red-700/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-body-color dark:text-gray-400 mb-1">Your Available Tokens</p>
            <p className={`text-2xl font-bold ${
              userTokenBalance >= (classItem.tokens_required || 0)
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {userTokenBalance}
            </p>
            {userTokenBalance < (classItem.tokens_required || 0) && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                ⚠️ You need {(classItem.tokens_required || 0) - userTokenBalance} more token{((classItem.tokens_required || 0) - userTokenBalance) !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-body-color dark:text-gray-400 mb-1">vs. Cost</p>
            <p className={`text-lg font-bold ${
              userTokenBalance >= (classItem.tokens_required || 0)
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {classItem.tokens_required}
            </p>
            {userTokenBalance >= (classItem.tokens_required || 0) && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                ✓ Enough tokens
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmationModal;
