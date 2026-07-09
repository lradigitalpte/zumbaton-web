"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "osf_start_offer_deadline";
const HOLD_MINUTES = 30;

function getDeadlineMs(): number {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  const parsed = stored ? Number(stored) : NaN;
  if (Number.isFinite(parsed) && parsed > Date.now()) return parsed;
  const deadline = Date.now() + HOLD_MINUTES * 60 * 1000;
  sessionStorage.setItem(STORAGE_KEY, String(deadline));
  return deadline;
}

export function useOfferCountdown() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const deadline = getDeadlineMs();
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (secondsLeft === null) {
    return { label: "--:--", expired: false, ready: false };
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return { label: `${mm}:${ss}`, expired: secondsLeft === 0, ready: true };
}

export function OfferCountdownBadge({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { label, expired } = useOfferCountdown();
  const sizeClass =
    size === "lg"
      ? "px-3 py-1.5 text-lg sm:text-xl"
      : size === "sm"
        ? "px-2 py-0.5 text-xs"
        : "px-2.5 py-1 text-sm sm:text-base";

  return (
    <span
      className={`inline-flex items-center rounded bg-black font-black tabular-nums tracking-wider text-lime-500 ${sizeClass} ${className}`}
      aria-live="polite"
    >
      {expired ? "00:00" : label}
    </span>
  );
}
