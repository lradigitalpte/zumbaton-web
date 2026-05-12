"use client";

import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";

// FAQ Data
const faqCategories = [
  {
    id: "about",
    name: "About the Classes",
    questions: [
      {
        q: "What is One Step Fitness (ZT)?",
        a: "One Step Fitness is a high-energy dance fitness program inspired by cardio-dance movements, combining cardio, rhythm, and fun choreography to help you stay active while enjoying the music."
      },
      {
        q: "Do I need dance experience to join?",
        a: "Not at all! One Step Fitness classes are designed for everyone — beginners to experienced dancers. Just follow along and move at your own pace."
      },
      {
        q: "What kind of music is used in ZT classes?",
        a: "Our classes feature a dynamic mix of music styles including K-pop, EDM, Latin, Pop, Bollywood, Hip-hop, and global beats, keeping every workout energetic, fun, and exciting."
      }
    ]
  },
  {
    id: "fitness",
    name: "Fitness & Requirements",
    questions: [
      {
        q: "What fitness level is required?",
        a: "All fitness levels are welcome. You can modify movements to suit your comfort and ability."
      },
      {
        q: "Is One Step Fitness suitable for beginners?",
        a: "Yes! Beginners are encouraged to join. Our instructors guide you through the routines and ensure a welcoming environment."
      },
      {
        q: "What should I wear or bring?",
        a: "Covered shoes (no boots) are required for all sessions. We recommend comfortable activewear, supportive sneakers, a towel, and bottled water for hydration."
      }
    ]
  },
  {
    id: "signups",
    name: "Sign-Ups & Packages",
    questions: [
      {
        q: "How do I sign up for classes?",
        a: "Click “Join Now” in the navigation or on our homepage, pricing, or schedule pages to get started via WhatsApp. You can also browse class schedules and booking info on our website."
      },
      {
        q: "Are there packages available?",
        a: "Yes. We offer single-class passes and multi-class token packages. Check our Pricing page or Instagram for details. Use “Join Now” to get started via WhatsApp."
      },
      {
        q: "Can I cancel or reschedule a class?",
        a: "Yes. Cancel at least 24 hours before the class to have your token returned to your account. Late cancellations and no-shows result in the token being forfeited. See our Terms of Service and Refund Policy for full details."
      }
    ]
  },
  {
    id: "community",
    name: "Community & Safety",
    questions: [
      {
        q: "Is One Step Fitness suitable for all ages?",
        a: "Most classes are suitable for adults of all ages. Age-specific classes or guidelines will be stated where applicable. For example: Kids will have to be supervised by a guardian/parent."
      },
      {
        q: "What if I have an injury or medical condition?",
        a: "Please consult your doctor before joining and inform the instructor prior to class so modifications can be suggested."
      }
    ]
  }
];

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState("signups");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const activeQuestions = faqCategories.find(c => c.id === activeCategory)?.questions || [];

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black relative overflow-hidden">
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="text-lime-600 dark:text-lime-400 font-black text-sm md:text-base uppercase tracking-[0.3em] mb-6">
            FAQ
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-8">
            EVERYTHING YOU <br />
            <span className="text-lime-500 underline decoration-4 underline-offset-8">NEED TO KNOW</span>
          </h2>
          <p className="max-w-2xl text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-medium uppercase tracking-tight">
            Have questions about our token packages, classes, or account? Find answers here or reach out to our support team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Category Tabs - 4 Columns */}
          <div className="lg:col-span-4 space-y-4">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setOpenQuestion(null);
                }}
                className={`w-full text-left px-8 py-6 rounded-none font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 border ${
                  activeCategory === category.id
                    ? "bg-black text-white border-black dark:bg-lime-500 dark:text-black dark:border-lime-500 shadow-xl" 
                    : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-black/10 dark:border-white/10 hover:border-lime-500"
                }`}
              >
                {category.name}
              </button>
            ))}
            
            {/* Still have questions CTA embedded in sidebar */}
            <div className="mt-12 p-8 bg-lime-500 text-black rounded-none border border-black/10 shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">
                STILL HAVE <br /> QUESTIONS?
              </h3>
              <p className="text-sm font-bold uppercase tracking-tight mb-8 opacity-80">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-70 transition-opacity"
              >
                GET HELP NOW
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Questions Accordion - 8 Columns */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {activeQuestions.map((item, index) => (
                  <FAQItem
                    key={`${activeCategory}-${index}`}
                    question={item.q}
                    answer={item.a}
                    isOpen={openQuestion === `${activeCategory}-${index}`}
                    onClick={() => setOpenQuestion(
                      openQuestion === `${activeCategory}-${index}` ? null : `${activeCategory}-${index}`
                    )}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-lime-500/5 -skew-x-12 -z-10 pointer-events-none"></div>
    </section>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}

const FAQItem = ({ question, answer, isOpen, onClick, index }: FAQItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-none overflow-hidden hover:border-lime-500 transition-colors duration-300"
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-8 text-left transition-all duration-300 ${
          isOpen ? "bg-black text-white dark:bg-zinc-800" : "text-gray-900 dark:text-white"
        }`}
      >
        <span className="font-black text-lg md:text-xl uppercase italic tracking-tighter pr-8">{question}</span>
        <div className={`shrink-0 w-8 h-8 flex items-center justify-center border ${isOpen ? "border-lime-500 bg-lime-500 text-black" : "border-black/10 dark:border-white/10"}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-0 bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-base md:text-lg font-medium leading-relaxed">
              <div className="pt-8 border-t border-black/5 dark:border-white/5">
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQSection;
