"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { getZumFamiliaPackage, isOneFamiliaScheduledClass, zumFamiliaPackages } from "@/data/zumfamilia";
import { formatDate, formatDateFull, formatTime } from "@/lib/utils";
import { Calendar, Check, MapPin, ArrowRight } from "lucide-react";
import LoadingIcon from "@/components/Common/LoadingIcon";
import WaiverForm from "@/components/Common/WaiverForm";
import { BookingWindowBanner } from "@/components/Booking/BookingWindowBanner";
import { useBookingWindowOpen } from "@/hooks/useBookingWindowOpen";
import { BOOKING_WINDOW_CLOSED_MESSAGE } from "@/lib/booking-window";
import { isSameDayClassInSingapore } from "@/lib/booking-window";

interface PublicClass {
  id: string;
  title: string;
  class_type: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  instructor_name: string | null;
  capacity: number;
  booked_count?: number;
}

function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Calendar day in Singapore (matches schedule display). */
function ymdSingapore(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
}

export default function ZumFamiliaDetailPage() {
  const params = useParams();
  const packageId = params.packageId as string;
  const pkg = getZumFamiliaPackage(packageId);
  const toast = useToast();

  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");
  /** Optional: limit the list to one calendar day (client-side); empty = all upcoming in range. */
  const [dayFilter, setDayFilter] = useState("");
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    parentName: "",
    parentPhone: "",
    childName: "",
    childDateOfBirth: "",
    notes: "",
    waiverAgreed: false,
    nricLast4: "",
    signature: "",
  });
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const today = new Date();
        const windowEnd = new Date(today);
        windowEnd.setDate(windowEnd.getDate() + 60);
        const params = new URLSearchParams({
          from: formatYmdLocal(today),
          to: formatYmdLocal(windowEnd),
        });
        const response = await fetch(`/api/classes/public?${params.toString()}`);
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) return;

        const filtered = result.data
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            class_type: item.class_type || "",
            scheduled_at: item.scheduled_at,
            duration_minutes: item.duration_minutes,
            location: item.location,
            instructor_name: item.instructor_name,
            capacity: item.capacity,
            booked_count: item.booked_count || 0,
          }))
          .filter((item: PublicClass) => isOneFamiliaScheduledClass(item.title, item.class_type))
          .filter((item: PublicClass) => !isSameDayClassInSingapore(item.scheduled_at))
          .sort(
            (a: PublicClass, b: PublicClass) =>
              new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
          );

        setClasses(filtered);
        const open = filtered.filter((item: PublicClass) => (item.booked_count ?? 0) < item.capacity);
        setSelectedClassId(open[0]?.id ?? "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load One Familia schedule.");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [toast]);

  const classesForDisplay = useMemo(() => {
    if (!dayFilter) return classes;
    return classes.filter((c) => ymdSingapore(c.scheduled_at) === dayFilter);
  }, [classes, dayFilter]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, PublicClass[]>();
    for (const c of classesForDisplay) {
      const k = ymdSingapore(c.scheduled_at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ymd, list]) => ({
        ymd,
        list: list.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
      }));
  }, [classesForDisplay]);

  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );
  const bookingWindowOpen = useBookingWindowOpen(selectedClass?.scheduled_at);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4ee] dark:bg-black">
        <div className="text-center px-4">
          <h1 className="text-2xl font-black uppercase italic text-gray-900 dark:text-white">Package Not Found</h1>
          <Link href="/zumfamilia" className="mt-6 inline-block text-lime-600 dark:text-lime-400 font-black text-xs uppercase tracking-widest hover:underline">
            Back to One Familia
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (classes.length > 0 && !selectedClassId) {
      toast.error("Please choose a session from the schedule (all listed times may be full).");
      return;
    }
    const chosen = classes.find((c) => c.id === selectedClassId);
    if (chosen && (chosen.booked_count ?? 0) >= chosen.capacity) {
      toast.error("That session is full. Please pick another time.");
      return;
    }
    if (classes.length === 0 && (!customDate || !customTime)) {
      toast.error("Please choose your preferred date and time.");
      return;
    }
    if (!form.parentName.trim() || !form.parentPhone.trim() || !form.childName.trim() || !form.childDateOfBirth) {
      toast.error("Please fill in all required fields.");
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

    setProcessing(true);
    try {
      const response = await fetch("/api/zumfamilia/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId || null,
          customSchedule: classes.length === 0 ? `${customDate} ${customTime}` : undefined,
          packageOption: pkg.id,
          parentName: form.parentName.trim(),
          parentPhone: form.parentPhone.trim(),
          childName: form.childName.trim(),
          childDateOfBirth: form.childDateOfBirth,
          notes: form.notes.trim() || undefined,
          nricLast4: form.nricLast4,
          signature: form.signature,
          waiverAgreed: true,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create payment.");
      }
      window.location.href = result.paymentUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed.");
      setProcessing(false);
    }
  };

  return (
    <>
      <ClassesHero
        title={pkg.name}
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "One Familia", href: "/zumfamilia" },
          { label: pkg.name },
        ]}
      />

      <section className="py-16 md:py-24 bg-[#f6f4ee] dark:bg-black text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-16">
            {/* Package nav - Horizontal at the top */}
            <div className="space-y-4">
              <p className="text-lime-600 dark:text-lime-400 font-black text-[10px] uppercase tracking-[0.3em] text-center">
                All One Familia Packages
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {zumFamiliaPackages.map((item) => (
                  <Link
                    key={item.id}
                    href={`/zumfamilia/${item.slug}`}
                    className={`px-6 py-3 border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                      item.id === pkg.id
                        ? "border-lime-500 bg-lime-500 text-black shadow-lg"
                        : "border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 hover:border-lime-500/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-16">
              <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-8 md:p-12 shadow-sm text-center">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6">{pkg.name}</h2>
                <p className="text-base md:text-lg font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl mx-auto">
                  {pkg.fullDescription}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight mb-10 flex items-center justify-center gap-4">
                  <span className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center text-lg font-black italic">★</span>
                  Program Highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {pkg.highlights.map((highlight) => (
                    <div
                      key={highlight.title}
                      className="border-t-4 border-lime-500 bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/10 p-8 shadow-sm flex flex-col items-center text-center"
                    >
                      <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white mb-4">
                        {highlight.title}
                      </h3>
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
                        {highlight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-20">
                {/* Step 1: Schedule Selection */}
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black dark:border-white pb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-black text-lime-500 px-2 py-0.5 text-[10px] font-black uppercase italic">01</div>
                        <div className="text-lime-600 dark:text-lime-400 font-black text-xs uppercase tracking-[0.2em]">
                          Step
                        </div>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none text-gray-900 dark:text-white">
                        CHOOSE <span className="text-lime-500">SCHEDULE</span>
                      </h2>
                    </div>

                    <div className="w-full md:max-w-md space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
                        Filter by day (optional)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input
                          type="date"
                          value={dayFilter}
                          onChange={(e) => setDayFilter(e.target.value)}
                          min={formatYmdLocal(new Date())}
                          className="w-full sm:w-48 bg-white dark:bg-black border-2 border-red-600 dark:border-red-500 px-4 py-2 text-xs font-bold uppercase tracking-widest focus:border-red-700 outline-none transition-all text-center shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]"
                        />
                        {dayFilter ? (
                          <button
                            type="button"
                            onClick={() => setDayFilter("")}
                            className="text-[9px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 hover:underline px-2 py-2"
                          >
                            Show all upcoming
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1">
                            Next 60 days
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {loadingClasses ? (
                    <div className="py-16 flex justify-center">
                      <LoadingIcon size="md" showLabel />
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="border-2 border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-8">
                      <p className="font-black uppercase tracking-widest text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        No scheduled One Familia classes in the next 60 days.
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                        Tell us when you would like to join; we will follow up to confirm.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preferred Date *</label>
                          <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preferred Time *</label>
                          <input
                            type="time"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ) : sessionsByDate.length === 0 ? (
                    <div className="border-2 border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-8">
                      <p className="font-black uppercase tracking-widest text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        No sessions on this day.
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                        Clear the day filter or pick another date.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDayFilter("")}
                        className="text-xs font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 hover:underline"
                      >
                        Show all upcoming
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {sessionsByDate.map(({ ymd, list }) => (
                        <div key={ymd} className="space-y-4">
                          <div className="flex items-center gap-3 border-b-2 border-black/10 dark:border-white/10 pb-3">
                            <Calendar className="w-5 h-5 text-lime-600 dark:text-lime-400 shrink-0" />
                            <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white">
                              {formatDateFull(list[0].scheduled_at)}
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {list.map((item) => {
                              const isSelected = selectedClassId === item.id;
                              const full = (item.booked_count ?? 0) >= item.capacity;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  disabled={full}
                                  onClick={() =>
                                    !full &&
                                    setSelectedClassId((prev) => (prev === item.id ? "" : item.id))
                                  }
                                  className={`w-full text-left p-6 border-2 transition-all relative overflow-hidden ${
                                    full
                                      ? "opacity-50 cursor-not-allowed border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900"
                                      : isSelected
                                        ? "border-lime-500 bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]"
                                        : "border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 hover:border-lime-500/40 hover:shadow-[4px_4px_0px_0px_rgba(163,230,53,0.2)]"
                                  }`}
                                >
                                  {isSelected && !full && (
                                    <div className="absolute top-0 right-0 bg-lime-500 text-black px-3 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                      <Check className="w-3 h-3" /> SELECTED · TAP TO CLEAR
                                    </div>
                                  )}
                                  {full && (
                                    <div className="absolute top-0 right-0 bg-zinc-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                                      FULL
                                    </div>
                                  )}
                                  <div className="text-lime-600 dark:text-lime-400 font-black text-[10px] uppercase tracking-widest mb-2">
                                    {formatTime(item.scheduled_at)} • {item.duration_minutes} MIN
                                  </div>
                                  <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">{item.title}</h4>
                                  <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    {item.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {item.location}
                                      </span>
                                    )}
                                  </div>
                                  {item.instructor_name && (
                                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
                                      {item.instructor_name}
                                    </p>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: Booking Details */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-black text-lg italic">02</div>
                    <h2 className="text-xl font-black uppercase italic tracking-tight">Booking Details</h2>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-6 md:p-10 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-10 border-b border-black/10 dark:border-white/10">
                      <div>
                        <p className="text-lime-600 dark:text-lime-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Package Selected</p>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{pkg.name}</h3>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic text-lime-600 dark:text-lime-400">
                          ${(pkg.priceCents / 100).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">One-time</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                      <BookingWindowBanner open={bookingWindowOpen} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Parent Info */}
                        <div className="space-y-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 border-b border-lime-500/20 pb-2">Parent Information</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Parent name *</label>
                              <input
                                required
                                value={form.parentName}
                                onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                                placeholder="FULL NAME"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Parent phone *</label>
                              <input
                                required
                                type="tel"
                                value={form.parentPhone}
                                onChange={(e) => setForm((p) => ({ ...p, parentPhone: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                                placeholder="+65"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Child Info */}
                        <div className="space-y-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 border-b border-lime-500/20 pb-2">Child Information</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Child name *</label>
                              <input
                                required
                                value={form.childName}
                                onChange={(e) => setForm((p) => ({ ...p, childName: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                                placeholder="CHILD NAME"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Child date of birth *</label>
                              <input
                                required
                                type="date"
                                value={form.childDateOfBirth}
                                onChange={(e) => setForm((p) => ({ ...p, childDateOfBirth: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Notes (optional)</label>
                        <textarea
                          rows={3}
                          value={form.notes}
                          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                          className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-medium focus:border-lime-500 outline-none resize-none transition-all"
                          placeholder="Special requests, medical notes, etc."
                        />
                      </div>

                      {selectedClass && (
                        <div className="p-6 bg-lime-500/10 border border-lime-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-lime-500 text-black flex items-center justify-center rounded-full">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Selected Session</p>
                              <p className="text-sm font-black uppercase tracking-widest">{formatDate(selectedClass.scheduled_at)} @ {formatTime(selectedClass.scheduled_at)}</p>
                            </div>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest bg-lime-500 text-black px-3 py-1">
                            Confirmed
                          </div>
                        </div>
                      )}

                      {/* Step 3: Waiver */}
                      <div className="pt-10 border-t border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-black text-lg italic">03</div>
                          <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Liability Waiver</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                              The booking parent signs for this One Familia session.
                            </p>
                          </div>
                        </div>
                        <WaiverForm
                          wide
                          hideTitle
                          participantName={form.parentName}
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

                      <div className="pt-10 flex flex-col items-center">
                        <button
                          type="submit"
                          disabled={
                            processing ||
                            !bookingWindowOpen ||
                            (classes.length > 0 && !selectedClassId) ||
                            (classes.length === 0 && (!customDate || !customTime))
                          }
                          className="w-full max-w-2xl py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 text-black font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl flex items-center justify-center gap-4"
                        >
                          {processing ? (
                            <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                          ) : !bookingWindowOpen ? (
                            <>Booking closed</>
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
          </div>
        </div>
      </section>

      <ClassesCTA />
    </>
  );
}
