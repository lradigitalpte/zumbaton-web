"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface LoadingIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Optional caption; keep false for buttons and compact UI */
  showLabel?: boolean;
}

const LoadingIcon = ({
  size = "md",
  className = "",
  showLabel = false,
}: LoadingIconProps) => {
  const box = {
    sm: "h-9 w-9",
    md: "h-14 w-14",
    lg: "h-[4.5rem] w-[4.5rem]",
  };

  const iconPx = {
    sm: 18,
    md: 28,
    lg: 36,
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`relative flex items-center justify-center ${box[size]}`}
      >
        {/* Soft pulse behind bolt — no spinning ring */}
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-lime-400/25"
          animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.85, 1.05, 0.85] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="relative text-lime-400"
          animate={{
            opacity: [0.65, 1, 0.65],
            y: [0, -2, 0],
          }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap
            size={iconPx[size]}
            className="drop-shadow-[0_0_10px_rgba(163,230,53,0.45)]"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={0.5}
          />
        </motion.span>
      </div>
      {showLabel ? (
        <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-600 dark:text-lime-400 sm:text-sm">
          Loading
        </p>
      ) : null}
    </div>
  );
};

export default LoadingIcon;
