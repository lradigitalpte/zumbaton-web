"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const locations = [
  {
    city: "New York",
    address: "123 Fitness Ave, Manhattan, NY 10001",
    phone: "+1 (212) 555-0123",
    email: "newyork@zumbaton.com",
    hours: "Mon-Sat: 6AM-10PM, Sun: 8AM-6PM"
  },
  {
    city: "Los Angeles",
    address: "456 Dance Blvd, Downtown LA, CA 90012",
    phone: "+1 (310) 555-0456",
    email: "losangeles@zumbaton.com",
    hours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM"
  },
  {
    city: "Miami",
    address: "789 Rhythm Street, Miami Beach, FL 33139",
    phone: "+1 (305) 555-0789",
    email: "miami@zumbaton.com",
    hours: "Mon-Sun: 7AM-9PM"
  }
];

const ContactLocations = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section ref={sectionRef} className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
            Our Locations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Visit Our Studios
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Find a Zumbaton studio near you and start your fitness journey today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <motion.div
              key={location.city}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-dark-2 rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{location.city}</h3>
              </div>
              
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {location.address}
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${location.phone.replace(/\D/g, '')}`} className="hover:text-green-600 transition-colors">
                    {location.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${location.email}`} className="hover:text-green-600 transition-colors">
                    {location.email}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {location.hours}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactLocations;
