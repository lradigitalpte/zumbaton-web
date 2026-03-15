"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { supabase } from "@/lib/supabase";

function SigninPageContent() {
  const { openWhatsAppModal } = useWhatsAppModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const toast = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const hasRedirectedRef = useRef(false); // Guard to prevent multiple redirects

  // Show success message if password reset was successful
  useEffect(() => {
    if (searchParams.get('password-reset') === 'success') {
      toast.success("Password Reset Successful", "Your password has been reset. Please sign in with your new password.");
      // Remove the query parameter from URL
      router.replace('/signin');
    }
  }, [searchParams, toast, router]);

  // Consolidated redirect logic - prevents multiple redirects
  useEffect(() => {
    // Guard: prevent multiple redirects
    if (hasRedirectedRef.current) {
      return;
    }

    const handleRedirect = () => {
      if (hasRedirectedRef.current) return;
      hasRedirectedRef.current = true;
      router.replace("/dashboard");
    };

    // Case 1: Check existing session on mount
    const checkExistingSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!error && session?.user) {
          // Check if user is active before redirecting
          try {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('is_active')
              .eq('id', session.user.id)
              .single();

            // If user is deactivated, sign them out and don't redirect
            if (profile && profile.is_active === false) {
              console.warn('[Signin] User account is deactivated, signing out...');
              await supabase.auth.signOut();
              setIsCheckingSession(false);
              return;
            }
          } catch (profileError) {
            // If profile check fails, allow redirect (fail open)
            console.warn('[Signin] Failed to check user active status:', profileError);
          }

          console.log('[Signin] Existing session found, redirecting to dashboard');
          handleRedirect();
          setIsCheckingSession(false);
          return;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Signin] Session check failed, showing signin form');
        }
      } finally {
        setIsCheckingSession(false);
      }
    };

    // Case 2: User just authenticated (pendingRedirect flag)
    if (pendingRedirect && isAuthenticated) {
      // Check if user is active before redirecting
      if (user && user.id) {
        // User is authenticated and active (auth context already checked isActive)
        handleRedirect();
      } else if (user === null) {
        // User is null (deactivated) - don't redirect, sign out will be handled by auth context
        console.warn('[Signin] User is deactivated, not redirecting');
      }
      return;
    }

    // Case 3: User is already authenticated (e.g., navigating back to signin)
    if (!authLoading && !isCheckingSession && isAuthenticated) {
      // Check if user is active before redirecting
      if (user && user.id) {
        // User is authenticated and active (auth context already checked isActive)
        handleRedirect();
      } else if (user === null) {
        // User is null (deactivated) - don't redirect, sign out will be handled by auth context
        console.warn('[Signin] User is deactivated, not redirecting');
      }
      return;
    }

    // Initial session check
    if (isCheckingSession) {
      checkExistingSession();
    }
  }, [router, pendingRedirect, isAuthenticated, authLoading, isCheckingSession, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await signIn({ email, password });
      
      if (response.success) {
        toast.success("Welcome back!", "Redirecting to your dashboard...");
        // Set pending redirect flag - the useEffect will handle navigation
        // once isAuthenticated becomes true in the context
        setPendingRedirect(true);
        
        // Fallback: If state doesn't update within 2 seconds, force navigate
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        // Show specific error message from response
        const errorMessage = response.error?.message || "Invalid email or password";
        toast.error("Sign in failed", errorMessage);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      // Handle unexpected errors
      const errorMessage = err?.message || "An unexpected error occurred. Please try again.";
      console.error('[Signin] Unexpected error:', err);
      toast.error("Error", errorMessage);
      setIsSubmitting(false);
    }
    // Note: Don't reset isSubmitting on success - keep showing loading until redirect
  };

  // Show loading while checking for existing session
  if (isCheckingSession) {
    return (
      <section className="relative z-10 overflow-hidden min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-12 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-5xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-12 bg-gray-50 dark:bg-gray-950">
        {/* Centered Card Container */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-5xl">
              {/* Main Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                {/* Left Side - Sign In Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12">
                  <h3 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                    Signin
                  </h3>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                      <label
                        htmlFor="email"
                        className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
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
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                      />
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="password"
                        className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-4 pr-12 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" strokeWidth={2} />
                          ) : (
                            <Eye className="w-5 h-5" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
                      <div className="mb-4 sm:mb-0">
                        <label
                          htmlFor="checkboxLabel"
                          className="text-gray-700 dark:text-gray-300 flex cursor-pointer items-center text-sm font-medium select-none"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="checkboxLabel"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="sr-only"
                            />
                            <div className="box border-gray-300 dark:border-white/20 mr-4 flex h-5 w-5 items-center justify-center rounded-sm border">
                              <span className={`${rememberMe ? 'opacity-100' : 'opacity-0'}`}>
                                <svg
                                  width="11"
                                  height="8"
                                  viewBox="0 0 11 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                    fill="#3056D3"
                                    stroke="#3056D3"
                                    strokeWidth="0.4"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                          Keep me signed in
                        </label>
                      </div>
                      <div>
                        <Link
                          href="/forgot-password"
                          className="text-green-600 dark:text-green-400 text-sm font-medium hover:text-green-700 dark:hover:text-green-300 hover:underline transition-colors"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                    <div className="mb-6">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Side - Welcome Section with Gradient */}
                <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-green-600 via-green-500 to-teal-400 p-8 sm:p-10 lg:p-12 flex flex-col justify-center items-center text-center">
                  <div className="relative z-10 text-white">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                      Welcome back!
                    </h2>
                    <p className="text-white/90 text-base sm:text-lg mb-8 max-w-md">
                      Welcome back! We are so happy to have you here. It's great to see you again. We hope you had a safe and enjoyable time away.
                    </p>
                    <button
                      type="button"
                      onClick={openWhatsAppModal}
                      className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/30"
                    >
                      No account yet? Signup.
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SigninPageFallback() {
  return (
    <section className="relative z-10 overflow-hidden min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-full max-w-5xl">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<SigninPageFallback />}>
      <SigninPageContent />
    </Suspense>
  );
}
