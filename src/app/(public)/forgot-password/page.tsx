"use client";

import Link from "next/link";
import { useState } from "react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ForgotPassword] Form submitted, email:', email);
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    console.log('[ForgotPassword] Starting API call...');
    setIsSubmitting(true);
    setError("");
    
    try {
      console.log('[ForgotPassword] Making fetch request to /api/auth/forgot-password');
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      console.log('[ForgotPassword] Response received:', response.status, response.statusText);

      // Parse response JSON once
      const data = await response.json().catch(() => {
        // If JSON parsing fails, return empty object
        return {};
      });

      // Check if request was successful (200-299 status codes)
      if (!response.ok) {
        const errorMessage = data.error || data.message || `Failed to send reset link (${response.status}). Please try again.`;
        setError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Check if the API returned success
      if (data.success === false) {
        const errorMessage = data.error || data.message || 'Failed to send reset link. Please try again.';
        setError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Success - show confirmation message (API always returns success: true for security)
      setIsSubmitted(true);
      setIsSubmitting(false);
      setError("");
    } catch (err) {
      console.error('Error sending password reset:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative z-10 overflow-hidden pt-20 pb-16 md:pb-20 lg:pt-32 lg:pb-28 min-h-screen flex items-center">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="shadow-three dark:bg-dark mx-auto max-w-[480px] rounded-2xl bg-white px-8 py-12 sm:p-12 border border-gray-100 dark:border-gray-800">
                <h3 className="mb-2 text-center text-3xl font-bold text-black sm:text-4xl dark:text-white">
                  Forgot Password?
                </h3>
                <p className="text-body-color mb-10 text-center text-base font-normal">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                {isSubmitted ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-emerald-800 dark:text-emerald-300">Check your email</p>
                          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                            We&apos;ve sent a password reset link to <strong>{email}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Didn&apos;t receive the email?{" "}
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-primary hover:underline"
                      >
                        Try again
                      </button>
                    </p>

                    <Link href="/signin">
                      <button className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-lg px-9 py-4 text-base font-semibold text-white duration-300">
                        Back to Sign In
                      </button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                          {error}
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="email"
                          className="text-dark mb-3 block text-sm dark:text-white"
                        >
                          Your Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-lg border bg-[#f8f8f8] px-6 py-3.5 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                        />
                      </div>

                      <div>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex w-full items-center justify-center rounded-lg px-9 py-4 text-base font-semibold text-white duration-300"
                        >
                          {isSubmitting ? "Sending..." : "Send Reset Link"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <p className="text-body-color text-center text-base font-medium mt-6">
                  Remember your password?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </>
  );
};

export default ForgotPasswordPage;

