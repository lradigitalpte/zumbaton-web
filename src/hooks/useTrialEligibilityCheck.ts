"use client";

import { useCallback, useRef, useState } from "react";

export type TrialEligibilityStatus = "idle" | "checking" | "blocked" | "clear";

/**
 * Checks (on blur) whether an email/phone already completed a paid trial
 * booking. Call `check()` from an input's onBlur; call `reset()` from that
 * same input's onChange so a corrected value clears a stale "blocked" state.
 */
export function useTrialEligibilityCheck() {
  const [status, setStatus] = useState<TrialEligibilityStatus>("idle");
  const requestId = useRef(0);

  const check = useCallback(async (email?: string | null, phone?: string | null) => {
    const trimmedEmail = email?.trim();
    const trimmedPhone = phone?.trim();

    if (!trimmedEmail && !trimmedPhone) {
      return;
    }

    const thisRequest = ++requestId.current;
    setStatus("checking");

    try {
      const params = new URLSearchParams();
      if (trimmedEmail) params.set("email", trimmedEmail);
      if (trimmedPhone) params.set("phone", trimmedPhone);

      const response = await fetch(`/api/trial-booking/check-eligibility?${params.toString()}`);
      const result = await response.json();

      // Ignore stale responses from an earlier, now-superseded check.
      if (thisRequest !== requestId.current) return;

      setStatus(result.eligible === false ? "blocked" : "clear");
    } catch (error) {
      console.error("[useTrialEligibilityCheck] Check failed:", error);
      if (thisRequest === requestId.current) {
        // Fail open — never block a real booking over a broken check.
        setStatus("clear");
      }
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current++;
    setStatus("idle");
  }, []);

  return { status, check, reset };
}
