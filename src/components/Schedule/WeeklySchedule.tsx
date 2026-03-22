"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";

interface Class {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  instructor_name: string | null;
  class_type: string;
  recurrence_type?: string;
  recurrence_pattern?: any;
}

const WeeklySchedule = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Fetch all available classes from the same endpoint as trial booking
        const response = await fetch(`/api/classes/public`);
        const result = await response.json();

        if (result.success && result.data) {
          // Only get scheduled classes
          const scheduledClasses = result.data.filter((cls: any) => cls.status === 'scheduled');
          
          // Sort by date and time (same as trial booking page)
          scheduledClasses.sort(
            (a: Class, b: Class) =>
              new Date(a.scheduled_at).getTime() -
              new Date(b.scheduled_at).getTime()
          );

          setClasses(scheduledClasses);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Group classes by date (not day of week) to show actual schedule
  const scheduleByDay = useMemo(() => {
    const grouped: Record<string, { date: Date; classes: Class[] }> = {};
    
    classes.forEach((cls) => {
      const scheduledDate = new Date(cls.scheduled_at);
      // Use date string as key (e.g., "2026-02-06")
      const dateKey = scheduledDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: scheduledDate,
          classes: [],
        };
      }
      
      grouped[dateKey].classes.push(cls);
    });

    // Sort by date and return as array - show next 7 days
    return Object.entries(grouped)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => value)
      .slice(0, 7);
  }, [classes]);

  const formatTime = (dateString: string, durationMinutes: number) => {
    const start = new Date(dateString);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    const startTime = start.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Singapore',
    });
    
    const endTime = end.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Singapore',
    });
    
    return `${startTime} - ${endTime}`;
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading schedule...</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-green-600 dark:text-green-500 font-semibold text-sm uppercase tracking-wide mb-3">
            Weekly Schedule
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            We Have Step Aerobics Classes for Everyone
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find a dance fitness class that feels like your own. Beginner-friendly, feel-good classes throughout the week. 
            Your pace. Your dance. Your Zumbaton.
          </p>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {scheduleByDay.map((daySchedule, index) => (
            <DayColumn key={daySchedule.date.toISOString()} daySchedule={daySchedule} index={index} formatTime={formatTime} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Regular Classes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

interface DaySchedule {
  date: Date;
  classes: Class[];
}

const DayColumn = ({ 
  daySchedule, 
  index,
  formatTime,
}: { 
  daySchedule: DaySchedule; 
  index: number;
  formatTime: (dateString: string, durationMinutes: number) => string;
}) => {
  const columnRef = useRef(null);
  const isInView = useInView(columnRef, { once: true, margin: "-50px" });

  const dayName = daySchedule.date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = daySchedule.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isWeekend = daySchedule.date.getDay() === 0 || daySchedule.date.getDay() === 6;

  return (
    <motion.div
      ref={columnRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col"
    >
      {/* Day Header */}
      <div className={`py-4 px-3 text-center rounded-t-lg ${
        isWeekend 
          ? "bg-lime-500 text-white" 
          : "bg-green-600 text-white"
      }`}>
        <h4 className="font-bold text-lg">{dayName}</h4>
        <p className="text-sm opacity-90">{dateStr}</p>
      </div>

      {/* Classes */}
      <div className="flex flex-col gap-2 mt-2">
        {daySchedule.classes.length > 0 ? (
          daySchedule.classes.map((classItem) => (
            <ClassCard 
              key={classItem.id} 
              classItem={classItem}
              formatTime={formatTime}
            />
          ))
        ) : (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center text-gray-400 text-sm">
            No classes
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ClassCard = ({ 
  classItem,
  formatTime,
}: { 
  classItem: Class;
  formatTime: (dateString: string, durationMinutes: number) => string;
}) => {
  const timeString = formatTime(classItem.scheduled_at, classItem.duration_minutes);
  const instructorName = classItem.instructor_name || 'TBA';

  return (
    <div
      className="p-4 rounded-lg transition-all duration-300 hover:scale-105 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 cursor-default"
    >
      {/* Time */}
      <div className="text-sm font-semibold mb-1 text-green-600 dark:text-green-500">
        {timeString}
      </div>
      
      {/* Class Name */}
      <div className="font-bold text-gray-900 dark:text-white mb-2 text-sm leading-tight">
        {classItem.title}
      </div>
      
      {/* Instructor */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {instructorName}
      </div>
    </div>
  );
};

export default WeeklySchedule;
