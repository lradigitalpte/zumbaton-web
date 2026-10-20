"use client";

import SlidePanel from "@/components/SlidePanel/SlidePanel";
import { ClassWithAvailability } from "@/lib/classes-queries";
import { BOOKING_WINDOW_CLOSED_MESSAGE } from "@/lib/booking-window";
import { formatDate, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

interface ClassDetailsSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: ClassWithAvailability | null;
  onBookClick: () => void;
  isBooking?: boolean;
  isFull?: boolean;
  isBookingWindowOpen?: boolean;
}

const ClassDetailsSlidePanel = ({
  isOpen,
  onClose,
  classItem,
  onBookClick,
  isBooking = false,
  isFull = false,
  isBookingWindowOpen = true,
}: ClassDetailsSlidePanelProps) => {
  if (!classItem) return null;

  const outdoor = (classItem as ClassWithAvailability & { is_outdoor?: boolean }).is_outdoor;
  const displayName = `${classItem.name}${outdoor ? " (outdoors)" : ""}`;
  const spotsLeft = classItem.capacity - (classItem.booked_count ?? 0);
  const spotsInfo =
    spotsLeft <= 0
      ? { text: "Full", className: "text-red-600 dark:text-red-400" }
      : spotsLeft <= 3
        ? { text: `${spotsLeft} spots left`, className: "text-amber-600 dark:text-amber-400" }
        : { text: `${spotsLeft} spots left`, className: "text-lime-700 dark:text-lime-400" };

  const instructors =
    classItem.instructors?.length > 0
      ? classItem.instructors
      : [
          {
            name: classItem.instructor_name || "TBA",
            avatar: null as string | null,
            initials:
              (classItem.instructor_name || "??")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "??",
          },
        ];

  const instructorLabel = classItem.instructors?.length
    ? classItem.instructors.map((i: { name: string }) => i.name).join(", ")
    : classItem.instructor_name || "TBA";

  const location = classItem.room_name || classItem.location || "Studio";
  const bookDisabled = isFull || isBooking || !isBookingWindowOpen;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={displayName}
      description={classItem.class_type || undefined}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4 md:flex-col md:items-start md:justify-center">
            <span className="text-base font-bold text-zinc-900 dark:text-white">
              {classItem.tokens_required} token{classItem.tokens_required > 1 ? "s" : ""}
            </span>
            <span className={`text-sm font-semibold ${spotsInfo.className}`}>{spotsInfo.text}</span>
          </div>
          <div className="w-full md:w-auto md:text-right">
            {!isBookingWindowOpen && (
              <p className="mb-2 text-center text-xs text-red-600 dark:text-red-400 md:text-right">
                {BOOKING_WINDOW_CLOSED_MESSAGE}
              </p>
            )}
            <button
              type="button"
              onClick={onBookClick}
              disabled={bookDisabled}
              title={!isBookingWindowOpen ? BOOKING_WINDOW_CLOSED_MESSAGE : undefined}
              className={`w-full rounded-full py-3.5 text-sm font-bold transition-transform active:scale-[0.98] md:w-auto md:rounded-lg md:px-6 md:py-2.5 md:font-medium ${
                bookDisabled
                  ? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 md:bg-primary md:hover:bg-primary/90"
              }`}
            >
              {isBooking ? "Booking..." : isFull ? "Class full" : "Book now"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-zinc-900 px-4 py-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime-400">When</p>
          <p className="mt-1 text-3xl font-bold tabular-nums leading-none">{formatTime(classItem.scheduled_at)}</p>
          <p className="mt-2 text-sm font-medium text-zinc-300">{formatDate(classItem.scheduled_at)}</p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <div className="flex -space-x-2 shrink-0">
            {instructors.slice(0, 2).map((instructor: { id?: string; name: string; avatar?: string | null; initials?: string }, idx: number) => (
              <div
                key={instructor.id || idx}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-zinc-900 text-xs font-bold text-lime-400 dark:border-zinc-800"
                title={instructor.name}
              >
                {instructor.avatar ? (
                  <img src={instructor.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span>{instructor.initials || "??"}</span>
                )}
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Instructor</p>
            <p className="truncate font-semibold text-zinc-900 dark:text-white">{instructorLabel}</p>
          </div>
        </div>

        {classItem.age_group && classItem.age_group !== "all" && (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              classItem.age_group === "adult"
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                : "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
            }`}
          >
            {classItem.age_group === "adult" ? "Adults only" : "Kids only"}
          </span>
        )}

        {classItem.description && (
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{classItem.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-900/50">
            <CalendarDays className="mb-2 h-4 w-4 text-zinc-500" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Date</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{formatDate(classItem.scheduled_at)}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-900/50">
            <Clock className="mb-2 h-4 w-4 text-zinc-500" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Duration</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{classItem.duration_minutes} min</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-900/50">
            <MapPin className="mb-2 h-4 w-4 text-zinc-500" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Location</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">{location}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-900/50">
            <Users className="mb-2 h-4 w-4 text-zinc-500" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Capacity</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
              {classItem.booked_count ?? 0} / {classItem.capacity} booked
            </p>
          </div>
        </div>
      </div>
    </SlidePanel>
  );
};

export default ClassDetailsSlidePanel;
