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
    slug: "zumba-fitness",
    name: "Zumba Fitness",
    shortDescription: "The original Zumba class! A total workout combining Latin and international music with dance moves for a fun, effective cardio session.",
    fullDescription: "Zumba Fitness is the flagship program that started it all. This exhilarating dance-fitness class combines Latin and international music with easy-to-follow dance moves, creating a dynamic, effective workout system. The routines feature aerobic interval training with a combination of fast and slow rhythms to tone and sculpt your body. Experience an absolute blast of calories-burning, body-energizing moves meant to engage and captivate for life!",
    image: "/images/images/image1.jpg",
    featured: true,
    duration: "60 min",
    intensity: "All Levels",
    calories: "400-600",
    instructor: "Maria Garcia",
    highlights: [
      {
        title: "Full Body Cardio Workout",
        description: "Burn calories and improve cardiovascular health with non-stop movement and energetic dance routines."
      },
      {
        title: "Easy-to-Follow Choreography",
        description: "No dance experience needed! Our instructors break down moves so everyone can join in the fun."
      },
      {
        title: "Latin & International Rhythms",
        description: "Dance to salsa, merengue, cumbia, reggaeton, and more exciting music from around the world."
      },
      {
        title: "Mood-Boosting Experience",
        description: "Release endorphins and reduce stress while having the time of your life on the dance floor."
      },
      {
        title: "Community & Connection",
        description: "Join a supportive community of dancers who motivate and inspire each other every class."
      },
      {
        title: "Calorie-Burning Results",
        description: "Burn 400-600 calories per class while having so much fun you won't even realize you're working out."
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
    slug: "zumba-toning",
    name: "Zumba Toning",
    shortDescription: "Add lightweight toning sticks to your Zumba workout for targeted muscle sculpting and enhanced cardio benefits.",
    fullDescription: "Zumba Toning combines the incredible Zumba party with targeted body-sculpting exercises using lightweight toning sticks. This class adds resistance training to the Zumba formula, helping you strengthen and tone your arms, core, and lower body while burning fat. The toning sticks act like maracas, adding rhythm to your workout while increasing calorie burn and muscle definition.",
    image: "/images/images/image2z.jpg",
    featured: false,
    duration: "55 min",
    intensity: "Intermediate",
    calories: "350-550",
    instructor: "Carlos Martinez",
    highlights: [
      {
        title: "Targeted Muscle Sculpting",
        description: "Use toning sticks to work specific muscle groups including arms, abs, glutes, and thighs."
      },
      {
        title: "Enhanced Calorie Burn",
        description: "The added resistance increases your metabolic rate for more effective fat burning."
      },
      {
        title: "Improved Muscle Definition",
        description: "Build lean muscle mass while enjoying the Zumba dance fitness experience."
      },
      {
        title: "Core Strengthening",
        description: "Every movement engages your core for better posture and a stronger midsection."
      },
      {
        title: "Fun with Maracas Effect",
        description: "The toning sticks shake like maracas, adding rhythm and fun to your workout."
      },
      {
        title: "Full Body Transformation",
        description: "Combine cardio and strength training for complete body transformation results."
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
    slug: "zumba-gold",
    name: "Zumba Gold",
    shortDescription: "A lower-intensity version perfect for active older adults, beginners, or those needing modifications.",
    fullDescription: "Zumba Gold takes the popular Zumba formula and modifies the moves and pacing to suit the needs of active older adults, beginners, or those looking for a lower-intensity workout. It's the same exhilarating, effective workout, just at a gentler pace. You'll still get all the fitness benefits while building cardiovascular health, improving coordination, and having a blast!",
    image: "/images/images/image3z.jpg",
    featured: false,
    duration: "45 min",
    intensity: "Beginner",
    calories: "250-400",
    instructor: "Ana Rodriguez",
    highlights: [
      {
        title: "Lower Impact Movements",
        description: "Modified choreography that's easier on joints while still providing effective exercise."
      },
      {
        title: "Improved Balance & Coordination",
        description: "Gentle movements help improve stability and reduce fall risk in daily life."
      },
      {
        title: "Social & Fun Atmosphere",
        description: "Connect with others in a supportive, judgment-free environment."
      },
      {
        title: "Cardiovascular Health",
        description: "Keep your heart healthy with moderate aerobic exercise set to great music."
      },
      {
        title: "Flexibility Enhancement",
        description: "Increase range of motion and flexibility through varied dance movements."
      },
      {
        title: "Mental Sharpness",
        description: "Learning choreography helps keep your mind active and engaged."
      }
    ],
    schedule: [
      { day: "Monday", time: "9:00 AM" },
      { day: "Wednesday", time: "10:00 AM" },
      { day: "Friday", time: "9:00 AM" }
    ]
  },
  {
    id: "4",
    slug: "zumba-kids",
    name: "Zumba Kids",
    shortDescription: "Kid-friendly dance parties packed with specially choreographed routines for children ages 7-11.",
    fullDescription: "Zumba Kids classes are rockin', high-energy dance parties packed with specially choreographed, kid-friendly routines and all the music kids love! We break down the steps, add games and activities, and help kids explore rhythm and movement while building healthy fitness habits. It's the ultimate dance experience for young Zumba fans!",
    image: "/images/images/zumba kids1.jpg",
    featured: true,
    duration: "45 min",
    intensity: "All Levels",
    calories: "200-350",
    instructor: "Sofia Lopez",
    highlights: [
      {
        title: "Age-Appropriate Choreography",
        description: "Fun, simple moves designed specifically for children ages 7-11."
      },
      {
        title: "Games & Activities",
        description: "Interactive games mixed with dance to keep kids engaged and entertained."
      },
      {
        title: "Builds Healthy Habits",
        description: "Introduce children to fitness in a fun way that creates lifelong healthy habits."
      },
      {
        title: "Boosts Confidence",
        description: "Kids gain self-esteem as they learn new moves and perform with their peers."
      },
      {
        title: "Develops Coordination",
        description: "Improve motor skills, balance, and body awareness through dance."
      },
      {
        title: "Social Skills",
        description: "Learn teamwork and make friends in a positive, energetic environment."
      }
    ],
    schedule: [
      { day: "Tuesday", time: "4:00 PM" },
      { day: "Thursday", time: "4:00 PM" },
      { day: "Saturday", time: "9:00 AM" }
    ]
  },
  {
    id: "5",
    slug: "aqua-zumba",
    name: "Aqua Zumba",
    shortDescription: "Take the Zumba party to the pool! A low-impact, high-energy aquatic exercise that's perfect for all fitness levels.",
    fullDescription: "Aqua Zumba blends the Zumba philosophy with water resistance for a low-impact, high-energy aquatic exercise. Perfect for all ages and fitness levels, Aqua Zumba is a pool party like no other! The water creates natural resistance, making every move more challenging while being gentle on your joints. Splash, dance, and have a blast while getting an incredible workout!",
    image: "/images/images/image4z.jpg",
    featured: false,
    duration: "50 min",
    intensity: "All Levels",
    calories: "300-500",
    instructor: "Luis Hernandez",
    highlights: [
      {
        title: "Zero Joint Impact",
        description: "Water buoyancy eliminates stress on joints, perfect for those with injuries or arthritis."
      },
      {
        title: "Natural Water Resistance",
        description: "Every movement works against water resistance for effective muscle toning."
      },
      {
        title: "Refreshing Workout",
        description: "Stay cool while working out hard - perfect for hot summer days!"
      },
      {
        title: "Full Body Engagement",
        description: "Water resistance engages more muscles than land-based exercises."
      },
      {
        title: "Great for Recovery",
        description: "Ideal for athletes in recovery or anyone returning to fitness after injury."
      },
      {
        title: "Pool Party Vibes",
        description: "Experience the most fun you can have in the pool while getting fit!"
      }
    ],
    schedule: [
      { day: "Monday", time: "8:00 AM" },
      { day: "Wednesday", time: "7:00 PM" },
      { day: "Friday", time: "8:00 AM" }
    ]
  },
  {
    id: "6",
    slug: "strong-nation",
    name: "STRONG Nation™",
    shortDescription: "A high-intensity workout combining bodyweight exercises, muscle conditioning, and cardio synced to original music.",
    fullDescription: "STRONG Nation™ combines high-intensity interval training with the science of Synced Music Motivation. Every squat, lunge, and burpee is synced to original music specifically designed to match every move, driving you to push harder to hit every beat. This isn't dancing—it's a revolutionary workout where music and moves sync in perfect harmony to push you past your limits.",
    image: "/images/images/image1.jpg",
    featured: true,
    duration: "60 min",
    intensity: "Advanced",
    calories: "500-800",
    instructor: "Carlos Martinez",
    highlights: [
      {
        title: "Music-Synced Movements",
        description: "Every exercise is perfectly synced to the beat for maximum motivation and results."
      },
      {
        title: "HIIT Training",
        description: "High-intensity intervals maximize calorie burn and boost metabolism for hours after class."
      },
      {
        title: "No Dance Required",
        description: "Focus on athletic moves like squats, lunges, and planks - no choreography to remember."
      },
      {
        title: "Build Strength & Endurance",
        description: "Combine cardio and strength training for complete fitness transformation."
      },
      {
        title: "Burn Up to 800 Calories",
        description: "One of the highest calorie-burning workouts available in group fitness."
      },
      {
        title: "Challenge Yourself",
        description: "Push past your limits and discover strength you never knew you had."
      }
    ],
    schedule: [
      { day: "Tuesday", time: "6:00 PM" },
      { day: "Thursday", time: "6:00 PM" },
      { day: "Saturday", time: "8:00 AM" }
    ]
  }
];

export const getClassBySlug = (slug: string): ZumbaClass | undefined => {
  return zumbaClasses.find((c) => c.slug === slug);
};

export const getFeaturedClasses = (): ZumbaClass[] => {
  return zumbaClasses.filter((c) => c.featured);
};
