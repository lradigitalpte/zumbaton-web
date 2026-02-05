// Zumba class types data
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
    image: "/images/landing2.png",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "400-600",
    instructor: "Coach Lavs",
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
    name: "ZUMBATON",
    shortDescription: "A high-energy Zumba Step workout elevated for added intensity and calorie burn. Blends fun, easy-to-follow Zumba choreography with step movements for a full-body workout.",
    fullDescription: "A high-energy Zumba Step workout elevated for added intensity and calorie burn. This class blends fun, easy-to-follow Zumba choreography with step movements, delivering a full-body workout that feels more like a party than exercise.",
    image: "/images/landing3.jpg",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "500-700",
    instructor: "Coach Lavs",
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
    slug: "zumbuddies",
    name: "ZUMBUDDIES",
    shortDescription: "Fun and energetic Zumba classes designed especially for kids! Dance, play, and get fit while making new friends in a safe, supportive environment.",
    fullDescription: "ZUMBUDDIES is our special Zumba program for kids, combining fun dance moves with games and activities designed to keep children active, healthy, and happy. Each class is packed with energy, creativity, and age-appropriate choreography that kids love. It's the perfect way for children to develop coordination, confidence, and a love for movement in a party-like atmosphere!",
    image: "/images/images/zumbakids.png",
    featured: true,
    duration: "60 min",
    intensity: "Beginner",
    calories: "200-300",
    instructor: "Coach Lavs",
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
  }
];

export const getClassBySlug = (slug: string): ZumbaClass | undefined => {
  return zumbaClasses.find((c) => c.slug === slug);
};

export const getFeaturedClasses = (): ZumbaClass[] => {
  return zumbaClasses.filter((c) => c.featured);
};
