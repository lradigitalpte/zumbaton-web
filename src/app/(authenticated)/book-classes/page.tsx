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
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getSpotsLeft = (capacity: number, booked: number) => {
    const spots = capacity - booked;
    if (spots <= 0) return { text: "Full", color: "text-red-500" };
    if (spots <= 3) return { text: `${spots} spots left`, color: "text-orange-500" };
    return { text: `${spots} spots left`, color: "text-green-500" };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
          Browse Classes
        </h1>
        <p className="text-body-color dark:text-gray-400">
          Find the perfect class for you and book your spot today!
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-dark mb-2 block text-sm font-medium dark:text-white">
              Class Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-dark dark:text-white outline-none focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="zumba">Zumba</option>
              <option value="salsa">Salsa</option>
              <option value="hiit">HIIT</option>
              <option value="yoga">Yoga</option>
              <option value="dance">Dance Fitness</option>
            </select>
          </div>

          <div>
            <label className="text-dark mb-2 block text-sm font-medium dark:text-white">
              Difficulty
            </label>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-dark dark:text-white outline-none focus:border-primary"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-dark mb-2 block text-sm font-medium dark:text-white">
              Date
            </label>
            <input
              type="date"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-dark dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilter({ type: "all", difficulty: "all", date: "" })}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 text-body-color dark:text-gray-300 px-4 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Classes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <p className="text-body-color dark:text-gray-400 text-lg mb-4">No classes found matching your criteria</p>
          <button
            onClick={() => setFilter({ type: "all", difficulty: "all", date: "" })}
            className="text-primary font-medium hover:underline"
          >
            Clear filters to see all classes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((classItem) => {
            const spotsInfo = getSpotsLeft(classItem.capacity, classItem.booked_count);
            const isFull = classItem.capacity - classItem.booked_count <= 0;

            return (
              <div
                key={classItem.id}
                onClick={() => handleClassClick(classItem)}
                className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
              >
                {/* Class Image/Banner */}
                <div className="h-32 bg-linear-to-br from-primary/80 to-primary flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                {/* Class Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-dark dark:text-white group-hover:text-primary transition-colors">
                      {classItem.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(classItem.difficulty_level)}`}>
                      {classItem.difficulty_level}
                    </span>
                  </div>

                  <p className="text-body-color dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="space-y-1.5 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-body-color dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{classItem.instructor_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-body-color dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(classItem.scheduled_at)} at {formatTime(classItem.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-body-color dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{classItem.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-primary font-bold">
                        {classItem.tokens_required} token{classItem.tokens_required > 1 ? "s" : ""}
                      </span>
                      <span className={`block text-xs ${spotsInfo.color}`}>
                        {spotsInfo.text}
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isFull || bookClassMutation.isPending
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {bookClassMutation.isPending ? "Booking..." : isFull ? "Full" : "Book Now"}
                    </button>
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
