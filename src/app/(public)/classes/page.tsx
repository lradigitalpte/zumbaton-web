import { ClassesHero, ClassesGrid, ClassesCTA } from "@/components/Classes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dance Fitness Classes | Zumbaton",
  description: "Explore our range of dance fitness classes — from high-energy dance parties to low-impact sessions. Find the perfect class for your vibe!",
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
