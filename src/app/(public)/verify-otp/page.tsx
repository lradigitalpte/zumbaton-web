"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from query params
  const email = searchParams.get('email') || '';

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value.replace(/\D/g, "");
      setCode(newCode);

      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !email) return;

    setResendTimer(30);
    setCode(["", "", "", "", "", ""]);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setError("");
        // Show success message (you can use a toast here if available)
        alert('Verification code sent! Please check your email.');
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      console.error('Error resending code:', err);
      setError('Failed to resend code. Please try again.');
    }
  };

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

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!email) {
      setError("Email address is required");
      return;
    }

    if (!password) {
      setError("Please enter a new password");
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
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otpCode: fullCode,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to reset password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success! Password updated - redirect to sign in
      alert('Password updated successfully! Please sign in with your new password.');
      setTimeout(() => {
        router.push('/signin');
      }, 500);
    } catch (err) {
      console.error('Error verifying OTP and updating password:', err);
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isComplete = code.every(digit => digit !== "");

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden pt-20 pb-16 md:pb-20 lg:pt-32 lg:pb-28 min-h-screen flex items-center">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="shadow-three dark:bg-dark mx-auto max-w-[480px] rounded-2xl bg-white px-8 py-12 sm:p-12 border border-gray-100 dark:border-gray-800">
                <h3 className="mb-2 text-center text-3xl font-bold text-black sm:text-4xl dark:text-white">
                  Reset Your Password
                </h3>
                <p className="text-body-color mb-10 text-center text-base font-normal">
                  We&apos;ve sent a 6-digit verification code to <strong>{email}</strong>. Enter the code and your new password below.
                </p>

                {/* Code Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    {/* Code Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                        Verification Code
                      </label>
                      <div className="flex justify-center gap-2 sm:gap-3">
                        {code.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white transition-colors"
                            disabled={isSubmitting}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="password"
                          className="text-dark mb-3 block text-sm dark:text-white"
                        >
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-lg border bg-[#f8f8f8] px-6 py-3.5 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none pr-12"
                            disabled={isSubmitting}
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
                        {password && (
                          <div className="mt-2 text-xs space-y-1">
                            <div className={passwordChecks.length ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                              {passwordChecks.length ? "✓" : "○"} At least 8 characters
                            </div>
                            <div className={passwordChecks.uppercase ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                              {passwordChecks.uppercase ? "✓" : "○"} One uppercase letter
                            </div>
                            <div className={passwordChecks.lowercase ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                              {passwordChecks.lowercase ? "✓" : "○"} One lowercase letter
                            </div>
                            <div className={passwordChecks.number ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                              {passwordChecks.number ? "✓" : "○"} One number
                            </div>
                            <div className={passwordChecks.special ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                              {passwordChecks.special ? "✓" : "○"} One special character
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="text-dark mb-3 block text-sm dark:text-white"
                        >
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-lg border bg-[#f8f8f8] px-6 py-3.5 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none pr-12"
                            disabled={isSubmitting}
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
                    </div>

                    {/* Resend */}
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Resend code in <span className="font-semibold">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-sm text-primary hover:text-primary/80 dark:text-primary font-medium"
                          disabled={isSubmitting}
                        >
                          Resend code
                        </button>
                      )}
                    </div>

                    {/* Submit */}
                    <div>
                      <button 
                        type="submit"
                        disabled={!isComplete || !isPasswordValid || password !== confirmPassword || !password || !confirmPassword || isSubmitting}
                        className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex w-full items-center justify-center rounded-lg px-9 py-4 text-base font-semibold text-white duration-300"
                      >
                        {isSubmitting ? "Updating Password..." : "Reset Password"}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:underline"
                    >
                      Change email address
                    </Link>
                  </p>
                </div>

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

function VerifyOTPFallback() {
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

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<VerifyOTPFallback />}>
      <VerifyOTPForm />
    </Suspense>
  );
}
