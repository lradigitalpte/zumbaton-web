import { InstructorsHero, InstructorsTabs } from "@/components/Instructors";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Instructors | Zumbaton",
  description: "Meet our expert certified Zumba instructors. Passionate professionals bringing energy and expertise to every class.",
};

const InstructorsPage = () => {
  return (
    <>
      <InstructorsHero />
      <InstructorsTabs />
    </>
  );
};

export default InstructorsPage;
