"use client";

import { useState } from "react";
import Link from "next/link";

export default function StartDevPage() {
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestPayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentId(null);
    try {
      const res = await fetch("/api/start/debug-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: "Test Guest",
          guestEmail: "test@example.com",
          guestPhone: "+65 9000 0000",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(json?.error || "Failed to create test payment");
        return;
      }
      setPaymentId(json.data.paymentId);
    } catch {
      setError("Failed to create test payment");
    } finally {
      setLoading(false);
    }
  };

  // Extra guard: if this somehow ships, don't expose it.
  if (process.env.NODE_ENV === "production") {
    return (
      <main className="min-h-screen bg-[#f6f4ee] p-8 text-center">
        <p className="text-gray-600">Not available.</p>
      </main>
    );
  }

  const pickClassUrl = paymentId
    ? `/start/pick-class?payment_id=${encodeURIComponent(paymentId)}`
    : null;

  return (
    <main className="min-h-screen bg-[#f6f4ee] p-8">
      <div className="mx-auto max-w-md border border-black/10 bg-white p-8">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-700">
          Dev only
        </p>
        <h1 className="mb-4 text-2xl font-black uppercase italic tracking-tighter">
          Test pick-class flow
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Creates a fake paid quick-trial payment so you can test class selection without HitPay.
        </p>

        <button
          type="button"
          onClick={createTestPayment}
          disabled={loading}
          className="mb-4 w-full bg-lime-500 py-4 text-sm font-black uppercase tracking-widest text-black hover:bg-black hover:text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create test payment"}
        </button>

        {error && (
          <p className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {pickClassUrl && (
          <div className="space-y-3">
            <p className="break-all text-xs text-gray-500">
              Payment ID: <span className="font-mono">{paymentId}</span>
            </p>
            <Link
              href={pickClassUrl}
              className="block w-full bg-black py-4 text-center text-sm font-black uppercase tracking-widest text-white hover:bg-lime-500 hover:text-black"
            >
              Open pick-class page
            </Link>
          </div>
        )}

        <Link href="/start" className="mt-6 block text-center text-xs text-gray-500 underline">
          Back to /start
        </Link>
      </div>
    </main>
  );
}

