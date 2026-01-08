"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const locations = [
  {
    city: "Singapore",
    address: "2 JALAN KLAPA, #2-A, SINGAPORE 199314",
    phone: "+65 8492 7347",
    email: "hello@zumbaton.sg",
    hours: "Mon - Sun: 9AM - 9PM",
    lat: 1.3521,
    lng: 103.8198
  }
];

const ContactLocations = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section ref={sectionRef} className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
            Our Locations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Visit Our Studios
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Find a Zumbaton studio near you and start your fitness journey today.
          </p>
        </motion.div>

        {/* Featured Location Card - Before Map */}
        {locations.map((location, index) => (
          <motion.div
            key={location.city}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative max-w-6xl mx-auto mb-12 overflow-hidden rounded-3xl shadow-2xl"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-lime-500 dark:from-green-700 dark:via-green-600 dark:to-lime-600"></div>
            
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Location Info */}
                <div className="text-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-2">{location.city}</h3>
                      <p className="text-white/90 text-sm font-medium">Zumbaton Studio</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-medium mb-1">Address</p>
                        <p className="text-white text-sm md:text-base font-semibold leading-relaxed break-words">{location.address}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-xs font-medium mb-1">Phone</p>
                          <a href={`tel:${location.phone.replace(/\D/g, '')}`} className="text-white text-sm font-semibold hover:text-lime-200 transition-colors break-words">
                            {location.phone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-xs font-medium mb-1">Email</p>
                          <a href={`mailto:${location.email}`} className="text-white text-sm font-semibold hover:text-lime-200 transition-colors break-all">
                            {location.email}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-xs font-medium mb-1">Operating Hours</p>
                        <p className="text-white text-sm font-semibold break-words">{location.hours}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Visual Element */}
                <div className="hidden md:block relative">
                  <div className="relative w-full aspect-square max-w-md mx-auto">
                    {/* Animated Background Circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/30 animate-pulse"></div>
                    </div>
                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/40">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl border border-gray-200 dark:border-white/20"
        >
          <div className="w-full h-96 sm:h-[500px] bg-gray-200 dark:bg-gray-800 relative">
            <iframe
              src="https://www.google.com/maps?q=2+Jalan+Klapa+Singapore+199314&output=embed&zoom=17"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
              title="Zumbaton Location - 2 JALAN KLAPA, #2-A, SINGAPORE 199314"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactLocations;
