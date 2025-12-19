"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";

function SigninPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, isLoading: authLoading, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Show success message if password reset was successful
  useEffect(() => {
    if (searchParams.get('password-reset') === 'success') {
      toast.success("Password Reset Successful", "Your password has been reset. Please sign in with your new password.");
      // Remove the query parameter from URL
      router.replace('/signin');
    }
  }, [searchParams, toast, router]);

  // Fast check: Look for existing session in localStorage and auto-login
  useEffect(() => {
    let hasRedirected = false;
    
    const checkExistingSession = async () => {
      try {
        // Check localStorage directly for Supabase session
        // Supabase stores session as: sb-{project-ref}-auth-token
        const storageKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') && key.includes('-auth-token')
        );
        
        if (storageKeys.length > 0) {
          // Session exists in storage, try to get it (with timeout)
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
          );
          
          try {
            const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
            
            if (!error && session?.user) {
              // Valid session found - redirect to dashboard immediately
              console.log('[Signin] Existing session found, redirecting to dashboard');
              hasRedirected = true;
              router.replace("/dashboard");
              return;
            }
          } catch (error) {
            // Timeout or error - continue to show signin form
            console.log('[Signin] Session check timed out or failed, showing signin form');
          }
        }
      } catch (error) {
        console.error('[Signin] Error checking existing session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  // Watch for authentication state change and redirect when authenticated
  useEffect(() => {
    if (pendingRedirect && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [pendingRedirect, isAuthenticated, router]);

  // Also redirect if user is already authenticated (e.g., navigating back to signin)
  useEffect(() => {
    if (!authLoading && !isCheckingSession && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, isCheckingSession, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error("Google Sign In Failed", error instanceof Error ? error.message : "Failed to sign in with Google");
    }
  };

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
      <section className="relative z-10 overflow-hidden min-h-[calc(100vh-80px)] pt-8 sm:pt-12 lg:pt-16 pb-12 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
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
      <section className="relative z-10 overflow-hidden min-h-[calc(100vh-80px)] pt-8 sm:pt-12 lg:pt-16 pb-12 bg-gray-50 dark:bg-gray-950">
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

                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="mb-6 flex w-full items-center justify-center rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    <span className="mr-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_95:967)">
                          <path
                            d="M20.0001 10.2216C20.0122 9.53416 19.9397 8.84776 19.7844 8.17725H10.2042V11.8883H15.8277C15.7211 12.539 15.4814 13.1618 15.1229 13.7194C14.7644 14.2769 14.2946 14.7577 13.7416 15.1327L13.722 15.257L16.7512 17.5567L16.961 17.5772C18.8883 15.8328 19.9997 13.266 19.9997 10.2216"
                            fill="#4285F4"
                          />
                          <path
                            d="M10.2042 20.0001C12.9592 20.0001 15.2721 19.1111 16.9616 17.5778L13.7416 15.1332C12.88 15.7223 11.7235 16.1334 10.2042 16.1334C8.91385 16.126 7.65863 15.7206 6.61663 14.9747C5.57464 14.2287 4.79879 13.1802 4.39915 11.9778L4.27957 11.9878L1.12973 14.3766L1.08856 14.4888C1.93689 16.1457 3.23879 17.5387 4.84869 18.512C6.45859 19.4852 8.31301 20.0005 10.2046 20.0001"
                            fill="#34A853"
                          />
                          <path
                            d="M4.39911 11.9777C4.17592 11.3411 4.06075 10.673 4.05819 9.99996C4.0623 9.32799 4.17322 8.66075 4.38696 8.02225L4.38127 7.88968L1.19282 5.4624L1.08852 5.51101C0.372885 6.90343 0.00012207 8.4408 0.00012207 9.99987C0.00012207 11.5589 0.372885 13.0963 1.08852 14.4887L4.39911 11.9777Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M10.2042 3.86663C11.6663 3.84438 13.0804 4.37803 14.1498 5.35558L17.0296 2.59996C15.1826 0.901848 12.7366 -0.0298855 10.2042 -3.6784e-05C8.3126 -0.000477834 6.45819 0.514732 4.8483 1.48798C3.2384 2.46124 1.93649 3.85416 1.08813 5.51101L4.38775 8.02225C4.79132 6.82005 5.56974 5.77231 6.61327 5.02675C7.6568 4.28118 8.91279 3.87541 10.2042 3.86663Z"
                            fill="#EB4335"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_95:967">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    Sign in with Google
                  </button>
                  <div className="mb-6 flex items-center justify-center">
                    <span className="bg-gray-300 dark:bg-gray-600 h-[1px] w-full max-w-[70px]"></span>
                    <p className="text-gray-500 dark:text-gray-400 w-full px-5 text-center text-sm font-medium">
                      Or continue with email
                    </p>
                    <span className="bg-gray-300 dark:bg-gray-600 h-[1px] w-full max-w-[70px]"></span>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                      <label
                        htmlFor="email"
                        className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                      />
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
                    <Link
                      href="/signup"
                      className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/30"
                    >
                      No account yet? Signup.
                    </Link>
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
    <section className="relative z-10 overflow-hidden min-h-[calc(100vh-80px)] pt-8 sm:pt-12 lg:pt-16 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
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
