"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarHeart, Gift, X } from "lucide-react";

/** Bump suffix when promo changes so the banner can show again. */
const STORAGE_KEY = "osf-mothers-day-promo-banner-2026-05";
const PHONE_DISPLAY = "+65 8492 7347";

/** Responsive width: centered box on mobile, wider horizontal bar on desktop. */
const CARD_CLASS =
  "pointer-events-auto relative mx-auto box-border w-full max-w-[280px] sm:max-w-2xl";

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
          key="mothers-day-promo-banner"
          role="dialog"
          aria-labelledby="mothers-day-promo-title"
          aria-describedby="mothers-day-promo-desc"
          aria-live="polite"
          initial={{ y: "120%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "120%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320, opacity: { duration: 0.2 } }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[9995] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:px-3"
        >
          <div className={CARD_CLASS}>
            <div className="absolute -inset-px rounded-none bg-lime-500/20 blur-md" aria-hidden />

            <div className="relative overflow-hidden rounded-none border border-lime-500/30 bg-gray-950/95 shadow-md ring-1 ring-white/10 backdrop-blur-xl">
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 90% 80% at 50% 0%, rgba(132,204,22,0.18), transparent 52%), radial-gradient(ellipse 70% 55% at 100% 100%, rgba(251,176,64,0.12), transparent 48%)",
                }}
                aria-hidden
              />
              <div
                className="absolute left-0 top-0 h-0.5 w-full bg-[linear-gradient(90deg,#65a30d,#fbb040,#65a30d)] bg-[length:200%_100%] animate-promo-banner-shimmer"
                aria-hidden
              />

              <div className="relative flex flex-col items-center gap-2 px-3 pb-3 pt-9 text-center sm:flex-row sm:items-center sm:gap-5 sm:p-5 sm:pr-14 sm:pt-5 sm:text-left">
                <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-3 sm:text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-lime-500 text-black shadow-md shadow-lime-500/20 sm:h-11 sm:w-11">
                    <Gift className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 max-w-md">
                    <p
                      id="mothers-day-promo-title"
                      className="flex flex-wrap items-center justify-center gap-1 text-sm font-bold leading-tight text-white sm:justify-start sm:gap-1.5"
                    >
                      Mother&apos;s Day Promo
                    </p>
                    <p
                      id="mothers-day-promo-desc"
                      className="mt-0.5 text-xs leading-snug text-white/80 sm:mt-1 sm:text-sm"
                    >
                      <span className="font-semibold text-yellow-300">$30</span> private session · Sat{" "}
                      <span className="whitespace-nowrap">May 9, 11am</span> · Sun{" "}
                      <span className="whitespace-nowrap">May 10, 5pm</span>
                      <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-white/65 sm:mt-1 sm:justify-start sm:text-xs">
                        <CalendarHeart className="h-3 w-3 shrink-0" />
                        Contact {PHONE_DISPLAY}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mx-auto flex w-full shrink-0 flex-col items-stretch gap-1.5 xs:flex-row xs:justify-center sm:mx-0 sm:w-auto sm:max-w-none sm:flex-row sm:justify-start sm:gap-2">
                  <Link
                    href="/mothers-day"
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-none bg-lime-500 px-4 py-2 text-xs font-black text-black shadow-lg shadow-lime-500/25 transition hover:bg-yellow-400 active:scale-[0.98] xs:max-w-[10rem] xs:flex-initial sm:min-h-[44px] sm:max-w-none sm:text-sm"
                  >
                    View promo
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-none border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-yellow-400/70 hover:bg-white/10 xs:max-w-[10rem] xs:flex-initial sm:min-h-[44px] sm:max-w-none sm:text-sm"
                  >
                    Maybe later
                  </button>
                </div>

                <button
                  type="button"
                  onClick={dismiss}
                  className="absolute right-1 top-1 flex min-h-[40px] min-w-[40px] items-center justify-center rounded-none text-white/55 transition hover:bg-white/10 hover:text-white sm:right-3 sm:top-3"
                  aria-label="Dismiss promo"
                >
                  <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
