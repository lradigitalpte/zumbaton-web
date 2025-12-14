"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: AttendanceData) => void;
}

interface AttendanceData {
  bookingId?: string;
  classId: string;
  className?: string;
  date?: string;
  sessionDate?: string;
  sessionTime?: string;
  expiresAt?: number;
  token: string;
}

type CheckInStatus = "idle" | "checking" | "success" | "error";

export default function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>("idle");
  const [checkInMessage, setCheckInMessage] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Define stopScanning before it's used in useEffect
  const stopScanning = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err: any) {
        // Handle case where scanner is already stopped
        if (err.message?.includes("not running") || err.message?.includes("not paused")) {
          setIsScanning(false);
        } else {
          console.error("Error stopping scanner:", err);
          setIsScanning(false);
        }
      }
    }
  }, [isScanning]);

  // Initialize scanner when opened
  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
  }, [isOpen]);

  // Cleanup scanner when closed or unmounted
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        // Try to stop the scanner, but handle errors gracefully
        // The scanner might already be stopped or not running
        scannerRef.current.stop().catch((err: any) => {
          // Ignore errors if scanner is not running or already stopped
          if (!err.message?.includes("not running") && !err.message?.includes("not paused")) {
            console.error("Error stopping scanner:", err);
          }
        });
        scannerRef.current = null;
      }
    };
  }, []);

  // Stop scanning when panel closes
  useEffect(() => {
    if (!isOpen && isScanning) {
      stopScanning();
    }
  }, [isOpen, isScanning, stopScanning]);

  const startScanning = async () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }

    setError(null);

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Successfully scanned
          try {
            let data: AttendanceData;

            // Check if scanned text is a URL (for phone camera scanning)
            if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
              // Extract token from URL path: /check-in/{token}
              const url = new URL(decodedText);
              const pathParts = url.pathname.split('/');
              const tokenIndex = pathParts.indexOf('check-in');
              
              if (tokenIndex !== -1 && pathParts[tokenIndex + 1]) {
                // Decode base64 token from URL
                const encodedData = pathParts[tokenIndex + 1];
                try {
                  const decoded = JSON.parse(atob(encodedData));
                  data = decoded as AttendanceData;
                } catch (decodeError) {
                  console.log("Failed to decode URL token, keep scanning...");
                  return;
                }
              } else {
                console.log("Invalid URL format, keep scanning...");
                return;
              }
            } else {
              // Try to parse as JSON (for in-app scanner or old format)
              data = JSON.parse(decodedText) as AttendanceData;
            }
            
            // Validate required fields
            if (!data.classId || !data.token) {
              console.log("QR code missing required fields, keep scanning...");
              return;
            }

            // Stop scanning immediately
            try {
              await scannerRef.current?.stop();
              setIsScanning(false);
            } catch (err: any) {
              // Handle case where scanner is already stopped
              if (!err.message?.includes("not running") && !err.message?.includes("not paused")) {
                console.error("Error stopping scanner after scan:", err);
              }
              setIsScanning(false);
            }

            // Call backend API to check in
            await handleCheckIn(data);
          } catch (parseError) {
            // Invalid QR code format, keep scanning
            console.log("Invalid QR format, keep scanning...");
          }
        },
        () => {
          // QR code not found in frame, ignore
        }
      );
      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setIsScanning(false);
      setError("Camera access denied. Please allow camera permission to scan QR codes.");
    }
  };

  const handleCheckIn = async (data: AttendanceData) => {
    setCheckInStatus("checking");
    setError(null);
    setCheckInMessage("Processing check-in...");

    try {
      // Normalize date field - handle both "date" and "sessionDate" formats
      const sessionDate = data.sessionDate || (data as any).date;
      
      // Prepare request body based on QR data format
      const requestBody = data.bookingId
        ? {
            // Old format with bookingId
            bookingId: data.bookingId,
            classId: data.classId,
            token: data.token,
          }
        : {
            // New format with qrData (will find booking by classId)
            qrData: {
              classId: data.classId,
              token: data.token,
              sessionDate: sessionDate,
              sessionTime: data.sessionTime,
              expiresAt: data.expiresAt,
            },
          };

      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to check in");
      }

      // Success!
      setCheckInStatus("success");
      setCheckInMessage(
        result.data?.message || 
        `Successfully checked in! ${result.data?.tokensConsumed ? `(${result.data.tokensConsumed} token${result.data.tokensConsumed > 1 ? 's' : ''} used)` : ''}`
      );

      // Call onScanSuccess callback for backward compatibility
      onScanSuccess(data);

      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error("[QRScanner] Check-in error:", err);
      setCheckInStatus("error");
      setError(err instanceof Error ? err.message : "Failed to check in. Please try again.");
      setCheckInMessage("");

      // Allow user to try scanning again after error
      setTimeout(() => {
        setCheckInStatus("idle");
        setError(null);
      }, 3000);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    setCheckInStatus("idle");
    setError(null);
    setCheckInMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={handleClose} 
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Scan Attendance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Point camera at QR code</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          <div 
            ref={containerRef}
            className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-2xl bg-gray-900"
          >
            {/* QR Reader Container */}
            <div id="qr-reader" className="h-full w-full" />

            {/* Overlay when not scanning or checking in */}
            {(!isScanning || checkInStatus !== "idle") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
                {checkInStatus === "checking" ? (
                  <>
                    <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                      <svg className="h-8 w-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <p className="mb-2 text-center text-sm text-white">Checking in...</p>
                    <p className="mb-4 px-4 text-center text-xs text-gray-400">
                      Please wait while we process your attendance
                    </p>
                  </>
                ) : checkInStatus === "success" ? (
                  <>
                    <div className="mb-4 rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
                      <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="mb-2 text-center text-sm font-semibold text-white">Check-in Successful!</p>
                    <p className="mb-4 px-4 text-center text-xs text-gray-300">
                      {checkInMessage || "Your attendance has been marked"}
                    </p>
                  </>
                ) : checkInStatus === "error" ? (
                  <>
                    <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                      <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="mb-2 text-center text-sm font-semibold text-white">Check-in Failed</p>
                    <p className="mb-4 px-4 text-center text-xs text-gray-300">
                      {error || "Please try scanning again"}
                    </p>
                  </>
                ) : hasPermission === false ? (
                  <>
                    <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                      <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <p className="mb-2 text-center text-sm text-white">Camera access denied</p>
                    <p className="mb-4 px-4 text-center text-xs text-gray-400">
                      Please enable camera permission in your browser settings
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-4 rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
                      <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="mb-4 text-center text-sm text-white">
                      Tap below to start scanning
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Scanning Frame Overlay */}
            {isScanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-[200px] w-[200px]">
                  {/* Corner Brackets */}
                  <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-amber-500" />
                  <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-amber-500" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-amber-500" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-amber-500" />
                  {/* Scan Line Animation */}
                  <div className="absolute left-2 right-2 top-0 h-0.5 animate-pulse bg-gradient-to-r from-transparent via-amber-500 to-transparent" 
                    style={{ animation: "scanLine 2s ease-in-out infinite" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message (only show if not in check-in flow) */}
          {error && checkInStatus === "idle" && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">How it works:</h3>
            <ol className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>1. Your instructor will display a QR code</li>
              <li>2. Point your camera at the QR code</li>
              <li>3. Your attendance will be marked automatically</li>
            </ol>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          {checkInStatus === "success" ? (
            <button
              onClick={handleClose}
              className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-emerald-600"
            >
              Close
            </button>
          ) : checkInStatus === "checking" ? (
            <button
              disabled
              className="w-full rounded-xl bg-gray-300 px-6 py-3 text-base font-semibold text-gray-500 cursor-not-allowed"
            >
              Processing...
            </button>
          ) : isScanning ? (
            <button
              onClick={stopScanning}
              className="w-full rounded-xl bg-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Stop Scanning
            </button>
          ) : (
            <button
              onClick={startScanning}
              disabled={checkInStatus === "error"}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {checkInStatus === "error" ? "Try Again" : "Start Camera"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* CSS for scan line animation */}
      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
      `}</style>
    </div>
  );
}
