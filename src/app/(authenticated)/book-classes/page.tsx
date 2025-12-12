"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUpcomingClasses, useBookClass, type ClassWithAvailability } from "@/hooks/useClasses";
import ClassDetailsSlidePanel from "@/components/ClassDetails/ClassDetailsSlidePanel";
import BookingConfirmationModal from "@/components/BookingConfirmation/BookingConfirmationModal";
import { formatDate, formatTime } from "@/lib/utils";

const ClassesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState({
    type: "all",
    difficulty: "all",
    date: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Selected class for slide panel
  const [selectedClass, setSelectedClass] = useState<ClassWithAvailability | null>(null);
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  
  // Booking confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [classToBook, setClassToBook] = useState<ClassWithAvailability | null>(null);

  // React Query hooks
  const { data: classes = [], isLoading } = useUpcomingClasses({
    type: filter.type !== "all" ? filter.type : undefined,
    difficulty: filter.difficulty !== "all" ? filter.difficulty : undefined,
    date: filter.date || undefined,
  });

  const bookClassMutation = useBookClass();

  // Handle class card click - open slide panel
  const handleClassClick = (classItem: ClassWithAvailability) => {
    setSelectedClass(classItem);
    setIsSlidePanelOpen(true);
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
      { userId: user.id, classId: classToBook.id },
      {
        onSuccess: () => {
          setIsConfirmationModalOpen(false);
          setClassToBook(null);
          setSelectedClass(null);
        },
      }
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getSpotsLeft = (capacity: number, booked: number) => {
    const spots = capacity - booked;
    if (spots <= 0) return { text: "Full", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" };
    if (spots <= 3) return { text: `${spots} left`, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" };
    return { text: `${spots} spots`, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" };
  };

  const activeFiltersCount = [filter.type !== "all", filter.difficulty !== "all", filter.date !== ""].filter(Boolean).length;

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                <option value="salsa">Salsa</option>
                <option value="hiit">HIIT</option>
                <option value="yoga">Yoga</option>
                <option value="dance">Dance Fitness</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-dark mb-2 block text-sm font-semibold dark:text-white">
                Difficulty
              </label>
              <select
                value={filter.difficulty}
                onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-dark dark:text-white outline-none focus:border-primary transition-colors text-sm font-medium"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
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
                  setFilter({ type: "all", difficulty: "all", date: "" });
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
              setFilter({ type: "all", difficulty: "all", date: "" });
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

            return (
              <div
                key={classItem.id}
                onClick={() => handleClassClick(classItem)}
                className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden active:scale-[0.98] transition-transform cursor-pointer hover:shadow-lg xl:hover:shadow-lg"
              >
                {/* Mobile App Style Card Layout */}
                <div className="flex">
                  {/* Left: Time & Date Badge - Smaller on mobile */}
                  <div className="w-16 xl:w-20 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-2 xl:p-3 shrink-0">
                    <div className="text-center">
                      <p className="text-xl xl:text-2xl font-bold text-primary mb-0.5">
                        {formatTime(classItem.scheduled_at).split(":")[0]}
                      </p>
                      <p className="text-[10px] xl:text-xs text-primary/70 font-medium">
                        {formatTime(classItem.scheduled_at).split(":")[1]}
                      </p>
                      <div className="mt-1.5 xl:mt-2 pt-1.5 xl:pt-2 border-t border-primary/20">
                        <p className="text-[10px] xl:text-xs font-semibold text-primary/80 uppercase">
                          {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(classItem.scheduled_at).split(",")[0]}
                        </p>
                        <p className="text-[9px] xl:text-xs text-primary/60 mt-0.5">
                          {formatDate(classItem.scheduled_at).split(",")[1]?.trim()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Class Details - Compact on mobile */}
                  <div className="flex-1 p-3 xl:p-4">
                    <div className="flex items-start justify-between mb-1.5 xl:mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base xl:text-lg font-bold text-dark dark:text-white mb-1 xl:mb-1.5 line-clamp-1">
                          {classItem.name}
                        </h3>
                        <div className="flex items-center gap-1.5 xl:gap-2 flex-wrap">
                          <span className={`px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-semibold border ${getDifficultyColor(classItem.difficulty_level)}`}>
                            {classItem.difficulty_level}
                          </span>
                          <span className={`px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-lg text-[10px] xl:text-xs font-semibold ${spotsInfo.bg} ${spotsInfo.color}`}>
                            {spotsInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Class Info Icons - Compact on mobile */}
                    <div className="space-y-1 xl:space-y-2 mb-3 xl:mb-4">
                      <div className="flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm text-body-color dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{classItem.instructor_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm text-body-color dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{classItem.location}</span>
                      </div>
                    </div>

                    {/* Bottom: Tokens & Book Button - Compact on mobile */}
                    <div className="flex items-center justify-between pt-2 xl:pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 xl:gap-2">
                        <svg className="w-4 h-4 xl:w-5 xl:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span className="text-primary font-bold text-sm xl:text-base">
                          {classItem.tokens_required}
                        </span>
                        <span className="text-[10px] xl:text-xs text-body-color dark:text-gray-400">
                          token{classItem.tokens_required > 1 ? "s" : ""}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isFull) {
                            setClassToBook(classItem);
                            setIsConfirmationModalOpen(true);
                          }
                        }}
                        disabled={isFull || bookClassMutation.isPending}
                        className={`px-4 xl:px-5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold transition-all active:scale-95 xl:active:scale-100 shadow-md xl:shadow-md ${
                          isFull || bookClassMutation.isPending
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                            : "bg-primary text-white hover:bg-primary/90 shadow-primary/20 xl:shadow-primary/20"
                        }`}
                      >
                        {bookClassMutation.isPending ? "Booking..." : isFull ? "Full" : "Book"}
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
      />
    </div>
  );
};

export default ClassesPage;
