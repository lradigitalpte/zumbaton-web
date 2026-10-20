"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useMobileOverlayLock } from "@/context/MobileOverlayContext";
import { Z_OVERLAY } from "@/lib/layering";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { useUpcomingClasses, useBookClass, useBookBatchClasses, type ClassWithAvailability } from "@/hooks/useClasses";
import { useDashboardTokenBalance } from "@/hooks/useDashboard";
import ClassDetailsSlidePanel from "@/components/ClassDetails/ClassDetailsSlidePanel";
import BookingConfirmationModal from "@/components/BookingConfirmation/BookingConfirmationModal";
import Modal from "@/components/Modal/Modal";
import { formatDate, formatDateFull, formatTime } from "@/lib/utils";
import { handleMutationError } from "@/lib/toast-helper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBookingWindowOpen } from "@/hooks/useBookingWindowOpen";
import { useBookingWindowTick } from "@/hooks/useBookingWindowTick";
import { BOOKING_WINDOW_CLOSED_MESSAGE, isBookingWindowOpen } from "@/lib/booking-window";

const CLASSES_PER_PAGE = 12;

const ClassesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState({
    type: "all",
    difficulty: "all",
    date: "",
    recurrenceType: "all" as "single" | "recurring" | "course" | "all",
    categoryId: "",
    instructorId: "all",
    ageGroup: "all" as "all" | "adult" | "kid",
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
  
  // Booking confirmation modal (single state so modal always has class when open)
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    class: ClassWithAvailability | null;
  }>({ open: false, class: null });
  const [bookingSuccessModal, setBookingSuccessModal] = useState<{
    open: boolean;
    className: string;
    message: string;
    waitlistPosition?: number;
  }>({ open: false, className: "", message: "" });
  const isConfirmationModalOpen = confirmationModal.open;
  const classToBook = confirmationModal.class;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const bookingWindowOpen = useBookingWindowOpen(
    classToBook?.scheduled_at ?? selectedClass?.scheduled_at
  );
  const bookingWindowTick = useBookingWindowTick();

  useMobileOverlayLock(
    sessionsPanel.isOpen && !!sessionsPanel.parentClass,
    "book-classes-sessions-panel",
  );

  // Keep token balance in React Query (avoids stale local state when routes are cached)
  const { data: tokenBalanceData } = useDashboardTokenBalance(user?.id);
  const userTokenBalance = tokenBalanceData?.available ?? 0;

  // React Query hooks
  const { data: allClasses = [], isLoading, isError, error, refetch } = useUpcomingClasses({
    type: filter.type !== "all" ? filter.type : undefined,
    difficulty: filter.difficulty !== "all" ? filter.difficulty : undefined,
    date: filter.date || undefined,
    recurrenceType: filter.recurrenceType !== "all" ? filter.recurrenceType : undefined,
    categoryId: filter.categoryId || undefined,
  });

  // Unique instructors from current data (for filter dropdown)
  const uniqueInstructors = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    allClasses.forEach((c) => {
      const id = c.instructor_id || "";
      const name = (c.instructor_name || "TBA").trim();
      const key = id || `name:${name}`;
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push({ id: key.startsWith("name:") ? key : id, name });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [allClasses]);

  // Apply search + instructor + age group filters
  const classes = useMemo(() => allClasses.filter((classItem) => {
    if (!isBookingWindowOpen(classItem.scheduled_at)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        classItem.name?.toLowerCase().includes(query) ||
        classItem.instructor_name?.toLowerCase().includes(query) ||
        classItem.description?.toLowerCase().includes(query) ||
        classItem.class_type?.toLowerCase().includes(query) ||
        classItem.location?.toLowerCase().includes(query) ||
        classItem.room_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (filter.instructorId !== "all") {
      const matchInstructor = filter.instructorId.startsWith("name:")
        ? (classItem.instructor_name && classItem.instructor_name.split(",").map((n: string) => n.trim()).some((n: string) => n === filter.instructorId.replace(/^name:/, "")))
        : classItem.instructor_id === filter.instructorId;
      if (!matchInstructor) return false;
    }
    if (filter.ageGroup !== "all") {
      const ag = classItem.age_group || "all";
      if (ag !== filter.ageGroup) return false;
    }
    return true;
  }), [allClasses, searchQuery, filter.instructorId, filter.ageGroup, bookingWindowTick]);

  // Pagination: reset to page 1 when filters/classes change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.type, filter.date, filter.recurrenceType, filter.categoryId, filter.instructorId, filter.ageGroup, searchQuery]);

  const totalPages = Math.ceil(classes.length / CLASSES_PER_PAGE);
  const paginatedClasses = useMemo(
    () => classes.slice((currentPage - 1) * CLASSES_PER_PAGE, currentPage * CLASSES_PER_PAGE),
    [classes, currentPage]
  );

  // Group current page classes by date for section headers and break lines
  const classesByDate = useMemo(() => {
    const map = new Map<string, ClassWithAvailability[]>();
    paginatedClasses.forEach((c) => {
      const key = new Date(c.scheduled_at).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries());
  }, [paginatedClasses]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const handleClassBookClick = (e: React.MouseEvent, classItem: ClassWithAvailability) => {
    e.stopPropagation();
    const booked = classItem.booked_count ?? 0;
    const isFull = classItem.capacity - booked <= 0;
    const isRecurring = classItem.recurrence_type === "recurring";
    const isCourse = classItem.recurrence_type === "course";

    if (isRecurring && classItem._isParent && classItem._childInstances?.length) {
      handleViewSessions(classItem, e);
    } else if (isCourse && classItem._isParent && classItem._childInstances?.length) {
      setConfirmationModal({ open: true, class: classItem });
    } else if (!isFull) {
      setConfirmationModal({ open: true, class: classItem });
    }
  };

  const bookActionLabel = (
    classItem: ClassWithAvailability,
    isFull: boolean,
    isRecurring: boolean
  ) => {
    if (bookClassMutation.isPending) return "...";
    if (isFull) return "Full";
    if (isRecurring && classItem._isParent) return "Sessions";
    return "Book";
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
        onSuccess: () => {
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
      setConfirmationModal({ open: true, class: selectedClass });
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
        onSuccess: (data) => {
          setConfirmationModal({ open: false, class: null });
          setSelectedClass(null);
          setBookingSuccessModal({
            open: true,
            className: data.className || classToBook.name || classToBook.title || "Class",
            message: data.message || "Your booking has been confirmed.",
            waitlistPosition: data.waitlistPosition,
          });
        },
      }
    );
  };

  const getSpotsLeft = (capacity: number, booked: number | undefined) => {
    const spots = capacity - (Number(booked) || 0);
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
    filter.instructorId !== "all",
    filter.ageGroup !== "all",
    searchQuery.trim() !== ""
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-lg pb-6 md:max-w-none">
      <div className="mb-4 md:mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 md:hidden">
              Schedule
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              Browse Classes
            </h1>
            <p className="mt-1 hidden text-sm text-body-color dark:text-gray-400 md:block">
              Find the perfect class for you
            </p>
          </div>
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
      </div>

      {/* Only interrupt the user when their selected near-term class cannot be booked now. */}
      {!bookingWindowOpen && (
        <div className="mb-4 sm:mb-6 rounded-xl p-3 sm:p-4 border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="text-sm sm:text-base font-medium text-red-700 dark:text-red-300">
              {BOOKING_WINDOW_CLOSED_MESSAGE}
            </p>
          </div>
        </div>
      )}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Class Type */}
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
                <option value="zumba">Step aerobics</option>
                <option value="dance">Dance</option>
              </select>
            </div>

            {/* Schedule Type */}
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

            {/* Instructor / Tutor */}
            <div>
              <label className="text-dark mb-2 block text-sm font-semibold dark:text-white">
                Instructor
              </label>
              <select
                value={filter.instructorId}
                onChange={(e) => setFilter({ ...filter, instructorId: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-dark dark:text-white outline-none focus:border-primary transition-colors text-sm font-medium"
              >
                <option value="all">All Instructors</option>
                {uniqueInstructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Age group: All / Adults / Kids */}
            <div>
              <label className="text-dark mb-2 block text-sm font-semibold dark:text-white">
                Age Group
              </label>
              <select
                value={filter.ageGroup}
                onChange={(e) => setFilter({ ...filter, ageGroup: e.target.value as "all" | "adult" | "kid" })}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-dark dark:text-white outline-none focus:border-primary transition-colors text-sm font-medium"
              >
                <option value="all">All Ages</option>
                <option value="adult">Adults</option>
                <option value="kid">Kids</option>
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
                  setFilter({ type: "all", difficulty: "all", date: "", recurrenceType: "all", categoryId: "", instructorId: "all", ageGroup: "all" });
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
          {filter.instructorId !== "all" && (
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5">
              {uniqueInstructors.find((i) => i.id === filter.instructorId)?.name ?? "Instructor"}
              <button
                onClick={() => setFilter({ ...filter, instructorId: "all" })}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filter.ageGroup !== "all" && (
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5">
              {filter.ageGroup === "adult" ? "Adults" : "Kids"}
              <button
                onClick={() => setFilter({ ...filter, ageGroup: "all" })}
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
      ) : isError ? (
        <div className="bg-white dark:bg-dark rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <p className="text-base sm:text-lg font-semibold text-dark dark:text-white mb-2">Unable to load classes</p>
          <p className="text-sm text-body-color dark:text-gray-400 mb-6">{error instanceof Error ? error.message : "Please try again."}</p>
          <button
            onClick={() => refetch()}
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors active:scale-95 shadow-md"
          >
            Retry
          </button>
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
              setFilter({ type: "all", difficulty: "all", date: "", recurrenceType: "all", categoryId: "", instructorId: "all", ageGroup: "all" });
              setSearchQuery("");
              setShowFilters(false);
            }}
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors active:scale-95 shadow-md"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
        {/* Mobile: timeline list (matches dashboard cards) */}
        <div className="space-y-4 md:hidden">
          {classesByDate.map(([dateKey, classesOnDate]) => {
            const firstScheduled = classesOnDate[0].scheduled_at;
            const fullDateLabel = formatDateFull(firstScheduled);
            const sectionDate = new Date(firstScheduled);
            const isToday = sectionDate.toDateString() === new Date().toDateString();
            const isTomorrow =
              sectionDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
            const dayBadge = isToday ? "Today" : isTomorrow ? "Tomorrow" : null;

            return (
              <article
                key={dateKey}
                className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-dark"
              >
                <header className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <h2 className="text-base font-bold leading-snug text-zinc-900 dark:text-white">
                    {fullDateLabel}
                  </h2>
                  {dayBadge && (
                    <span className="shrink-0 rounded-full bg-lime-400/30 px-2.5 py-0.5 text-[11px] font-bold text-lime-900 dark:text-lime-300">
                      {dayBadge}
                    </span>
                  )}
                </header>
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {classesOnDate.map((classItem) => {
                    const booked = classItem.booked_count ?? 0;
                    const spotsInfo = getSpotsLeft(classItem.capacity, booked);
                    const isFull = classItem.capacity - booked <= 0;
                    const isRecurring = classItem.recurrence_type === "recurring";
                    const isCourse = classItem.recurrence_type === "course";
                    const instructorName = classItem.instructor_name || "Unassigned";
                    const initials =
                      instructorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "??";
                    const location = classItem.room_name || classItem.location || "Studio";
                    const bookDisabled =
                      isFull || bookClassMutation.isPending || (classItem._isParent && isRecurring);
                    const label = bookActionLabel(classItem, isFull, isRecurring);

                    return (
                      <li key={classItem.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleClassClick(classItem)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleClassClick(classItem);
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-3.5 active:bg-zinc-50 dark:active:bg-zinc-800/50 ${
                            isFull ? "opacity-75" : ""
                          }`}
                        >
                          <div className="w-[4.5rem] shrink-0">
                            <p className="text-base font-bold tabular-nums leading-tight text-zinc-900 dark:text-white">
                              {formatTime(classItem.scheduled_at)}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-lime-400">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
                              {classItem.name}
                              {classItem.is_outdoor ? " (outdoors)" : ""}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {instructorName} · {location} · {classItem.tokens_required} token
                              {classItem.tokens_required !== 1 ? "s" : ""}
                              {!isFull ? ` · ${spotsInfo.text}` : ""}
                            </p>
                            {(isCourse || isRecurring) && classItem._isParent && (
                              <p className="mt-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                {isCourse ? "Course" : "Series"}
                                {classItem._totalSessions ? ` · ${classItem._totalSessions} sessions` : ""}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleClassBookClick(e, classItem)}
                            disabled={bookDisabled}
                            title={!bookingWindowOpen ? BOOKING_WINDOW_CLOSED_MESSAGE : undefined}
                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-transform active:scale-95 ${
                              bookDisabled
                                ? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                : isCourse && classItem._isParent
                                  ? "bg-purple-600 text-white"
                                  : isRecurring && classItem._isParent
                                    ? "bg-blue-600 text-white"
                                    : "bg-zinc-900 text-white"
                            }`}
                          >
                            {label}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Desktop: card grid */}
        <div className="hidden space-y-8 md:block">
          {classesByDate.map(([dateKey, classesOnDate]) => {
            const firstScheduled = classesOnDate[0].scheduled_at;
            const fullDateLabel = formatDateFull(firstScheduled);
            return (
              <section key={dateKey}>
                <h2 className="mb-1 text-lg font-bold text-dark dark:text-white">{fullDateLabel}</h2>
                <hr className="mb-4 border-gray-200 dark:border-gray-700" aria-hidden="true" />
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                  {classesOnDate.map((classItem) => {
                    const booked = classItem.booked_count ?? 0;
                    const spotsInfo = getSpotsLeft(classItem.capacity, booked);
                    const isFull = classItem.capacity - booked <= 0;
                    const classDate = new Date(classItem.scheduled_at);
                    const isToday = classDate.toDateString() === new Date().toDateString();
                    const isTomorrow =
                      classDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                    const isRecurringOrCourse =
                      classItem.recurrence_type === "recurring" || classItem.recurrence_type === "course";
                    const isCourse = classItem.recurrence_type === "course";
                    const isRecurring = classItem.recurrence_type === "recurring";

                    return (
                      <div
                        key={classItem.id}
                        onClick={() => handleClassClick(classItem)}
                        className={`flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] dark:bg-dark ${
                          isRecurringOrCourse
                            ? isCourse
                              ? "border-2 border-purple-300 bg-gradient-to-b from-purple-50/50 to-white dark:border-purple-700 dark:from-purple-950/30 dark:to-dark"
                              : "border-2 border-blue-300 bg-gradient-to-b from-blue-50/50 to-white dark:border-blue-700 dark:from-blue-950/30 dark:to-dark"
                            : "border border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between px-4 py-2.5 ${
                            isRecurringOrCourse
                              ? isCourse
                                ? "bg-purple-500/10 dark:bg-purple-500/20"
                                : "bg-blue-500/10 dark:bg-blue-500/20"
                              : "bg-primary/10 dark:bg-primary/20"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`text-lg font-bold ${
                                isRecurringOrCourse
                                  ? isCourse
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-blue-600 dark:text-blue-400"
                                  : "text-primary"
                              }`}
                            >
                              {formatTime(classItem.scheduled_at)}
                            </span>
                            <span className="text-xs font-medium leading-tight text-body-color dark:text-gray-400">
                              {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDateFull(classItem.scheduled_at)}
                            </span>
                          </div>
                          {(classItem.recurrence_type === "recurring" || classItem.recurrence_type === "course") && (
                            <span
                              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                isCourse
                                  ? "bg-purple-200 text-purple-800 dark:bg-purple-800/40 dark:text-purple-300"
                                  : "bg-blue-200 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300"
                              }`}
                            >
                              {classItem.recurrence_type === "course" ? "Course" : "Series"}
                            </span>
                          )}
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col p-4">
                          <h3 className="mb-2 line-clamp-2 text-base font-bold text-dark dark:text-white">
                            {classItem.name}
                            {classItem.is_outdoor ? " (outdoors)" : ""}
                          </h3>
                          <div className="mb-2 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${spotsInfo.bg} ${spotsInfo.color}`}>
                              {spotsInfo.text}
                            </span>
                            {classItem.age_group && classItem.age_group !== "all" && (
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                  classItem.age_group === "adult"
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                    : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                                }`}
                              >
                                {classItem.age_group === "adult" ? "Adults" : "Kids"}
                              </span>
                            )}
                          </div>
                          <div className="mb-2 flex min-w-0 items-center gap-2 text-xs text-body-color dark:text-gray-400">
                            <div className="flex -space-x-2 shrink-0">
                              {(classItem.instructors && classItem.instructors.length > 0
                                ? classItem.instructors
                                : [
                                    {
                                      id: classItem.instructor_id || "",
                                      name: classItem.instructor_name || "Unassigned",
                                      avatar: null,
                                      initials:
                                        classItem.instructor_name
                                          ?.split(" ")
                                          .map((n: string) => n[0])
                                          .join("")
                                          .toUpperCase()
                                          .slice(0, 2) || "??",
                                    },
                                  ]
                              )
                                .slice(0, 2)
                                .map((instructor: { id?: string; name: string; avatar?: string | null; initials?: string }, idx: number) => (
                                  <div
                                    key={instructor.id || idx}
                                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary text-xs font-semibold text-white shadow-sm dark:border-dark"
                                    title={instructor.name}
                                  >
                                    {instructor.avatar ? (
                                      <img src={instructor.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
                                    ) : (
                                      <span>{instructor.initials}</span>
                                    )}
                                  </div>
                                ))}
                            </div>
                            <span className="truncate">{classItem.instructor_name || "Unassigned"}</span>
                          </div>
                          <div className="mb-3 flex items-center gap-1.5 text-xs text-body-color dark:text-gray-400">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                            <span className="truncate">{classItem.room_name || classItem.location || "Studio"}</span>
                          </div>
                          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                            <span
                              className={`text-sm font-bold ${
                                isRecurringOrCourse
                                  ? isCourse
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-blue-600 dark:text-blue-400"
                                  : "text-primary"
                              }`}
                            >
                              {classItem.tokens_required} token{classItem.tokens_required !== 1 ? "s" : ""}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleClassBookClick(e, classItem)}
                              disabled={isFull || bookClassMutation.isPending || (classItem._isParent && isRecurring)}
                              title={!bookingWindowOpen ? BOOKING_WINDOW_CLOSED_MESSAGE : undefined}
                              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                                isFull || bookClassMutation.isPending
                                  ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800"
                                  : isRecurringOrCourse
                                    ? isCourse && classItem._isParent
                                      ? "bg-purple-600 text-white hover:bg-purple-700"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-primary text-white hover:bg-primary/90"
                              }`}
                            >
                              {bookActionLabel(classItem, isFull, isRecurring)}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Pagination - centered, with bottom padding so it sits above floating Check In button */}
        {totalPages > 1 && (
          <div className="mt-6 pb-24 sm:pb-28 flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-body-color dark:text-gray-400 text-center">
              Showing {(currentPage - 1) * CLASSES_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * CLASSES_PER_PAGE, classes.length)} of {classes.length} classes
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-dark text-body-color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[2.5rem] h-10 rounded-xl font-semibold text-sm transition-colors ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-dark text-body-color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-dark text-body-color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        </>
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
        isFull={selectedClass ? selectedClass.capacity - (selectedClass.booked_count ?? 0) <= 0 : false}
        isBookingWindowOpen={bookingWindowOpen}
      />

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setConfirmationModal({ open: false, class: null })}
        onConfirm={handleConfirmBooking}
        classItem={classToBook}
        isBooking={bookClassMutation.isPending}
        userTokenBalance={userTokenBalance}
        isBookingWindowOpen={bookingWindowOpen}
      />

      <Modal
        isOpen={bookingSuccessModal.open}
        onClose={() => setBookingSuccessModal({ open: false, className: "", message: "" })}
        title={bookingSuccessModal.waitlistPosition ? "Added to Waitlist" : "Booking Confirmed"}
        description={bookingSuccessModal.className}
        size="md"
        footer={
          <button
            onClick={() => setBookingSuccessModal({ open: false, className: "", message: "" })}
            className="w-full px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              {bookingSuccessModal.waitlistPosition
                ? `You are #${bookingSuccessModal.waitlistPosition} in the waitlist.`
                : "Your spot is secured."}
            </p>
          </div>
          <p className="text-sm text-body-color dark:text-gray-300">
            {bookingSuccessModal.message}
          </p>
        </div>
      </Modal>

      {/* Sessions Slider Panel for Recurring/Course Classes */}
      {sessionsPanel.isOpen && sessionsPanel.parentClass && (
        createPortal(
        <div
          className="fixed inset-0 flex items-end sm:items-center sm:justify-end"
          style={{ zIndex: Z_OVERLAY }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSessionsPanel({ isOpen: false, parentClass: null, sessions: [] })}
          />

          {/* Panel */}
          <div className="relative flex h-[80vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-dark sm:h-[600px] sm:w-[500px] sm:rounded-l-2xl sm:rounded-tr-none">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sessionsPanel.parentClass.name}{(sessionsPanel.parentClass as any).is_outdoor ? " (outdoors)" : ""}
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
                        const availableSessions = sessionsPanel.sessions.filter(s => s.capacity - (s.booked_count ?? 0) > 0);
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
                  .filter((session) => isBookingWindowOpen(session.scheduled_at))
                  .map((session) => {
                  const sessionSpots = session.capacity - (session.booked_count ?? 0);
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
                                setConfirmationModal({ open: true, class: session });
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
        </div>,
        document.body,
        )
      )}
    </div>
  );
};

export default ClassesPage;
