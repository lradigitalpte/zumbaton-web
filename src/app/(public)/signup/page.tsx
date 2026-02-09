"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles, Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

const SignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, isLoading: authLoading } = useAuth();
  const toast = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [earlyBirdData, setEarlyBirdData] = useState<{ remaining: number; isAvailable: boolean; discountPercent: number; validMonths: number } | null>(null);

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
    }
  }, [searchParams]);

  // Fetch early bird availability
  useEffect(() => {
    const fetchEarlyBirdAvailability = async () => {
      try {
        const response = await fetch('/api/promos/availability');
        const result = await response.json();
        if (result.success) {
          setEarlyBirdData({
            remaining: result.data.remaining,
            isAvailable: result.data.isAvailable,
            discountPercent: result.data.discountPercent,
            validMonths: result.data.validMonths
          });
        }
      } catch (error) {
        console.error('Failed to fetch early bird availability:', error);
      }
    };
    fetchEarlyBirdAvailability();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error("Google Sign In Failed", error instanceof Error ? error.message : "Failed to sign in with Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side password validation
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      toast.error("Validation Error", "Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      toast.error("Validation Error", "Password must be at least 8 characters");
      return;
    }
    
    setPasswordError("");
    
    if (!acceptTerms) {
      toast.warning("Terms Required", "Please accept the Terms and Conditions");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await signUp({ 
        name, 
        email, 
        password, 
        confirmPassword,
        referralCode: referralCode.trim() || undefined 
      });
      
      if (response.success) {
        // Check if email confirmation is required (session is null but user exists)
        if (response.data?.tokens?.access_token) {
          // User is immediately signed in
          toast.success("Account created!", "Welcome to Zumbaton.");
          router.push("/dashboard");
        } else {
          // Email confirmation required
          toast.success("Account created!", "Please check your email to confirm your account.");
          router.push("/signin");
        }
      } else {
        toast.error("Sign up failed", response.error?.message || "Failed to create account");
      }
    } catch (err) {
      toast.error("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative z-10 overflow-hidden min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-12 bg-gray-50 dark:bg-gray-950">
        {/* Centered Card Container */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-5xl">
              {/* Main Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                {/* Left Side - Sign Up Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12">
                  {/* Early Bird Banner */}
                  {earlyBirdData?.isAvailable && (
                    <div className="mb-4 p-2.5 sm:p-3 bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-lg shadow-md border border-green-400">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] xs:text-xs sm:text-sm font-semibold text-white leading-tight break-words">
                            🎉 Early Bird: <span className="font-bold">{earlyBirdData.remaining}</span> spots left
                            <span className="hidden sm:inline"> - Get <span className="font-bold">{earlyBirdData.discountPercent}% off</span> for {earlyBirdData.validMonths} months!</span>
                            <span className="sm:hidden"> - <span className="font-bold">{earlyBirdData.discountPercent}% off</span>!</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <h3 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                    Signup
                  </h3>

                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting || authLoading}
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
                  Sign up with Google
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
                      htmlFor="name"
                      className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                    />
                  </div>
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
                  <div className="mb-5">
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
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (confirmPassword && e.target.value !== confirmPassword) {
                            setPasswordError("Passwords do not match");
                          } else {
                            setPasswordError("");
                          }
                        }}
                        placeholder="Enter your password"
                        required
                        minLength={8}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-4 pr-12 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="confirmPassword"
                      className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (password && e.target.value !== password) {
                            setPasswordError("Passwords do not match");
                          } else {
                            setPasswordError("");
                          }
                        }}
                        placeholder="Confirm your password"
                        required
                        minLength={8}
                        className={`w-full rounded-xl border-2 bg-white dark:bg-gray-800 pl-4 pr-12 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300 ${
                          passwordError 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                        {passwordError}
                      </p>
                    )}
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="referralCode"
                      className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                    >
                      Referral Code <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="referralCode"
                      id="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="ZUMB-XXXXX"
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Get 8% off your first package purchase when you use a referral code
                    </p>
                    {earlyBirdData?.isAvailable && (
                      <p className="mt-2 text-xs font-semibold text-green-600 dark:text-green-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Early Bird: {earlyBirdData.discountPercent}% off ({earlyBirdData.remaining} spots left)
                      </p>
                    )}
                  </div>
                  <div className="mb-6 flex">
                    <label
                      htmlFor="checkboxLabel"
                      className="text-gray-700 dark:text-gray-300 flex cursor-pointer text-sm font-medium select-none"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="checkboxLabel"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="sr-only"
                        />
                        <div className="box border-body-color/20 mt-1 mr-4 flex h-5 w-5 items-center justify-center rounded-sm border dark:border-white/10">
                          <span className="opacity-0">
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
                      <span>
                        By creating account means you agree to the{" "}
                        <a href="#0" className="text-green-600 dark:text-green-400 hover:underline">
                          Terms and Conditions
                        </a>
                        , and our{" "}
                        <a href="#0" className="text-green-600 dark:text-green-400 hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>
                  <div className="mb-6">
                    <button 
                      type="submit"
                      disabled={isSubmitting || authLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {isSubmitting ? "Creating account..." : "Sign up"}
                    </button>
                  </div>
                </form>
                </div>

                {/* Right Side - Welcome Section with Gradient */}
                <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-green-600 via-green-500 to-teal-400 p-8 sm:p-10 lg:p-12 flex flex-col justify-center items-center text-center">
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                    style={{
                      backgroundImage: "url(/images/images/20251227_0814_Energetic Zumbathon Vibes_simple_compose_01kdfdy7cse3htgvxspp828dwf.png)"
                    }}
                  ></div>
                  <div className="relative z-10 text-white">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                      Start Your Journey!
                    </h2>
                    <p className="text-white/90 text-base sm:text-lg mb-6 max-w-md">
                      Join our vibrant community and experience the power of dance fitness. Transform your body and mind with Zumbaton.
                    </p>
                    <Link
                      href="/signin"
                      className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/30"
                    >
                      Already have an account? Signin.
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
};

const SignupPage = () => {
  return (
    <Suspense fallback={
      <section className="relative z-10 overflow-hidden min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-12 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-5xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10 lg:p-12">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    }>
      <SignupForm />
    </Suspense>
  );
};

export default SignupPage;
