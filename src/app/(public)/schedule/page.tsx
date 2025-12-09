import { ScheduleHero, WeeklySchedule, ScheduleCTA } from "@/components/Schedule";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Schedule | Zumbaton",
  description: "Check out our weekly Zumba class schedule. Find the perfect class for your fitness level and join the dance fitness party!",
};

const SchedulePage = () => {
  return (
    <>
      <ScheduleHero />
      <WeeklySchedule />
      <ScheduleCTA />
    </>
  );
};

export default SchedulePage;
