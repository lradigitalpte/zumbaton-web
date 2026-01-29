"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function TrialBookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    if (!paymentId) {
      router.push("/trial-booking");
      return;
    }

    // If payment was canceled, don't fetch booking details
    if (status === "canceled") {
      setLoading(false);
      return;
    }

    // Fetch booking details
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/trial-booking/status?payment_id=${paymentId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setBookingData(result.data);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [paymentId, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verifying your booking...
          </p>
        </div>
      </div>
    );
  }

  // Handle canceled payment
  if (status === "canceled") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-dark py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Canceled
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Your payment was canceled. No charges were made.
              </p>
              {reference && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Reference: {reference}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trial-booking"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="inline-block bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-dark py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your trial class has been successfully booked
            </p>
          </div>

          {bookingData && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Booking Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Class:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {bookingData.className}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Date & Time:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {bookingData.classDate} at {bookingData.classTime}
                  </p>
                </div>
                {bookingData.classLocation && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Location:
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {bookingData.classLocation}
                    </p>
                  </div>
                )}
                {bookingData.instructorName && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Instructor:
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {bookingData.instructorName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              What's Next?
            </h3>
            <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2 text-sm">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Please arrive 10 minutes early for check-in</li>
              <li>• Bring water and wear comfortable workout clothes</li>
              <li>
                • If you enjoy the class, our team can help you set up a
                membership account
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trial-booking"
              className="inline-block bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Book Another Class
            </Link>
            <Link
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrialBookingSuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function TrialBookingSuccessPage() {
  return (
    <Suspense fallback={<TrialBookingSuccessFallback />}>
      <TrialBookingSuccessContent />
    </Suspense>
  );
}
