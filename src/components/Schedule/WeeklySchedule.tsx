"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import LoadingIcon from "@/components/Common/LoadingIcon";

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
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`/api/classes/public`);
        const result = await response.json();

        if (result.success && result.data) {
          const scheduledClasses = result.data.filter((cls: any) => cls.status === 'scheduled');
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

  const scheduleByDay = useMemo(() => {
    const grouped: Record<string, { date: Date; classes: Class[] }> = {};
    
    classes.forEach((cls) => {
      const scheduledDate = new Date(cls.scheduled_at);
      const dateKey = scheduledDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: scheduledDate,
          classes: [],
        };
      }
      grouped[dateKey].classes.push(cls);
    });

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
      <section className="py-32 bg-[#f6f4ee] dark:bg-black">
        <div className="container flex flex-col items-center justify-center min-h-[400px]">
          <LoadingIcon size="md" showLabel />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-20"
        >
          <div className="text-lime-600 dark:text-lime-400 font-black text-sm md:text-base uppercase tracking-[0.3em] mb-4 md:mb-6">
            Weekly Schedule
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-6 md:mb-8">
            WE HAVE STEP <br />
            <span className="text-lime-500 underline decoration-4 underline-offset-8">AEROBICS CLASSES</span>
          </h2>
          <p className="max-w-2xl text-gray-600 dark:text-zinc-400 text-base md:text-xl font-medium uppercase tracking-tight">
            Find a dance fitness class that feels like your own. Beginner-friendly, feel-good classes throughout the week. 
            Your pace. Your progress. One Step Fitness.
          </p>
        </motion.div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-2xl">
          {scheduleByDay.map((daySchedule, index) => (
            <DayColumn 
              key={daySchedule.date.toISOString()} 
              daySchedule={daySchedule} 
              index={index} 
              formatTime={formatTime} 
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 md:mt-16 flex flex-wrap items-center gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 pt-8 md:pt-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-lime-500 border border-black/10"></div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Regular Classes</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-black dark:bg-zinc-800 border border-white/10"></div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Special Events</span>
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/3 h-full bg-lime-500/5 skew-x-12 -z-10 pointer-events-none"></div>
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
  const dayName = daySchedule.date.toLocaleDateString('en-US', { weekday: 'short' });
  const dateStr = daySchedule.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isToday = new Date().toDateString() === daySchedule.date.toDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`flex flex-col bg-[#f6f4ee] dark:bg-zinc-950 min-h-0 md:min-h-[400px] border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 last:border-b-0 md:last:border-r-0 ${isToday ? "ring-2 ring-lime-500 ring-inset z-10" : ""}`}
    >
      {/* Day Header */}
      <div className={`py-6 md:py-8 px-4 text-center border-b border-black/10 dark:border-white/10 ${
        isToday ? "bg-lime-500 text-black" : "bg-black text-white dark:bg-zinc-900"
      }`}>
        <h4 className="font-black text-2xl md:text-3xl uppercase italic tracking-tighter leading-none mb-1 md:mb-2">{dayName}</h4>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">{dateStr}</p>
      </div>

      {/* Classes */}
      <div className="flex flex-col flex-1">
        {daySchedule.classes.length > 0 ? (
          daySchedule.classes.map((classItem) => (
            <ClassCard 
              key={classItem.id} 
              classItem={classItem}
              formatTime={formatTime}
            />
          ))
        ) : (
          <div className="p-6 md:p-8 flex-1 flex items-center justify-center text-center opacity-30 grayscale">
            <p className="text-[10px] font-black uppercase tracking-widest">No Classes</p>
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
    <div className="p-4 md:p-6 border-b border-black/5 dark:border-white/5 hover:bg-lime-500/10 transition-colors duration-300 group cursor-default">
      {/* Time */}
      <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 mb-2 md:mb-3 flex items-center gap-2">
        <span className="w-3 md:w-4 h-[1px] bg-lime-500"></span>
        {timeString}
      </div>
      
      {/* Class Name */}
      <div className="font-black text-gray-900 dark:text-white mb-2 md:mb-3 text-lg md:text-xl leading-tight uppercase italic tracking-tighter group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
        {classItem.title}
      </div>
      
      {/* Instructor */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 md:w-6 md:h-6 bg-zinc-200 dark:bg-zinc-800 border border-black/10 dark:border-white/10 overflow-hidden rounded-none">
          {/* Small placeholder for instructor avatar if needed */}
        </div>
        <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">
          {instructorName}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
