"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

function SignInWithQRContent() {
  const router = useRouter();
  const params = useParams();
  const { checkSession, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"loading" | "prompt-email" | "signing-in" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleQRSignIn = async () => {
      const token = params.token as string;
      
      if (!token) {
        setErrorMessage("Invalid sign-in link. No token provided.");
        setStatus("error");
        return;
      }

      try {
        // Check if user is already signed in
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Already signed in, redirect to dashboard
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
          return;
        }

        // Verify token with API
        const response = await fetch(`/api/auth/qr-signin/verify?token=${token}`);
        const data = await response.json();

        if (!data.success) {
          setErrorMessage(data.error?.message || "Invalid or expired sign-in token");
          setStatus("error");
          return;
        }

        // If magic link provided, redirect to it
        if (data.data.magicLink) {
          setStatus("signing-in");
          // Redirect to magic link which will sign them in
          window.location.href = data.data.magicLink;
          return;
        }

        // If email required, show email prompt
        if (data.data.requiresEmail) {
          setStatus("prompt-email");
          return;
        }

        // Token verified but no action needed
        setStatus("error");
        setErrorMessage("Unable to process sign-in. Please try again.");
      } catch (error) {
        console.error("[QR Sign-In] Error:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
        setStatus("error");
      }
    };

    handleQRSignIn();
  }, [params.token, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = params.token as string;
      
      // Send magic link to the email
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          redirectTo: `/magic-link-callback?redirectTo=/dashboard`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setErrorMessage(data.error?.message || "Failed to send sign-in link");
        setIsSubmitting(false);
        return;
      }

      setStatus("signing-in");
      setErrorMessage("");
      // Show message that email was sent
    } catch (error) {
      console.error("[QR Sign-In] Error sending magic link:", error);
      setErrorMessage("Failed to send sign-in link. Please try again.");
      setIsSubmitting(false);
    }
  };

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
              Verifying QR Code...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we sign you in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "prompt-email") {
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Enter Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
              To complete sign-in, please enter your email address
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {errorMessage}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Sending..." : "Continue Sign In"}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <Link href="/signin" className="text-sm text-primary hover:underline">
                Use regular sign-in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "signing-in") {
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
              Signing you in...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we complete your sign-in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
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

  // Error state
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
            Sign-In Failed
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

export default function SignInWithQRPage() {
  return (
    <Suspense
      fallback={
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
                Loading...
              </h2>
            </div>
          </div>
        </div>
      }
    >
      <SignInWithQRContent />
    </Suspense>
  );
}
