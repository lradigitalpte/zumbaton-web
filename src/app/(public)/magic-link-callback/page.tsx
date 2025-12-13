"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

export default function MagicLinkCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Get the hash fragment from URL (Supabase magic links use hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        if (error) {
          setErrorMessage(errorDescription || error || "Authentication failed");
          setStatus("error");
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setErrorMessage(sessionError.message || "Failed to create session");
            setStatus("error");
            return;
          }

          if (session) {
            // Verify session is valid
            const isValid = await checkSession();
            if (isValid) {
              setStatus("success");
              
              // Get redirect URL from query params or default to dashboard
              const redirectTo = searchParams.get("redirectTo") || "/dashboard";
              
              // Small delay to show success message
              setTimeout(() => {
                router.push(redirectTo);
              }, 1500);
            } else {
              setErrorMessage("Session validation failed");
              setStatus("error");
            }
          } else {
            setErrorMessage("No session created");
            setStatus("error");
          }
        } else {
          // No tokens in URL - might be a direct visit or expired link
          setErrorMessage("Invalid or expired magic link. Please request a new one.");
          setStatus("error");
        }
      } catch (error) {
        console.error("[Magic Link Callback] Error:", error);
        setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        setStatus("error");
      }
    };

    handleCallback();
  }, [router, searchParams, checkSession]);

  if (status === "loading") {
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
              Verifying your magic link...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we sign you in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
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
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/signin")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Go Home
              </button>
            </div>
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
            Successfully Signed In!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}

