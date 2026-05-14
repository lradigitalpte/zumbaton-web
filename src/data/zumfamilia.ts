export type ZumFamiliaPackageId = "1c1a" | "1c2a" | "2c1a" | "2c2a" | "test";

export interface ZumFamiliaPackage {
  id: ZumFamiliaPackageId;
  slug: ZumFamiliaPackageId;
  name: string;
  shortDescription: string;
  fullDescription: string;
  priceCents: number;
  highlights: {
    title: string;
    description: string;
  }[];
}

export const zumFamiliaPackages: ZumFamiliaPackage[] = [
  {
    id: "1c1a",
    slug: "1c1a",
    name: "1 Child + 1 Adult",
    shortDescription:
      "Perfect pair package for one child and one parent to bond through guided dance fitness.",
    fullDescription:
      "This package is ideal for a one-to-one bonding session between one child and one parent. The class focuses on connection, rhythm, and fun movement patterns designed for mixed-age participation in a safe and supportive environment.",
    priceCents: 3800,
    highlights: [
      {
        title: "Bonding Through Movement",
        description: "Parent and child move together with guided routines designed to build trust and confidence.",
      },
      {
        title: "Beginner Friendly",
        description: "No dance background required. Steps are easy to follow and paced for all levels.",
      },
      {
        title: "One-Time Purchase",
        description: "Simple one-off purchase model with no package rollover or membership requirement.",
      },
    ],
  },
  {
    id: "1c2a",
    slug: "1c2a",
    name: "1 Child + 2 Adults",
    shortDescription:
      "Bring two adults to support one child for a fun family session focused on teamwork and joy.",
    fullDescription:
      "Designed for households where two adults join one child, this package creates a dynamic class experience with more support and interaction. Great for parents, guardians, or grandparents joining in together.",
    priceCents: 5600,
    highlights: [
      {
        title: "Family Teamwork",
        description: "Encourages collaboration and group rhythm between one child and two adults.",
      },
      {
        title: "High-Energy Experience",
        description: "More group movement patterns and partner switches keep sessions fresh and engaging.",
      },
      {
        title: "Structured Fun",
        description: "Instructor-led choreography balances cardio, play, and coordination development.",
      },
    ],
  },
  {
    id: "2c1a",
    slug: "2c1a",
    name: "2 Children + 1 Adult",
    shortDescription:
      "A sibling-friendly setup where one adult guides two children through a lively bonding workout.",
    fullDescription:
      "Built for one adult with two children, this package supports sibling participation while keeping everyone engaged. Activities are planned to maintain attention, build confidence, and encourage positive shared experiences.",
    priceCents: 5800,
    highlights: [
      {
        title: "Sibling-Friendly Format",
        description: "Routine structure supports two kids learning together at the same pace.",
      },
      {
        title: "Confidence Building",
        description: "Games and choreography are designed to help children feel expressive and capable.",
      },
      {
        title: "Meaningful Family Time",
        description: "Turns workout time into quality bonding time with guided dance play.",
      },
    ],
  },
  {
    id: "2c2a",
    slug: "2c2a",
    name: "2 Children + 2 Adults",
    shortDescription:
      "The complete family package where two adults and two children train together in one energetic class.",
    fullDescription:
      "Designed for bigger family groups, this package allows two adults and two children to join one guided One Familia session together. It combines bonding, movement, and teamwork in a fun format that keeps everyone active and engaged.",
    priceCents: 7600,
    highlights: [
      {
        title: "Full Family Experience",
        description: "Two adults and two children can participate together in one coordinated class session.",
      },
      {
        title: "Stronger Family Bonding",
        description: "Shared routines and partner work create meaningful interaction across the whole family.",
      },
      {
        title: "One-Time Flexible Booking",
        description: "Simple one-time purchase with no subscription commitment required.",
      },
    ],
  },
];

export const getZumFamiliaPackage = (id: string): ZumFamiliaPackage | undefined =>
  zumFamiliaPackages.find((pkg) => pkg.id === id);

/**
 * True if a scheduled class row should appear on One Familia booking (matches schedule page naming).
 * DB titles may use "One Familia + …" while older rows used "ZumFamilia".
 */
export function isOneFamiliaScheduledClass(title: string, classType: string): boolean {
  const t = (title || "").toLowerCase();
  const c = (classType || "").toLowerCase();
  if (t.includes("zumfamilia") || c.includes("zumfamilia")) return true;
  if (t.includes("one familia") || t.replace(/\s+/g, "").includes("onefamilia")) return true;
  if (c.includes("one_familia") || c.includes("one-familia") || c.replace(/\s+/g, "").includes("onefamilia")) {
    return true;
  }
  return false;
}
