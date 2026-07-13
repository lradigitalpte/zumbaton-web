import TrialBookingClient from "./TrialBookingClient";
import ScheduleStructuredData from "@/components/Schedule/ScheduleStructuredData";
import {
  buildScheduleMetadataDescription,
  getPublicClasses,
} from "@/lib/classes-server";
import { getDefaultTrialBookingWeekRange } from "@/lib/trial-booking-dates";
import { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { from, to } = getDefaultTrialBookingWeekRange();
  const classes = await getPublicClasses({ from, to });

  return {
    title: "Book a Trial Class | One Step Fitness",
    description: buildScheduleMetadataDescription(classes).replace(
      "weekly schedule",
      "available trial classes"
    ),
  };
}

export default async function TrialBookingPage() {
  const { from, to } = getDefaultTrialBookingWeekRange();
  const initialClasses = await getPublicClasses({ from, to });

  return (
    <>
      <ScheduleStructuredData classes={initialClasses} />
      <TrialBookingClient initialClasses={initialClasses} />
    </>
  );
}
