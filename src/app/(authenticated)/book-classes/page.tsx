"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { useUpcomingClasses, useBookClass, useBookBatchClasses, type ClassWithAvailability } from "@/hooks/useClasses";
import { getTokenBalance } from "@/lib/dashboard-queries";
import ClassDetailsSlidePanel from "@/components/ClassDetails/ClassDetailsSlidePanel";
import BookingConfirmationModal from "@/components/BookingConfirmation/BookingConfirmationModal";
import { formatDate, formatTime } from "@/lib/utils";
import { handleMutationError } from "@/lib/toast-helper";

const ClassesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState({
    type: "all",
    difficulty: "all",
    date: "",
    recurrenceType: "all" as "single" | "recurring" | "course" | "all",
    categoryId: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Selected class for slide panel
  const [selectedClass, setSelectedClass] = useState<ClassWithAvailability | null>(null);
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  
  // Recurring/Course sessions panel
  const [sessionsPanel, setSessionsPanel] = useState<{
    isOpen: boolean;
    parentClass: ClassWithAvailability | null;
    sessions: ClassWithAvailability[];
  }>({
    isOpen: false,
    parentClass: null,
    sessions: [],
  });
  
  // Selected sessions for multi-booking (recurring classes)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  
  // Booking confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [classToBook, setClassToBook] = useState<ClassWithAvailability | null>(null);
  const [userTokenBalance, setUserTokenBalance] = useState(0);

  // Booking window (Singapore time)
  const getSingaporeNow = () => {
    const now = new Date()
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
    return new Date(utcMs + 8 * 60 * 60 * 1000)
  }

  const isBookingWindowOpen = () => {
    const nowSG = getSingaporeNow()
    const hour = nowSG.getHours()
    // Allow booking from 08:00 (inclusive) to 22:00 (exclusive) - 8am to 10pm
    return hour >= 8 && hour < 22
  }
  const bookingWindowOpen = isBookingWindowOpen()

  // Fetch token balance on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      getTokenBalance(user.id).then(balance => {
        setUserTokenBalance(balance.available);
      });
    }
  }, [user?.id]);

  // React Query hooks
  const { data: allClasses = [], isLoading } = useUpcomingClasses({
    type: filter.type !== "all" ? filter.type : undefined,
    difficulty: filter.difficulty !== "all" ? filter.difficulty : undefined,
    date: filter.date || undefined,
    recurrenceType: filter.recurrenceType !== "all" ? filter.recurrenceType : undefined,
    categoryId: filter.categoryId || undefined,
  });

  // Apply search filter
  const classes = allClasses.filter((classItem) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      classItem.name?.toLowerCase().includes(query) ||
      classItem.instructor_name?.toLowerCase().includes(query) ||
      classItem.description?.toLowerCase().includes(query) ||
      classItem.class_type?.toLowerCase().includes(query) ||
      classItem.location?.toLowerCase().includes(query) ||
      classItem.room_name?.toLowerCase().includes(query)
    );
  });

  const bookClassMutation = useBookClass();
  const bookBatchMutation = useBookBatchClasses();

  // Handle class card click - open slide panel or sessions panel
  const handleClassClick = (classItem: ClassWithAvailability) => {
    // If it's a recurring/course parent with child instances, show sessions panel
    if (classItem._isParent && classItem._childInstances && classItem._childInstances.length > 0) {
      setSessionsPanel({
        isOpen: true,
        parentClass: classItem,
        sessions: classItem._childInstances,
      });
    } else {
      // Otherwise show regular details panel
    setSelectedClass(classItem);
    setIsSlidePanelOpen(true);
    }
  };
  
  // Handle viewing sessions for recurring/course
  const handleViewSessions = (classItem: ClassWithAvailability, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (classItem._isParent && classItem._childInstances && classItem._childInstances.length > 0) {
      setSessionsPanel({
        isOpen: true,
        parentClass: classItem,
        sessions: classItem._childInstances,
      });
      // Reset selected sessions when opening panel
      setSelectedSessions(new Set());
    }
  };
  
  // Handle selecting/deselecting sessions for multi-booking
  const handleToggleSession = (sessionId: string) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };
  
  // Handle booking multiple selected sessions
  const handleBookSelectedSessions = () => {
    if (!user?.id || selectedSessions.size === 0) {
      return;
    }
    
    const sessionsToBook = sessionsPanel.sessions.filter(s => selectedSessions.has(s.id));
    if (sessionsToBook.length === 0) {
      return;
    }
    
    // Book all selected sessions atomically using batch endpoint
    const totalTokensNeeded = sessionsToBook.reduce((sum, s) => sum + (s.tokens_required || 0), 0);
    
    // First, validate tokens
    if (userTokenBalance < totalTokensNeeded) {
      handleMutationError(
        new Error(`You need ${totalTokensNeeded - userTokenBalance} more token${totalTokensNeeded - userTokenBalance !== 1 ? 's' : ''}`),
        toast,
        'Insufficient Tokens'
      );
      return;
    }

    // Use batch booking endpoint (all-or-nothing)
    bookBatchMutation.mutate(
      {
        userId: user.id,
        classIds: sessionsToBook.map(s => s.id),
      },
      {
        onSuccess: async (data) => {
          // Token balance refresh handled by hook
          const newBalance = await getTokenBalance(user.id);
          setUserTokenBalance(newBalance.available);
          
          // Close panel and reset selections
          setSessionsPanel({ isOpen: false, parentClass: null, sessions: [] });
          setSelectedSessions(new Set());
        },
      }
    );
  };

  // Handle book button click in slide panel - open confirmation modal
  const handleBookClick = () => {
    if (selectedClass) {
      setClassToBook(selectedClass);
      setIsConfirmationModalOpen(true);
      setIsSlidePanelOpen(false);
    }
  };

  // Handle confirmation - actually book the class
  const handleConfirmBooking = () => {
    if (!user?.id || !classToBook) {
      return;
    }

    bookClassMutation.mutate(
      { userId: user.id, classId: classToBook.id, className: classToBook.name || classToBook.title },
      {
        onSuccess: async () => {
          // Toast is handled by the hook, just refresh balance and close modal
          const newBalance = await getTokenBalance(user.id);
          setUserTokenBalance(newBalance.available);
          
          setIsConfirmationModalOpen(false);
          setClassToBook(null);
          setSelectedClass(null);
        },
      }
    );
  };

  const getSpotsLeft = (capacity: number, booked: number) => {
    const spots = capacity - booked;
    if (spots <= 0) return { text: "Full", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", left: 0 };
    if (spots <= 3) return { text: `${spots} left`, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", left: spots };
    return { text: `${spots} spots`, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", left: spots };
  };

  const activeFiltersCount = [
    filter.type !== "all", 
    filter.difficulty !== "all", 
    filter.date !== "", 
    filter.recurrenceType !== "all",
    filter.categoryId !== "",
    searchQuery.trim() !== ""
  ].filter(Boolean).length;

  return (
    <div className="pb-6">
      {/* Mobile-First Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white">
            Browse Classes
          </h1>
          {/* Filter Toggle Button - Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden relative p-2.5 rounded-xl bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle filters"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        <p className="text-sm sm:text-base text-body-color dark:text-gray-400">
          Find the perfect class for you
        </p>
      </div>

      {/* Booking Window Status Banner */}
      <div className="mb-4 sm:mb-6">
        <div className={`rounded-xl p-3 sm:p-4 border ${
          bookingWindowOpen 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-2 h-2 rounded-full ${
              bookingWindowOpen ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className={`text-sm sm:text-base font-medium ${
              bookingWindowOpen 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {bookingWindowOpen 
                ? 'Booking is open (08:00–22:00 SGT)' 
                : 'Booking is closed (08:00–22:00 SGT)'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters - Mobile Bottom Sheet / Desktop Inline */}
      <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
        <div className="bg-white dark:bg-dark rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Mobile Filter Header */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-bold text-dark dark:text-white">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Class Type - Mobile App Style */}
            <div>
              <label className="text-dark mb-2 block text-sm font-semibold dark:text-white">
                Class Type
              </label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-dark dark:text-white outline-none focus:border-primary transition-colors text-sm font-medium"
              >
                <option value="all">All Types</option>
                <option value="zumba">Zumba</option>
                <option value="dance">Dance</option>
              </select>
            </div>

            {/* Recurrence Type */}
            <div>
              <label className="text-dark mb-2 block text-sm font-semibold dark:text-white">
                Schedule Type
              </label>
              <select
                value={filter.recurrenceType}
                onChange={(e) => setFilter({ ...filter, recurrenceType: e.target.value as any })}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-dark dark:text-white outline-none focus:border-primary transition-colors text-sm font-medium"
              >
                <option value="all">All Schedules</option>
                <option value="single">Single Class</option>
                <option value="recurring">Recurring Series</option>
                <option value="course">Course</option>
              </select>
            </div>



            {/* Date */}
            <div>
              <label className="text-dark mb-2 block text-sm font-semibold dark:text-white">
                Date
              </label>
              <input
                type="date"
                value={filter.date}
                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-dark dark:text-white outline-none focus:border-primary transition-colors text-sm font-medium"
              />
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter({ type: "all", difficulty: "all", date: "", recurrenceType: "all", categoryId: "" });
                  setSearchQuery("");
                  setShowFilters(false);
                }}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 text-body-color dark:text-gray-300 px-4 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95 text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Pills - Mobile */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
          {filter.type !== "all" && (
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5">
              {filter.type}
              <button
                onClick={() => setFilter({ ...filter, type: "all" })}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filter.difficulty !== "all" && (
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5">
              {filter.difficulty}
              <button
onClick={() => setFilter({ ...filter, difficulty: "all" })}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filter.recurrenceType !== "all" && (
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5">
              {filter.recurrenceType === 'single' ? 'Single' : filter.recurrenceType === 'recurring' ? 'Series' : 'Course'}
              <button
                onClick={() => setFilter({ ...filter, recurrenceType: "all" })}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filter.date && (
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5">
              {new Date(filter.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              <button
                onClick={() => setFilter({ ...filter, date: "" })}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5">
              Search: {searchQuery.substring(0, 20)}{searchQuery.length > 20 ? "..." : ""}
              <button
                onClick={() => setSearchQuery("")}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Classes List - Mobile App Style */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white dark:bg-dark rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-body-color dark:text-gray-400 text-base sm:text-lg mb-4 font-medium">No classes found</p>
          <p className="text-sm text-body-color dark:text-gray-400 mb-6">Try adjusting your filters</p>
          <button
            onClick={() => {
              setFilter({ type: "all", difficulty: "all", date: "", recurrenceType: "all", categoryId: "" });
              setSearchQuery("");
              setShowFilters(false);
            }}
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors active:scale-95 shadow-md"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2 xl:space-y-4">
          {classes.map((classItem) => {
            const spotsInfo = getSpotsLeft(classItem.capacity, classItem.booked_count);
            const isFull = classItem.capacity - classItem.booked_count <= 0;
            const classDate = new Date(classItem.scheduled_at);
            const isToday = classDate.toDateString() === new Date().toDateString();
            const isTomorrow = classDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

            // Check if it's a recurring or course type (can be parent or individual session)
            const isRecurringOrCourse = classItem.recurrence_type === 'recurring' || classItem.recurrence_type === 'course'
            const isCourse = classItem.recurrence_type === 'course'
            const isRecurring = classItem.recurrence_type === 'recurring'
            // For recurring, check if it's a parent card (courses) or individual session
            const isRecurringParent = isRecurring && classItem._isParent

            return (
              <div
                key={classItem.id}
                onClick={() => handleClassClick(classItem)}
                className={`bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md overflow-hidden active:scale-[0.98] transition-transform cursor-pointer hover:shadow-lg xl:hover:shadow-lg ${
                  isRecurringOrCourse
                    ? isCourse
                      ? 'border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/30 dark:to-dark'
                      : 'border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/30 dark:to-dark'
                    : 'border border-gray-100 dark:border-gray-800'
                }`}
              >
                {/* Mobile App Style Card Layout */}
                <div className="flex relative">
                  {/* Decorative accent for recurring/course */}
                  {isRecurringOrCourse && (
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      isCourse ? 'bg-gradient-to-b from-purple-500 to-purple-400' : 'bg-gradient-to-b from-blue-500 to-blue-400'
                    }`} />
                  )}
                  
                  {/* Left: Time & Date Badge - More compact and mobile-friendly */}
                  <div className={`w-20 xl:w-24 flex flex-col items-center justify-center p-3 xl:p-4 shrink-0 ${
                    isRecurringOrCourse
                      ? isCourse
                        ? 'bg-gradient-to-br from-purple-500/20 to-purple-400/10 dark:from-purple-500/30 dark:to-purple-400/20'
                        : 'bg-gradient-to-br from-blue-500/20 to-blue-400/10 dark:from-blue-500/30 dark:to-blue-400/20'
                      : 'bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10'
                  }`}>
                    <div className="text-center">
                      {/* Icon for recurring/course */}
                      {isRecurringOrCourse && (
                        <div className={`mb-1 xl:mb-1.5 ${
                          isCourse ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {isCourse ? (
                            <svg className="w-4 h-4 xl:w-5 xl:h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 xl:w-5 xl:h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </div>
                      )}
                      <p className={`text-xl xl:text-2xl font-bold mb-0.5 ${
                        isRecurringOrCourse
                          ? isCourse
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-blue-600 dark:text-blue-400'
                          : 'text-primary'
                      }`}>
                        {formatTime(classItem.scheduled_at).split(":")[0]}
                      </p>
                      <p className={`text-[10px] xl:text-xs font-medium ${
                        isRecurringOrCourse
                          ? isCourse
                            ? 'text-purple-500/70 dark:text-purple-400/70'
                            : 'text-blue-500/70 dark:text-blue-400/70'
                          : 'text-primary/70'
                      }`}>
                        {formatTime(classItem.scheduled_at).split(":")[1]}
                      </p>
                      <div className={`mt-1.5 xl:mt-2 pt-1.5 xl:pt-2 border-t ${
                        isRecurringOrCourse
                          ? isCourse
                            ? 'border-purple-300/30 dark:border-purple-600/30'
                            : 'border-blue-300/30 dark:border-blue-600/30'
                          : 'border-primary/20'
                      }`}>
                        <p className={`text-[10px] xl:text-xs font-semibold uppercase ${
                          isRecurringOrCourse
                            ? isCourse
                              ? 'text-purple-600/80 dark:text-purple-400/80'
                              : 'text-blue-600/80 dark:text-blue-400/80'
                            : 'text-primary/80'
                        }`}>
                          {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(classItem.scheduled_at).split(",")[0]}
                        </p>
                        <p className={`text-[9px] xl:text-xs mt-0.5 ${
                          isRecurringOrCourse
                            ? isCourse
                              ? 'text-purple-500/60 dark:text-purple-400/60'
                              : 'text-blue-500/60 dark:text-blue-400/60'
                            : 'text-primary/60'
                        }`}>
                          {formatDate(classItem.scheduled_at).split(",")[1]?.trim()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Class Details - Compact on mobile */}
                  <div className="flex-1 p-3 xl:p-4">
                    <div className="flex items-start justify-between mb-1.5 xl:mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 xl:gap-2 mb-1 xl:mb-1.5">
                          <h3 className="text-sm xl:text-lg font-bold text-dark dark:text-white line-clamp-1">
                          {classItem.name}
                        </h3>
                          {/* Show series badge for recurring/course */}
                          {(classItem.recurrence_type === 'recurring' || classItem.recurrence_type === 'course') && (
                            <span className="px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              {classItem.recurrence_type === 'course' ? 'Course' : 'Series'}
                            </span>
                          )}
                          {/* Show age group badge */}
                          {classItem.age_group && classItem.age_group !== 'all' && (
                            <span className={`px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-semibold ${
                              classItem.age_group === 'adult'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                                : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                            }`}>
                              {classItem.age_group === 'adult' ? 'Adults' : 'Kids'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 xl:gap-2 flex-wrap">
                          <span className={`px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-semibold ${spotsInfo.bg} ${spotsInfo.color}`}>
                            {spotsInfo.text}
                          </span>
                          {/* Show session count for recurring/course */}
                          {classItem._isParent && classItem._totalSessions && (
                            <span className={`px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-semibold ${
                              isCourse
                                ? 'bg-purple-200 text-purple-800 dark:bg-purple-800/40 dark:text-purple-300'
                                : 'bg-blue-200 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300'
                            }`}>
                              {classItem._totalSessions} sessions
                            </span>
                          )}
                        </div>
                        <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 mb-1 xl:mb-2 truncate" title={classItem.instructor_name}>
                          {classItem.instructor_name}
                        </p>
                      </div>
                    </div>

                    {/* Class Info Icons - Compact on mobile */}
                    <div className="space-y-1 xl:space-y-2 mb-3 xl:mb-4">
                      {/* Instructors with Avatars */}
                      <div className="flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm text-body-color dark:text-gray-400">
                        <div className="flex items-center gap-1.5 -space-x-2">
                          {(classItem.instructors && classItem.instructors.length > 0 ? classItem.instructors : [{
                            id: classItem.instructor_id || '',
                            name: classItem.instructor_name || 'Unassigned',
                            avatar: null,
                            initials: classItem.instructor_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??',
                          }]).slice(0, 3).map((instructor: any, idx: number) => {
                            return (
                            <div
                              key={instructor.id || idx}
                              className="relative h-8 w-8 xl:h-10 xl:w-10 rounded-full border-2 border-white dark:border-dark flex items-center justify-center text-xs xl:text-sm font-semibold text-white bg-gradient-to-br from-primary to-primary/80 dark:from-primary dark:to-primary/80 shrink-0 overflow-hidden"
                              title={instructor.name}
                            >
                              {instructor.avatar ? (
                                <img
                                  src={instructor.avatar}
                                  alt={instructor.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    // Fallback to initials if image fails to load
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent && !parent.querySelector('span')) {
                                      const span = document.createElement('span')
                                      span.textContent = instructor.initials
                                      parent.appendChild(span)
                                    }
                                  }}
                                />
                              ) : (
                                <span>{instructor.initials}</span>
                              )}
                            </div>
                            )
                          })}
                        </div>
                        <span className="truncate">
                          {classItem.instructors && classItem.instructors.length > 0
                            ? classItem.instructors.map((i: any) => i.name).join(', ')
                            : classItem.instructor_name || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm text-body-color dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{classItem.room_name || classItem.location || "Studio"}</span>
                      </div>
                      {/* Show view sessions button only for courses (recurring classes are now individual sessions) */}
                      {isCourse && classItem._isParent && classItem._totalSessions && classItem._totalSessions > 0 && (
                        <button
                          onClick={(e) => handleViewSessions(classItem, e)}
                          className="flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-medium mt-1 transition-colors text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View {classItem._totalSessions} sessions</span>
                        </button>
                      )}
                    </div>

                    {/* Bottom: Tokens & Book Button - Compact on mobile */}
                    <div className="flex items-center justify-between pt-2 xl:pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 xl:gap-4">
                          <div className="flex items-center gap-1.5 xl:gap-2">
                            <svg className={`w-4 h-4 xl:w-5 xl:h-5 ${
                              isRecurringOrCourse
                                ? isCourse
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : 'text-blue-600 dark:text-blue-400'
                                : 'text-primary'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <span className={`font-bold text-sm xl:text-base ${
                              isRecurringOrCourse
                                ? isCourse
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : 'text-blue-600 dark:text-blue-400'
                                : 'text-primary'
                            }`}>
                              {classItem.tokens_required}
                            </span>
                            <span className={`text-[10px] xl:text-xs ${
                              isRecurringOrCourse
                                ? isCourse
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : 'text-blue-600 dark:text-blue-400'
                                : 'text-body-color dark:text-gray-400'
                            }`}>
                              token{classItem.tokens_required > 1 ? "s" : ""}
                              {/* Show "total" for courses */}
                              {classItem._isParent && classItem._totalSessions && classItem.recurrence_type === 'course' && (
                                <span className="ml-1">total</span>
                              )}
                            </span>
                          </div>
                          
                          {/* Show spots for non-parent classes */}
                          {!classItem._isParent && (
                            <div className="flex items-center gap-1 xl:gap-1.5">
                              <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-body-color dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className={`text-xs xl:text-sm font-medium ${
                                spotsInfo.left <= 5 && spotsInfo.left > 0 
                                  ? 'text-orange-600 dark:text-orange-400' 
                                  : spotsInfo.left === 0 
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-body-color dark:text-gray-400'
                              }`}>
                                {spotsInfo.text}
                              </span>
                            </div>
                          )}
                          
                          {/* Show session count for parent classes */}
                          {classItem._isParent && classItem._totalSessions && (
                            <div className="flex items-center gap-1 xl:gap-1.5">
                              <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-body-color dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs xl:text-sm text-body-color dark:text-gray-400">
                                {classItem._totalSessions} sessions
                              </span>
                            </div>
                          )}
                        </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // For recurring parents, open sessions panel (book individual sessions)
                          // For course parents, allow direct booking (books all sessions at once)
                          if (isRecurring && classItem._isParent && classItem._childInstances && classItem._childInstances.length > 0) {
                            handleViewSessions(classItem, e);
                          } else if (isCourse && classItem._isParent && classItem._childInstances && classItem._childInstances.length > 0) {
                            // Course parent - book all sessions at once
                            setClassToBook(classItem);
                            setIsConfirmationModalOpen(true);
                          } else if (!isFull) {
                            // Single class or child session - book directly
                            setClassToBook(classItem);
                            setIsConfirmationModalOpen(true);
                          }
                        }}
                        disabled={isFull || bookClassMutation.isPending || (classItem._isParent && isRecurring) || !bookingWindowOpen}
                        title={!bookingWindowOpen ? 'Bookings are allowed only between 08:00–22:00 SGT' : undefined}
                        className={`px-4 xl:px-5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold transition-all active:scale-95 xl:active:scale-100 shadow-md xl:shadow-md ${
                          isFull || bookClassMutation.isPending
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                            : isRecurringOrCourse
                            ? isCourse && classItem._isParent
                              ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 shadow-purple-500/20 xl:shadow-purple-500/20"
                              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-blue-500/20 xl:shadow-blue-500/20"
                            : "bg-primary text-white hover:bg-primary/90 shadow-primary/20 xl:shadow-primary/20"
                        }`}
                      >
                        {bookClassMutation.isPending ? "Booking..." : isFull ? "Full" : isRecurring && classItem._isParent ? "View Sessions" : "Book"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Class Details Slide Panel */}
      <ClassDetailsSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={() => {
          setIsSlidePanelOpen(false);
          setSelectedClass(null);
        }}
        classItem={selectedClass}
        onBookClick={handleBookClick}
        isBooking={bookClassMutation.isPending}
        isFull={selectedClass ? selectedClass.capacity - selectedClass.booked_count <= 0 : false}
        isBookingWindowOpen={bookingWindowOpen}
      />

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false);
          setClassToBook(null);
        }}
        onConfirm={handleConfirmBooking}
        classItem={classToBook}
        isBooking={bookClassMutation.isPending}
        userTokenBalance={userTokenBalance}
        isBookingWindowOpen={bookingWindowOpen}
      />

      {/* Sessions Slider Panel for Recurring/Course Classes */}
      {sessionsPanel.isOpen && sessionsPanel.parentClass && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSessionsPanel({ isOpen: false, parentClass: null, sessions: [] })}
          />
          
          {/* Panel */}
          <div className="relative w-full sm:w-[500px] h-[80vh] sm:h-[600px] bg-white dark:bg-dark rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sessionsPanel.parentClass.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {sessionsPanel.sessions.length} {sessionsPanel.sessions.length === 1 ? 'session' : 'sessions'}
                  {sessionsPanel.parentClass.recurrence_type === 'course' && (
                    <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">
                      • {sessionsPanel.parentClass.tokens_required} tokens total (all will be booked)
                    </span>
                  )}
                  {sessionsPanel.parentClass.recurrence_type === 'recurring' && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                      • Select sessions to book
                      {selectedSessions.size > 0 && (
                        <span className="ml-1">({selectedSessions.size} selected)</span>
                      )}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setSessionsPanel({ isOpen: false, parentClass: null, sessions: [] });
                  setSelectedSessions(new Set());
                }}
                className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Book Selected Button for Recurring */}
            {sessionsPanel.parentClass?.recurrence_type === 'recurring' && (
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const availableSessions = sessionsPanel.sessions.filter(s => s.capacity - s.booked_count > 0);
                        if (selectedSessions.size === availableSessions.length) {
                          // Deselect all
                          setSelectedSessions(new Set());
                        } else {
                          // Select all available
                          setSelectedSessions(new Set(availableSessions.map(s => s.id)));
                        }
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      {selectedSessions.size === sessionsPanel.sessions.filter(s => s.capacity - s.booked_count > 0).length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>
                  {selectedSessions.size > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedSessions.size} session{selectedSessions.size !== 1 ? 's' : ''} selected
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Total: {sessionsPanel.sessions
                            .filter(s => selectedSessions.has(s.id))
                            .reduce((sum, s) => sum + s.tokens_required, 0)} tokens
                        </p>
                      </div>
                      <button
                        onClick={handleBookSelectedSessions}
                        disabled={bookClassMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookClassMutation.isPending ? "Booking..." : "Book Selected"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {sessionsPanel.sessions
                  .filter((session) => {
                    // Filter out past sessions
                    const sessionDate = new Date(session.scheduled_at)
                    return sessionDate > new Date()
                  })
                  .map((session) => {
                  const sessionSpots = session.capacity - session.booked_count;
                  const sessionIsFull = sessionSpots <= 0;
                  const sessionDate = new Date(session.scheduled_at);
                  const isRecurring = sessionsPanel.parentClass?.recurrence_type === 'recurring';
                  const isCourse = sessionsPanel.parentClass?.recurrence_type === 'course';
                  const isSelected = selectedSessions.has(session.id);
                  
                  return (
                    <div
                      key={session.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700'
                      } hover:bg-gray-100 dark:hover:bg-gray-800`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox for recurring classes */}
                        {isRecurring && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSession(session.id)}
                            disabled={sessionIsFull}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${sessionIsFull ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                              {sessionIsFull ? 'Full' : `${sessionSpots} spots`}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatDate(session.scheduled_at)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatTime(session.scheduled_at)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {session.room_name || session.location || "Studio"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tokens</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {session.tokens_required} {session.tokens_required > 1 ? 'tokens' : 'token'}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Book button for individual booking (alternative to checkbox) */}
                        {isRecurring && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!sessionIsFull) {
                                setClassToBook(session);
                                setIsConfirmationModalOpen(true);
                                setSessionsPanel({ isOpen: false, parentClass: null, sessions: [] });
                                setSelectedSessions(new Set());
                              }
                            }}
                            disabled={sessionIsFull || bookClassMutation.isPending}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shrink-0 ${
                              sessionIsFull || bookClassMutation.isPending
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                                : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            }`}
                          >
                            {bookClassMutation.isPending ? "..." : sessionIsFull ? "Full" : "Book"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
