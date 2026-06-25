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

  // Post-payment waiver capture (NRIC + signature)
  const [nric, setNric] = useState("");
  const [signature, setSignature] = useState("");
  const [guardianSignature, setGuardianSignature] = useState("");
  const [savingWaiver, setSavingWaiver] = useState(false);
  const [waiverSaved, setWaiverSaved] = useState(false);
  const [waiverError, setWaiverError] = useState<string | null>(null);

  const submitWaiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaiverError(null);
    if (!nric.trim()) { setWaiverError("Please enter the last 4 of your NRIC"); return; }
    if (!signature.trim()) { setWaiverError("Please type your full name as signature"); return; }
    if (bookingData?.isKids && !guardianSignature.trim()) {
      setWaiverError("Guardian signature is required for kids classes");
      return;
    }
    setSavingWaiver(true);
    try {
      const res = await fetch("/api/trial-booking/waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          nricLast4: nric.trim(),
          signature: signature.trim(),
          ...(bookingData?.isKids ? { guardianSignature: guardianSignature.trim() } : {}),
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to save waiver");
      setWaiverSaved(true);
    } catch (err) {
      setWaiverError(err instanceof Error ? err.message : "Failed to save waiver. Please try again.");
    } finally {
      setSavingWaiver(false);
    }
  };

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
          if (result.data.guestName) setSignature((prev) => prev || result.data.guestName);
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              Your trial class has been successfully booked
              {bookingData?.guestEmail && !String(bookingData.guestEmail).includes("@guest.onestepfitness.sg") && (
                <>
                  <br />
                  <span className="text-sm mt-2 inline-block">
                    Confirmation sent to {bookingData.guestEmail}
                  </span>
                </>
              )}
            </p>
          </div>

          {bookingData && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Booking Details
              </h2>
              <div className="space-y-3">
                {bookingData.isDuoTrial ? (
                  <>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Participants:
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        1. {bookingData.participant1?.name}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        2. {bookingData.participant2?.name}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Guest:
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {bookingData.guestName}
                    </p>
                  </div>
                )}
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
                {bookingData.classLocation && bookingData.classLocation !== 'TBA' && bookingData.classLocation.trim() !== '' && (
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

          {bookingData && (bookingData.waiverComplete || waiverSaved) && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-6 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Waiver signed — you're all set!</p>
            </div>
          )}

          {bookingData && !bookingData.waiverComplete && !waiverSaved && (
            <form
              onSubmit={submitWaiver}
              className="bg-white dark:bg-gray-900 border-2 border-green-300 dark:border-green-700 rounded-lg p-6 mb-6 text-left"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">One last step: sign your waiver</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Required before your class. Takes 10 seconds.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nric" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    Last 4 characters of NRIC *
                  </label>
                  <input
                    id="nric"
                    type="text"
                    maxLength={4}
                    value={nric}
                    onChange={(e) => setNric(e.target.value.toUpperCase())}
                    placeholder="E.G. 123A"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="signature" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    Signature (type full name) *
                  </label>
                  <input
                    id="signature"
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="YOUR FULL NAME"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 text-2xl font-bold text-green-600 dark:text-green-400 focus:border-green-500 outline-none"
                  />
                </div>
                {bookingData.isKids && (
                  <div>
                    <label htmlFor="guardianSignature" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Guardian signature (type full name) *
                    </label>
                    <input
                      id="guardianSignature"
                      type="text"
                      value={guardianSignature}
                      onChange={(e) => setGuardianSignature(e.target.value)}
                      placeholder="GUARDIAN FULL NAME"
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                      className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 text-2xl font-bold text-green-600 dark:text-green-400 focus:border-green-500 outline-none"
                    />
                  </div>
                )}
                {waiverError && (
                  <p className="text-sm font-semibold text-red-600">{waiverError}</p>
                )}
                <button
                  type="submit"
                  disabled={savingWaiver}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {savingWaiver ? "Saving…" : "Sign & Complete"}
                </button>
              </div>
            </form>
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
