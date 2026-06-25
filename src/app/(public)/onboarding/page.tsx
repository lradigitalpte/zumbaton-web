"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase";
import { getAdminApiUrl } from "@/lib/admin-api-url";
import { useToast } from "@/components/Toast";
import LoadingIcon from "@/components/Common/LoadingIcon";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();

  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Require a session; if already onboarded, skip straight to dashboard.
  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/signin?redirect=/onboarding");
        return;
      }
      setUserId(session.user.id);
      try {
        const res = await fetch("/api/onboarding", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data?.success && data.data?.completed === true) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // fail open — let them complete onboarding
      }
      // Prefill phone if we already have it (email signups carry it; Google ones don't).
      try {
        const profRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const prof = await profRes.json();
        if (prof?.success && prof.data?.phone) setPhone(prof.data.phone);
      } catch {
        // non-fatal
      }
      setChecking(false);
    };
    run();
  }, [router]);

  const getToken = async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { toast.warning("Required", "Please enter your phone number."); return; }
    if (!bloodGroup) { toast.warning("Required", "Please select your blood type."); return; }
    if (!dateOfBirth) { toast.warning("Required", "Please enter your date of birth."); return; }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      toast.warning("Required", "Please add an emergency contact name and phone.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/signin?redirect=/onboarding");
        return;
      }
      const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1) Save profile details
      const profileRes = await fetch("/api/profile", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          phone,
          bloodGroup,
          gender,
          dateOfBirth,
          emergencyContactName,
          emergencyContactPhone,
        }),
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok || !profileData.success) {
        throw new Error(profileData.error?.message || "Failed to save your details");
      }

      // 2) Mark onboarding complete
      const onbRes = await fetch("/api/onboarding", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ completed: true }),
      });
      const onbData = await onbRes.json();
      if (!onbRes.ok || !onbData.success) {
        throw new Error("Could not finish onboarding. Please try again.");
      }

      // 3) Trigger the registration form email from the admin app (non-blocking).
      //    Mirrors the retry pattern used in AuthContext.signUp().
      if (userId) {
        void Promise.resolve().then(async () => {
          try {
            const adminApiUrl = getAdminApiUrl();
            const endpoint = adminApiUrl.endsWith("/api")
              ? `${adminApiUrl}/registration-form/send`
              : `${adminApiUrl}/api/registration-form/send`;
            for (let attempt = 1; attempt <= 3; attempt += 1) {
              const resp = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });
              if (resp.ok) break;
              if (attempt < 3) await new Promise((r) => setTimeout(r, 1500));
            }
          } catch (formErr) {
            console.error("[Onboarding] Registration form send failed:", formErr);
          }
        });
      }

      toast.success("You're all set!", "Welcome to One Step Fitness.");
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Something went wrong", err instanceof Error ? err.message : "Please try again.");
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <section className="min-h-screen bg-[#f6f4ee] dark:bg-black flex items-center justify-center">
        <LoadingIcon size="md" showLabel />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen pt-28 pb-20 bg-[#f6f4ee] dark:bg-black overflow-hidden flex items-center">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-lime-500/5 -skew-x-12 -z-10 pointer-events-none"></div>

      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-2xl p-8 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lime-600 dark:text-lime-400 font-black text-xs uppercase tracking-[0.3em] mb-4">
              One quick step
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-3 text-gray-900 dark:text-white">
              ABOUT <span className="text-lime-500">YOU</span>
            </h1>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-10 leading-relaxed">
              We need a few health & safety details before your first class.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+65"
                  required
                  className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-semibold focus:border-lime-500 outline-none transition-colors rounded-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="bloodGroup" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Blood Type *
                  </label>
                  <select
                    id="bloodGroup"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    required
                    className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none appearance-none"
                  >
                    <option value="">SELECT</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Gender *
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

              <div className="space-y-2">
                <label htmlFor="dob" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Date of Birth *
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="ecName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Emergency Contact *
                  </label>
                  <input
                    type="text"
                    id="ecName"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="FULL NAME"
                    required
                    className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ecPhone" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Emergency Phone *
                  </label>
                  <input
                    type="tel"
                    id="ecPhone"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+65"
                    required
                    className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {submitting ? (
                  <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                ) : (
                  <>
                    ENTER THE APP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
