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
        q: "What types of memberships do you offer?",
        a: "We offer flexible membership options including monthly, quarterly, and annual plans. We also have family packages and student discounts. Each plan includes unlimited access to all Zumba classes."
      },
      {
        q: "How can I join Zumbaton?",
        a: "Simply visit our studio or sign up online through our website. Our team will guide you through choosing the right membership plan for your fitness goals and schedule."
      },
      {
        q: "Do you offer free trial classes?",
        a: "Yes! We offer your first Zumba class completely free so you can experience the energy and fun before committing to a membership."
      },
      {
        q: "Can I freeze or pause my membership?",
        a: "Absolutely! Memberships can be paused for travel, medical reasons, or personal circumstances. Contact our front desk for details and we'll work with you."
      },
      {
        q: "Do you have referral bonuses?",
        a: "Yes! Members who refer friends receive special rewards including free months and exclusive merchandise. Ask about our 'Bring a Friend' program!"
      }
    ]
  },
  {
    id: "classes",
    name: "Classes & Training",
    questions: [
      {
        q: "What types of Zumba classes do you offer?",
        a: "We offer a variety including Zumba Fitness, Zumba Toning, Zumba Gold (low-impact), Zumba Kids, Aqua Zumba, and STRONG Nation™ for different fitness levels and preferences."
      },
      {
        q: "Do I need dance experience to join?",
        a: "Not at all! Zumba is designed for everyone, regardless of dance experience. Our instructors break down moves and provide modifications for all skill levels."
      },
      {
        q: "What should I wear to class?",
        a: "Wear comfortable workout clothes and supportive athletic shoes. Bring a water bottle and towel. Most importantly, bring your energy and enthusiasm!"
      },
      {
        q: "How many calories can I burn in a Zumba class?",
        a: "Depending on the class intensity and your effort level, you can burn between 400-800 calories per hour. It's one of the most effective and fun cardio workouts!"
      },
      {
        q: "Are classes suitable for beginners?",
        a: "Absolutely! All our classes welcome beginners. Instructors provide clear guidance and modifications. We recommend starting with Zumba Fitness or Zumba Gold classes."
      }
    ]
  },
  {
    id: "billing",
    name: "Billing & Policies",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards, bank transfers, and digital payment methods. Payments can be made in person or through our online member portal."
      },
      {
        q: "Can I get an invoice for my membership?",
        a: "Yes, every transaction includes a digital receipt, and you can request detailed invoices from our front desk or via email for personal or corporate reimbursement."
      },
      {
        q: "What is your cancellation policy?",
        a: "Memberships can be canceled with 14 days' notice. Refunds are prorated based on unused time. No cancellation fees for annual members after 3 months."
      },
      {
        q: "Are there any hidden fees?",
        a: "No hidden fees ever! Your membership fee covers unlimited classes. Optional add-ons like private sessions or merchandise are clearly priced separately."
      },
      {
        q: "How do I update my billing information?",
        a: "You can update your payment details anytime through your member dashboard online or by visiting our front desk during business hours."
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
    <section ref={sectionRef} className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setOpenQuestion(null);
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-dark-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Questions Accordion */}
          <div className="space-y-4">
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

          {/* Still have questions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center p-8 bg-gray-100 dark:bg-dark-2 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      className="border border-gray-200 dark:border-dark-2 rounded-xl overflow-hidden"
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
          isOpen 
            ? "bg-green-600 text-white" 
            : "bg-white dark:bg-dark-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark"
        }`}
      >
        <span className="font-semibold pr-4">{question}</span>
        <svg 
          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
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
            <div className="p-5 bg-gray-50 dark:bg-dark text-gray-600 dark:text-gray-400">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQSection;
