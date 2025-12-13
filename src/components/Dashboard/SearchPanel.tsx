"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUpcomingClasses } from "@/hooks/useClasses";
import { formatDate, formatTime } from "@/lib/utils";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchPanel = ({ isOpen, onClose }: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch classes for search suggestions
  const { data: classes = [], isLoading } = useUpcomingClasses();

  // Filter classes based on search query
  const filteredClasses = classes.filter((classItem) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      classItem.title?.toLowerCase().includes(query) ||
      classItem.instructor_name?.toLowerCase().includes(query) ||
      classItem.class_type?.toLowerCase().includes(query) ||
      classItem.description?.toLowerCase().includes(query)
    );
  });

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset search when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleClassClick = (classId: string) => {
    onClose();
    setSearchQuery("");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Search Panel */}
      <div
        data-search-panel
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-dark border-l border-gray-200 dark:border-gray-700 shadow-xl z-[70] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Search
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close search"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classes, instructors..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : searchQuery.trim() ? (
              filteredClasses.length > 0 ? (
                <div className="p-2">
                  <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Classes ({filteredClasses.length})
                  </div>
                  {filteredClasses.map((classItem) => (
                    <Link
                      key={classItem.id}
                      href={`/book-classes/${classItem.id}`}
                      onClick={() => handleClassClick(classItem.id)}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-1"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-dark dark:text-white truncate">
                            {classItem.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {classItem.instructor_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(classItem.scheduled_at)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              •
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTime(classItem.scheduled_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    No classes found
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Try a different search term
                  </p>
                </div>
              )
            ) : (
              <div className="p-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  Start typing to search
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Search for classes, instructors, or class types
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPanel;

