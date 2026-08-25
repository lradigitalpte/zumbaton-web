"use client";

import { Zap } from "lucide-react";
import { useId } from "react";

const SIZE_CLASSES = {
  sm: {
    base: "h-4 w-4 sm:h-5 sm:w-5",
    stroke: 2.5,
  },
  md: {
    base: "h-6 w-6 sm:h-7 sm:w-7",
    stroke: 2.5,
  },
  lg: {
    base: "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
    stroke: 3,
  },
} as const;

export function LightningRating({
  filled,
  total = 5,
  size = "sm",
  className = "",
}: {
  filled: number;
  total?: number;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const c = SIZE_CLASSES[size];
  const id = useId();

  return (
    <div
      className={`flex items-center gap-0.5 sm:gap-1.5 ${className}`}
      role="img"
      aria-label={`${filled} of ${total} intensity`}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {Array.from({ length: total }, (_, i) => {
        const diff = filled - i;
        const isFull = diff >= 1;
        const isHalf = diff > 0 && diff < 1;

        return (
          <Zap
            key={i}
            className={`${c.base} shrink-0 transition-all duration-300 drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.4)] ${
              isFull || isHalf
                ? "fill-yellow-400 text-white"
                : "fill-none text-zinc-300 dark:text-white/30"
            }`}
            strokeWidth={c.stroke}
            style={isHalf ? { fill: `url(#${id})` } : {}}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
