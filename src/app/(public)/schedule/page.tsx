import { ScheduleHero, WeeklySchedule, ScheduleCTA } from "@/components/Schedule";
import ScheduleStructuredData from "@/components/Schedule/ScheduleStructuredData";
import {
  buildScheduleMetadataDescription,
  getPublicClasses,
} from "@/lib/classes-server";
import {
  formatYmdSingapore,
  getDefaultTrialBookingWeekRange,
} from "@/lib/trial-booking-dates";
import { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const classes = await getPublicClasses();

  return {
    title: "Class Schedule | One Step Fitness",
    description: buildScheduleMetadataDescription(classes),
  };
}

const SchedulePage = async () => {
  const initialWeekAnchor = formatYmdSingapore();
  const { from, to } = getDefaultTrialBookingWeekRange();
  const [weekClasses, allClasses] = await Promise.all([
    getPublicClasses({ from, to }),
    getPublicClasses(),
  ]);

  return (
    <>
      <ScheduleStructuredData classes={allClasses} />
      <ScheduleHero />
      <WeeklySchedule
        initialClasses={weekClasses}
        initialWeekAnchor={initialWeekAnchor}
      />
      <ScheduleCTA />
    </>
  );
};

export default SchedulePage;
