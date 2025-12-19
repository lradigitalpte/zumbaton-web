"use client";

import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";

// FAQ Data
const faqCategories = [
  {
    id: "membership",
    name: "Membership & Plans",
    questions: [
      {
        q: "What token packages do you offer?",
        a: "We offer flexible token packages starting from 5 tokens up to 50-token bundles. Tokens can be used for any class, any time, with no expiration. The more tokens you buy, the better the value."
      },
      {
        q: "How do I purchase tokens?",
        a: "You can purchase tokens directly through the Zumbaton website portal or at the studio. First-time members get a welcome discount. Tokens are instantly added to your account."
      },
      {
        q: "Can I share my tokens with family or friends?",
        a: "Tokens are linked to your personal account. However, we offer family packages where family members can have their own accounts and get discounted rates together."
      },
      {
        q: "Can I pause my membership or tokens?",
        a: "Token packages have an expiration date listed at purchase, but once you book a class with a token, that token doesn't expire. You can use booked tokens anytime, even after your package expires!"
      },
      {
        q: "Do you have referral bonuses?",
        a: "Yes! Refer a friend and both of you get bonus tokens. Share your referral code in the app and start earning rewards!"
      }
    ]
  },
  {
    id: "classes",
    name: "Classes & Schedule",
    questions: [
      {
        q: "What types of Zumba classes do you offer?",
        a: "We offer Zumba Fitness, Zumba Toning, Zumba Gold (low-impact), and Aqua Zumba. Check our schedule in the app to see class times and find what works best for you."
      },
      {
        q: "How do I book a class?",
        a: "Simply open the Zumbaton web portal, browse available classes, and tap 'Book Class'. Use tokens to reserve your spot. Cancel up to 2 hours before class if plans change."
      },
      {
        q: "Do I need dance experience?",
        a: "Not at all! Zumba is for everyone. Our certified instructors provide modifications for all levels. Come as you are and have fun!"
      },
      {
        q: "Can I try a class for free?",
        a: "Yes! New members get a free trial class. No token needed. Just sign up in the app and choose your first class."
      },
      {
        q: "What if I need to cancel my booking?",
        a: "You can cancel from the app up to 2 hours before class. Your token will be returned to your account. No cancellation fees!"
      }
    ]
  },
  {
    id: "account",
    name: "Account & Support",
    questions: [
      {
        q: "How do I reset my password?",
        a: "Tap 'Forgot Password' on the login screen and enter your email. You'll receive a reset link. Create a new password and you're back in!"
      },
      {
        q: "How do I view my class history?",
        a: "Go to 'My Profile' → 'Class History' to see all your past and upcoming classes. You can also see your progress and favorite instructors."
      },
      {
        q: "Can I update my payment method?",
        a: "Yes! Go to 'Settings' → 'Payment Methods' to add or update your card. Your information is secure and encrypted."
      },
      {
        q: "How do I contact support?",
        a: "Tap the help icon in the app or email us at hello@zumbaton.com. Our team responds within 24 hours."
      },
      {
        q: "Is my personal data safe?",
        a: "Absolutely! We use industry-standard encryption to protect your data. Read our Privacy Policy in the app for details."
      }
    ]
  }
];

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState("membership");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  const activeQuestions = faqCategories.find(c => c.id === activeCategory)?.questions || [];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 dark:bg-green-500/3 rounded-full blur-3xl -z-10"></div>
      
      <div className="container relative z-10 px-3 sm:px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            FAQ
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Everything You Need to Know About Zumbaton
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/70">
            Have questions about our token packages, classes, or account? Find answers here or reach out to our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setOpenQuestion(null);
                }}
                className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40" 
                    : "bg-white dark:bg-gray-800/50 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-white/20"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Questions Accordion */}
          <div className="space-y-3 sm:space-y-4">
            {activeQuestions.map((item, index) => (
              <FAQItem
                key={index}
                question={item.q}
                answer={item.a}
                isOpen={openQuestion === `${activeCategory}-${index}`}
                onClick={() => setOpenQuestion(
                  openQuestion === `${activeCategory}-${index}` ? null : `${activeCategory}-${index}`
                )}
                index={index}
              />
            ))}
          </div>

          {/* Still have questions CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 p-8 sm:p-10 md:p-12 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-white/20 text-center shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-white/70 mb-8 max-w-2xl mx-auto text-sm sm:text-base">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help you get started on your fitness journey!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 sm:py-4 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-600/40 hover:scale-105 shadow-md"
            >
              Get Help Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
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
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-white/20"
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-5 sm:p-6 md:p-7 text-left transition-all duration-300 ${
          isOpen 
            ? "bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white shadow-lg" 
            : "bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/70"
        }`}
      >
        <span className={`font-semibold text-sm sm:text-base pr-4 ${isOpen ? "text-white" : ""}`}>{question}</span>
        <svg 
          className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 md:p-7 bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-white/80 text-sm sm:text-base leading-relaxed border-t border-gray-200 dark:border-white/15">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQSection;
