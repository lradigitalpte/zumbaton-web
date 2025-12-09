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
}

const BookingConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  classItem,
  isBooking = false,
}: BookingConfirmationModalProps) => {
  if (!classItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Booking"
      description="Please review your booking details before confirming"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isBooking}
            className="px-4 py-2 rounded-lg text-sm font-medium text-body-color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isBooking}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBooking ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Class Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-dark dark:text-white text-lg mb-1">
              {classItem.name}
            </h3>
            <p className="text-sm text-body-color dark:text-gray-400">
              {classItem.class_type} • {classItem.difficulty_level}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-body-color dark:text-gray-400">Instructor</span>
              <span className="font-medium text-dark dark:text-white">{classItem.instructor_name || "TBA"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-color dark:text-gray-400">Date & Time</span>
              <span className="font-medium text-dark dark:text-white">
                {formatDate(classItem.scheduled_at)} at {formatTime(classItem.scheduled_at)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-color dark:text-gray-400">Location</span>
              <span className="font-medium text-dark dark:text-white">{classItem.location || "Studio"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-color dark:text-gray-400">Duration</span>
              <span className="font-medium text-dark dark:text-white">{classItem.duration_minutes} minutes</span>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-body-color dark:text-gray-400">Token Cost</span>
            <span className="text-xl font-bold text-primary">
              {classItem.tokens_required} token{classItem.tokens_required > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Token Policy:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Tokens will be <strong>reserved</strong> (held) when you book</li>
            <li>Tokens will be <strong>deducted</strong> when you attend and check in</li>
            <li>If you cancel within the cancellation window, tokens will be released</li>
            <li>Late cancellations may result in token penalties</li>
          </ul>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            By confirming, you agree to the cancellation policy.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmationModal;

