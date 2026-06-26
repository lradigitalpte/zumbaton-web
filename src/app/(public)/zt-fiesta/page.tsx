"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import Image from "next/image";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { ArrowRight, CalendarClock, Sparkles, CheckCircle2, Calendar, Clock, Users } from "lucide-react";
import { motion, useInView } from "framer-motion";
import LoadingIcon from "@/components/Common/LoadingIcon";
import WaiverForm from "@/components/Common/WaiverForm";
import { BookingWindowBanner } from "@/components/Booking/BookingWindowBanner";
import { useBookingWindowOpen } from "@/hooks/useBookingWindowOpen";
import { BOOKING_WINDOW_CLOSED_MESSAGE } from "@/lib/booking-window";

type FiestaPackage = "1_session";

const FIESTA_PACKAGES: Record<FiestaPackage, { sessions: number; priceCents: number; label: string }> = {
  "1_session": { sessions: 1, priceCents: 2800, label: "1 session" },
};

interface OutdoorClass {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  capacity: number;
  booked_count: number;
  instructor_name: string | null;
  room_name?: string | null;
  location?: string | null;
}

function formatClassDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).toUpperCase();
}

function formatClassTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore",
  }).toUpperCase();
}

function toSGTDateString(isoString: string): string {
  const date = new Date(isoString);
  // Format as YYYY-MM-DD in SGT
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" }); // en-CA gives YYYY-MM-DD
}

function toSGTTimeString(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore",
  }); // gives HH:MM
}

