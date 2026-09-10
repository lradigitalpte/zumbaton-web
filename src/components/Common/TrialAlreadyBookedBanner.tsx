import Link from "next/link";

/**
 * Shown inline on a guest checkout form when the entered email/phone
 * already completed a paid trial booking — points them to sign up and
 * buy a token package instead of paying for a second trial.
 */
export function TrialAlreadyBookedBanner() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <p className="font-medium">Looks like you&apos;ve already had a trial with us.</p>
      <p>
        Trials are one per person. Sign up for an account and grab a token package to keep coming
        to class.
      </p>
      <Link
        href="/pricing"
        className="inline-flex w-fit items-center gap-1 font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-100 dark:hover:text-white"
      >
        Sign up &amp; grab a package →
      </Link>
    </div>
  );
}
