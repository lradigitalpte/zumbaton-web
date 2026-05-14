/**
 * Trial booking UI + payment helpers for combined family / Lil Steppers sessions.
 */

export type TrialAgeGroup = "adult" | "kid" | "all";

/** One Familia + Lil Steppers (or similar) — marketed as Lil Steppers for trials. */
export function isFamiliaLilSteppersCombinedTitle(title: string): boolean {
  const t = (title || "").toLowerCase();
  return t.includes("lil stepper") && (t.includes("familia") || t.includes("zumfamilia"));
}

export function getTrialBookingDisplayTitle(title: string): string {
  if (isFamiliaLilSteppersCombinedTitle(title)) return "Lil Steppers";
  return title || "";
}

export function getTrialBookingEffectiveAgeGroup(
  title: string,
  ageGroup: string | null | undefined,
): TrialAgeGroup {
  if (isFamiliaLilSteppersCombinedTitle(title)) return "kid";
  const g = (ageGroup || "all").toLowerCase();
  if (g === "adult" || g === "kid" || g === "all") return g as TrialAgeGroup;
  return "all";
}
