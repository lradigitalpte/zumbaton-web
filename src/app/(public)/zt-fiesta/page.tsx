"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import Image from "next/image";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { ArrowRight, CalendarClock, MapPin, Sparkles, CheckCircle2, Info, Clock, Flame, Calendar, Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import LoadingIcon from "@/components/Common/LoadingIcon";
import WaiverForm from "@/components/Common/WaiverForm";

type FiestaPackage = "1_session";

const FIESTA_PACKAGES: Record<FiestaPackage, { sessions: number; priceCents: number; label: string }> = {
  "1_session": { sessions: 1, priceCents: 2800, label: "1 session" },
};

export default function ZtFiestaPage() {
  const toast = useToast();
  const [selectedPackage, setSelectedPackage] = useState<FiestaPackage>("1_session");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    dateOfBirth: "",
    gender: "prefer_not_to_say",
    participantName: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
    waiverAgreed: false,
    nricLast4: "",
    signature: "",
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!form.waiverAgreed || !form.nricLast4 || !form.signature) {
      toast.error("Please complete the liability waiver (NRIC, signature, and agreement).");
      return;
    }
    if (form.nricLast4.length !== 4) {
      toast.error("Enter exactly 4 characters for the last digits of your NRIC.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/zt-fiesta/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageOption: selectedPackage,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          participantName: form.participantName,
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          notes: form.notes,
          nricLast4: form.nricLast4,
          signature: form.signature,
          waiverAgreed: true,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your request.");
      }

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error("Payment URL not received.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Payment failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f4ee] dark:bg-black min-h-screen transition-colors duration-300">
      <ClassesHero
        title="ZumFiesta"
        description="High-energy outdoor dance fitness under the open sky. Join our vibrant community for effective workout routines in the fresh air."
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "Classes", href: "/classes" },
          { label: "ZumFiesta" },
        ]}
      />

      <section ref={sectionRef} className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          {/* TOP SECTION: EDITORIAL LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center mb-32">
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-block bg-lime-500 text-black px-4 py-1 text-xs font-black uppercase tracking-[0.3em] mb-8">
                  West Side Outdoor
                </div>
                
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[0.85] uppercase italic tracking-tighter mb-10">
                  THE <br />
                  <span className="text-lime-500 underline decoration-4 underline-offset-8">FIESTA</span> <br />
                  EXPERIENCE.
                </h2>

                <p className="text-lg md:text-xl text-gray-600 dark:text-zinc-400 font-medium leading-relaxed mb-12 uppercase tracking-tight">
                  Join our vibrant outdoor community. High-energy dance fitness under the open sky, designed for all fitness levels.
                </p>
                
                <div className="space-y-8">
                  <div className="flex gap-6 group">
                    <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 transition-colors group-hover:bg-lime-500 group-hover:text-black">
                      <CalendarClock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-2">Book & Pay Instantly</h4>
                      <p className="text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">Choose your preferred slot, add your details, and proceed directly to secure payment.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 group">
                    <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 transition-colors group-hover:bg-lime-500 group-hover:text-black">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-2">1-Month Validity</h4>
                      <p className="text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">Flexible packages that fit your schedule perfectly.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative aspect-square w-full max-w-2xl ml-auto">
                {/* Background Block */}
                <div className="absolute top-12 right-12 w-full h-full bg-lime-500/10 border border-lime-500/20"></div>
                
                {/* Top Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute top-0 left-0 w-[85%] aspect-[4/3] z-10 border-4 border-white dark:border-zinc-900 shadow-2xl overflow-hidden"
                >
                  <Image
                    src="/images/fiesta/Screen7.png"
                    alt="ZumFiesta Outdoor"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </motion.div>

                {/* Overlapping Image */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="absolute bottom-0 right-0 w-[60%] aspect-square z-20 border-4 border-lime-500 shadow-2xl overflow-hidden"
                >
                  <Image
                    src="/images/fiesta/Screen6.png"
                    alt="ZumFiesta Energy"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="space-y-24">
            {/* Step 1: Package Selection */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center gap-4 mb-10">
                <div className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center font-black text-xl italic">01</div>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Select Your Package</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black/10 dark:border-white/10 max-w-4xl mx-auto">
                {(Object.keys(FIESTA_PACKAGES) as FiestaPackage[]).map((key) => {
                  const option = FIESTA_PACKAGES[key];
                  const selected = selectedPackage === key;
                  return (
                    <label
                      key={key}
                      className={`group cursor-pointer relative p-10 transition-all duration-500 border-r border-black/10 dark:border-white/10 last:border-r-0 ${
                        selected
                          ? "bg-lime-500 text-black"
                          : "bg-white dark:bg-zinc-950 text-gray-900 dark:text-white hover:bg-lime-500/5"
                      }`}
                    >
                      <input type="radio" className="sr-only" checked={selected} onChange={() => setSelectedPackage(key)} />
                      
                      <p className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${selected ? "text-black/60" : "text-lime-600 dark:text-lime-400"}`}>
                        {option.label}
                      </p>
                      
                      <div className="flex items-baseline gap-1 mb-8">
                        <span className={`text-5xl font-black italic tracking-tighter ${selected ? "text-black" : "text-gray-900 dark:text-white"}`}>
                          ${(option.priceCents / 100).toFixed(0)}
                        </span>
                        <span className={`font-black text-sm uppercase ${selected ? "text-black/40" : "text-gray-400"}`}>
                          .{(option.priceCents % 100).toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <p className={`text-sm font-black uppercase tracking-widest ${selected ? "text-black/60" : "text-gray-500 dark:text-zinc-500"}`}>
                        {option.sessions} Sessions Included
                      </p>

                      {selected && (
                        <div className="absolute top-10 right-10">
                          <CheckCircle2 className="w-8 h-8 text-black" />
                        </div>
                      )}
                    </label>
                  );
                })}
                
                {/* Need something else? - Integrated into the grid for better layout */}
                <div className="p-10 bg-black text-white relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-lime-500/5 -skew-x-12 translate-x-1/4"></div>
                  <div className="relative z-10">
                    <h4 className="text-lg font-black mb-4 uppercase italic tracking-tight">Other Classes</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {["Groove Stepper", "Zumba Step", "Lil Steppers", "One Familia"].map((name) => (
                        <Link 
                          key={name}
                          href={
                            name === "One Familia"
                              ? "/zumfamilia"
                              : name === "Zumba Step"
                                ? "/classes/zumba-step"
                                : name === "Lil Steppers"
                                  ? "/classes/lil-steppers"
                                  : `/classes/${name.toLowerCase().replace(" ", "-")}`
                          }
                          className="group flex items-center justify-between py-2 border-b border-white/10 hover:text-lime-500 transition-all duration-300"
                        >
                          <span className="font-black uppercase tracking-widest text-[10px]">{name}</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Booking Details */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center gap-4 mb-10">
                <div className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center font-black text-xl italic">02</div>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Booking Details</h3>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-8 md:p-12 shadow-2xl max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 pb-12 border-b border-black/10 dark:border-white/10">
                  <div>
                    <p className="text-lime-600 dark:text-lime-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Selected Package</p>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                      {FIESTA_PACKAGES[selectedPackage].label}
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black italic text-lime-600 dark:text-lime-400">
                      ${(FIESTA_PACKAGES[selectedPackage].priceCents / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">One-time</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Participant Info */}
                    <div className="space-y-8">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 border-b border-lime-500/20 pb-2">Participant Information</h4>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={form.customerName}
                            onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                            placeholder="NAME"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={form.customerEmail}
                            onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                            placeholder="EMAIL"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={form.customerPhone}
                            onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                            placeholder="+65"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Date of Birth *</label>
                            <input
                              type="date"
                              required
                              value={form.dateOfBirth}
                              onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                              className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gender *</label>
                            <select
                              required
                              value={form.gender}
                              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                              className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all appearance-none"
                            >
                              <option value="prefer_not_to_say">Prefer not to say</option>
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="space-y-8">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 border-b border-lime-500/20 pb-2">Preferred Schedule</h4>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preferred Date *</label>
                          <input
                            type="date"
                            required
                            value={form.preferredDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preferred Time *</label>
                          <input
                            type="time"
                            required
                            value={form.preferredTime}
                            onChange={(e) => setForm((prev) => ({ ...prev, preferredTime: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Participant Name (if different)</label>
                          <input
                            type="text"
                            value={form.participantName}
                            onChange={(e) => setForm((prev) => ({ ...prev, participantName: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                            placeholder="NAME"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Special Notes</label>
                          <textarea
                            rows={1}
                            value={form.notes}
                            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-medium focus:border-lime-500 outline-none transition-all resize-none"
                            placeholder="ANY REQUESTS?"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Waiver */}
                  <div className="pt-12 border-t border-black/10 dark:border-white/10">
                    <div className="flex flex-col items-center text-center gap-4 mb-10">
                      <div className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center font-black text-xl italic">03</div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">Liability Waiver</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                        Please acknowledge the waiver before proceeding to payment.
                      </p>
                    </div>
                    
                    <WaiverForm
                      wide
                      hideTitle
                      participantName={form.customerName}
                      onAgreementChange={(agreed, details) =>
                        setForm((prev) => ({
                          ...prev,
                          waiverAgreed: agreed,
                          nricLast4: details.nricLast4,
                          signature: details.signature,
                        }))
                      }
                    />
                  </div>

                  <div className="pt-12 flex flex-col items-center">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full max-w-2xl py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 text-black font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl flex items-center justify-center gap-4"
                    >
                      {submitting ? (
                        <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClassesCTA />
    </div>
  );
}
