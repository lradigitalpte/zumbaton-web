"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Schedule data - Zumba focused classes
const scheduleData = [
  {
    day: "Sunday",
    classes: [
      { time: "09:00 - 10:00", name: "Zumba Basics", instructor: "Maria Garcia" },
      { time: "11:30 - 12:30", name: "Zumba Gold", instructor: "Ana Rodriguez" },
      { time: "17:00 - 18:00", name: "Zumba Fitness", instructor: "Carlos Martinez" },
    ],
  },
  {
    day: "Monday",
    classes: [
      { time: "08:00 - 09:00", name: "Aqua Zumba", instructor: "Sofia Lopez" },
      { time: "10:00 - 11:00", name: "Zumba Toning", instructor: "Maria Garcia" },
      { time: "18:00 - 19:00", name: "Zumba Step", instructor: "Luis Hernandez" },
    ],
  },
  {
    day: "Tuesday",
    classes: [
      { time: "07:30 - 08:30", name: "Zumba Strong", instructor: "Carlos Martinez" },
      { time: "12:00 - 13:00", name: "Zumba Kids", instructor: "Ana Rodriguez" },
      { time: "17:30 - 18:30", name: "Zumba Sentao", instructor: "Maria Garcia" },
    ],
  },
  {
    day: "Wednesday",
    classes: [
      { time: "09:00 - 10:00", name: "Zumba Fitness", instructor: "Sofia Lopez" },
      { time: "12:30 - 13:30", name: "Zumba Gold", instructor: "Ana Rodriguez" },
      { time: "18:00 - 19:00", name: "Zumba Circuit", instructor: "Luis Hernandez" },
    ],
  },
  {
    day: "Thursday",
    classes: [
      { time: "08:00 - 09:00", name: "Zumba Basics", instructor: "Maria Garcia" },
      { time: "11:00 - 12:00", name: "Zumba Toning", instructor: "Carlos Martinez" },
      { time: "17:00 - 18:00", name: "Zumba Strong", instructor: "Sofia Lopez" },
    ],
  },
  {
    day: "Friday",
    classes: [
      { time: "07:00 - 08:00", name: "Aqua Zumba", instructor: "Ana Rodriguez" },
      { time: "10:00 - 11:00", name: "Zumba Step", instructor: "Luis Hernandez" },
      { time: "18:30 - 19:30", name: "Zumba Party", instructor: "Maria Garcia" },
    ],
  },
  {
    day: "Saturday",
    classes: [
      { time: "09:00 - 10:00", name: "Zumba Kids Jr", instructor: "Ana Rodriguez" },
      { time: "11:30 - 12:30", name: "Zumba Fitness", instructor: "Carlos Martinez" },
      { time: "16:00 - 17:30", name: "Mega Zumba Party", instructor: "All Instructors" },
    ],
  },
];

const WeeklySchedule = () => {
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
          {scheduleData.map((daySchedule, index) => (
            <DayColumn key={daySchedule.day} daySchedule={daySchedule} index={index} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Regular Classes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-lime-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Special Events</span>
          </div>
        </div>
      </div>
    </section>
  );
};

interface DaySchedule {
  day: string;
  classes: {
    time: string;
    name: string;
    instructor: string;
  }[];
}

const DayColumn = ({ daySchedule, index }: { daySchedule: DaySchedule; index: number }) => {
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
        {daySchedule.classes.map((classItem, classIndex) => (
          <ClassCard 
            key={classIndex} 
            classItem={classItem} 
            isSpecial={classItem.name.includes("Party") || classItem.name.includes("Mega")}
          />
        ))}
      </div>
    </motion.div>
  );
};

interface ClassItem {
  time: string;
  name: string;
  instructor: string;
}

const ClassCard = ({ classItem, isSpecial }: { classItem: ClassItem; isSpecial: boolean }) => {
  return (
    <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer ${
      isSpecial 
        ? "bg-lime-500/10 dark:bg-lime-500/20 border border-lime-500/30 dark:border-lime-500/40 hover:bg-lime-500/20 dark:hover:bg-lime-500/30" 
        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
    }`}>
      {/* Time */}
      <div className={`text-sm font-semibold mb-1 ${
        isSpecial ? "text-lime-600 dark:text-lime-400" : "text-green-600 dark:text-green-500"
      }`}>
        {classItem.time}
      </div>
      
      {/* Class Name */}
      <div className="font-bold text-gray-900 dark:text-white mb-1">
        {classItem.name}
      </div>
      
      {/* Instructor */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {classItem.instructor}
      </div>
    </div>
  );
};

export default WeeklySchedule;
