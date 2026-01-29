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
        // Fetch classes for the next 7 days to build a weekly view
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const response = await fetch(`/api/classes/public`);
        const result = await response.json();

        if (result.success && result.data) {
          // Filter to only scheduled classes in the next week
          const now = new Date();
          const weekFromNow = new Date(now);
          weekFromNow.setDate(now.getDate() + 7);
          
          const upcomingClasses = result.data.filter((cls: any) => {
            const scheduledAt = new Date(cls.scheduled_at);
            return scheduledAt >= now && scheduledAt <= weekFromNow && cls.status === 'scheduled';
          });

          setClasses(upcomingClasses);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Group classes by day of week
  const scheduleByDay = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedule: Record<string, Class[]> = {};
    
    days.forEach(day => {
      schedule[day] = [];
    });

    classes.forEach((cls) => {
      const scheduledDate = new Date(cls.scheduled_at);
      const dayOfWeek = days[scheduledDate.getDay()];
      
      if (schedule[dayOfWeek]) {
        schedule[dayOfWeek].push(cls);
      }
    });

    // Sort classes within each day by time
    days.forEach(day => {
      schedule[day].sort((a, b) => {
        const timeA = new Date(a.scheduled_at).getTime();
        const timeB = new Date(b.scheduled_at).getTime();
        return timeA - timeB;
      });
    });

    return days.map(day => ({
      day,
      classes: schedule[day],
    }));
  }, [classes]);

  const formatTime = (dateString: string, durationMinutes: number) => {
    const start = new Date(dateString);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    const startTime = start.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const endTime = end.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
            Weekly Timetable
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            We Have Zumba Step Class for Everyone
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find a Zumba class that feels like your own. Beginner-friendly, feel-good classes throughout the week. 
            Your pace. Your dance. Your Zumbaton.
          </p>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {scheduleByDay.map((daySchedule, index) => (
            <DayColumn key={daySchedule.day} daySchedule={daySchedule} index={index} formatTime={formatTime} />
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
  day: string;
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

  const isWeekend = daySchedule.day === "Saturday" || daySchedule.day === "Sunday";

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
        <h4 className="font-bold text-lg">{daySchedule.day}</h4>
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
