"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";

const locations = [
  {
    city: "Singapore",
    address: "2 JALAN KLAPA, #2-A, SINGAPORE 199314",
    phone: "+65 8492 7347",
    email: "hello@onestepfitness.sg",
    hours: "Mon - Sun: 8AM - 9PM",
  }
];

const ContactLocations = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-white dark:bg-zinc-950 relative overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="text-lime-600 dark:text-lime-400 font-black text-sm md:text-base uppercase tracking-[0.3em] mb-6">
            Our Locations
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-8">
            VISIT OUR <br />
            <span className="text-lime-500 underline decoration-4 underline-offset-8">STUDIOS</span>
          </h2>
          <p className="max-w-2xl text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-medium uppercase tracking-tight">
            Find a One Step Fitness studio near you and start your fitness journey today.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          
          {/* Location Details - 5 Columns */}
          <div className="lg:col-span-5 space-y-4">
            {locations.map((location, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#f6f4ee] dark:bg-black p-8 md:p-12 border border-black/10 dark:border-white/10 relative group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 -skew-x-12 -z-10 group-hover:bg-lime-500/10 transition-colors"></div>
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 bg-black dark:bg-zinc-900 flex items-center justify-center text-lime-500">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white leading-none mb-1">{location.city}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">Main Studio</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-8 h-8 flex items-center justify-center text-zinc-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Address</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-black uppercase italic tracking-tighter text-gray-900 dark:text-white leading-relaxed hover:text-lime-500 transition-colors"
                      >
                        {location.address}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-8 h-8 flex items-center justify-center text-zinc-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Phone</p>
                      <a href="tel:+6584927347" className="text-base font-black uppercase italic tracking-tighter text-gray-900 dark:text-white hover:text-lime-500 transition-colors">
                        {location.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-8 h-8 flex items-center justify-center text-zinc-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email</p>
                      <a href={`mailto:${location.email}`} className="text-base font-black uppercase italic tracking-tighter text-gray-900 dark:text-white hover:text-lime-500 transition-colors">
                        {location.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-8 h-8 flex items-center justify-center text-zinc-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Hours</p>
                      <p className="text-base font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
                        {location.hours}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-black/5 dark:border-white/5">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    GET DIRECTIONS
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Map - 7 Columns */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 relative"
          >
            <div className="w-full h-full min-h-[500px] border border-black/10 dark:border-white/10 bg-[#f6f4ee] dark:bg-black p-4 md:p-8 shadow-2xl">
              <div className="w-full h-full relative grayscale hover:grayscale-0 transition-all duration-700">
                <iframe
                  src="https://www.google.com/maps?q=2+Jalan+Klapa+Singapore+199314&output=embed&zoom=17"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                  title="One Step Fitness Location"
                />
              </div>
            </div>
            
            {/* Map Accent */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-lime-500 -z-10 hidden md:block"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactLocations;
