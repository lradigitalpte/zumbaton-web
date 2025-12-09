"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const HomeContact = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-16 md:py-20 lg:py-28 bg-gray-50 dark:bg-dark"
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
              Get In Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your <span className="text-green-600">Fitness Journey?</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Have questions about our classes, memberships, or anything else? 
              We&apos;re here to help you every step of the way.
            </p>

            {/* Quick Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Call Us</h4>
                  <a href="tel:+1800555ZUMBA" className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                    +1 (800) 555-ZUMBA
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Email Us</h4>
                  <a href="mailto:hello@zumbaton.com" className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                    hello@zumbaton.com
                  </a>
                </div>
              </div>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          {/* Right - Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-dark-2 rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Join Our Newsletter
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get updates on new classes, special events, and exclusive offers.
            </p>

            <form className="space-y-4">
              <div>
                <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="newsletter-name"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark rounded-lg bg-gray-50 dark:bg-dark focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                />
              </div>
              <div>
                <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark rounded-lg bg-gray-50 dark:bg-dark focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Subscribe Now
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500 text-center">
              By subscribing, you agree to our privacy policy.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeContact;
