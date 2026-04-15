"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import Image from "next/image";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { ArrowRight, CalendarClock, MapPin, Sparkles, CheckCircle2, Info } from "lucide-react";

type FiestaPackage = "1_session" | "2_sessions" | "4_sessions";

const FIESTA_PACKAGES: Record<FiestaPackage, { sessions: number; priceCents: number; label: string }> = {
  "1_session": { sessions: 1, priceCents: 2800, label: "1 session" },
  "2_sessions": { sessions: 2, priceCents: 5400, label: "2 sessions" },
  "4_sessions": { sessions: 4, priceCents: 10500, label: "4 sessions" },
};

export default function ZtFiestaPage() {
  const toast = useToast();
  const [selectedPackage, setSelectedPackage] = useState<FiestaPackage>("1_session");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    participantName: "",
    notes: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/zt-fiesta/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageOption: selectedPackage,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          participantName: form.participantName,
          notes: form.notes,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your request.");
      }

      toast.success("Request submitted. Our team will confirm your sessions shortly.");
      setForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        participantName: "",
        notes: "",
      });
      setSelectedPackage("1_session");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ClassesHero
        title="ZT Fiesta"
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "Classes", href: "/classes" },
          { label: "ZT Fiesta" },
        ]}
      />

      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/10 relative overflow-hidden">
        {/* Modern background accents */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 dark:bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold tracking-wide mb-6">
                <MapPin className="w-4 h-4" />
                West Side Outdoor Classes
              </span>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Fiesta</span> Experience
              </h2>
              <p className="mt-8 text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light max-w-xl">
                Join our vibrant outdoor community. High-energy dance fitness under the open sky, designed for all fitness levels.
              </p>
              
              <div className="mt-10 flex flex-col gap-4">
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                    <CalendarClock className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Register Interest</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submit your request today. Our team will contact you to finalize your booking and payment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">1-Month Validity</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Flexible packages that fit your schedule perfectly.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="relative h-64 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                  <Image src="/images/hero/hero.jpeg" alt="ZT Fiesta outdoor class moment" fill className="object-cover" />
                </div>
                <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-800">
                  <Image src="/images/image00065.jpeg" alt="ZT Fiesta group workout" fill className="object-cover" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-800">
                  <Image src="/images/hero/hero2.jpeg" alt="ZT Fiesta community energy" fill className="object-cover" />
                </div>
                <div className="relative h-64 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                  <Image src="/images/image00040.jpeg" alt="ZT Fiesta outdoor dance session" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">Select Your Package</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(Object.keys(FIESTA_PACKAGES) as FiestaPackage[]).map((key) => {
                    const option = FIESTA_PACKAGES[key];
                    const selected = selectedPackage === key;
                    return (
                      <label
                        key={key}
                        className={`group cursor-pointer relative rounded-[2rem] border-2 p-8 transition-all duration-300 ${
                          selected
                            ? "border-emerald-500 bg-white dark:bg-gray-800 shadow-2xl shadow-emerald-500/10 -translate-y-2"
                            : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 hover:border-emerald-200"
                        }`}
                      >
                        <input type="radio" className="sr-only" checked={selected} onChange={() => setSelectedPackage(key)} />
                        {selected && (
                          <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                        <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${selected ? "text-emerald-600" : "text-gray-400"}`}>
                          {option.label}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-gray-900 dark:text-white">${(option.priceCents / 100).toFixed(0)}</span>
                          <span className="text-gray-400 font-medium">.{(option.priceCents % 100).toString().padStart(2, '0')}</span>
                        </div>
                        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {option.sessions} Sessions Included
                        </p>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-gray-800 p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-6">Need something else?</h4>
                  <div className="flex flex-wrap gap-3">
                    {["Groove Stepper", "ZUMBATON", "ZUMBUDDIES", "ZumFamilia"].map((name) => (
                      <Link 
                        key={name}
                        href={name === "ZumFamilia" ? "/zumfamilia" : `/classes/${name.toLowerCase().replace(" ", "-")}`}
                        className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all font-medium"
                      >
                        {name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative">
                <div className="absolute -top-6 left-10 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/30">
                  Submit Request
                </div>
                
                <div className="mb-8 pt-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">
                    <Info className="w-4 h-4" /> Selected
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {FIESTA_PACKAGES[selectedPackage].label} Package
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { id: "customerName", label: "Full Name", type: "text", required: true },
                      { id: "customerEmail", label: "Email Address", type: "email", required: true },
                      { id: "customerPhone", label: "Phone Number", type: "tel", required: true },
                      { id: "participantName", label: "Participant Name (if different)", type: "text", required: false },
                    ].map((field) => (
                      <div key={field.id} className="relative group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          {field.label} {field.required && "*"}
                        </label>
                        <input
                          type={field.type}
                          required={field.required}
                          value={(form as any)[field.id]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full rounded-2xl border-2 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 text-gray-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none"
                        />
                      </div>
                    ))}
                    <div className="relative group">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Special Notes</label>
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                        className="w-full rounded-2xl border-2 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 text-gray-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full group relative inline-flex items-center justify-center gap-3 rounded-[2rem] bg-gray-900 dark:bg-white hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-gray-900 hover:text-white transition-all duration-300 font-bold py-5 text-lg shadow-xl"
                  >
                    {submitting ? (
                      <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                    ) : (
                      <>
                        Send Request
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-medium">
                    By submitting, you agree to our terms and conditions.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClassesCTA />
    </>
  );
}
