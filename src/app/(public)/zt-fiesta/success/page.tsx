"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ZtFiestaSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (!paymentId) {
      router.push("/zt-fiesta");
      return;
    }

    if (status === "canceled") {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/zt-fiesta/status?payment_id=${paymentId}`);
        const result = await response.json();
        if (result.success) {
          setDetails(result.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [paymentId, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark">
        <p className="text-gray-600 dark:text-gray-400">Verifying payment...</p>
      </div>
    );
  }

  if (status === "canceled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark px-4">
        <div className="max-w-xl w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Canceled</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">No charges were made. You can try again anytime.</p>
          <Link
            href="/zt-fiesta"
            className="inline-flex mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6"
          >
            Back to Outdoor Thunderbolt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark px-4">
      <div className="max-w-2xl w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">Booking Confirmed</h1>
        <p className="mt-3 text-center text-gray-600 dark:text-gray-400">
          Your Thunderbolt Tabata Full Body Workout booking is confirmed. See you at OCBC Arena, Kallang Gate 20.
        </p>

        {details && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Package</p>
            <p className="font-semibold text-gray-900 dark:text-white">{details.packageLabel}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Preferred Slot</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {details.preferredDate} {details.preferredTime}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Amount Paid</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {details.currency} {Number(details.amount || 0).toFixed(2)}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/zt-fiesta"
            className="inline-flex justify-center rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6"
          >
            Book Another Session
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ZtFiestaSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      }
    >
      <ZtFiestaSuccessContent />
    </Suspense>
  );
}
