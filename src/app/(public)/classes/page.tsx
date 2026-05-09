import { ClassesHero, ClassesGrid, ClassesCTA } from "@/components/Classes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dance Fitness Classes | One Step Fitness",
  description: "Explore One Step Fitness adult dance fitness classes including Groove Stepper, Zumba Step, and ThunderBolt Full Body Workout.",
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
