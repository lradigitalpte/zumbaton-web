"use client";

import { useState } from "react";
import QRScanner from "@/components/QRScanner";

interface AttendanceData {
  classId: string;
  className?: string;
  date?: string;
  token: string;
  bookingId: string;
}

export default function CheckInButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScanSuccess = (data: AttendanceData) => {
    // Close scanner
    setIsOpen(false);
    
    // Encode QR data as base64 and navigate to check-in page
    try {
      const qrData = {
        bookingId: data.bookingId,
        classId: data.classId,
        token: data.token,
        className: data.className,
        date: data.date,
      };
      
      // Encode as base64 for URL safety
      const encoded = btoa(JSON.stringify(qrData));
      
      // Navigate to check-in page
      window.location.href = `/check-in/${encoded}`;
    } catch (error) {
      console.error("[CheckInButton] Error encoding QR data:", error);
      alert("Failed to process QR code. Please try again.");
    }
  };

  return (
    <>
      {/* Floating Check-In Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 text-white shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/50 md:h-auto md:py-3"
        aria-label="Check in to class"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <span className="hidden font-semibold md:inline">Check In</span>
      </button>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}
