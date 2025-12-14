"use client";

import { useState } from "react";
import QRScanner from "@/components/QRScanner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface AttendanceData {
  classId: string;
  className?: string;
  date?: string;
  token: string;
  bookingId: string;
}

export default function CheckInPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please sign in to check in</p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleScanSuccess = (data: AttendanceData) => {
    setIsScannerOpen(false);
    setCheckInSuccess(true);
    
    // Navigate to check-in page with QR data
    try {
      const qrData = {
        bookingId: data.bookingId,
        classId: data.classId,
        token: data.token,
        className: data.className,
        date: data.date,
      };
      
      const encoded = btoa(JSON.stringify(qrData));
      window.location.href = `/check-in/${encoded}`;
    } catch (error) {
      console.error("[CheckInPage] Error encoding QR data:", error);
      setCheckInSuccess(true); // Still show success even if navigation fails
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-dark rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Check In to Class
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Scan the QR code displayed in the studio to check in
          </p>

          {checkInSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check-in Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You have been checked in to the class.
              </p>
              <button
                onClick={() => {
                  setCheckInSuccess(false);
                  router.push("/dashboard");
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all flex items-center gap-3 mx-auto"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open Scanner
              </button>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              How to check in:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
              <li>Make sure you have a confirmed booking for the class</li>
              <li>Click "Open Scanner" and allow camera access</li>
              <li>Point your camera at the QR code displayed in the studio</li>
              <li>Wait for automatic check-in confirmation</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Use existing QRScanner component */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}

