"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Check if we have a valid password reset token
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If there's a token in the URL or a session, we're good
      const token = searchParams.get('token');
      if (token || session) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const validatePassword = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    return checks;
  };

  const passwordChecks = validatePassword(password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update password using Supabase
      // This works when the user has a valid reset token in their session
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        
        if (updateError.message.includes('session') || updateError.message.includes('token')) {
          setError('This password reset link has expired or is invalid. Please request a new one.');
        } else {
          setError(updateError.message || 'Failed to update password. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success - redirect to sign in
      router.push("/signin?password-reset=success");
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Something went wrong. Please try again.');
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
                  {isValidToken === false ? 'Invalid Reset Link' : 'Reset Your Password'}
                </h3>
                <p className="text-body-color mb-10 text-center text-base font-normal">
                  {isValidToken === false 
                    ? 'This password reset link has expired or is invalid. Please request a new one.'
                    : 'Create a secure password to complete your password reset.'}
                </p>

                {isValidToken === false ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        This password reset link is no longer valid. Password reset links expire after a certain time for security reasons.
                      </p>
                    </div>
                    <Link href="/forgot-password">
                      <button className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-lg px-9 py-4 text-base font-semibold text-white duration-300">
                        Request New Reset Link
                      </button>
                    </Link>
                    <Link href="/signin">
                      <button className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary flex w-full items-center justify-center rounded-lg border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:hover:shadow-none">
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
                          htmlFor="password"
                          className="text-dark mb-3 block text-sm dark:text-white"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                            className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-lg border bg-[#f8f8f8] px-6 py-3.5 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      {password && (
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password must contain:</p>
                          <ul className="space-y-1">
                            {[
                              { key: 'length', label: 'At least 8 characters' },
                              { key: 'uppercase', label: 'One uppercase letter' },
                              { key: 'lowercase', label: 'One lowercase letter' },
                              { key: 'number', label: 'One number' },
                              { key: 'special', label: 'One special character' },
                            ].map(({ key, label }) => (
                              <li key={key} className="flex items-center gap-2 text-xs">
                                {passwordChecks[key as keyof typeof passwordChecks] ? (
                                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                <span className={passwordChecks[key as keyof typeof passwordChecks] ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                                  {label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="text-dark mb-3 block text-sm dark:text-white"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                            className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-lg border bg-[#f8f8f8] px-6 py-3.5 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                        )}
                        {confirmPassword && password === confirmPassword && (
                          <p className="mt-1 text-xs text-emerald-500">Passwords match</p>
                        )}
                      </div>

                      <div>
                        <button 
                          type="submit"
                          disabled={isSubmitting || !isPasswordValid || password !== confirmPassword}
                          className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex w-full items-center justify-center rounded-lg px-9 py-4 text-base font-semibold text-white duration-300"
                        >
                          {isSubmitting ? "Resetting Password..." : "Reset Password"}
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
}

function ResetPasswordFallback() {
  return (
    <section className="relative z-10 overflow-hidden pt-20 pb-16 md:pb-20 lg:pt-32 lg:pb-28 min-h-screen flex items-center">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three dark:bg-dark mx-auto max-w-[480px] rounded-2xl bg-white px-8 py-12 sm:p-12 border border-gray-100 dark:border-gray-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

