import { ClassesHero, ClassesGrid, ClassesCTA } from "@/components/Classes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dance Fitness Classes | One Step Fitness",
  description: "Explore One Step Fitness classes including Zumba Step, Groove Stepper, ThunderBolt, Lil Steppers, ZumFiesta, and One Familia.",
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
