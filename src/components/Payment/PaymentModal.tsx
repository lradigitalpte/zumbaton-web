"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Package {
  id: string;
  name: string;
  description?: string;
  token_count: number;
  is_unlimited?: boolean;
  price_cents: number;
  currency: string;
  validity_days: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
}

type PaymentStatus = "idle" | "creating" | "error";

/**
 * Payment Modal - Simple Redirect Flow
 * Shows package details, optional voucher code, then redirects to HitPay
 * After payment, HitPay redirects back to /payment/success
 */
export default function PaymentModal({
  isOpen,
  onClose,
  selectedPackage,
}: PaymentModalProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const originalPrice = selectedPackage?.price_cents || 0;
  const discountAmountCents =
    discountPercent > 0 ? Math.round((originalPrice * discountPercent) / 100) : 0;
  const finalPrice = originalPrice - discountAmountCents;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && selectedPackage) {
      setStatus("idle");
      setError(null);
      setVoucherInput("");
      setAppliedVoucherCode(null);
      setDiscountPercent(0);
      setVoucherError(null);
      setIsValidatingVoucher(false);
    }
  }, [isOpen, selectedPackage]);

  const handleApplyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      setVoucherError("Enter a voucher code");
      return;
    }
    if (!isAuthenticated) {
      toast.info("Sign in required", "Please sign in to apply a voucher code.");
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherError(null);

    try {
      const { apiFetchJson } = await import("@/lib/api-fetch");
      const data = await apiFetchJson<{
        success: boolean;
        valid?: boolean;
        discountPercent?: number;
        error?: string;
      }>("/api/promos/voucher/validate", {
        method: "POST",
        body: JSON.stringify({ voucherCode: code }),
        requireAuth: true,
        retryOn401: false,
        cache: "no-store",
      });

      if (!data.success || !data.valid || !data.discountPercent) {
        setAppliedVoucherCode(null);
        setDiscountPercent(0);
        setVoucherError(data.error || "Invalid or already used voucher code");
        return;
      }

      setAppliedVoucherCode(code);
      setDiscountPercent(data.discountPercent);
      setVoucherInput(code);
      toast.success(`Voucher applied`, `${data.discountPercent}% off this package`);
    } catch (err) {
      setAppliedVoucherCode(null);
      setDiscountPercent(0);
      setVoucherError(err instanceof Error ? err.message : "Failed to validate voucher");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherInput("");
    setAppliedVoucherCode(null);
    setDiscountPercent(0);
    setVoucherError(null);
  };

  // Create payment request and redirect to HitPay
  const handlePay = async () => {
    if (!selectedPackage) return;
    if (!isAuthenticated) {
      toast.info("Continue to checkout", "Please continue with your details to complete package checkout.");
      onClose();
      router.push("/signup?next=/packages");
      return;
    }

    setStatus("creating");
    setError(null);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 35000);

      const { apiFetchJson } = await import("@/lib/api-fetch");

      const payload: { packageId: string; voucherCode?: string } = {
        packageId: selectedPackage.id,
      };
      if (appliedVoucherCode) {
        payload.voucherCode = appliedVoucherCode;
      }

      const data = await apiFetchJson<{
        success: boolean;
        paymentUrl?: string;
        paymentRequestId?: string;
        amount?: number;
        currency?: string;
        error?: { message?: string } | string;
        message?: string;
      }>("/api/payments", {
        method: "POST",
        body: JSON.stringify(payload),
        requireAuth: true,
        retryOn401: false,
        cache: "no-store",
        signal: controller.signal,
      });

      if (!data.success) {
        const apiError =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || data.message || "Payment request failed";
        throw new Error(apiError);
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === "AbortError"
            ? "Payment request timed out while contacting gateway. Please try again."
            : err.message
          : "Payment failed";
      setError(message);
      setStatus("error");
      toast.error(message);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
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
            aria-label="Close"
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
              (selectedPackage.is_unlimited
                ? "Unlimited class access"
                : `${selectedPackage.token_count} class tokens`)}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-green-600">
                {selectedPackage.is_unlimited
                  ? "Unlimited"
                  : selectedPackage.token_count}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                {selectedPackage.is_unlimited ? "" : "tokens"}
              </span>
            </div>
            <div className="text-right">
              {discountPercent > 0 ? (
                <>
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(originalPrice, selectedPackage.currency)}
                  </p>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(finalPrice, selectedPackage.currency)}
                  </span>
                  <p className="text-xs font-medium text-green-600 mt-0.5">
                    {discountPercent}% off applied
                  </p>
                </>
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

        {/* Voucher code */}
        <div className="mb-6">
          <label
            htmlFor="voucher-code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Have a voucher code?
          </label>
          {appliedVoucherCode ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-3 py-2.5">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-green-800 dark:text-green-200 truncate">
                  {appliedVoucherCode}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {discountPercent}% discount applied
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveVoucher}
                disabled={status === "creating"}
                className="shrink-0 text-sm font-medium text-green-800 dark:text-green-200 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                id="voucher-code"
                type="text"
                value={voucherInput}
                onChange={(e) => {
                  setVoucherInput(e.target.value.toUpperCase());
                  if (voucherError) setVoucherError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyVoucher();
                  }
                }}
                placeholder="e.g. ZUMB-V-XXXXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                disabled={status === "creating" || isValidatingVoucher}
                className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={
                  status === "creating" ||
                  isValidatingVoucher ||
                  !voucherInput.trim()
                }
                className="shrink-0 rounded-xl bg-gray-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidatingVoucher ? "Checking…" : "Apply"}
              </button>
            </div>
          )}
          {voucherError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{voucherError}</p>
          )}
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
                Pay {formatPrice(finalPrice, selectedPackage.currency)}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
