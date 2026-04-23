"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { getZumFamiliaPackage, zumFamiliaPackages, ZumFamiliaPackageId } from "@/data/zumfamilia";
import { formatDate, formatTime } from "@/lib/utils";
import { Sparkles, Calendar, Clock, AlertCircle } from "lucide-react";

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

export default function ZumFamiliaDetailPage() {
  const params = useParams();
  const packageId = params.packageId as string;
  const pkg = getZumFamiliaPackage(packageId);
  const toast = useToast();

  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childName: "",
    childDateOfBirth: "",
    notes: "",
  });
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes/public");
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
          .filter((item: PublicClass) => {
            const title = item.title.toLowerCase();
            const classType = item.class_type.toLowerCase();
            return title.includes("zumfamilia") || classType.includes("zumfamilia");
          })
          .sort(
            (a: PublicClass, b: PublicClass) =>
              new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
          );

        setClasses(filtered);
        if (filtered.length > 0) {
          setSelectedClassId(filtered[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load One Familia schedule.");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [toast]);

  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Package Not Found</h1>
          <Link href="/zumfamilia" className="text-green-600 font-semibold mt-4 inline-block">
            Back to One Familia
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (classes.length > 0 && !selectedClassId) {
      toast.error("Please choose a class date and time.");
      return;
    }
    if (classes.length === 0 && (!customDate || !customTime)) {
      toast.error("Please choose your preferred date and time.");
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
          parentName: form.parentName,
          parentEmail: form.parentEmail,
          parentPhone: form.parentPhone,
          childName: form.childName,
          childDateOfBirth: form.childDateOfBirth,
          notes: form.notes,
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

      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-green-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20 relative overflow-hidden">
        {/* Abstract decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 xl:px-8 max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
            <aside className="lg:col-span-3 xl:col-span-3">
              <div className="lg:sticky lg:top-32 space-y-6">
                <h4 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">All One Familia Packages</h4>
                <div className="flex flex-col gap-3">
                  {zumFamiliaPackages.map((item) => (
                    <Link
                      key={item.id}
                      href={`/zumfamilia/${item.slug}`}
                      className={`block p-4 rounded-2xl transition-all duration-300 transform border ${
                        item.id === pkg.id
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-xl shadow-green-500/30 scale-105"
                          : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/50 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1"
                      }`}
                    >
                      <span className="font-semibold text-[15px]">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-9 xl:col-span-9 space-y-10 xl:space-y-12">
              <section className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl p-8 xl:p-10 border border-white/60 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{pkg.name}</h2>
                <p className="mt-5 text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">{pkg.fullDescription}</p>
              </section>

              <section className="bg-transparent">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 border-l-4 border-green-500 pl-4 rounded-sm">Program Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pkg.highlights.map((highlight) => (
                    <div key={highlight.title} className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 p-7 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/20 flex items-center justify-center mb-5 text-green-600 dark:text-green-400 font-bold text-xl shadow-inner shadow-white/50 dark:shadow-none">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{highlight.title}</h3>
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{highlight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-5 gap-8 xl:gap-12">
                <div className="xl:col-span-3">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 w-10 h-10 rounded-full flex items-center justify-center text-lg">
                      <Calendar className="w-5 h-5" />
                    </span>
                    Choose Schedule
                  </h2>
                  
                  {loadingClasses ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="w-8 h-8 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="rounded-3xl border-2 border-green-200 dark:border-green-800/50 bg-white dark:bg-gray-800 p-8 shadow-md">
                      <div className="flex flex-col items-center text-center mb-6">
                        <span className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner">
                          <Clock className="w-6 h-6" />
                        </span>
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                          No scheduled classes right now.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          But you can pick a date and time that works best for your family!
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preferred Date *</label>
                          <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} required className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-gray-50 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white transition-all shadow-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preferred Time *</label>
                          <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} required className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-gray-50 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white transition-all shadow-sm" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {classes.map((item) => {
                        const isSelected = selectedClassId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedClassId(item.id)}
                            className={`w-full text-left rounded-3xl border-2 p-6 transition-all duration-300 relative overflow-hidden ${
                              isSelected
                                ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 shadow-lg shadow-green-500/10 transform scale-[1.02]"
                                : "border-transparent bg-white dark:bg-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-green-300 dark:hover:border-green-700"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-4 right-4 text-green-500 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <p className="font-bold text-xl text-gray-900 dark:text-white mb-2">{item.title}</p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-[15px] text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1.5 shrink-0">
                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {formatDate(item.scheduled_at)} at {formatTime(item.scheduled_at)}
                              </span>
                              <span className="flex items-center gap-1.5 shrink-0">
                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {item.duration_minutes} mins
                              </span>
                            </div>
                            {item.instructor_name && (
                              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-4 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Instructor: {item.instructor_name}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <aside className="xl:col-span-2">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/50 dark:border-gray-700 shadow-[0_20px_50px_rgb(0,0,0,0.1)] xl:sticky xl:top-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 relative z-10">Book & Pay</h2>
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 relative z-10">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Package Option</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{pkg.name}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                          ${(pkg.priceCents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">One-time</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                      <div className="space-y-4">
                        <div className="relative">
                          <input required placeholder="Parent Name *" value={form.parentName} onChange={(e) => setForm((prev) => ({ ...prev, parentName: e.target.value }))} className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-white/80 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm" />
                        </div>
                        <div className="relative">
                          <input required type="email" placeholder="Parent Email *" value={form.parentEmail} onChange={(e) => setForm((prev) => ({ ...prev, parentEmail: e.target.value }))} className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-white/80 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm" />
                        </div>
                        <div className="relative">
                          <input required placeholder="Parent Phone *" value={form.parentPhone} onChange={(e) => setForm((prev) => ({ ...prev, parentPhone: e.target.value }))} className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-white/80 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm" />
                        </div>
                        <div className="relative">
                          <input required placeholder="Child Name *" value={form.childName} onChange={(e) => setForm((prev) => ({ ...prev, childName: e.target.value }))} className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-white/80 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm" />
                        </div>
                        <div className="relative">
                          <label className="text-xs font-semibold text-gray-500 ml-1 mb-1 block uppercase tracking-wide">Child Date of Birth *</label>
                          <input required type="date" value={form.childDateOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, childDateOfBirth: e.target.value }))} className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-white/80 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white transition-all shadow-sm" />
                        </div>
                        <div className="relative">
                          <textarea placeholder="Special notes or requests (optional)" rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="w-full rounded-2xl border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-green-500 bg-white/80 dark:bg-gray-900/50 dark:ring-gray-700 px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm resize-none" />
                        </div>
                      </div>

                      {selectedClass && (
                        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-100 dark:border-emerald-800/50 flex items-start gap-3">
                          <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <div>
                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Class Selected</p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 fade-in">
                              {formatDate(selectedClass.scheduled_at)} at {formatTime(selectedClass.scheduled_at)}
                            </p>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={processing || (classes.length > 0 && !selectedClassId) || (classes.length === 0 && (!customDate || !customTime))}
                        className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 text-lg shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 mt-6 flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Proceed to Payment
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </aside>
              </section>
            </div>
          </div>
        </div>
      </section>

      <ClassesCTA />
    </>
  );
}
