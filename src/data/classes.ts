// Dance fitness class types data
export interface ZumbaClass {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  featured: boolean;
  duration: string;
  intensity: "Beginner" | "Intermediate" | "Advanced" | "All Levels" | "Level 5";
  calories: string;
  instructor: string;
  energy: number;
  highlights: {
    title: string;
    description: string;
  }[];
  schedule: {
    day: string;
    time: string;
  }[];
}

/** Bookable Thunderbolt formats (category = Thunderbolt; two distinct classes). */
export const THUNDERBOLT_CLASS_SLUGS = [
  "thunderbolt-bodyweight-steppers",
  "thunderbolt-resistance-dance",
] as const;

export function isThunderboltClassSlug(slug: string): boolean {
  return (THUNDERBOLT_CLASS_SLUGS as readonly string[]).includes(slug);
}

export const CLASS_ENERGY: Record<string, number> = {
  "groove-stepper": 1.5,
  "zumba-step": 2.5,
  "lil-steppers": 1,
  "thunderbolt-bodyweight-steppers": 4,
  "thunderbolt-resistance-dance": 4,
  piloxing: 3,
  "thunderbolt-tabata-outdoor": 4,
  zumfiesta: 4,
  "one-familia": 1,
};

export const zumbaClasses: ZumbaClass[] = [
  {
    id: "1",
    slug: "groove-stepper",
    name: "Groove Stepper Synchronized Dance",
    shortDescription:
      "Synchronized stepper choreography that moves as one unit. Learn clean formations, timing, and groove while building endurance and lower-body strength.",
    fullDescription:
      "Groove Stepper Synchronized Dance blends structured stepper choreography with group synchronization. Led by Robert and Micky, each session trains you to hit counts together—formations, timing, and musicality—while elevating cardio and lower-body strength. Expect precise step work, dance-driven flow, and a team energy that makes every routine feel like a performance.",
    image: "/OSF%20IMAGES/ZT3.jpg",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "400-600",
    instructor: "Robert & Micky",
    energy: 1.5,
    highlights: [
      {
        title: "Synchronized Formations",
        description: "Train timing and spatial awareness so the whole class moves as one clean unit.",
      },
      {
        title: "Stepper Strength & Stamina",
        description: "Step patterns target quads, glutes, and calves while building lasting endurance.",
      },
      {
        title: "Dance-Led Cardio",
        description: "Choreography keeps your heart rate high without sacrificing groove or musicality.",
      },
      {
        title: "Robert & Micky Coaching",
        description: "Learn from a coaching duo that focuses on clarity, energy, and performance-ready sync.",
      },
      {
        title: "Vibrant Music Mix",
        description:
          "Afrobeats, EDM, R&B, Hip-Hop, K-Pop, Bollywood, Salsa, and Reggaeton keep every session fresh.",
      },
    ],
    schedule: [
      { day: "Monday", time: "10:00 AM" },
      { day: "Wednesday", time: "6:00 PM" },
      { day: "Saturday", time: "11:30 AM" },
    ],
  },
  {
    id: "2",
    slug: "zumba-step",
    name: "Zumba Step",
    shortDescription: "High-energy step cardio that hits like a party. Pure energy, maximum movement.",
    fullDescription: "A high-energy step aerobics workout elevated for added intensity and calorie burn. This class blends fun, easy-to-follow dance choreography with step movements, delivering a full-body workout that feels more like a party than exercise.",
    image: "/images/hero/hero2.jpeg",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "500-700",
    instructor: "Robert",
    energy: 2.5,
    highlights: [
      {
        title: "High-Calorie Burn",
        description: "Elevated intensity means maximum calorie burn, making this one of our most effective fat-burning classes."
      },
      {
        title: "Full-Body Cardio Workout",
        description: "Engage your entire body with dynamic movements that work your arms, core, legs, and cardiovascular system."
      },
      {
        title: "Improves Rhythm and Agility",
        description: "Step movements combined with dance routines enhance your rhythm, coordination, and overall agility."
      },
      {
        title: "Suitable for All Fitness Levels",
        description: "Instructors provide modifications so everyone can participate and progress at their own pace."
      },
      {
        title: "Party-Like Atmosphere",
        description: "Experience a workout that feels like a celebration - energetic, fun, and incredibly motivating."
      },
      {
        title: "Vibrant Music Mix",
        description: "Both classes feature a vibrant mix of music genres which includes Afrobeats, EDM, R&B, Hip-Hop, K-Pop, Bollywood, Salsa, and Reggaeton, ensuring every session is energetic, engaging, and never repetitive."
      }
    ],
    schedule: [
      { day: "Tuesday", time: "9:00 AM" },
      { day: "Thursday", time: "5:30 PM" },
      { day: "Saturday", time: "10:00 AM" }
    ]
  },
  {
    id: "3",
    slug: "lil-steppers",
    name: "Lil Steppers",
    shortDescription: "Fun and energetic dance fitness classes designed especially for kids! Dance, play, and get fit while making new friends in a safe, supportive environment.",
    fullDescription: "Lil Steppers is our special dance fitness program for kids, combining fun dance moves with games and activities designed to keep children active, healthy, and happy. Each class is packed with energy, creativity, and age-appropriate choreography that kids love. It's the perfect way for children to develop coordination, confidence, and a love for movement in a party-like atmosphere!",
    image: "/images/hero/kids1.png",
    featured: true,
    duration: "60 min",
    intensity: "Beginner",
    calories: "200-300",
    instructor: "Laavania",
    energy: 1,
    highlights: [
      {
        title: "Kid-Friendly Choreography",
        description: "Simple, fun dance moves designed specifically for children to follow and enjoy."
      },
      {
        title: "Builds Confidence and Social Skills",
        description: "Kids make friends, express themselves, and gain confidence through dance and group activities."
      },
      {
        title: "Develops Coordination and Motor Skills",
        description: "Dancing helps children improve balance, coordination, and overall physical development."
      },
      {
        title: "Promotes Healthy Habits",
        description: "Introduces kids to fitness in a fun way, establishing healthy habits that last a lifetime."
      },
      {
        title: "Safe and Supportive Environment",
        description: "Our instructors create a welcoming space where every child feels included and encouraged."
      },
      {
        title: "Energetic Kid-Friendly Music",
        description: "Fun, upbeat music that kids love, featuring popular songs and catchy rhythms perfect for young dancers."
      }
    ],
    schedule: [
      { day: "Wednesday", time: "4:00 PM" },
      { day: "Saturday", time: "9:00 AM" }
    ]
  },
  {
    id: "4",
    slug: "thunderbolt-bodyweight-steppers",
    name: "Thunderbolt · Bodyweight & Steppers",
    shortDescription:
      "High-intensity Tabata rounds on the step. Explosive bodyweight power combined with stepper agility for maximum calorie burn and afterburn.",
    fullDescription:
      "Thunderbolt (Bodyweight & Steppers) is our signature high-intensity Tabata format led by Coach Robert. By pushing your body into the anaerobic zone with short bursts of maximum effort, you'll spike your metabolism and benefit from the 'afterburn effect' long after the session ends. The stepper adds a powerful lower-body focus on quads, glutes, and calves, while forcing balance, timing, and rhythm. It's a time-efficient, explosive workout designed to improve your VO2 max and mental toughness in record time.",
    image: "/images/hero/notbad.jpeg",
    featured: true,
    duration: "60 min",
    intensity: "Level 5",
    calories: "500-800",
    instructor: "Coach Robert",
    energy: 4,
    highlights: [
      {
        title: "Fat Loss & Afterburn",
        description: "High-intensity intervals spike your metabolism, burning calories hours after the workout ends.",
      },
      {
        title: "Full-Body Conditioning",
        description: "Stepper focus targets quads, glutes, and calves, with arm combos for complete body toning.",
      },
      {
        title: "Cardio & Stamina Fast",
        description: "Proven to improve VO2 max and cardiovascular efficiency significantly in a short time.",
      },
      {
        title: "Coordination & Agility",
        description: "The stepper board forces balance, timing, and rhythm for better neuromuscular control.",
      },
      {
        title: "Explosive Power",
        description: "Activates fast-twitch muscle fibers, improving speed, reaction time, and athleticism.",
      },
      {
        title: "Mental Toughness",
        description: "Teaches discipline under fatigue and focus in short bursts, leaving you with a post-workout rush.",
      },
    ],
    schedule: [
      { day: "Tuesday", time: "7:00 PM" },
      { day: "Friday", time: "7:30 PM" },
      { day: "Sunday", time: "10:30 AM" },
    ],
  },
  {
    id: "5",
    slug: "thunderbolt-resistance-dance",
    name: "Thunderbolt · Resistance & Dance",
    shortDescription:
      "Full-body strength and endurance. Alternates between high-energy dance cardio and structured resistance band training.",
    fullDescription:
      "Thunderbolt (Resistance & Dance) is a high-output format led by Coach Fizah that prioritizes strength and endurance over pure cardio. The session alternates between different genres of music, Latin-inspired dance cardio, and structured resistance training using bands. This combination ensures you build lean muscle and stamina simultaneously. Ideal for those who want a floor-based Thunderbolt experience without steppers, focusing on full-body flow and resistance-based intervals.",
    image: "/images/hero/hero2.jpeg",
    featured: true,
    duration: "60 min",
    intensity: "Level 5",
    calories: "500-800",
    instructor: "Coach Fizah",
    energy: 4,
    highlights: [
      {
        title: "Strength + Endurance",
        description: "Designed to build functional strength using resistance bands rather than just burning cardio.",
      },
      {
        title: "Dance-Led Cardio",
        description: "Alternates between song genres and dance segments to keep the heart rate high and energy peaking.",
      },
      {
        title: "Structured Resistance",
        description: "Uses resistance bands to add load and variety across upper, lower, and core muscle groups.",
      },
      {
        title: "No Steppers Required",
        description: "A floor-based format that delivers Thunderbolt intensity through rhythm and resistance.",
      },
      {
        title: "Interval Training",
        description: "Tabata-style timing helps you push hard through strength blocks with brief, active recovery.",
      },
    ],
    schedule: [
      { day: "Monday", time: "7:30 PM" },
      { day: "Thursday", time: "7:00 PM" },
      { day: "Saturday", time: "9:30 AM" },
    ],
  },
  {
    id: "6",
    slug: "piloxing",
    name: "Piloxing",
    shortDescription:
      "A high-energy HIIT fusion of Pilates, boxing, and dance. Build core strength, burn calories, and find your balance in one powerful session.",
    fullDescription:
      "Piloxing is the ultimate high-intensity fusion workout that blends the power and speed of boxing with the sculpting and flexibility of Pilates, all tied together with fun dance cardio. This HIIT-style session is designed to challenge your core, improve endurance, and boost your agility. Led by Coach Fizah, it's a stress-relieving, full-body workout that leaves you feeling strong, toned, and empowered.",
    image: "/OSF%20IMAGES/piloxing04.jpg",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "400-600",
    instructor: "Coach Fizah",
    energy: 3,
    highlights: [
      {
        title: "Pilates + Boxing + Dance",
        description:
          "The perfect trifecta of strength, power, and cardio in one seamless, high-energy flow.",
      },
      {
        title: "Core & Stability",
        description:
          "Pilates-based movements target your deep core for better posture, balance, and flexibility.",
      },
      {
        title: "Cardio Endurance",
        description:
          "Boxing rounds keep your heart rate high, maximizing calorie burn and cardiovascular health.",
      },
      {
        title: "Stress Relief",
        description:
          "Punch away the stress with powerful boxing combinations and empowering music.",
      },
      {
        title: "Coach Fizah",
        description:
          "Fizah leads this fusion format with expert cues for both boxing power and Pilates precision.",
      },
    ],
    schedule: [
      { day: "Wednesday", time: "7:30 PM" },
      { day: "Sunday", time: "9:00 AM" },
    ],
  },
];

export const getClassBySlug = (slug: string): ZumbaClass | undefined => {
  if (slug === "thunderbolt-full-body-workout") {
    return zumbaClasses.find((c) => c.slug === "thunderbolt-bodyweight-steppers");
  }
  return zumbaClasses.find((c) => c.slug === slug);
};

export const getFeaturedClasses = (): ZumbaClass[] => {
  return zumbaClasses.filter((c) => c.featured);
};
