"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import Image from "next/image";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { ArrowRight, CalendarClock, MapPin, Sparkles, CheckCircle2, Info, Clock, Flame } from "lucide-react";
import { motion, useInView } from "framer-motion";

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
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    } finally {
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
        <div className="container px-4 sm:px-6 lg:px-8">
          
          {/* TOP SECTION: EDITORIAL LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center mb-24 md:mb-32">
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

          {/* BOOKING SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Package Selection */}
            <div className="lg:col-span-7 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <span className="text-lime-500 font-black text-sm tracking-[0.3em]">01</span>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Select Your Package</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black/10 dark:border-white/10">
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
                </div>
              </motion.div>

              {/* Need something else? */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="p-10 md:p-12 bg-black text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1/3 h-full bg-lime-500/5 -skew-x-12 translate-x-1/4"></div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-black mb-8 uppercase italic tracking-tight">Need something else?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Groove Stepper", "Zumba Step", "Lil Steppers", "One Familia"].map((name) => (
                      <Link 
                        key={name}
                        href={
                          name === "One Familia"
                            ? "/zumfamilia"
                            : name === "Zumba Step"
                              ? "/classes/zumbaton"
                              : name === "Lil Steppers"
                                ? "/classes/lil-steppers"
                                : `/classes/${name.toLowerCase().replace(" ", "-")}`
                        }
                        className="group flex items-center justify-between p-6 border border-white/10 hover:bg-lime-500 hover:text-black transition-all duration-300"
                      >
                        <span className="font-black uppercase tracking-widest text-xs">{name}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Booking Form */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="bg-white dark:bg-zinc-950 p-10 md:p-12 border border-black/10 dark:border-white/10 shadow-2xl relative"
              >
                <div className="inline-block bg-lime-500 text-black px-6 py-2 text-xs font-black uppercase tracking-[0.3em] mb-10">
                  Book & Pay
                </div>
                
                <div className="mb-10">
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                    <Info className="w-3 h-3" /> Selected Package
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                    {FIESTA_PACKAGES[selectedPackage].label}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    {[
                      { id: "customerName", label: "Full Name", type: "text", required: true },
                      { id: "customerEmail", label: "Email Address", type: "email", required: true },
                      { id: "customerPhone", label: "Phone Number", type: "tel", required: true },
                      { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
                      { id: "participantName", label: "Participant Name (if different)", type: "text", required: false },
                      { id: "preferredDate", label: "Preferred Date", type: "date", required: true },
                      { id: "preferredTime", label: "Preferred Time", type: "time", required: true },
                    ].map((field) => (
                      <div key={field.id}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                          {field.label} {field.required && "*"}
                        </label>
                        <input
                          type={field.type}
                          required={field.required}
                          value={(form as any)[field.id]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-black border-b-2 border-gray-200 dark:border-zinc-800 px-0 py-4 text-gray-900 dark:text-white focus:border-lime-500 transition-all outline-none font-bold uppercase tracking-tight"
                        />
                      </div>
                    ))}
                    
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                        Gender *
                      </label>
                      <select
                        required
                        value={form.gender}
                        onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-black border-b-2 border-gray-200 dark:border-zinc-800 px-0 py-4 text-gray-900 dark:text-white focus:border-lime-500 transition-all outline-none font-bold uppercase tracking-tight appearance-none"
                      >
                        <option value="prefer_not_to_say">Prefer not to say</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Special Notes</label>
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-black border-b-2 border-gray-200 dark:border-zinc-800 px-0 py-4 text-gray-900 dark:text-white focus:border-lime-500 transition-all outline-none font-bold uppercase tracking-tight resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full group relative inline-flex items-center justify-center gap-4 bg-black dark:bg-white text-white dark:text-black py-6 text-sm font-black uppercase tracking-[0.3em] transition-all hover:bg-lime-500 hover:text-black dark:hover:bg-lime-500 shadow-2xl"
                  >
                    {submitting ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent animate-spin"></div>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    Secure payment powered by Stripe.
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <ClassesCTA />
    </div>
  );
}