export default function ZtFiestaPage() {
  const toast = useToast();
  const [selectedPackage, setSelectedPackage] = useState<FiestaPackage>("1_session");
  const [submitting, setSubmitting] = useState(false);
  const bookingWindowOpen = useBookingWindowOpen();

  // Outdoor classes
  const [outdoorClasses, setOutdoorClasses] = useState<OutdoorClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

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

  // Fetch upcoming outdoor classes on mount
  useEffect(() => {
    async function fetchOutdoorClasses() {
      try {
        const res = await fetch("/api/classes?isOutdoor=true");
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          // Only show individual (non-parent) scheduled classes
          const upcoming = (result.data as any[])
            .filter(
              (c) =>
                (c.status === "scheduled" || c.status === "in-progress") &&
                !c.parent_class_id &&
                !(c.recurrence_type === "recurring" || c.recurrence_type === "course") &&
                new Date(c.scheduled_at) > new Date()
            )
            .map((c) => ({
              id: c.id,
              title: c.title,
              scheduled_at: c.scheduled_at,
              duration_minutes: c.duration_minutes,
              capacity: c.capacity,
              booked_count: c.booked_count || 0,
              instructor_name: c.instructor_name || null,
              room_name: c.rooms?.[0]?.name || null,
              location: c.location || null,
            }));
          setOutdoorClasses(upcoming);
        }
      } catch (e) {
        console.error("[ZumFiesta] Could not load outdoor classes:", e);
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchOutdoorClasses();
  }, []);

  const handleSelectClass = (cls: OutdoorClass) => {
    const spotsLeft = cls.capacity - cls.booked_count;
    if (spotsLeft <= 0) return; // full — don't select
    setSelectedClassId(cls.id);
    setForm((prev) => ({
      ...prev,
      preferredDate: toSGTDateString(cls.scheduled_at),
      preferredTime: toSGTTimeString(cls.scheduled_at),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.preferredDate || !form.preferredTime) {
      toast.error("Please select a class session before proceeding.");
      return;
    }
    if (!form.waiverAgreed || !form.nricLast4 || !form.signature) {
      toast.error("Please complete the liability waiver (NRIC, signature, and agreement).");
      return;
    }
    if (form.nricLast4.length !== 4) {
      toast.error("Enter exactly 4 characters for the last digits of your NRIC.");
      return;
    }
    if (!bookingWindowOpen) {
      toast.error(BOOKING_WINDOW_CLOSED_MESSAGE);
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
          classId: selectedClassId || undefined,
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

  const selectedClass = outdoorClasses.find((c) => c.id === selectedClassId);

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
                <div className="absolute top-12 right-12 w-full h-full bg-lime-500/10 border border-lime-500/20"></div>

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

            {/* Step 2: Pick a Class Session */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center gap-4 mb-10">
                <div className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center font-black text-xl italic">02</div>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Pick a Session</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Select an available outdoor class below
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                {loadingClasses ? (
                  <div className="flex items-center justify-center py-16 border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950">
                    <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                  </div>
                ) : outdoorClasses.length === 0 ? (
                  <div className="text-center py-16 border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950">
                    <Calendar className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">No sessions scheduled yet</p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-600">Check back soon — new outdoor classes are added regularly.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-black/10 dark:border-white/10">
                    {outdoorClasses.map((cls, i) => {
                      const spotsLeft = cls.capacity - cls.booked_count;
                      const isFull = spotsLeft <= 0;
                      const isSelected = selectedClassId === cls.id;
                      const isLast = i === outdoorClasses.length - 1;
                      const isOdd = outdoorClasses.length % 2 !== 0;
                      const isLastOdd = isOdd && isLast;

                      return (
                        <button
                          key={cls.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => handleSelectClass(cls)}
                          className={`relative p-8 text-left transition-all duration-300 border-b border-r border-black/10 dark:border-white/10
                            ${isLastOdd ? "sm:col-span-2" : ""}
                            ${isFull
                              ? "opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-950"
                              : isSelected
                                ? "bg-lime-500 text-black cursor-pointer"
                                : "bg-white dark:bg-zinc-950 hover:bg-lime-500/5 cursor-pointer"
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle2 className="w-6 h-6 text-black" />
                            </div>
                          )}

                          <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-3 ${
                            isSelected ? "text-black/60" : "text-lime-600 dark:text-lime-400"
                          }`}>
                            {formatClassDate(cls.scheduled_at)}
                          </p>

                          <h4 className={`text-lg font-black uppercase italic tracking-tight leading-tight mb-4 pr-8 ${
                            isSelected ? "text-black" : "text-gray-900 dark:text-white"
                          }`}>
                            {cls.title}
                          </h4>

                          <div className={`flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest ${
                            isSelected ? "text-black/70" : "text-zinc-500 dark:text-zinc-400"
                          }`}>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatClassTime(cls.scheduled_at)} · {cls.duration_minutes} MIN
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {isFull ? (
                                <span className="text-red-500">FULL</span>
                              ) : (
                                `${spotsLeft} SPOT${spotsLeft !== 1 ? "S" : ""} LEFT`
                              )}
                            </span>
                          </div>

                          {cls.instructor_name && (
                            <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${
                              isSelected ? "text-black/50" : "text-zinc-400 dark:text-zinc-600"
                            }`}>
                              {cls.instructor_name}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedClass && (
                  <div className="mt-6 px-6 py-4 bg-black text-white flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500 mb-1">Selected Session</p>
                      <p className="font-black uppercase italic text-sm tracking-tight">{selectedClass.title}</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
                        {formatClassDate(selectedClass.scheduled_at)} · {formatClassTime(selectedClass.scheduled_at)}
                      </p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-lime-500 shrink-0" />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Booking Details */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center gap-4 mb-10">
                <div className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center font-black text-xl italic">03</div>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Your Details</h3>
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
                  <BookingWindowBanner open={bookingWindowOpen} />
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

                    {/* Additional Info */}
                    <div className="space-y-8">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 border-b border-lime-500/20 pb-2">Additional Details</h4>
                      <div className="space-y-6">
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
                            rows={3}
                            value={form.notes}
                            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-medium focus:border-lime-500 outline-none transition-all resize-none"
                            placeholder="ANY REQUESTS?"
                          />
                        </div>

                        {/* Selected session summary */}
                        {selectedClass ? (
                          <div className="p-5 border border-lime-500/30 bg-lime-500/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 mb-2">Booked Session</p>
                            <p className="font-black uppercase italic text-sm text-gray-900 dark:text-white tracking-tight">{selectedClass.title}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                              {formatClassDate(selectedClass.scheduled_at)} · {formatClassTime(selectedClass.scheduled_at)}
                            </p>
                          </div>
                        ) : (
                          <div className="p-5 border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-black/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">No session selected</p>
                            <p className="text-xs text-zinc-400 mt-1">Please go back and select a class session above.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Waiver */}
                  <div className="pt-12 border-t border-black/10 dark:border-white/10">
                    <div className="flex flex-col items-center text-center gap-4 mb-10">
                      <div className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center font-black text-xl italic">04</div>
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
                      disabled={submitting || !selectedClassId || !bookingWindowOpen}
                      className="w-full max-w-2xl py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed text-black font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl flex items-center justify-center gap-4"
                    >
                      {submitting ? (
                        <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                      ) : !bookingWindowOpen ? (
                        <>Booking closed</>
                      ) : (
                        <>
                          {!selectedClassId ? "Select a session first" : "Proceed to Payment"}
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
