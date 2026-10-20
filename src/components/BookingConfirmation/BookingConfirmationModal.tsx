"use client";

import Link from "next/link";
import Modal from "@/components/Modal/Modal";
import { ClassWithAvailability } from "@/lib/classes-queries";
import { BOOKING_WINDOW_CLOSED_MESSAGE } from "@/lib/booking-window";
import { formatDate, formatTime } from "@/lib/utils";
import { MapPin, Wallet } from "lucide-react";

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

  const isCourse = classItem._isParent && classItem.recurrence_type === "course";
  const isRecurring = classItem._isParent && classItem.recurrence_type === "recurring";
  const totalSessions = classItem._totalSessions || 0;
  const tokenCost = classItem.tokens_required || 0;
  const hasEnoughTokens = userTokenBalance >= tokenCost;
  const tokensShort = Math.max(0, tokenCost - userTokenBalance);
  const location = classItem.room_name || classItem.location || "Studio";

  const instructorLabel = classItem.instructors?.length
    ? classItem.instructors.map((i: { name: string }) => i.name).join(", ")
    : classItem.instructor_name || "TBA";

  const initials =
    (classItem.instructor_name || "??")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  const confirmDisabled = isBooking || !hasEnoughTokens || !isBookingWindowOpen;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm booking"
      description={classItem.name}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isBooking}
            className="order-2 w-full rounded-full border border-zinc-200 py-3.5 text-sm font-semibold text-zinc-700 transition-colors active:scale-[0.98] disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 sm:order-1 sm:flex-1 sm:rounded-xl sm:py-3 sm:bg-zinc-100 sm:dark:bg-zinc-800"
          >
            Cancel
          </button>
          {!hasEnoughTokens ? (
            <Link
              href="/packages"
              onClick={onClose}
              className="order-1 flex w-full items-center justify-center rounded-full bg-zinc-900 py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:order-2 sm:flex-1 sm:rounded-xl sm:py-3"
            >
              Buy tokens
            </Link>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="order-1 w-full rounded-full bg-zinc-900 py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:flex-1 sm:rounded-xl sm:bg-primary sm:py-3 sm:font-semibold sm:hover:bg-primary/90"
            >
              {isBooking
                ? "Booking..."
                : !isBookingWindowOpen
                  ? "Booking closed"
                  : "Confirm booking"}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {classItem.class_type && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {classItem.class_type}
            </span>
          )}
          {isCourse && (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
              Course · {totalSessions} sessions
            </span>
          )}
          {isRecurring && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              Series
            </span>
          )}
        </div>

        {!isBookingWindowOpen && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-900/25 dark:text-red-300">
            {BOOKING_WINDOW_CLOSED_MESSAGE}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl bg-zinc-900 px-4 py-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime-400">When</p>
          <p className="mt-1 text-3xl font-bold tabular-nums leading-none">{formatTime(classItem.scheduled_at)}</p>
          <p className="mt-2 text-sm font-medium text-zinc-300">{formatDate(classItem.scheduled_at)}</p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-lime-400">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Instructor</p>
            <p className="truncate font-semibold text-zinc-900 dark:text-white">{instructorLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-900/50">
          <MapPin className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Location</p>
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{location}</p>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4 ${
            hasEnoughTokens
              ? "border-lime-200/80 bg-lime-50/80 dark:border-lime-900/40 dark:bg-lime-950/20"
              : "border-red-200/80 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                hasEnoughTokens ? "bg-lime-400/30 text-lime-900" : "bg-red-200/80 text-red-800 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              <Wallet className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Tokens</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                  {tokenCost} to book
                </p>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  You have <span className="font-bold text-zinc-900 dark:text-white">{userTokenBalance}</span>
                </p>
              </div>
              {isCourse && (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Covers all {totalSessions} sessions in this course
                </p>
              )}
              {!hasEnoughTokens ? (
                <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-400">
                  You need {tokensShort} more token{tokensShort !== 1 ? "s" : ""} — tap Buy tokens below.
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-lime-800 dark:text-lime-400">
                  Balance is enough to confirm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmationModal;
