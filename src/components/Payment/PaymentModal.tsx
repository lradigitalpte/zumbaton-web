"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal/Modal";

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

function cleanPackageTagline(name: string, description?: string | null): string | null {
  if (!description?.trim()) return null;
  let text = description.trim();
  if (text.toLowerCase() === name.trim().toLowerCase()) return null;
  text = text
    .replace(/\.\s*valid for \d+\s*month?s?\.?/gi, "")
    .replace(/valid for \d+\s*month?s?\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s.,]+|[\s.,]+$/g, "");
  if (!text || text.length < 4) return null;
  return text;
}

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

  const formatPrice = (priceCents: number, currency: string) =>
    new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(priceCents / 100);

  if (!selectedPackage) return null;

  const tagline = cleanPackageTagline(selectedPackage.name, selectedPackage.description);
  const tokenDisplay = selectedPackage.is_unlimited ? "∞" : String(selectedPackage.token_count);
  const tokenSub = selectedPackage.is_unlimited ? "pass" : selectedPackage.token_count === 1 ? "token" : "tokens";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete purchase"
      description="You’ll be redirected to our secure payment page."
      size="md"
      footer={
        <button
          type="button"
          onClick={handlePay}
          disabled={status === "creating"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime-400 dark:text-zinc-900"
        >
          {status === "creating" ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
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
              Redirecting…
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Pay {formatPrice(finalPrice, selectedPackage.currency)}
            </>
          )}
        </button>
      }
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[1.25rem] border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-zinc-900 text-lime-400">
                <span className="text-xl font-bold leading-none tabular-nums">{tokenDisplay}</span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-90">
                  {tokenSub}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {selectedPackage.name}
                </h3>
                {tagline && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {tagline}
                  </p>
                )}
                <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {selectedPackage.validity_days} days validity
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-200/80 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-dark">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Total
                </p>
                {discountPercent > 0 ? (
                  <>
                    <p className="text-sm text-zinc-400 line-through">
                      {formatPrice(originalPrice, selectedPackage.currency)}
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                      {formatPrice(finalPrice, selectedPackage.currency)}
                    </p>
                    <p className="text-xs font-semibold text-lime-700 dark:text-lime-400">
                      {discountPercent}% off with voucher
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                    {formatPrice(originalPrice, selectedPackage.currency)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="voucher-code"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Voucher code
          </label>
          {appliedVoucherCode ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-lime-200 bg-lime-50 px-3 py-2.5 dark:border-lime-800 dark:bg-lime-950/40">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-bold text-lime-900 dark:text-lime-200">
                  {appliedVoucherCode}
                </p>
                <p className="text-xs text-lime-800 dark:text-lime-300">
                  {discountPercent}% off applied
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveVoucher}
                disabled={status === "creating"}
                className="shrink-0 text-sm font-bold text-zinc-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-zinc-300"
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
                placeholder="ZUMB-V-XXXXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                disabled={status === "creating" || isValidatingVoucher}
                className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={
                  status === "creating" || isValidatingVoucher || !voucherInput.trim()
                }
                className="shrink-0 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {isValidatingVoucher ? "…" : "Apply"}
              </button>
            </div>
          )}
          {voucherError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{voucherError}</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Pay securely with
          </p>
          <div className="flex flex-wrap gap-2">
            {["PayNow", "Cards", "GrabPay", "More"].map((method) => (
              <span
                key={method}
                className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {method === "More" ? "+ More" : method}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
