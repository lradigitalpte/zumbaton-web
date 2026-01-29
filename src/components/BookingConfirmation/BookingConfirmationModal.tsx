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
      size="2xl"
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
        {/* Class name + type + booking window banner on one row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h3 className="text-xl font-bold text-dark dark:text-white">
            {classItem.name}
          </h3>
          <span className="text-sm text-body-color dark:text-gray-400">
            {classItem.class_type}
          </span>
          {isCourse && (
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Course • {totalSessions} session{totalSessions !== 1 ? 's' : ''}
            </span>
          )}
          {isRecurring && (
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Series
            </span>
          )}
          {!isBookingWindowOpen && (
            <span className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Bookings 08:00–22:00 SGT
            </span>
          )}
        </div>

        {/* Date & Time | Instructor | Location — one row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-body-color dark:text-gray-400">Date & Time</p>
              <p className="font-semibold text-dark dark:text-white text-sm truncate">
                {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(classItem.scheduled_at)} at {formatTime(classItem.scheduled_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex -space-x-2 shrink-0">
              {(classItem.instructors?.length ? classItem.instructors : [{ name: classItem.instructor_name || "TBA", avatar: null, initials: (classItem.instructor_name || "??").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) }]).slice(0, 2).map((instructor: any, idx: number) => (
                <div key={instructor.id || idx} className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-primary overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm" title={instructor.name}>
                  {instructor.avatar ? (
                    <img src={instructor.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span>{instructor.initials || "??"}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-body-color dark:text-gray-400">Instructor{classItem.instructors?.length > 1 ? "s" : ""}</p>
              <p className="font-semibold text-dark dark:text-white text-sm truncate">
                {classItem.instructors?.length ? classItem.instructors.map((i: any) => i.name).join(", ") : classItem.instructor_name || "TBA"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-body-color dark:text-gray-400">Location</p>
              <p className="font-semibold text-dark dark:text-white text-sm truncate">
                {classItem.room_name || classItem.location || "Studio"}
              </p>
            </div>
          </div>
        </div>

        {/* Token cost + Your balance — one row, two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Token Cost */}
          <div className={`rounded-xl p-4 border-2 ${
            isCourse
              ? 'bg-gradient-to-r from-purple-500/10 to-purple-400/5 dark:from-purple-500/20 border-purple-300/30 dark:border-purple-700/30'
              : isRecurring
              ? 'bg-gradient-to-r from-blue-500/10 to-blue-400/5 dark:from-blue-500/20 border-blue-300/30 dark:border-blue-700/30'
              : 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 border-primary/20'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-body-color dark:text-gray-400">Token cost</p>
                <p className={`text-2xl font-bold ${
                  isCourse ? 'text-purple-600 dark:text-purple-400' : isRecurring ? 'text-blue-600 dark:text-blue-400' : 'text-primary'
                }`}>
                  {classItem.tokens_required} token{classItem.tokens_required !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                  {isCourse ? `for all ${totalSessions} sessions` : 'will be reserved'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isCourse ? 'bg-purple-500/20' : isRecurring ? 'bg-blue-500/20' : 'bg-primary/20'
              }`}>
                <svg className={`w-6 h-6 ${
                  isCourse ? 'text-purple-600 dark:text-purple-400' : isRecurring ? 'text-blue-600 dark:text-blue-400' : 'text-primary'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Your balance */}
          <div className={`rounded-xl p-4 border-2 ${
            hasEnoughTokens
              ? 'bg-green-500/10 border-green-300/30 dark:bg-green-500/20 dark:border-green-700/30'
              : 'bg-red-500/10 border-red-300/30 dark:bg-red-500/20 dark:border-red-700/30'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-body-color dark:text-gray-400">Your available tokens</p>
                <p className={`text-2xl font-bold ${
                  hasEnoughTokens ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {userTokenBalance}
                </p>
                {!hasEnoughTokens && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
                    Need {(classItem.tokens_required || 0) - userTokenBalance} more
                  </p>
                )}
                {hasEnoughTokens && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">✓ Enough</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmationModal;
