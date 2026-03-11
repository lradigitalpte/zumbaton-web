"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [packageName, setPackageName] = useState<string | null>(null);
  const reference = searchParams.get("reference");
  const paymentStatus = searchParams.get("status");

  useEffect(() => {
    // HitPay redirects with ?status=completed&reference=... when payment succeeds.
    // We call our backend to confirm the payment in DB (fallback if webhook was missed).
    if (paymentStatus === "completed" && reference) {
      setSyncing(true);
      fetch(`/api/payments/status?reference=${encodeURIComponent(reference)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "succeeded" || data.status === "completed") {
            setStatus("completed");
            if (data.tokenCount) setTokenCount(data.tokenCount);
            if (data.packageName) setPackageName(data.packageName);
          } else {
            // Payment not yet confirmed in DB — show success anyway (webhook may follow)
            setStatus(paymentStatus);
          }
        })
        .catch(() => {
          // Network error — still show success from redirect params
          setStatus(paymentStatus);
        })
        .finally(() => setSyncing(false));
    } else {
      setStatus(paymentStatus);
    }
  }, [paymentStatus, reference]);

  // Show processing while syncing with backend or waiting for initial status
  if (status === null || syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1a2e] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          {syncing && (
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Confirming your payment…</p>
          )}
        </div>
      </div>
    );
  }

  // Show error if payment failed
  if (status !== "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1a2e] px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
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
          </div>

          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Payment Issue
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            There was an issue with your payment. Please try again or contact support.
          </p>

          <div className="space-y-3">
            <Link
              href="/packages"
              className="block w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/contact"
              className="block w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1a2e] px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
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
        </div>

        {/* Message */}
        <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Payment Successful! 🎉
        </h1>
        {packageName && tokenCount ? (
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-semibold text-green-600 dark:text-green-400">{tokenCount} tokens</span> from <span className="font-medium">{packageName}</span> have been added to your account.
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your tokens have been added to your account.
          </p>
        )}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You can now book classes!
        </p>

        {reference && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
            Reference: {reference}
          </p>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/book-classes"
            className="block w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Classes
          </Link>
          <Link
            href="/tokens"
            className="block w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            View My Tokens
          </Link>
          <Link
            href="/dashboard"
            className="block text-green-600 hover:underline text-sm"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Zumbaton Logo */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Thank you for choosing Zumbaton!
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1a2e] px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;

