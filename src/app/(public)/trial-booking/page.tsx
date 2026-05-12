"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import TrialBookingHero from "@/components/TrialBooking/TrialBookingHero";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Clock, MapPin, ArrowRight, X, ChevronLeft, ChevronRight, Check, Zap } from "lucide-react";
import Image from "next/image";
import LoadingIcon from "@/components/Common/LoadingIcon";

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
  const [dateFilter, setDateFilter] = useState<string>("");
  const [ageGroupFilter, setAgeGroupFilter] = useState<'all' | 'adult' | 'kid'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [instructorProfiles, setInstructorProfiles] = useState<Record<string, InstructorProfile>>({});
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    dateOfBirth: "",
  });
  const [guardianData, setGuardianData] = useState({
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianOnPremises: false,
  });
  const [processing, setProcessing] = useState(false);

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
        if (dateFilter) params.append('date', dateFilter);
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
  }, [toast, dateFilter, ageGroupFilter]);

  const filteredClasses = classes.filter((cls) => {
    if (ageGroupFilter === 'all') return true;
    const ageGroup = cls.age_group || 'all';
    if (ageGroupFilter === 'adult') return ageGroup === 'adult' || ageGroup === 'all';
    if (ageGroupFilter === 'kid') return ageGroup === 'kid' || ageGroup === 'all';
    return true;
  });

  const totalPages = Math.ceil(filteredClasses.length / CLASSES_PER_PAGE);
  const paginatedClasses = filteredClasses.slice((currentPage - 1) * CLASSES_PER_PAGE, currentPage * CLASSES_PER_PAGE);

  const handleClassSelect = (classItem: Class) => {
    const availableSpots = classItem.capacity - (classItem.booked_count || 0);
    if (availableSpots <= 0) {
      toast.error("This class is fully booked. Please select another class.");
      return;
    }
    setSelectedClass(classItem);
    if (classItem.age_group !== 'kid') {
      setGuardianData({ guardianName: "", guardianEmail: "", guardianPhone: "", guardianOnPremises: false });
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
      toast.error(selectedClass.age_group === 'kid' ? "Please enter kid's name" : "Please enter your name");
      return;
    }
    const isKidsClass = selectedClass.age_group === 'kid';
    if (!isKidsClass) {
      if (!formData.guestEmail.trim() || !formData.guestEmail.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (!formData.guestPhone.trim()) {
        toast.error("Please enter your phone number");
        return;
      }
    }
    if (!formData.dateOfBirth.trim()) {
      toast.error("Please enter date of birth");
      return;
    }
    const dob = new Date(formData.dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      toast.error("Please enter a valid date of birth");
      return;
    }
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 5 || age > 120) {
      toast.error("Please enter a valid date of birth");
      return;
    }
    if (isKidsClass) {
      if (!guardianData.guardianName.trim() || !guardianData.guardianEmail.trim() || !guardianData.guardianEmail.includes("@") || !guardianData.guardianPhone.trim()) {
        toast.error("Please fill in all guardian information");
        return;
      }
      if (!guardianData.guardianOnPremises) {
        toast.error("You must confirm that a parent/guardian will be on premises");
        return;
      }
    }

    setProcessing(true);
    try {
      const requestBody: any = {
        classId: selectedClass.id,
        guestName: formData.guestName.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
      };
      if (isKidsClass) {
        requestBody.guardianName = guardianData.guardianName.trim();
        requestBody.guardianEmail = guardianData.guardianEmail.trim().toLowerCase();
        requestBody.guardianPhone = guardianData.guardianPhone.trim();
        requestBody.guardianOnPremises = guardianData.guardianOnPremises;
        requestBody.guestEmail = guardianData.guardianEmail.trim().toLowerCase();
        requestBody.guestPhone = guardianData.guardianPhone.trim();
      } else {
        requestBody.guestEmail = formData.guestEmail.trim().toLowerCase();
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Class Selection - 8 Columns */}
            <div className="lg:col-span-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                  <div className="text-lime-600 dark:text-lime-400 font-black text-sm uppercase tracking-[0.3em] mb-4">
                    Step 1
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-gray-900 dark:text-white">
                    AVAILABLE <span className="text-lime-500">CLASSES</span>
                  </h2>
                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="text-3xl font-black text-lime-600 dark:text-lime-400">
                      ${ageGroupFilter === 'kid' 
                        ? (getDefaultTrialPrice('kid') / 100).toFixed(2)
                        : (getDefaultTrialPrice('adult') / 100).toFixed(2)}
                    </span>
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-500">
                      PER TRIAL SESSION
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                  <div className="space-y-2">
                    <label htmlFor="dateFilter" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Filter by Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="dateFilter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Age Group Filter Tabs */}
              <div className="flex gap-2 mb-10 border-b border-black/10 dark:border-white/10 pb-6">
                {(['all', 'adult', 'kid'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setAgeGroupFilter(tab); setCurrentPage(1); }}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                      ageGroupFilter === tab
                        ? "bg-black text-white border-black dark:bg-lime-500 dark:text-black dark:border-lime-500"
                        : "bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border-black/10 dark:border-white/10 hover:border-lime-500"
                    }`}
                  >
                    {tab === 'all' ? 'All Classes' : tab === 'adult' ? 'Adults' : 'Kids'}
                  </button>
                ))}
              </div>

              {filteredClasses.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-20 text-center">
                  <p className="text-xl font-black uppercase italic tracking-tighter text-zinc-400">
                    No classes found for this selection.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedClasses.map((classItem) => {
                    const scheduledDate = new Date(classItem.scheduled_at);
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
                        className={`group border-2 p-6 md:p-8 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                          isSelected
                            ? "border-lime-500 bg-white dark:bg-zinc-900 shadow-2xl"
                            : "border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 hover:border-lime-500/50"
                        }`}
                        onClick={() => handleClassSelect(classItem)}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 bg-lime-500 text-black px-3 py-1 md:px-4 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Check className="w-3 h-3" /> SELECTED
                          </div>
                        )}
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                              <span className="w-6 md:w-8 h-[2px] bg-lime-500"></span>
                              <span className="text-lime-600 dark:text-lime-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                                {formatTime(scheduledDate.toISOString())} • {classItem.duration_minutes} MIN
                              </span>
                            </div>
                            
                            <h3 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mb-4 md:mb-6 group-hover:text-lime-500 transition-colors">
                              {classItem.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 md:gap-6">
                              <div className="flex items-center gap-2 md:gap-3">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-zinc-400" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500">
                                  {formatDate(scheduledDate.toISOString())}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 md:gap-3">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-zinc-400" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500">
                                  {classItem.location || "Main Studio"}
                                </span>
                              </div>
                              {classItem.instructor_name && (
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-black dark:bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-white overflow-hidden">
                                    {instructorAvatar ? (
                                      <img src={instructorAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : instructorInitials}
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                                    {classItem.instructor_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="shrink-0">
                            <div className={`w-12 h-12 border-2 flex items-center justify-center transition-all duration-300 ${
                              isSelected ? "bg-lime-500 border-lime-500 text-black" : "border-black/10 dark:border-white/10 text-zinc-300 group-hover:border-lime-500/50"
                            }`}>
                              <ArrowRight className={`w-6 h-6 ${isSelected ? "" : "group-hover:translate-x-1 transition-transform"}`} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-black/10 dark:border-white/10 pt-10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Showing {(currentPage - 1) * CLASSES_PER_PAGE + 1} - {Math.min(currentPage * CLASSES_PER_PAGE, filteredClasses.length)} of {filteredClasses.length} classes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className="w-12 h-12 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-lime-500 hover:text-black transition-all disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-12 h-12 border font-black text-xs transition-all ${
                            currentPage === page 
                              ? "bg-black text-white border-black dark:bg-lime-500 dark:text-black dark:border-lime-500" 
                              : "bg-white dark:bg-zinc-900 border-black/10 dark:border-white/10 hover:border-lime-500"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      className="w-12 h-12 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-lime-500 hover:text-black transition-all disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Form - 4 Columns */}
            <div className="lg:col-span-4">
              <div className="sticky top-32">
                <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 -skew-x-12 -z-10"></div>
                  
                  <div className="text-lime-600 dark:text-lime-400 font-black text-sm uppercase tracking-[0.3em] mb-4">
                    Step 2
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none text-gray-900 dark:text-white mb-10">
                    YOUR <span className="text-lime-500">DETAILS</span>
                  </h2>

                  {selectedClass ? (
                    <div className="mb-10 p-6 bg-[#f6f4ee] dark:bg-zinc-900 border-l-4 border-lime-500">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Selected Session</p>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mb-2">{selectedClass.title}</h4>
                      <p className="text-xs font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
                        {formatDate(selectedClass.scheduled_at)} @ {formatTime(selectedClass.scheduled_at)}
                      </p>
                      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Price</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                          ${(getTrialPriceCents(selectedClass.age_group, selectedClass.trial_price_cents) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-10 p-6 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-black/10 dark:border-white/10 text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                        Please select a class to continue
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="guestName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {selectedClass?.age_group === 'kid' ? "Kid's Name *" : "Full Name *"}
                      </label>
                      <input
                        type="text"
                        id="guestName"
                        required
                        value={formData.guestName}
                        onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                        placeholder={selectedClass?.age_group === 'kid' ? "KID'S NAME" : "YOUR FULL NAME"}
                      />
                    </div>

                    {selectedClass?.age_group !== 'kid' && (
                      <>
                        <div className="space-y-2">
                          <label htmlFor="guestEmail" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="guestEmail"
                            required
                            value={formData.guestEmail}
                            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                            placeholder="EMAIL@EXAMPLE.COM"
                          />
                        </div>
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
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                            placeholder="+65"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="dateOfBirth" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                      />
                    </div>

                    {selectedClass?.age_group === 'kid' && (
                      <div className="space-y-6 pt-6 border-t border-black/10 dark:border-white/10">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Guardian Info</h3>
                        <div className="space-y-4">
                          <input
                            type="text"
                            required
                            value={guardianData.guardianName}
                            onChange={(e) => setGuardianData({ ...guardianData, guardianName: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                            placeholder="GUARDIAN NAME"
                          />
                          <input
                            type="email"
                            required
                            value={guardianData.guardianEmail}
                            onChange={(e) => setGuardianData({ ...guardianData, guardianEmail: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                            placeholder="GUARDIAN EMAIL"
                          />
                          <input
                            type="tel"
                            required
                            value={guardianData.guardianPhone}
                            onChange={(e) => setGuardianData({ ...guardianData, guardianPhone: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                            placeholder="GUARDIAN PHONE"
                          />
                          <div className="flex items-start gap-3 p-4 bg-lime-500/10 border border-lime-500/20">
                            <input
                              type="checkbox"
                              id="guardianOnPremises"
                              required
                              checked={guardianData.guardianOnPremises}
                              onChange={(e) => setGuardianData({ ...guardianData, guardianOnPremises: e.target.checked })}
                              className="mt-1 w-5 h-5 accent-lime-500"
                            />
                            <label htmlFor="guardianOnPremises" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                              I confirm a parent/guardian will be on premises *
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!selectedClass || processing}
                      className="w-full py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl disabled:opacity-30 flex items-center justify-center gap-4"
                    >
                      {processing ? (
                        <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                      ) : (
                        <>
                          PROCEED TO PAYMENT
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">
                    By proceeding, you agree to our <Link href="/terms" className="text-lime-600 dark:text-lime-400 hover:underline">Terms & Conditions</Link>.
                  </p>
                </div>
              </div>
            </div>

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
  formData: { guestName: string; guestEmail: string; guestPhone: string; dateOfBirth: string; };
  setFormData: React.Dispatch<React.SetStateAction<{ guestName: string; guestEmail: string; guestPhone: string; dateOfBirth: string; }>>;
  guardianData: { guardianName: string; guardianEmail: string; guardianPhone: string; guardianOnPremises: boolean; };
  setGuardianData: React.Dispatch<React.SetStateAction<{ guardianName: string; guardianEmail: string; guardianPhone: string; guardianOnPremises: boolean; }>>;
  onSubmit: (e: React.FormEvent) => void;
  processing: boolean;
  onClose: () => void;
}

function MobileBookingSheet({ selectedClass, formData, setFormData, guardianData, setGuardianData, onSubmit, processing, onClose }: MobileBookingSheetProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const price = (getTrialPriceCents(selectedClass.age_group, selectedClass.trial_price_cents) / 100).toFixed(2);

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
          <h4 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mb-2">{selectedClass.title}</h4>
          <p className="text-xs font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
            {formatDate(selectedClass.scheduled_at)} @ {formatTime(selectedClass.scheduled_at)} — ${price}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 pb-12">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {selectedClass.age_group === 'kid' ? "Kid's Name *" : "Full Name *"}
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

          {selectedClass.age_group !== 'kid' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                  placeholder="EMAIL"
                />
              </div>
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
            </>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Date of Birth *</label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
            />
          </div>

          {selectedClass.age_group === 'kid' && (
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
                type="email"
                required
                value={guardianData.guardianEmail}
                onChange={(e) => setGuardianData({ ...guardianData, guardianEmail: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                placeholder="GUARDIAN EMAIL"
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
