"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

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

interface CheckInError {
  code: string;
  message: string;
  action?: "book" | "waitlist" | "purchase";
  classId?: string;
  classTitle?: string;
}

export default function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<CheckInError | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>("idle");
  const [checkInMessage, setCheckInMessage] = useState<string>("");
  const [wasWalkIn, setWasWalkIn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe state update helper
  const safeSetState = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  // Stop scanning
  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
        }
      } catch (err: unknown) {
        // Ignore errors when stopping - scanner might already be stopped
        const error = err as { message?: string };
        if (!error.message?.includes("not running") && !error.message?.includes("not paused")) {
          console.warn("Error stopping scanner:", err);
        }
      }
    }
    safeSetState(setIsScanning, false);
  }, [safeSetState]);

  // Cleanup scanner when closed or unmounted
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning().then(() => {
          scannerRef.current = null;
        });
      }
    };
  }, [stopScanning]);

  // Stop scanning when panel closes
  useEffect(() => {
    if (!isOpen && isScanning) {
      stopScanning();
    }
  }, [isOpen, isScanning, stopScanning]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckInStatus("idle");
      setError(null);
      setErrorDetails(null);
      setCheckInMessage("");
      setWasWalkIn(false);
    }
  }, [isOpen]);

  const startScanning = async () => {
    // Create scanner instance if not exists
    if (!scannerRef.current) {
      const element = document.getElementById("qr-reader");
      if (!element) {
        setError("Scanner container not found. Please refresh the page.");
        return;
      }
      scannerRef.current = new Html5Qrcode("qr-reader");
    }

    setError(null);
    setErrorDetails(null);

    try {
      // Check if we have cameras
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setHasPermission(false);
        setError("No camera found. Please ensure your device has a camera.");
        return;
      }

      // Improved mobile camera settings
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const cameraConfig = isMobile 
        ? { facingMode: "environment" } // Use back camera on mobile
        : { facingMode: "environment" };
      
      const qrBoxConfig = isMobile
        ? { width: 300, height: 300 } // Larger box for mobile
        : { width: 250, height: 250 };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: isMobile ? 15 : 10, // Higher FPS on mobile for better scanning
          qrbox: qrBoxConfig,
          aspectRatio: 1.0,
          disableFlip: false, // Allow rotation
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        async (decodedText) => {
          // Successfully scanned
          try {
            let data: AttendanceData;

            // Check if scanned text is a URL (for phone camera scanning)
            if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
              try {
                const url = new URL(decodedText);
                
                // Check if it's a check-in URL
                const checkInMatch = url.pathname.match(/\/check-in\/([^/?]+)/);
                if (!checkInMatch || !checkInMatch[1]) {
                  setError("Invalid QR code. The URL format is incorrect. Please scan a valid QR code.");
                  return;
                }
                
                // Decode URL-safe base64 token from URL
                const encodedData = checkInMatch[1];
                
                // Try URL-safe base64 first (new format)
                try {
                  let base64Data = encodedData.replace(/-/g, '+').replace(/_/g, '/');
                  // Add padding if needed (base64 strings must be multiple of 4)
                  while (base64Data.length % 4) {
                    base64Data += '=';
                  }
                  const decoded = JSON.parse(atob(base64Data));
                  data = decoded as AttendanceData;
                } catch (urlSafeError) {
                  // Fallback: Try regular base64 (old format for backward compatibility)
                  try {
                    const decoded = JSON.parse(atob(encodedData));
                    data = decoded as AttendanceData;
                  } catch (regularError) {
                    console.error("[QRScanner] Failed to decode URL token:", { urlSafeError, regularError });
                    setError("Invalid QR code. Unable to decode the QR code data. Please try scanning again.");
                    return;
                  }
                }
              } catch (urlError) {
                console.error("[QRScanner] Invalid URL:", urlError);
                setError("Invalid QR code. The scanned URL is not valid. Please scan a valid class QR code.");
                return;
              }
            } else {
              // Try to parse as JSON (for legacy format - should not happen with current implementation)
              try {
                data = JSON.parse(decodedText) as AttendanceData;
              } catch (error) {
                console.error("[QRScanner] Failed to parse JSON:", error);
                setError("Invalid QR code. The scanned data format is not recognized. Please scan a valid class QR code.");
                return;
              }
            }
            
            // Validate required fields
            if (!data.classId || !data.token) {
              console.error("[QRScanner] QR code missing required fields:", data);
              setError("Invalid QR code. The QR code is missing required information.");
              return;
            }
            
            // Validate classId format (should be UUID)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(data.classId)) {
              setError("Invalid QR code. The class ID format is incorrect.");
              return;
            }

            // Stop scanning immediately
            await stopScanning();

            // Call backend API to check in
            await handleCheckIn(data);
          } catch (error) {
            // Invalid QR code format, keep scanning but show error
            console.error("[QRScanner] QR scan error:", error);
            const errorMessage = error instanceof Error ? error.message : "Invalid QR code format";
            setError(errorMessage);
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
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission")) {
        setError("Camera access denied. Please allow camera permission in your browser settings.");
      } else if (errorMessage.includes("NotFoundError")) {
        setError("No camera found. Please ensure your device has a camera.");
      } else if (errorMessage.includes("NotReadableError") || errorMessage.includes("in use")) {
        setError("Camera is in use by another app. Please close other apps using the camera.");
      } else {
        setError("Failed to access camera. Please check your device settings and try again.");
      }
    }
  };

  const handleCheckIn = async (data: AttendanceData) => {
    setCheckInStatus("checking");
    setError(null);
    setErrorDetails(null);
    setCheckInMessage("Processing check-in...");

    try {
      // Normalize date field - handle both "date" and "sessionDate" formats
      const sessionDate = data.sessionDate || (data as { date?: string }).date;
      
      // Always use qrData format for consistency
      const requestBody = {
        qrData: {
          classId: data.classId,
          token: data.token,
          sessionDate: sessionDate,
          sessionTime: data.sessionTime,
          expiresAt: data.expiresAt,
        },
      };

      // Use centralized API fetch with automatic token refresh
      const { apiFetchJson } = await import('@/lib/api-fetch');
      
      const result = await apiFetchJson<{
        success: boolean;
        data?: any;
        error?: { code?: string; message?: string; action?: string; classId?: string; classTitle?: string };
      }>("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify(requestBody),
        requireAuth: true,
      });

      if (!result.success) {
        const errorData = (result.error || {}) as { code?: string; message?: string; action?: string; classId?: string; classTitle?: string };
        throw {
          code: errorData.code || "CHECK_IN_ERROR",
          message: errorData.message || "Failed to check in",
          action: errorData.action,
          classId: errorData.classId,
          classTitle: errorData.classTitle,
        };
      }

      // Success!
      setCheckInStatus("success");
      setWasWalkIn(result.data?.wasWalkIn || false);
      setCheckInMessage(
        result.data?.message || 
        `Successfully checked in! ${result.data?.tokensConsumed ? `(${result.data.tokensConsumed} token${result.data.tokensConsumed > 1 ? 's' : ''} used)` : ''}`
      );

      // SUCCESS FEEDBACK: Play sound and vibrate
      try {
        // Play success sound
        const audio = new Audio('/sounds/success-beep.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Fallback for browsers that don't allow audio without user interaction
          console.log('Audio playback blocked - user needs to interact with page first');
        });
        
        // Haptic feedback for mobile devices
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]); // Short-long-short vibration pattern
        }
        
        // Visual flash effect
        document.body.style.backgroundColor = '#22c55e';
        setTimeout(() => {
          document.body.style.backgroundColor = '';
        }, 200);
      } catch (error) {
        console.log('Feedback error (non-critical):', error);
      }

      // Call onScanSuccess callback for backward compatibility
      onScanSuccess(data);

      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error("[QRScanner] Check-in error:", err);
      setCheckInStatus("error");
      
      const checkInErr = err as CheckInError;
      setErrorDetails(checkInErr);
      setError(checkInErr.message || "Failed to check in. Please try again.");
      setCheckInMessage("");
    }
  };

  const handleClose = async () => {
    await stopScanning();
    setCheckInStatus("idle");
    setError(null);
    setErrorDetails(null);
    setCheckInMessage("");
    setWasWalkIn(false);
    onClose();
  };

  const handleRetry = () => {
    setCheckInStatus("idle");
    setError(null);
    setErrorDetails(null);
    setCheckInMessage("");
  };

  if (!isOpen) return null;

  // Get action button text based on error
  const getActionButton = () => {
    if (!errorDetails?.action) return null;

    switch (errorDetails.action) {
      case "book":
        return (
          <a
            href={`/classes/${errorDetails.classId}`}
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            onClick={handleClose}
          >
            Book This Class
          </a>
        );
      case "purchase":
        return (
          <a
            href="/packages"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            onClick={handleClose}
          >
            Buy Tokens
          </a>
        );
      default:
        return null;
    }
  };

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
                    <p className="mb-2 text-center text-sm font-semibold text-white">
                      {wasWalkIn ? "Walk-in Check-in Successful!" : "Check-in Successful!"}
                    </p>
                    <p className="mb-4 px-4 text-center text-xs text-gray-300">
                      {checkInMessage || "Your attendance has been marked"}
                    </p>
                  </>
                ) : checkInStatus === "error" ? (
                  <>
                    <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                      <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="mb-2 text-center text-sm font-semibold text-white">Check-in Failed</p>
                    <p className="mb-2 px-4 text-center text-xs text-gray-300">
                      {error || "Please try scanning again"}
                    </p>
                    {errorDetails?.classTitle && (
                      <p className="mb-2 px-4 text-center text-xs text-amber-400">
                        Class: {errorDetails.classTitle}
                      </p>
                    )}
                    {getActionButton()}
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
                      {error || "Please enable camera permission in your browser settings"}
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
            {isScanning && checkInStatus === "idle" && (
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
          ) : checkInStatus === "error" ? (
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 rounded-xl bg-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl bg-amber-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Close
              </button>
            </div>
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
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-700"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Start Camera
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
