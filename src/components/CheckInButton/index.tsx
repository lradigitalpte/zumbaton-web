"use client";

import { useState } from "react";
import QRScanner from "@/components/QRScanner";

interface AttendanceData {
  classId: string;
  className: string;
  date: string;
  token: string;
}

export default function CheckInButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "success" | "error">("idle");
  const [checkedClass, setCheckedClass] = useState<string | null>(null);

  const handleScanSuccess = (data: AttendanceData) => {
    // Here you would call your API to mark attendance
    console.log("Scanned attendance data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setCheckInStatus("success");
      setCheckedClass(data.className);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setCheckInStatus("idle");
        setCheckedClass(null);
      }, 3000);
    }, 500);
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
        isOpen={isOpen && checkInStatus === "idle"}
        onClose={() => setIsOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Success Modal */}
      {isOpen && checkInStatus === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">You're Checked In!</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Welcome to <span className="font-semibold text-amber-600">{checkedClass}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Have a great workout!</p>
          </div>
        </div>
      )}
    </>
  );
}
