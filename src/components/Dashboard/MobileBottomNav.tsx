"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { CalendarDays, Home, Ticket, User, Wallet } from "lucide-react";

const NAV_W = 400;
const NAV_H = 50;
const BUBBLE_R = 24;

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home, match: (path: string) => path === "/dashboard" },
  {
    href: "/book-classes",
    label: "Classes",
    icon: CalendarDays,
    match: (path: string) => path.startsWith("/book-classes"),
  },
  {
    href: "/my-bookings",
    label: "Bookings",
    icon: Ticket,
    match: (path: string) => path.startsWith("/my-bookings"),
  },
  {
    href: "/packages",
    label: "Tokens",
    icon: Wallet,
    match: (path: string) => path.startsWith("/packages") || path.startsWith("/my-packages"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    match: (path: string) => path.startsWith("/profile") || path.startsWith("/settings"),
  },
] as const;

function navBarPath(activeIndex: number, count: number) {
  const cx = ((activeIndex + 0.5) / count) * NAV_W;
  const r = BUBBLE_R;
  const wing = 12;
  const left = cx - r - wing;
  const right = cx + r + wing;
  const corner = 22;

  return [
    `M 0 ${corner}`,
    `Q 0 0 ${corner} 0`,
    `L ${Math.max(corner, left)} 0`,
    `C ${cx - r - 3} 0 ${cx - r + 4} 2 ${cx - r + 10} 10`,
    `A ${r} ${r} 0 0 0 ${cx + r - 10} 10`,
    `C ${cx + r - 4} 2 ${cx + r + 3} 0 ${Math.min(NAV_W - corner, right)} 0`,
    `L ${NAV_W - corner} 0`,
    `Q ${NAV_W} 0 ${NAV_W} ${corner}`,
    `L ${NAV_W} ${NAV_H}`,
    `L 0 ${NAV_H}`,
    "Z",
  ].join(" ");
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  const activeIndex = useMemo(() => {
    const i = NAV_ITEMS.findIndex((item) => item.match(pathname));
    return i >= 0 ? i : 0;
  }, [pathname]);

  const pathD = useMemo(() => navBarPath(activeIndex, NAV_ITEMS.length), [activeIndex]);
  const bubbleLeftPercent = ((activeIndex + 0.5) / NAV_ITEMS.length) * 100;

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[10020] md:hidden"
      aria-label="Main navigation"
    >
      <div className="pointer-events-auto mx-auto max-w-lg px-3 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-5">
        <div className="relative h-[50px]">
          <svg
            viewBox={`0 0 ${NAV_W} ${NAV_H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full drop-shadow-[0_-2px_16px_rgba(0,0,0,0.07)] dark:drop-shadow-[0_-2px_20px_rgba(0,0,0,0.4)]"
            aria-hidden
          >
            <path
              d={pathD}
              className="fill-white stroke-lime-400/25 stroke-[0.5] transition-[d] duration-300 ease-out dark:fill-zinc-900 dark:stroke-lime-400/20"
            />
          </svg>

          <div
            className="absolute top-0 z-10 -translate-x-1/2 -translate-y-[52%] transition-[left] duration-300 ease-out"
            style={{ left: `${bubbleLeftPercent}%` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 shadow-[0_4px_16px_rgba(163,230,53,0.45)] ring-2 ring-lime-400/80 dark:bg-lime-400 dark:shadow-[0_4px_18px_rgba(163,230,53,0.35)]">
              {(() => {
                const { icon: Icon } = NAV_ITEMS[activeIndex];
                return <Icon className="h-5 w-5 text-zinc-900" strokeWidth={2.35} />;
              })()}
            </div>
          </div>

          <div className="relative z-20 flex h-full items-end">
            {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end pb-1 pt-4 active:scale-95"
                >
                  {!active && (
                    <Icon className="mb-0.5 h-[18px] w-[18px] text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                  )}
                  <span
                    className={`truncate text-[9px] leading-tight ${
                      active
                        ? "mt-4 font-bold text-lime-600 dark:text-lime-400"
                        : "font-medium text-zinc-500 dark:text-zinc-500"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
