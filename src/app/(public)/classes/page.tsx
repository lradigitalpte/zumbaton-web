import { ClassesHero, ClassesGrid, ClassesCTA } from "@/components/Classes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zumba Classes | Zumbaton",
  description: "Explore our range of Zumba classes - from high-energy Zumba Fitness to relaxing Aqua Zumba. Find the perfect class for your fitness level!",
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
