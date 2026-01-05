"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MagicLinkForm from "@/components/auth/MagicLinkForm";
import Image from "next/image";
import Link from "next/link";

interface QRData {
  bookingId?: string; // Optional - will be found by classId if not provided
  classId: string;
  token: string;
  sessionDate?: string;
  sessionTime?: string;
  expiresAt?: number;
  className?: string;
  date?: string;
}

interface CheckInError {
  code: string;
  message: string;
  action?: "book" | "waitlist" | "purchase";
  classId?: string;
  classTitle?: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading, checkSession } = useAuth();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<CheckInError | null>(null);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [wasWalkIn, setWasWalkIn] = useState(false);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);

  useEffect(() => {
    // Decode QR data from token parameter
    const token = params.token as string;
    if (token) {
      try {
        let decoded: QRData;
        
        // Try URL-safe base64 first (new format: - instead of +, _ instead of /, no = padding)
        try {
          let base64Token = token.replace(/-/g, '+').replace(/_/g, '/');
          // Add padding if needed (base64 strings must be multiple of 4)
          while (base64Token.length % 4) {
            base64Token += '=';
          }
          decoded = JSON.parse(atob(base64Token));
        } catch (urlSafeError) {
          // Fallback: Try regular base64 (old format for backward compatibility)
          try {
            decoded = JSON.parse(atob(token));
          } catch (regularError) {
            // Last resort: Try direct JSON parse (very old format)
            try {
              decoded = JSON.parse(token);
            } catch (jsonError) {
              console.error("[Check-In] All decode attempts failed:", {
                urlSafe: urlSafeError,
                regular: regularError,
                json: jsonError
              });
              setErrorMessage("Invalid QR code. Please scan a valid class QR code.");
              setCheckInStatus("error");
              return;
            }
          }
        }
        
        // Validate QR code - must have classId and token
        if (!decoded.classId || !decoded.token) {
          setErrorMessage("Invalid QR code. The QR code is missing required information.");
          setCheckInStatus("error");
          return;
        }
        
        // Validate classId format (should be UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(decoded.classId)) {
          setErrorMessage("Invalid QR code. The class ID format is incorrect.");
          setCheckInStatus("error");
          return;
        }
        
        setQrData(decoded);
      } catch (error) {
        console.error("[Check-In] Unexpected error decoding QR data:", error);
        setErrorMessage("Invalid QR code. Please try scanning again or contact support if the problem persists.");
        setCheckInStatus("error");
      }
    }
  }, [params.token]);

  useEffect(() => {
    const handleAutoCheckIn = async () => {
      if (!qrData || isLoading || checkInStatus !== "idle") return;

      // Check if user is authenticated
      if (isAuthenticated && user) {
        // User is logged in, mark attendance immediately
        await markAttendance(qrData);
      } else {
        // Try to check for existing session
        const hasSession = await checkSession();
        if (hasSession && user) {
          // Session found, mark attendance
          await markAttendance(qrData);
        } else {
          // No session, show login options
          setShowLoginOptions(true);
        }
      }
    };

    handleAutoCheckIn();
  }, [qrData, isAuthenticated, user, isLoading, checkSession, checkInStatus]);

  const markAttendance = async (data: QRData) => {
    if (checkInStatus !== "idle") return;
    
    setCheckInStatus("checking");

    try {
      // Always use qrData format for consistency
      // Use centralized API fetch with automatic token refresh
      const { apiFetchJson } = await import('@/lib/api-fetch');
      
      const result = await apiFetchJson<{
        success: boolean;
        data?: any;
        error?: { code?: string; message?: string; action?: string; classId?: string; classTitle?: string };
      }>("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({
          qrData: {
            classId: data.classId,
            token: data.token,
            sessionDate: data.sessionDate,
            sessionTime: data.sessionTime,
            expiresAt: data.expiresAt,
          },
        }),
        requireAuth: true,
      });

      if (!result.success) {
        const errData = (result.error || {}) as { code?: string; message?: string; action?: string; classId?: string; classTitle?: string };
        throw {
          code: errData.code || "CHECK_IN_ERROR",
          message: errData.message || "Failed to check in",
          action: errData.action,
          classId: errData.classId,
          classTitle: errData.classTitle,
        };
      }

      setCheckInStatus("success");
      setWasWalkIn(result.data?.wasWalkIn || false);
      setTokensUsed(result.data?.tokensConsumed || null);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("[Check-In] Error marking attendance:", error);
      const checkInErr = error as CheckInError;
      setErrorDetails(checkInErr);
      setErrorMessage(checkInErr.message || "Failed to check in");
      setCheckInStatus("error");
    }
  };

  const handleMagicLinkSuccess = () => {
    // Magic link sent, wait for user to click it
    // The callback will redirect back here and auto-check-in
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/logo/zumbaton logo (transparent).png"
              alt="Zumbaton Logo"
              width={200}
              height={67}
              className="h-16 w-auto mx-auto dark:invert"
              priority
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Checking in state
  if (checkInStatus === "checking") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/logo/zumbaton logo (transparent).png"
              alt="Zumbaton Logo"
              width={200}
              height={67}
              className="h-16 w-auto mx-auto dark:invert"
              priority
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Checking you in...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we mark your attendance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (checkInStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/logo/zumbaton logo (transparent).png"
              alt="Zumbaton Logo"
              width={200}
              height={67}
              className="h-16 w-auto mx-auto dark:invert"
              priority
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {wasWalkIn ? "Walk-in Check-in Successful!" : "Successfully Checked In!"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {qrData?.className ? `Welcome to ${qrData.className}` : "Your attendance has been recorded."}
            </p>
            {tokensUsed && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                {tokensUsed} token{tokensUsed > 1 ? 's' : ''} used
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (checkInStatus === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/logo/zumbaton logo (transparent).png"
              alt="Zumbaton Logo"
              width={200}
              height={67}
              className="h-16 w-auto mx-auto dark:invert"
              priority
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Check-In Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{errorMessage}</p>
            
            {errorDetails?.classTitle && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                Class: {errorDetails.classTitle}
              </p>
            )}

            <div className="flex flex-col gap-3 mt-6">
              {/* Action-specific buttons */}
              {errorDetails?.action === "book" && errorDetails.classId && (
                <Link
                  href={`/classes/${errorDetails.classId}`}
                  className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                  Book This Class
                </Link>
              )}
              
              {errorDetails?.action === "purchase" && (
                <Link
                  href="/packages"
                  className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                  Buy Tokens
                </Link>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login options state
  if (showLoginOptions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/logo/zumbaton logo (transparent).png"
              alt="Zumbaton Logo"
              width={200}
              height={67}
              className="h-16 w-auto mx-auto dark:invert mb-4"
              priority
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In to Check In
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to mark your attendance
            </p>
          </div>

          <div className="space-y-4">
            <MagicLinkForm
              redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/check-in/${params.token}` : `/check-in/${params.token}`}
              onSuccess={handleMagicLinkSuccess}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <Link
              href={`/signin?redirect=/check-in/${params.token}`}
              className="block w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Sign In with Password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default/processing state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/images/logo/zumbaton logo (transparent).png"
            alt="Zumbaton Logo"
            width={200}
            height={67}
            className="h-16 w-auto mx-auto dark:invert"
            priority
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Processing check-in...</p>
        </div>
      </div>
    </div>
  );
}
