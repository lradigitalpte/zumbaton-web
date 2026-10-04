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
    title: "Book $30 1-for-1 Promo | One Step Fitness",
    description: buildScheduleMetadataDescription(classes).replace(
      "weekly schedule",
      "sessions eligible for our $30 1-for-1 promo"
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
