"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function EarlyBirdBanner() {
  const [earlyBirdData, setEarlyBirdData] = useState<{ remaining: number; isAvailable: boolean } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch early bird availability
  useEffect(() => {
    const fetchEarlyBirdAvailability = async () => {
      try {
        const response = await fetch('/api/promos/availability');
        const result = await response.json();
        if (result.success) {
          setEarlyBirdData({
            remaining: result.data.remaining,
            isAvailable: result.data.isAvailable
          });
        }
      } catch (error) {
        console.error('Failed to fetch early bird availability:', error);
      }
    };
    fetchEarlyBirdAvailability();
  }, []);

  // Hide banner on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!earlyBirdData?.isAvailable) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white py-2 shadow-md"
        >
      <div className="container mx-auto px-2 sm:px-4">
        <Link
          href="/signup"
          className="flex items-center justify-center gap-1.5 sm:gap-2 text-center"
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse flex-shrink-0" />
          <span className="text-[11px] xs:text-xs sm:text-sm font-semibold hover:underline leading-tight px-1">
            <span className="font-bold">Early Bird:</span> <span className="font-bold">{earlyBirdData.remaining}</span> spots left
            <span className="hidden sm:inline"> - Get 10% off for 2 months!</span>
            <span className="hidden xs:inline sm:hidden"> - 10% off!</span>
            <span className="xs:hidden"> - 10%!</span>
          </span>
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse flex-shrink-0" />
        </Link>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
