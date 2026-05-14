"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { dateOfBirthFromAge, parseAgeYearsInput } from "@/lib/user-age-utils";
import { useToast } from "@/components/Toast";
import TrialBookingHero from "@/components/TrialBooking/TrialBookingHero";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Clock, MapPin, ArrowRight, X, ChevronLeft, ChevronRight, Check, Zap } from "lucide-react";
import Image from "next/image";
import LoadingIcon from "@/components/Common/LoadingIcon";
import WaiverForm from "@/components/Common/WaiverForm";
import {
  getTrialBookingDisplayTitle,
  getTrialBookingEffectiveAgeGroup,
} from "@/lib/trial-booking-display";

interface Class {
  id: string;
  title: string;
  description: string | null;
  class_type: string;
  instructor_id?: string | null;
  instructor_name: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  room_name: string | null;
  capacity: number;
  token_cost: number;
  trial_price_cents: number | null;
  booked_count?: number;
  instructor_avatar?: string | null;
  age_group?: 'adult' | 'kid' | 'all' | null;
}

interface InstructorProfile {
  id: string;
  name: string;
  avatar_url: string | null;
}

const CLASSES_PER_PAGE = 10;

/** Monday-start week in the user's local calendar containing anchorYmd. */
function startOfWeekMondayLocal(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = x.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + diff);
  return x;
}

function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekRangeFromAnchorYmd(anchorYmd: string): { from: string; to: string } {
  const [y, m, d] = anchorYmd.split("-").map(Number);
  if (!y || !m || !d) return { from: anchorYmd, to: anchorYmd };
  const anchor = new Date(y, m - 1, d);
  const mon = startOfWeekMondayLocal(anchor);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { from: formatYmdLocal(mon), to: formatYmdLocal(sun) };
}

function getDefaultTrialPrice(ageGroup: 'adult' | 'kid' | 'all' | null | undefined): number {
  if (ageGroup === 'kid') return 1800;
  return 2300;
}

function getTrialPriceCents(ageGroup: 'adult' | 'kid' | 'all' | null | undefined, trialPriceCents: number | null): number {
  const fromDb = trialPriceCents && trialPriceCents > 0 ? trialPriceCents : null;
  if (ageGroup === 'kid' && fromDb === 1700) return 1800;
  if (fromDb != null) return fromDb;
  return getDefaultTrialPrice(ageGroup);
}

