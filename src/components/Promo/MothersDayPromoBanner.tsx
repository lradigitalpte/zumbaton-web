"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarHeart, Gift, X } from "lucide-react";

/** Bump suffix when promo changes so the banner can show again. */
const STORAGE_KEY = "osf-mothers-day-promo-banner-2026-05";
const PHONE_DISPLAY = "+65 8492 7347";

export function MothersDayPromoBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (pathname === "/mothers-day") {
      setOpen(false);
      return;
    }
    try {
      if (localStorage.getItem(STORAGE_KEY) === "dismissed") {
        setOpen(false);
        return;
      }
    } catch {
      /* private mode */
    }
    setOpen(true);
  }, [mounted, pathname]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-labelledby="mothers-day-promo-title"
          aria-describedby="mothers-day-promo-desc"
          aria-live="polite"
          initial={{ y: "120%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "120%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320, opacity: { duration: 0.2 } }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[9995] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
        >
          <div className="pointer-events-auto relative w-full max-w-lg sm:max-w-2xl">
            <div
              className="absolute -inset-1 rounded-[1.35rem] bg-lime-500/25 blur-xl sm:rounded-3xl"
              aria-hidden
            />

            <div className="relative overflow-hidden rounded-[1.25rem] border border-lime-500/30 bg-gray-950/95 shadow-[0_-8px_40px_-16px_rgba(132,204,22,0.45),0_25px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl sm:rounded-3xl">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 90% 80% at 5% 0%, rgba(132,204,22,0.18), transparent 52%), radial-gradient(ellipse 70% 55% at 100% 100%, rgba(251,176,64,0.16), transparent 48%)",
                }}
                aria-hidden
              />
              <div
                className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(90deg,#65a30d,#fbb040,#65a30d)] bg-[length:200%_100%] animate-promo-banner-shimmer"
                aria-hidden
              />

              <div className="relative flex flex-col gap-4 p-4 pr-12 pt-5 sm:flex-row sm:items-center sm:gap-5 sm:p-5 sm:pr-14">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-500 text-black shadow-lg shadow-lime-500/25">
                    <Gift className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p
                      id="mothers-day-promo-title"
                      className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-white"
                    >
                      Mother&apos;s Day Promo
                    </p>
                    <p
                      id="mothers-day-promo-desc"
                      className="mt-1 text-xs leading-snug text-white/80 sm:text-sm"
                    >
                      <span className="font-semibold text-yellow-300">$30</span> private session · Sat{" "}
                      <span className="whitespace-nowrap">May 9, 11am</span> · Sun{" "}
                      <span className="whitespace-nowrap">May 10, 5pm</span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-white/65 sm:text-xs">
                        <CalendarHeart className="h-3 w-3 shrink-0" />
                        Contact {PHONE_DISPLAY}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2 xs:flex-row xs:items-stretch sm:w-auto sm:flex-row">
                  <Link
                    href="/mothers-day"
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl bg-lime-500 px-4 py-2.5 text-sm font-black text-black shadow-lg shadow-lime-500/25 transition hover:bg-yellow-400 active:scale-[0.98] xs:flex-initial"
                  >
                    View promo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:border-yellow-400/70 hover:bg-white/10"
                  >
                    Maybe later
                  </button>
                </div>

                <button
                  type="button"
                  onClick={dismiss}
                  className="absolute right-1 top-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss promo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
