"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { PublicClass } from "@/lib/classes-server";
import {
  formatMonthYearLabel,
  formatYmdSingapore,
  getMonthCalendarGrid,
  monthRangeFromYmd,
  parseYmd,
  toSingaporeYmdFromIso,
  WEEKDAY_LABELS,
} from "@/lib/trial-booking-dates";

type ScheduleClass = Pick<
  PublicClass,
  | "id"
  | "title"
  | "scheduled_at"
  | "duration_minutes"
  | "instructor_name"
  | "is_outdoor"
>;

interface ScheduleMonthCalendarProps {
  monthAnchorYmd: string;
  classes: ScheduleClass[];
  formatTime: (dateString: string, durationMinutes: number) => string;
  onViewWeek?: (ymd: string) => void;
}

function formatClassStartTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore",
  });
}

export default function ScheduleMonthCalendar({
  monthAnchorYmd,
  classes,
  formatTime,
  onViewWeek,
}: ScheduleMonthCalendarProps) {
  const todayYmd = formatYmdSingapore();
  const { from: monthFrom, to: monthTo } = useMemo(
    () => monthRangeFromYmd(monthAnchorYmd),
    [monthAnchorYmd]
  );

  const classesByDay = useMemo(() => {
    return classes.reduce<Record<string, ScheduleClass[]>>((acc, cls) => {
      const key = toSingaporeYmdFromIso(cls.scheduled_at);
      if (!acc[key]) acc[key] = [];
      acc[key].push(cls);
      return acc;
    }, {});
  }, [classes]);

  const defaultSelectedDay = useMemo(() => {
    if (todayYmd >= monthFrom && todayYmd <= monthTo) return todayYmd;
    const firstWithClasses = Object.keys(classesByDay).sort()[0];
    if (firstWithClasses) return firstWithClasses;
    return monthFrom;
  }, [todayYmd, monthFrom, monthTo, classesByDay]);

  const [selectedDayYmd, setSelectedDayYmd] = useState(defaultSelectedDay);

  useEffect(() => {
    setSelectedDayYmd(defaultSelectedDay);
  }, [defaultSelectedDay, monthAnchorYmd]);

  const gridCells = useMemo(
    () => getMonthCalendarGrid(monthAnchorYmd),
    [monthAnchorYmd]
  );

  const selectedDayClasses = classesByDay[selectedDayYmd] || [];
  const monthClassCount = classes.length;
  const activeDaysCount = Object.keys(classesByDay).length;

  const selectedDayLabel = parseYmd(selectedDayYmd).toLocaleDateString("en-SG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Month summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-black text-white dark:bg-zinc-950 px-5 py-4 border border-black/10 dark:border-white/10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-500 mb-1">
            {formatMonthYearLabel(monthAnchorYmd)}
          </p>
          <p className="text-sm font-bold uppercase tracking-wide text-white/80">
            {monthClassCount} {monthClassCount === 1 ? "class" : "classes"} across {activeDaysCount}{" "}
            {activeDaysCount === 1 ? "day" : "days"}
          </p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
          Tap a day for details
        </p>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-black/10 dark:border-white/10 bg-[#f6f4ee] dark:bg-zinc-950">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-400"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {gridCells.map((cell) => {
            const dayClasses = classesByDay[cell.ymd] || [];
            const isToday = cell.ymd === todayYmd;
            const isSelected = cell.ymd === selectedDayYmd;
            const isPast = cell.ymd < todayYmd;
            const dayNum = cell.date.getDate();

            return (
              <button
                key={cell.ymd}
                type="button"
                onClick={() => setSelectedDayYmd(cell.ymd)}
                className={`relative min-h-[72px] sm:min-h-[100px] md:min-h-[120px] p-2 sm:p-3 text-left border-b border-r border-black/5 dark:border-white/5 transition-colors ${
                  !cell.inCurrentMonth
                    ? "bg-zinc-100/80 dark:bg-zinc-950/50 opacity-40"
                    : isSelected
                      ? "bg-lime-500/15 ring-2 ring-lime-500 ring-inset z-10"
                      : isToday
                        ? "bg-lime-500/5"
                        : "bg-[#f6f4ee] dark:bg-zinc-950 hover:bg-lime-500/10"
                } ${isPast && cell.inCurrentMonth ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span
                    className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center text-xs sm:text-sm font-black ${
                      isToday
                        ? "bg-lime-500 text-black"
                        : isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayClasses.length > 0 && (
                    <span className="shrink-0 bg-lime-500 text-black text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider">
                      {dayClasses.length}
                    </span>
                  )}
                </div>

                <div className="hidden sm:block space-y-1">
                  {dayClasses.slice(0, 2).map((cls) => (
                    <p
                      key={cls.id}
                      className="text-[9px] md:text-[10px] font-bold uppercase tracking-tight leading-tight text-gray-700 dark:text-zinc-300 line-clamp-2"
                    >
                      <span className="text-lime-600 dark:text-lime-400">
                        {formatClassStartTime(cls.scheduled_at)}
                      </span>{" "}
                      {cls.title}
                    </p>
                  ))}
                  {dayClasses.length > 2 && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      +{dayClasses.length - 2} more
                    </p>
                  )}
                </div>

                {dayClasses.length > 0 && (
                  <div className="sm:hidden flex gap-0.5 mt-1 flex-wrap">
                    {dayClasses.slice(0, 4).map((cls) => (
                      <span
                        key={cls.id}
                        className={`h-1.5 w-1.5 rounded-full ${
                          cls.is_outdoor ? "bg-green-500" : "bg-lime-500"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDayYmd}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-xl overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-black/10 dark:border-white/10 bg-black text-white dark:bg-zinc-950">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-500 mb-1">
                Selected Day
              </p>
              <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
                {selectedDayLabel}
              </h3>
            </div>
            {onViewWeek && (
              <button
                type="button"
                onClick={() => onViewWeek(selectedDayYmd)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
              >
                View Week
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedDayClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {selectedDayClasses.map((classItem) => (
                <MonthClassCard
                  key={classItem.id}
                  classItem={classItem}
                  formatTime={formatTime}
                />
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-gray-500 dark:text-zinc-400 font-black uppercase tracking-widest text-sm">
                No classes on this day
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MonthClassCard({
  classItem,
  formatTime,
}: {
  classItem: ScheduleClass;
  formatTime: (dateString: string, durationMinutes: number) => string;
}) {
  const timeString = formatTime(classItem.scheduled_at, classItem.duration_minutes);
  const instructorName = classItem.instructor_name || "TBA";

  return (
    <div className="p-5 border-b border-r border-black/5 dark:border-white/5 hover:bg-lime-500/10 transition-colors group">
      <div className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 mb-2 flex items-center gap-2">
        <span className="w-4 h-[1px] bg-lime-500" />
        {timeString}
      </div>
      <h4 className="font-black text-gray-900 dark:text-white text-lg uppercase italic tracking-tighter leading-tight mb-2 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
        {classItem.title}
        {classItem.is_outdoor && (
          <span className="ml-2 align-middle inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-green-500 text-white rounded-sm not-italic">
            Outdoors
          </span>
        )}
      </h4>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">
        {instructorName}
      </p>
    </div>
  );
}
