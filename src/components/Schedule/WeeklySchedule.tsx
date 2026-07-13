"use client";

import { motion } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import LoadingIcon from "@/components/Common/LoadingIcon";
import ScheduleMonthCalendar from "@/components/Schedule/ScheduleMonthCalendar";
import type { PublicClass } from "@/lib/classes-server";
import {
  addDaysToYmd,
  formatMonthYearLabel,
  formatWeekRangeLabel,
  formatYmdLocal,
  formatYmdSingapore,
  getWeekDayYmds,
  monthRangeFromYmd,
  parseYmd,
  toSingaporeYmdFromIso,
  weekRangeFromAnchorYmd,
} from "@/lib/trial-booking-dates";

type ScheduleClass = Pick<
  PublicClass,
  | "id"
  | "title"
  | "scheduled_at"
  | "duration_minutes"
  | "instructor_name"
  | "class_type"
  | "recurrence_type"
  | "recurrence_pattern"
  | "is_outdoor"
>;

type ViewMode = "week" | "month";

interface WeeklyScheduleProps {
  initialClasses?: ScheduleClass[];
  initialWeekAnchor?: string;
}

const WeeklySchedule = ({
  initialClasses = [],
  initialWeekAnchor = formatYmdSingapore(),
}: WeeklyScheduleProps) => {
  const [classes, setClasses] = useState<ScheduleClass[]>(initialClasses);
  const [loading, setLoading] = useState(initialClasses.length === 0);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekAnchorYmd, setWeekAnchorYmd] = useState(initialWeekAnchor);
  const [monthAnchorYmd, setMonthAnchorYmd] = useState(initialWeekAnchor);
  const sectionRef = useRef(null);
  const skipInitialFetch = useRef(initialClasses.length > 0);

  const activeRange = useMemo(() => {
    if (viewMode === "week") {
      return weekRangeFromAnchorYmd(weekAnchorYmd);
    }
    return monthRangeFromYmd(monthAnchorYmd);
  }, [viewMode, weekAnchorYmd, monthAnchorYmd]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!skipInitialFetch.current) {
        setLoading(true);
      }

      try {
        const { from, to } = activeRange;
        const response = await fetch(`/api/classes/public?from=${from}&to=${to}`);
        const result = await response.json();

        if (result.success && result.data) {
          const scheduledClasses = (result.data as ScheduleClass[]).sort(
            (a, b) =>
              new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
          );
          setClasses(scheduledClasses);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
        skipInitialFetch.current = false;
      }
    };

    fetchClasses();
  }, [activeRange.from, activeRange.to]);

  const weekDaySchedules = useMemo(() => {
    const { from, to } = weekRangeFromAnchorYmd(weekAnchorYmd);
    const classesByDay = classes.reduce<Record<string, ScheduleClass[]>>((acc, cls) => {
      const key = toSingaporeYmdFromIso(cls.scheduled_at);
      if (!acc[key]) acc[key] = [];
      acc[key].push(cls);
      return acc;
    }, {});

    return getWeekDayYmds(from, to).map((ymd) => ({
      ymd,
      date: parseYmd(ymd),
      classes: classesByDay[ymd] || [],
    }));
  }, [classes, weekAnchorYmd]);

  const goToToday = () => {
    const today = formatYmdSingapore();
    setWeekAnchorYmd(today);
    setMonthAnchorYmd(today);
  };

  const shiftWeek = (delta: number) => {
    setWeekAnchorYmd((current) => addDaysToYmd(current, delta * 7));
  };

  const shiftMonth = (delta: number) => {
    setMonthAnchorYmd((current) => {
      const d = parseYmd(current);
      d.setMonth(d.getMonth() + delta, 1);
      return formatYmdLocal(d);
    });
  };

  const onPickDate = (value: string) => {
    if (!value) return;
    setWeekAnchorYmd(value);
    setMonthAnchorYmd(value);
  };

  const viewWeekForDay = (ymd: string) => {
    setWeekAnchorYmd(ymd);
    setViewMode("week");
  };

  const formatTime = (dateString: string, durationMinutes: number) => {
    const start = new Date(dateString);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const startTime = start.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Singapore",
    });

    const endTime = end.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Singapore",
    });

    return `${startTime} - ${endTime}`;
  };

  const rangeLabel =
    viewMode === "week"
      ? formatWeekRangeLabel(activeRange.from, activeRange.to)
      : formatMonthYearLabel(monthAnchorYmd);

  return (
    <section ref={sectionRef} className="py-10 md:py-16 bg-[#f6f4ee] dark:bg-black overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="mb-8 md:mb-12"
        >
          <div className="text-lime-600 dark:text-lime-400 font-black text-sm md:text-base uppercase tracking-[0.3em] mb-4 md:mb-6">
            Weekly Schedule
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-6 md:mb-8">
            WE HAVE STEP <br />
            <span className="text-lime-500 underline decoration-4 underline-offset-8">AEROBICS CLASSES</span>
          </h2>
          <p className="max-w-2xl text-gray-600 dark:text-zinc-400 text-base md:text-xl font-medium uppercase tracking-tight">
            Find a dance fitness class that feels like your own. Browse by week or month to plan ahead.
          </p>
        </motion.div>

        {/* Calendar controls */}
        <div className="mb-8 md:mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => (viewMode === "week" ? shiftWeek(-1) : shiftMonth(-1))}
              className="inline-flex items-center gap-2 px-4 py-3 bg-black text-white dark:bg-zinc-900 font-black uppercase tracking-widest text-[10px] hover:bg-lime-500 hover:text-black transition-colors"
              aria-label={viewMode === "week" ? "Previous week" : "Previous month"}
            >
              <ChevronLeft className="w-4 h-4" />
              {viewMode === "week" ? "Prev Week" : "Prev Month"}
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="px-4 py-3 bg-lime-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => (viewMode === "week" ? shiftWeek(1) : shiftMonth(1))}
              className="inline-flex items-center gap-2 px-4 py-3 bg-black text-white dark:bg-zinc-900 font-black uppercase tracking-widest text-[10px] hover:bg-lime-500 hover:text-black transition-colors"
              aria-label={viewMode === "week" ? "Next week" : "Next month"}
            >
              {viewMode === "week" ? "Next Week" : "Next Month"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 px-4 py-3">
              <Calendar className="w-4 h-4 text-lime-500 shrink-0" />
              <span className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                {rangeLabel}
              </span>
            </div>
            <label className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 px-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Jump to</span>
              <input
                type="date"
                value={viewMode === "week" ? weekAnchorYmd : monthAnchorYmd}
                onChange={(e) => onPickDate(e.target.value)}
                min={formatYmdSingapore()}
                className="bg-transparent text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-white outline-none"
              />
            </label>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {(["week", "month"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                if (mode === "month") {
                  setMonthAnchorYmd(weekAnchorYmd);
                }
                setViewMode(mode);
              }}
              className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                viewMode === mode
                  ? "bg-lime-500 text-black"
                  : "bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 hover:bg-lime-500/10"
              }`}
            >
              {mode === "week" ? "Week View" : "Month View"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10">
            <LoadingIcon size="md" showLabel />
          </div>
        ) : viewMode === "week" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-2xl">
            {weekDaySchedules.map((daySchedule, index) => (
              <DayColumn
                key={daySchedule.ymd}
                daySchedule={daySchedule}
                index={index}
                formatTime={formatTime}
              />
            ))}
          </div>
        ) : (
          <ScheduleMonthCalendar
            monthAnchorYmd={monthAnchorYmd}
            classes={classes}
            formatTime={formatTime}
            onViewWeek={viewWeekForDay}
          />
        )}

        <div className="mt-12 md:mt-16 flex flex-wrap items-center gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 pt-8 md:pt-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-lime-500 border border-black/10"></div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Regular Classes</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-black dark:bg-zinc-800 border border-white/10"></div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Special Events</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 border border-black/10"></div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Outdoors</span>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/3 h-full bg-lime-500/5 skew-x-12 -z-10 pointer-events-none"></div>
    </section>
  );
};

interface DaySchedule {
  ymd: string;
  date: Date;
  classes: ScheduleClass[];
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
  const dayName = daySchedule.date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "Asia/Singapore",
  });
  const dateStr = daySchedule.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Singapore",
  });
  const sgtDayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
  const isToday = sgtDayKey(new Date()) === daySchedule.ymd;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`flex flex-col bg-[#f6f4ee] dark:bg-zinc-950 min-h-0 md:min-h-[400px] border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 last:border-b-0 md:last:border-r-0 ${
        isToday ? "ring-2 ring-lime-500 ring-inset z-10" : ""
      }`}
    >
      <div
        className={`py-6 md:py-8 px-4 text-center border-b border-black/10 dark:border-white/10 ${
          isToday ? "bg-lime-500 text-black" : "bg-black text-white dark:bg-zinc-900"
        }`}
      >
        <h4 className="font-black text-2xl md:text-3xl uppercase italic tracking-tighter leading-none mb-1 md:mb-2">
          {dayName}
        </h4>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">{dateStr}</p>
      </div>

      <div className="flex flex-col flex-1">
        {daySchedule.classes.length > 0 ? (
          daySchedule.classes.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} formatTime={formatTime} />
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
  classItem: ScheduleClass;
  formatTime: (dateString: string, durationMinutes: number) => string;
}) => {
  const timeString = formatTime(classItem.scheduled_at, classItem.duration_minutes);
  const instructorName = classItem.instructor_name || "TBA";

  return (
    <div className="p-4 md:p-6 border-b border-r border-black/5 dark:border-white/5 hover:bg-lime-500/10 transition-colors duration-300 group cursor-default">
      <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 mb-2 md:mb-3 flex items-center gap-2">
        <span className="w-3 md:w-4 h-[1px] bg-lime-500"></span>
        {timeString}
      </div>

      <div className="font-black text-gray-900 dark:text-white mb-2 md:mb-3 text-lg md:text-xl leading-tight uppercase italic tracking-tighter group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
        {classItem.title}
        {classItem.is_outdoor && (
          <span className="ml-2 align-middle inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-green-500 text-white rounded-sm not-italic">
            Outdoors
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 md:w-6 md:h-6 bg-zinc-200 dark:bg-zinc-800 border border-black/10 dark:border-white/10 overflow-hidden rounded-none" />
        <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">
          {instructorName}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
