"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function ZumFamiliaSuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("pending");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await fetch(`/api/zumfamilia/status?payment_id=${paymentId}`);
        const result = await response.json();
        if (result.success) {
          setStatus(result.data.status || "pending");
          setDetails(result.data);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Checking payment status...</p>
      </div>
    );
  }

  const success = status === "succeeded" || status === "completed";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-dark py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className={`rounded-lg border p-8 text-center ${success ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <h1 className="text-3xl font-bold text-gray-900">{success ? "ZumFamilia Booking Confirmed!" : "Payment Pending"}</h1>
          <p className="mt-3 text-gray-700">
            {success
              ? "Your ZumFamilia class booking is confirmed."
              : "We are still confirming your payment. Please refresh shortly."}
          </p>

          {details && (
            <div className="mt-6 text-left bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Package: <span className="font-semibold text-gray-900">{details.packageLabel}</span></p>
              <p className="text-sm text-gray-600 mt-1">Class: <span className="font-semibold text-gray-900">{details.className}</span></p>
              <p className="text-sm text-gray-600 mt-1">Amount: <span className="font-semibold text-gray-900">${details.amount?.toFixed(2)} {details.currency}</span></p>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <Link href="/zumfamilia" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900">
              Book Again
            </Link>
            <Link href="/" className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white">
              Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ZumFamiliaSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ZumFamiliaSuccessContent />
    </Suspense>
  );
}
