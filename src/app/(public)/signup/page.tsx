"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";
import LoadingIcon from "@/components/Common/LoadingIcon";

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
        if (response.data?.tokens?.access_token) {
          toast.success("Account created!", "Welcome to One Step Fitness.");
          router.push(nextPath);
        } else {
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
    <section className="relative min-h-screen pt-32 pb-20 bg-[#f6f4ee] dark:bg-black overflow-hidden flex items-center">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-lime-500/5 skew-x-12 -z-10 pointer-events-none"></div>

      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 flex flex-col lg:flex-row shadow-2xl">
            
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-lime-600 dark:text-lime-400 font-black text-xs uppercase tracking-[0.3em] mb-6">
                  Join the Tribe
                </div>
                <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-10 text-gray-900 dark:text-white">
                  SIGN <span className="text-lime-500">UP</span>
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ENTER YOUR FULL NAME"
                      required
                      className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="EMAIL@EXAMPLE.COM"
                        required
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+65"
                        required
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="dob" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="dob"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none appearance-none"
                      >
                        <option value="prefer_not_to_say">PREFER NOT TO SAY</option>
                        <option value="male">MALE</option>
                        <option value="female">FEMALE</option>
                        <option value="other">OTHER</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold focus:border-lime-500 outline-none transition-colors rounded-none"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-lime-500">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Confirm
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold focus:border-lime-500 outline-none transition-colors rounded-none"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-lime-500">
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 border-2 border-black/10 dark:border-white/10 rounded-none bg-transparent checked:bg-lime-500 checked:border-lime-500 transition-all cursor-pointer accent-lime-500"
                    />
                    <label htmlFor="terms" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer leading-relaxed">
                      I AGREE TO THE <Link href="/terms" className="text-lime-600 dark:text-lime-400 hover:underline">TERMS & CONDITIONS</Link> AND <Link href="/privacy" className="text-lime-600 dark:text-lime-400 hover:underline">PRIVACY POLICY</Link>.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? (
                      <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                    ) : (
                      <>
                        CREATE ACCOUNT
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Right Side - Editorial Panel */}
            <div className="w-full lg:w-1/2 relative bg-black flex flex-col justify-center items-center text-center p-8 sm:p-12 lg:p-16 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
                style={{ backgroundImage: "url(/images/hero/hero2.jpeg)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none z-10"></div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-20"
              >
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-8">
                  START YOUR <br />
                  <span className="text-lime-500">JOURNEY</span>
                </h2>
                <p className="text-lg font-medium uppercase tracking-tight text-white/70 max-w-sm mx-auto mb-12">
                  Join our vibrant community and experience the power of dance fitness. Transform your body and mind.
                </p>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-lime-500 border-b-2 border-lime-500 pb-1 hover:text-white hover:border-white transition-colors"
                >
                  ALREADY HAVE AN ACCOUNT? SIGNIN
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

const SignupPage = () => {
  return (
    <Suspense fallback={
      <section className="min-h-screen bg-[#f6f4ee] dark:bg-black flex items-center justify-center">
        <LoadingIcon size="md" showLabel />
      </section>
    }>
      <SignupForm />
    </Suspense>
  );
};

export default SignupPage;
