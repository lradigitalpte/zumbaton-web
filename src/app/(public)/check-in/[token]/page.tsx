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

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading, checkSession } = useAuth();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  useEffect(() => {
    // Decode QR data from token parameter
    const token = params.token as string;
    if (token) {
      try {
        // Try to decode base64 or JSON
        let decoded: QRData;
        try {
          decoded = JSON.parse(atob(token));
        } catch {
          decoded = JSON.parse(token);
        }
        
        // Validate QR code - must have classId and token
        if (decoded.classId && decoded.token) {
          setQrData(decoded);
        } else {
          setErrorMessage("Invalid QR code format");
          setCheckInStatus("error");
        }
      } catch (error) {
        console.error("[Check-In] Error decoding QR data:", error);
        setErrorMessage("Invalid QR code");
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
      // Use new QR check-in endpoint if bookingId is not provided (new QR format)
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          data.bookingId
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
                  sessionDate: data.sessionDate,
                  sessionTime: data.sessionTime,
                  expiresAt: data.expiresAt,
                },
              }
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to check in");
      }

      setCheckInStatus("success");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("[Check-In] Error marking attendance:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to check in");
      setCheckInStatus("error");
    }
  };

  const handleMagicLinkSuccess = () => {
    // Magic link sent, wait for user to click it
    // The callback will redirect back here and auto-check-in
  };

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
              Successfully Checked In!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {qrData?.className ? `Welcome to ${qrData.className}` : "Your attendance has been recorded."}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Check-In Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

