"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

interface Package {
  id: string;
  name: string;
  description?: string;
  token_count: number;
  price_cents: number;
  currency: string;
  validity_days: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
  promoData?: {
    hasEarlyBirdDiscount?: boolean;
    earlyBirdDiscountPercent?: number;
    earlyBirdDaysLeft?: number | null;
  } | null;
}

type PaymentStatus = "idle" | "creating" | "error";

/**
 * Payment Modal - Simple Redirect Flow
 * Shows package details then redirects to HitPay for payment
 * After payment, HitPay redirects back to /payment/success
 */
export default function PaymentModal({
  isOpen,
  onClose,
  selectedPackage,
  promoData,
}: PaymentModalProps) {
  const toast = useToast();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [promo, setPromo] = useState<{
    hasEarlyBirdDiscount: boolean
    earlyBirdDiscountPercent: number
    earlyBirdDaysLeft?: number | null
  } | null>(null)
  
  // Calculate discounted price if applicable
  const originalPrice = selectedPackage?.price_cents || 0
  const discountPercent = promoData?.hasEarlyBirdDiscount ? 10 : 0
  const discountAmount = Math.round((originalPrice * discountPercent) / 100)
  const finalPrice = originalPrice - discountAmount

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && selectedPackage) {
      setStatus("idle");
      setError(null);
      // Fetch promo eligibility for current user
      ;(async () => {
        try {
          const { apiFetchJson } = await import('@/lib/api-fetch')
          const res = await apiFetchJson('/api/promos/eligibility', { method: 'GET', requireAuth: true })
          if (res.success && res.data) {
            setPromo({
              hasEarlyBirdDiscount: res.data.hasEarlyBirdDiscount,
              earlyBirdDiscountPercent: res.data.earlyBirdDiscountPercent || 0,
              earlyBirdDaysLeft: res.data.earlyBirdDaysLeft ?? null,
            })
          } else {
            setPromo(null)
          }
        } catch (e) {
          setPromo(null)
        }
      })()
    }
  }, [isOpen, selectedPackage]);

  // Create payment request and redirect to HitPay
  const handlePay = async () => {
    if (!selectedPackage) return;

    setStatus("creating");
    setError(null);

    try {
      // Use centralized API fetch with automatic token refresh
      const { apiFetchJson } = await import('@/lib/api-fetch');
      
      const data = await apiFetchJson<{
        success: boolean;
        paymentUrl: string;
        paymentRequestId: string;
        amount: number;
        currency: string;
      }>("/api/payments", {
        method: "POST",
        body: JSON.stringify({ 
          packageId: selectedPackage.id,
          promoType: promoData?.hasEarlyBirdDiscount ? 'early_bird' : null
        }),
        requireAuth: true,
      });

      // Redirect to HitPay checkout
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setError(message);
      setStatus("error");
      toast.error(message);
    }
  };

  // Format price
  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(priceCents / 100);
  };

  if (!isOpen || !selectedPackage) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Complete Purchase
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Package Details */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {selectedPackage.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {selectedPackage.description ||
              `${selectedPackage.token_count} class tokens`}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-green-600">
                {selectedPackage.token_count}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                tokens
              </span>
            </div>
            <div className="text-right">
              {promoData?.hasEarlyBirdDiscount ? (
                <div className="text-right">
                  <div className="text-xs text-amber-600 font-medium mb-1">
                    Early Steppers • 10% off
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(originalPrice, selectedPackage.currency)}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(finalPrice, selectedPackage.currency)}
                  </div>
                  {promoData.earlyBirdDaysLeft !== null && promoData.earlyBirdDaysLeft !== undefined && (
                    <div className="text-xs text-amber-600">{promoData.earlyBirdDaysLeft} days left</div>
                  )}
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(originalPrice, selectedPackage.currency)}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Valid for {selectedPackage.validity_days} days
          </p>
        </div>

        {/* Payment Methods Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Pay securely with:
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
              PayNow
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
              Cards
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
              GrabPay
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
              + More
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={status === "creating"}
          className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {status === "creating" ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Redirecting to payment...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>
                Pay{" "}
                {formatPrice(
                  finalPrice,
                  selectedPackage.currency
                )}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

