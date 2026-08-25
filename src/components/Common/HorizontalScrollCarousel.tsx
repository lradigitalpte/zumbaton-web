"use client";

import {
  useRef,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NAV_BTN =
  "flex h-9 w-9 items-center justify-center text-gray-900 transition-colors hover:bg-lime-500 hover:text-black disabled:pointer-events-none disabled:opacity-25 dark:text-white dark:hover:text-black sm:h-10 sm:w-10";

export function HorizontalScrollCarousel({
  id,
  label,
  hint = "Use arrows to browse",
  gap = 24,
  itemSelector = "[data-carousel-card]",
  outerClassName = "lg:mx-0 lg:px-0",
  trackClassName = "flex gap-5 overflow-x-auto overflow-y-hidden px-1 pb-10 pt-3 scrollbar-hide snap-x snap-mandatory scroll-px-1 sm:gap-6",
  children,
}: {
  id: string;
  label?: ReactNode;
  hint?: string;
  gap?: number;
  itemSelector?: string;
  outerClassName?: string;
  trackClassName?: string;
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, children]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(itemSelector);
    const amount = card ? card.offsetWidth + gap : 360;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const showNav = canScrollLeft || canScrollRight;

  return (
    <div className={`@container ${outerClassName}`}>
      {(label || showNav) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
          {label ? (
            <div className="min-w-0 flex-1">{label}</div>
          ) : (
            <span className="sr-only">Carousel</span>
          )}
          {showNav && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {hint}
              </span>
              <div
                className="inline-flex items-stretch overflow-hidden border-2 border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                role="group"
                aria-label={`${typeof label === "string" ? label : "Carousel"} navigation`}
              >
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  aria-controls={id}
                  aria-label="Scroll backward"
                  className={`${NAV_BTN} border-r border-gray-200 dark:border-zinc-700`}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  aria-controls={id}
                  aria-label="Scroll forward"
                  className={NAV_BTN}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div id={id} ref={scrollRef} className={trackClassName}>
        {children}
      </div>
    </div>
  );
}
