/** Site photography — real studio/community shots + step-board product imagery */
export const SITE_IMAGES = {
  /** Wide step-board shot — strong for heroes and LCP */
  heroPrimary: "/images/studio/wide-studio-step-boards-1.png",
  heroCarousel: [
    "/images/studio/wide-studio-step-boards-1.png",
    "/images/community/studio-neon-group-four.jpg",
    "/images/community/studio-neon-piloxing-five.jpg",
  ] as const,
  heroSecondary: "/images/studio/studio-step-boards-4.png",
  heroTertiary: "/images/studio/studio-step-boards-5.png",
  heroAlt: "/images/studio/studio-step-boards-6.png",
  /** Real members at the One Step Fitness neon wall */
  communityGroupFour: "/images/community/studio-neon-group-four.jpg",
  communityPiloxing: "/images/community/studio-neon-piloxing-five.jpg",
  communityGroupFive: "/images/community/studio-neon-group-five.jpg",
  communityClass: "/images/community/studio-neon-class.jpg",
  communityTribe: "/images/community/studio-neon-tribe.jpg",
  communityEnergy: "/images/community/studio-neon-energy.jpg",
  /** @deprecated use communityGroupFour — kept for existing imports */
  communityMirrorSelfie: "/images/community/studio-neon-group-four.jpg",
  /** Outdoor / OCBC Arena step-board sessions */
  outdoorPrimary: "/images/outdoor/group-step-board-3.png",
  outdoorSecondary: "/images/outdoor/turquoise-step-board-2.png",
  outdoorAccent: "/images/outdoor/athletic-step-platforms-1.png",
} as const;
