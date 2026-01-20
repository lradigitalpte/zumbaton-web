"use client";

import React, { useState } from 'react';
import { useUserOnboarding } from './UserOnboardingTour';

export default function UserOnboardingHelpButton() {
  const { restart: restartOnboarding } = useUserOnboarding();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={restartOnboarding}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9995] flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
      title="Restart the onboarding tour"
      aria-label="Restart onboarding tour"
    >
      <svg 
        className="h-4 w-4 sm:h-5 sm:w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 10V3L4 14h7v7l9-11h-7z" 
        />
      </svg>
      {isHovered && (
        <span className="whitespace-nowrap animate-in fade-in slide-in-from-right-2 hidden sm:inline">
          Restart Tour
        </span>
      )}
    </button>
  );
}
