import { ClassesHero, ClassesGrid, ClassesCTA } from "@/components/Classes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dance Fitness Classes | One Step Fitness",
  description:
    "Explore One Step Fitness adult classes: Groove Stepper, Zumba Step, and Thunderbolt (bodyweight & steppers or resistance & dance).",
};

const ClassesPage = () => {
  return (
    <>
      <ClassesHero />
      <ClassesGrid />
      <ClassesCTA />
    </>
  );
};

export default ClassesPage;
