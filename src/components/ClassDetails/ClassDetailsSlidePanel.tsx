"use client";

import SlidePanel from "@/components/SlidePanel/SlidePanel";
import { ClassWithAvailability } from "@/lib/classes-queries";
import { formatDate, formatTime } from "@/lib/utils";

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

  const spotsLeft = classItem.capacity - classItem.booked_count;
  const spotsInfo = spotsLeft <= 0 
    ? { text: "Full", color: "text-red-500" }
    : spotsLeft <= 3
    ? { text: `${spotsLeft} spots left`, color: "text-orange-500" }
    : { text: `${spotsLeft} spots left`, color: "text-green-500" };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={classItem.name}
      description={classItem.class_type}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="text-primary font-bold text-lg">
              {classItem.tokens_required} token{classItem.tokens_required > 1 ? "s" : ""}
            </span>
            <span className={`block text-sm ${spotsInfo.color}`}>
              {spotsInfo.text}
            </span>
          </div>
          <div className="text-right">
            {!isBookingWindowOpen && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">Bookings are allowed only between 08:00 and 22:00 SGT</p>
            )}
            <button
              onClick={onBookClick}
              disabled={isFull || isBooking || !isBookingWindowOpen}
              title={!isBookingWindowOpen ? 'Bookings are allowed only between 08:00–22:00 SGT' : undefined}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isFull || isBooking || !isBookingWindowOpen
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {isBooking ? "Booking..." : isFull ? "Class Full" : "Book Now"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Class Image/Banner */}
        <div className="h-48 bg-gradient-to-br from-primary/80 to-primary rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Class Info */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-dark dark:text-white">
                  {classItem.name}
                </h3>
                {/* Show age group badge */}
                {classItem.age_group && classItem.age_group !== 'all' && (
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    classItem.age_group === 'adult'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                      : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                  }`}>
                    {classItem.age_group === 'adult' ? 'Adults Only' : 'Kids Only'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {classItem.description && (
            <p className="text-body-color dark:text-gray-400 mb-6">
              {classItem.description}
            </p>
          )}

          {/* Details Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-body-color dark:text-gray-400">Instructor</p>
                <p className="font-medium text-dark dark:text-white">{classItem.instructor_name || "TBA"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-body-color dark:text-gray-400">Date & Time</p>
                <p className="font-medium text-dark dark:text-white">
                  {formatDate(classItem.scheduled_at)} at {formatTime(classItem.scheduled_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-body-color dark:text-gray-400">Duration</p>
                <p className="font-medium text-dark dark:text-white">{classItem.duration_minutes} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-body-color dark:text-gray-400">Location</p>
                <p className="font-medium text-dark dark:text-white">{classItem.location || "Studio"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-body-color dark:text-gray-400">Capacity</p>
                <p className="font-medium text-dark dark:text-white">
                  {classItem.booked_count} / {classItem.capacity} booked
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlidePanel>
  );
};

export default ClassDetailsSlidePanel;

