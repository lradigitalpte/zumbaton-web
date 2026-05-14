"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";

const HomeContact = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [formStatus, setFormStatus] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("success");
    setTimeout(() => setFormStatus(""), 3000);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#f6f4ee] dark:bg-black relative overflow-hidden"
    >
      {/* Enhanced Background Design - No Gradients */}
      
      {/* Solid Accent Circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/5 dark:bg-lime-500/5 rounded-full blur-3xl -z-10 -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lime-500/5 dark:bg-lime-500/5 rounded-full blur-3xl -z-10 translate-y-1/3 -translate-x-1/3"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-500/5 dark:bg-lime-500/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Medium Accent Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-lime-500/5 dark:bg-lime-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-lime-500/5 dark:bg-lime-500/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] -z-10" style={{
        backgroundImage: `
          linear-gradient(to right, currentColor 1px, transparent 1px),
          linear-gradient(to bottom, currentColor 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }}></div>
      
      {/* Radial Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-lime-100/10 dark:to-lime-900/5 -z-10" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(132, 204, 22, 0.05) 50%, transparent 100%)'
      }}></div>
      
      {/* Animated Floating Shapes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-20 w-32 h-32 bg-lime-400/5 dark:bg-lime-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-lime-400/5 dark:bg-lime-500/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-lime-500/5 dark:bg-lime-600/5 rounded-full blur-2xl"></div>
      </div>
      
      {/* Subtle Wave Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-lime-50/10 dark:bg-zinc-950/20 -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-lime-50/10 dark:bg-zinc-950/15 -z-10"></div>

      <div className="container px-3 sm:px-4 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400 rounded-none text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4 uppercase italic tracking-tighter">
            Start Your <span className="text-lime-500">Fitness Journey</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
            Questions about our structured aerobic routines or packages? We are here to help you select the right workout for your fitness level.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
          {/* Left Column - Contact Info & Response Time */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35, delay: 0.04 }}
          >
            {/* Contact Methods */}
            <div className="bg-white dark:bg-gray-800/50 rounded-none p-5 sm:p-6 md:p-7 shadow-lg dark:shadow-xl border border-gray-200 dark:border-white/20 backdrop-blur-sm relative overflow-hidden">
              <div className="relative z-10">              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-5 sm:mb-6">
                Contact Information
              </h3>

              <div className="space-y-4 sm:space-y-5">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-500 rounded-none flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">Call Us</h4>
                    <a href="tel:+6584927347" className="text-xs sm:text-sm text-lime-600 dark:text-lime-400 font-semibold hover:underline break-all">
                      +65 8492 7347
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-500 rounded-none flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">Email Us</h4>
                    <a href="mailto:hello@onestepfitness.sg" className="text-xs sm:text-sm text-lime-600 dark:text-lime-400 font-semibold hover:underline break-all">
                      hello@onestepfitness.sg
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-500 rounded-none flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">Business Hours</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mon - Sun: 8AM - 9PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Callout */}
            <div className="mt-6 sm:mt-8 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-none p-4 sm:p-5 border-l-4 border-l-lime-500">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-lime-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Fast Response</h4>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium">We respond within 24 hours</p>
                </div>
              </div>
            </div>
            </div>

          </motion.div>

          {/* Right Column - Newsletter Form */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-zinc-950 rounded-none p-6 sm:p-8 md:p-10 shadow-sm border border-gray-200 dark:border-zinc-800 relative overflow-hidden">
              <div className="relative z-10">
              <div className="mb-7 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3 uppercase italic tracking-tight">
                  Get Class Updates
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-medium">
                  Receive updates on new class times, structured routines, and fitness packages. Join our community for effective workouts designed for everyone.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      placeholder="John Doe"
                      required
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-200 dark:border-zinc-800 rounded-none bg-gray-50 dark:bg-black focus:border-lime-500 focus:ring-0 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-200 dark:border-zinc-800 rounded-none bg-gray-50 dark:bg-black focus:border-lime-500 focus:ring-0 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="contact-message"
                    placeholder="Tell us about your fitness goals..."
                    rows={4}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-200 dark:border-zinc-800 rounded-none bg-gray-50 dark:bg-black focus:border-lime-500 focus:ring-0 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 transition-all font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-lime-500 hover:bg-lime-400 text-black text-sm sm:text-base font-black rounded-none shadow-lg hover:shadow-lime-500/25 transition-all active:scale-95 duration-200 uppercase tracking-wider"
                >
                  Subscribe Now
                  <span className="ml-2">→</span>
                </button>
              </form>

              {/* Success Message */}
              {formStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800 rounded-none flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-lime-600 dark:text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-bold text-lime-800 dark:text-lime-300">Thank you! Check your email to confirm.</p>
                </motion.div>
              )}

              <p className="mt-5 sm:mt-6 text-xs text-gray-600 dark:text-white/60 text-center">
                By subscribing, you agree to our <Link href="/privacy" className="text-lime-600 dark:text-lime-400 hover:underline font-semibold">privacy policy</Link>. 
                We&apos;ll never share your information.
              </p>

              {/* Trust Elements */}
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-white/20">
                <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                  <div>
                    <div className="flex justify-center mb-2">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white/70 font-semibold">Inclusive Community</p>
                  </div>
                  <div>
                    <div className="flex justify-center mb-2">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white/70 font-semibold">Multiple Class Types</p>
                  </div>
                  <div>
                    <div className="flex justify-center mb-2">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white/70 font-semibold">Expert Instructors</p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>

        {/* Full Width CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-center"
        >
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-950 text-lime-600 dark:text-lime-400 text-sm sm:text-base font-black rounded-none hover:bg-gray-50 dark:hover:bg-black shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-zinc-800 uppercase tracking-wider"
          >
            Go to Full Contact Page
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeContact;
