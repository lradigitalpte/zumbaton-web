"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOrUsername = (email || '').trim();
    setError("");

    if (!emailOrUsername) {
      setError("Please enter your email or username");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailToUse = emailOrUsername;

    // If it doesn't look like an email, resolve username to email
    if (!emailRegex.test(emailOrUsername)) {
      try {
        const res = await fetch(
          `/api/auth/email-by-username?username=${encodeURIComponent(emailOrUsername)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg = res.status === 404
            ? 'Username not found.'
            : (body.error || 'Unable to look up username.');
          setError(msg);
          return;
        }
        const data = await res.json();
        const resolved = typeof data?.email === 'string' ? data.email.trim() : '';
        if (!resolved) {
          setError('Username not found.');
          return;
        }
        emailToUse = resolved;
      } catch (err) {
        console.error('[ForgotPassword] Username lookup failed:', err);
        setError('Unable to look up username. Please try again.');
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        setError(data.error || data.message || 'Failed to send verification code. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (response.ok && data.success) {
        router.push(`/verify-otp?email=${encodeURIComponent(emailToUse)}`);
      } else {
        setError(data.error || 'Failed to send verification code. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
                  Enter your email or username and we&apos;ll send a 6-digit verification code to reset your password. (Child accounts: use your username.)
                </p>

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
                          Email or username
                        </label>
                        <input
                          type="text"
                          name="email"
                          id="email"
                          autoComplete="username"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email or username"
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
                          {isSubmitting ? "Sending..." : "Send Verification Code"}
                        </button>
                      </div>
                    </div>
                  </form>

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

