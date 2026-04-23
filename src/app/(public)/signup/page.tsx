"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

const SignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, isLoading: authLoading } = useAuth();
  const toast = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestedNext = searchParams.get('next');
  const nextPath = requestedNext && requestedNext.startsWith('/') ? requestedNext : '/dashboard';

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
        phone,
        dateOfBirth,
        gender: gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
        password, 
        confirmPassword
      });
      
      if (response.success) {
        // Check if email confirmation is required (session is null but user exists)
        if (response.data?.tokens?.access_token) {
          // User is immediately signed in
          toast.success("Account created!", "Welcome to One Step Fitness.");
          router.push(nextPath);
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
                  <h3 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                    Signup
                  </h3>

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
                      htmlFor="phone"
                      className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="dateOfBirth"
                        className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                      >
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gender"
                        className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium"
                      >
                        Gender
                      </label>
                      <select
                        name="gender"
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-300"
                      >
                        <option value="prefer_not_to_say">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
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
                      backgroundImage: "url(/images/hero/hero.jpeg)"
                    }}
                  ></div>
                  <div className="relative z-10 text-white">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                      Start Your Journey!
                    </h2>
                    <p className="text-white/90 text-base sm:text-lg mb-6 max-w-md">
                      Join our vibrant community and experience the power of dance fitness. Transform your body and mind with One Step Fitness.
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
