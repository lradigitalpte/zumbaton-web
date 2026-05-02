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
  intensity: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  calories: string;
  instructor: string;
  highlights: {
    title: string;
    description: string;
  }[];
  schedule: {
    day: string;
    time: string;
  }[];
}

export const zumbaClasses: ZumbaClass[] = [
  {
    id: "1",
    slug: "groove-stepper",
    name: "Groove Stepper",
    shortDescription: "Structured dance routines performed using steppers to enhance movement, coordination, and strength. Perfect for those who enjoy learning choreography while improving endurance.",
    fullDescription: "This class focuses on structured dance routines performed using steppers to enhance movement, coordination, and strength. Each session combines rhythm, precision, and cardio, making it perfect for those who enjoy learning choreography while improving endurance and lower-body strength.",
    image: "/images/hero/hero.jpeg",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "400-600",
    instructor: "Laavania",
    highlights: [
      {
        title: "Improves Coordination and Balance",
        description: "Master structured choreography while enhancing your coordination and balance with stepper movements."
      },
      {
        title: "Builds Leg Strength and Stamina",
        description: "Step exercises target your lower body, building strength and endurance in your legs and glutes."
      },
      {
        title: "Boosts Cardiovascular Fitness",
        description: "Continuous movement and dance routines provide an excellent cardio workout that gets your heart pumping."
      },
      {
        title: "Great for Dance-Based Workouts",
        description: "Perfect for those who love combining dance with fitness in a structured, groove-based format."
      },
      {
        title: "Vibrant Music Mix",
        description: "Both classes feature a vibrant mix of music genres which includes Afrobeats, EDM, R&B, Hip-Hop, K-Pop, Bollywood, Salsa, and Reggaeton, ensuring every session is energetic, engaging, and never repetitive."
      }
    ],
    schedule: [
      { day: "Monday", time: "10:00 AM" },
      { day: "Wednesday", time: "6:00 PM" },
      { day: "Saturday", time: "11:30 AM" }
    ]
  },
  {
    id: "2",
    slug: "zumbaton",
    name: "Zumba Step",
    shortDescription: "A high-energy step aerobics workout elevated for added intensity and calorie burn. Blends fun, easy-to-follow dance choreography with step movements for a full-body workout.",
    fullDescription: "A high-energy step aerobics workout elevated for added intensity and calorie burn. This class blends fun, easy-to-follow dance choreography with step movements, delivering a full-body workout that feels more like a party than exercise.",
    image: "/images/hero/hero2.jpeg",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "500-700",
    instructor: "Robert",
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
    image: "/images/hero/kids.png",
    featured: true,
    duration: "60 min",
    intensity: "Beginner",
    calories: "200-300",
    instructor: "Laavania",
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
    slug: "thunderbolt-full-body-workout",
    name: "ThunderBolt Full Body Workout",
    shortDescription: "A Tabata-style full-body stepper workout using short, high-intensity intervals to build stamina, burn calories, and improve strength in less time.",
    fullDescription: "ThunderBolt Full Body Workout is our Tabata-inspired class that combines explosive intervals with stepper board movement. You will alternate between high-intensity work and short recovery to challenge both cardio and strength, while improving coordination, rhythm, and agility. It is designed for members who want an efficient, powerful session with visible results.",
    image: "/images/hero/notbad.jpeg",
    featured: true,
    duration: "45-60 min",
    intensity: "Intermediate",
    calories: "500-800",
    instructor: "Laavania",
    highlights: [
      {
        title: "Afterburn for Fat Loss",
        description: "Tabata intervals can keep your body burning calories after class through excess post-exercise oxygen consumption."
      },
      {
        title: "Full-Body Conditioning",
        description: "Stepper patterns and interval blocks train legs, core, and upper-body coordination in one session."
      },
      {
        title: "Improves Cardio and Stamina",
        description: "High-effort rounds help improve VO2 max, endurance, and overall cardiovascular fitness."
      },
      {
        title: "Builds Power and Agility",
        description: "Fast-twitch muscle recruitment supports explosive movement, better reaction speed, and athletic control."
      },
      {
        title: "Time-Efficient Workout",
        description: "A focused 45-60 minute class delivers high training quality for busy schedules."
      },
      {
        title: "High-Energy Music Experience",
        description: "Driven by motivating music and coaching cues to keep intensity high and class engagement strong."
      }
    ],
    schedule: [
      { day: "Tuesday", time: "7:00 PM" },
      { day: "Friday", time: "7:30 PM" },
      { day: "Sunday", time: "10:30 AM" }
    ]
  }
];

export const getClassBySlug = (slug: string): ZumbaClass | undefined => {
  return zumbaClasses.find((c) => c.slug === slug);
};

export const getFeaturedClasses = (): ZumbaClass[] => {
  return zumbaClasses.filter((c) => c.featured);
};
