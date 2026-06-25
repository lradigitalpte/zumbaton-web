"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import LoadingIcon from "@/components/Common/LoadingIcon";
import GoogleIcon from "@/components/Common/GoogleIcon";

function SigninPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (searchParams.get('password-reset') === 'success') {
      toast.success("Password Reset Successful", "Your password has been reset. Please sign in with your new password.");
      router.replace('/signin');
    }
  }, [searchParams, toast, router]);

  useEffect(() => {
    if (hasRedirectedRef.current) return;

    const handleRedirect = () => {
      if (hasRedirectedRef.current) return;
      hasRedirectedRef.current = true;
      router.replace("/dashboard");
    };

    const checkExistingSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          try {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('is_active')
              .eq('id', session.user.id)
              .single();

            if (profile && profile.is_active === false) {
              await supabase.auth.signOut();
              setIsCheckingSession(false);
              return;
            }
          } catch (profileError) {
            console.warn('[Signin] Failed to check user active status:', profileError);
          }
          handleRedirect();
          setIsCheckingSession(false);
          return;
        }
      } catch (error) {
        // Silent fail
      } finally {
        setIsCheckingSession(false);
      }
    };

    if (pendingRedirect && isAuthenticated) {
      if (user && user.id) handleRedirect();
      return;
    }

    if (!authLoading && !isCheckingSession && isAuthenticated) {
      if (user && user.id) handleRedirect();
      return;
    }

    if (isCheckingSession) checkExistingSession();
  }, [router, pendingRedirect, isAuthenticated, authLoading, isCheckingSession, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await signIn({ email, password });
      if (response.success) {
        toast.success("Welcome back!", "Redirecting to your dashboard...");
        setPendingRedirect(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toast.error("Sign in failed", response.error?.message || "Invalid email or password");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast.error("Error", err?.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <section className="min-h-screen bg-[#f6f4ee] dark:bg-black flex items-center justify-center">
        <LoadingIcon size="md" showLabel />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen pt-32 pb-20 bg-[#f6f4ee] dark:bg-black overflow-hidden flex items-center">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-lime-500/5 -skew-x-12 -z-10 pointer-events-none"></div>

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
                  Member Access
                </div>
                <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-10 text-gray-900 dark:text-white">
                  SIGN <span className="text-lime-500">IN</span>
                </h1>

                <button
                  type="button"
                  onClick={async () => {
                    setGoogleLoading(true);
                    try {
                      await signInWithGoogle();
                    } catch (err) {
                      toast.error("Google sign-in failed", err instanceof Error ? err.message : "Please try again.");
                      setGoogleLoading(false);
                    }
                  }}
                  disabled={googleLoading}
                  className="w-full mb-8 flex items-center justify-center gap-3 py-5 bg-white dark:bg-zinc-900 border-2 border-black/15 dark:border-white/20 text-gray-900 dark:text-white font-black uppercase tracking-[0.2em] text-sm hover:border-lime-500 transition-colors disabled:opacity-50"
                >
                  {googleLoading ? (
                    <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                  ) : (
                    <>
                      <GoogleIcon className="w-5 h-5" />
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">or</span>
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER YOUR EMAIL"
                      required
                      className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Password
                      </label>
                      <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 hover:text-black dark:hover:text-white transition-colors">
                        Forgot?
                      </Link>
                    </div>
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
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-lime-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 border-2 border-black/10 dark:border-white/10 rounded-none bg-transparent checked:bg-lime-500 checked:border-lime-500 transition-all cursor-pointer accent-lime-500"
                    />
                    <label htmlFor="remember" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer">
                      Keep me signed in
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? (
                      <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                    ) : (
                      <>
                        SIGN IN
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Right Side - Editorial Panel */}
            <div className="w-full lg:w-1/2 relative bg-black flex flex-col justify-center items-center text-center p-8 sm:p-12 lg:p-16 overflow-hidden">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
                style={{ backgroundImage: "url(/images/hero/hero.jpeg)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              
              {/* Sharp architectural lines */}
              <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none z-10"></div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-20"
              >
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-8">
                  WELCOME <br />
                  <span className="text-lime-500">BACK</span>
                </h2>
                <p className="text-lg font-medium uppercase tracking-tight text-white/70 max-w-sm mx-auto mb-12">
                  Ready for another session? Join the community and keep moving forward.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-lime-500 border-b-2 border-lime-500 pb-1 hover:text-white hover:border-white transition-colors"
                >
                  NO ACCOUNT YET? SIGNUP
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function SigninPageFallback() {
  return (
    <section className="min-h-screen bg-[#f6f4ee] dark:bg-black flex items-center justify-center">
      <LoadingIcon size="md" showLabel />
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