export default function TrialBookingPage() {
  const router = useRouter();
  const toast = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(() => formatYmdLocal(new Date()));
  const [dateRangeMode, setDateRangeMode] = useState<"day" | "week">("day");
  const [ageGroupFilter, setAgeGroupFilter] = useState<'all' | 'adult' | 'kid'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [instructorProfiles, setInstructorProfiles] = useState<Record<string, InstructorProfile>>({});
  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    age: "",
    gender: "prefer_not_to_say",
    waiverAgreed: false,
    nricLast4: "",
    signature: "",
  });
  const [guardianData, setGuardianData] = useState({
    guardianName: "",
    guardianPhone: "",
    guardianOnPremises: false,
    guardianSignature: "",
  });
  const [processing, setProcessing] = useState(false);

  const weekRangeSummary = useMemo(() => {
    if (dateRangeMode !== "week" || !dateFilter) return null;
    const { from, to } = weekRangeFromAnchorYmd(dateFilter);
    return {
      from,
      to,
      label: `${formatDate(`${from}T12:00:00`)} – ${formatDate(`${to}T12:00:00`)}`,
    };
  }, [dateRangeMode, dateFilter]);

  const getInitials = (name: string | null): string => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    const fetchInstructorProfiles = async () => {
      try {
        const instructorIds = new Set<string>();
        const instructorNames = new Set<string>();
        classes.forEach((cls) => {
          if (cls.instructor_id) instructorIds.add(cls.instructor_id);
          if (cls.instructor_name) {
            cls.instructor_name.split(',').map(n => n.trim()).forEach(name => instructorNames.add(name));
          }
        });

        if (instructorIds.size > 0 || instructorNames.size > 0) {
          const params = new URLSearchParams();
          if (instructorIds.size > 0) params.append('ids', Array.from(instructorIds).join(','));
          if (instructorNames.size > 0) params.append('names', Array.from(instructorNames).join(','));

          const response = await fetch(`/api/instructors/profiles?${params.toString()}`, { cache: "no-store" });
          const result = await response.json();

          if (result.success && result.data) {
            const profiles: Record<string, InstructorProfile> = {};
            const requestedNames = Array.from(instructorNames);
            result.data.forEach((profile: any) => {
              const profileData = { id: profile.id, name: profile.name, avatar_url: profile.avatar_url ?? null };
              profiles[profile.id] = profileData;
              profiles[profile.name] = profileData;
              const profileNameNorm = (profile.name || "").toLowerCase().trim().replace(/\s+/g, " ");
              requestedNames.forEach((name: string) => {
                const nameNorm = name.toLowerCase().trim().replace(/\s+/g, " ");
                if (!nameNorm) return;
                if (profileNameNorm === nameNorm || profileNameNorm.startsWith(nameNorm + " ") || nameNorm.startsWith(profileNameNorm + " ")) {
                  profiles[name] = profileData;
                }
              });
            });
            setInstructorProfiles(profiles);
          }
        }
      } catch (error) {
        console.error("Error fetching instructor profiles:", error);
      }
    };
    if (classes.length > 0) fetchInstructorProfiles();
  }, [classes]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const params = new URLSearchParams();
        const anchorYmd = dateFilter || formatYmdLocal(new Date());
        if (dateRangeMode === "week") {
          const { from, to } = weekRangeFromAnchorYmd(anchorYmd);
          params.append("from", from);
          params.append("to", to);
        } else {
          params.append("date", anchorYmd);
        }
        const response = await fetch(`/api/classes/public?${params.toString()}`);
        const result = await response.json();
        if (result.success && result.data) {
          const availableClasses = result.data.map((cls: any) => ({ ...cls, booked_count: cls.booked_count || 0 }));
          availableClasses.sort((a: Class, b: Class) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
          
          setClasses(availableClasses);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to load classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
    setCurrentPage(1);
  }, [toast, dateFilter, dateRangeMode]);

  const filteredClasses = classes.filter((cls) => {
    const g = getTrialBookingEffectiveAgeGroup(cls.title, cls.age_group);
    if (ageGroupFilter === "all") return true;
    if (ageGroupFilter === "kid") return g === "kid";
    if (ageGroupFilter === "adult") return g === "adult" || g === "all";
    return true;
  });

  const totalPages = Math.ceil(filteredClasses.length / CLASSES_PER_PAGE);
  const paginatedClasses = filteredClasses.slice((currentPage - 1) * CLASSES_PER_PAGE, currentPage * CLASSES_PER_PAGE);

  const handleClassSelect = (classItem: Class) => {
    if (selectedClass?.id === classItem.id) {
      setSelectedClass(null);
      return;
    }
    const availableSpots = classItem.capacity - (classItem.booked_count || 0);
    if (availableSpots <= 0) {
      toast.error("This class is fully booked. Please select another class.");
      return;
    }
    setSelectedClass(classItem);
    if (getTrialBookingEffectiveAgeGroup(classItem.title, classItem.age_group) !== "kid") {
      setGuardianData({ guardianName: "", guardianPhone: "", guardianOnPremises: false, guardianSignature: "" });
    }
    if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }
    if (!formData.guestName.trim()) {
      toast.error(
        getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid"
          ? "Please enter kid's name"
          : "Please enter your name",
      );
      return;
    }
    const isKidsClass = getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid";
    if (!isKidsClass) {
      if (!formData.guestPhone.trim()) {
        toast.error("Please enter your phone number");
        return;
      }
    }
    if (!formData.age.trim()) {
      toast.error("Please enter age");
      return;
    }
    const ageYears = parseAgeYearsInput(formData.age);
    if (ageYears == null) {
      toast.error("Please enter a valid age (1–120)");
      return;
    }
    const dateOfBirthIso = dateOfBirthFromAge(ageYears);
    if (!dateOfBirthIso) {
      toast.error("Could not process age. Please try again.");
      return;
    }
    if (isKidsClass) {
      if (!guardianData.guardianName.trim() || !guardianData.guardianPhone.trim()) {
        toast.error("Please fill in all guardian information");
        return;
      }
      if (!guardianData.guardianOnPremises) {
        toast.error("You must confirm that a parent/guardian will be on premises");
        return;
      }
      if (!guardianData.guardianSignature) {
        toast.error("Guardian signature is required");
        return;
      }
    }

    if (!formData.waiverAgreed || !formData.nricLast4 || !formData.signature) {
      toast.error("You must agree to the waiver and provide NRIC/Signature");
      return;
    }

    setProcessing(true);
    try {
      const requestBody: any = {
        classId: selectedClass.id,
        guestName: formData.guestName.trim(),
        dateOfBirth: dateOfBirthIso,
        gender: formData.gender,
        nricLast4: formData.nricLast4,
        signature: formData.signature,
      };
      if (isKidsClass) {
        requestBody.guardianName = guardianData.guardianName.trim();
        requestBody.guardianPhone = guardianData.guardianPhone.trim();
        requestBody.guardianOnPremises = guardianData.guardianOnPremises;
        requestBody.guardianSignature = guardianData.guardianSignature;
        requestBody.guestPhone = guardianData.guardianPhone.trim();
      } else {
        requestBody.guestPhone = formData.guestPhone.trim();
      }

      const response = await fetch("/api/trial-booking/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to create payment");
      if (result.paymentUrl) window.location.href = result.paymentUrl;
      else throw new Error("Payment URL not received");
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process booking. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4ee] dark:bg-black">
        <LoadingIcon size="md" showLabel />
      </div>
    );
  }

  return (
    <>
      <TrialBookingHero />
      <div className="min-h-screen bg-[#f6f4ee] dark:bg-black py-20 overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full bg-lime-500/5 -skew-x-12 -z-10 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="space-y-24">
            
            {/* Step 1: Class Selection */}
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black dark:border-white pb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-black text-lime-500 px-2 py-0.5 text-[10px] font-black uppercase italic">01</div>
                    <div className="text-lime-600 dark:text-lime-400 font-black text-xs uppercase tracking-[0.2em]">
                      Step
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-gray-900 dark:text-white">
                    AVAILABLE <span className="text-lime-500">CLASSES</span>
                  </h2>
                </div>

                <div className="flex items-baseline gap-3 bg-white dark:bg-zinc-900 px-6 py-3 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-2xl font-black text-lime-600 dark:text-lime-400">
                    ${ageGroupFilter === 'kid' 
                      ? (getDefaultTrialPrice('kid') / 100).toFixed(2)
                      : (getDefaultTrialPrice('adult') / 100).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    PER TRIAL SESSION
                  </span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-zinc-100 dark:bg-zinc-900/50 p-6 border border-black/5 dark:border-white/5">
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                  <div className="w-full sm:w-auto space-y-1">
                    <label htmlFor="dateFilter" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
                      {dateRangeMode === "week" ? "Week includes this date" : "Select date"}
                    </label>
                    <input
                      type="date"
                      id="dateFilter"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full sm:w-48 bg-white dark:bg-black border-2 border-red-600 dark:border-red-500 px-4 py-2 text-xs font-bold uppercase tracking-widest focus:border-red-700 outline-none transition-colors rounded-none shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]"
                    />
                    {dateRangeMode === "week" && weekRangeSummary && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 max-w-[16rem] leading-relaxed">
                        Kids: {weekRangeSummary.label}
                      </p>
                    )}
                    {dateRangeMode === "day" && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 max-w-[16rem] leading-relaxed">
                        Adults / All: one day at a time
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-auto space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
                      Category
                    </label>
                    <div
                      className="flex w-full sm:w-auto bg-white p-1 dark:bg-black border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                      role="group"
                      aria-label="Class category"
                    >
                      {(['all', 'adult', 'kid'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setAgeGroupFilter(tab);
                            setCurrentPage(1);
                            if (tab === "kid") setDateRangeMode("week");
                            else setDateRangeMode("day");
                          }}
                          className={`min-h-[38px] flex-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 sm:flex-none sm:px-5 ${
                            ageGroupFilter === tab
                              ? "bg-black text-white border-black dark:bg-lime-500 dark:text-black dark:border-lime-500"
                              : "border-transparent bg-zinc-100 text-gray-600 hover:border-lime-500/50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-lime-500/50"
                          }`}
                        >
                          {tab === 'all' ? 'All' : tab === 'adult' ? 'Adults' : 'Kids'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto text-center lg:text-right text-[10px] font-black uppercase tracking-widest text-zinc-400 italic space-y-1">
                  {dateRangeMode === "week" && weekRangeSummary && (
                    <p className="not-italic text-zinc-500">{weekRangeSummary.label}</p>
                  )}
                  <p>{filteredClasses.length} session{filteredClasses.length !== 1 ? "s" : ""} available</p>
                </div>
              </div>

              {filteredClasses.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-20 text-center shadow-xl">
                  <p className="text-xl font-black uppercase italic tracking-tighter text-zinc-400">
                    No classes found for this selection.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedClasses.map((classItem) => {
                    const isSelected = selectedClass?.id === classItem.id;
                    const instructorProfile = (classItem.instructor_id && instructorProfiles[classItem.instructor_id]) || (classItem.instructor_name && instructorProfiles[classItem.instructor_name]) || null;
                    const instructorAvatar = instructorProfile?.avatar_url ?? classItem.instructor_avatar ?? null;
                    const instructorInitials = getInitials(classItem.instructor_name);

                    return (
                      <motion.div
                        key={classItem.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group border-2 p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                          isSelected
                            ? "border-lime-500 bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]"
                            : "border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 hover:border-lime-500/50 hover:shadow-[4px_4px_0px_0px_rgba(163,230,53,0.2)]"
                        }`}
                        onClick={() => handleClassSelect(classItem)}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 bg-lime-500 text-black px-3 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Check className="w-3 h-3" /> SELECTED
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-[2px] bg-lime-500"></span>
                            <span className="text-lime-600 dark:text-lime-400 font-black text-[10px] uppercase tracking-[0.2em]">
                              {formatDate(classItem.scheduled_at)} · {formatTime(classItem.scheduled_at)} ·{" "}
                              {classItem.duration_minutes} MIN
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white group-hover:text-lime-500 transition-colors">
                            {getTrialBookingDisplayTitle(classItem.title)}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                {classItem.location || "Main Studio"}
                              </span>
                            </div>
                            {classItem.instructor_name && (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-black dark:bg-zinc-800 border border-white/10 flex items-center justify-center text-[8px] font-black text-white overflow-hidden">
                                  {instructorAvatar ? (
                                    <img src={instructorAvatar} alt="" className="w-full h-full object-cover" />
                                  ) : instructorInitials}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                  {classItem.instructor_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-black/10 dark:border-white/10 pt-10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Showing {(currentPage - 1) * CLASSES_PER_PAGE + 1} - {Math.min(currentPage * CLASSES_PER_PAGE, filteredClasses.length)} of {filteredClasses.length} classes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); }}
                      disabled={currentPage === 1}
                      className="w-10 h-10 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-lime-500 hover:text-black transition-all disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-lime-500 hover:text-black transition-all disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Step 2: Details & Waiver */}
            <section className="space-y-12">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="text-lime-600 dark:text-lime-400 font-black text-sm uppercase tracking-[0.3em]">
                  Step 02
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-gray-900 dark:text-white">
                  YOUR <span className="text-lime-500">DETAILS</span>
                </h2>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-8 md:p-16 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 -skew-x-12 -z-10"></div>
                
                {!selectedClass ? (
                  <div className="py-12 text-center">
                    <p className="text-lg font-black uppercase italic tracking-tighter text-zinc-400">
                      Please select a class above to continue
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-16">
                    {/* Selected Class Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[#f6f4ee] dark:bg-zinc-900 border-l-8 border-lime-500">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Selected Session</p>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mb-2">
                          {getTrialBookingDisplayTitle(selectedClass.title)}
                        </h4>
                        <p className="text-sm font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
                          {formatDate(selectedClass.scheduled_at)} @ {formatTime(selectedClass.scheduled_at)} ·{" "}
                          {selectedClass.duration_minutes} MIN
                        </p>
                      </div>
                      <div className="flex flex-col justify-center md:items-end">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Price</p>
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          ${(
                            getTrialPriceCents(
                              getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group),
                              selectedClass.trial_price_cents,
                            ) / 100
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label htmlFor="guestName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            {getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid"
                              ? "Kid's Name *"
                              : "Full Name *"}
                          </label>
                          <input
                            type="text"
                            id="guestName"
                            required
                            value={formData.guestName}
                            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                            placeholder={
                              getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid"
                                ? "KID'S NAME"
                                : "YOUR FULL NAME"
                            }
                          />
                        </div>

                        {getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) !== "kid" && (
                          <div className="space-y-2">
                            <label htmlFor="guestPhone" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              id="guestPhone"
                              required
                              value={formData.guestPhone}
                              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                              className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                              placeholder="+65"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label htmlFor="guestAge" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Age *
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            id="guestAge"
                            min={1}
                            max={120}
                            step={1}
                            required
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                            placeholder="YEARS"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Gender *
                          </label>
                          <select
                            id="gender"
                            required
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                          >
                            <option value="prefer_not_to_say">Prefer not to say</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid" && (
                        <div className="space-y-8 pt-10 border-t border-black/10 dark:border-white/10">
                          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Guardian Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Guardian Name *</label>
                              <input
                                type="text"
                                required
                                value={guardianData.guardianName}
                                onChange={(e) => setGuardianData({ ...guardianData, guardianName: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                                placeholder="GUARDIAN NAME"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Guardian Phone *</label>
                              <input
                                type="tel"
                                required
                                value={guardianData.guardianPhone}
                                onChange={(e) => setGuardianData({ ...guardianData, guardianPhone: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                                placeholder="GUARDIAN PHONE"
                              />
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-6 bg-lime-500/10 border border-lime-500/20">
                            <input
                              type="checkbox"
                              id="guardianOnPremises"
                              required
                              checked={guardianData.guardianOnPremises}
                              onChange={(e) => setGuardianData({ ...guardianData, guardianOnPremises: e.target.checked })}
                              className="mt-1 w-6 h-6 accent-lime-500"
                            />
                            <label htmlFor="guardianOnPremises" className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              I confirm a parent/guardian will be on premises for the duration of the class *
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Waiver Section */}
                    <div className="pt-16 border-t border-black/10 dark:border-white/10">
                      <div className="flex flex-col items-center text-center gap-4 mb-12">
                        <div className="text-lime-600 dark:text-lime-400 font-black text-sm uppercase tracking-[0.3em]">
                          Step 03
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-gray-900 dark:text-white">
                          LIABILITY <span className="text-lime-500">WAIVER</span>
                        </h2>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                          Please read and sign the waiver to proceed with your booking
                        </p>
                      </div>

                      <WaiverForm
                        wide
                        participantName={formData.guestName}
                        isMinor={
                          getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid"
                        }
                        onAgreementChange={(agreed, details) => {
                          setFormData({
                            ...formData,
                            waiverAgreed: agreed,
                            nricLast4: details.nricLast4,
                            signature: details.signature,
                          });
                          if (
                            getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid"
                          ) {
                            setGuardianData({
                              ...guardianData,
                              guardianName: details.guardianName || guardianData.guardianName,
                              guardianSignature: details.guardianSignature || "",
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="pt-10 flex flex-col items-center gap-8">
                      <button
                        type="submit"
                        disabled={!selectedClass || processing}
                        className="w-full max-w-md py-8 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black uppercase tracking-[0.4em] transition-all duration-300 shadow-2xl disabled:opacity-30 flex items-center justify-center gap-4 text-lg"
                      >
                        {processing ? (
                          <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                        ) : (
                          <>
                            PROCEED TO PAYMENT
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </button>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">
                        By proceeding, you agree to our <Link href="/terms" className="text-lime-600 dark:text-lime-400 hover:underline">Terms & Conditions</Link>.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {selectedClass && (
          <MobileBookingSheet
            selectedClass={selectedClass}
            formData={formData}
            setFormData={setFormData}
            guardianData={guardianData}
            setGuardianData={setGuardianData}
            onSubmit={handleSubmit}
            processing={processing}
            onClose={() => setSelectedClass(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Mobile Bottom Sheet Component
interface MobileBookingSheetProps {
  selectedClass: Class;
  formData: { guestName: string; guestPhone: string; age: string; gender: string; waiverAgreed: boolean; nricLast4: string; signature: string; };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  guardianData: { guardianName: string; guardianPhone: string; guardianOnPremises: boolean; guardianSignature: string; };
  setGuardianData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  processing: boolean;
  onClose: () => void;
}

function MobileBookingSheet({ selectedClass, formData, setFormData, guardianData, setGuardianData, onSubmit, processing, onClose }: MobileBookingSheetProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const effectiveKid =
    getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group) === "kid";
  const displayTitle = getTrialBookingDisplayTitle(selectedClass.title);
  const price = (
    getTrialPriceCents(
      getTrialBookingEffectiveAgeGroup(selectedClass.title, selectedClass.age_group),
      selectedClass.trial_price_cents,
    ) / 100
  ).toFixed(2);

  return (
    <div className="lg:hidden fixed inset-0 z-[100]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-white/10 p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">BOOKING</h2>
          <button onClick={onClose} className="w-12 h-12 border border-black/10 dark:border-white/10 flex items-center justify-center"><X className="w-6 h-6" /></button>
        </div>

        <div className="mb-10 p-6 bg-[#f6f4ee] dark:bg-zinc-900 border-l-4 border-lime-500">
          <h4 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mb-2">{displayTitle}</h4>
          <p className="text-xs font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
            {formatDate(selectedClass.scheduled_at)} @ {formatTime(selectedClass.scheduled_at)} ·{" "}
            {selectedClass.duration_minutes} MIN · ${price}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 pb-12">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {effectiveKid ? "Kid's Name *" : "Full Name *"}
            </label>
            <input
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
              placeholder="NAME"
            />
          </div>

          {!effectiveKid && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                placeholder="PHONE"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Age *</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              step={1}
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
              placeholder="YEARS"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gender *</label>
            <select
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          {effectiveKid && (
            <div className="space-y-6 pt-6 border-t border-black/10 dark:border-white/10">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Guardian Info</h3>
              <input
                type="text"
                required
                value={guardianData.guardianName}
                onChange={(e) => setGuardianData({ ...guardianData, guardianName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                placeholder="GUARDIAN NAME"
              />
              <input
                type="tel"
                required
                value={guardianData.guardianPhone}
                onChange={(e) => setGuardianData({ ...guardianData, guardianPhone: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                placeholder="GUARDIAN PHONE"
              />
              <div className="flex items-start gap-4 p-6 bg-lime-500/10 border border-lime-500/20">
                <input
                  type="checkbox"
                  required
                  checked={guardianData.guardianOnPremises}
                  onChange={(e) => setGuardianData({ ...guardianData, guardianOnPremises: e.target.checked })}
                  className="mt-1 w-6 h-6 accent-lime-500"
                />
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  I confirm a parent/guardian will be on premises *
                </label>
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-black/10 dark:border-white/10">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Last step: read the disclaimer, then sign and confirm below.
            </p>
            <WaiverForm
              wide
              participantName={formData.guestName}
              isMinor={effectiveKid}
              onAgreementChange={(agreed, details) => {
                setFormData({
                  ...formData,
                  waiverAgreed: agreed,
                  nricLast4: details.nricLast4,
                  signature: details.signature,
                });
                if (effectiveKid) {
                  setGuardianData({
                    ...guardianData,
                    guardianName: details.guardianName || guardianData.guardianName,
                    guardianSignature: details.guardianSignature || "",
                  });
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-6 bg-lime-500 text-black font-black uppercase tracking-[0.3em] shadow-2xl disabled:opacity-30 flex items-center justify-center gap-4"
          >
            {processing ? (
              <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
            ) : (
              <>PAY & BOOK TRIAL <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
