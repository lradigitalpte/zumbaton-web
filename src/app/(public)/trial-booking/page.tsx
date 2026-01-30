"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import TrialBookingHero from "@/components/TrialBooking/TrialBookingHero";

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

// Helper function to get default trial price based on age group
function getDefaultTrialPrice(ageGroup: 'adult' | 'kid' | 'all' | null | undefined): number {
  if (ageGroup === 'kid') {
    return 1700; // $17 for kids
  }
  return 2300; // $23 for adults and 'all'
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

  // Helper function to get initials from name
  const getInitials = (name: string | null): string => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch instructor profiles
  useEffect(() => {
    const fetchInstructorProfiles = async () => {
      try {
        // Get unique instructor IDs and names from classes
        const instructorIds = new Set<string>();
        const instructorNames = new Set<string>();
        
        classes.forEach((cls) => {
          if (cls.instructor_id) instructorIds.add(cls.instructor_id);
          if (cls.instructor_name) {
            const names = cls.instructor_name.split(',').map(n => n.trim());
            names.forEach(name => instructorNames.add(name));
          }
        });

        if (instructorIds.size > 0 || instructorNames.size > 0) {
          const params = new URLSearchParams();
          if (instructorIds.size > 0) {
            params.append('ids', Array.from(instructorIds).join(','));
          }
          if (instructorNames.size > 0) {
            params.append('names', Array.from(instructorNames).join(','));
          }

          const response = await fetch(`/api/instructors/profiles?${params.toString()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
          const result = await response.json();

          if (result.success && result.data) {
            const profiles: Record<string, InstructorProfile> = {};
            const requestedNames = Array.from(instructorNames);
            result.data.forEach((profile: any) => {
              const profileData = {
                id: profile.id,
                name: profile.name,
                avatar_url: profile.avatar_url ?? null,
              };
              profiles[profile.id] = profileData;
              profiles[profile.name] = profileData;
              // Store under each requested name that matches (so "Robert" finds profile "Robert Smith")
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

    if (classes.length > 0) {
      fetchInstructorProfiles();
    }
  }, [classes]);

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const params = new URLSearchParams();
        if (dateFilter) {
          params.append('date', dateFilter);
        }
        
        const response = await fetch(`/api/classes/public?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          // Map classes with booked counts (already filtered by API)
          const availableClasses = result.data.map((cls: any) => ({
            ...cls,
            booked_count: cls.booked_count || 0,
          }));

          // Sort by date and time
          availableClasses.sort(
            (a: Class, b: Class) =>
              new Date(a.scheduled_at).getTime() -
              new Date(b.scheduled_at).getTime()
          );

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
    // Reset to page 1 when date filter or age group filter changes
    setCurrentPage(1);
  }, [toast, dateFilter, ageGroupFilter]);

  // Filter classes by age group
  const filteredClasses = classes.filter((cls) => {
    if (ageGroupFilter === 'all') return true;
    const ageGroup = cls.age_group || 'all';
    if (ageGroupFilter === 'adult') {
      return ageGroup === 'adult' || ageGroup === 'all';
    }
    if (ageGroupFilter === 'kid') {
      return ageGroup === 'kid' || ageGroup === 'all';
    }
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredClasses.length / CLASSES_PER_PAGE);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * CLASSES_PER_PAGE,
    currentPage * CLASSES_PER_PAGE
  );

  const handleClassSelect = (classItem: Class) => {
    // Check availability
    const availableSpots = classItem.capacity - (classItem.booked_count || 0);
    if (availableSpots <= 0) {
      toast.error("This class is fully booked. Please select another class.");
      return;
    }

    setSelectedClass(classItem);
    
    // Reset guardian data when switching classes
    const isKidsClass = classItem.age_group === 'kid';
    if (!isKidsClass) {
      setGuardianData({
        guardianName: "",
        guardianEmail: "",
        guardianPhone: "",
        guardianOnPremises: false,
      });
    }
    
    // On mobile, scroll to top to show the form panel
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    // Validate form
    if (!formData.guestName.trim()) {
      toast.error(selectedClass.age_group === 'kid' ? "Please enter kid's name" : "Please enter your name");
      return;
    }

    // Email and phone validation - only required for adult classes
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

    // Validate date of birth
    const dob = new Date(formData.dateOfBirth);
    if (isNaN(dob.getTime())) {
      toast.error("Please enter a valid date of birth");
      return;
    }

    // Check if date is in the future
    if (dob > new Date()) {
      toast.error("Date of birth cannot be in the future");
      return;
    }

    // Check age (must be reasonable - at least 5 years old)
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 5 || age > 120) {
      toast.error("Please enter a valid date of birth");
      return;
    }

    // For kids classes, validate guardian data
    if (isKidsClass) {
      if (!guardianData.guardianName.trim()) {
        toast.error("Please enter guardian/parent name");
        setProcessing(false);
        return;
      }
      if (!guardianData.guardianEmail.trim() || !guardianData.guardianEmail.includes("@")) {
        toast.error("Please enter a valid guardian/parent email address");
        setProcessing(false);
        return;
      }
      if (!guardianData.guardianPhone.trim()) {
        toast.error("Please enter guardian/parent phone number");
        setProcessing(false);
        return;
      }
      if (!guardianData.guardianOnPremises) {
        toast.error("You must confirm that a parent/guardian will be on premises");
        setProcessing(false);
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

      // For kids classes: use guardian email/phone, for adults: use guest email/phone
      if (isKidsClass) {
        // Kids classes: use guardian contact info
        requestBody.guardianName = guardianData.guardianName.trim();
        requestBody.guardianEmail = guardianData.guardianEmail.trim().toLowerCase();
        requestBody.guardianPhone = guardianData.guardianPhone.trim();
        requestBody.guardianOnPremises = guardianData.guardianOnPremises;
        // Use guardian email/phone as guest email/phone for booking record
        requestBody.guestEmail = guardianData.guardianEmail.trim().toLowerCase();
        requestBody.guestPhone = guardianData.guardianPhone.trim();
      } else {
        // Adult classes: use guest contact info
        requestBody.guestEmail = formData.guestEmail.trim().toLowerCase();
        requestBody.guestPhone = formData.guestPhone.trim();
      }

      const response = await fetch("/api/trial-booking/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create payment");
      }

      // Redirect to HitPay
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process booking. Please try again."
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading available classes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TrialBookingHero />
      <div className="min-h-screen bg-white dark:bg-gray-dark py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Class Selection */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Available Classes
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base text-gray-600 dark:text-gray-400">
                    Trial class:
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${ageGroupFilter === 'kid' 
                      ? (getDefaultTrialPrice('kid') / 100).toFixed(2)
                      : (getDefaultTrialPrice('adult') / 100).toFixed(2)}
                  </span>
                  {ageGroupFilter === 'all' && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      (Kids: ${(getDefaultTrialPrice('kid') / 100).toFixed(2)}, Adults: ${(getDefaultTrialPrice('adult') / 100).toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="dateFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Date:
                </label>
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
                {dateFilter && (
                  <button
                    onClick={() => {
                      setDateFilter("");
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Age Group Filter Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setAgeGroupFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    ageGroupFilter === 'all'
                      ? 'border-green-600 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  All Classes
                </button>
                <button
                  onClick={() => {
                    setAgeGroupFilter('adult');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    ageGroupFilter === 'adult'
                      ? 'border-green-600 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  Adults
                </button>
                <button
                  onClick={() => {
                    setAgeGroupFilter('kid');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    ageGroupFilter === 'kid'
                      ? 'border-green-600 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  Kids
                </button>
              </div>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {classes.length === 0
                    ? "No classes available at the moment. Please check back later."
                    : `No ${ageGroupFilter === 'adult' ? 'adult' : ageGroupFilter === 'kid' ? 'kids' : ''} classes available${dateFilter ? ' for the selected date' : ''}. Please try a different filter.`}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedClasses.map((classItem) => {
                  const scheduledDate = new Date(classItem.scheduled_at);
                  const availableSpots =
                    classItem.capacity - (classItem.booked_count || 0);
                  const isSelected = selectedClass?.id === classItem.id;

                  // Get instructor avatar (try ID first, then name; name lookup works for "Robert" -> "Robert Smith")
                  const instructorProfile =
                    (classItem.instructor_id && instructorProfiles[classItem.instructor_id]) ||
                    (classItem.instructor_name && instructorProfiles[classItem.instructor_name]) ||
                    null;
                  const instructorAvatar = instructorProfile?.avatar_url ?? classItem.instructor_avatar ?? null;
                  const instructorInitials = getInitials(classItem.instructor_name);

                  return (
                    <div
                      key={classItem.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        isSelected
                          ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-400"
                      }`}
                      onClick={() => handleClassSelect(classItem)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {classItem.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>{formatDate(scheduledDate.toISOString())}</span>
                            <span>{formatTime(scheduledDate.toISOString())}</span>
                            <span>{classItem.duration_minutes} minutes</span>
                            {classItem.instructor_name && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">Instructor</span>
                                <div className="relative h-8 w-8 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-br from-green-600 to-green-700 shrink-0 overflow-hidden">
                                  {instructorAvatar ? (
                                    <img
                                      src={instructorAvatar}
                                      alt={classItem.instructor_name}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('span')) {
                                          const span = document.createElement('span');
                                          span.textContent = instructorInitials;
                                          parent.appendChild(span);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <span>{instructorInitials}</span>
                                  )}
                                </div>
                                <span>{classItem.instructor_name}</span>
                              </div>
                            )}
                            {classItem.location && (
                              <span>{classItem.location}</span>
                            )}
                          </div>
                          {classItem.description && (
                            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                              {classItem.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm shrink-0">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {(currentPage - 1) * CLASSES_PER_PAGE + 1} to {Math.min(currentPage * CLASSES_PER_PAGE, filteredClasses.length)} of {filteredClasses.length} classes
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.max(1, prev - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => {
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                  currentPage === page
                                    ? "bg-green-600 text-white"
                                    : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return <span key={page} className="px-2 text-gray-500">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.min(totalPages, prev + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Booking Form - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Your Details
              </h2>

              {selectedClass ? (
                <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selected Class:
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedClass.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(selectedClass.scheduled_at)} at{" "}
                    {formatTime(selectedClass.scheduled_at)}
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                    $
                    {(((selectedClass.trial_price_cents && selectedClass.trial_price_cents > 0)
                      ? selectedClass.trial_price_cents
                      : getDefaultTrialPrice(selectedClass.age_group)) / 100).toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Please select a class from the list to continue.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="guestName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {selectedClass?.age_group === 'kid' ? "Kid's Name *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    id="guestName"
                    required
                    value={formData.guestName}
                    onChange={(e) =>
                      setFormData({ ...formData, guestName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder={selectedClass?.age_group === 'kid' ? "Kid's name" : "John Doe"}
                  />
                </div>

                {/* Guardian Information Display (for kids classes) */}
                {selectedClass?.age_group === 'kid' && guardianData.guardianName && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Guardian/Parent Information:</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Name:</span> {guardianData.guardianName}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Email:</span> {guardianData.guardianEmail}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Phone:</span> {guardianData.guardianPhone}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <span className="font-medium">On Premises:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${guardianData.guardianOnPremises ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {guardianData.guardianOnPremises ? 'Confirmed' : 'Not Confirmed'}
                      </span>
                    </p>
                  </div>
                )}

                {/* Email and Phone - Only show for adult classes */}
                {selectedClass?.age_group !== 'kid' && (
                  <>
                    <div>
                      <label
                        htmlFor="guestEmail"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="guestEmail"
                        required
                        value={formData.guestEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, guestEmail: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="guestPhone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="guestPhone"
                        required
                        value={formData.guestPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, guestPhone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="+65 1234 5678"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Required to ensure age-appropriate class selection
                  </p>
                </div>

                {/* Guardian Fields - Only show for kids classes */}
                {selectedClass?.age_group === 'kid' && (
                  <>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Guardian/Parent Information
                      </h3>
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          For kids classes, we require guardian/parent information and confirmation that a parent or guardian will be on premises during the class.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="guardianName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Guardian/Parent Name *
                      </label>
                      <input
                        type="text"
                        id="guardianName"
                        required={selectedClass?.age_group === 'kid'}
                        value={guardianData.guardianName}
                        onChange={(e) =>
                          setGuardianData({ ...guardianData, guardianName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Parent/Guardian name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="guardianEmail"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Guardian/Parent Email *
                      </label>
                      <input
                        type="email"
                        id="guardianEmail"
                        required={selectedClass?.age_group === 'kid'}
                        value={guardianData.guardianEmail}
                        onChange={(e) =>
                          setGuardianData({ ...guardianData, guardianEmail: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="parent@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="guardianPhone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Guardian/Parent Phone *
                      </label>
                      <input
                        type="tel"
                        id="guardianPhone"
                        required={selectedClass?.age_group === 'kid'}
                        value={guardianData.guardianPhone}
                        onChange={(e) =>
                          setGuardianData({ ...guardianData, guardianPhone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="+65 1234 5678"
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <input
                        type="checkbox"
                        id="guardianOnPremises"
                        required={selectedClass?.age_group === 'kid'}
                        checked={guardianData.guardianOnPremises}
                        onChange={(e) =>
                          setGuardianData({ ...guardianData, guardianOnPremises: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="guardianOnPremises" className="text-sm text-gray-700 dark:text-gray-300">
                        I confirm that a parent or guardian will be on premises during the class *
                      </label>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={!selectedClass || processing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {processing ? "Processing..." : "Proceed to Payment"}
                </button>
              </form>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                By proceeding, you agree to our terms and conditions.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet - Booking Form */}
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

    </>
  );
}

// Mobile Bottom Sheet Component
interface MobileBookingSheetProps {
  selectedClass: Class;
  formData: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    dateOfBirth: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    dateOfBirth: string;
  }>>;
  guardianData: {
    guardianName: string;
    guardianEmail: string;
    guardianPhone: string;
    guardianOnPremises: boolean;
  };
  setGuardianData: React.Dispatch<React.SetStateAction<{
    guardianName: string;
    guardianEmail: string;
    guardianPhone: string;
    guardianOnPremises: boolean;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  processing: boolean;
  onClose: () => void;
}

function MobileBookingSheet({
  selectedClass,
  formData,
  setFormData,
  guardianData,
  setGuardianData,
  onSubmit,
  processing,
  onClose,
}: MobileBookingSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle drag to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentYPos = e.touches[0].clientY;
    const diff = currentYPos - startY;
    
    if (diff > 0) {
      setCurrentY(diff);
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${diff}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transform = "translateY(0)";
      }
    }
    setIsDragging(false);
    setCurrentY(0);
  };

  // Get default price based on age group: $17 for kids, $23 for adults
  const defaultCents = getDefaultTrialPrice(selectedClass.age_group);
  const priceCents = selectedClass.trial_price_cents && selectedClass.trial_price_cents > 0
    ? selectedClass.trial_price_cents
    : defaultCents;
  const price = (priceCents / 100).toFixed(2);

  return (
    <div className="lg:hidden fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col transition-transform duration-300"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Book Your Trial Class
              </h2>
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Selected Class:
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedClass.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatDate(selectedClass.scheduled_at)} at{" "}
                  {formatTime(selectedClass.scheduled_at)}
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                  ${price}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="mobile-guestName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {selectedClass.age_group === 'kid' ? "Kid's Name *" : "Full Name *"}
              </label>
              <input
                type="text"
                id="mobile-guestName"
                required
                value={formData.guestName}
                onChange={(e) =>
                  setFormData({ ...formData, guestName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={selectedClass.age_group === 'kid' ? "Kid's name" : "John Doe"}
              />
            </div>

            {/* Email and Phone - Only show for adult classes */}
            {selectedClass.age_group !== 'kid' && (
              <>
                <div>
                  <label
                    htmlFor="mobile-guestEmail"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="mobile-guestEmail"
                    required
                    value={formData.guestEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, guestEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile-guestPhone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile-guestPhone"
                    required
                    value={formData.guestPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, guestPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="+65 1234 5678"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="mobile-dateOfBirth"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Date of Birth *
              </label>
              <input
                type="date"
                id="mobile-dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Required to ensure age-appropriate class selection
              </p>
            </div>

            {/* Guardian Fields - Only show for kids classes */}
            {selectedClass.age_group === 'kid' && (
              <>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Guardian/Parent Information
                  </h3>
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      For kids classes, we require guardian/parent information and confirmation that a parent or guardian will be on premises during the class.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mobile-guardianName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Guardian/Parent Name *
                  </label>
                  <input
                    type="text"
                    id="mobile-guardianName"
                    required
                    value={guardianData.guardianName}
                    onChange={(e) =>
                      setGuardianData({ ...guardianData, guardianName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Parent/Guardian name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile-guardianEmail"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Guardian/Parent Email *
                  </label>
                  <input
                    type="email"
                    id="mobile-guardianEmail"
                    required
                    value={guardianData.guardianEmail}
                    onChange={(e) =>
                      setGuardianData({ ...guardianData, guardianEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="parent@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile-guardianPhone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Guardian/Parent Phone *
                  </label>
                  <input
                    type="tel"
                    id="mobile-guardianPhone"
                    required
                    value={guardianData.guardianPhone}
                    onChange={(e) =>
                      setGuardianData({ ...guardianData, guardianPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="+65 1234 5678"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="mobile-guardianOnPremises"
                    required
                    checked={guardianData.guardianOnPremises}
                    onChange={(e) =>
                      setGuardianData({ ...guardianData, guardianOnPremises: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mobile-guardianOnPremises" className="text-sm text-gray-700 dark:text-gray-300">
                    I confirm that a parent or guardian will be on premises during the class *
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors mt-6"
            >
              {processing ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            By proceeding, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
